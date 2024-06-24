/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useCallback } from 'react';
import clx from 'classnames';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient } from 'react-query';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Wizard, Steps, Step, WithWizard } from 'react-albus';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import Select from 'react-select';
import ItemModal from '../ItemModal';

const initialData = {
  product: '',
  machine: '',
  planDate: '',
  productionOrder: '',
  tooling: '',
  cuttingStatus: false,
  toolingStatus: false,
  status: '',
};

const mockData = [
  { name: 'Tooling 1', toolingStatus: '', status: '' },
  { name: 'Tooling 2', toolingStatus: '', status: '' },
  { name: 'Tooling 3', toolingStatus: '', status: '' },
];

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

const ToastDeleteSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.delete.success' })}</span>
      </div>
    </>
  );
};

const PagePumpQC = (props) => {
  const [isEditMode, setEditMode] = useState(!props.id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lotNoOptions, setLotNoOptions] = useState([]);
  const [toolingOption, setTooling] = useState([]);
  const [machineOption, setMachine] = useState([]);
  const [listProductData, setListProductData] = useState();
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [stepList, setStepList] = useState([]);

  const [errCode, setErrorCode] = useState('');

  const { push } = useHistory();

  const getProductPlanFn = (productPlanId) => () =>
    axios
      .get(`${SERVICE_URL}/productionPlan/${productPlanId}`)
      .then((res) => res.data.data)
      .then((data) => {
        data.productName = props.productNameOptions.find((item) => item.value === data.productName);
        data.machineName = props.machineOptions.find((item) => item.value === data.machineName);
        data.productionOrderNo = {
          value: data.productionOrderNo,
          label: data.productionOrderNo,
        };
        data.step = props.productionStepOptions.find((item) => item.detail.code === data.step);
        const toolingList = [];
        data.tooling.forEach((item) => {
          const obj = props.toolingOptions.forEach((v) => {
            if (item === v.detail.id) {
              toolingList.push(v);
            }
          });
        });
        data.tooling = toolingList;
        console.log(data);
        return {
          ...initialData,
          ...data,
        };
      });

  const useProductPlanData = (productPlanId) =>
    useQuery(`editProductPlanData`, getProductPlanFn(productPlanId), {
      enabled: !!productPlanId,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const validationSchema = Yup.object().shape({
    product: Yup.object().required('dailyPlan.detail.validation.product.required'),
    machine: Yup.object().required('dailyPlan.detail.validation.machine.required'),
    tooling: Yup.array().required('dailyPlan.detail.validation.tooling.required'),
    productionOrder: Yup.object().required('dailyPlan.detail.validation.productionOrder.required'),
    planDate: Yup.string().required('dailyPlan.detail.validation.planDate.required'),
  });

  const { data: initResult, isFetching, error } = useProductPlanData(props.id);

  if (error) {
    console.error('error :', error);
  }

  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
  };

  const { formatMessage: f } = useIntl();

  var init = '';
  if (props.id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  const handleDeleteConfirm = () => {
    deleteProductionPlan(props.id);
  };

  const deleteProductionPlan = async (id) => {
    setIsDeletingLoading(true);
    const resp = await axios({
      url: `/productionPlan/${id}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./dailyplan');
    setShowModalConfirm(false);
    props.setShowModal(false);
    toast(<ToastDeleteSuccess />);
    props.refetch();
    // return responseTransformer(resp);
  };

  const { mutate: createProductPlan, isLoading: isAdding } = useMutation(createProductioPlanFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableAdd(false);
      console.debug('create tooling success :', data);
      push('./dailyplan');
      toast(<ToastCreateSuccess />);
      props.refetch();
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

  const { mutate: updateProductPlan, isLoading: isSaving } = useMutation(updateProductioPlanFn, {
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

  const handleOnHideToolingTypeItem = () => {
    setShowModal(false);
  };

  const handleCancelClick = () => {
    resetForm();
    setEditMode(false);
    props.setShowModal(false);
  };

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
    console.log(values);
    if (values.planDate !== '') {
      if (id) {
        // save
        console.log(data);
        setEnableEdit(true);
        updateProductPlan({ id, plan: data });
        props.setShowModal(false);
      } else {
        // create
        console.log(data);
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

  const handleChangeProductName = (data) => {
    setMachine([]);
    const lots = [];
    const product = data;
    let machineList = [];
    setListProductData(data.detail);
    lots.push({
      productionOrderId: data.detail.productionOrderId,
      value: data.detail.productionOrderNo,
      label: data.detail.productionOrderNo,
    });
    const machine = data.detail.productMachineId.forEach((v) => {
      machineList = props.machineOptions.filter((item) => item.detail.id === v);
      machineList.filter((item) => item.length > 0);
    });
    setLotNoOptions(lots);
    setMachine(machineList);
    handleChange({ target: { id: 'product', value: product } });
  };

  const handleChangeProductStep = (data) => {
    const step = data;
    console.log(step);
    handleChange({ target: { id: 'step', value: step } });
  };

  const handleChangeMachine = (value) => {
    setTooling([]);
    values.tooling = [];
    const machine = value;
    const list = [];
    const tooling = machine.detail.tooling.forEach((v) => {
      const a = props.toolingOptions.filter((item) => item.detail.id === v);
      list.push(a[0]);
    });
    console.log(list);
    setTooling(list);
    handleChange({ target: { id: 'machine', value: machine } });
  };

  const handleChangeLotNo = (value) => {
    const productionOrderNo = value;
    console.log(value);
    handleChange({ target: { id: 'productionOrderNo', value: productionOrderNo } });
  };

  const handleChangeTooling = (value) => {
    const tooling = value;
    handleChange({ target: { id: 'tooling', value: tooling } });
  };

  const setListStepData = () => {
    props.callProductionStep();
    setStepList(props.productionStepOptions.map((v) => v.detail));
    setShowModal(true);
  };

  const onSaveStep = async (value) => {
    const data = {
      condition: 'step',
      data: value,
    };
    setShowModal(false);
    await axios.post(`${SERVICE_URL}/productionPlan/lov/productionStep/save`, data, {
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  return (
    <>
      {!isFetching ? (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  options={machineOption}
                  isDisabled={!isEditMode}
                  value={values.machine || values.machineName}
                  onChange={handleChangeMachine}
                  // isInvalid={errors.machine && touched.machine}
                  required
                />
                {errors.machine && touched.machine && <div className="d-block invalid-feedback">{f({ id: errors.machine })}</div>}
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.tooling-detail' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  options={machineOption}
                  isDisabled
                  value={values.machine || values.machineName}
                  onChange={handleChangeMachine}
                  // isInvalid={errors.machine && touched.machine}
                  required
                />
                {errors.machine && touched.machine && <div className="d-block invalid-feedback">{f({ id: errors.machine })}</div>}
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-0 g-3">
            <Col md="9">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.note' })}</Form.Label>
                <Form.Control
                  type="text"
                  as='textArea'
                  name="remark"
                  onChange={handleChange}
                  value={values.remark || ''}
                  isInvalid={errors.remark && touched.remark}
                  // readOnly={!isEditMode}
                />
              </Form.Group>
            </Col>
            {/* {values.status === 'NEW' && ( */}
              <Col md="3" className="d-flex flex-row justify-content-end align-items-end">
                <Form.Group className="position-relative tooltip-end-top">
                  <Button variant="danger" onClick={() => setShowModalConfirm(true)}>
                    {f({ id: 'common.cancel' })} Plan
                  </Button>
                </Form.Group>
              </Col>
            {/* )} */}
          </Row>
        </Form>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {showModal && (
        <ItemModal
          show={showModal}
          onHide={handleOnHideToolingTypeItem}
          setShowModal={setShowModal}
          list={stepList}
          categoryOptions={props.categoryOptions}
          onSave={onSaveStep}
        />
      )}

      {showModalConfirm && (
        <Modal
          contentClassName={clx({ 'overlay-spinner': isDeletingLoading })}
          backdrop={isDeletingLoading ? 'static' : true}
          show={showModalConfirm}
          onHide={() => setShowModalConfirm(false)}
          size="xs"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {f({ id: `dailyPlan.field.remove` })} {f({ id: `dailyPlan.list.title` })}
            </Modal.Title>
          </Modal.Header>
          {/* <Modal.Body className="pt-0"> </Modal.Body> */}
          <Modal.Footer className="p-3 px-5">
            <Button variant="outline-primary" onClick={() => setShowModalConfirm(false)}>
              {f({ id: 'common.cancel' })}
            </Button>
            <Button type="submit" variant="primary" onClick={handleDeleteConfirm}>
              {f({ id: 'common.submit' })}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default PagePumpQC;
