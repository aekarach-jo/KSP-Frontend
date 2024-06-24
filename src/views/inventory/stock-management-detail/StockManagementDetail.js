import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Form, Card, Toast, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import _ from 'lodash';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';

import { API, QUERY } from './constants';

import LovCompanySelect from './components/LovCompanySelect';

const getDefaultValues = () => ({
  companyId: '',
  storeCode: '',
  storeName: '',
  levelCode: '',
  levelName: '',
  zoneCode: '',
  zoneName: '',
  aisleCode: '',
  aisleName: '',
  shelfCode: '',
  shelfName: '',
  rackCode: '',
  rackName: '',
  shelfLevelCode: '',
  shelfLevelName: '',
  binCode: '',
  binName: '',
  isSale: false,
  status: false,
});

const getStoreLocation = (storeId) => () =>
  request({ url: `${API.FIND}/${storeId}` })
    .then((res) => res.data.data)
    .then((data) => ({
      ...getDefaultValues(),
      ...data,
    }));

const useStoreLocationData = (storeId) =>
  useQuery(QUERY.STOCK_MANAGEMENT_DETAIL, getStoreLocation(storeId), {
    enabled: !!storeId,
    initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
    onError(err) {
      console.error('Error:', err);
    },
  });

const callAddStoreLocation = (store) => request({ url: API.ADD, method: 'post', data: store }).then((res) => res.data);

const callUpdateStoreLocation = ({ id, store }) => request({ url: API.EDIT.replace(':id', id), method: 'post', data: store }).then((res) => res.data);

const callDeleteStoreLocation = (id) => request({ url: API.DELETE.replace(':id', id), method: 'post' }).then((res) => res.data);

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'common.save.success' })}</span>
      </div>
    </>
  );
};

const ToastDeleteSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'common.delete.success' })}</span>
      </div>
    </>
  );
};

