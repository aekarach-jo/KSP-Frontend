/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

const PagePrintingSecond = (props) => {
  const { formatMessage: f } = useIntl();
  const storageValue = localStorage.getItem('token');
  const token = JSON.parse(storageValue);
  const ResName = token?.user?.employee;
  const { isDisable } = props;

  const chooseOptions = [
    { label: f({ id: 'dailyPlan.field.normal' }), value: true },
    { label: f({ id: 'dailyPlan.field.not-normal' }), value: false },
  ];
  // console.log(props.data);
  const initialData = {
    operator:
      { label: `${ResName?.firstName || ''}${' '}${ResName?.lastName || ''}`, value: `${ResName?.firstName || ''}${' '}${ResName?.lastName || ''}` } || '',
    machine: props?.data?.machine || '',
    date: new Date(props?.data?.updatedPlanDateAt),
    // coating: { label: props.data.productCoatingMethod, value: props.data.productCoatingMethod } || '',
    coating: props.data.productCoatingMethod.map((data) => ({ ...data, label: data.text, value: data.value })),
    // eslint-disable-next-line no-underscore-dangle
    printColor: props.data.productPrintColor.map((data) => ({ ...data, label: data.color, value: data._id })),
    filterStatus: props.data?.operationDoc?.fountainSolution?.filterStatus ? chooseOptions[0] : chooseOptions[1],
    alcoholVolume: props.data?.operationDoc?.fountainSolution?.alcoholVolume || 0,
    ph: props.data?.operationDoc?.fountainSolution?.ph || 0,
    temperature: props.data?.operationDoc?.fountainSolution?.temperature || 0,
    conductivity: props.data?.operationDoc?.fountainSolution?.conductivity || 0,
    correction: props.data?.operationDoc?.correction || '',
    machineStandardList: props.data?.productMachineStandardList || [],
  };

  const validationSchema = Yup.object().shape({
    ph: Yup.number().min(8, 'ค่าต้องมากกว่าหรือเท่ากับ 8').max(15, 'ค่าของต้องน้อยกว่าหรือเท่ากับ 15').notRequired(),
    alcoholVolume: Yup.number().min(10, 'ค่าต้องมากกว่าหรือเท่ากับ 10').max(15, 'ค่าต้องน้อยกว่าหรือเท่ากับ 15').notRequired(),
    temperature: Yup.number().min(4, 'ค่าต้องมากกว่าหรือเท่ากับ 4').max(5, 'ค่าต้องน้อยกว่าหรือเท่ากับ 5').notRequired(),
    conductivity: Yup.number().max(1899, 'ค่าต้องน้อยกว่า 1900').notRequired(),
  });

  const onSubmit = (formData) => {
    props.onChange({ target: { id: `operationDoc.fountainSolution`, value: formData } });
  };

  const formik = useFormik({
    initialValues: initialData,
    validationSchema,
    onSubmit,
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: false,
  });
  const { handleChange, handleSubmit, values, errors, touched } = formik;

  const handleChangeValue = (name, data) => {
    console.log(`${name}`, data);
    handleChange({ target: { id: `${name}`, value: Number(data) } });
  };

  const handleChangeFilterStatusValue = (bool) => {
    handleChange({ target: { id: `filterStatus`, value: bool } });
  };

  const handleChangeCorrectionValue = (e) => {
    handleChange({ target: { id: `correction`, value: e.target.value } });
  };

  useEffect(() => {
    props.onChange({ target: { id: `operationDoc.fountainSolution`, value: values } });
    handleSubmit();
  }, [values]);

  console.log(props.data);
  return (
    <>
      <Form>
        <Row className="mb-1 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="operator">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.operator' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="operator">
                <Select classNamePrefix="react-select" isDisabled value={values?.operator || ''} required />
              </Form.Group>
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="machine">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="machine">
                <Select
                  classNamePrefix="react-select"
                  options={props.machineOption}
                  // isDisabled={props.data.status === 'NEW'}
                  isDisabled
                  value={values.machine || ''}
                  required
                />
              </Form.Group>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="coating_format">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.coating_format' })}</Form.Label>
              {/* <Select classNamePrefix="react-select" isDisabled={props.data.status === 'NEW'} value={values?.coating || ''} required /> */}
              <Select isMulti classNamePrefix="react-select" isDisabled value={values?.coating || ''} required />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">
                {f({ id: 'dailyPlan.field.print-color' })} {`(${values?.printColor.length})`}
              </Form.Label>
              <Select isMulti classNamePrefix="react-select" isDisabled value={values?.printColor || ''} required />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="6">
            <Form.Group className="position-relative tooltip-end-top" controlId="alertText">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.alertText' })}</Form.Label>
              <Select
                classNamePrefix="react-select"
                isDisabled={isDisable || props.data.status === 'NEW'}
                options={chooseOptions}
                value={values.filterStatus}
                onChange={handleChangeFilterStatusValue}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-0 g-3">
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="alcohol">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.alcohol' })}</Form.Label>
              <div className="d-flex flex-row justify-content-start align-items-center gap-3">
                <Form.Control
                  className="w-50"
                  type="number"
                  name="alcoholVolume"
                  value={values.alcoholVolume || ''}
                  onChange={(e) => handleChangeValue('alcoholVolume', e.target.value)}
                  disabled={isDisable || props.data.status === 'NEW'}
                />
                <div className="my-auto">10-15</div>
              </div>
              {errors.alcoholVolume && <div className="d-block invalid-feedback">{f({ id: errors.alcoholVolume })}</div>}
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="ph">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.ph' })}</Form.Label>
              <div className="d-flex flex-row justify-content-start align-items-center gap-3">
                <Form.Control
                  className="w-50"
                  disabled={isDisable || props.data.status === 'NEW'}
                  type="number"
                  name="ph"
                  value={values.ph || ''}
                  onChange={(e) => handleChangeValue('ph', e.target.value)}
                />
                <div className="my-auto">8-15</div>
              </div>
              {errors.ph && <div className="d-block invalid-feedback">{f({ id: errors.ph })}</div>}
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="temp">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.temp' })}</Form.Label>
              <div className="d-flex flex-row justify-content-start align-items-center gap-3">
                <Form.Control
                  className="w-50"
                  type="number"
                  disabled={isDisable || props.data.status === 'NEW'}
                  name="temperature"
                  value={values.temperature || ''}
                  onChange={(e) => handleChangeValue('temperature', e.target.value)}
                />
                <div className="my-auto">4-5</div>
              </div>
              {errors.temperature && <div className="d-block invalid-feedback">{f({ id: errors.temperature })}</div>}
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="conductivity">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.conductivity' })}</Form.Label>
              <div className="d-flex flex-row justify-content-start align-items-center gap-3">
                <Form.Control
                  className="w-50"
                  type="number"
                  disabled={isDisable || props.data.status === 'NEW'}
                  name="conductivity"
                  value={values.conductivity || ''}
                  onChange={(e) => handleChangeValue('conductivity', e.target.value)}
                />
                <div className="my-auto"> {'< 1900'}</div>
              </div>
              {errors.conductivity && <div className="d-block invalid-feedback">{f({ id: errors.conductivity })}</div>}
            </Form.Group>
          </Col>
        </Row>
        {values?.machineStandardList.length > 0 && (
          <Row className="mb-0">
            <Form.Label className="col-form-label">Standard List</Form.Label>
            {values?.machineStandardList.map((data, index) => (
              <Col key={index} md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="conductivity">
                  <Form.Label className="col-form-label">{data.name}</Form.Label>
                  <div className="d-flex flex-row justify-content-start align-items-center gap-3">
                    <Form.Control
                      className="w-50"
                      type="number"
                      disabled
                      value={data.value || ''}
                      // onChange={(e) => handleChangeValue('conductivity', e.target.value)}
                    />
                  </div>
                </Form.Group>
              </Col>
            ))}
          </Row>
        )}
        <Row className="mb-0 g-3">
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="other">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.other' })}</Form.Label>
              <Form.Control
                as="textarea"
                disabled={isDisable || props.data.status === 'NEW'}
                type="text"
                name="other"
                value={values.correction}
                onChange={handleChangeCorrectionValue}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default PagePrintingSecond;
