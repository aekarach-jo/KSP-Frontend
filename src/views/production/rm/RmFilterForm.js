import React from 'react';
import { useIntl } from 'react-intl';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';

const RmFilterForm = (props) => {
  const { formatMessage: f } = useIntl();

  const initialValues = { code: '', name: '', type: '' };

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
          <Form.Label>{f({ id: 'rm.field.code' })}</Form.Label>
          <Form.Control type="text" name="code" onChange={handleChange} value={values.code} autoComplete="off" />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'rm.field.name' })}</Form.Label>
          <Form.Control type="text" name="name" onChange={handleChange} value={values.name} autoComplete="off" />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'rm.field.type' })}</Form.Label>
          <Form.Control type="text" name="type" onChange={handleChange} value={values.phone} autoComplete="off" />
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

export default RmFilterForm;
