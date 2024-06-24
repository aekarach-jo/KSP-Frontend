/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */
/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import { Row, Col, Form, Card } from 'react-bootstrap';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';
import { toast } from 'react-toastify';
import NumberSpinner2 from 'components/number-spinner/NumberSpinner2';
import axios from 'axios';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import AddressDetailCard from './components/AddressDetailCard';
import './styles.scss';

const typeOption = [
  { value: '01', label: 'ผู้จัดจำหน่าย (supplier)' },
  { value: '02', label: 'ผู้ผลิต (manufacturer)' },
  { value: '03', label: 'ผู้จัดส่ง (distributor)' },
  { value: '04', label: 'ผู้บำรุงรักษา (maintenance)' },
  { value: '05', label: 'ค้าปลีก (retailers)' },
  { value: '06', label: 'ผู้ให้บริการ (service provider)' },
  { value: '07', label: 'ผู้รับเหมา (contractor)' },
  { value: '08', label: 'Dropshipper' },
  { value: '09', label: 'OEM' },
  { value: '10', label: 'Service Reseller' },
  { value: '11', label: 'ผู้นำเข้า (Importer)' },
  { value: '12', label: 'ผู้ส่งออก (Exporter)' },
];

const getDefaultValues = () => ({
  code: '',
  abbr: '',
  taxId: '',
  taxPayerName: '',
  name: '',
  nameEn: '',
  status: '',
  type: '',
  weightCondition: 0,
  priceCondition: 0,
});

const getSupplierFn = (supplierId) => () =>
  request({ url: `/masterData/supplier/${supplierId}` })
    .then((res) => res.data.data)
    .then((data) => {
      data.type = typeOption?.filter((item) => data.type.some((itemType) => item.value === itemType));
      return {
        ...getDefaultValues(),
        ...data,
      };
    });

const useSupplierData = (supplierId) =>
  useQuery(`editSupplierData`, getSupplierFn(supplierId), {
    enabled: !!supplierId,
    initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
    onError(err) {
      console.error('Error:', err);
    },
  });

const createSupplierFn = (supplier) => request({ url: `/masterData/supplier/add`, method: 'post', data: supplier }).then((res) => res.data);

const updateSupplierFn = ({ id, supplier }) => request({ url: `/masterData/supplier/${id}/edit`, method: 'post', data: supplier }).then((res) => res.data);

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'supplier.save.success' })}</span>
      </div>
    </>
  );
};

