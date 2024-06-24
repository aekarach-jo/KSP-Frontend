import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import Select from 'react-select';

const DailyFilterForm = (props) => {
  const { formatMessage: f } = useIntl();

  const initialValues = { code: '', name: '', machin: '', product: '' };
  const [toolingValue, setToolingValue] = useState();
  const [paperValue, setPaperValue] = useState();

  const optionsTooling = [
    { value: 'เก่า', label: 'เก่า' },
    { value: 'ใหม่', label: 'ใหม่' },
  ];
  const optionsPaper = [
    { value: 'ตัดแล้ว', label: 'ตัดแล้ว' },
    { value: 'ยังไม่ได้ตัด', label: 'ยังไม่ได้ตัด' },
  ];

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
          <Form.Label>{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
          <Form.Control type="text" name="machin" onChange={handleChange} value={values.machin} autoComplete="off" />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'dailyPlan.field.product' })}</Form.Label>
          <Form.Control type="text" name="product" onChange={handleChange} value={values.product} autoComplete="off" />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'dailyPlan.field.tooling' })}</Form.Label>
          <Select classNamePrefix="react-select" options={optionsTooling} value={toolingValue} onChange={setToolingValue} placeholder="" />
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Form.Label>{f({ id: 'dailyPlan.field.paper' })}</Form.Label>
          <Select classNamePrefix="react-select" options={optionsPaper} value={paperValue} onChange={setPaperValue} placeholder="" />
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

export default DailyFilterForm;
