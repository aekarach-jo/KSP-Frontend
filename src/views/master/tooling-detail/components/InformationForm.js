/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-template */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import classNames from 'classnames';
import * as Yup from 'yup';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import LovUOMSelect from 'components/lov-select/LovUOMSelect';
import NumberSpinner2 from 'components/number-spinner/NumberSpinner2';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import ToolingDetailCard from './ToolingDetailCard';
import AddToolingItemModal from './AddToolingItemModal';
import AddStatusTypeItemModal from './AddStatusTypeItemModal';
import LovStatusTypeSelect from './LovStatusTypeSelect';

const initialData = {
  code: '',
  name: '',
  type: '',
  width: 0,
  length: 0,
  dimensionalUOM: '',
  customerList: '',
  completeStatus: false,
  status: false,
  modifiedList: [],
};

const objectiveOptions = [
  { label: 'สั่งทำใหม่', value: 'สั่งทำใหม่' },
  { label: 'แก้ไข', value: 'แก้ไข' },
  { label: 'ซ่อมแซม', value: 'ซ่อมแซม' },
  { label: 'ปรับเปลี่ยน', value: 'ปรับเปลี่ยน' },
  { label: 'ทำลาย', value: 'ทำลาย' },
];

const createToolingFn = (tooling) => axios.post(`${SERVICE_URL}/masterData/tooling/add`, tooling).then((res) => res.data);

const updateToolingFn = ({ id, tooling }) =>
  axios
    .post(`${SERVICE_URL}/masterData/tooling/${id}/edit`, tooling, {
      headers: {
        'content-type': 'application/json',
      },
    })
    .then((res) => res.data);

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'tooling.save.success' })}</span>
      </div>
    </>
  );
};

