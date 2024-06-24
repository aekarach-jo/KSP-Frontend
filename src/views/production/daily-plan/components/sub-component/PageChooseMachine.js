/* eslint-disable no-dupe-else-if */
/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useCallback, useEffect, useState } from 'react';
import clx from 'classnames';
import { useIntl } from 'react-intl';
import { useMutation, queryClient } from 'react-query';
import { Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import Select from 'react-select';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import LovCautionListSelect from 'components/lov-select/LovDefectSelectMulti';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovMachineSelect from 'components/lov-select/LovMachineSelect';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';

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

const PageChooseMachine = (props) => {
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [isShowMessage, setShowMessage] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [machineList, setMachineList] = useState(props.machineOptions || []);
  const userLogin = JSON.parse(window.localStorage.getItem('token'));
  const [errDate, setErrDate] = useState(false);
  const [onChangeDateAlertQC, setOnChangeDateAlertQC] = useState(false);
  const { push } = useHistory();
  const { machineOptions, indexKey, valueProduct, step } = props;

  // console.log(props?.step?.value);

  const initialData = {
    product: '',
    assignedBy: '',
    productionOrder: '',
    machine: '',
    productCoatingMethod: [],
    tooling: [],
    planDate: '',
    outsourceStatus: false,
    cuttingStatus: false,
    toolingStatus: false,
    toolingList: [],
    step: props?.step || '',
  };

  const validationSchema = Yup.object().shape({
    // machine: Yup.string().when(`${step.value}`, {
    //   is: (value) => value !== 21 || value !== 27 || value !== 24 || value !== 25 || value !== 211 || value !== 221 || value !== 241 || value !== 251,
    //   then: Yup.string().required('dailyPlan.detail.validation.machine.required'),
    //   otherwise: Yup.string(), // หรือใส่ validation schema ที่ไม่ต้องการการตรวจสอบ
    // }),
    // planDate: Yup.string().required('dailyPlan.detail.validation.planDate.required'),
  });

  const onSubmit = (formData) => {
    if (formData?.planDate === 'Invalid date') {
      formData.planDate = '';
    }
    console.log(formData);
    var remark = [];
    if (formData.remark.length > 0 && formData.remark[0]?.value !== undefined) {
      for (const element of formData.remark) {
        if (element.value) {
          remark.push(element.value);
        }
      }
      formData.remark = remark;
    }

    // if (Object.keys(errors).length === 0) {
    var data = {
      planDate: moment(formData?.planDate).format('YYYY-MM-DD') || '',
      product: valueProduct?.product?.value || formData?.productId,
      productionOrder: valueProduct?.productionOrderNo?.productionOrderId || valueProduct?.productionOrderId,
      machine: formData.machine || '',
      tooling: formData.tooling.length === 0 ? undefined : formData.tooling,
      // toolingList: formData.toolingList,
      step: formData?.step,
      cuttingStatus: formData.cuttingStatus,
      toolingStatus: formData.toolingStatus,
      outsourceStatus: formData.outsourceStatus,
      remark: formData.remark,
    };
    console.log(data);
    if (valueProduct?.id) {
      data.id = valueProduct.id;
    }

    // console.log(data);

    props.handleApplyForm(data, indexKey);
  };
  // };

  const { formatMessage: f } = useIntl();

  var init = '';
  if (!props?.step?.created) {
    init = initialData;
  } else {
    const findStep = valueProduct?.planList?.find((data) => (data?.step?.value || data?.step) === step?.value);
    init = findStep || valueProduct;
  }
  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  useEffect(() => {
    const machine = machineOptions?.find((item) => item?.value === (values?.machine?.value || values?.machine));
    if (machine) {
      handleChange({ target: { id: 'machine', value: machine } });
    }

    const plan = valueProduct?.planList?.find((item) => item?.step?.value === Math.floor(step?.value / 10))?.planDate || '';
    if (plan) {
      handleChange({ target: { id: 'planDate', value: plan } });
      setTimeout(() => {
        handleSubmit();
      }, 10);
      clearTimeout();
    }
    console.log(props.machineOptions);
    let filterMachineByStep = [];

    if (props?.step?.value === 11 || props?.step?.value === 12) {
      setMachineList((prev) => {
        filterMachineByStep = prev?.filter((data) => data.detail.type === 'printing');
        return filterMachineByStep;
      });
    } else if (props?.step?.value === 13 || props?.step?.value === 14 || props?.step?.value === 15) {
      setMachineList((prev) => {
        filterMachineByStep = prev?.filter((data) => data.detail.type === 'coating');
        return filterMachineByStep;
      });
    } else if (props?.step?.value === 16 || props?.step?.value === 17 || props?.step?.value === 18 || props?.step?.value === 19 || props?.step?.value === 20) {
      setMachineList((prev) => {
        filterMachineByStep = prev?.filter((data) => data.detail.type === 'pumping');
        return filterMachineByStep;
      });
    } else if (props?.step?.value === 26) {
      setMachineList((prev) => {
        filterMachineByStep = prev?.filter((data) => data.detail.type === 'rolling');
        return filterMachineByStep;
      });
    } else if (props?.step?.value === 22) {
      setMachineList((prev) => {
        filterMachineByStep = prev?.filter((data) => data.detail.type === 'glueing');
        return filterMachineByStep;
      });
    } else if (props?.step?.value === 25) {
      setMachineList((prev) => {
        filterMachineByStep = prev?.filter((data) => data.detail.type === 'packing');
        return filterMachineByStep;
      });
    } else {
      setMachineList([]);
    }
  }, []);

  useEffect(() => {
    if (props?.step) {
      props.setCurrentStep(props?.step);
      handleChange({ target: { id: 'step', value: props?.step } });
    }
    if (!props.created) {
      props?.onChangeId({ target: { id: 'id', value: undefined } });
    }
  }, [props?.step]);

  const handleDeleteConfirm = () => {
    deleteProductionPlan(props.id);
  };

  const deleteProductionPlan = async (id) => {
    setIsDeletingLoading(true);
    await axios({
      url: `/productionPlan/${id}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./dailyplan');
    setShowModalConfirm(false);
    props.setShowModal(false);
    toast(<ToastDeleteSuccess />);
    // props.refetch();
    // return responseTransformer(resp);
  };

  const handleChangeMachine = (value) => {
    const machine = value || '';
    props?.toolingOptions.forEach((item1) => {
      props?.toolingStatusType.forEach((item2) => {
        if (item1?.detail?.statusType?.code === item2?.code) {
          item1.detail.statusType = item2?.name || '';
        }
      });
    });

    const filterProduct = machine?.detail?.tooling.filter((item) => item.mapProduct.some((s) => s === valueProduct?.product?.value));
    const toolingList = props?.toolingOptions?.filter((item) => filterProduct?.some((item2) => item?.detail?.id === item2?.toolingId));

    let filterToolingType = '';
    if (props?.step?.value === 11 || props?.step?.value === 12) {
      filterToolingType = toolingList.filter((data) => data.detail.type === '01');
    }

    if (props?.step?.value === 13 || props?.step?.value === 14 || props?.step?.value === 15 || props?.step?.value === 28 || props?.step?.value === 29) {
      filterToolingType = toolingList.filter((data) => data.detail.type === '04');
    }
    if (props?.step?.value === 16 || props?.step?.value === 17 || props?.step?.value === 18 || props?.step?.value === 19 || props?.step?.value === 20) {
      filterToolingType = toolingList.filter((data) => data.detail.type === '02');
    }

    handleChange({ target: { id: 'machine', value: machine || '' } });
    handleChange({ target: { id: 'tooling', value: filterToolingType } });
    handleChange({ target: { id: 'toolingList', value: filterToolingType } });
    setTimeout(() => {
      handleSubmit();
    }, 10);
    clearTimeout();
    if (props?.step?.created) {
      setErrDate(false);
      props?.setValiDatePlanData(true);
    }
  };

  const handleChangeCautionList = (e) => {
    const remark = e;
    handleChange({ target: { id: 'remark', value: remark } });
    handleSubmit();
  };

  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  const handleChangeTooling = (e) => {
    handleChange({ target: { id: 'tooling', value: e } });
    handleSubmit();
  };

  useEffect(() => {
    if (!props?.step?.created) {
      handleChange({ target: { id: 'machine', value: '' } });
      handleChange({ target: { id: 'tooling', value: [] } });
      handleChange({ target: { id: 'toolingList', value: [] } });
      handleChange({ target: { id: 'remark', value: [] } });
      props?.setValiDatePlanData(false);
    }
  }, [props?.step]);

  return (
    <>
      <Form key={`indexKey_${indexKey}`} onSubmit={handleSubmit}>
        <>
          <Row className="mb-0 g-3">
            <Col md="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  options={machineList}
                  isDisabled={
                    props.isLoadingData ||
                    props?.step?.value === 15 ||
                    props?.step?.value === 151 ||
                    props?.step?.value === 28 ||
                    props?.step?.value === 281 ||
                    props?.step?.value === 29 ||
                    props?.step?.value === 291
                  }
                  value={values?.machine || ''}
                  onChange={handleChangeMachine}
                  required
                  isClearable
                />
                {errors.machine && <div className="d-block invalid-feedback">{f({ id: errors.machine })}</div>}
              </Form.Group>
            </Col>
            {(props?.step?.value === 11 || props?.step?.value === 12) && (
              <Col md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="code">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.print_fotmat' })}</Form.Label>
                  <Select
                    isMulti
                    classNamePrefix="react-select"
                    isDisabled
                    value={
                      props?.step?.value === 11
                        ? values?.productPrintColor?.map((item) => ({ label: item.color, values: item.color }))
                        : values?.productPrintColorBack?.map((item) => ({ label: item.color, values: item.color }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
            )}
            {(props?.step?.value === 13 || props?.step?.value === 14 || props?.step?.value === 15) && (
              <Col md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="code">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.coating_format' })}</Form.Label>
                  <Select
                    isMulti
                    classNamePrefix="react-select"
                    isDisabled
                    value={
                      (props?.step?.value === 13 && values?.productCoatingMethod?.filter((item, i) => i === 0)) ||
                      (props?.step?.value === 15 && values?.productCoatingMethod?.filter((item, i) => i === 1)) ||
                      (props?.step?.value === 28 && values?.productCoatingMethod?.filter((item, i) => i === 2)) ||
                      (props?.step?.value === 29 && values?.productCoatingMethod?.filter((item, i) => i === 3)) ||
                      []
                    }
                    required
                  />
                </Form.Group>
              </Col>
            )}
            {/* <Col md="3">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.date' })}</Form.Label>
                <DatepickerThaiYear filterTime={new Date()} disabled={props.isLoadingData} onChange={handleChangePlanDate} value={values?.planDate || ''} />
                {errors.planDate && touched.planDate && <div className="d-block invalid-feedback">{f({ id: errors.planDate })}</div>}
                {errDate && <div className="d-block invalid-feedback">{f({ id: 'dailyPlan.detail.validation.planDate.error' })}</div>}
              </Form.Group>
            </Col> */}
          </Row>
          <Row className="mb-0 g-3">
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin-tooling' })}</Form.Label>
                <Select
                  classNamePrefix="react-select"
                  options={values?.toolingList}
                  value={values?.tooling || ''}
                  onChange={handleChangeTooling}
                  isDisabled
                  required
                  isClearable
                  isMulti
                />
                {errors.machine && touched.machine && <div className="d-block invalid-feedback">{f({ id: errors.machine })}</div>}
              </Form.Group>
            </Col>
          </Row>
        </>
        {/* )} */}
        {values?.tooling?.length > 0 && (
          <Row>
            <Col md="12">
              <section className="scroll-section" id="stripedRows">
                <Table striped>
                  <thead>
                    <tr>
                      <th>
                        <Form.Label>ชื่อ tooling</Form.Label>
                      </th>
                      <th>
                        <Form.Label>สถานะ tooling</Form.Label>
                      </th>
                      <th>
                        <Form.Label>สถานะ</Form.Label>
                      </th>
                    </tr>
                  </thead>
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
                </Table>
                {/* </Card> */}
              </section>
            </Col>
          </Row>
        )}
        <Row className="mb-0 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.dispatcher' })}</Form.Label>
              <LovEmployeeSelect isDisabled isClearable value={valueProduct?.assignedBy || userLogin.user.employee.id || ''} />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.operationBy' })}</Form.Label>
              <LovEmployeeSelect isDisabled isClearable value={valueProduct?.operationDoc?.operationBy || ''} />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="12">
            <Row className="mt-2">
              <Col lg="9" md="9" sm="9">
                <Form.Label className="col-form-label">{f({ id: 'operator.field.remark' })}</Form.Label>
              </Col>
              <Col lg="3" md="3" sm="3" style={{ textAlign: 'right' }} hidden={values?.status === 'SUBMITTED'}>
                <CsLineIcons className="text-primary" icon="plus" />
                <a href="#" onClick={toggleManageAddModal}>
                  {f({ id: 'product.field.remark' })}
                </a>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Form.Group className="position-relative tooltip-end-top" controlId="warning">
                  <LovCautionListSelect
                    classNamePrefix="react-select"
                    name="cautionList"
                    isClearable
                    lov="R"
                    onChange={handleChangeCautionList}
                    value={values?.remark || ''}
                    isDisabled={props.isLoadingData}
                    isMulti
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>

      <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />

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

export default PageChooseMachine;
