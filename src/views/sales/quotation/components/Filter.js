import React from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Card, Row, Col, Button, Form } from 'react-bootstrap';
// import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useFormik } from 'formik';

const initialValues = { code: '', status: '' };

const Filter = ({ show, tableInstance }) => {
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
    <>
      <Row className="mb-5">
        <Col>
          <Accordion>
            <Accordion.Collapse in={show} eventKey="standardCollapse">
              <Card body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'salesOrder.field.no' })}</Form.Label>
                      <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'salesOrder.field.status' })}</Form.Label>
                      <Form.Control type="text" name="status" onChange={handleChange} value={values.status} />
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
    </>
  );
};

export default Filter;
