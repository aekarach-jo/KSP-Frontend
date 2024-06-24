import React from 'react';
import { Accordion, Card, Row, Col, Button, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

const initialValues = { code: '', name: '' };

const FilterPurchaseItem = ({ show, isLoading, tableInstance }) => {
  const { formatMessage: f } = useIntl();
  const { setFilter, gotoPage } = tableInstance;

  const onSubmit = (values) => {
    setFilter(values);
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  const onReset = (e) => {
    handleReset(e);
    setFilter({});
    gotoPage(0);
  };

  return (
    <>
      <Row>
        <Col>
          <Accordion>
            <Accordion.Collapse in={show} eventKey="standardCollapse">
              <Card body className={classNames({ 'overlay-spinner': isLoading })}>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseItem.field.code' })}</Form.Label>
                      <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseItem.field.name' })}</Form.Label>
                      <Form.Control type="text" name="name" onChange={handleChange} value={values.name} />
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

export default FilterPurchaseItem;
