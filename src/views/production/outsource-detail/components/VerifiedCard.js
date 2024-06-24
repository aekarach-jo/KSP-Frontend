import React, { useEffect, useMemo, useState, useReducer } from 'react';
import { request } from 'utils/axios-utils';
import { Button, Col, Row, Spinner, Form, Card } from 'react-bootstrap';
import moment from 'moment';
import * as Yup from 'yup';
import { useIntl, defineMessages } from 'react-intl';
import { SERVICE_URL } from 'config';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import Select from 'react-select';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';

const VerifiedCard = (props) => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const [verifiedData, setVerifiedData] = useState(undefined);
  const [pageCount, setPageCount] = useState(2);
  const [filter, setFilter] = useState({ page: 0 });
  const [modalVerifyOpen, setVerifyOpen] = useState(false);
  const [resultSelect, setResultSelect] = useState(false);
  // const { push } = useHistory();
  const queryClient = useQueryClient();
  const optionsResult = [
    { value: 'PASS', label: 'ผ่าน' },
    { value: 'NOTPASS', label: 'ไม่ผ่าน' },
    { value: 'NOTSELECT', label: 'ยังไม่เลือก', hidden: true },
  ];
  const validationSchema = Yup.object().shape({
    amount: Yup.string().required('กรุณาระบุจำนวน'),
    height: Yup.string().required('กรุณาระบุความสูง'),
    verifiedBy: Yup.string().required('กรุณาระบุชื่อผู้ตรวจรับ'),
    date: Yup.string().required('กรุณาระบุวันที่รับคืน'),
    result: Yup.object().required('กรุณาเลือกผลลัพ'),
  });
  let initialState = {};
  // if (props.dataVerified !== undefined) {
  initialState = {
    date: props.dataVerified.verifiedList[0].date !== null ? props.dataVerified.verifiedList[0].date : '',
    amount: props.dataVerified.verifiedList[0].amount !== null ? props.dataVerified.verifiedList[0].amount : '',
    height: props.dataVerified.verifiedList[0].height !== undefined ? props.dataVerified.verifiedList[0].height : '',
    verifiedBy: props.dataVerified.verifiedList[0].verifiedBy !== undefined ? props.dataVerified.verifiedList[0].verifiedBy : '',
    result: props.dataVerified.result,
    remark: props.dataVerified.verifiedList !== undefined ? props.dataVerified.verifiedList[0].remark : '',
    status: props.dataVerified.status,
  };
  const updateOutsourceFn = async ({ id, outsource }) =>
    axios
      .post(`${SERVICE_URL}/outsource/${id}/save`, outsource, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        if (outsource?.productionPlanId !== undefined) {
          const defectAmount = outsource.amount - outsource.verifiedList[0]?.amount;
          request({ url: `${SERVICE_URL}/productionPlan/find?productionOrderId=${outsource.productionOrder}` }).then((resP) => {
            // console.log(resP.data.data, outsource?.productionPlanId);
            let filterData = [];
            resP.data.data[0].productSubType.forEach((element1) => {
              element1.machine.forEach((element2) => {
                element2.planDate.forEach((element3) => {
                  element3.filterItem = element3.itemList.filter(
                    (element4) => element4.id === outsource?.productionPlanId || `${outsource?.step}1` === String(element4.step)
                  );
                  if (element3.filterItem.length > 1) {
                    filterData = element3.filterItem;
                  }
                  return element3;
                });
              });
            });
            console.log(filterData);
            filterData.forEach((e) => {
              axios
                .post(
                  `${SERVICE_URL}/productionPlan/${e.id}/edit`,
                  {
                    operationDoc: { defectAmount, actualProducedAmount: outsource.verifiedList[0]?.amount * outsource?.cavity },
                    status: filterData[0].stepDetail?.flagQC ? 'COMPLETED' : 'PENDING',
                  },
                  {
                    headers: {
                      'content-type': 'application/json',
                    },
                  }
                )
                .then((resPSub) => resPSub.data);
            });
            return resP.data;
          });
        }
        return res.data;
      });
  const { mutate: updateOutsource, isLoading: isSaving } = useMutation(updateOutsourceFn, {
    onSuccess(data) {
      props.onRefetch(false);
      props.onRefetch(true);
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('update outsource error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editCompanyData');
    },
  });
  const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
      case 'setEmployee':
        return { ...state, verifiedBy: payload };
      case 'setAmount':
        return { ...state, amount: payload };
      case 'setResult':
        return { ...state, result: payload };
      case 'setRemark':
        return { ...state, remark: payload };
      case 'setDate':
        return { ...state, date: payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  let init = '';
  // if (id === undefined) {
  init = initialState;
  // } else {
  //   init = initResult;
  // }
  const onSubmit = (formData) => {
    const osId = props.outsourceData.id;
    const data = {
      id: osId,
      company: props.outsourceData.company.companyId,
      product: props.outsourceData.productId,
      productionOrder: props.outsourceData.productionOrderId,
      supplier: props.outsourceData.supplierId,
      amount: props.outsourceData.amount,
      step: props.outsourceData.step,
      cavity: props.outsourceData.cavity,
      pallet: props.outsourceData.pallet,
      sendingDate: moment(props.outsourceData.sendingDate).format('YYYY-MM-DD'),
      receivingDate: moment(props.outsourceData.receivingDate).format('YYYY-MM-DD'),
      height: props.outsourceData.height,
      sendingBy: props.outsourceData.sendingBy,
      productionPlanId: props.outsourceData.productionPlanId,
      verifiedList: [
        {
          amount: formData.amount,
          date: formData.date,
          height: formData.height,
          verifiedBy: formData.verifiedBy,
          result: formData.result?.value,
          remark: formData.remark,
        },
      ],
      status: 'COMPLETE',
    };
    // save
    if (!resultSelect) {
      updateOutsource({ id: osId, outsource: data });
    }
  };
  // const { status } = state;
  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;
  useEffect(() => {
    setVerifiedData(state);
    props.setVerifiedData(state);
  }, [state]);
  useEffect(() => {
    if (values.result.value !== 'NOTSELECT') {
      setResultSelect(false);
    } else {
      setResultSelect(true);
    }
  }, [values]);
  const handleSaveVerify = () => {
    if (values.result.value !== 'NOTSELECT') {
      setResultSelect(false);
    } else {
      setResultSelect(true);
    }
    handleSubmit();
    setVerifyOpen(false);
  };
  const handleVerifyOpen = () => {
    setVerifyOpen(true);
  };
  const ToastCreateSuccess = () => {
    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'outsource.save.success' })}</span>
        </div>
      </>
    );
  };
  const handleSelectEmployee = (value) => {
    if (value !== null) {
      const selected = value.value;
      handleChange({ target: { id: 'verifiedBy', value: selected } });
      dispatch({ type: 'setEmployee', payload: selected });
    } else {
      const selected = '';
      handleChange({ target: { id: 'verifiedBy', value: selected } });
      dispatch({ type: 'setEmployee', payload: selected });
    }
  };
  const handleChangeAmount = (event) => {
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      handleChange({ target: { id: 'amount', value: event.target.value } });
    }
  };
  const handleChangeHeight = (event) => {
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      handleChange({ target: { id: 'height', value: event.target.value } });
    }
  };
  const onInputHeight = (event) => {
    const height = event.target.value;
    dispatch({ type: 'setHeight', payload: height });
  };
  const onInputAmount = (event) => {
    const amount = parseInt(event.target.value || 0, 10);
    dispatch({ type: 'setAmount', payload: amount });
  };
  const onInputResult = (event) => {
    const result = event.target.value;
    dispatch({ type: 'setResult', payload: result });
  };
  const onInputRemark = (event) => {
    const remark = event.target.value;
    dispatch({ type: 'setRemark', payload: remark });
  };
  const onSetDate = (e) => {
    if (e === '1970/01/01') {
      handleChange({ target: { id: 'date', value: '' } });
    } else {
      handleChange({ target: { id: 'date', value: e } });
    }
    dispatch({ type: 'setDate', payload: e });
  };
  const onSetResult = (e) => {
    handleChange({ target: { id: 'result', value: e } });
    if (e.value !== 'NOTSELECT') {
      setResultSelect(false);
    }
    dispatch({ type: 'setResult', payload: e.value });
  };
  const confirmRecieveText = () => {
    const text = (
      <>
        <div>ท่านต้องการรับคืนรายการงาน {props.outsourceData.productName}</div> <CsLineIcons icon="arrow-right" /> Lot.{' '}
        {props.outsourceData.productionOrderNo === undefined ? '-' : props.outsourceData.productionOrderNo} จาก {props.outsourceData.supplierName}
      </>
    );
    return text;
  };
  const messages = defineMessages({
    result: {
      id: 'result',
      defaultMessage: 'กรุณาเลือกผลลัพ',
    },
  });
  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Row>
          {props.outsourceData && (
            <ConfirmModal show={modalVerifyOpen} confirmText={confirmRecieveText()} onConfirm={handleSaveVerify} onCancel={() => setVerifyOpen(false)} />
          )}
          <Col xs={1} md={4} className="mb-1">
            <Form.Label>ผู้ตรวจสอบ</Form.Label>
            <div id="selectHide">
              <LovEmployeeSelect
                name="verifiedBy"
                placeholder="กรุณาเลือกชื่อผู้ตรวจสอบ"
                value={values.verifiedBy || ''}
                isDisabled={props.dataVerified.status !== 'CONFIRM'}
                onChange={handleSelectEmployee}
              />
            </div>
            {errors.verifiedBy && touched.verifiedBy && <div className="d-block invalid-feedback">{f({ id: errors.verifiedBy })}</div>}
            {/* <LovCustomerSelect
              name="verifiedBy"
              isClearable
              placeholder="กรุณาเลือกชื่อผู้ตรวจสอบ"
              isDisabled={status !== 'CONFIRM'}
              onChange={handleSelectEmployee}
              value={values.verifiedBy || ''}
            />
            {errors.verifiedBy && touched.verifiedBy && <div className="d-block invalid-feedback">{f({ id: errors.verifiedBy })}</div>} */}
          </Col>
          <Col xs={1} md={2} className="mb-1">
            <Form.Label>จำนวนรับ</Form.Label>
            <Form.Control
              name="amount"
              type="text"
              value={values.amount}
              isInvalid={errors.amount && touched.amount}
              disabled={props.dataVerified.status !== 'CONFIRM'}
              onChange={handleChangeAmount}
              onInput={onInputAmount}
            />
            {errors.amount && touched.amount && <div className="d-block invalid-feedback">{f({ id: errors.amount })}</div>}
          </Col>
          <Col xs={12} md={2} className="mb-1">
            <Form.Label>ความสูง</Form.Label>
            <Form.Control
              name="height"
              type="text"
              value={values.height}
              isInvalid={errors.height && touched.height}
              disabled={props.dataVerified.status !== 'CONFIRM'}
              onChange={handleChangeHeight}
              onInput={onInputHeight}
            />
            {errors.height && touched.height && <div className="d-block invalid-feedback">{f({ id: errors.height })}</div>}
          </Col>
          <Col xs={1} md={2} className="mb-1">
            <Form.Group className="position-relative tooltip-end-top" controlId="date">
              <Form.Label>วันที่รับ</Form.Label>
              <DatepickerThaiYear
                value={values.date}
                onChange={(e) => onSetDate(e)}
                className="form-control"
                disabled={props.dataVerified.status !== 'CONFIRM'}
              />
              {errors.date && touched.date && <div className="d-block invalid-feedback">{f({ id: errors.date })}</div>}
            </Form.Group>
          </Col>
          <Col xs={12} md={2} className="mb-1">
            <Form.Label>ผลตรวจสอบ</Form.Label>
            <Select
              classNamePrefix="react-select"
              name="result"
              options={optionsResult}
              value={values.result}
              isDisabled={props.dataVerified.status !== 'CONFIRM'}
              onChange={onSetResult}
              onInput={onInputResult}
            />
            {resultSelect && <div className="d-block invalid-feedback">{f({ id: messages.result.defaultMessage })}</div>}
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={12} className="mb-3">
            <textarea
              style={{
                width: '100%',
                height: '165px',
                fontSize: '450',
              }}
              className="form-control"
              name="remark"
              type="text"
              placeholder="เหตุผล"
              onChange={handleChange}
              onInput={onInputRemark}
              disabled={props.dataVerified.status !== 'CONFIRM'}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={3} className="mb-3">
            <label className="form-check w-100">
              <input type="checkbox" className="form-check-input" defaultChecked disabled={props.dataVerified.status !== 'CONFIRM'} />
              <span className="form-check-label d-block">{f({ id: 'product.height' })}</span>
            </label>
          </Col>
          <Col xs={12} md={3} className="mb-3">
            <label className="form-check w-100">
              <input type="checkbox" className="form-check-input" defaultChecked disabled={props.dataVerified.status !== 'CONFIRM'} />
              <span className="form-check-label d-block">Add Option</span>
            </label>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={3} className="mb-3">
            <label className="form-check w-100">
              <input type="checkbox" className="form-check-input" defaultChecked disabled={props.dataVerified.status !== 'CONFIRM'} />
              <span className="form-check-label d-block">จำนวน</span>
            </label>
          </Col>
          <Col xs={12} md={3} className="mb-3">
            <label className="form-check w-100">
              <input type="checkbox" className="form-check-input" defaultChecked disabled={props.dataVerified.status !== 'CONFIRM'} />
              <span className="form-check-label d-block">Add Option</span>
            </label>
          </Col>
        </Row>
        <Row>
          <Col className="mb-2"> </Col>
          {/* {props.dataVerified.status === 'CONFIRM' && ( */}
          <Col xs="11" sm="auto" className="align-self-md-center">
            <>
              <Button className="btn-icon" disabled={props.dataVerified.status !== 'CONFIRM'} variant="primary" onClick={handleVerifyOpen}>
                <CsLineIcons /> {f({ id: 'outsource.field.verify' })}
              </Button>
            </>
          </Col>
          {/* )} */}
        </Row>
      </Form>
    </>
  );
};

export default VerifiedCard;
