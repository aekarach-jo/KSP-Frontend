import React from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';

const initialValues = { code: '', name: '', status: true };
const statusOptions = [
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'ACTIVE', label: 'ACTIVE' },
];

const FilterForm = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    console.log(values.status.value);
    let dataResult = {};
    if (values.status.value === undefined) {
      dataResult = {
        code: values.code,
        name: values.name,
      };
    } else {
      dataResult = {
        code: values.code,
        name: values.name,
        status: values.status.value,
      };
    }

    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };
  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;
console.log(values);
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
                    <Form.Label>{f({ id: 'supplier.code' })}</Form.Label>
                    <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'supplier.name' })}</Form.Label>
                    <Form.Control type="text" name="name" onChange={handleChange} value={values.name} />
                  </Col>
                  <Col xs={12} md={2} className="mb-3">
                    <Form.Label>{f({ id: 'company.status' })}</Form.Label>
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
