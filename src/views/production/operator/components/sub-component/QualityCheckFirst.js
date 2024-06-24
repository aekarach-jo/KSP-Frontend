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

const createProductioPlanFn = (plan) => axios.post(`${SERVICE_URL}/productionPlan/add`, plan).then((res) => res.data);

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
// const ToastDeleteSuccess = () => {
//   const { formatMessage: f } = useIntl();

//   return (
//     <>
//       <div className="mb-2">
//         <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
//         <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.delete.success' })}</span>
//       </div>
//     </>
//   );
// };

const PageFirst = (props) => {
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

  const validationSchema = Yup.object().shape({
    product: Yup.object().required('dailyPlan.detail.validation.product.required'),
    machine: Yup.object().required('dailyPlan.detail.validation.machine.required'),
    tooling: Yup.array().required('dailyPlan.detail.validation.tooling.required'),
    productionOrder: Yup.object().required('dailyPlan.detail.validation.productionOrder.required'),
    planDate: Yup.string().required('dailyPlan.detail.validation.planDate.required'),
  });

  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
  };

  const { formatMessage: f } = useIntl();

  const formik = useFormik({ initialValues: props?.data, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const { mutate: createProductPlan } = useMutation(createProductioPlanFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableAdd(false);
      console.debug('create tooling success :', data);
      push('./dailyplan');
      toast(<ToastCreateSuccess />);
      props.refetch();
    },
    onError(err) {
      setEnableAdd(false);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const { mutate: updateProductPlan } = useMutation(updateProductioPlanFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableEdit(false);
      console.debug('update tooling success :', data);
      toast(<ToastCreateSuccess />);
      props.refetch();
    },
    onError(err) {
      console.error('update tooling error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const handleSave = () => {
    handleSubmit();
    var toolingList = [];
    if (values.tooling.length > 0) {
      for (const element of values.tooling) {
        if (element.detail.id) {
          toolingList.push(element.detail.id);
        }
      }
      values.tooling = toolingList;
    }

    if (values.productionOrderNo) {
      values.productionOrder = values.productionOrderNo.productionOrderId;
    }
    if (values.machine !== '') {
      values.machine = values.machine.detail.id;
    } else {
      values.machine = '';
    }
    if (values.product) {
      values.product = values.product.detail.productId;
    }
    if (values.step) {
      values.step = values.step.detail.code;
    }

    var data = {
      planDate: values.planDate,
      product: values.product === '' ? values.productName.detail.productId : values.product,
      productionOrder: values.productionOrder === undefined ? values.productName.detail.productionOrderId : values.productionOrder,
      machine: values.machine === '' ? values.machineName.detail.id : values.machine,
      tooling: values.tooling,
      step: values.step,
      cuttingStatus: values.cuttingStatus,
      toolingStatus: values.toolingStatus,
      status: values.status,
      remark: values.remark !== undefined ? values.remark : '',
    };
    const { id } = props;
    if (values.planDate !== '') {
      if (id) {
        // save
        setEnableEdit(true);
        updateProductPlan({ id, plan: data });
        props.setShowModal(false);
      } else {
        // create
        data.status = 'NEW';
        createProductPlan(data);
        props.setShowModal(false);
      }
    }
  };

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
                  options={props.productNameOptions}
                  isDisabled={values.status === 'NEW'}
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
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
              <Select
                classNamePrefix="react-select"
                options={lotNoOptions}
                isDisabled={!values?.product}
                value={values?.productionOrderNo || ''}
                onChange={handleChangeLotNo}
                isInvalid={errors.productionOrderNo && touched.productionOrderNo}
                required
              />
              {errors.productionOrderNo && touched.productionOrderNo && <div className="d-block invalid-feedback">{f({ id: errors.productionOrderNo })}</div>}
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cuttingSheet' })}</Form.Label>
              <Form.Control type="text" name="materialUsedAmount" value={values?.materialUsedAmount || ''} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="materialSize	">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cuttingSize' })}</Form.Label>
              <Form.Control type="text" name="materialSize" value={values?.materialSize || ''} readOnly />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="producedAmount	">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.number' })}</Form.Label>
              <Form.Control type="text" name="producedAmount" value={values?.producedAmount || ''} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
              <Form.Control type="text" name="customerName" onChange={handleChange} value={values?.customerName} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-1 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cutting_status' })}</Form.Label>
              <Form.Control
                type="text"
                name="cuttingStatus"
                value={`${values?.cuttingStatus ? f({ id: 'dailyPlan.field.cutting_status-true' }) : f({ id: 'dailyPlan.field.cutting_status-false' })}`}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.date' })}</Form.Label>
              <DatepickerThaiYear onChange={handleChangePlanDate} value={values?.planDate || ''} disabled />
              {errors.planDate && touched.planDate && <div className="d-block invalid-feedback">{f({ id: errors.planDate })}</div>}
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
              <Select
                classNamePrefix="react-select"
                options={props.machineOption}
                isDisabled={values.status === 'NEW'}
                value={values.machine || ''}
                onChange={handleChangeMachine}
                // isInvalid={errors.machine && touched.machine}
                required
              />
              {errors.machine && touched.machine && <div className="d-block invalid-feedback">{f({ id: errors.machine })}</div>}
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <section className="scroll-section" id="stripedRows">
              <Table striped>
                <thead>
                  <tr>
                    <th>ชื่อ tooling</th>
                    <th>สถานะ tooling</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                {values?.tooling.length > 0 && (
                  <tbody>
                    {values?.tooling?.map((data, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Label type="text" name="name">
                            {data?.detail?.name}
                          </Form.Label>
                        </td>
                        <td>
                          <Form.Label type="text" name="toolingStatus">
                            {data?.detail?.statusType}
                          </Form.Label>
                        </td>
                        <td>
                          <Form.Label type="text" name="status">
                            {data?.detail?.status && <>{f({ id: 'common.active' })}</>}
                          </Form.Label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </Table>
              {/* </Card> */}
            </section>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.print_fotmat' })}</Form.Label>
              <Form.Control
                type="text"
                name="productPrintMethod"
                onChange={handleChange}
                value={listProductData !== undefined ? listProductData.productPrintMethod : values.productPrintMethod}
                readOnly
                // isInvalid={errors.address && touched.address}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.coating_format' })}</Form.Label>
              <Form.Control
                type="text"
                name="productCoatingMethod"
                onChange={handleChange}
                value={listProductData !== undefined ? listProductData.productCoatingMethod : values.productCoatingMethod}
                readOnly
                // isInvalid={errors.address && touched.address}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="code">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.note' })}</Form.Label>
              <Form.Control
                type="text"
                name="remark"
                onChange={handleChange}
                value={values.remark || ''}
                isInvalid={errors.remark && touched.remark}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default PageFirst;