const SupplierDetail = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;
  const [isEditMode, setEditMode] = useState(!id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [errCode, setErrorCode] = useState('');
  const { push } = useHistory();

  const queryClient = useQueryClient();

  if (!id) {
    queryClient.resetQueries('editSupplierData');
  }

  const { data: initialValues, isFetching, error, refetch } = useSupplierData(id);

  if (error) {
    console.error('error :', error);
  }
  // console.debug('customer Data :', initialValues);

  const deleteSupplier = async (deleteID) => {
    setIsDeletingLoading(true);
    const resp = await axios({
      url: `/masterData/supplier/${deleteID}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./');
    // return responseTransformer(resp);
  };

  const { mutate: createSupplier } = useMutation(createSupplierFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('create supplier success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.error('create supplier error :', err);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editSupplierData');
    },
  });

  const { mutate: updateProduct } = useMutation(updateSupplierFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('update supplier success :', data);
      toast(<ToastCreateSuccess />);
      refetch();
      setErrorCode('');
    },
    onError(err) {
      console.error('update supplier error :', err);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editSupplierData');
    },
  });

  const { formatMessage: f } = useIntl();

  const title = id ? f({ id: `supplier.detail.title` }, { supplierName: initialValues?.name }) : f({ id: 'supplier.list.add' });
  const description = f(
    { id: `supplier.${!id ? 'add' : 'edit'}.subTitle` },
    {
      updatedBy: initialValues?.updatedBy,
      updatedAt: new Date(initialValues?.updatedAt || null),
    }
  );

  // Form stuff
  const detailValidationSchema = Yup.object().shape({
    address: Yup.string().required('customer.detail.validation.address.required'),
    phone: Yup.array().of(Yup.string().required('customer.detail.validation.phone.required')),
    fax: Yup.array().of(Yup.string().required('customer.detail.validation.fax.required')),
    isDefault: Yup.boolean().required('customer.detail.validation.isDefault.required'),
  });

  const validationSchema = Yup.object().shape({
    // code: Yup.string().required('supplier.detail.validation.code.required'),
    taxId: Yup.string().required('supplier.detail.validation.taxId.required'),
    taxPayerName: Yup.string().required('supplier.detail.validation.taxId.required'),
    name: Yup.string().required('supplier.detail.validation.name.required'),
    type: Yup.array().required('supplier.detail.validation.type.required'),
    // weightCondition: Yup.string().required('supplier.detail.validation.weightCondition.required'),
    // priceCondition: Yup.string().required('supplier.detail.validation.priceCondition.required'),
    // list: Yup.array().of(detailValidationSchema),
  });

  const onSubmit = (formData) => {
    const newFormData = {
      ...formData,
      type: formData.type.map((data) => data.value),
      headOfficeReference: formData.headOfficeReference?.value !== undefined ? formData.headOfficeReference?.value : formData?.headOfficeReference || '',
    };

    if (id) {
      // save
      updateProduct({ id, supplier: newFormData });
    } else {
      // create
      createSupplier(newFormData);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;
  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };

  const handleDeleteConfirm = () => {
    deleteSupplier(id);
  };

  const handleAddressSave =
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
    };

  const handleAddressDelete =
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
    };

  const handleChangeType = (v) => {
    handleChange({ target: { id: 'type', value: v } });
  };

  const handleSelectHeadOfficeReference = (v) => {
    handleChange({ target: { id: 'headOfficeReference', value: v } });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        isLoading={isFetching}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: handleCancelClick, isHide: !isEditMode || !id },
          edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: isEditMode },
          delete: { label: ' ', onDelete: handleDeleteClick, isHide: isEditMode },
          save: { label: f({ id: 'common.save' }), onSubmit: handleSubmit, isHide: !isEditMode || (!isEditMode && !id) },
        }}
      />
      <Col>
        <h2 className="small-title">{f({ id: 'supplier.detail.information' })}</h2>
        <Form onSubmit={handleSubmit}>
          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row>
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.code' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    readOnly={!isEditMode}
                    onChange={handleChange}
                    value={values.code || ''}
                    isInvalid={errors.code && touched.code}
                  />
                  {errCode !== '' ? (
                    <div className="d-block invalid-feedback">{errCode}</div>
                  ) : (
                    errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>
                  )}
                </Col>
                <Col lg="3" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'supplier.abbr' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="abbr"
                    max="13"
                    readOnly={!isEditMode}
                    onChange={handleChange}
                    value={values.abbr || ''}
                    isInvalid={errors.abbr && touched.abbr}
                  />
                </Col>
                <Col lg="3" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'supplier.taxId' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="taxId"
                    max="13"
                    readOnly={!isEditMode}
                    onChange={handleChange}
                    value={values.taxId || ''}
                    isInvalid={errors.taxId && touched.taxId}
                  />
                  {errors.taxId && touched.taxId && <div className="d-block invalid-feedback">{f({ id: errors.taxId })}</div>}
                </Col>
                <Col lg="3" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'supplier.taxPayerName' })}</Form.Label>
                  <Form.Control type="text" name="taxPayerName" onChange={handleChange} value={values.taxPayerName || ''} readOnly={!isEditMode} />
                  {errors.taxPayerName && touched.taxPayerName && <div className="d-block invalid-feedback">{f({ id: errors.taxPayerName })}</div>}
                </Col>
              </Row>
              <Row className="form-row">
                <Col sm="12" md="12" lg="3" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.field.mainSupplierId' })}</Form.Label>
                  <LovSupplierSelect onChange={handleSelectHeadOfficeReference} isClearable value={values.headOfficeReference || ''} isDisabled={!isEditMode} />
                  {errors.headOfficeReference && touched.headOfficeReference && (
                    <div className="d-block invalid-feedback">{f({ id: errors.headOfficeReference })}</div>
                  )}
                </Col>{' '}
                <Col lg="5" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'supplier.name' })}</Form.Label>
                  <Form.Control type="text" name="name" onChange={handleChange} value={values.name || ''} readOnly={!isEditMode} />
                  {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                </Col>
             
                <Col lg="4" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'supplier.nameEn' })}</Form.Label>
                  <Form.Control type="text" name="nameEn" onChange={handleChange} value={values.nameEn || ''} readOnly={!isEditMode} />
                  {errors.nameEn && touched.nameEn && <div className="d-block invalid-feedback">{f({ id: errors.nameEn })}</div>}
                </Col>
             
              </Row>
              <Row className="form-row">
                <Col sm="12" md="12" lg="12" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'supplier.type' })}</Form.Label>
                  <Select
                    classNamePrefix="react-select"
                    options={typeOption}
                    isDisabled={!isEditMode}
                    value={values.type || ''}
                    onChange={handleChangeType}
                    isMulti
                    required
                  />
                  {errors.type && touched.type && <div className="d-block invalid-feedback">{f({ id: errors.type })}</div>}
                </Col>
              </Row>
              <Row className="form-row">
                <Col sm="12" md="12" lg="3" className="form-col-mt">
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Form.Label className="col-form-label">
                      {f({ id: 'supplier.weightCondition' })} {f({ id: 'supplier.weightCondition-unit' })}
                    </Form.Label>
                    {/* <Form.Label className="col-form-label">{f({ id: 'supplier.weightCondition-unit' })}</Form.Label> */}
                  </div>
                  <NumberSpinner2
                    name="weightCondition"
                    min="0"
                    value={values.weightCondition}
                    onChange={(value) => handleChange({ target: { id: 'weightCondition', value } })}
                    disabled={!isEditMode}
                  />
                  {errors.weightCondition && touched.weightCondition && <div className="d-block invalid-feedback">{f({ id: errors.weightCondition })}</div>}
                </Col>
                <Col sm="12" md="12" lg="3" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.priceCondition' })}</Form.Label>
                  <NumberSpinner2
                    name="priceCondition"
                    min="0"
                    value={values.priceCondition}
                    onChange={(value) => handleChange({ target: { id: 'priceCondition', value } })}
                    disabled={!isEditMode}
                  />
                  {errors.priceCondition && touched.priceCondition && <div className="d-block invalid-feedback">{f({ id: errors.priceCondition })}</div>}
                </Col>
                <Col lg="3" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.createdAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="createdAt"
                    onChange={handleChange}
                    value={values.createdAt || ''}
                    isInvalid={errors.createdAt && touched.createdAt}
                    readOnly
                  />
                </Col>
                <Col lg="3" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.updatedAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="updatedAt"
                    onChange={handleChange}
                    value={values.updatedAt || ''}
                    isInvalid={errors.updatedAt && touched.updatedAt}
                    readOnly
                  />
                  {errors.updatedAt && touched.updatedAt && <div className="d-block invalid-feedback">{f({ id: errors.updatedAt })}</div>}
                </Col>
              </Row>
              <Row className="form-row">
                <Col lg="4" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.createdBy' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="createdBy"
                    onChange={handleChange}
                    value={values.createdBy || ''}
                    isInvalid={errors.createdBy && touched.createdBy}
                    readOnly
                  />
                </Col>
                <Col lg="4" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.updatedBy' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="updatedBy"
                    onChange={handleChange}
                    value={values.updatedBy || ''}
                    isInvalid={errors.updatedBy && touched.updatedBy}
                    readOnly
                  />
                </Col>
                <Col lg="4" md="12" sm="12" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.status' })}</Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status === 'active' ? 'supplier.status.active' : 'supplier.status.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    checked={values.status === 'active'}
                    onChange={(e) => handleChange({ target: { id: 'status', value: e.target.checked ? 'active' : 'inactive' } })}
                    disabled={!isEditMode}
                  />
                </Col>
              </Row>
              <Row className="row-cols-1 row-cols-lg-2 g-2 mb-3">
                <Col lg="12" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.address' })}</Form.Label>
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="list"
                      render={(arrayHelpers) => {
                        return [
                          values.list?.map((detail, index) => (
                            // eslint-disable-next-line no-underscore-dangle
                            <Col key={detail._id || index}>
                              <AddressDetailCard
                                formValues={detail}
                                onChange={handleAddressSave({ arrayHelpers, list: values.list, index, isReplace: true })}
                                onDelete={handleAddressDelete({ arrayHelpers, list: values.list, index })}
                                validationSchema={detailValidationSchema}
                                disabled={!isEditMode}
                              />
                            </Col>
                          )),
                          isEditMode && (
                            <Col key="list">
                              <AddressDetailCard
                                onChange={handleAddressSave({
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
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <ConfirmModal
            show={isDeleting}
            loading={isDeletingLoading}
            titleText={f({ id: 'common.warning' })}
            confirmText={f({ id: 'employee.delete.confirmation' })}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        </Form>
      </Col>
    </>
  );
};

export default SupplierDetail;
