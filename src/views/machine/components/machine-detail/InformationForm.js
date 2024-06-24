/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';
import Select from 'react-select';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import MachineDetailCard from './MachineDetailCard';
import './style.css';

const initialData = {
  id: '',
  code: '',
  name: '',
  status: '',
  type: '',
  subType: '',
  brand: '',
  manufacturer: '',
  createdBy: '',
  distributor: '',
  maintenancePeriod: '',
  tooling: [],
  controller: '',
  configuration: [],
  maintenanceList: [],
  standardList: [],
};

const subTypeOptions = [
  { label: 'KORD', value: 'KORD' },
  { label: 'CD', value: 'CD' },
  { label: 'MO', value: 'MO' },
];

const validationSchema = Yup.object().shape({
  // code: Yup.string().required('Please provide Code Required'),
  name: Yup.string().required('Please provide Name Required'),
  type: Yup.object().required('Please provide Type Required'),
  brand: Yup.string().required('Please provide Brand Required'),
  manufacturer: Yup.object().required('Please provide Manufacturer Required'),
  distributor: Yup.object().required('Please provide Distributor Required'),
  maintenancePeriod: Yup.string().required('Please provide Maintenance Period Required'),
  controller: Yup.array().required('Please provide Controller Required'),
});

const maintenanceValidationSchema = Yup.object().shape({
  maintenanceBy: Yup.string().required('Please provide Maintenance By'),
  responsibleBy: Yup.string().required('Please provide Responsible By'),
  maintenanceDt: Yup.string().required('Please provide Maintenance Date'),
  isDefault: Yup.boolean().required('customer.detail.validation.isDefault.required'),
});

const callAddMasterMachine = (data = {}, setIsLoading) => {
  // setIsLoading(true);
  return axios.post(`${SERVICE_URL}/masterData/machine/add`, data);
};

const callUpdateMasterMachine = (data = {}, setIsLoading) => {
  // setIsLoading(true);
  return axios.post(`${SERVICE_URL}/masterData/machine/${data.id}/edit`, data);
};

