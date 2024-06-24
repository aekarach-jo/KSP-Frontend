import React from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import ReactDatePicker from 'react-datepicker';
import DatepickerThaiYearRangeSubmit from 'components/forms/controls/datepicker/DatepickerThaiYearRangeSubmit';

const initialValues = { materialCode: '', productName: '', productionOrderNo: '', startDueDate: '', endDueDate: '' };
const FilterForm = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    setFilter({ ...values, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  const onReset = (e) => {
    handleReset(e);
    setFilter({ page: 0 });
    gotoPage(0);
  };

  return (
    <Row className="mb-5">
      <Col>
        <Accordion>
          <Accordion.Collapse in={show} eventKey="standardCollapse">
            <Card body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'cutting.filter.materialCode' })}</Form.Label>
                    <Form.Control type="text" name="materialCode" onChange={handleChange} value={values.materialCode} autoComplete="off" />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'cutting.filter.productName' })}</Form.Label>
                    <Form.Control type="text" name="productName" onChange={handleChange} value={values.productName} autoComplete="off" />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'cutting.filter.lotNo' })}</Form.Label>
                    <Form.Control type="text" name="productionOrderNo" onChange={handleChange} value={values.productionOrderNo} autoComplete="off" />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'salesOrder.field.dateRange' })}</Form.Label>
                    <DatepickerThaiYearRangeSubmit
                      onChange={(value) => {
                        handleChange({ target: { id: 'startDueDate', value: value.dateRange[0] } });
                        handleChange({ target: { id: 'endDueDate', value: value.dateRange[1] } });
                      }}
                    />
                  </Col>
                  <div className="mt-3" style={{ textAlign: 'center' }}>
                    <Button type="submit" variant="primary">
                      {f({ id: 'common.search' })}
                    </Button>{' '}
                    <Button variant="light" onClick={onReset}>
                      {f({ id: 'common.cancel' })}
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
