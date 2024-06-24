import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import Select from 'react-select';

const initialValues = {
  productName: [],
  machineNameList: [],
  toolingStatus: '',
  cuttingStatus: '',
};
const optionsTooling = [
  { value: true, label: 'ใหม่' },
  { value: false, label: 'เก่า' },
];
const optionsPaper = [
  { value: true, label: 'ตัดแล้ว' },
  { value: false, label: 'ยังไม่ได้ตัด' },
];

const FilterForm = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    let dataResult = {};
    let machineSh = [null];
    let productSh = [null];
    productSh =(values.productName);
    machineSh =(values.machineNameList);
    if (values.cuttingStatus.value === undefined && values.toolingStatus.value === undefined) {
      console.log(productSh);
      console.log(machineSh);
      if(productSh.length > 0){
        dataResult = {
          productName: productSh,
        };
      }
      if(machineSh.length > 0){
        dataResult = {
          machineNameList: machineSh,
        };
      }
    } else {
      dataResult = {
        productName: values.productName,
        machineNameList: values.machineNameList,
        cuttingStatus: values.cuttingStatus.value,
        toolingStatus: values.toolingStatus.value,
      };
    }
    console.log(dataResult);
    
    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;
  const onReset = (e) => {
    console.log(e);
    handleReset(e);
    setFilter({ page: 0 });
    gotoPage(0);
  };

  const handleChangetoolingStatus = (value) => {
    handleChange({ target: { id: 'toolingStatus', value } });
  };

  const handleChangePaperStatus = (value) => {
    handleChange({ target: { id: 'cuttingStatus', value } });
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
                    <Form.Label>{f({ id: 'dailyPlan.field.machin' })}</Form.Label>
                    <Form.Control type="text" name="machineNameList" onChange={handleChange} value={values.machineNameList} autoComplete="off" />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'dailyPlan.field.product' })}</Form.Label>
                    <Form.Control type="text" name="productName" onChange={handleChange} value={values.productName} autoComplete="off" />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'dailyPlan.field.tooling' })}</Form.Label>
                    <Select
                      // name="toolingStatus"
                      classNamePrefix="react-select"
                      options={optionsTooling}
                      value={values.toolingStatus}
                      onChange={handleChangetoolingStatus}
                    />
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'dailyPlan.field.paper' })}</Form.Label>
                    <Select
                      // name="cuttingStatus"
                      classNamePrefix="react-select"
                      options={optionsPaper}
                      value={values.cuttingStatus}
                      onChange={handleChangePaperStatus}
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
