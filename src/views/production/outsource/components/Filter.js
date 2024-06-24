import React from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Card, Row, Col, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
// import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useFormik } from 'formik';

const initialValues = { productionOrderNo: '' };
const statusOptions = [
  { value: 'NEW', label: 'NEW' },
  { value: 'SUBMITTED', label: 'SUBMITTED' },
  { value: 'CONFIRM', label: 'CONFIRM' },
];
const Filter = ({ show, tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (values) => {
    values.status = values.status.value;
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
      {/* <Row className="mb-1">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control type="text" placeholder="กรอกคำค้นหา" />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
        </Col>
        <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
          <Button variant="primary" className="btn-icon btn-icon-only" onClick={() => toggleFilter(!showFilter)}>
            <CsLineIcons icon="filter" />
          </Button>{' '}
          <Dropdown align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">จำนวนรายการ</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
                10 รายการ
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item href="#">5 รายการ</Dropdown.Item>
              <Dropdown.Item href="#">10 รายการ</Dropdown.Item>
              <Dropdown.Item href="#">20 รายการ</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row> */}

      <Row className="mb-5">
        <Col>
          <Accordion>
            <Accordion.Collapse in={show} eventKey="standardCollapse">
              <Card body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'outsource.field.no' })}</Form.Label>
                      <Form.Control type="text" name="productionOrderNo" onChange={handleChange} value={values.productionOrderNo} />
                    </Col>
                    {/* <Col xs={12} md={6} className="mb-3">
                      <Form.Label>รหัสอ้างอิงลูกค้า</Form.Label>
                      <Form.Control type="text" />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>ชื่อลูกค้า</Form.Label>
                      <Form.Control type="text" />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>วันที่สร้าง</Form.Label>
                      <Form.Control type="text" />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>ผู้สร้างคำสั่งซื้อ</Form.Label>
                      <Form.Control type="text" />
                    </Col> */}
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'customerOrder.field.status' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={statusOptions}
                        value={values.status}
                        onChange={(value) => {
                          handleChange({ target: { id: 'status', value } });
                        }}
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
    </>
  );
};

export default Filter;
