import React, { useEffect, useState } from 'react';
import { Accordion, Card, Row, Col, Button, Form } from 'react-bootstrap';
// import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import DatepickerThaiYearRange from 'components/forms/controls/datepicker/DatepickerThaiYearRange';

const FilterPlan = ({ show, isLoading, tableInstance, filterData, setFilterData }) => {
  const { formatMessage: f } = useIntl();
  const { setFilter, gotoPage } = tableInstance;
  const [isClear, setIsClear] = useState(false);

  const initialValues = {
    productionOrderNo: '',
    productionOrderType: '',
    productionCuttingStatus: '',
    producedProductSize: '',
    productSubTypeName: '',
    productName: '',
  };

  const onSubmit = (values) => {
    let dataResult = {};
    dataResult = {
      productionOrderNo: values?.productionOrderNo,
      productionOrderType: values?.productionOrderType?.value,
      productName: values?.productName,
      productionCuttingStatus: values?.productionCuttingStatus.value,
      producedProductSize: values?.producedProductSize,
      productSubTypeName: values?.productSubTypeName,
    };
    setFilterData({
      productionOrderNo: values?.productionOrderNo,
      productionOrderType: values?.productionOrderType,
      productName: values?.productName,
      productionCuttingStatus: values?.productionCuttingStatus,
      producedProductSize: values?.producedProductSize,
      productSubTypeName: values?.productSubTypeName,
    });
    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };
  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  // useEffect(() => {
  //   if (!isLoading) {
  //     handleChange({ target: { id: 'productionOrderNo', value: filterData.productionOrderNo || '' } });
  //     handleChange({ target: { id: 'productionOrderType', value: filterData.productionOrderType || '' } });
  //     handleChange({ target: { id: 'productionCuttingStatus', value: filterData.productionCuttingStatus || '' } });
  //     handleChange({ target: { id: 'producedProductSize', value: filterData.producedProductSize || '' } });
  //     handleChange({ target: { id: 'productSubTypeName', value: filterData.productSubTypeName || '' } });
  //     handleChange({ target: { id: 'productName', value: filterData.productName || '' } });

  //     let dataResult = {};
  //     dataResult = {
  //       productionOrderNo: filterData?.productionOrderNo,
  //       productionOrderType: filterData?.productionOrderType?.value || filterData?.productionOrderType,
  //       productName: filterData?.productName,
  //       productionCuttingStatus: filterData?.productionCuttingStatus?.value || filterData?.productionCuttingStatus,
  //       producedProductSize: filterData?.producedProductSize,
  //       productSubTypeName: filterData?.productSubTypeName,
  //     };
  //     setFilter({ ...dataResult, page: 0 });
  //     gotoPage(0);
  //   }
  // }, [isLoading]);

  const onReset = (e) => {
    setFilterData({
      productionOrderNo: '',
      productionOrderType: '',
      productionCuttingStatus: '',
      producedProductSize: '',
      productSubTypeName: '',
      productName: '',
    });
    handleReset(e);
    setFilter({});
    gotoPage(0);
    setIsClear(true);
  };

  return (
    <>
      <Row>
        <Col>
          <Accordion>
            <Accordion.Collapse in={show} eventKey="standardCollapse">
              <Card className={classNames({ 'overlay-spinner': isLoading } && 'p-3')}>
                <Form onSubmit={handleSubmit}>
                  <Row className="form-row">
                    <Col xs={12} md={4} className="form-col-mt">
                      <Form.Label>{f({ id: 'dailyPlan.filter.productionOrderNo' })}</Form.Label>
                      <Form.Control type="text" name="productionOrderNo" onChange={handleChange} value={values?.productionOrderNo} />
                    </Col>
                    <Col xs={12} md={4} className="form-col-mt">
                      <Form.Label>{f({ id: 'dailyPlan.filter.product' })}</Form.Label>
                      <Form.Control type="text" name="productName" onChange={handleChange} value={values?.productName} />
                    </Col>

                    <Col xs={12} md={4} className="form-col-mt">
                      <Form.Label>{f({ id: 'dailyPlan.filter.type' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={[
                          { value: 'ITEM', label: 'ITEM' },
                          { value: 'GROUP', label: 'GROUP' },
                        ]}
                        value={values?.productionOrderType}
                        onChange={(value) => handleChange({ target: { id: 'productionOrderType', value } })}
                        placeholder=""
                      />
                    </Col>
                    <Col xs={12} md={4} className="form-col-mt">
                      <Form.Label>{f({ id: 'dailyPlan.filter.producedProductSize' })}</Form.Label>
                      <Form.Control type="text" name="producedProductSize" onChange={handleChange} value={values?.producedProductSize} />
                    </Col>
                    <Col xs={12} md={4} className="form-col-mt">
                      <Form.Label>{f({ id: 'dailyPlan.filter.productionCuttingStatus' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={[
                          { value: 'NEW', label: f({ id: 'dailyPlan.field.cutting_status-new' }) },
                          { value: 'PARTIAL', label: f({ id: 'dailyPlan.field.cutting_status-partial' }) },
                          { value: 'MATCHED', label: f({ id: 'dailyPlan.field.cutting_status-matched' }) },
                          { value: 'COMPLETED', label: f({ id: 'dailyPlan.field.cutting_status-completed' }) },
                        ]}
                        value={values?.type}
                        onChange={(value) => handleChange({ target: { id: 'productionCuttingStatus', value } })}
                        placeholder=""
                      />
                    </Col>
                    <Col xs={12} md={4} className="form-col-mt">
                      <Form.Label>{f({ id: 'dailyPlan.filter.productSubTypeName' })}</Form.Label>
                      <Form.Control type="text" name="productSubTypeName" onChange={handleChange} value={values?.productSubTypeName} />
                    </Col>

                    {/* <Col xs={12} md={6} className="mb-3">
                      <Form.Label>{f({ id: 'purchaseOrder.field.status' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={[
                          { value: 'NOTSTART', label: 'NOTSTART' },
                          { value: 'NEW', label: 'NEW' },
                          { value: 'CANCELLED', label: 'CANCELLED' },
                        ]}
                        value={values?.status}
                        onChange={(value) => handleChange({ target: { id: 'status', value } })}
                        placeholder=""
                      />
                    </Col> */}
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

export default FilterPlan;
