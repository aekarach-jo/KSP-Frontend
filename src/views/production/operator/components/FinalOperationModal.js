import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import clx from 'classnames';
import { request } from 'utils/axios-utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NumberFormat from 'react-number-format';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import Select from 'react-select';
import LovStoreLocationSelect from 'components/lov-select/LovStoreLocationSelect';
import LovMaterialSelect from 'components/lov-select/LovMaterialSelect';
import LovProductListSelect from 'components/lov-select/LovProductListSelect';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import moment from 'moment';
import { useUpdateStatusReceiving } from '../../../receiving/components/FormMutation';
import LovStoreSelectSales from './LovStoreSelectSales';

const optionsSelect = [
  // { value: 'materialSelect', label: 'วัสดุ' },
  { value: 'productSelect', label: 'ผลิตภัณฑ์' },
];

const FinalOperationModal = ({ isReceiving, show, onHide, onAdd, data, inventoryReceiving, productPlanQuery }) => {
  const { formatMessage: f, locale } = useIntl();
  const [checkLimit, setCheckLimit] = useState(false);
  const [optionStatus, setOptionStatus] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [minTime, setMinTime] = useState(null);
  const [amountKspError, setAmountKspError] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  // const [amountSaleError, setAmountSaleError] = useState(false);
  const afterAddItem = () => {
    setReceiveModal(false);
  };
  const { mutate: updateStatusReceivingItem } = useUpdateStatusReceiving();

  const validationSchema = Yup.object().shape({
    // product: Yup.string().required(),
    storeLocationSupplier: Yup.string().required(),
    // batchNo: Yup.string().required(),
    storeLocationSale: Yup.string().required(),
    amountSupplier: Yup.string().required(),
    amountSale: Yup.string().required(),
    mfgDt: Yup.string().required(),
    expDt: Yup.string().required(),
    receivingPrice: Yup.string().required(),
  });
  const callAddReceivingItemInventory = async (e = {}) => {
    const res = await request({ url: `/receiving/addItemManual`, data: e, method: 'post' });
    return res.data;
  };
  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const submitValues = {};
      const expDt = values.expDt.split('/');
      const mfgDt = values.mfgDt.split('/');
      const { storeLocationSale, storeLocationSupplier, amountSale, amountSupplier } = values;
      values.expDt = `${expDt[0]}/${expDt[1]}/${Number(expDt[2])}`;
      values.mfgDt = `${mfgDt[0]}/${mfgDt[1]}/${Number(mfgDt[2])}`;
      values.amount = parseFloat(amountSale);
      delete values.storeLocationSale;
      delete values.storeLocationSupplier;
      delete values.amountSale;
      delete values.amountSupplier;

      values.storeLocation = storeLocationSale;
      values.type = 'PRODUCT';
      Object.keys(values).forEach((key) => {
        let value = values[key];
        if (value instanceof Date) {
          value = format(value, 'yyyy/MM/dd');
        }
        submitValues[key] = value;
      });

      let objType = {
        supplier: data.purchaseOrderSupplier,
        POType: data?.purchaseOrderType,
      };

      // First addReceivingItem call
      await callAddReceivingItemInventory({ ...submitValues, purchaseOrderDetail: data?.purchaseOrderDetailId, ...objType });

      // Reset values for the second call
      values.genPIFlag = true;
      values.amount = parseFloat(amountSupplier);
      values.type = 'PRODUCT';
      values.storeLocation = storeLocationSupplier;

      Object.keys(values).forEach((key) => {
        let value = values[key];
        if (value instanceof Date) {
          value = format(value, 'yyyy/MM/dd');
        }
        submitValues[key] = value;
      });

      objType = {
        supplier: data.purchaseOrderSupplier,
        POType: data?.purchaseOrderType,
      };

      // Second callAddReceivingItemInventory call
      await callAddReceivingItemInventory({ ...submitValues, purchaseOrderDetail: data?.purchaseOrderDetailId, ...objType });

      const tempData = { productionOrder: data?.productionOrderId, receivedStatus: true };

      // Update status after both API calls are completed
      await updateStatusReceivingItem(tempData);

      onHide();
      productPlanQuery.refetch();
      setSubmitting(false);
    } catch (error) {
      console.error('Error adding receiving item:', error);
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { storeLocationSupplier: '', storeLocationSale: '', amountSupplier: '', amountSale: '', mfgDt: '', expDt: '', price: '' },
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  });
  const { handleChange, handleSubmit, resetForm, values, errors } = formik;

  useEffect(() => {
    resetForm();
  }, [show, resetForm]);
  // useEffect(() => {
  //   listData?.forEach((element2) => {
  //     if (data.materialId === element2.materialId && element2.materialId !== undefined) {
  //       data.batchNo = element2.detail.batchNo;
  //     }
  //   });
  // }, [show]);
  useEffect(() => {
    if (Number(values?.amount) > Number(data?.availableAmount) && !inventoryReceiving) {
      setCheckLimit(true);
    } else {
      setCheckLimit(false);
    }
  }, [values]);
  useEffect(() => {
    handleChange({ target: { id: 'type', value: { value: 'productSelect', label: 'ผลิตภัณฑ์' } } });
    handleChange({ target: { id: 'product', value: data?.productId } });
    handleChange({ target: { id: 'batchNo', value: data?.productionOrderNo } });
  }, [show, data]);
  // useEffect(() => {
  //   handleChange({ target: { id: 'batchNo', value: optionList } });
  // }, [optionList]);
  return (
    <Modal show={show} className={clx(['fade'])} size="xl" onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: 'operator.finalOperation' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* <Card
          className={clx({
            'mb-2': true,
            'overlay-spinner': isReceiving,
          })}
        > */}
        <div>
          <Form onSubmit={handleSubmit}>
            <Row>
              <>
                <Col xs={4} md={4} className="mt-3">
                  <Form.Label>{f({ id: 'receiving.list.type' })}</Form.Label>
                  <Select
                    // isDisabled={!isEditMode}
                    classNamePrefix="react-select"
                    options={optionsSelect}
                    // isMulti
                    value={values.type}
                    isDisabled
                    // onChange={(value) => {
                    //   resetForm();
                    //   if (value !== null) {
                    //     setOptionStatus(value.value);
                    //     handleChange({ target: { id: 'type', value } });
                    //   } else {
                    //     setOptionStatus([]);
                    //     handleChange({ target: { id: 'type', value: '' } });
                    //   }
                    // }}
                  />
                  {errors.type && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.type.required' })}</div>}
                </Col>
                <Col xs={8} md={8} className="mt-3">
                  <Form.Group controlId="product">
                    <Form.Label>{f({ id: 'receiving.list.product' })}</Form.Label>
                    <LovProductListSelect
                      name="product"
                      isDisabled
                      // isDisabled={values.type?.value !== 'productSelect'}
                      value={values.product || ''}
                      onChange={(selectedValue) => {
                        handleChange({ target: { id: 'product', value: selectedValue?.value } });
                      }}
                    />
                    {errors.product && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.product.required' })}</div>}
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.product.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
              </>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="batchNo">
                  <Form.Label>{f({ id: 'receiving.list.batchNumber' })}</Form.Label>
                  <Form.Control name="batchNo" value={values.batchNo || ''} onChange={handleChange} readOnly />
                  {/* <Select
                      isDisabled={values.type?.value === 'productSelect'}
                      classNamePrefix="react-select"
                      options={optionList}
                      value={values.batchNo}
                      onChange={(selectedValue) => handleChange({ target: { id: 'batchNo', value: selectedValue } })}
                    /> */}
                  {/* <Select name="batchNo" value={values.batchNo || ''} options={values.batchNoOption} onChange={handleChange} /> */}
                  {errors.batchNo && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.batchNumber.required' })}</div>}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.batchNumber.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="receivingPrice">
                  <Form.Label>{f({ id: 'purchaseOrder.field.priceUnit' })}</Form.Label>
                  <Form.Control
                    as={NumberFormat}
                    // decimalScale={localStorage.getItem('ConfigDecimal')}
                    fixedDecimalScale
                    allowNegative={false}
                    onChange={(event) => {
                      if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
                        handleChange({ target: { id: 'receivingPrice', value: event.target.value } });
                      }
                    }}
                    name="receivingPrice"
                    value={values.receivingPrice || ''}
                  />
                  {errors.receivingPrice && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.receivingPrice.required' })}</div>}
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="storeLocation">
                  <Form.Label>{f({ id: 'operator.storeLocationSupplier' })}</Form.Label>
                  {/* <AutocompleteStoreLocation
                      value={values.storeLocation}
                      onSelect={(selectedValue) => handleChange({ target: { id: 'storeLocation', value: selectedValue?.id } })}
                      inputProps={{ isInvalid: !!errors.storeLocation }}
                    /> */}
                  <LovStoreLocationSelect
                    value={values.storeLocationSupplier || ''}
                    inputProps={{ required: true, isInvalid: !!errors.storeLocationSupplier }}
                    onChange={(selectedValue) => handleChange({ target: { id: 'storeLocationSupplier', value: selectedValue?.value } })}
                    POType={data?.purchaseOrderType}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.storeLocationSupplier ? 'block' : 'none' }}>
                    {f({ id: 'receiving.list.storeLocationSupplier.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="amount">
                  <Form.Label>{f({ id: 'receiving.list.amount' })}</Form.Label>
                  <Form.Control
                    as={NumberFormat}
                    // decimalScale={4}
                    fixedDecimalScale
                    allowNegative={false}
                    name="amountSupplier"
                    value={values.amountSupplier || ''}
                    onChange={(event) => {
                      const calculatedAmount = parseFloat(event.target.value) + parseFloat(values.amountSale);
                      const tolerance = 0.0001;
                      if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
                        handleChange({ target: { id: 'amountSupplier', value: event.target.value } });
                        if (Math.abs(Math.abs(data.productionActualProducedAmount) - calculatedAmount) > tolerance) {
                          setAmountKspError(true);
                        } else {
                          setAmountKspError(false);
                        }
                      }
                    }}
                    // isInvalid={!!errors.amountSupplier}
                  />

                  {errors.amountSupplier && !amountKspError && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.amount.required' })}</div>}
                  {amountKspError && (
                    <div className="d-block invalid-feedback">
                      {f({ id: 'receiving.error.exceeded.required' })}({Math.abs(data.productionActualProducedAmount)}).
                    </div>
                  )}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.amountSupplier.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="storeLocation">
                  <Form.Label>{f({ id: 'operator.storeLocationSale' })}</Form.Label>
                  {/* <AutocompleteStoreLocation
                      value={values.storeLocation}
                      onSelect={(selectedValue) => handleChange({ target: { id: 'storeLocation', value: selectedValue?.id } })}
                      inputProps={{ isInvalid: !!errors.storeLocation }}
                    /> */}
                  <LovStoreSelectSales
                    value={values.storeLocationSale || ''}
                    inputProps={{ required: true, isInvalid: !!errors.storeLocationSale }}
                    onChange={(selectedValue) => handleChange({ target: { id: 'storeLocationSale', value: selectedValue?.value } })}
                    POType={data?.purchaseOrderType}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.storeLocationSale ? 'block' : 'none' }}>
                    {f({ id: 'receiving.list.storeLocationSale.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="amount">
                  <Form.Label>{f({ id: 'receiving.list.amount' })}</Form.Label>
                  <Form.Control
                    as={NumberFormat}
                    // decimalScale={4}
                    fixedDecimalScale
                    allowNegative={false}
                    name="amountSale"
                    value={values.amountSale || ''}
                    onChange={(event) => {
                      const calculatedAmount = parseFloat(event.target.value) + parseFloat(values.amountSupplier);
                      const tolerance = 0.0001;
                      if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
                        handleChange({ target: { id: 'amountSale', value: event.target.value } });
                        console.log(data.productionActualProducedAmount, calculatedAmount);
                        if (Math.abs(Math.abs(data.productionActualProducedAmount) - calculatedAmount) > tolerance) {
                          setAmountKspError(true);
                        } else {
                          setAmountKspError(false);
                        }
                      }
                    }}
                    // isInvalid={!!errors.amountSale}
                  />

                  {errors.amountSale && !amountKspError && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.amount.required' })}</div>}
                  {amountKspError && (
                    <div className="d-block invalid-feedback">
                      {f({ id: 'receiving.error.exceeded.required' })}({Math.abs(data.productionActualProducedAmount)}).
                    </div>
                  )}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.amount.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="mfgDt">
                  <Form.Label>{f({ id: 'receiving.list.mgfDate' })}</Form.Label>
                  <DatepickerThaiYear
                    className="form-control"
                    value={values.mfgDt || ''}
                    name="mfgDt"
                    onChange={(value) => {
                      handleChange({ target: { id: 'expDt', value } });
                      handleChange({ target: { id: 'mfgDt', value } });
                      // Update minTime for the end field based on the selected time in the start field
                      const updatedMinTime = value;
                      setMinTime(updatedMinTime);
                    }}
                    format="DD/MM/YYYY"
                  />
                  {errors.mfgDt && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.mfgDt.required' })}</div>}
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="expDt">
                  <Form.Label>{f({ id: 'receiving.list.expDate' })}</Form.Label>
                  <DatepickerThaiYear
                    className="form-control"
                    value={values.expDt || ''}
                    name="expDt"
                    allowNegative={false}
                    onChange={(date) => {
                      handleChange({ target: { id: 'expDt', value: date } });
                    }}
                    format="DD/MM/YYYY"
                    filterTime={minTime}
                  />
                  {errors.expDt && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.expDt.required' })}</div>}
                </Form.Group>
              </Col>
              <div className="mt-5" style={{ textAlign: 'center' }}>
                <Button type="submit" variant="primary">
                  {f({ id: 'receiving.list.received' })}
                </Button>{' '}
                <Button variant="light" onClick={onHide}>
                  {f({ id: 'common.cancel' })}
                </Button>
              </div>
            </Row>
          </Form>
        </div>
        {/* </Card> */}
      </Modal.Body>
      {/* <Modal.Footer>
      </Modal.Footer> */}
    </Modal>
  );
};

export default FinalOperationModal;
