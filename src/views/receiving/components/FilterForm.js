import React from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import DatepickerThaiYearRangeSubmit from 'components/forms/controls/datepicker/DatepickerThaiYearRangeSubmit';

const initialValues = { name: '', materialCode: '', materialName: '', receivingBy: '', receivingDt: '', deliveryBillNo: '', startReceivedAt: '', endReceivedAt: '' };

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
                    <Form.Label>{f({ id: 'receiving.list.materialCode' })}</Form.Label>
                    <Form.Control type="text" name="materialCode" onChange={handleChange} value={values.materialCode || ''} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'receiving.list.materialName' })}</Form.Label>
                    <Form.Control type="text" name="materialName" onChange={handleChange} value={values.materialName || ''} />
                  </Col>
                  {/* <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'receiving.list.code' })}</Form.Label>
                    <Form.Control type="text" name="receivedNo" onChange={handleChange} value={values.receivedNo || ''} />
                  </Col> */}
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'receiving.list.deliveryNo' })}</Form.Label>
                    <Form.Control type="text" name="deliveryBillNo" onChange={handleChange} value={values.deliveryBillNo || ''} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'receiving.list.receivedAt' })}</Form.Label>
                      <DatepickerThaiYearRangeSubmit
                        onChange={(value) => {
                          handleChange({ target: { id: 'startReceivedAt', value: value.dateRange[0] } });
                          handleChange({ target: { id: 'endReceivedAt', value: value.dateRange[1] } });
                        }}
                      />
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