const InformationForm = ({
  id,
  isLoading,
  setIsLoading,
  typeOptions,
  toolingOptions,
  controllerOptions,
  distributorOptions,
  manufacturerOptions,
  type,
  productOptions,
}) => {
  const { formatMessage: f } = useIntl();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [toolingList, setTooling] = useState();
  const [errCode, setErrorCode] = useState('');

  const [isEditMode, setEditMode] = useState(id === undefined ? true : false);
  const queryClient = useQueryClient();
  const { push } = useHistory();
  const getMachineFn = (id) => () =>
    axios
      .get(`${SERVICE_URL}/masterData/machine/${id}`)
      .then((res) => res.data.data)
      .then((data) => {
        data.type = typeOptions.find((item) => item.value === data.type);
        data.distributor = distributorOptions?.find((item) => item.value === data.distributor);
        data.manufacturer = manufacturerOptions?.find((item) => item.value === data.manufacturer);
        if (data.subType) {
          data.subType = { label: data.subType, valie: data.subType };
        }

        for (const element of data.tooling) {
          const list = [];
          let obj = {};
          element.toolingId = toolingOptions.find((item) => item.value === element.toolingId);
          element.mapProduct.forEach((v) => {
            obj = productOptions.find((item) => item.value === v);
            list.push(obj);
          });
          element.mapProduct = list;
        }
        setTooling(data.tooling);

        // เรียงวันที่จาก มากไปน้อย
        data.maintenanceList.sort((objA, objB) => new Date(objB.maintenanceDt) - new Date(objA.maintenanceDt));

        //  eslint-disable-next-line no-var
        var listController = [];
        if (data.controller !== undefined) {
          var objController = {};
          for (const element of data.controller) {
            objController = controllerOptions.find((item) => item.value === element);
            listController.push(objController);
          }
          data.controller = listController;
        } else {
          data.controller = [];
        }
        return {
          ...initialData,
          ...data,
        };
      });

  const useMachineData = (id) =>
    useQuery(`editMachineData`, getMachineFn(id), {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const { data: initResult, isFetching, error, refetch } = useMachineData(id);

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  // console.log('init : ', init);

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  const { mutate: saveMachine, isLoading: isAdding } = useMutation((currentData) => callAddMasterMachine(currentData, setIsLoading), {
    onSuccess({ data: { message, error, data: savedData } }) {
      setIsLoading(false);
      setEditMode(false);
      if (error) {
        console.error('save order error :', message);
      }
      console.log('savedData : ', savedData);
      push('./');
      toast('บันทึกสำเร็จ');
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      // setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
  });

  const { mutate: updateMachine, isLoading: isSaving } = useMutation((currentData) => callUpdateMasterMachine(currentData, setIsLoading), {
    onSuccess({ data: { message, error, data: savedData } }) {
      setIsLoading(false);
      setEditMode(false);
      if (error) {
        console.error('save order error :', message);
      }
      console.log('savedData : ', savedData);
      refetch();
      toast('เเก้ไขข้อมูลสำเร็จ');
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      // setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
  });

  useEffect(() => {
    return () => {
      queryClient.resetQueries('customerOrder', { exact: true });
      resetForm();
    };
  }, [queryClient, resetForm]);

  const handleChangeType = (value) => {
    handleChange({ target: { id: 'type', value } });
  };

  const handleChangeSubType = (value) => {
    handleChange({ target: { id: 'subType', value } });
  };

  const handleChangeSupplier = (value) => {
    handleChange({ target: { id: 'distributor', value } });
  };

  const handleChangeManufacturer = (value) => {
    handleChange({ target: { id: 'manufacturer', value } });
  };

  const handleChangeController = (value) => {
    handleChange({ target: { id: 'controller', value } });
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const handleMaintenanceSave =
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

  const handleMaintenanceDelete =
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

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };

  const handleSave = () => {
    if (values.tooling.length > 0 && Object.keys(errors).length === 0) {
      for (const element of values.tooling) {
        element.toolingId = element.toolingId?.value;
        element.mapProduct = element.mapProduct?.map((data) => data?.value);
      }
    }

    var listController = [];
    if (values.controller.length > 0) {
      for (const element of values.controller) {
        listController.push(element?.value);
      }
    }

    console.log(values);

    var data = {
      id: values.id,
      code: values.code,
      name: values.name,
      status: values.status,
      type: values.type?.value !== undefined ? values.type?.value : values?.type,
      subType: values.type?.value === 'printing' ? values.subType.value : '',
      brand: values.brand,
      manufacturer: values.manufacturer !== undefined ? values.manufacturer.value : values.manufacturer,
      distributor: values.distributor !== undefined ? values.distributor.value : values.distributor,
      maintenancePeriod: values.maintenancePeriod,
      lastMaintenanceDt: values.lastMaintenanceDt,
      tooling: values.tooling,
      controller: listController,
      configuration: values.configuration,
      standardList: values.standardList,
      maintenanceList: values.maintenanceList,
    };

    console.log(data);
    if (Object.keys(errors).length === 0 && values.code !== '') {
      if (type === 'create') {
        // setIsLoading(true);
        saveMachine(data);
      } else {
        // setIsLoading(true);
        updateMachine(data, values.id);
      }
    }
  };

  const deleteMachine = async (id) => {
    setIsDeletingLoading(true);
    const resp = await axios({
      url: `/masterData/machine/${id}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./');
    // return responseTransformer(resp);
  };

  const handleDeleteConfirm = () => {
    deleteMachine(id);
  };

  const handleChangeStatus = (e) => {
    setFieldValue('status', e.target.checked);
  };

  const handlelastMaintenanceDt = (value) => {
    const lastMaintenanceDt = value;
    handleChange({ target: { id: 'lastMaintenanceDt', value: lastMaintenanceDt } });
  };

  // console.log('isErrorType : ' , isErrorType)

  const handleOpenModalClick = () => {
    setIsOpenAddEditModal(true);
  };

  const handleChangePeriod = (e) => {
    if (/^[\d]+$/.test(e.target.value) || e.target.value === '' || e.target.value === ' ') {
      handleChange({ target: { id: 'maintenancePeriod', value: e.target.value } });
    }
  };

  const handleSearchToolingList = (e) => {
    const foundProducts = values?.tooling.filter((item) => {
      // ใช้ฟังก์ชัน some() เพื่อตรวจสอบว่า keyword ตรงกับ label ใน mapProduct ของแต่ละ object
      return item.mapProduct.some((product) => product.label.includes(e.target.value));
    });
    if (e.target.value === '') {
      handleChange({ target: { id: `tooling`, value: toolingList } });
    } else {
      handleChange({ target: { id: `tooling`, value: foundProducts } });
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div className="page-title-container mb-3">
          <Row>
            <Col className="mb-2">
              <div className="page-title-container mb-3">
                <Row>
                  <Col xs="auto" className="mb-2 align-self-md-center">
                    <NavLink to="/master/machine" className="btn-link btn-icon-start w-100 w-md-auto">
                      <CsLineIcons icon="arrow-left" /> {/* <span>{f({ id: 'common.back' })}</span> */}
                    </NavLink>
                  </Col>
                  <Col className="mb-2">
                    {init?.code ? (
                      <>
                        <h1 className="mb-2 pb-0 display-4 ">
                          {f({ id: 'machine.detail.title' })}: {init.name}
                        </h1>
                        <div className="text-muted font-heading description">
                          {f({ id: 'machine.detail.lastUpdatedAt' })} {init.updatedAt}
                        </div>
                      </>
                    ) : (
                      <h1 className="mb-2 pb-0 display-4">{f({ id: 'machine.detail.add' })}</h1>
                    )}
                  </Col>
                  <Col xs="12" sm="auto" className="align-self-md-center">
                    {!isEditMode && (
                      <>
                        <Button className="btn-icon" variant="primary" onClick={handleEditClick}>
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
                        <Button className="btn-icon" variant="primary" type="submit" onClick={handleSave} disabled={isAdding || isSaving}>
                          <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                        </Button>
                      </>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
        <Card
          className={classNames('mb-5', {
            'overlay-spinner': isLoading,
          })}
        >
          <Card.Body>
            <Row className="mb-2">
              <Col sm="12" md="12" lg="3">
                <Form.Label className="col-form-label">{f({ id: 'machine.field.machineCode' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  onChange={handleChange}
                  value={values.code}
                  // disabled={values.id}
                  isInvalid={errors.code && touched.code}
                  readOnly={!isEditMode}
                />
                {errCode !== '' ? (
                  <div className="d-block invalid-feedback">{errCode}</div>
                ) : (
                  errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>
                )}
              </Col>
              <Col sm="12" md="12" lg="9">
                <Form.Label className="col-form-label required">{f({ id: 'machine.field.machineName' })}</Form.Label>
                {/* <Form.Group className="position-relative tooltip-end-top" controlId="name">
                  <Form.Control type="text" required value={values.name || ''} onChange={handleChange} readOnly={!isEditMode} />
                  <Form.Control.Feedback type="invalid">Please provide Machine Name</Form.Control.Feedback>
                </Form.Group> */}
                <Form.Control
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={values.name}
                  // disabled={values.id}
                  isInvalid={errors.name && touched.name}
                  readOnly={!isEditMode}
                />
                {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm="12" md="6" lg={`${values.type?.value === 'printing' ? '3' : '4'}`}>
                <Form.Label className="col-form-label required">{f({ id: 'machine.field.machineType' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="type">
                  <Select
                    name="type"
                    classNamePrefix="react-select"
                    options={typeOptions}
                    isDisabled={!isEditMode}
                    disabled={values.id}
                    value={values.type}
                    isInvalid={errors.type && touched.type}
                    onChange={handleChangeType}
                    required
                  />
                  {errors.type && touched.type && <div className="d-block invalid-feedback">{f({ id: errors.type })}</div>}
                </Form.Group>
              </Col>
              {values.type?.value === 'printing' && (
                <Col sm="12" md="6" lg="3">
                  <Form.Label className="col-form-label">{f({ id: 'machine.field.machineSubType' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="subType">
                    <Select
                      name="subType"
                      classNamePrefix="react-select"
                      options={subTypeOptions}
                      isDisabled={!isEditMode}
                      disabled={values.id}
                      value={values.subType || ''}
                      isInvalid={errors.subType && touched.subType}
                      onChange={handleChangeSubType}
                      required
                    />
                  </Form.Group>
                </Col>
              )}

              <Col sm="12" md="12" lg={`${values.type?.value === 'printing' ? '3' : '4'}`}>
                <Form.Label className="col-form-label required">{f({ id: 'machine.field.brand' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  onChange={handleChange}
                  value={values.brand}
                  // disabled={values.id}
                  isInvalid={errors.brand && touched.brand}
                  readOnly={!isEditMode}
                />
                {errors.brand && touched.brand && <div className="d-block invalid-feedback">{f({ id: errors.brand })}</div>}
                {/* <Form.Group className="position-relative tooltip-end-top" controlId="brand">
                  <Form.Control type="text" required value={values.brand || ''} onChange={handleChange} readOnly={!isEditMode} />
                  <Form.Control.Feedback type="invalid">Please provide Brand Machine</Form.Control.Feedback>
                </Form.Group> */}
              </Col>

              <Col sm="12" md="12" lg={`${values.type?.value === 'printing' ? '3' : '4'}`}>
                <Form.Label className="col-form-label required">{f({ id: 'machine.field.manufacturer' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="manufacturer">
                  <Select
                    classNamePrefix="react-select"
                    options={manufacturerOptions}
                    isDisabled={!isEditMode}
                    value={values.manufacturer || ''}
                    onChange={handleChangeManufacturer}
                    required
                  />
                  {errors.manufacturer && touched.manufacturer && <div className="d-block invalid-feedback">{f({ id: errors.manufacturer })}</div>}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm="12" md="12" lg="4">
                <Form.Label className="col-form-label required">{f({ id: 'machine.field.distributorOptions' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="type">
                  <Select
                    classNamePrefix="react-select"
                    options={distributorOptions}
                    isDisabled={!isEditMode}
                    value={values.distributor || ''}
                    onChange={handleChangeSupplier}
                    required
                  />
                  {errors.distributor && touched.distributor && <div className="d-block invalid-feedback">{f({ id: errors.distributor })}</div>}
                </Form.Group>
              </Col>
              <Col sm="12" md="12" lg="4">
                <Form.Label className="col-form-label required">{f({ id: 'machine.field.maintenancePeriod' })}</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    name="maintenancePeriod"
                    onChange={handleChangePeriod}
                    value={values.maintenancePeriod}
                    isInvalid={errors.maintenancePeriod && touched.maintenancePeriod}
                    readOnly={!isEditMode}
                  />
                  <InputGroup.Text>{f({ id: 'machine.field.day' })}</InputGroup.Text>
                </InputGroup>
                {errors.maintenancePeriod && touched.maintenancePeriod && <div className="d-block invalid-feedback">{f({ id: errors.maintenancePeriod })}</div>}
              </Col>

              <Col sm="12" md="12" lg="4">
                <Form.Label className="col-form-label mr-2">{f({ id: 'machine.field.status' })}</Form.Label>
                <Form.Check
                  type="switch"
                  id="status"
                  label={f({ id: !values.status ? 'common.inactive' : 'common.active' })}
                  checked={values.status}
                  className="mt-2"
                  onChange={handleChangeStatus}
                  isInvalid={errors.status}
                  disabled={!isEditMode}
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col sm="12" md="12" lg="12">
                <Form.Label className="col-form-label">{f({ id: 'machine.field.maintenanceList' })}</Form.Label>
                <OverlayScrollbarsComponent
                  options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                  style={{ maxHeight: '590px' }}
                >
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="maintenanceList"
                      render={(arrayHelpers) => {
                        return [
                          values.maintenanceList?.map(
                            (
                              detail,
                              index // eslint-disable-next-line no-underscore-dangle
                            ) => (
                              <Col key={index}>
                                <MachineDetailCard
                                  formValues={detail}
                                  onChange={handleMaintenanceSave({ arrayHelpers, list: values.maintenanceList, index, isReplace: true })}
                                  onDelete={handleMaintenanceDelete({ arrayHelpers, list: values.maintenanceList, index })}
                                  validationSchema={maintenanceValidationSchema}
                                  disabled={!isEditMode}
                                />
                              </Col>
                            )
                          ),
                          isEditMode && (
                            <Col key="bomList">
                              <MachineDetailCard
                                onChange={handleMaintenanceSave({
                                  arrayHelpers,
                                  list: values.maintenanceList,
                                })}
                                validationSchema={maintenanceValidationSchema}
                                isOpenModal={isOpenAddEditModal}
                                setIsOpenModal={setIsOpenAddEditModal}
                              />
                            </Col>
                          ),
                          !isEditMode && values?.maintenanceList?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                        ];
                      }}
                    />
                  </FormikProvider>
                </OverlayScrollbarsComponent>
              </Col>
            </Row>

            {isEditMode && (
              <Row className="mb-2">
                <Col sm="12" md="12" lg="12">
                  <div
                    className={classNames('supplier-address-detail-card form-check card custom-card w-100 position-relative p-0 m-0 h-100 mb-3', {
                      'through-content': isEditMode,
                    })}
                  >
                    <Card className="form-check-label w-100 h-100" body={false} onClick={handleOpenModalClick}>
                      <Card.Body className="text-center m-auto flex-grow-0">
                        <CsLineIcons icon="plus" className="cs-icon icon text-primary" />
                        <span className="mt-3 text-body text-primary d-block">{f({ id: 'common.add' })}</span>
                      </Card.Body>
                    </Card>
                  </div>
                </Col>
              </Row>
            )}

            <Row className="mb-2 mt-4">
              <Col sm="12" md="12" lg="12">
                <Row>
                  <Col sm={`${!isEditMode ? '12' : '11'}`} md={`${!isEditMode ? '12' : '11'}`} lg={`${!isEditMode ? '12' : '11'}`}>
                    <Form.Group className="tooltip-end-top mb-3">
                      <Row>
                        <Col sm="12" md="12" lg="8">
                          <Form.Label className="col-form-label">{f({ id: 'machine.field.toolingOptions' })}</Form.Label>
                        </Col>
                        {/* {isEditMode && ( */}
                        <Col sm="12" md="12" lg="4">
                          <Form.Control
                            type="text"
                            onChange={handleSearchToolingList}
                            placeholder="search product.."
                            // value={values.maintenancePeriod}
                            // isInvalid={errors.maintenancePeriod && touched.maintenancePeriod}
                            // readOnly={!isEditMode}
                          />
                        </Col>
                        {/* )} */}
                      </Row>
                    </Form.Group>
                  </Col>
                </Row>

                <OverlayScrollbarsComponent
                  options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                  style={
                    values.tooling.length > 0
                      ? { maxHeight: '250px', minHeight: '200px', position: 'relative', zIndex: '0' }
                      : { maxHeight: '250px', position: 'relative', zIndex: '0' }
                  }
                >
                  <Card className="p-2" style={{ position: 'relative', zIndex: '1' }}>
                    <FormikProvider value={formik}>
                      <FieldArray
                        name="tooling"
                        render={(arrayHelpers) => {
                          return [
                            values.tooling?.map((detail, index) =>
                              isEditMode ? (
                                <Row key={index}>
                                  <Col lg="11" md="11" sm="11">
                                    <Form.Group className="tooltip-end-top mb-3" controlId={`tooling.${index}`}>
                                      <Row>
                                        <Col sm="12" md="" lg="4">
                                          <Select
                                            classNamePrefix="react-select"
                                            name="toolingId"
                                            options={toolingOptions}
                                            isDisabled={!isEditMode}
                                            placeholder="Select Tooling..."
                                            value={detail.toolingId || ''}
                                            onChange={(e) => handleChange({ target: { id: `tooling.${index}.toolingId`, value: e } })}
                                            required
                                          />
                                        </Col>
                                        <Col sm="12" md="" lg="8">
                                          <Select
                                            classNamePrefix="react-select"
                                            name="mapProduct"
                                            options={productOptions}
                                            isDisabled={!isEditMode}
                                            placeholder="Select Product..."
                                            value={detail.mapProduct || ''}
                                            onChange={(e) => handleChange({ target: { id: `tooling.${index}.mapProduct`, value: e } })}
                                            isMulti
                                            required
                                          />
                                        </Col>
                                      </Row>
                                      <Form.Control.Feedback type="invalid">Please provide tooling</Form.Control.Feedback>
                                    </Form.Group>
                                  </Col>
                                  <Col style={{ paddingLeft: '1.2rem' }} lg="1" md="1" sm="1">
                                    {isEditMode && ( // TODO: Change this before finish
                                      <Button className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(index)}>
                                        <CsLineIcons icon="bin" />
                                      </Button>
                                    )}
                                  </Col>
                                </Row>
                              ) : (
                                <Row key={index}>
                                  <Col lg="12" md="12" sm="12">
                                    <Form.Group key={index} className="position-relative tooltip-end-top mb-3" controlId={`tooling.${index}`}>
                                      <Row>
                                        <Col sm="12" md="4" lg="4">
                                          <Select
                                            classNamePrefix="react-select"
                                            name="toolingId"
                                            options={toolingOptions}
                                            isDisabled={!isEditMode}
                                            placeholder="Select Tooling..."
                                            value={detail.toolingId || ''}
                                            onChange={(e) => handleChange({ target: { id: `tooling.${index}.toolingId`, value: e } })}
                                            required
                                          />
                                        </Col>
                                        <Col sm="12" md="8" lg="8">
                                          <Select
                                            classNamePrefix="react-select"
                                            name="mapProduct"
                                            options={productOptions}
                                            isDisabled={!isEditMode}
                                            placeholder="Select Product..."
                                            value={detail.mapProduct || ''}
                                            onChange={(e) => handleChange({ target: { id: `tooling.${index}.mapProduct`, value: e } })}
                                            isMulti
                                            required
                                          />
                                        </Col>
                                      </Row>
                                    </Form.Group>
                                  </Col>
                                </Row>
                              )
                            ),
                            !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                          ];
                        }}
                      />
                    </FormikProvider>
                  </Card>
                </OverlayScrollbarsComponent>
                <FormikProvider value={formik}>
                  <FieldArray
                    name="tooling"
                    render={(arrayHelpers) => {
                      return [
                        isEditMode && ( // TODO: Change this before finish
                          <div key="addToolingList" className="d-grid gap-2 mb-3">
                            <Button
                              variant="outline-primary"
                              className="btn-icon btn-icon-start mb-1"
                              onClick={() => arrayHelpers.insert(values.tooling.length, '')}
                            >
                              <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                            </Button>
                          </div>
                        ),
                      ];
                    }}
                  />
                </FormikProvider>
              </Col>
            </Row>

            <Row className="mb-2 mt-4">
              <Col sm="12" md="12" lg="12">
                <Form.Label className="col-form-label">{f({ id: 'machine.field.controllerOptions' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="controller">
                  <Select
                    classNamePrefix="react-select"
                    options={controllerOptions}
                    isDisabled={!isEditMode}
                    value={values.controller || ''}
                    onChange={handleChangeController}
                    isInvalid={errors.controller && touched.controller}
                    required
                    isMulti
                  />
                  {errors.controller && touched.controller && <div className="d-block invalid-feedback">{f({ id: errors.controller })}</div>}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-2 mt-4">
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label">{f({ id: 'machine.field.configuration' })}</Form.Label>
                <FormikProvider value={formik}>
                  <FieldArray
                    name="configuration"
                    render={(arrayHelpers) => {
                      return [
                        values.configuration?.map((detail, index) =>
                          isEditMode ? (
                            <Row key={index}>
                              <Col lg="11" md="11" sm="11">
                                <Form.Group className="position-relative tooltip-end-top mb-3" controlId={`configuration.${index}`}>
                                  <Form.Control type="text" required value={detail || ''} onChange={handleChange} readOnly={!isEditMode} />
                                  <Form.Control.Feedback type="invalid">Please provide configuration</Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                              <Col lg="1" md="1" sm="1">
                                {isEditMode && ( // TODO: Change this before finish
                                  <Button className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(index)}>
                                    <CsLineIcons icon="bin" />
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          ) : (
                            <Form.Group key={index} className="position-relative tooltip-end-top mb-3" controlId={`configuration.${index}`}>
                              <Form.Control type="text" required value={detail || ''} onChange={handleChange} readOnly={!isEditMode} />
                              <Form.Control.Feedback type="invalid">Please provide configuration</Form.Control.Feedback>
                            </Form.Group>
                          )
                        ),
                        isEditMode && ( // TODO: Change this before finish
                          <div key="addConfigurationList" className="d-grid gap-2 mb-3">
                            <Button
                              variant="outline-primary"
                              className="btn-icon btn-icon-start mb-1"
                              onClick={() => arrayHelpers.insert(values.configuration.length, '')}
                            >
                              <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                            </Button>
                          </div>
                        ),
                        !isEditMode && values?.configuration?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                      ];
                    }}
                  />
                </FormikProvider>
              </Col>
              <Col sm="12" md="12" lg="6">
                <Form.Label className="col-form-label">{f({ id: 'machine.field.standardList' })}</Form.Label>
                <FormikProvider value={formik}>
                  <FieldArray
                    name="standardList"
                    render={(arrayHelpers) => {
                      return [
                        values.standardList?.map((detail, index) =>
                          isEditMode ? (
                            <Row key={index}>
                              <Col lg="10" md="11" sm="11">
                                <Form.Group className="position-relative tooltip-end-top mb-3" controlId={`standardList.${index}`}>
                                  <Form.Control
                                    type="text"
                                    required
                                    value={detail?.name || ''}
                                    // onChange={handleChange}
                                    onChange={(e) => handleChange({ target: { id: `standardList.${index}.name`, value: e.target.value } })}
                                    readOnly={!isEditMode}
                                  />
                                  <Form.Control.Feedback type="invalid">Please provide standardList</Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                              {/* <Col lg="6" md="11" sm="11">
                                <Form.Group className="position-relative tooltip-end-top mb-3" controlId={`standardList.${index}`}>
                                  <Form.Control
                                    type="text"
                                    required
                                    disabled
                                    value={detail?.value || ''}
                                    onChange={(e) => handleChange({ target: { id: `standardList.${index}.value`, value: e.target.value } })}
                                    readOnly={!isEditMode}
                                  />
                                  <Form.Control.Feedback type="invalid">Please provide standardList</Form.Control.Feedback>
                                </Form.Group>
                              </Col> */}
                              <Col lg="1" md="1" sm="1">
                                {isEditMode && ( // TODO: Change this before finish
                                  <Button className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(index)}>
                                    <CsLineIcons icon="bin" />
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          ) : (
                            <Row key={index}>
                              <Col lg="12" md="12" sm="12">
                                <Form.Group className="position-relative tooltip-end-top mb-3" controlId={`standardList.${index}`}>
                                  <Form.Control
                                    type="text"
                                    required
                                    value={detail?.name || ''}
                                    // onChange={handleChange}
                                    onChange={(e) => handleChange({ target: { id: `standardList.${index}.name`, value: e.target.value } })}
                                    readOnly={!isEditMode}
                                  />
                                  <Form.Control.Feedback type="invalid">Please provide standardList</Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                              {/* <Col lg="6" md="12" sm="12">
                                <Form.Group className="position-relative tooltip-end-top mb-3" controlId={`standardList.${index}`}>
                                  <Form.Control
                                    type="text"
                                    required
                                    disabled
                                    value={detail?.value || ''}
                                    onChange={(e) => handleChange({ target: { id: `standardList.${index}.value`, value: e.target.value } })}
                                    readOnly={!isEditMode}
                                  />
                                  <Form.Control.Feedback type="invalid">Please provide standardList</Form.Control.Feedback>
                                </Form.Group>
                              </Col> */}
                            </Row>
                          )
                        ),
                        isEditMode && ( // TODO: Change this before finish
                          <div key="addStandardListList" className="d-grid gap-2 mb-3">
                            <Button
                              variant="outline-primary"
                              className="btn-icon btn-icon-start mb-1"
                              onClick={() => arrayHelpers.insert(values.standardList.length, '')}
                            >
                              <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                            </Button>
                          </div>
                        ),
                        !isEditMode && values?.standardList?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                      ];
                    }}
                  />
                </FormikProvider>
              </Col>
            </Row>
            <ConfirmModal
              show={isDeleting}
              loading={isDeletingLoading}
              titleText={'Warning'}
              confirmText={'Do you want delete Machine?'}
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
            />
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default InformationForm;