const InformationForm = ({ id, supplierOptions, customerOptions, typeToolingOptions, statusType, statusOptions, typeToolingList, onRefresh, setOnRefetch }) => {
  const [isEditMode, setEditMode] = useState(!id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [addModalStatusType, setAddModalStatusType] = useState(false);
  const [listTooling, setListTooling] = useState(typeToolingList);
  const [listStatusType, setListStatusType] = useState(statusType);
  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [errCode, setErrorCode] = useState('');
  const [errCodeItemModal, setErrorCodeItemModal] = useState();
  const [onRefetchLov, setOnRefetchLov] = useState(false);
  const [onAddModify, setOnAddModify] = useState(false);

  const { push } = useHistory();
  const queryClient = useQueryClient();

  const getToolingFn = (toolingId) => () =>
    axios
      .get(`${SERVICE_URL}/masterData/tooling/${toolingId}`)
      .then((res) => res.data.data)
      .then((data) => {
        data.type = typeToolingOptions.find((item) => item.value === data.type);
        data.statusType = statusOptions.find((item) => item.detail.code === data.statusType);
        //  eslint-disable-next-line no-var
        var list = [];
        var obj = {};
        for (const element of data.customerList) {
          obj = customerOptions.find((item) => item.value === element);
          list.push(obj);
        }
        data.customerList = list;

        data.modifiedList.forEach((listA) => {
          listA.objective = {
            label: listA.objective,
            value: listA.objective,
          };
        });
        console.log(supplierOptions);
        data.modifiedList.forEach((modi) => {
          console.log(modi);
          modi.modifiedBy = supplierOptions.find((item) => item.value === modi.modifiedBy);
          modi.statusType = statusOptions.find((item) => item.detail.code === modi.statusType);
        });

        if (data.modifiedList.length > 0) {
          data.objective = { label: '', value: '' };
          if (data.modifiedList[0].completedDt === null) {
            data.objective.value = data.modifiedList[0].objective.value;
          } else {
            data.objective = undefined;
          }
        }

        // เรียงวันที่จาก มากไปน้อย
        data.modifiedList.sort((objA, objB) => new Date(objB.sentDt) - new Date(objA.sentDt));

        return {
          ...initialData,
          ...data,
        };
      });

  const useToolingData = (toolingId) =>
    useQuery(`editToolingData`, getToolingFn(toolingId), {
      enabled: !!toolingId,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const validationSchema = Yup.object().shape({
    // code: Yup.string().required('tooling.detail.validation.code.required'),
    name: Yup.string().required('tooling.detail.validation.name.required'),
    type: Yup.object().required('tooling.detail.validation.type.required'),
    width: Yup.number().required('tooling.detail.validation.width.required'),
    length: Yup.number().required('tooling.detail.validation.length.required'),
    dimensionalUOM: Yup.mixed()
      .test('is-valid', 'tooling.detail.validation.dimensionalUOM.required', function (value) {
        // ตรวจสอบว่าค่าของ dimensionalUOM เป็น Object หรือ String
        if (typeof value === 'object' || typeof value === 'string') {
          return true;
        }
        return false;
      })
      .required('tooling.detail.validation.dimensionalUOM.required'),
    // dimensionalUOM: Yup.object().required('tooling.detail.validation.dimensionalUOM.required'),
    customerList: Yup.array().required('tooling.detail.validation.customerList.required'),
  });

  const maintenanceValidationSchema = Yup.object().shape({
    sentDt: Yup.string().required('tooling.detail.validation.modify.sent-dt.required'),
    // completedDt: Yup.string().required('tooling.detail.validation.modify.complete-dt.required'),
    sentBy: Yup.string().required('tooling.detail.validation.modify.sent-by.required'),
    modifiedBy: Yup.object().required('tooling.detail.validation.modify.modified-by.required'),
  });

  const { data: initResult, isFetching, error, refetch } = useToolingData(id);

  if (error) {
    console.error('error :', error);
  }

  const { formatMessage: f } = useIntl();

  const onSubmit = (formData) => {
    var listCustomerResult = [];
    if (formData.customerList !== undefined) {
      for (const element of formData.customerList) {
        listCustomerResult.push(element.value);
      }
    }
    var listModifiedListResult = [];
    if (formData.modifiedList !== undefined) {
      for (const element of formData.modifiedList) {
        listModifiedListResult.push({
          sentDt: element.sentDt,
          completedDt: element.completedDt,
          sentBy: element.sentBy,
          modifiedBy: element.modifiedBy?.value || element.modifiedBy,
          returnStatus: element.returnStatus,
          objective: element.objective === undefined ? '' : element.objective.value,
          statusType: element.statusType === undefined ? '' : element.statusType.detail.code,
        });
      }
    }

    console.log(formData.modifiedList[0]);

    // if (formData.modifiedList[0]?.completedDt !== null) {
    //   formData.status = true;
    // } else {
    //   formData.status = false;
    // }
    var data = {
      code: formData.code,
      type: formData.type !== undefined ? formData.type.value : formData.type,
      name: formData.name,
      width: formData.width,
      length: formData.length,
      dimensionalUOM: formData.dimensionalUOM !== '' ? formData.dimensionalUOM.detail?.code : formData.dimensionalUOM,
      id: formData.id,
      customerList: listCustomerResult,
      modifiedList: listModifiedListResult,
      status: formData.status,
      statusType: formData.statusType !== undefined ? formData.statusType.detail.code : formData.statusType,
      completeStatus: formData.completeStatus,
    };
    console.log(data);
    console.log(formData);

    if (id) {
      // save
      // setEnableEdit(true);
      updateTooling({ id, tooling: data });
    } else {
      // create
      // setEnableAdd(true);
      createTooling(data);
    }
  };

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  const title =
    id === undefined ? f({ id: `tooling.detail.title` }, { toolingName: '' }) : f({ id: `tooling.detail.title` }, { toolingName: initResult?.name });
  const description =
    id === undefined
      ? f({ id: `tooling.add.subTitle` })
      : f(
          { id: `tooling.${!id ? 'add' : 'edit'}.subTitle` },
          {
            updatedBy: initResult?.updatedBy,
            updatedAt: new Date(initResult?.updatedAt || null),
          }
        );

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    deleteTooling(id);
  };

  const deleteTooling = async (id) => {
    setIsDeletingLoading(true);
    const resp = await axios({
      url: `${SERVICE_URL}/masterData/tooling/${id}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./');
    // return responseTransformer(resp);
  };

  const { mutate: createTooling, isLoading: isAdding } = useMutation(createToolingFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableAdd(false);
      console.debug('create tooling success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const { mutate: updateTooling, isLoading: isSaving } = useMutation(updateToolingFn, {
    onSuccess(data) {
      refetch();
      setEditMode(false);
      setEnableEdit(false);
      console.debug('update tooling success :', data);
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const handleMaintenanceSave =
    ({ arrayHelpers, list, index, isReplace }) =>
    (v) => {
      const { statusType, objective } = v;
      if (isReplace) {
        arrayHelpers.replace(index, v);
        // เมื่อแก้ไข item บนสุด ดึงจะให้ statusType ข้างนอกเปลี่ยนตาม
        if (index === 0) {
          handleChangeObjective(objective);
          handleChangeStatusType(statusType);
          if (v.completedDt !== '') {
            handleChangeObjective(undefined);
          }
        }
      } else {
        arrayHelpers.unshift(v);
        handleChangeObjective(objective);
        handleChangeStatusType(statusType);
      }

      setOnAddModify(true);

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

  const handleChangeCompleteStatus = useCallback(
    (e) => {
      if (!e.target.checked) {
        setFieldValue('customerStatus', false);
      }
      handleChange(e);
    },
    [handleChange, setFieldValue]
  );

  const handleChangeType = (value) => {
    handleChange({ target: { id: 'type', value } });
  };

  const handleChangeCustomerList = (value) => {
    handleChange({ target: { id: 'customerList', value } });
  };

  const handleChangeStatusType = (value) => {
    handleChange({ target: { id: 'statusType', value } });
  };
  const handleChangeObjective = (value) => {
    handleChange({ target: { id: 'objective', value } });
  };

  const handleChangeNumber = (value, type) => {
    handleChange({ target: { id: [type], value } });
  };

  const handleChangeUnit = (value) => {
    handleChange({ target: { id: 'dimensionalUOM', value } });
  };

  const handleOnAddToolingTypeItem = (value) => {
    const checkCode = listTooling.find((data) => data.code === value.code);

    console.log(checkCode);
    if (checkCode) {
      const message = `This code (${checkCode.code}) already exists. Please input another one`;
      setErrorCodeItemModal(message);
    } else {
      var data = {
        type: 'TOOLING_TYPE',
        abbr: value.abbr,
        code: value.code,
        name: value.name,
      };

      var list = [...listTooling, data];
      setListTooling(list);
      setErrorCodeItemModal('');
      // onRefresh();
    }
  };

  const handleOnAddToolingStatusTypeItem = (value) => {
    const checkCode = listTooling.find((data) => data.code === value.code);

    console.log(checkCode);
    if (checkCode) {
      const message = `This code (${checkCode.code}) already exists. Please input another one`;
      setErrorCodeItemModal(message);
    } else {
      var data = {
        type: 'TOOLING_STATUSTYPE',
        abbr: value.abbr,
        code: value.code,
        name: value.name,
      };
      var list = [...listStatusType, data];
      setListStatusType(list);
      setErrorCodeItemModal('');
      // onRefresh();
    }
  };

  const handleOnRemoveToolingTypeItem = (value) => {
    var list = [...listTooling.slice(0, value), ...listTooling.slice(value + 1)];
    setListTooling(list);
  };

  const handleOnRemoveToolingStatusTypeItem = (value) => {
    var list = [...listStatusType.slice(0, value), ...listStatusType.slice(value + 1)];
    setListStatusType(list);
  };

  const handleOnSaveToolingTypeItem = async () => {
    setAddModal(false);
    var result = {
      condition: 'type',
      data: listTooling,
    };
    await axios.post(`${SERVICE_URL}/masterData/lov/tooling/save`, result).then((res) => {
      if (res.data.message === 'Success') {
        setOnRefetchLov(true);
      }
    });
  };

  const handleOnSaveToolingStatusTypeItem = async () => {
    setAddModalStatusType(false);
    var result = {
      condition: 'statustype',
      data: listStatusType,
    };
    console.log(result);
    await axios.post(`${SERVICE_URL}/masterData/lov/tooling/save`, result).then((res) => {
      if (res.data.message === 'Success') {
        setOnRefetchLov(true);
      }
    });
  };

  const handleOnHideToolingTypeItem = () => {
    setAddModal(false);
    setListStatusType(statusType);
    setAddModalStatusType(false);
    setErrorCodeItemModal('');
  };

  const handleOpenModalClick = () => {
    setIsOpenAddEditModal(true);
  };

  useEffect(() => {
    setErrorCode('');
  }, [values.code]);

  useEffect(() => {
    if (values.modifiedList[0]?.completedDt !== '') {
      handleChange({ target: { id: 'status', value: true } });
      const sType = statusOptions.find((item) => item.detail.code === '999');
      console.log(sType);
      handleChange({ target: { id: 'statusType', value: sType } });
    } else {
      handleChange({ target: { id: 'status', value: false } });
    }
    setOnAddModify(false);
  }, [onAddModify]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        <Form onSubmit={handleSubmit}>
          {/* Title Start */}
          <div className="page-title-container mb-3">
            <Row>
              <Col className="mb-2">
                {/* <h1 className="mb-2 pb-0 display-4">{title}</h1> */}
                <div className="page-title-container mb-3">
                  <Row>
                    <Col xs="auto" className="mb-2 align-self-md-center">
                      <NavLink to="/master/tooling" className="btn-link btn-icon-start w-100 w-md-auto">
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
                            <Button className="btn-icon" variant="outline-alternate" onClick={handleCancelClick} disabled={isEnableAdd || isEnableEdit}>
                              <CsLineIcons icon="close" /> {f({ id: 'common.cancel' })}
                            </Button>
                          )}{' '}
                          <Button className="btn-icon" variant="primary" type="submit" onClick={handleSubmit} disabled={isEnableAdd || isEnableEdit}>
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
          {/* Title End */}
          {/* Customer detail Start */}
          {/* <h2 className="small-title">{f({ id: 'product.list.title' })}</h2> */}

          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="mb-3">
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label">{f({ id: 'tooling.code' })}</Form.Label>
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
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label required">{f({ id: 'tooling.name' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={values.name || ''}
                    isInvalid={errors.name && touched.name}
                    readOnly={!isEditMode}
                  />
                  {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Form.Label className="col-form-label required">{f({ id: 'tooling.type' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="type">
                    <Select
                      name="type"
                      classNamePrefix="react-select"
                      options={typeToolingOptions}
                      isDisabled={!isEditMode}
                      value={values.type || ''}
                      onChange={handleChangeType}
                      isInvalid={errors.type && touched.type}
                      required
                    />
                  </Form.Group>
                  {/* {isErrorType && <div className="d-block invalid-feedback">{f({ id: 'tooling.detail.validation.type.required' })}</div>} */}
                  {errors.type && touched.type && <div className="d-block invalid-feedback">{f({ id: errors.type })}</div>}
                </Col>
              </Row>
            
           
              <Row className="mb-3 mt-4">
                <Col sm="12" md="12" lg="12">
                  <Form.Label className="col-form-label required">{f({ id: 'tooling.customer' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="customerList">
                    <Select
                      classNamePrefix="react-select"
                      options={customerOptions}
                      isDisabled={!isEditMode}
                      value={values.customerList}
                      required
                      isMulti
                      onChange={handleChangeCustomerList}
                      closeMenuOnSelect={false}
                    />
                    {errors.customerList && touched.customerList && <div className="d-block invalid-feedback">{f({ id: errors.customerList })}</div>}
                    {/* <Form.Control.Feedback type="invalid">Please provide Customer</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 mt-4">
                <Col sm="12" md="12" lg="12">
                  <Form.Label className="col-form-label">{f({ id: 'tooling.edit-list' })}</Form.Label>
                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                    style={{ maxHeight: '680px' }}
                  >
                    <FormikProvider value={formik}>
                      <FieldArray
                        name="modifiedList"
                        render={(arrayHelpers) => {
                          return [
                            values.modifiedList?.map((detail, index) => (
                              // eslint-disable-next-line no-underscore-dangle
                              <Col key={detail._id || index}>
                                <ToolingDetailCard
                                  objectiveOptions={objectiveOptions}
                                  formValues={detail}
                                  onChange={handleMaintenanceSave({ arrayHelpers, list: values.modifiedList, index, isReplace: true })}
                                  onDelete={handleMaintenanceDelete({ arrayHelpers, list: values.modifiedList, index })}
                                  validationSchema={maintenanceValidationSchema}
                                  disabled={!isEditMode}
                                  statusOptions={statusOptions}
                                  onRefetchLov={onRefetchLov}
                                  setOnRefetchLov={setOnRefetchLov}
                                />
                              </Col>
                            )),
                            isEditMode && (
                              <Col key="bomList">
                                <ToolingDetailCard
                                  objectiveOptions={objectiveOptions}
                                  onChange={handleMaintenanceSave({
                                    arrayHelpers,
                                    list: values.modifiedList,
                                  })}
                                  validationSchema={maintenanceValidationSchema}
                                  isOpenModal={isOpenAddEditModal}
                                  setIsOpenModal={setIsOpenAddEditModal}
                                  statusOptions={statusOptions}
                                  onRefetchLov={onRefetchLov}
                                  setOnRefetchLov={setOnRefetchLov}
                                />
                              </Col>
                            ),
                            !isEditMode && values?.modifiedList?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                          ];
                        }}
                      />
                    </FormikProvider>
                  </OverlayScrollbarsComponent>
                </Col>
              </Row>

              {isEditMode && (
                <Row className="mb-3">
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

              <Row className="mb-3">
                <Col sm="12" md="6" lg="3">
                  <Form.Label className="col-form-label required">{f({ id: 'tooling.width' })}</Form.Label>
                  <NumberSpinner2 name="width" min="0" value={values.width} onChange={(e) => handleChangeNumber(e, 'width')} disabled={!isEditMode} />
                  {errors.width && touched.width && <div className="d-block invalid-feedback">{f({ id: errors.width })}</div>}
                </Col>
                <Col sm="12" md="6" lg="3">
                  <Form.Label className="col-form-label required">{f({ id: 'tooling.length' })}</Form.Label>
                  <NumberSpinner2 name="length" min="0" value={values.length} onChange={(e) => handleChangeNumber(e, 'length')} disabled={!isEditMode} />
                  {errors.length && touched.length && <div className="d-block invalid-feedback">{f({ id: errors.length })}</div>}
                </Col>
                <Col sm="12" md="6" lg="2">
                  <Form.Label className="col-form-label required">{f({ id: 'tooling.dimensionalUOM' })}</Form.Label>
                  <LovUOMSelect
                    name="dimensionalUOM"
                    // isClearable
                    lov="MATERIAL_BASEUOM"
                    value={values.dimensionalUOM || ''}
                    onChange={handleChangeUnit}
                    isDisabled={!isEditMode}
                    isInvalid={errors.dimensionalUOM && touched.dimensionalUOM}
                  />
                  {errors.dimensionalUOM && touched.dimensionalUOM && <div className="d-block invalid-feedback">{f({ id: errors.dimensionalUOM })}</div>}
                </Col>
                <Col lg="2" md="6" sm="6" >
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
                    onChange={handleChangeCompleteStatus}
                    isInvalid={errors.completeStatus && touched.completeStatus}
                    disabled={!isEditMode || init.completeStatus} // Readonly can't use on this form type
                  />
                  {errors.completeStatus && touched.completeStatus && <div className="d-block invalid-tooltip">{f({ id: errors.completeStatus })}</div>}
                </Col>
                <Col lg="2" md="6" sm="6">
                  <Form.Label className="col-form-label" htmlFor="customerStatus">
                    {f({ id: 'tooling.status' })}
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status ? 'tooling.status.active' : 'tooling.status.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    checked={values.status}
                    onChange={handleChange}
                    isInvalid={errors.status && touched.status}
                    disabled={!isEditMode || !values.completeStatus}
                  />
                  {errors.status && touched.status && <div className="d-block invalid-tooltip">{f({ id: errors.status })}</div>}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col lg="6" md="6" sm="6">
                  <Form.Label className="col-form-label">{f({ id: 'tooling.statusType' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="customerList">
                    {!id ? (
                      <LovStatusTypeSelect
                        classNamePrefix="react-select"
                        // options={statusOptions}
                        isDisabled={!isEditMode}
                        value={values.statusType}
                        required
                        onRefetchLov={onRefetchLov}
                        setOnRefetchLov={setOnRefetchLov}
                        onChange={handleChangeStatusType}
                      />
                    ) : (
                      <>
                        {values.statusType !== undefined && (
                          <Form.Control
                            type="text"
                            name="type"
                            value={`${values.statusType.label}${values.objective !== undefined ? ' (' : ''}${
                              values.objective !== undefined ? values.objective.label || values.objective.value : ''
                            }${values.objective !== undefined ? ')' : ''}`}
                            isInvalid={errors.statusType && touched.statusType}
                            readOnly
                          />
                        )}
                      </>
                    )}
                    {errors.customerList && touched.customerList && <div className="d-block invalid-feedback">{f({ id: errors.customerList })}</div>}
                  </Form.Group>
                </Col>
                <Col lg="6" md="6" sm="6">
                  <Row lg="12" md="12" sm="12">
                    <Col lg="6" md="6" sm="12" className="mt-5" style={{ textAlign: 'center' }}>
                      <Button
                        variant="primary"
                        className="btn-icon btn-icon-start w-100 w-md-auto"
                        onClick={() => setAddModalStatusType(true)}
                        disabled={isLoading || !isEditMode}
                      >
                        <CsLineIcons icon="chart-3" /> <span>{f({ id: 'tooling.manage.statusType' })}</span>
                      </Button>
                    </Col>
                    <Col lg="6" md="6" sm="12" className="mt-5" style={{ textAlign: 'center' }}>
                      <Button
                        variant="primary"
                        className="btn-icon btn-icon-start w-100 w-md-auto"
                        onClick={() => setAddModal(true)}
                        disabled={isLoading || !isEditMode}
                      >
                        <CsLineIcons icon="tool" /> <span>{f({ id: 'tooling.manage.type' })}</span>
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <ConfirmModal
            show={isDeleting}
            loading={isDeletingLoading}
            titleText={f({ id: 'common.warning' })}
            confirmText={f({ id: 'tooling.delete.confirmation' })}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />

          <AddToolingItemModal
            show={addModal}
            onHide={handleOnHideToolingTypeItem}
            list={listTooling}
            onAdd={handleOnAddToolingTypeItem}
            onRemove={handleOnRemoveToolingTypeItem}
            codeResult=""
            abbrResult=""
            nameResult=""
            onSave={handleOnSaveToolingTypeItem}
            errCodeItemModal={errCodeItemModal}
          />
          <AddStatusTypeItemModal
            show={addModalStatusType}
            onHide={handleOnHideToolingTypeItem}
            list={listStatusType}
            onAdd={handleOnAddToolingStatusTypeItem}
            onRemove={handleOnRemoveToolingStatusTypeItem}
            codeResult=""
            abbrResult=""
            nameResult=""
            onSave={handleOnSaveToolingStatusTypeItem}
            errCodeItemModal={errCodeItemModal}
          />
          {/* </Form> */}
          {/* Customer detail End */}
        </Form>
      </Col>
    </>
  );
};

export default InformationForm;
