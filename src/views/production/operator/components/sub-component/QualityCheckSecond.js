/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient, ReactQueryConfigProvider } from 'react-query';
import { Accordion, Button, Card, Col, Form, Row, Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import classNames from 'classnames';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { SERVICE_URL } from 'config';
import axios from 'axios';
import Glide from 'components/carousel/Glide';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Select from 'react-select';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovCautionListSelect from 'components/lov-select/LovDefectSelect';
import useActualProduction from 'hooks/useActualProduction';

const userLogin = JSON.parse(window.localStorage.getItem('token'));

const resultOptions = [
  { value: 'PASS', label: 'ผ่าน' },
  { value: 'NOTPASS', label: 'ไม่ผ่าน' },
];

const QualityCheckSecond = (props) => {
  const { formatMessage: f } = useIntl();
  const [isShowMessage, setShowMessage] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [minTime, setMinTime] = useState(null);
  const [valueCal, setValueCal] = useState();
  const { useCalculateOperation } = useActualProduction();

  const validationSchema = Yup.object().shape({
    startTime: Yup.string().required('operator.detail.validation.startTime.required'),
    endTime: Yup.string().required('operator.detail.validation.endTime.required'),
    defectiveAmount: Yup.number()
      .max(parseInt(props.data?.materialUsedAmount, 10), 'Defective Amount is exceed')
      .required('operator.detail.validation.defectiveAmount.required'),
    result: Yup.object().required('operator.detail.validation.result.required'),
  });

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
    //   currentStep: props.data?.step,
    //   operationDate: new Date(),
    //   operatedBy: formData.operatedBy,
    //   qualityCheck: {
    //     startTime: formData.startTime,
    //     endTime: formData.endTime,
    //     problem: problemList,
    //     reason: reasonList,
    //     correction: correctionList,
    //     remark: remarkList,
    //     defectiveAmount: formData.defectiveAmount,
    //     result: formData.result?.value,
    //   },
    //   status: 'COMPLETED',
    // };
    // const { id } = props;
    // updateProductPlan({ id, plan: data });
    // props.setShowModal(false);
  };
  let result;
  if (props.data.operationDoc.qualityCheck.result === 'PASS') {
    result = { value: 'PASS', label: 'ผ่าน' };
  } else if (props.data.operationDoc.qualityCheck.result === 'NOTPASS') {
    result = { value: 'NOTPASS', label: 'ไม่ผ่าน' };
  } else {
    result = '';
  }
  const formik = useFormik({
    initialValues: {
      startTime: props.data.operationDoc.qualityCheck.startTime || '',
      endTime: props.data.operationDoc.qualityCheck.endTime || '',
      problemList: props.data.operationDoc.qualityCheck.problem,
      reasonList: props.data.operationDoc.qualityCheck.reason,
      correctionList: props.data.operationDoc.qualityCheck.correction,
      remarkList: props.data.operationDoc.qualityCheck.remark,
      defectiveAmount: props.data.operationDoc.defectAmount,
      result,
      // actualProducedAmount: props.data.operationDoc.actualProducedAmount,
      materialUsedAmount: props.data.actualProducedAmount,
      userName: `${userLogin.user?.employee?.firstName || ''}${' '}${userLogin.user?.employee?.lastName || ''}`,
    },
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  const onChangeDefectAmount = (e) => {
    const val = useCalculateOperation({
      lots: props?.calculateData.data,
      currentStep: props.data.step,
      actual: props?.calculateData.actual,
      actualProducedAmount: props.data?.operationDoc?.actualProducedAmount,
      defect: Number(e.target.value),
    });
    setValueCal(val);
    console.log(val);
    const defectValue = val.d_defect || 0;
    props.onHandleChange({ target: { id: `operationDoc.defectAmount`, value: defectValue } });
  };

  const onChangeActualProducedAmount = (e) => {
    props.onHandleChange({ target: { id: `operationDoc.actualProducedAmount`, value: Number(e.target.value) } });
    const val = useCalculateOperation({
      lots: props?.calculateData.data,
      currentStep: props?.data.step,
      actual: props?.calculateData.actual,
      actualProducedAmount: Number(e.target.value),
    });
    setValueCal(val);
  };

  useEffect(() => {
    if (!props.isFetchingActualProduction) {
      const val = useCalculateOperation({
        lots: props.calculateData.data,
        currentStep: props.data.step,
        actual: props.calculateData.actual,
        actualProducedAmount: props.data?.operationDoc?.actualProducedAmount,
        defect: props.data?.operationDoc?.defectAmount,
      });
      setValueCal(val);
      if (val) {
        props.onHandleChange({ target: { id: `operationDoc.actualProducedAmount`, value: Number(val?.h_previousActualProduceAmount) || 0 } });
      }
    }
  }, [props.isFetchingActualProduction]);
  return (
    <>
      <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />
      <Row className="mb-1">
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="userName">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.operator' })}</Form.Label>
            <Form.Control type="text" disabled name="userName" value={values.userName} />
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'operator.field.date' })}</Form.Label>
            <DatepickerThaiYearTime
              className="form-control"
              showTimeSelect
              disabled
              showTimeSelectOnly
              placeholderText=""
              format="DD/MM/YYYY HH:mm"
              formatOnChange="YYYY-MM-DD HH:mm"
            />
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="start">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.startMachine' })}</Form.Label>
            <div className="filled">
              <DatepickerThaiYearTime
                disabled={props.data?.status === 'NEW'}
                className="form-control"
                name="startTime"
                showTimeSelect
                format="DD/MM/YYYY HH:mm"
                value={values.startTime}
                onChange={(value) => {
                  props.onHandleChange({ target: { id: 'endTime', value } });
                  props.onHandleChange({ target: { id: 'startTime', value } });
                  // Update minTime for the end field based on the selected time in the start field
                  const updatedMinTime = value;
                  setMinTime(updatedMinTime);
                }}
                plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
              />
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <CsLineIcons icon="clock" />
              </div>
            </div>
            {errors.startTime && touched.startTime && <div className="d-block invalid-feedback">{f({ id: errors.startTime })}</div>}
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="end">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.endMachine' })}</Form.Label>
            <div className="filled">
              <DatepickerThaiYearTime
                className="form-control"
                disabled={props.data?.status === 'NEW'}
                showTimeSelect
                name="endTime"
                showTimeSelectOnly
                format="DD/MM/YYYY HH:mm"
                value={values.endTime}
                onChange={(value) => {
                  props.onHandleChange({ target: { id: 'endTime', value } });
                }}
                plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                filterTime={minTime}
              />
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <CsLineIcons icon="clock" />
              </div>
            </div>
            {errors.endTime && touched.endTime && <div className="d-block invalid-feedback">{f({ id: errors.endTime })}</div>}
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="other">
            <Row className="mb-2">
              <Col lg="4" md="4" sm="4" style={{ textAlign: 'left' }}>
                <Form.Label className="col-form-label">{f({ id: 'cutting.detail.defect-description' })}</Form.Label>
              </Col>
            </Row>
            <LovCautionListSelect
              name="reasonList"
              isDisabled={props.data?.status === 'NEW'}
              isClearable
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'reasonList', value } });
                } else {
                  const reasonList = '';
                  props.onHandleChange({ target: { id: 'reasonList', value: reasonList } });
                }
              }}
              value={values.reasonList || ''}
              typeMessage="C"
              isMulti
              valueChange={valueChangeCaution}
              setValueChange={setValueChangeCaution}
            />
            {errors.reasonList && touched.reasonList && <div className="d-block invalid-feedback">{f({ id: errors.cautionList })}</div>}
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="other">
            <Row className="mb-2">
              <Col lg="4" md="4" sm="4" style={{ textAlign: 'left' }}>
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.symptoms' })}</Form.Label>
              </Col>
              <Col lg="8" md="8" sm="8" style={{ textAlign: 'right' }}>
                <CsLineIcons className="text-primary" icon="plus" />
                <a href="#" onClick={toggleManageAddModal}>
                  {f({ id: 'product.message' })}
                </a>
              </Col>
            </Row>
            <LovCautionListSelect
              name="problemList"
              isClearable
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'problemList', value } });
                } else {
                  const problemList = '';
                  props.onHandleChange({ target: { id: 'problemList', value: problemList } });
                }
              }}
              value={values.problemList || ''}
              typeMessage="P"
              isMulti
              isDisabled={props.data?.status === 'NEW'}
              valueChange={valueChangeCaution}
              setValueChange={setValueChangeCaution}
            />
            {errors.problemList && touched.problemList && <div className="d-block invalid-feedback">{f({ id: errors.problemList })}</div>}
          </Form.Group>
        </Col>
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
          className={classNames('', {
            'overlay-spinner': props?.isFetchingActualProduction,
          })}
        >
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.meterAmount' })}</Form.Label>
            <Form.Control type="number" disabled value={valueCal?.h_previousActualProduceAmount} onChange={onChangeActualProducedAmount} />
          </Form.Group>
        </Col>
        <Col
          md="3"
          className={classNames('', {
            'overlay-spinner': props?.isFetchingActualProduction,
          })}
        >
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.wrong' })}</Form.Label>
            <Form.Control
              type="number"
              disabled={props?.isDisable || props?.isFetchingActualProduction || props.data?.status === 'NEW'}
              value={valueCal?.d_defect}
              onChange={onChangeDefectAmount}
            />
          </Form.Group>
        </Col>
        <Col md="5">
          <Form.Group className="position-relative tooltip-end-top" controlId="other">
            <Form.Label className="col-form-label">{f({ id: 'operator.field.correction' })}</Form.Label>
            <LovCautionListSelect
              name="correctionList"
              isDisabled={props.data?.status === 'NEW'}
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'correctionList', value } });
                } else {
                  const correctionList = '';
                  props.onHandleChange({ target: { id: 'correctionList', value: correctionList } });
                }
              }}
              value={values.correctionList || ''}
              typeMessage="S"
              isMulti
              valueChange={valueChangeCaution}
              setValueChange={setValueChangeCaution}
            />
            {errors.correctionList && touched.correctionList && <div className="d-block invalid-feedback">{f({ id: errors.cautionList })}</div>}
          </Form.Group>
        </Col>
        <Col md="5">
          <Form.Group className="position-relative tooltip-end-top" controlId="coating_format">
            <Form.Label className="col-form-label">{f({ id: 'operator.field.remark' })}</Form.Label>
            <LovCautionListSelect
              name="remarkList"
              isClearable
              isDisabled={props.data?.status === 'NEW'}
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'remarkList', value } });
                } else {
                  const remarkList = '';
                  props.onHandleChange({ target: { id: 'remarkList', value: remarkList } });
                }
              }}
              value={values.remarkList || ''}
              typeMessage="R"
              isMulti
              valueChange={valueChangeCaution}
              setValueChange={setValueChangeCaution}
            />
            {errors.remarkList && touched.remarkList && <div className="d-block invalid-feedback">{f({ id: errors.remarkList })}</div>}
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'menu.result' })}</Form.Label>
            <Select
              classNamePrefix="react-select"
              options={resultOptions}
              value={props.data?.result}
              isDisabled={props.data?.status === 'NEW'}
              onChange={(value) => {
                if (value !== null) {
                  props.onHandleChange({ target: { id: 'result', value } });
                } else {
                  props.onHandleChange({ target: { id: 'result', value: '' } });
                }
              }}
            />
            {errors.result && touched.result && <div className="d-block invalid-feedback">{f({ id: errors.result })}</div>}
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default QualityCheckSecond;
