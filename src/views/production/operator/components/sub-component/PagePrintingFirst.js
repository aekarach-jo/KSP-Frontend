/* eslint-disable no-underscore-dangle */
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
import { useMutation, useQuery, queryClient } from 'react-query';
import { Col, Form, Table, Row } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SERVICE_URL } from 'config';
import axios from 'axios';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import LovCautionListSelect from 'components/lov-select/LovDefectSelectMulti';

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

const PagePrintingFirst = (props) => {
  const [isEditMode, setEditMode] = useState(!props.id);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lotNoOptions, setLotNoOptions] = useState([]);
  const [toolingOption, setTooling] = useState([]);
  const [machineOption, setMachine] = useState([]);
  const [listProductData, setListProductData] = useState();

  const { push } = useHistory();

  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
  };

  const { formatMessage: f } = useIntl();

  // eslint-disable-next-line no-underscore-dangle
  const formik = useFormik({
    initialValues: {
      ...props?.data,
      printColor: props.data.productPrintColor.map((data) => ({ ...data, label: data.color, value: data._id })),
      printColorBack: props.data.productPrintColorBack.map((data) => ({ ...data, label: data.color, value: data._id })),
      coatingColor: props.data.productCoatingMethod.map((data) => ({ label: data.text, value: data.value })),
      productCreasingLine: props.data.productCreasingLine.map((data) => ({ label: data.name, value: data.code })),
    },
    onSubmit,
    enableReinitialize: true,
  });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const handleChangePlanDate = (value) => {
    const planDate = value;
    handleChange({ target: { id: 'planDate', value: planDate } });
  };

  const handleChangeProduct = (data) => {
    const product = data;
    let machineList = [];
    const lots = props.productNameOptions
      .filter((el) => el.detail.productId === data.detail.productId)
      .map((e) => ({
        label: e.detail.productionOrderNo,
        value: e.detail.productionOrderId,
        productionOrderId: data.detail.productionOrderId,
        detail: e.detail,
      }));

    machineList = props.machineOptions.filter((item) => data.detail.productMachineId.some((v) => item.detail.id === v));
    setLotNoOptions(lots);
    handleChange({ target: { id: 'product', value: product } });
    handleChange({ target: { id: 'productionOrderNo', value: '' } });
    handleChange({ target: { id: 'materialUsedAmount', value: '' } });
    handleChange({ target: { id: 'machineOption', value: machineList } });
    handleChange({ target: { id: 'materialSize', value: '' } });
    handleChange({ target: { id: 'producedAmount', value: '' } });
  };

  const handleChangeMachine = (value) => {
    setTooling([]);
    values.tooling = [];
    const machine = value;
    const list = [];
    machine.detail.tooling.forEach((v) => {
      const a = props.toolingOptions.filter((item) => item.detail.id === v);
      list.push(a[0]);
    });
    setTooling(list);
    handleChange({ target: { id: 'machine', value: machine } });
  };

  const handleChangeLotNo = (value) => {
    const productionOrderNo = value;
    handleChange({ target: { id: 'productionOrderNo', value: productionOrderNo } });
  };

  const handleChangeCautionList = (e) => {
    const remark = e;
    handleChange({ target: { id: 'productCautionList', value: remark } });
    handleSubmit();
  };

  return (
    <>
      <Form>
        <Row className="mb-1 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.name' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="product">
                <Select
                  classNamePrefix="react-select"
                  // options={props.productNameOptions}
                  isDisabled
                  value={values?.product || values?.productName}
                  onChange={handleChangeProduct}
                  isInvalid={errors.product && touched.product}
                  required
                />
              </Form.Group>
              {errors.product && touched.product && <div className="d-block invalid-feedback">{f({ id: errors.product })}</div>}
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-1 g-3">
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
              <Form.Control
                type="text"
                name="productionOrderNo"
                value={values?.productionOrderNo || ''}
                onChange={handleChangeLotNo}
                readOnly
              />
              {errors.productionOrderNo && touched.productionOrderNo && <div className="d-block invalid-feedback">{f({ id: errors.productionOrderNo })}</div>}
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cuttingSheet' })}</Form.Label>
              <Form.Control type="text" name="materialUsedAmount" value={values?.productionPrintedAmount || ''} readOnly />
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="materialSize	">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cuttingSize' })}</Form.Label>
              <Form.Control type="text" name="materialSize" value={`${values?.productCuttingSize.width} x ${values?.productCuttingSize.length}` || ''} readOnly />
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="producedAmount	">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.number' })}</Form.Label>
              <Form.Control
                type="text"
                name="producedAmount"
                value={values?.productionAdditionalPrintedAmount * values?.productCavity + values?.productionProducedAmount || ''}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
              <Form.Control type="text" name="customerName" onChange={handleChange} value={values?.customer[0].customerName} readOnly />
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.deliveryDate' })}</Form.Label>
              <DatepickerThaiYear onChange={handleChangePlanDate} value={values?.planDate || ''} disabled />
              {errors.planDate && touched.planDate && <div className="d-block invalid-feedback">{f({ id: errors.planDate })}</div>}
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.planDate' })}</Form.Label>
              <DatepickerThaiYear onChange={handleChangePlanDate} value={values?.planDate || ''} disabled />
              {errors.planDate && touched.planDate && <div className="d-block invalid-feedback">{f({ id: errors.planDate })}</div>}
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-1 g-3">
          <Col md="9">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
              <Select
                classNamePrefix="react-select"
                options={props.machineOption}
                isDisabled
                value={values.machine || ''}
                onChange={handleChangeMachine}
                // isInvalid={errors.machine && touched.machine}
                required
              />
              {errors.machine && touched.machine && <div className="d-block invalid-feedback">{f({ id: errors.machine })}</div>}
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cutting_status' })}</Form.Label>
              <Form.Control
                type="text"
                name="productionCuttingStatus"
                value={`${
                  (values?.productionCuttingStatus === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                  (values?.productionCuttingStatus === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                  (values?.productionCuttingStatus === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                  (values?.productionCuttingStatus === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
                } `}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <section className="scroll-section" id="stripedRows">
              <Table striped>
                <thead>
                  <tr>
                    <th>
                      <Form.Label className="col-form-label"> ชื่อ tooling</Form.Label>
                    </th>
                    <th>
                      <Form.Label className="col-form-label"> สถานะ tooling</Form.Label>
                    </th>
                    <th>
                      <Form.Label className="col-form-label"> สถานะ</Form.Label>
                    </th>
                  </tr>
                </thead>
                {values?.tooling.length > 0 ? (
                  <tbody>
                    {values?.tooling?.map((data, index) => (
                      <tr key={index}>
                        <td style={data?.detail?.status ? {} : { color: '#ed143d', fontWeight: '600' }}>
                          <div type="text" name="name">
                            {data?.detail?.name}
                          </div>
                        </td>
                        <td style={data?.detail?.status ? {} : { color: '#ed143d', fontWeight: '600' }}>
                          <div type="text" name="toolingStatus">
                            {data?.detail?.statusType} {!data?.detail?.status && ` (${data?.detail?.modifiedList[0].objective})`}
                          </div>
                        </td>
                        <td style={data?.detail?.status ? {} : { color: '#ed143d', fontWeight: '600' }}>
                          <div type="text" name="status">
                            {data?.detail?.status && <>{f({ id: 'common.active' })}</>}
                            {!data?.detail?.status && <>{f({ id: 'common.inactive' })}</>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <></>
                )}
              </Table>
              {/* </Card> */}
            </section>
          </Col>
        </Row>
        {props?.data?.step === 11 && (
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.print_fotmat' })}</Form.Label>
                <Select isMulti classNamePrefix="react-select" isDisabled value={values?.printColor || ''} />
              </Form.Group>
            </Col>
          </Row>
        )}
        {props?.data?.step === 12 && (
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.print_fotmat' })}</Form.Label>
                <Select isMulti classNamePrefix="react-select" isDisabled value={values?.printColorBack || ''} />
              </Form.Group>
            </Col>
          </Row>
        )}
        {(props?.data?.step === 13 || props?.data?.step === 14 || props?.data?.step === 15 || props?.data?.step === 28 || props?.data?.step === 29) && (
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.coating_format' })}</Form.Label>
                <Select
                  isMulti
                  classNamePrefix="react-select"
                  isDisabled
                  value={
                    (props?.data?.step === 13 && values?.coatingColor?.filter((item, i) => i === 0)) ||
                    (props?.data?.step === 14 && values?.coatingColor?.filter((item, i) => i === 1)) ||
                    (props?.data?.step === 15 && values?.coatingColor?.filter((item, i) => i === 1)) ||
                    (props?.data?.step === 28 && values?.coatingColor?.filter((item, i) => i === 2)) ||
                    (props?.data?.step === 29 && values?.coatingColor?.filter((item, i) => i === 3))
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        )}
        {(props?.data?.step === 17 || props?.data?.step === 18 || props?.data?.step === 19 || props?.data?.step === 20) && (
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.pumpMethod' })}</Form.Label>
                <Form.Control type="text" name="materialUsedAmount" value={values?.stepName?.label || ''} readOnly />
              </Form.Group>
            </Col>
          </Row>
        )}
        {props?.data?.step === 26 && (
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.creasing-method' })}</Form.Label>
                <Select isMulti classNamePrefix="react-select" isDisabled value={values?.productCreasingLine} />
              </Form.Group>
            </Col>
          </Row>
        )}
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'operator.field.remark' })}</Form.Label>
              <LovCautionListSelect
                classNamePrefix="react-select"
                name="remark"
                isClearable
                lov="R"
                lovValue="id"
                // onChange={handleChangeCautionList}
                value={values?.remark || []}
                isDisabled
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'operator.field.warning' })}</Form.Label>
              <LovCautionListSelect
                classNamePrefix="react-select"
                name="productCautionList"
                isClearable
                lov="W"
                lovValue="code"
                // onChange={handleChangeCautionList}
                value={values?.productCautionList || []}
                isDisabled
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.startDate' })}</Form.Label>
              <DatepickerThaiYear onChange={handleChangePlanDate} value={values?.cuttingAt} disabled />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.endDate' })}</Form.Label>
              <DatepickerThaiYear onChange={handleChangePlanDate} value={' '} disabled />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default PagePrintingFirst;
