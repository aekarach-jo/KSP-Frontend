import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import Glide from 'components/carousel/Glide';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const initialValues = { code: '', name: '', type: '', status: false };
const statusOptions = [
  { value: true, label: 'ACTIVE' },
  { value: false, label: 'INACTIVE' },
];

const statusTypeOptions = [
  { value: 'RM', label: 'RM' },
  { value: 'RMU', label: 'RMU' },
];

const FilterForm = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    let dataResult = {};
    if (values.status.value === undefined) {
      dataResult = {
        code: values.code,
        name: values.name,
        type: values.type.value,
      };
    } else {
      dataResult = {
        code: values.code,
        name: values.name,
        status: values.status.value,
        type: values.type.value,
      };
    }
console.log(dataResult);
    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  const onReset = (e) => {
    handleReset(e);
    setFilter({ page: 0 });
    gotoPage(0);
  };

  const handleChangeStatus = (name,value) => {
    handleChange({ target: { id: [name], value } });
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
                    <Form.Label>{f({ id: 'rm.field.code' })}</Form.Label>
                    <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'rm.field.name' })}</Form.Label>
                    <Form.Control type="text" name="name" onChange={handleChange} value={values.name} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'rm.field.type' })}</Form.Label>
                    <Select classNamePrefix="react-select" options={statusTypeOptions} value={values.type} onChange={(value) => handleChangeStatus('type', value)} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'rm.field.status' })}</Form.Label>
                    <Select classNamePrefix="react-select" options={statusOptions} value={values.status} onChange={(value) => handleChangeStatus('status', value)} />
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