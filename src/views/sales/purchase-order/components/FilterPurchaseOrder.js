import React, { useState } from 'react';
import { Accordion, Card, Row, Col, Button, Form } from 'react-bootstrap';
// import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import DatepickerThaiYearRange from 'components/forms/controls/datepicker/DatepickerThaiYearRange';

const initialValues = { no: '', type: '', status: 'true' };

const FilterPurchaseOrder = ({ show, isLoading, tableInstance }) => {
  const { formatMessage: f } = useIntl();
  const { setFilter, gotoPage } = tableInstance;
  const [isClear, setIsClear] = useState(false)

  const onSubmit = (values) => {
    console.log(values.status.value);
    let dataResult = {};
    if (values.status.value === undefined) {
      dataResult = {
        no: values.no,
        type: values.type,
      };
    } else {
      dataResult = {
        no: values.no,
        type: values.type,
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
    setFilter({});
    gotoPage(0);
    setIsClear(true);
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

      <Row>
        <Col>
          <Accordion>
            <Accordion.Collapse in={show} eventKey="standardCollapse">
              <Card body className={classNames({ 'overlay-spinner': isLoading })}>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseOrder.field.no' })}</Form.Label>
                      <Form.Control type="text" name="no" onChange={handleChange} value={values.no} />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseOrder.field.dateRange' })}</Form.Label>
                      <DatepickerThaiYearRange
                        tableInstance={tableInstance}
                        // show={showFilter}
                        // toggleFilter={!showFilter}
                        // onReset={onReset}
                        // setOnReset={setOnReset}
                        isClear={isClear}
                        start="startCreatedDate"
                        end="endCreatedDate"
                      />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseOrder.field.type' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={[
                          { value: '01', label: 'สั่งสำรองวัตถุดิบ' },
                          { value: '02', label: 'เรียกวัตถุดิบ' },
                          { value: '03', label: 'สั่งซื้อวัตถุดิบ' },
                          { value: '04', label: 'สั่งซื้อวัสดุอื่นๆ' },
                        ]}
                        value={values.type}
                        onChange={(value) => handleChange({ target: { id: 'type', value } })}
                        placeholder=""
                      />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseOrder.field.status' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={[
                          { value: 'SUBMITTED', label: 'SUBMITTED' },
                          { value: 'NEW', label: 'NEW' },
                          { value: 'CANCELLED', label: 'CANCELLED' },
                        ]}
                        value={values.status}
                        onChange={(value) => handleChange({ target: { id: 'status', value } })}
                        placeholder=""
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

export default FilterPurchaseOrder;
