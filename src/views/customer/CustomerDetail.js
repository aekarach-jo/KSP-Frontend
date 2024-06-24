import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { SERVICE_URL } from 'config';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavLink, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import CustomerBranchDetailCard from 'components/customer-branch-detail-card/CustomerBranchDetailCard';
import NumberFormat from 'react-number-format';
import AutocompleteCustomer from 'views/sales/customer-order-detail/components/AutocompleteCustomer';
import LovCustomerOrderSelect from 'components/lov-select/LovCustomerOrderSelect';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import useCustomerDataHook from 'hooks/api/customer/useCustomerData';
import { loopHooks } from 'react-table';

const getDefaultValues = () => ({
  code: '',
  name: '',
  abbr: '',
  detail: '',
  list: [],
  completeStatus: false,
  customerStatus: false,
  creditTerm: 0,
  taxId: '',
  mainCustomerId: null,
});

const getCustomerFn = (customerId) => () =>
  request({ url: `${SERVICE_URL}/customer/${customerId}` })
    .then((res) => res.data.data)
    .then((data) => ({
      ...getDefaultValues(),
      ...data,
    }));

const useCustomerData = (customerId) =>
  useQuery(['editCustomerData', customerId], getCustomerFn(customerId), {
    enabled: !!customerId,
    // initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
    onError(err) {
      console.error('Error:', err);
    },
  });

const createCustomerFn = (customer) => request({ method: 'post', url: `${SERVICE_URL}/customer/add`, data: customer }).then((res) => res.data);

const updateCustomerFn = ({ id, customer }) =>
  request({
    method: 'post',
    url: `${SERVICE_URL}/customer/${id}/edit`,
    data: customer,
    headers: {
      'content-type': 'application/json',
    },
  }).then((res) => res.data);

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'customer.save.success' })}</span>
      </div>
    </>
  );
};

const ToastUpdateError = ({ error }) => {
  const { formatMessage: f } = useIntl();

  return (
    <div className="mb-2">
      <CsLineIcons icon="error-hexagon" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
      <div>
        <span className="align-middle text-primary heading font-heading">{f({ id: 'customer.save.fail' })}</span>
      </div>
      {!!error && <span className="align-middle text-primary heading font-heading">{error}</span>}
    </div>
  );
};

const detailValidationSchema = Yup.object().shape({
  contacts: Yup.array()
    .min(1, 'customer.detail.validation.contactname.atLeastOne')
    .required('customer.detail.validation.contactName.required')
    .of(
      Yup.object().shape({
        name: Yup.string().required('customer.detail.validation.contactName.required'),
        // department: Yup.string(),
        email: Yup.string().trim().email('customer.detail.validation.email.invalid').required('customer.detail.validation.email.required'),
        phone: Yup.string()
          .min(9, 'customer.detail.validation.phone.length-min')
          .max(10, 'customer.detail.validation.phone.length-max')
          .required('customer.detail.validation.phone.required'),
      })
    ),

  address: Yup.string().trim().required('customer.detail.validation.address.required'),
  fax: Yup.array().of(
    Yup.string()
      .min(9, 'customer.detail.validation.fax.length-min')
      .max(10, 'customer.detail.validation.fax.length-max')
      .required('customer.detail.validation.fax.required')
  ),
  note: Yup.string().trim(),
  isDefault: Yup.boolean().required('customer.detail.validation.isDefault.required'),
});

const validationSchema = Yup.object().shape({
  // code: Yup.string().required('customer.detail.validation.code.required'),
  name: Yup.string().trim().required('customer.detail.validation.name.required'),
  detail: Yup.string(),
  list: Yup.array().of(detailValidationSchema),
  completeStatus: Yup.bool().default(false).required('customer.detail.validation.completeStatus.required'),
  customerStatus: Yup.bool().default(false).required('customer.detail.validation.customerStatus.required'),
  taxId: Yup.string().length(13, 'customer.detail.validation.tax-id.length').required('customer.detail.validation.tax-id.required'),
  creditTerm: Yup.number(),
  mainCustomerId: Yup.string().nullable(),
});

