import React from 'react';
import { useIntl } from 'react-intl';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';

// import 'react-datepicker/dist/react-datepicker.css';

const CustomerFilterForm = (props) => {
  const { formatMessage: f } = useIntl();

  const initialValues = { code: '', name: '', phone: '', completeStatus: true };

  const onSubmit = (values) => {
    // console.log('submit form', values);
    props.onSubmit?.(values);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  const onReset = (e) => {
    handleReset(e);
    props.onReset?.();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'customer.field.code' })}</Form.Label>
          <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'customer.field.name' })}</Form.Label>
          <Form.Control type="text" name="name" onChange={handleChange} value={values.name} />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'customer.field.phone' })}</Form.Label>
          <Form.Control type="text" name="phone" onChange={handleChange} value={values.phone} />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'customer.field.complete-status' })}</Form.Label>
          <Form.Check type="switch" className="mt-2" name="completeStatus" onChange={handleChange} checked={values.completeStatus} />
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
  );
};

export default CustomerFilterForm;
