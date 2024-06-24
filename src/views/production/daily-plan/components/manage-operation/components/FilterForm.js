import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYearConfirmButton';
import Select from 'react-select';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useProductPlanOptions from 'hooks/useProductPlanOptions';

const initialValues = {
  machineName: undefined,
  productAbbr: '',
  productionOrderNo: '',
  planDate: '',
  step: '',
  customerName: '',
  isEmptyMachine: false,
};

const FilterForm = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();
  const { gotoPage, setData, setFilter, filter } = tableInstance;
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const onSubmit = (values) => {
    console.log(values);
    let dataResult = {};
    if (values.isEmptyMachine) {
      dataResult = {
        productAbbr: values.productAbbr,
        step: values?.step?.value,
        machineName: '',
        productionOrderNo: values.productionOrderNo,
        customerName: values.customerName,
        planDate: values.planDate,
      };
    } else {
      dataResult = {
        productAbbr: values.productAbbr,
        machineName: values.machineName,
        step: values?.step?.value || '',
        productionOrderNo: values.productionOrderNo,
        customerName: values.customerName,
        planDate: values.planDate,
      };
    }
    console.log(dataResult);
    setData([]);
    setFilter({ ...filter, ...dataResult, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;
  const onReset = () => {
    values.productAbbr = undefined;
    values.step = undefined;
    values.machineName = '';
    values.productionOrderNo = undefined;
    values.customerName = undefined;
    values.planDate = undefined;
    values.isEmptyMachine = false;
    handleReset();
    setFilter({ page: 0 });
    gotoPage(0);
  };

  const handleChangeCheck = (value) => {
    handleChange({ target: { id: 'isEmptyMachine', value: value.target.checked } });
  };

  const handleChangePlanDate = (value) => {
    handleChange({ target: { id: 'planDate', value } });
  };

  const handleChangeStep = (value) => {
    handleChange({ target: { id: 'step', value } });
  };

  return (
    <Row className="mb-5">
      <Col>
        <Accordion>
          <Accordion.Collapse in={show} eventKey="standardCollapse">
            <div className="mt-2">
              <Form onSubmit={handleSubmit}>
                <Row className="mt-4">
                  <Col xs={12} md={3} className="mb-2">
                    <div className="mb-3 form-floating">
                      <Form.Control
                        type="text"
                        name="machineName"
                        onChange={handleChange}
                        value={values.machineName || ''}
                        autoComplete="off"
                        disabled={values.isEmptyMachine}
                      />
                      <Form.Label>{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-2">
                    <div className="mb-3 form-floating">
                      <Form.Control type="text" name="productAbbr" onChange={handleChange} value={values.productAbbr || ''} autoComplete="off" />
                      <Form.Label>{f({ id: 'dailyPlan.field.product' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-2">
                    <div className="mb-3 form-floating">
                      <Form.Control type="text" name="productionOrderNo" onChange={handleChange} value={values.productionOrderNo || ''} autoComplete="off" />
                      <Form.Label>{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-2">
                    <DatepickerThaiYear
                      render={(value, openCalendar) => {
                        return (
                          <div className="mb-3 form-floating">
                            <Form.Control
                              type="text"
                              name="planDate"
                              onChange={handleChange}
                              value={values.planDate || ''}
                              autoComplete="off"
                              onClick={openCalendar}
                            />
                            <Form.Label>{f({ id: 'dailyPlan.field.planDate' })}</Form.Label>
                          </div>
                        );
                      }}
                      value={new Date()}
                      onChange={(e) => handleChangePlanDate(e, {})}
                    />
                  </Col>
                  <Col xs={12} md={3} className="mb-2">
                    <div className="mb-3 form-floating">
                      <Form.Control type="text" name="customerName" onChange={handleChange} value={values.customerName || ''} autoComplete="off" />
                      <Form.Label>{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-2 d-flex flex-row justify-content-start align-items-start gap-2">
                    <Form.Label className="w-30">{f({ id: 'dailyPlan.field.step' })}</Form.Label>
                    <Select
                      className="w-70"
                      classNamePrefix="react-select"
                      options={planOptionsList}
                      value={values.step || ''}
                      required
                      onChange={handleChangeStep}
                      isClearable
                    />
                  </Col>
                  <Col xs={12} md={3} className="mb-2 d-flex flex-row justify-content-start align-items-start gap-2">
                    <Form.Label>{f({ id: 'dailyPlan.field.noMachine' })}</Form.Label>
                    <Form.Check
                      className="form-check float-end m-1 min-h-0"
                      type="checkbox"
                      onChange={(e) => handleChangeCheck(e)}
                      // value={values?.isEmptyMachine}
                    />
                  </Col>

                  <div className="mt-0" style={{ textAlign: 'center' }}>
                    <Button type="submit" variant="primary">
                      {f({ id: 'common.search' })}
                    </Button>{' '}
                    <Button variant="light" onClick={onReset}>
                      {f({ id: 'common.reset' })}
                    </Button>
                  </div>
                </Row>
              </Form>
            </div>
          </Accordion.Collapse>
        </Accordion>
      </Col>
    </Row>
  );
};

export default FilterForm;
