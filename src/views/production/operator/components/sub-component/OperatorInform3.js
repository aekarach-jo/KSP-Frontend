/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient, ReactQueryConfigProvider } from 'react-query';
import { Accordion, Button, Card, Col, Form, Row, Modal } from 'react-bootstrap';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import clx from 'classnames';
import ReactToPrint from 'react-to-print';
import * as Yup from 'yup';
import { SERVICE_URL } from 'config';
import { toast } from 'react-toastify';
import Glide from 'components/carousel/Glide';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Select from 'react-select';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovCautionListSelect from 'components/lov-select/LovDefectSelectOne';
import LovDefectSelectCode from 'components/lov-select/LovDefectSelectCode';
import useActualProduction from 'hooks/useActualProduction';

const userLogin = JSON.parse(window.localStorage.getItem('token'));

const OperatorInform3 = ({
  id,
  isEditMode,
  initResult,
  mockData,
  data: dataList,
  onHide,
  onHandleChange,
  setStickerAmount,
  isDisable,
  calculateData,
  isFetchingActual,
  onAddProblemList,
  recordOption,
  setRecordOption,
}) => {
  const { formatMessage: f } = useIntl();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isShowMessage, setShowMessage] = useState(false);
  const [boxList, setBoxList] = useState([]);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentGlideIndex, setCurrentGlideIndex] = useState(0);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [valueCal, setValueCal] = useState();
  const { useCalculateOperation } = useActualProduction();
  const componentRef = useRef(null);
  const [minTime, setMinTime] = useState('');
  const [selectIndex, setSelectIndex] = useState({ label: `Record ${dataList.operationDoc.problem.length}`, value: dataList.operationDoc.problem.length - 1 });

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
  const handleCancel = () => {
    setIsConfirmModal(false);
  };
  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="info" size="small" onClick={() => setModal(false)} disabled={loading}>
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
    // formData.operatedBy = userLogin?.user.employee.id;

    // const data = formData.operationList.map((box) => {
    //   const problemList = [];
    //   const reasonList = [];
    //   const remarkList = [];
    //   // let correctionList = '';

    //   if (formData.problemList?.length > 0) {
    //     if (formData.problemList[0]?.value !== undefined) {
    //       formData.problemList?.forEach((element) => {
    //         problemList.push(element.detail.code);
    //       });
    //       formData.problemList = problemList;
    //     } else {
    //       formData.problemList?.forEach((element) => element);
    //     }
    //   }
    //   if (formData.reasonList?.length > 0) {
    //     if (formData.reasonList[0]?.value !== undefined) {
    //       formData.reasonList?.forEach((element) => {
    //         reasonList.push(element.detail.code);
    //       });
    //       formData.reasonList = reasonList;
    //     } else {
    //       formData.reasonList?.forEach((element) => element);
    //     }
    //   }
    //   if (formData.remarkList?.length > 0) {
    //     if (formData.remarkList[0]?.value !== undefined) {
    //       formData.remarkList?.forEach((element) => {
    //         remarkList.push(element.detail.code);
    //       });
    //       formData.remarkList = remarkList;
    //     } else {
    //       formData.remarkList?.forEach((element) => element);
    //     }
    //   }
    //   // if (formData.correctionList?.length > 0) {
    //   //   if (formData.correctionList[0]?.value !== undefined) {
    //   //     formData.correctionList?.forEach((element) => {
    //   //       correctionList = element.detail.code;
    //   //     });
    //   //     formData.correctionList = correctionList;
    //   //   } else {
    //   //     formData.correctionList?.forEach((element) => element);
    //   //   }
    //   // }

    //   return {
    //     // id: dataList.operationDoc.problem[selectIndex?.value]?.id,
    //     // operationDate: new Date(),
    //     // operatedBy: formData.operatedBy,
    //     startTime: dataList.operationDoc.problem[selectIndex?.value]?.startTime,
    //     endTime: dataList.operationDoc.problem[selectIndex?.value]?.endTime,
    //     detail: problemList,
    //     correction: formData.correctionList?.value,
    //     // result: dataList.operationDoc.problem[selectIndex?.value]?.result?.value,
    //   };
    // });
    // const result = {
    //   operationList: {
    //     currentStep: dataList.step,
    //     operationDate: new Date(),
    //     operatedBy: formData.operatedBy,
    //     problem: data,
    //     defectAmount: formData.defectAmount,
    //   },
    //   status: 'PENDING',
    // };
    // updateProductPlan({ id, plan: result });
    // Perform the necessary action with the data (e.g., updateProductPlan)
  };
  // const validationSchema = Yup.object().shape({
  //   defectAmount: Yup.number().required(),
  // });
  const formik = useFormik({
    initialValues: {
      defectAmount: dataList?.defectAmount,
      operationList: [
        {
          // id: 1,
          startTime: dataList?.operationDoc?.problem?.startTime || '',
          endTime: dataList?.operationDoc?.problem?.endTime || '',
          problemList: dataList?.operationDoc?.problem?.detail,
          correctionList: dataList?.operationDoc?.problem?.correction,
        },
      ],
      actualProduction: dataList?.actualProduction,
      materialUsedAmount: dataList?.productionProducedAmount,
    },
    // validationSchema,
    onSubmit,
    enableReinitialize: true,
  });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  const { mutate: updateProductPlan, isLoading: isSaving } = useMutation(updateProductioPlanFn, {
    onSuccess(data) {
      toast(<ToastCreateSuccess />);
      onHide();
      // props.refetch();
    },
    onError(err) {
      console.error('update tooling error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });
  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);
  const onChangeActualProducedAmount = (e) => {
    onHandleChange({ target: { id: `operationDoc.actualProducedAmount`, value: Number(e.target.value) } });
    const val = useCalculateOperation({
      lots: calculateData?.data,
      currentStep: dataList?.step,
      actual: calculateData?.actual,
      actualProducedAmount: Number(e.target.value),
    });
    setValueCal(val);
  };

  const onDeleteProblemList = (index) => {
    const arrDetail = dataList.operationDoc.problem.filter((data, i) => i !== index);
    if (dataList.operationDoc.problem.length > 1) {
      onHandleChange({ target: { id: `operationDoc.problem`, value: arrDetail } });
      const addIndex = arrDetail.map((data, index) => {
        return { label: `Record ${index + 1}`, value: index };
      });
      setRecordOption(addIndex);
      setSelectIndex({ label: `Record ${index}`, value: index - 1 });
    }
  };
  const onChangeDefectAmount = (e) => {
    const val = useCalculateOperation({
      lots: calculateData.data,
      currentStep: dataList.step,
      actual: calculateData.actual,
      actualProducedAmount: dataList?.operationDoc?.actualProducedAmount,
      defect: Number(e.target.value),
    });
    setValueCal(val);
    console.log(val);
    const defectValue = val.d_defect || 0;
    onHandleChange({ target: { id: `operationDoc.defectAmount`, value: defectValue } });
  };

  const { useSumActualProduction } = useActualProduction();
  const { data: initData, isFetching } = useSumActualProduction(dataList?.productionOrderNo, dataList?.step);
  useEffect(() => {
    if (!isFetchingActual) {
      const val = useCalculateOperation({
        lots: calculateData?.data,
        currentStep: dataList?.step,
        actual: calculateData?.actual,
        actualProducedAmount: dataList?.actualProducedAmount,
        defect: dataList?.defectAmount,
      });
      setValueCal(val);
    }
  }, [isFetchingActual]);
  useEffect(() => {
    const addIndex = dataList.operationDoc.problem.map((data, index) => {
      return { label: `Record ${index + 1}`, value: index };
    });
    setRecordOption(addIndex);
  }, []);
  console.log(selectIndex);
  return (
    <>
      <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />

      {/* {dataList.operationDoc.problem[selectIndex?.value]?.operationList.length > 0 && (
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
          style={{ maxHeight: '350px' }}
        >
          {dataList.operationDoc.problem[selectIndex?.value]?.operationList?.map((box, selectIndex?.value) => ( */}
      <Card className="mb-4 p-2">
        <div className="d-flex flex-column justify-content-center align-items-center position-relative">
          <p style={{ color: '#000 !important', fontWeight: '600', fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>
            {f({ id: 'dailyPlan.field.title3-5' })}
          </p>
        </div>
        <div className="d-flex flex-row gap-2 m-2 justify-content-end align-items-end">
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="operator">
              <Form.Group className="position-relative tooltip-end-top" controlId="operator">
                <Select classNamePrefix="react-select" options={recordOption} value={selectIndex} onChange={setSelectIndex} required />
              </Form.Group>
            </Form.Group>
          </Col>
          <Button
            className="btn-icon btn-icon-only z-index-1000"
            variant="outline-primary"
            onClick={() => {
              onAddProblemList({ startTime: '', endTime: '', problemList: [], correctionList: [] });
              return setSelectIndex({
                label: `Record ${dataList.operationDoc.problem.length}`,
                value: dataList.operationDoc.problem.length - 1 >= 0 ? dataList.operationDoc.problem.length - 1 : 0,
              });
            }}
          >
            <CsLineIcons icon="plus" />
          </Button>
          <Button
            className="btn-icon btn-icon-only z-index-1000"
            style={{ top: '2rem', right: '0rem' }}
            variant="outline-danger"
            onClick={() => onDeleteProblemList(selectIndex?.value)}
            hidden={selectIndex?.value === 0}
          >
            <CsLineIcons icon="bin" />
          </Button>
        </div>
        <Row className="mb-1">
          <Row className="d-flex flex-row justify-content-center align-items-center mb-1">
            <Col className="form-col-mt" lg="6" md="6" sm="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="start">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
                <div className="filled">
                  <DatepickerThaiYearTime
                    className="form-control"
                    value={dataList.operationDoc.problem[selectIndex?.value]?.startTime}
                    formatOnChange="MM/DD/YYYY HH:mm"
                    onChange={(e) => {
                      onHandleChange({ target: { id: `operationDoc.problem[${selectIndex?.value}].endTime`, value: e } });
                      onHandleChange({ target: { id: `operationDoc.problem[${selectIndex?.value}].startTime`, value: e } });
                      setMinTime(e);
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
            <Col lg="6" md="6" sm="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="other">
                <Row className="mb-1">
                  <Col lg="4" md="4" sm="4" style={{ textAlign: 'left' }}>
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.symptoms' })}</Form.Label>
                  </Col>
                  <Col lg="8" md="8" sm="8" style={{ textAlign: 'right' }}>
                    <CsLineIcons className="text-primary" icon="plus" />
                    <a href="#" onClick={toggleManageAddModal}>
                      {f({ id: 'product.message' })}
                    </a>
                    {/* Additional content for the right column */}
                  </Col>
                </Row>
                <LovDefectSelectCode
                  name="problemList"
                  isClearable
                  onChange={(value) => {
                    if (value !== null) {
                      onHandleChange({ target: { id: `operationDoc.problem[${selectIndex?.value}].detail`, value } });
                    } else {
                      const detail = '';
                      onHandleChange({
                        target: { id: `operationDoc.problem[${selectIndex?.value}].detail`, value: detail },
                      });
                    }
                  }}
                  value={dataList.operationDoc.problem[selectIndex?.value]?.detail || ''}
                  typeMessage="P"
                  isMulti
                  valueChange={valueChangeCaution}
                  setValueChange={setValueChangeCaution}
                />
                {errors.problemList && touched.problemList && <div className="d-block invalid-feedback">{f({ id: errors.problemList })}</div>}
              </Form.Group>
            </Col>
          </Row>
          <Row className="d-flex flex-row justify-content-center align-items-center mb-1">
            <Col lg="6" md="6" sm="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
                <div className="filled">
                  <DatepickerThaiYearTime
                    className="form-control"
                    value={dataList.operationDoc.problem[selectIndex?.value]?.endTime}
                    formatOnChange="MM/DD/YYYY HH:mm"
                    filterTime={minTime}
                    onChange={(e) => {
                      onHandleChange({ target: { id: `operationDoc.problem[${selectIndex?.value}].endTime`, value: e } });
                    }}
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
            <Col lg="6" md="6" sm="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="other">
                <Row className="mb-1">
                  <Col lg="12" md="12" sm="12" style={{ textAlign: 'left' }}>
                    <Form.Label className="col-form-label">{f({ id: 'operator.field.correction' })}</Form.Label>
                  </Col>
                </Row>
                <LovCautionListSelect
                  name="correctionList"
                  onChange={(value) => {
                    if (value !== null) {
                      onHandleChange({ target: { id: `operationDoc.problem[${selectIndex?.value}].correction`, value } });
                    } else {
                      const correction = '';
                      onHandleChange({
                        target: { id: `operationDoc.problem[${selectIndex?.value}].correction`, value: correction },
                      });
                    }
                  }}
                  value={dataList.operationDoc.problem[selectIndex?.value]?.correction || ''}
                  typeMessage="C"
                  // isMulti
                  valueChange={valueChangeCaution}
                  setValueChange={setValueChangeCaution}
                />
                {errors.correctionList && touched.correctionList && <div className="d-block invalid-feedback">{f({ id: errors.cautionList })}</div>}
              </Form.Group>
            </Col>
          </Row>
        </Row>
      </Card>
      {/* ))}
        </OverlayScrollbarsComponent>
      )} */}
      <div className="mb-3">
        <Row className="mb-2">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="coating_format">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.additionalPrintedAmount' })}</Form.Label>
              <Form.Control type="text" value={valueCal?.e_additionalPrintedAmount} disabled />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.sumaryDefect' })}</Form.Label>
              <Form.Control type="text" value={valueCal?.f_sumaryDefect} disabled />
            </Form.Group>
          </Col>
        </Row>
        <Row className=" mb-4">
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="coating_format">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.number-produce' })}</Form.Label>
              <Form.Control type="text" value={valueCal?.a_amountToproduce} disabled />
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.actual' })}</Form.Label>
              <Form.Control type="text" value={valueCal?.b_actualProduction} disabled />
            </Form.Group>
          </Col>
          <Col
            md="3"
            className={clx('', {
              'overlay-spinner': isFetchingActual,
            })}
          >
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">Actual ProducedAmount</Form.Label>
              <Form.Control
                type="number"
                disabled={isDisable || isFetchingActual || dataList?.status === 'NEW'}
                value={valueCal?.c_actualProduceAmount}
                onChange={onChangeActualProducedAmount}
              />
            </Form.Group>
          </Col>
          <Col
            md="3"
            className={clx('', {
              'overlay-spinner': isFetchingActual,
            })}
          >
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.wrong' })}</Form.Label>
              <Form.Control
                type="number"
                disabled={isDisable || isFetchingActual || dataList?.status === 'NEW'}
                value={valueCal?.d_defect}
                onChange={onChangeDefectAmount}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OperatorInform3;
