/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient, ReactQueryConfigProvider } from 'react-query';
import { Col, Form, Row, Button, Modal, Card } from 'react-bootstrap';
import { SERVICE_URL } from 'config';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import * as Yup from 'yup';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import axios from 'axios';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovCautionListSelect from 'components/lov-select/LovDefectSelect';
import './style.css';
import { isEmpty } from 'lodash';

const userLogin = JSON.parse(window.localStorage.getItem('token'));

const OperatorInform2 = (props) => {
  const { formatMessage: f } = useIntl();
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [isShowMessage, setShowMessage] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState([]);
  const [minTime, setMinTime] = useState([]);
  const storedValue = localStorage.getItem('token');
  const token = JSON.parse(storedValue);
  const ResName = token?.user?.employee;

  const chooseOptions = [
    { label: f({ id: 'dailyPlan.field.normal' }), value: true },
    { label: f({ id: 'dailyPlan.field.not-normal' }), value: false },
  ];
  const pumpOptions = [
    { label: 'เส้นไฟเบอร์ เบอร์ 1', value: 'เส้นไฟเบอร์ เบอร์ 1' },
    { label: 'เส้นไฟเบอร์ เบอร์ 2', value: 'เส้นไฟเบอร์ เบอร์ 2' },
  ];
  const updateProductioPlanFn = ({ id, plan }) =>
    axios
      .post(`${SERVICE_URL}/productionPlan/${id}/edit`, plan, {
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
          <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.save.success' })}</span>
        </div>
      </>
    );
  };
  const validationSchema = Yup.object().shape([
    {
      startTime: Yup.string().required('operator.detail.validation.startTime.required'),
      endTime: Yup.string().required('operator.detail.validation.endTime.required'),
    },
  ]);
  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
    // formData.operatedBy = userLogin?.user.employee.id;
    // const problemList = [];
    // const reasonList = [];
    // const remarkList = [];
    // const correctionList = [];
    // if (formData.problemList?.length > 0) {
    //   if (formData.problemList[0]?.value !== undefined) {
    //     formData.problemList?.forEach((element) => {
    //       problemList.push(element.detail.code);
    //     });
    //     formData.problemList = problemList;
    //   } else {
    //     formData.problemList?.forEach((element) => element);
    //   }
    // }
    // if (formData.reasonList?.length > 0) {
    //   if (formData.reasonList[0]?.value !== undefined) {
    //     formData.reasonList?.forEach((element) => {
    //       reasonList.push(element.detail.code);
    //     });
    //     formData.reasonList = reasonList;
    //   } else {
    //     formData.reasonList?.forEach((element) => element);
    //   }
    // }
    // if (formData.remarkList?.length > 0) {
    //   if (formData.remarkList[0]?.value !== undefined) {
    //     formData.remarkList?.forEach((element) => {
    //       remarkList.push(element.detail.code);
    //     });
    //     formData.remarkList = remarkList;
    //   } else {
    //     formData.remarkList?.forEach((element) => element);
    //   }
    // }
    // if (formData.correctionList?.length > 0) {
    //   if (formData.correctionList[0]?.value !== undefined) {
    //     formData.correctionList?.forEach((element) => {
    //       correctionList.push(element.detail.code);
    //     });
    //     formData.correctionList = correctionList;
    //   } else {
    //     formData.correctionList?.forEach((element) => element);
    //   }
    // }
    // var data = {};
    // data = {
    //   currentStep: formData.step,
    //   operationDate: formData.updatedAt,
    //   operatedBy: formData.operatedBy,
    //   settingMachine: {
    //     startTime: formData.startTime,
    //     endTime: formData.endTime,
    //   },
    //   // problem: [
    //   //   {
    //   //     startTime: formData.startListTime,
    //   //     endTime: formData.endListTime,
    //   //     detail: problemList,
    //   //     correction: formData.correction,
    //   //   },
    //   // ],
    //   // defectiveAmount: formData.defectiveAmount,
    // };
    // const { id } = props;
    // // updateProductPlan({ id, plan: data });
    // props.setShowModal(false);
  };
  const { values: initData } = props.formik;
  const formik = useFormik({
    initialValues: {
      settingMachine: props.data?.operationDoc?.settingMachine,
    },
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });
  const { handleSubmit, resetForm, setFieldValue, values, touched, errors } = formik;
  const { mutate: updateProductPlan, isLoading: isSaving } = useMutation(updateProductioPlanFn, {
    onSuccess(data) {
      toast(<ToastCreateSuccess />);
      props.refetch();
      props.onHide();
    },
    onError(err) {
      console.error('update tooling error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const handleChangeValue = (name, data) => {
    props.onHandleChange({ target: { id: `fountainSolution.[${name}]`, value: data } });
  };

  // useEffect(() => {
  // }, []);

  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  let titleContent;
  if (values?.step === 17 || values?.step === 18 || values?.step === 19 || values?.step === 20) {
    // titleContent = props.data?.stepName?.label;
    titleContent = f({ id: 'dailyPlan.field.pumpMethod' });
  } else if (values?.step === 21) {
    titleContent = f({ id: 'dailyPlan.field.detaching' });
  } else if (values?.step === 22 || values?.step === 23 || values?.step === 27) {
    titleContent = f({ id: 'dailyPlan.field.patching' });
  } else if (values?.step === 24) {
    titleContent = f({ id: 'dailyPlan.field.folding' });
  } else if (values?.step === 25) {
    titleContent = f({ id: 'dailyPlan.field.pack' });
  } else if (values?.step === 26) {
    titleContent = f({ id: 'dailyPlan.field.pattern' });
  } else if (values?.step === 16) {
    titleContent = f({ id: 'dailyPlan.field.cuttingSize' });
  }else{
    titleContent = f({ id: 'dailyPlan.field.cuttingSize' });
  }


  return (
    <>
      <Form>
        <Row className="mb-1 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="operator">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.operator' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="operator">
                <Form.Control
                  type="text"
                  disabled
                  name="userName"
                  value={`${userLogin.user?.employee?.firstName || ''}${' '}${userLogin.user?.employee?.lastName || ''}`}
                />
              </Form.Group>
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">{f({ id: 'operator.field.date' })}</Form.Label>
              <DatepickerThaiYear className="form-control" showTimeSelect disabled showTimeSelectOnly placeholderText="" format="DD/MM/YYYY HH:mm" />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-1 g-3">
          <Col md="8">
            <Form.Group className="position-relative tooltip-end-top" controlId="machine">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="machine">
                <Select classNamePrefix="react-select" options={props.machineOption} isDisabled value={values.machine || ''} required />
              </Form.Group>
            </Form.Group>
          </Col>
          <Col md="4">
            <Form.Group className="position-relative tooltip-end-top" controlId="pump_format">
              <Form.Label className="col-form-label">{titleContent}</Form.Label>
              <Form.Control type="text" disabled name="productCoatingMethod" value={props.data.stepName?.label} />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex flex-column justify-content-center align-items-center">
          <p style={{ color: '#000 !important', fontWeight: '600', fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>เวลาตั้งเครื่อง</p>
        </div>
        <Card className={`p-2 ${values.settingMachine?.length > 3 ? 'overflow-card' : ''}`} style={{ position: 'relative', zIndex: '1' }}>
          <FormikProvider value={formik}>
            <FieldArray
              name="settingMachine"
              render={(arrayHelpers) => {
                return [
                  values.settingMachine?.map((detail, index) => {
                    return (
                      <Row key={index}>
                        <Col md="6">
                          <Form.Group className="position-relative tooltip-end-top" controlId="start">
                            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.startMachine' })}</Form.Label>
                            <div className="filled">
                              <DatepickerThaiYearTime
                                className="form-control"
                                formatOnChange="YYYY-MM-DD HH:mm"
                                name={`operationDoc.settingMachine.${index}.startTime`}
                                value={detail?.startTime || ''}
                                disabled
                                filterTime={props.data?.operationDoc?.settingMachine[index - 1]?.endTime}
                                // filterTime={values.operationDoc?.settingMachine[index - 1].endTime}
                                onChange={(e) => {
                                  props.onHandleChange({ target: { id: `operationDoc.settingMachine.${index}.startTime`, value: e } });
                                  props.onHandleChange({ target: { id: `operationDoc.settingMachine.${index}.endTime`, value: e } });
                                }}
                                format="DD/MM/YYYY HH:mm"
                                plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                              />
                              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                <CsLineIcons icon="clock" />
                              </div>
                            </div>
                            {errors.startTime && touched.startTime && <div className="d-block invalid-feedback">{f({ id: errors.startTime })}</div>}
                          </Form.Group>
                        </Col>
                        <Col md="5">
                          <Form.Group className="position-relative tooltip-end-top" controlId="end">
                            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.endMachine' })}</Form.Label>
                            <div className="filled">
                              <DatepickerThaiYearTime
                                className="form-control"
                                formatOnChange="YYYY-MM-DD HH:mm"
                                name={`operationDoc.settingMachine.${index}.endTime`}
                                value={detail?.endTime || ''}
                                disabled
                                onChange={(e) => {
                                  props.onHandleChange({ target: { id: `operationDoc.settingMachine.${index}.endTime`, value: e } });
                                }}
                                filterTime={props.data?.operationDoc?.settingMachine[index]?.startTime}
                                format="DD/MM/YYYY HH:mm"
                                plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                              />
                              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                <CsLineIcons icon="clock" />
                              </div>
                            </div>
                            {errors.endTime && touched.endTime && <div className="d-block invalid-feedback">{f({ id: errors.endTime })}</div>}
                          </Form.Group>
                        </Col>
                        <Col style={{ paddingTop: '35px' }} md="1">
                          <Button
                            className="btn-icon btn-icon-only"
                            variant="outline-danger"
                            hidden={index !== values.settingMachine?.length - 1}
                            onClick={() => {
                              arrayHelpers.remove(index);
                              delete props.data?.operationDoc?.settingMachine[index];
                              props.data.operationDoc.settingMachine = props.data?.operationDoc?.settingMachine.filter((e) => e !== isEmpty);
                            }}
                          >
                            <CsLineIcons icon="bin" />
                          </Button>
                        </Col>
                        <Form.Control.Feedback type="invalid">Please provide Print color</Form.Control.Feedback>
                      </Row>
                    );
                  }),
                  // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                ];
              }}
            />
          </FormikProvider>
        </Card>
        <FormikProvider value={formik}>
          <Row>
            <Col md="5">
              <Form.Group className="position-relative tooltip-end-top" controlId="start">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.startMachine' })}</Form.Label>
                <div className="filled">
                  <DatepickerThaiYearTime
                    className="form-control"
                    formatOnChange="YYYY-MM-DD HH:mm"
                    name="operationDoc.startTime"
                    value={props.data?.operationDoc?.startTime || ''}
                    filterTime={props.data?.operationDoc?.endTime}
                    // filterTime={values.operationDoc?.settingMachine[props.data?.operationDoc?.settingMachine.length - 1].endTime}
                    onChange={(e) => {
                      props.onHandleChange({ target: { id: `operationDoc.startTime`, value: e } });
                      props.onHandleChange({ target: { id: `operationDoc.endTime`, value: e } });
                    }}
                    format="DD/MM/YYYY HH:mm"
                    plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                  />
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <CsLineIcons icon="clock" />
                  </div>
                </div>
                {errors.startTime && touched.startTime && <div className="d-block invalid-feedback">{f({ id: errors.startTime })}</div>}
              </Form.Group>
            </Col>
            <Col md="5">
              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.endMachine' })}</Form.Label>
                <div className="filled">
                  <DatepickerThaiYearTime
                    className="form-control"
                    formatOnChange="YYYY-MM-DD HH:mm"
                    name="operationDoc.endTime"
                    value={props.data?.operationDoc?.endTime || ''}
                    onChange={(e) => {
                      props.onHandleChange({
                        target: { id: 'operationDoc.endTime', value: e },
                      });
                    }}
                    filterTime={props.data?.operationDoc?.startTime}
                    format="DD/MM/YYYY HH:mm"
                    plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                  />
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <CsLineIcons icon="clock" />
                  </div>
                </div>
                {errors.endTime && touched.endTime && <div className="d-block invalid-feedback">{f({ id: errors.endTime })}</div>}
              </Form.Group>
            </Col>
            <Col md="2">
              <FieldArray
                name="settingMachine"
                render={(arrayHelpers) => {
                  return [
                    <div key="addSettingMachine" style={{ paddingTop: '35px' }} className="d-grid gap-2 mb-3">
                      <Button
                        variant="outline-primary"
                        className="btn-icon btn-icon-start mb-1"
                        onClick={() => {
                          arrayHelpers.insert(values.settingMachine?.length, '');
                          props.onHandleChange({
                            target: {
                              id: `operationDoc.settingMachine.${props.data?.operationDoc?.settingMachine?.length}.startTime`,
                              value: props.data?.operationDoc?.startTime,
                            },
                          });
                          props.onHandleChange({
                            target: {
                              id: `operationDoc.settingMachine.${props.data?.operationDoc?.settingMachine?.length}.endTime`,
                              value: props.data?.operationDoc?.endTime,
                            },
                          });
                          props.onHandleChange({
                            target: {
                              id: `operationDoc.startTime`,
                              value: '',
                            },
                          });
                          props.onHandleChange({
                            target: {
                              id: `operationDoc.endTime`,
                              value: '',
                            },
                          });
                        }}
                      >
                        <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                      </Button>
                    </div>,
                  ];
                }}
              />
            </Col>
          </Row>
        </FormikProvider>
        {/* <Col className="d-flex flex-row justify-content-center align-items-center">
        <Col sm="12" md="12" lg="12">
          <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.config' })}</Form.Label>
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
            style={{ maxHeight: '150px' }}
          >
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
                    // !isEditMode && values?.configuration?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                  ];
                }}
              />
            </FormikProvider>
          </OverlayScrollbarsComponent>
          <FormikProvider value={formik}>
            <FieldArray
              name="configuration"
              render={(arrayHelpers) => {
                return [
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
                ];
              }}
            />
          </FormikProvider>
        </Col>
      </Col> */}

        {/* <Row className="d-flex flex-row justify-content-center align-items-center gap-4">
        <Col sm="12" md="12" lg="12">
          <Form.Group className="position-relative tooltip-end-top" controlId="other">
            <Form.Label className="col-form-label">ปัญหาที่ 1</Form.Label>
            <LovCautionListSelect
              name="cautionList"
              isClearable
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'cautionList', value } });
                } else {
                  const cautionList = '';
                  props.onHandleChange({ target: { id: 'cautionList', value: cautionList } });
                }
              }}
              value={values.cautionList || ''}
              isMulti
              valueChange={valueChangeCaution}
              setValueChange={setValueChangeCaution}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="d-flex flex-row justify-content-center align-items-center gap-4">
        <Col sm="12" md="12" lg="12">
          <Form.Group className="position-relative tooltip-end-top" controlId="other">
            <Form.Label className="col-form-label">ปัญหาที่ 2</Form.Label>
            <LovCautionListSelect
              name="cautionList"
              isClearable
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'cautionList', value } });
                } else {
                  const cautionList = '';
                  props.onHandleChange({ target: { id: 'cautionList', value: cautionList } });
                }
              }}
              value={values.cautionList || ''}
              isMulti
              valueChange={valueChangeCaution}
              setValueChange={setValueChangeCaution}
            />
          </Form.Group>
        </Col>
      </Row> */}
        <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />
      </Form>
      {/* <Modal.Footer className="p-2 px-5">
        <Button
          className="w-100"
          variant="warning"
          onClick={() => {
            handleSubmit();
          }}
        >
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer> */}
    </>
  );
};

export default OperatorInform2;
