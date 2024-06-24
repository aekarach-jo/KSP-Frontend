import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Form, Card, Button, InputGroup } from 'react-bootstrap';
import { Field, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

import HtmlHead from 'components/html-head/HtmlHead';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavLink, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import AsyncSelect from 'react-select/async';
import LovSelect from 'components/lov-select/LovSelect';
import StoreLocationSelect from 'components/async-select/StoreLocationSelect';
import MasterProductSelect from 'components/async-select/MasterProductSelect';
import SupplierSelect from 'components/async-select/SupplierSelect';
import CustomerSelect from 'components/async-select/CustomerSelect';
import NumberSpinner2 from 'components/number-spinner/NumberSpinner2';
import CustomField from './components/CustomField';
import ReferenceListBrowser from './components/ReferenceListBrowser';
import MaterialGroupBrowser from './components/MaterialGroupBrowser';
import UnitConverter from './components/UnitConverter';
import ColorManagement from './components/ColorManagement';

const NEW_RM_DATA = 'NewRmData';
const EDIT_RM_DATA = 'RmData';
const getDefaultValues = {
  code: '',
  name: '',
  nameEn: '',
  type: '',
  generic: '',
  description: '',
  price: 0,
  reference: '',
  stockRef: '',
  stockLocation: '',

  grossWeight: 0,
  netWeight: 0,
  grossVolume: 0,
  netVolume: 0,
  thickness: '',

  baseUOM: '',
  group: '',
  // actGroup: '',
  subtype: '03',

  storeConversion: 1,
  storeUnit: '',

  width: 0,
  height: 0,
  length: 0,
  isSaveAs: false,
  completeStatus: false,
  status: false,
  storeLocationList: '',
  referenceList: [],
  supplierList: '',
  customerList: '',
  barcode: '',

  field1: {
    isEnable: false,
    name: 'รหัส KSP',
    value: '',
  },
  field2: {
    isEnable: false,
    name: 'รหัสสี',
    value: '',
  },
  field3: {
    isEnable: false,
    name: 'กลุ่มงาน',
    value: '',
  },
};

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'rm.save.success' })}</span>
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
        <span className="align-middle text-primary heading font-heading">{f({ id: 'rm.save.fail' })}</span>
      </div>
      {!!error && <span className="align-middle text-primary heading font-heading">{error}</span>}
    </div>
  );
};

const keyValueSchema = Yup.object().shape({
  isEnable: Yup.bool(),
  name: Yup.string().when('isEnable', { is: true, then: Yup.string().required() }),
  value: Yup.mixed(),
});

const validationSchema = Yup.object().shape({
  // code: Yup.string().required('rm.detail.validation.code.required'),
  name: Yup.string().required('rm.detail.validation.name.required'),
  nameEn: Yup.string().required('rm.detail.validation.nameEn.required'),
  generic: Yup.string(),
  description: Yup.string(),
  price: Yup.number().required(),
  stockRef: Yup.string(),
  stockLocation: Yup.string(),
  // supplierList: Yup.string().when('type', {
  //   is: (type) => type === 'RM' || type === 'RMU' || type === undefined,
  //   then: Yup.string().nullable().required('rm.detail.validation.supplierList.required'),
  // }),
  // storeLocationList: Yup.string().when('type', {
  //   is: (type) => type === 'RM' || type === 'RMU' || type === undefined,
  //   then: Yup.string().nullable().required('rm.detail.validation.storeLocationList.required'),
  // }),
  // customerList: Yup.string().when('type', {
  //   is: (type) => type === 'RM' || type === 'RMU' || type === undefined,
  //   then: Yup.string().nullable().required('rm.detail.validation.customerList.required'),
  // }),
  type: Yup.string().required('rm.detail.validation.type.required'),
  baseUOM: Yup.string().when('type', {
    is: (type) => type === 'RM' || type === 'RMU' || type === undefined,
    then: Yup.string().required('rm.detail.validation.baseUOM.required'),
  }),
  group: Yup.string().when('type', {
    is: (type) => type === 'RM' || type === 'RMU' || type === undefined,
    then: Yup.string().required('rm.detail.validation.group.required'),
  }),
  width: Yup.number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required('rm.detail.validation.width.required'),
  length: Yup.number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required('rm.detail.validation.length.required'),

  supplierProductCode: Yup.string(),
  labValue: Yup.string(),
  field1: keyValueSchema,
  field2: keyValueSchema,
  field3: keyValueSchema,
  field4: keyValueSchema,
  field5: keyValueSchema,

  // status: Yup.bool().default(false).required('rm.detail.validation.status.required'),
  // completeStatus: Yup.string().default(false).required('rm.detail.validation.status.required'),
});