const StockManagementDetail = (props) => {
  // console.debug('customer add props :', props);
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;

  const [isEditMode, setEditMode] = useState(!id);

  const { push } = useHistory();
  const [errCode, setErrorCode] = useState('');
  const queryClient = useQueryClient();

  const { data: initialValues, isFetching, error } = useStoreLocationData(id);

  if (error) {
    console.error('error :', error);
  }
  // console.debug('customer Data :', initialValues);

  const { mutate: addStoreLocation } = useMutation(callAddStoreLocation, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('create store location success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.log(err);
      console.error('create store location error :', err);
      const message = `This code already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries(QUERY.STOCK_MANAGEMENT_DETAIL);
    },
  });

  const { mutate: updateStoreLocation } = useMutation(callUpdateStoreLocation, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('update store location success :', data);
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.log(err);
      console.error('create store location error :', err);
      const message = `This code already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries(QUERY.STOCK_MANAGEMENT_DETAIL);
    },
  });

  const { mutate: deleteStoreLocation } = useMutation(callDeleteStoreLocation, {
    onSuccess() {
      setEditMode(false);
      push('./');
      toast(<ToastDeleteSuccess />);
    },
    onError(err) {
      console.error('delete store location error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries(QUERY.STOCK_MANAGEMENT_DETAIL);
    },
  });

  const { formatMessage: f } = useIntl();

  const validationSchema = Yup.object().shape({
    companyId: Yup.string().required(),
    // storeCode: Yup.string().required(),
    storeName: Yup.string().required(),
    levelName: Yup.string().when('levelCode', {
      is: (value) => value,
      then: Yup.string().required(),
    }),
    zoneName: Yup.string().when('zoneCode', {
      is: (value) => value,
      then: Yup.string().required(),
    }),
    aisleName: Yup.string().when('aisleCode', {
      is: (value) => value,
      then: Yup.string().required(),
    }),
    shelfName: Yup.string().when('shelfCode', {
      is: (value) => value,
      then: Yup.string().required(),
    }),
    rackName: Yup.string().when('rackCode', {
      is: (value) => value,
      then: Yup.string().required(),
    }),
    // shelfLevelCode: Yup.string().required(),
    // shelfLevelName: Yup.string().required(),
    // binCode: Yup.string().required(),
    // binName: Yup.string().required(),
  });

  const onSubmit = (formData) => {
    console.log(formData);
    const newFormData = {
      ...formData,
    };
    if (id) {
      updateStoreLocation({ id, store: newFormData });
    } else {
      // create
      addStoreLocation(newFormData);
    }
    console.log('submit form', newFormData);
  };

  let init = '';
  if (id === undefined) {
    // eslint-disable-next-line no-undef
    init = getDefaultValues();
  } else {
    // eslint-disable-next-line no-undef
    init = initialValues;
  }

  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  const title = id
    ? f({ id: `stockManagement.detail.title` }, { stockName: values?.isSupplier ? values?.storeName : initialValues?.name })
    : f({ id: 'stockManagement.detail.title.add' });
  const description = f(
    { id: `stockManagement.detail.${!id ? 'add' : 'edit'}.subTitle` },
    {
      updatedBy: initialValues?.updatedBy,
      updatedAt: new Date(initialValues?.updatedAt || null),
    }
  );

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const handleDelete = () => {
    toast(
      <Toast.Body>
        {f({ id: 'common.delete.confirm' })}
        <div className="mt-2 pt-2 text-center">
          <Button variant="danger" onClick={() => deleteStoreLocation(id)}>
            {f({ id: 'common.delete' })}
          </Button>{' '}
          <Button variant="outline-alternate">{f({ id: 'common.cancel' })}</Button>
        </div>
      </Toast.Body>,
      {
        position: 'top-center',
      }
    );
  };

  const setQueryData = (key, value) => {
    queryClient.setQueryData(QUERY.STOCK_MANAGEMENT_DETAIL, (currentData) => {
      return {
        ...currentData,
        [key]: value,
      };
    });
  };

  const handleOnChange = (e) => {
    let { value } = e.target;
    if (e.target.type === 'checkbox') {
      value = !!e.target.checked;
    }

    if (_.isEmpty(errors)) {
      setQueryData(e.target.id, value);
    } else {
      handleChange(e);
    }
  };

  useEffect(() => {
    queryClient.resetQueries(QUERY.STOCK_MANAGEMENT_DETAIL);
  }, [queryClient]);

  console.log(values);

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
          edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: isEditMode || values?.isSupplier },
          save: { label: f({ id: 'common.save' }), onSubmit: handleSubmit, isHide: !isEditMode || (!isEditMode && !id) },
          delete: { label: f({ id: 'common.delete' }), onDelete: handleDelete, isHide: !isEditMode || !id },
        }}
      />
      <Col>
        <h2 className="small-title">{f({ id: 'stockManagement.detail.information' })}</h2>
        <Form onSubmit={handleSubmit}>
          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label>{f({ id: 'stockManagement.stockNo' })}</Form.Label>
                    <Form.Control readOnly type="text" value={values.code || ''} isInvalid={!!errors.code} />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.stockNo.required' })}</Form.Control.Feedback>
                    {errCode !== '' && <div className="d-block invalid-feedback">{errCode}</div>}
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="companyName">
                    <Form.Label>{f({ id: 'stockManagement.companyName' })}</Form.Label>
                    {/* <AutocompleteSupplier
                      value={values.companyId}
                      initialValue={values.companyId}
                      onSelect={(selectedValue) => handleOnChange({ target: { id: 'companyId', value: selectedValue?.id } })}
                      inputProps={{ required: true, isInvalid: !!errors.companyId, readOnly: !isEditMode }}
                    /> */}
                    <LovCompanySelect
                      name="company"
                      isClearable
                      value={values.companyId}
                      onChange={(selectedValue) => handleOnChange({ target: { id: 'companyId', value: selectedValue?.value } })}
                      isDisabled={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.companyId ? 'block' : 'none' }}>
                      {f({ id: 'stockManagement.companyName.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="12">
                  <Form.Group className="position-relative tooltip-end-top" controlId="name">
                    <Form.Label>{f({ id: 'stockManagement.stockName' })}</Form.Label>
                    <Form.Control
                      readOnly
                      type="text"
                      value={values?.isSupplier ? values?.storeName : values.name || values.storeName || ''}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.stockName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="storeCode">
                    <Form.Label>{f({ id: 'stockManagement.storeCode' })}</Form.Label>
                    <Form.Control
                      name="storeCode"
                      type="text"
                      value={values.storeCode || ''}
                      isInvalid={!!errors.storeCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.storeCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="storeName">
                    <Form.Label>{f({ id: 'stockManagement.storeName' })}</Form.Label>
                    <Form.Control
                      name="storeName"
                      type="text"
                      value={values.storeName || ''}
                      isInvalid={!!errors.storeName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.storeName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="levelCode">
                    <Form.Label>{f({ id: 'stockManagement.levelCode' })}</Form.Label>
                    <Form.Control
                      name="levelCode"
                      type="text"
                      value={values.levelCode || ''}
                      isInvalid={!!errors.levelCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.levelCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="levelName">
                    <Form.Label>{f({ id: 'stockManagement.levelName' })}</Form.Label>
                    <Form.Control
                      name="levelName"
                      type="text"
                      value={values.levelName || ''}
                      isInvalid={!!errors.levelName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.levelName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="zoneCode">
                    <Form.Label>{f({ id: 'stockManagement.zoneCode' })}</Form.Label>
                    <Form.Control
                      name="zoneCode"
                      type="text"
                      value={values.zoneCode || ''}
                      isInvalid={!!errors.zoneCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.zoneCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="zoneName">
                    <Form.Label>{f({ id: 'stockManagement.zoneName' })}</Form.Label>
                    <Form.Control
                      name="zoneName"
                      type="text"
                      value={values.zoneName || ''}
                      isInvalid={!!errors.zoneName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.zoneName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="aisleCode">
                    <Form.Label>{f({ id: 'stockManagement.aisleCode' })}</Form.Label>
                    <Form.Control
                      name="aisleCode"
                      type="text"
                      value={values.aisleCode || ''}
                      isInvalid={!!errors.aisleCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.aisleCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="aisleName">
                    <Form.Label>{f({ id: 'stockManagement.aisleName' })}</Form.Label>
                    <Form.Control
                      name="aisleName"
                      type="text"
                      value={values.aisleName || ''}
                      isInvalid={!!errors.aisleName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.aisleName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="shelfCode">
                    <Form.Label>{f({ id: 'stockManagement.shelfCode' })}</Form.Label>
                    <Form.Control
                      name="shelfCode"
                      type="text"
                      value={values.shelfCode || ''}
                      isInvalid={!!errors.shelfCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.shelfCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="shelfName">
                    <Form.Label>{f({ id: 'stockManagement.shelfName' })}</Form.Label>
                    <Form.Control
                      name="shelfName"
                      type="text"
                      value={values.shelfName || ''}
                      isInvalid={!!errors.shelfName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.shelfName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="rackCode">
                    <Form.Label>{f({ id: 'stockManagement.rackCode' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="rackCode"
                      value={values.rackCode || ''}
                      isInvalid={!!errors.rackCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.rackCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="rackName">
                    <Form.Label>{f({ id: 'stockManagement.rackName' })}</Form.Label>
                    <Form.Control
                      name="rackName"
                      type="text"
                      value={values.rackName || ''}
                      isInvalid={!!errors.rackName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.rackName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="shelfLevelCode">
                    <Form.Label>{f({ id: 'stockManagement.shelfLevelCode' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="shelfLevelCode"
                      value={values.shelfLevelCode || ''}
                      isInvalid={!!errors.shelfLevelCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.shelfLevelCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="shelfLevelName">
                    <Form.Label>{f({ id: 'stockManagement.shelfLevelName' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="shelfLevelName"
                      value={values.shelfLevelName || ''}
                      isInvalid={!!errors.shelfLevelName}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.shelfLevelName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="binCode">
                    <Form.Label>{f({ id: 'stockManagement.binCode' })}</Form.Label>
                    <Form.Control
                      name="binCode"
                      type="text"
                      value={values.binCode || ''}
                      isInvalid={!!errors.binCode}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                    />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.binCode.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="binName">
                    <Form.Label>{f({ id: 'stockManagement.binName' })}</Form.Label>
                    <Form.Control name="binName" type="text" value={values.binName || ''} isInvalid={!!errors.binName} onChange={handleChange} readOnly={!isEditMode} />
                    <Form.Control.Feedback type="invalid">{f({ id: 'stockManagement.binName.required' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Label className="col-form-label">{f({ id: 'stockManagement.status' })}</Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status ? 'common.active' : 'common.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    checked={values.status}
                    onChange={handleOnChange}
                    isInvalid={errors.status && touched.status}
                    disabled={!isEditMode}
                  />
                </Col>
                <Col md="6">
                  <Form.Label className="col-form-label">{f({ id: 'stockManagement.isSale' })}</Form.Label>
                  <Form.Check type="switch" className="mt-2" id="isSale" name="isSale" checked={values.isSale} onChange={handleOnChange} disabled={id} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Form>
      </Col>
    </>
  );
};

export default StockManagementDetail;
