import React from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import { useFormik } from 'formik';

const initialValues = { code: '', firstName: '', department: '', status: '' };
const statusOptions = [
  { value: true, label: 'ACTIVE' },
  { value: false, label: 'INACTIVE' },
];

const FilterForm = ({ show, tableInstance }) => {
    const { formatMessage: f } = useIntl();
  
    const { gotoPage , setFilter} = tableInstance;
  
    const onSubmit = (values) => {
      let dataResult = {};
      if (values.status.value === undefined) {
        dataResult = {
          code: values.code,
          firstName: values.firstName,
          lastName: values.lastName,
          department: values.department,
        };
      } else {
        dataResult = {
          code: values.code,
          firstName: values.firstName,
          lastName: values.lastName,
          department: values.department,
          status: values.status.value,
        };
      }
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
  
    const handleChangeStatus = (value) => {
      handleChange({ target: { id: 'status', value } });
    };
  
  return (
    <Row className="mb-5">
      <Col>
        <Accordion>
          <Accordion.Collapse in={show} eventKey="standardCollapse">
            <Card body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={4} className="mb-3">
                    <Form.Label>{f({ id: 'employee.code' })}</Form.Label>
                    <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
                  </Col>
                  <Col xs={12} md={4} className="mb-3">
                    <Form.Label>{f({ id: 'employee.firstName' })}</Form.Label>
                    <Form.Control type="text" name="firstName" onChange={handleChange} value={values.firstName} />
                  </Col>
                  <Col xs={12} md={4} className="mb-3">
                    <Form.Label>{f({ id: 'employee.lastName' })}</Form.Label>
                    <Form.Control type="text" name="lastName" onChange={handleChange} value={values.lastName} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'employee.department' })}</Form.Label>
                    <Form.Control type="text" name="department" onChange={handleChange} value={values.department} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'machine.field.status' })}</Form.Label>
                      <Select classNamePrefix="react-select" options={statusOptions} value={values.status} onChange={handleChangeStatus} />
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