const CustomerAdd = (props) => {
  // console.debug('customer add props :', props);
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;

  const [isEditMode, setEditMode] = useState(!id);
  const [isConfirmDeleteShow, setConfirmDeleteShow] = useState(false);
  const [mainCustomerName, setMainCustomerName] = useState('');
  const [errCode, setErrorCode] = useState('');
  const [codeCheck, setCodeCheck] = useState('');
  const { push } = useHistory();

  const queryClient = useQueryClient();

  if (!id) {
    queryClient.resetQueries(['editCustomerData', 'new']);
  }

  const { data: initialValues = getDefaultValues(), isLoading, isFetching, error } = useCustomerData(id);

  if (error) {
    console.error('error :', error);
  }
  // console.debug('customer Data :', initialValues);

  const { data: mainCustomerData, isFetching: isMainCustFetching } = useCustomerData(initialValues.mainCustomerId);

  const { useDeleteCustomerMutation } = useCustomerDataHook();
  const { mutateAsync: deleteCustomerAsync, isLoading: isDeletingLoading } = useDeleteCustomerMutation();

  // Load main customer name
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    const _mainCustomerName = mainCustomerData?.name;
    // console.debug(' Load main customer name :', _mainCustomerName);

    setMainCustomerName(_mainCustomerName);
  }, [mainCustomerData?.name]);

  const { mutate: createCustomer, isLoading: isAdding } = useMutation(createCustomerFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('create customer success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.error('create company error :', err);
      const message = `This code (${codeCheck}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries(['editCustomerData', id]);
    },
  });

  const { mutate: updateCustomer, isLoading: isSaving } = useMutation(updateCustomerFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('update customer success :', data);
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      console.error('create company error :', err);
      const message = `This code (${codeCheck}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries(['editCustomerData', id]);
    },
  });

  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = useMemo(() => f({ id: `customer.${!id ? 'add' : 'edit'}.title` }, { customerName: initialValues?.name }), [f, id, initialValues?.name]);
  const description = useMemo(
    () =>
      f(
        { id: `customer.${!id ? 'add' : 'edit'}.subTitle` },
        {
          updatedBy: initialValues?.updatedBy,
          updatedAt: new Date(initialValues?.updatedAt || null),
        }
      ),
    [f, id, initialValues?.updatedAt, initialValues?.updatedBy]
  );

  // Form stuff

  const onSubmit = useCallback(
    (formData) => {
      if (id) {
        // save
        updateCustomer({ id, customer: formData });
      } else {
        // create
        createCustomer(formData);
      }
      console.log('submit form', formData);
    },
    [createCustomer, id, updateCustomer]
  );

  const formik = useFormik({ initialValues, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, setFieldValue, resetForm, values, touched, errors } = formik;

  const handleEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    setEditMode(false);
    resetForm();
  }, [resetForm]);

  const handleCustomerBranchSave = useCallback(
    ({ arrayHelpers, list, index, isReplace }) =>
      (v) => {
        if (isReplace) {
          arrayHelpers.replace(index, v);
        } else {
          arrayHelpers.push(v);
        }

        // update isDefault
        if (v.isDefault) {
          list.forEach((item, idx) => {
            if (idx !== index) {
              item.isDefault = false;
              arrayHelpers.replace(idx, item);
            }
          });
        }
      },
    []
  );

  const handleCustomerBranchDelete = useCallback(
    ({ arrayHelpers, list, index }) =>
      (item) => {
        if (item.isDefault) {
          // Find new default and set flag before remove.
          const newDefaultIdx = list.findIndex((i, idx) => idx !== index && !i.isDefault);
          if (newDefaultIdx >= 0) {
            arrayHelpers.replace(newDefaultIdx, { ...list[newDefaultIdx], isDefault: true });
          }
        }
        arrayHelpers.remove(index);
      },
    []
  );

  const handleDeleteClick = useCallback(() => setConfirmDeleteShow(true), []);

  const handleDeleteConfirm = useCallback(async () => {
    await deleteCustomerAsync({ id });

    toast(
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'customer.delete.success' })}</span>
      </div>
    );
    push('./');
  }, [deleteCustomerAsync, f, id, push]);

  const handleDeleteCancel = useCallback(() => setConfirmDeleteShow(false), []);

  const handleMainCustomerIdChange = useCallback((value) => setFieldValue('mainCustomerId', value?.value || null), [setFieldValue]);

  const handleChangeCode = (value) => {
    const c = value;
    handleChange({ target: { id: 'code', value: c } });
    setCodeCheck(value);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        {/* Title Start */}
        <div className="page-title-container mb-3">
          <Row>
            <Col xs="auto" className="mb-2 align-self-md-center">
              <NavLink to="/master/customer" className="btn-link btn-icon-start w-100 w-md-auto">
                <CsLineIcons icon="arrow-left" /> {/* <span>{f({ id: 'common.back' })}</span> */}
              </NavLink>
            </Col>
            <Col className="mb-2">
              <h1 className="mb-2 pb-0 display-4">{title}</h1>
              <div className="text-muted font-heading description">{description}</div>
            </Col>
            <Col xs="12" sm="auto" className="align-self-md-center">
              {!isEditMode && (
                <>
                  <Button
                    className={classNames('btn-icon', { 'overlay-spinner': isFetching })}
                    variant="primary"
                    onClick={handleEditClick}
                    disabled={isFetching}
                  >
                    <CsLineIcons icon="edit" /> {f({ id: 'common.edit' })}
                  </Button>{' '}
                  <Button className="btn-icon" variant="outline-danger" onClick={handleDeleteClick}>
                    <CsLineIcons icon="bin" />
                  </Button>
                </>
              )}
              {(!id || isEditMode) && (
                <>
                  {!!id && (
                    <Button className="btn-icon" variant="outline-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      <CsLineIcons icon="close" /> {f({ id: 'common.cancel' })}
                    </Button>
                  )}{' '}
                  <Button className="btn-icon" variant="primary" onClick={handleSubmit} disabled={isAdding || isSaving}>
                    <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </div>
        {/* Title End */}

        {/* Customer detail Start */}
        <h2 className="small-title">{f({ id: 'customer.add.section.detail.title' })}</h2>
        <Form onSubmit={handleSubmit}>
          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isLoading,
            })}
          >
            <Card.Body>
              <Row className="mb-02">
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'customer.field.code' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    onChange={(e) => handleChangeCode(e.target.value)}
                    value={values.code}
                    isInvalid={errors.code && touched.code}
                    readOnly={!isEditMode}
                    autoComplete="off"
                    // disabled={values.id}
                  />
                  {errCode !== '' ? (
                    <div className="d-block invalid-feedback">{errCode}</div>
                  ) : (
                    errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>
                  )}
                </Col>
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label required">{f({ id: 'customer.field.tax-id' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="taxId"
                    onChange={handleChange}
                    value={values.taxId || ''}
                    isInvalid={errors.taxId && touched.taxId}
                    autoComplete="off"
                    readOnly={!isEditMode}
                    maxLength={13}
                    required
                  />
                  {errors.taxId && touched.taxId && <div className="d-block invalid-feedback">{f({ id: errors.taxId })}</div>}
                </Col>
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'customer.field.abbr' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="abbr"
                    onChange={handleChange}
                    value={values.abbr}
                    readOnly={!isEditMode}
                    autoComplete="off"
                    // disabled={values.id}
                  />
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label">{f({ id: 'customer.field.mainCustomerId' })}</Form.Label>
                  <LovCustomerOrderSelect isClearable value={values.mainCustomerId || ''} isDisabled={!isEditMode} onChange={handleMainCustomerIdChange} />
                  {errors.mainCustomerId && touched.mainCustomerId && <div className="d-block invalid-feedback">{f({ id: errors.mainCustomerId })}</div>}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col lg="6" md="6" sm="6">
                  <Form.Label className="col-form-label required">{f({ id: 'customer.field.name' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={values.name || ''}
                    isInvalid={errors.name && touched.name}
                    readOnly={!isEditMode}
                    autoComplete="off"
                  />
                  {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                </Col>
                <Col lg="6" md="6" sm="6">
                  <Form.Label className="col-form-label">{f({ id: 'customer.field.nameEn' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="nameEn"
                    onChange={handleChange}
                    value={values.nameEn || ''}
                    isInvalid={errors.nameEn && touched.nameEn}
                    readOnly={!isEditMode}
                    autoComplete="off"
                  />
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">
                    {f({ id: 'customer.field.creditTerm' })} ({f({ id: 'common.date.day' })})
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="creditTerm"
                    min={0}
                    value={values.creditTerm || ''}
                    onChange={handleChange}
                    readOnly={!isEditMode}
                    isInvalid={errors.creditTerm && touched.creditTerm}
                    autoComplete="off"
                  />
                  {errors.creditTerm && touched.creditTerm && <div className="d-block invalid-feedback">{f({ id: errors.creditTerm })}</div>}
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label" htmlFor="completeStatus">
                    {f({ id: 'customer.field.complete-status' })}
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.completeStatus ? 'customer.complete-status.completed' : 'customer.complete-status.incompleted' })}
                    className="mt-2"
                    id="completeStatus"
                    name="completeStatus"
                    checked={values.completeStatus}
                    onChange={handleChange}
                    isInvalid={errors.completeStatus && touched.completeStatus}
                    disabled={!isEditMode || initialValues.completeStatus}
                  />
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label" htmlFor="customerStatus">
                    {f({ id: 'customer.field.customer-status' })}
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.customerStatus ? 'customer.customer-status.active' : 'customer.customer-status.inactive' })}
                    className="mt-2"
                    id="customerStatus"
                    name="customerStatus"
                    checked={values.customerStatus && values.completeStatus}
                    onChange={handleChange}
                    isInvalid={errors.customerStatus && touched.customerStatus}
                    disabled={!isEditMode || !values.completeStatus}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="row-cols-1 g-2 mb-3">
            <FormikProvider value={formik}>
              <FieldArray
                name="list"
                render={(arrayHelpers) => {
                  return [
                    values.list?.map((detail, index) => (
                      // eslint-disable-next-line no-underscore-dangle
                      <Col key={detail._id || index}>
                        <CustomerBranchDetailCard
                          formValues={detail}
                          onChange={handleCustomerBranchSave({ arrayHelpers, list: values.list, index, isReplace: true })}
                          onDelete={handleCustomerBranchDelete({ arrayHelpers, list: values.list, index })}
                          validationSchema={detailValidationSchema}
                          disabled={!isEditMode}
                        />
                      </Col>
                    )),
                    isEditMode && (
                      <Col key="cusBranchAdd">
                        <CustomerBranchDetailCard
                          onChange={handleCustomerBranchSave({
                            arrayHelpers,
                            list: values.list,
                          })}
                          validationSchema={detailValidationSchema}
                        />
                      </Col>
                    ),
                  ];
                }}
              />
            </FormikProvider>
          </Row>

          <Card
            className={classNames('mb-5', {
              'overlay-spinner': isLoading,
            })}
          >
            <Card.Body>
              <Row className="mb-3">
                <Col sm="8" md="9" lg="12">
                  <Form.Label className="col-form-label">{f({ id: 'customer.field.detail' })}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="detail"
                    onChange={handleChange}
                    value={values.detail}
                    isInvalid={errors.detail && touched.detail}
                    readOnly={!isEditMode}
                  />
                  {errors.detail && touched.detail && <div className="d-block invalid-feedback">{f({ id: errors.detail })}</div>}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm="12" md="12" lg="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="createdAt">
                    <Form.Label>{f({ id: 'purchaseOrder.field.createdAt' })}</Form.Label>
                    <Form.Control
                      type="text"
                      readOnly
                      value={
                        values.createdAt === ''
                          ? ''
                          : fd(values.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                              .replace('/', '-')
                              .replace('/', '-') || ''
                      }
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="createdBy">
                    <Form.Label>{f({ id: 'purchaseOrder.field.createdBy' })}</Form.Label>
                    <Form.Control type="text" readOnly value={values.createdBy || ''} />
                  </Form.Group>
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.updatedAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="updatedAt"
                    onChange={handleChange}
                    value={
                      values.updatedAt === ''
                        ? ''
                        : fd(values.updatedAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                            .replace('/', '-')
                            .replace('/', '-') || ''
                    }
                    isInvalid={errors.updatedAt && touched.updatedAt}
                    readOnly
                  />
                  {errors.updatedAt && touched.updatedAt && <div className="d-block invalid-feedback">{f({ id: errors.updatedAt })}</div>}
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.updatedBy' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="updatedBy"
                    onChange={handleChange}
                    value={values.updatedBy || ''}
                    isInvalid={errors.updatedBy && touched.updatedBy}
                    readOnly
                  />
                  {errors.updatedBy && touched.updatedBy && <div className="d-block invalid-feedback">{f({ id: errors.updatedBy })}</div>}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Form>

        <ConfirmModal
          show={isConfirmDeleteShow}
          loading={isDeletingLoading}
          titleText={f({ id: 'common.warning' })}
          confirmText={f({ id: 'common.delete.confirm' })}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
        {/* Customer detail End */}
      </Col>
    </>
  );
};

export default CustomerAdd;
