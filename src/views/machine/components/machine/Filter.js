import React from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Card, Row, Col, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { useFormik } from 'formik';

const initialValues = { code: '', name: '', type: '', customerStatus: '' };
const statusOptions = [
  { value: true, label: 'ACTIVE' },
  { value: false, label: 'INACTIVE' },
];

const Filter = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    let dataResult = {};
    if (values.status.value === undefined) {
      dataResult = {
        code: values.code,
        name: values.name,
        type: values.type,
      };
    } else {
      dataResult = {
        code: values.code,
        name: values.name,
        customerStatus: values.customerStatus.value,
        type: values.type,
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
    handleChange({ target: { id: 'customerStatus', value } });
  };

  return (
    <>
      <Row className="mb-5">
        <Col>
          <Accordion>
            <Accordion.Collapse in={show} eventKey="standardCollapse">
              <Card body>
                <Form onSubmit={handleSubmit}>
                  <Row className="form-row">
                    <Col xs={12} md={6} className="form-col-mt">
                      <Form.Label>{f({ id: 'machine.field.machineCode' })}</Form.Label>
                      <Form.Control type="text" name="code" onChange={handleChange} value={values.code} />
                    </Col>
                    <Col xs={12} md={6} className="form-col-mt">
                      <Form.Label>{f({ id: 'machine.field.machineName' })}</Form.Label>
                      <Form.Control type="text" name="name" onChange={handleChange} value={values.name} />
                    </Col>
                    <Col xs={12} md={6} className="form-col-mt">
                      <Form.Label>{f({ id: 'machine.field.machineType' })}</Form.Label>
                      <Form.Control type="text" name="type" onChange={handleChange} value={values.type} />
                    </Col>
                    <Col xs={12} md={6} className="form-col-mt">
                      <Form.Label>{f({ id: 'machine.field.status' })}</Form.Label>
                      <Select classNamePrefix="react-select" options={statusOptions} value={values.customerStatus} onChange={handleChangeStatus} />
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
