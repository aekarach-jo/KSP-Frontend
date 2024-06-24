import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYearConfirmButton';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';

const initialValues = {
  machineName: undefined,
  productName: '',
  productionOrderNo: '',
  planDate: '',
  customerName: '',
  isEmptyMachine: false,
};

const FilterForm = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    let dataResult = {};
    if (values.isEmptyMachine) {
      dataResult = {
        productName: values.productName,
        machineName: '',
        productionOrderNo: values.productionOrderNo,
        customerName: values.customerName,
        planDate: values.planDate,
      };
    } else {
      dataResult = {
        productName: values.productName,
        machineName: values.machineName,
        productionOrderNo: values.productionOrderNo,
        customerName: values.customerName,
        planDate: values.planDate,
      };
    }
    console.log(dataResult);

    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;
  const onReset = (e) => {
    console.log(e);
    handleReset(e);
    setFilter({ page: 0, planDate: moment(new Date()).format('YYYY-MM-DD') });
    handleChange({ target: { id: 'machineName', value: '' } });
    handleChange({ target: { id: 'isEmptyMachine', value: false } });
    gotoPage(0);
  };

  const handleChangeCheck = (value) => {
    handleChange({ target: { id: 'isEmptyMachine', value: value.target.checked } });
  };

  const handleChangePlanDate = (value, a) => {
    console.log(value);
    handleChange({ target: { id: 'planDate', value } });
  };

  return (
    <Row className="mb-5">
      <Col>
        <Accordion>
          <Accordion.Collapse in={show} eventKey="standardCollapse">
            <Card body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={2} className="mb-3">
                    <div className="mb-3 form-floating">
                      <Form.Control
                        type="text"
                        name="machineName"
                        onChange={handleChange}
                        value={values.machineName}
                        autoComplete="off"
                        disabled={values.isEmptyMachine}
                      />
                      <Form.Label>{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-3">
                    <div className="mb-3 form-floating">
                      <Form.Control type="text" name="productName" onChange={handleChange} value={values.productName} autoComplete="off" />
                      <Form.Label>{f({ id: 'dailyPlan.field.product' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={2} className="mb-3">
                    <div className="mb-3 form-floating">
                      <Form.Control type="text" name="productionOrderNo" onChange={handleChange} value={values.productionOrderNo} autoComplete="off" />
                      <Form.Label>{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={2} className="mb-3">
                    <DatepickerThaiYear
                      render={(value, openCalendar) => {
                        return (
                          <div className="mb-3 form-floating">
                            <Form.Control
                              type="text"
                              name="planDate"
                              onChange={handleChange}
                              value={values.planDate}
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
                  <Col xs={12} md={2} className="mb-3">
                    <div className="mb-3 form-floating">
                      <Form.Control type="text" name="customerName" onChange={handleChange} value={values.customerName} autoComplete="off" />
                      <Form.Label>{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
                    </div>
                  </Col>
                  <Col xs={12} md={1} className="mb-3">
                    <Form.Label>{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
                    <Form.Check className="form-check float-end m-1 min-h-0" type="checkbox" onChange={handleChangeCheck} />
                  </Col>
                  <div className="mt-3" style={{ textAlign: 'center' }}>
                    <Button type="submit" variant="primary">
                      {f({ id: 'common.search' })}
                    </Button>{' '}
                    <Button variant="light" onClick={onReset}>
                      {f({ id: 'common.reset' })}
                    </Button>
                  </div>
                </Row>
              </Form>
            </Card>
          </Accordion.Collapse>
        </Accordion>
      </Col>
    </Row>
  );
};

export default FilterForm;