const responseTransformer = (response) => {
  return response.data;
};

const getRmFn = async ({ id }) => {
  const resp = await request({
    url: `/masterData/material/${id}`,
  });
  return { ...getDefaultValues, ...responseTransformer(resp.data) };
};

const createRmFn = async (rm) => {
  const resp = await request({
    url: `/masterData/material/add`,
    method: 'post',
    data: rm,
  });
  return responseTransformer(resp);
};

const updateRmFn = ({ id, rm }) =>
  request({
    url: `/masterData/material/${id}/edit`,
    method: 'post',
    data: rm,
    headers: {
      'content-type': 'application/json',
    },
  }).then((res) => res.data);

const deleteRmFn = async ({ id }) => {
  const resp = await request({
    url: `/masterData/material/${id}/delete`,
    method: 'post',
  });
  return responseTransformer(resp);
};

const useRmData = (id) =>
  useQuery(id ? [EDIT_RM_DATA, id] : NEW_RM_DATA, () => getRmFn({ id }), {
    enabled: !!id,
    // initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
  });

const RmDetail = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const id = props.match?.params?.id;

  const { formatMessage: f } = useIntl();
  const [isEditMode, setEditMode] = useState(!id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShowMaterialGroupBrowser, setShowMaterialGroupBrowser] = useState(false);
  const [isShowUnitConverter, setShowUnitConverter] = useState(false);
  const [isShowReferenceList, setShowReferenceList] = useState(false);
  const [isShowColorManagement, setShowColorManagement] = useState(false);
  const [isErrorWeighing, setErrorWeighing] = useState(false);
  const [isErrorDimension, setErrorDimension] = useState(false);
  const [isErrorVolumetric, setErrorVolumetric] = useState(false);
  const [isErrorSubType, setErrorSubType] = useState(false);
  const [errCode, setErrorCode] = useState('');

  const { push } = useHistory();

  const queryClient = useQueryClient();

  if (!id) {
    queryClient.resetQueries(NEW_RM_DATA);
  }

  // Load RM Data
  const { data: initialValues = getDefaultValues, isLoading, isFetching, refetch } = useRmData(id);

  // Create RM data
  const { mutate: createRm, isLoading: isAdding } = useMutation(createRmFn, {
    onSuccess() {
      toast(<ToastCreateSuccess />);
      push('./');
    },
    onError(err) {
      toast(<ToastUpdateError />);
    },
  });

  // Update RM data
  const { mutate: updateRm, isLoading: isSaving } = useMutation(updateRmFn, {
    onSuccess() {
      toast(<ToastCreateSuccess />);
      setEditMode(false);
      refetch();
      setErrorCode('');
    },
    onError(err) {
      const message = `This code already exists. Please input another one`;
      setErrorCode(message);
      toast(<ToastUpdateError />);
    },
  });

  const { mutate: deleteRm, isLoading: isDeletingRm } = useMutation(deleteRmFn, {
    onSuccess() {
      toast(<ToastCreateSuccess />);
      setIsDeleting(false);
      push('/master/rm');
      setErrorCode('');
    },
    onError(err) {
      const message = `This code already exists. Please input another one`;
      setErrorCode(message);
      toast(<ToastUpdateError />);
    },
  });

  const title = useMemo(() => f({ id: `rm.detail.${!id ? 'add' : 'edit'}.title` }, { rmName: initialValues?.name }), [f, id, initialValues?.name]);
  const description = useMemo(
    () =>
      f(
        { id: `rm.detail.${!id ? 'add' : 'edit'}.subTitle` },
        {
          updatedBy: initialValues?.updatedBy,
          updatedAt: new Date(initialValues?.updatedAt || new Date()),
        }
      ),
    [f, id, initialValues?.updatedAt, initialValues?.updatedBy]
  );

  const toggleMaterialGroupBrowser = useCallback(() => {
    setShowMaterialGroupBrowser((prev) => !prev);
  }, []);

  const toggleUnitConverter = useCallback(() => {
    setShowUnitConverter((prev) => !prev);
  }, []);

  const toggleReferenceList = useCallback(() => {
    setShowReferenceList((prev) => !prev);
  }, []);

  const toggleColorManagement = useCallback(() => {
    setShowColorManagement((prev) => !prev);
  }, []);

  // Form stuff
  const onSubmit = useCallback(
    (formData) => {
      if (id) {
        if (formData.isSaveAs) {
          formData.storeLocationList = formData.storeLocationList === '' ? [] : formData.storeLocationList;
          formData.supplierList = formData.supplierList === '' ? [] : formData.supplierList;
          formData.customerList = formData.customerList === '' ? [] : formData.customerList;
          formData.storeUnit = formData.storeUnit === '' ? formData.baseUOM : formData.storeUnit;
          // create
          createRm(formData);
        } else {
          formData.storeLocationList = formData.storeLocationList === '' ? [] : formData.storeLocationList;
          formData.supplierList = formData.supplierList === '' ? [] : formData.supplierList;
          formData.customerList = formData.customerList === '' ? [] : formData.customerList;
          formData.storeUnit = formData.storeUnit === '' ? formData.baseUOM : formData.storeUnit;
          // save
          updateRm({ id, rm: formData });
        }
      } else {
        formData.storeLocationList = formData.storeLocationList === '' ? [] : formData.storeLocationList;
        formData.supplierList = formData.supplierList === '' ? [] : formData.supplierList;
        formData.customerList = formData.customerList === '' ? [] : formData.customerList;
        formData.storeUnit = formData.storeUnit === '' ? formData.baseUOM : formData.storeUnit;
        // create
        createRm(formData);
      }
    },
    [createRm, id, updateRm]
  );

  const formik = useFormik({ initialValues, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, setFieldValue, resetForm, values, touched, errors } = formik;

  const handleEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setIsDeleting(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteRm({ id });
  }, [deleteRm, id]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleting(false);
  }, []);

  const handleCancelClick = useCallback(() => {
    setEditMode(false);
    resetForm();
  }, [resetForm]);

  const handleChangeManual = useCallback((name) => (v) => setFieldValue(name, v), [setFieldValue]);

  const handleChangeSupplier = (v) => {
    handleChange({ target: { id: 'supplierList', value: v } });
  };

  const handleChangeUOM = useCallback(
    (type, name, v) => {
      if (type === 'Weight') {
        setFieldValue(name, v);
        if (name === 'weighingUOM') {
          setErrorWeighing(false);
        }
      }

      if (type === 'Dimensional') {
        setFieldValue(name, v);
        if (name === 'dimensionalUOM') {
          setErrorDimension(false);
        }
      }

      if (type === 'Volumetric') {
        setFieldValue(name, v);
        if (name === 'volumetricUOM') {
          setErrorVolumetric(false);
        }
      }
    },
    [setFieldValue]
  );

  const handleChangeType = useCallback(
    (name, v) => {
      setFieldValue(name, v);
      if (name === 'type' || v === 'RM') {
        setErrorSubType(true);
      } else {
        setErrorSubType(false);
      }
    },
    [setFieldValue]
  );

  const onChangeReference = useCallback(
    (v) => {
      setFieldValue('referenceList', v);
    },
    [setFieldValue]
  );

  const handleSave = (type) => {
    const arrCheck = [];

    if ((values.netWeight > 0 || values.grossWeight > 0) && values.weighingUOM === undefined) {
      arrCheck.push(true);
      setErrorWeighing(true);
    } else {
      arrCheck.push(false);
      setErrorWeighing(false);
    }

    if ((values.width > 0 || values.length > 0 || values.height > 0) && values.dimensionalUOM === undefined) {
      arrCheck.push(true);
      setErrorDimension(true);
    } else {
      arrCheck.push(false);
      setErrorDimension(false);
    }

    if ((values.grossVolume > 0 || values.netVolume > 0) && values.volumetricUOM === undefined) {
      arrCheck.push(true);
      setErrorVolumetric(true);
    } else {
      arrCheck.push(false);
      setErrorVolumetric(false);
    }

    if (values.type === 'RM' && (values.subtype === '' || values.subtype === undefined)) {
      arrCheck.push(true);
      setErrorSubType(true);
    } else {
      arrCheck.push(false);
      setErrorSubType(false);
    }

    const sum = arrCheck.filter((value) => value !== false);

    if (type === 'saveAs') {
      handleChange({ target: { id: 'isSaveAs', value: true } });
    }

    if (sum.length === 0) {
      handleSubmit();
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        {/* Title Start */}
        <div className="page-title-container mb-3">
          <Row>
            <Col xs="auto" className="mb-2 align-self-md-center">
              <NavLink to="/master/rm" className="btn-link btn-icon-start w-100 w-md-auto">
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
                    className={classNames('btn-icon', {
                      'overlay-spinner': isFetching,
                    })}
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
                  <>
                    <Button className="btn-icon" variant="primary" onClick={(e) => handleSave('save')} disabled={isAdding || isSaving}>
                      <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                    </Button>{' '}
                    {/* <Button className="btn-icon" variant="primary" onClick={(e) => handleSave('saveAs')} disabled={isAdding || isSaving}>
                      <CsLineIcons icon="save" /> {f({ id: 'common.saveAs' })}
                    </Button> */}
                  </>
                </>
              )}
            </Col>
          </Row>
        </div>
        {/* Title End */}

        {/* RM detail start */}
        <h2 className="small-title">{f({ id: 'rm.detail.section.detail.title' })}</h2>
        <Card
          className={classNames('mb-5', {
            'overlay-spinner': isLoading,
          })}
        >
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md="12">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label >{f({ id: 'rm.field.code' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      onChange={handleChange}
                      value={values.code || ''}
                      // isInvalid={errors.code && touched.code}
                      readOnly={!isEditMode}
                      autoComplete="off"
                    />
                    {errCode !== '' ? (
                      <div className="d-block invalid-feedback">{errCode}</div>
                    ) : (
                      errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>
                    )}{' '}
                  </Form.Group>
                </Col>

                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="name">
                    <Form.Label className="required">{f({ id: 'rm.field.name' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      onChange={handleChange}
                      value={values.name || ''}
                      // isInvalid={errors.name && touched.name}
                      readOnly={!isEditMode}
                      autoComplete="off"
                    />
                    {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                  </Form.Group>
                </Col>

                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="nameEn">
                    <Form.Label className="required">{f({ id: 'rm.field.nameEn' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="nameEn"
                      onChange={handleChange}
                      value={values.nameEn || ''}
                      // isInvalid={errors.nameEn && touched.nameEn}
                      readOnly={!isEditMode}
                      autoComplete="off"
                    />
                    {errors.nameEn && touched.nameEn && <div className="d-block invalid-feedback">{f({ id: errors.nameEn })}</div>}
                  </Form.Group>
                </Col>

                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="description">
                    <Form.Label>{f({ id: 'rm.field.description' })}</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      onChange={handleChange}
                      value={values.description || ''}
                      // isInvalid={errors.description && touched.description}
                      readOnly={!isEditMode}
                      autoComplete="off"
                    />
                    {errors.description && touched.description && <div className="d-block invalid-feedback">{f({ id: errors.description })}</div>}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="completeStatus">
                    <Form.Label>{f({ id: 'customer.field.complete-status' })}</Form.Label>
                    <Form.Check
                      type="switch"
                      label={f({ id: values.completeStatus ? 'customer.complete-status.completed' : 'customer.complete-status.incompleted' })}
                      className="mt-2"
                      id="completeStatus"
                      name="completeStatus"
                      checked={values.completeStatus}
                      onChange={handleChange}
                      // isInvalid={errors.completeStatus && touched.completeStatus}
                      disabled={!isEditMode || initialValues.completeStatus}
                    />
                    {errors.completeStatus && touched.completeStatus && <div className="d-block invalid-feedback">{f({ id: errors.completeStatus })}</div>}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="status">
                    <Form.Label>{f({ id: 'rm.field.status' })}</Form.Label>
                    <Form.Check
                      type="switch"
                      label={f({ id: values.status ? 'rm.field.status.true' : 'rm.field.status.false' })}
                      className="mt-2"
                      id="status"
                      name="status"
                      checked={values.status}
                      onChange={handleChange}
                      // isInvalid={errors.completeStatus && touched.completeStatus}
                      disabled={!isEditMode || !values.completeStatus}
                    />
                    {errors.completeStatus && touched.completeStatus && <div className="d-block invalid-feedback">{f({ id: errors.completeStatus })}</div>}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="type">
                    <Form.Label className="required">{f({ id: 'rm.field.type' })}</Form.Label>
                    <LovSelect
                      name="type"
                      isClearable
                      lov="MATERIAL_TYPE"
                      onChange={(value) => handleChangeType('type', value)}
                      value={values.type || ''}
                      isDisabled={!isEditMode}
                    />
                    {errors.type && touched.type && <div className="d-block invalid-feedback">{f({ id: errors.type })}</div>}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="subtype">
                    <Form.Label className="required">{f({ id: 'rm.field.subtype' })}</Form.Label>
                    <LovSelect
                      name="subtype"
                      isClearable
                      lov="MATERIAL_SUBTYPE"
                      onChange={(value) => handleChangeType('subtype', value)}
                      // isInvalid={errors.subtype && touched.subtype}
                      value={values.subtype || ''}
                      isDisabled={!isEditMode}
                    />
                    {isErrorSubType && <div className="d-block invalid-feedback">{f({ id: 'rm.detail.validation.subtype.required' })}</div>}
                  </Form.Group>
                </Col>

                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="group">
                    <Form.Label className="required">{f({ id: 'rm.field.group' })}</Form.Label>
                    <LovSelect
                      name="group"
                      isClearable
                      lov="MATERIAL_GROUP"
                      onChange={handleChangeManual('group')}
                      value={values.group || ''}
                      isDisabled={!isEditMode}
                    />
                    {errors.group && touched.group && <div className="d-block invalid-feedback">{f({ id: errors.group })}</div>}
                  </Form.Group>
                </Col>

                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="actGroup">
                    <Form.Label>{f({ id: 'rm.field.actGroup' })}</Form.Label>
                    <LovSelect
                      name="actGroup"
                      isClearable
                      lov="MATERIAL_ACTGROUP"
                      onChange={handleChangeManual('actGroup')}
                      value={values.actGroup || ''}
                      isDisabled={!isEditMode}
                    />
                    {errors.actGroup && touched.actGroup && <div className="d-block invalid-feedback">{f({ id: errors.actGroup })}</div>}
                  </Form.Group>
                </Col>

                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top">
                    <Form.Label>&nbsp;</Form.Label>
                    <Row>
                      <Col md="4" xs="12">
                        <Button className="w-100" variant="outline-primary" disabled={!isEditMode} onClick={toggleMaterialGroupBrowser}>
                          {f({ id: 'rm.detail.button.materialGroup' })}
                        </Button>
                      </Col>
                      <Col md="4" xs="12">
                        <Button className="w-100" variant="outline-primary" disabled={!isEditMode} onClick={toggleUnitConverter}>
                          {f({ id: 'rm.detail.button.unitConverter' })}
                        </Button>
                      </Col>
                      <Col md="4" xs="12">
                        <Button className="w-100" variant="outline-primary" disabled={!isEditMode} onClick={toggleReferenceList}>
                          {f({ id: 'rm.detail.button.referenceList' })}
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="baseUOM">
                    <Form.Label>{f({ id: 'rm.field.baseUOM' })}</Form.Label>
                    <LovSelect
                      name="baseUOM"
                      isClearable
                      lov="MATERIAL_BASEUOM"
                      onChange={handleChangeManual('baseUOM')}
                      value={values.baseUOM || ''}
                      isDisabled={!isEditMode}
                    />
                    {errors.baseUOM && touched.baseUOM && <div className="d-block invalid-feedback">{f({ id: errors.baseUOM })}</div>}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="thickness">
                    <Form.Label>{f({ id: 'rm.field.thickness' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="thickness"
                      onChange={handleChange}
                      value={values.thickness || ''}
                      // isInvalid={errors.name && touched.name}
                      readOnly={!isEditMode}
                      autoComplete="off"
                    />
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="barcode">
                    <Form.Label>{f({ id: 'rm.field.barcode' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="barcode"
                      onChange={handleChange}
                      value={values.barcode || ''}
                      // isInvalid={errors.barcode && touched.barcode}
                      readOnly={!isEditMode}
                      autoComplete="off"
                    />
                    {errors.barcode && touched.barcode && <div className="d-block invalid-feedback">{f({ id: errors.barcode })}</div>}
                  </Form.Group>
                </Col>
                <Row className="g-3" md="12">
                  <Col md="6">
                    <Row md="12">
                      <Col md="4" xs="12">
                        <Form.Group className="position-relative tooltip-end-top" controlId="grossWeight">
                          <Form.Label>{f({ id: 'rm.field.grossWeight' })}</Form.Label>
                          <NumberSpinner2
                            name="grossWeight"
                            min="0"
                            value={values.grossWeight}
                            onChange={(value) => handleChangeUOM('Weight', 'grossWeight', value)}
                            disabled={!isEditMode}
                          />
                        </Form.Group>
                      </Col>
                      <Col md="4" xs="12">
                        <Form.Group className="position-relative tooltip-end-top" controlId="netWeight">
                          <Form.Label>{f({ id: 'rm.field.netWeight' })}</Form.Label>
                          <NumberSpinner2 name="netWeight" min="0" value={values.netWeight} onChange={handleChangeManual('netWeight')} disabled={!isEditMode} />
                        </Form.Group>
                      </Col>
                      <Col md="4">
                        <Form.Group className="position-relative tooltip-end-top" controlId="weighingUOM">
                          <Form.Label>{f({ id: 'rm.field.weighingUOM' })}</Form.Label>
                          <LovSelect
                            name="weighingUOM"
                            isClearable
                            lov="MATERIAL_WEIGHINGUOM"
                            onChange={(value) => handleChangeUOM('Weight', 'weighingUOM', value)}
                            value={values.weighingUOM || ''}
                            isDisabled={!isEditMode}
                          />
                          {isErrorWeighing && <div className="d-block invalid-feedback">weighing UOM is required</div>}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                  <Col md="6">
                    <Row>
                      <Col md="4" xs="12">
                        <Form.Group className="position-relative tooltip-end-top" controlId="grossVolume">
                          <Form.Label>{f({ id: 'rm.field.grossVolume' })}</Form.Label>
                          <NumberSpinner2
                            name="grossVolume"
                            min="0"
                            value={values.grossVolume}
                            onChange={handleChangeManual('grossVolume')}
                            disabled={!isEditMode}
                          />
                        </Form.Group>
                      </Col>
                      <Col md="4" xs="12">
                        <Form.Group className="position-relative tooltip-end-top" controlId="netVolume">
                          <Form.Label>{f({ id: 'rm.field.netVolume' })}</Form.Label>
                          <NumberSpinner2 name="netVolume" min="0" value={values.netVolume} onChange={handleChangeManual('netVolume')} disabled={!isEditMode} />
                        </Form.Group>
                      </Col>
                      <Col md="4">
                        <Form.Group className="position-relative tooltip-end-top" controlId="volumetricUOM">
                          <Form.Label>{f({ id: 'rm.field.volumetricUOM' })}</Form.Label>
                          <LovSelect
                            name="volumetricUOM"
                            isClearable
                            lov="MATERIAL_VOLUMETRICUOM"
                            onChange={(value) => handleChangeUOM('Volumetric', 'volumetricUOM', value)}
                            value={values.volumetricUOM || ''}
                            isDisabled={!isEditMode}
                          />
                          {isErrorVolumetric && <div className="d-block invalid-feedback">Volumetric UOM is required</div>}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="g-3 mb-3" md="12">
                  <Col md="6">
                    <Row>
                      <Col sm="4">
                        <Form.Group className="position-relative tooltip-end-top" controlId="width">
                          <Form.Label>{f({ id: 'rm.field.width' })}</Form.Label>
                          <NumberSpinner2 name="width" min="0" value={values.width} onChange={handleChangeManual('width')} disabled={!isEditMode} />
                        </Form.Group>
                      </Col>
                      <Col sm="4">
                        <Form.Group className="position-relative tooltip-end-top" controlId="length">
                          <Form.Label>{f({ id: 'rm.field.length' })}</Form.Label>
                          <NumberSpinner2 name="length" min="0" value={values.length} onChange={handleChangeManual('length')} disabled={!isEditMode} />
                        </Form.Group>
                      </Col>
                      <Col sm="4">
                        <Form.Group className="position-relative tooltip-end-top" controlId="height">
                          <Form.Label>{f({ id: 'rm.field.height' })}</Form.Label>
                          <NumberSpinner2 name="height" min="0" value={values.height} onChange={handleChangeManual('height')} disabled={!isEditMode} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                  <Col md="2">
                    <Form.Group className="position-relative tooltip-end-top" controlId="dimensionalUOM">
                      <Form.Label>{f({ id: 'rm.field.dimensionalUOM' })}</Form.Label>
                      <LovSelect
                        name="dimensionalUOM"
                        isClearable
                        lov="MATERIAL_DIMENSIONALUOM"
                        onChange={(value) => handleChangeUOM('Dimensional', 'dimensionalUOM', value)}
                        value={values.dimensionalUOM || ''}
                        isDisabled={!isEditMode}
                      />
                      {isErrorDimension && <div className="d-block invalid-feedback">DimensionalUOM UOM is required</div>}
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group className="position-relative tooltip-end-top" controlId="costPrice">
                      <Form.Label>{f({ id: 'rm.field.costPrice' })}</Form.Label>
                      <NumberSpinner2 name="costPrice" min="0" value={values.costPrice} onChange={handleChangeManual('costPrice')} disabled={!isEditMode} />
                    </Form.Group>
                  </Col>
                  <Col md="2">
                    <Form.Group className="position-relative tooltip-end-top" controlId="sellingPrice">
                      <Form.Label>{f({ id: 'rm.field.sellingPrice' })}</Form.Label>
                      <NumberSpinner2
                        name="sellingPrice"
                        min="0"
                        value={values.sellingPrice}
                        onChange={handleChangeManual('sellingPrice')}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Col className="mb-3" md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="color">
                    <Form.Label>{f({ id: 'rm.field.color' })}</Form.Label>
                    <Row>
                      <Col xs>
                        <LovSelect
                          name="color"
                          isClearable
                          lov="MATERIAL_COLOR"
                          onChange={handleChangeManual('color')}
                          value={values.color || ''}
                          isDisabled={!isEditMode}
                        />
                        {errors.color && touched.color && <div className="d-block invalid-feedback">{f({ id: errors.color })}</div>}
                      </Col>
                      <Col xs="auto">
                        <Button variant="outline-primary" onClick={toggleColorManagement} disabled={!isEditMode}>
                          {f({ id: 'rm.color.add' })}
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="storeLocationList">
                    <Form.Label className="required">{f({ id: 'rm.field.storeLocationList' })}</Form.Label>
                    <StoreLocationSelect
                      isMulti
                      name="storeLocationList"
                      isDisabled={!isEditMode}
                      onChange={handleChangeManual('storeLocationList')}
                      value={values.storeLocationList}
                    />
                    {errors.storeLocationList && touched.storeLocationList && (
                      <div className="d-block invalid-feedback">{f({ id: errors.storeLocationList })}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md="12">
                  <Form.Group className="position-relative tooltip-end-top" controlId="supplierList">
                    <Form.Label className="required">{f({ id: 'rm.field.supplierList' })}</Form.Label>
                    <SupplierSelect
                      isMulti
                      name="supplierList"
                      type={['01', '02', '03']}
                      isDisabled={!isEditMode}
                      onChange={handleChangeSupplier}
                      value={values?.supplierList || []}
                    />
                    {errors.supplierList && touched.supplierList && <div className="d-block invalid-feedback">{f({ id: errors.supplierList })}</div>}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg="12">
                  <Form.Label>{f({ id: 'rm.field.custom-field' })}</Form.Label>
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field1" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 1" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field5" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 5" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field2" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 2" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field6" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 6" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field3" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 3" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field7" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 7" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field4" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 4" />
                </Col>
                <Col md="6" className="mb-1">
                  <CustomField name="field8" keyIsEnabled="isEnable" values={values} f={f} formik={formik} isEditMode={isEditMode} placeholder="Field 8" />
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
        <ConfirmModal
          show={isDeleting}
          loading={isDeletingRm}
          titleText={f({ id: 'common.warning' })}
          confirmText={f({ id: 'rm.delete.confirmation' })}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
        <MaterialGroupBrowser show={isShowMaterialGroupBrowser} onHide={toggleMaterialGroupBrowser} />
        <ReferenceListBrowser show={isShowReferenceList} onHide={toggleReferenceList} referenceList={values.referenceList} onChange={onChangeReference} />
        <UnitConverter
          show={isShowUnitConverter}
          onHide={toggleUnitConverter}
          touched={touched}
          errors={errors}
          baseUOM={values.baseUOM}
          storeUnit={values.storeUnit}
          storeConversion={values.storeConversion}
          onChangeBaseUOM={handleChangeManual('baseUOM')}
          onChangeStoreUnit={handleChangeManual('storeUnit')}
          onChangeStoreConversion={handleChangeManual('storeConversion')}
        />
        <ColorManagement show={isShowColorManagement} onHide={toggleColorManagement} />
      </Col>
    </>
  );
};

export default RmDetail;

export const rawMaterialSchema = validationSchema;
