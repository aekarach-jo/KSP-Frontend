import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import clx from 'classnames';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NumberFormat from 'react-number-format';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import Select from 'react-select';
import LovMaterialSelect from 'components/lov-select/LovMaterialSelect';
import LovProductListSelect from 'components/lov-select/LovProductListSelect';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import moment from 'moment';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';
import AutocompleteStoreLocation from './AutocompleteStoreLocation';
import LovStoreLocationSelect from './LovStoreLocationSelect';

const optionsSelect = [
  { value: 'materialSelect', label: 'วัสดุ' },
  { value: 'productSelect', label: 'สินค้า' },
];

const ReceiveItemModal = ({ isReceiving, show, onHide, onAdd, data, inventoryReceiving }) => {
  const { formatMessage: f, locale } = useIntl();
  const [checkLimit, setCheckLimit] = useState(false);
  const [optionStatus, setOptionStatus] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [minTime, setMinTime] = useState(null);

  let validationSchema = {};
  if (!inventoryReceiving) {
    validationSchema = Yup.object().shape({
      deliveryBillNo: Yup.string().required(),
      invoiceDate: Yup.string().required(),
      storeLocation: Yup.string().required(),
      batchNo: Yup.string().required(),
      amount: Yup.string().required(),
      mfgDt: Yup.string().required(),
      receivingPrice: Yup.string().required(),
      expDt: Yup.string().required(),
    });
  } else {
    validationSchema = Yup.object().shape({
      type: Yup.object().required(),
      material: optionStatus === 'materialSelect' ? Yup.string().required() : '',
      product: optionStatus === 'productSelect' ? Yup.string().required() : '',
      supplier: Yup.string().required(),
      storeLocation: Yup.string().required(),
      batchNo: Yup.string().required(),
      amount: Yup.string().required(),
      mfgDt: Yup.string().required(),
      receivingPrice: Yup.string().required(),
      expDt: Yup.string().required(),
    });
  }

  // console.log(values);

  const onSubmit = (values) => {
    const submitValues = {};
    // const str = values.mfgDt.split('/');
    // const newDate = `${Number(str[2]) + 543}/${str[1]}/${str[0]}`;
    const expDt = values.expDt.split('/');
    const mfgDt = values.mfgDt.split('/');
    const invoiceDate = values.invoiceDate.split('/');
    values.expDt = `${expDt[0]}/${expDt[1]}/${Number(expDt[2])}`;
    values.mfgDt = `${mfgDt[0]}/${mfgDt[1]}/${Number(mfgDt[2])}`;
    values.invoiceDate = `${invoiceDate[0]}/${invoiceDate[1]}/${Number(invoiceDate[2])}`;
    values.amount = parseFloat(values.amount);
    if (inventoryReceiving) {
      // delete values.deliveryBillNo;
      // delete values.expDt;
      // delete values.invoiceDate;
      // delete values.mfgDt;
      if (values.invoiceDate === 'NaN/undefined/') {
        delete values.invoiceDate;
      }
      if (values.type?.value === 'productSelect') {
        delete values.material;
        // delete values.batchNo;
        // values.receivingPrice = 0;
        values.type = 'PRODUCT';
      } else {
        // values.batchNo = values.batchNo.label;
        values.type = 'MATERIAL';
      }
    }

    Object.keys(values).forEach((key) => {
      let value = values[key];
      if (value instanceof Date) {
        value = format(value, 'yyyy/MM/dd');
      }
      submitValues[key] = value;
    });
    // console.log({ ...submitValues, purchaseOrderDetail: data?.purchaseOrderDetailId, POType: data?.purchaseOrderType });

    let objType = {};
    if (data?.purchaseOrderType === '02') {
      objType = {
        material: data.materialId,
        supplier: data.purchaseOrderSupplier,
        POType: data?.purchaseOrderType,
      };
    }
    if (data?.purchaseOrderType === '01') {
      objType = {
        supplier: data.purchaseOrderSupplier,
        POType: data?.purchaseOrderType,
      };
    }

    onAdd?.({ ...submitValues, purchaseOrderDetail: data?.purchaseOrderDetailId, ...objType, receivingPrice: values.receivingPrice });
    onHide();
  };

  const formik = useFormik({
    initialValues: { storeLocation: '', amount: '', invoiceDate: '', mfgDt: '', expDt: '', receivingPrice: data.price || 0 },
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
  // useEffect(() => {
  //   handleChange({ target: { id: 'batchNo', value: optionList } });
  // }, [optionList]);
  return (
    <Modal show={show} className={clx(['fade'])} size="xl" onHide={onHide} backdrop="static">
      <Modal.Header>
        <Modal.Title>
          {!inventoryReceiving ? `${f({ id: 'receiving.list.receive' })}:${data?.materialName}` : <>{f({ id: 'receiving.list.receiveInventory' })}</>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* <Card
          className={clx({
            'mb-2': true,
            'overlay-spinner': isReceiving,
          })}
        > */}
        <div>
          {!inventoryReceiving && (
            <Row className="g-0 h-100 align-content-center">
              <Col xs={6} md={3} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1">
                <div className="text-muted text-medium">{f({ id: 'receiving.list.materialCode' })}</div>
                <div className="text-alternate">{data?.materialCode}</div>
              </Col>
              <Col xs={6} md={3} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-2">
                <div className="text-muted text-medium">{f({ id: 'receiving.list.receivedTimes' })}</div>
                <div className="text-alternate">{data?.receivedCount || '0'}</div>
              </Col>
              <Col xs={6} md={4} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-3">
                <div className="text-muted text-medium">{f({ id: 'receiving.list.receivedAndTotal' })}</div>
                <div>
                  <div className="text-alternate">{`${Number(data?.receivedAmount).toFixed(localStorage.getItem('ConfigDecimal'))}/${Number(
                    data?.totalAmount
                  ).toFixed(localStorage.getItem('ConfigDecimal'))}`}</div>
                </div>
              </Col>
              <Col xs={6} md={2} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-4">
                <div className="text-muted text-medium">{f({ id: 'receiving.list.materialStoreUnit' })}</div>
                <div>
                  <div className="text-alternate">{data?.materialBaseUOM || '-'}</div>
                </div>
              </Col>
            </Row>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              {inventoryReceiving ? (
                <>
                  <Col xs={4} md={4} className="mt-3">
                    <Form.Label>{f({ id: 'receiving.list.type' })}</Form.Label>
                    <Select
                      // isDisabled={!isEditMode}
                      classNamePrefix="react-select"
                      options={optionsSelect}
                      // isMulti
                      value={values.type}
                      onChange={(value) => {
                        resetForm();
                        if (value !== null) {
                          setOptionStatus(value.value);
                          handleChange({ target: { id: 'type', value } });
                        } else {
                          setOptionStatus([]);
                          handleChange({ target: { id: 'type', value: '' } });
                        }
                      }}
                    />
                    {errors.type && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.type.required' })}</div>}
                  </Col>
                  {values.type?.value === 'materialSelect' || values.type?.value === undefined ? (
                    <Col xs={8} md={8} className="mt-3">
                      <Form.Group controlId="material">
                        <Form.Label>{f({ id: 'receiving.list.materialCode' })}</Form.Label>
                        <LovMaterialSelect
                          value={values.material || ''}
                          isDisabled={values.type?.value !== 'materialSelect'}
                          inputProps={{ required: true, isInvalid: !!errors.material }}
                          onChange={(selectedValue) => {
                            const optionBatch = [];
                            handleChange({ target: { id: 'receivingPrice', value: selectedValue?.detail?.costPrice } });
                            handleChange({ target: { id: 'material', value: selectedValue?.value } });
                            data?.forEach((element2) => {
                              // console.log(element2,selectedValue);
                              if (selectedValue?.value === element2?.materialId && element2?.materialId !== undefined && selectedValue?.value !== undefined) {
                                element2?.batchNoList?.forEach((element3) => {
                                  if (element3?.availableAmount > 0) {
                                    optionBatch.push({
                                      value: element3?._id, // eslint-disable-line no-underscore-dangle
                                      label: element3?.batchNo,
                                      amount: element3?.amount,
                                      availableAmount: element3?.availableAmount,
                                    });
                                    setOptionList(optionBatch);
                                    // handleChange({ target: { id: 'batchNoOption', value: optionBatch } });
                                  }
                                });
                              } else {
                                setOptionList(optionBatch);
                              }
                            });
                          }}
                        />
                        {errors.material && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.material.required' })}</div>}
                        {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.materialCode.required' })}</Form.Control.Feedback> */}
                      </Form.Group>
                    </Col>
                  ) : (
                    <Col xs={8} md={8} className="mt-3">
                      <Form.Group controlId="product">
                        <Form.Label>{f({ id: 'receiving.list.product' })}</Form.Label>
                        <LovProductListSelect
                          name="product"
                          isDisabled={values.type?.value !== 'productSelect'}
                          value={values.product || ''}
                          onChange={(selectedValue) => {
                            handleChange({ target: { id: 'product', value: selectedValue?.value } });
                          }}
                        />
                        {errors.product && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.product.required' })}</div>}
                        {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.product.required' })}</Form.Control.Feedback> */}
                      </Form.Group>
                    </Col>
                  )}
                </>
              ) : null}
              {inventoryReceiving && (
                <Col xs={12} md={12} className="mt-3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="supplierId">
                    <Form.Label>{f({ id: 'purchaseOrder.field.supplierId' })}</Form.Label>
                    <LovSupplierSelect
                      name="supplier"
                      onChange={(value) => {
                        handleChange({ target: { id: 'supplier', value: value.value } });
                      }}
                      value={values.supplier}
                      initialValue={values.supplier}
                    />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.supplier ? 'block' : 'none' }}>
                      {f({ id: 'purchaseOrder.field.supplierId.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col xs={6} md={6} className="mt-3">
                <Form.Group controlId="deliveryBillNo">
                  <Form.Label>{f({ id: 'receiving.list.deliveryBillNo' })}</Form.Label>
                  <Form.Control name="deliveryBillNo" value={values.deliveryBillNo || ''} onChange={handleChange} />
                  {errors.deliveryBillNo && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.deliveryBillNo.required' })}</div>}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.deliveryBillNo.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col xs={6} md={6} className="mt-3">
                <Form.Group controlId="invoiceDate">
                  <Form.Label>{f({ id: 'receiving.list.invoiceDate' })}</Form.Label>
                  <DatepickerThaiYear
                    className="form-control"
                    value={values?.invoiceDate || ''}
                    onChange={(date) => {
                      handleChange({ target: { id: 'invoiceDate', value: date } });
                    }}
                    format="DD/MM/YYYY"
                    isInvalid={!!errors.invoiceDate}
                    oF="testsl"
                  />
                  {errors.invoiceDate && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.invoiceDate.required' })}</div>}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.invoiceDate.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="storeLocation">
                  <Form.Label>{f({ id: 'receiving.list.storeLocation' })}</Form.Label>
                  {/* <AutocompleteStoreLocation
                      value={values.storeLocation}
                      onSelect={(selectedValue) => handleChange({ target: { id: 'storeLocation', value: selectedValue?.id } })}
                      inputProps={{ isInvalid: !!errors.storeLocation }}
                    /> */}
                  <LovStoreLocationSelect
                    value={values.storeLocation || ''}
                    inputProps={{ required: true, isInvalid: !!errors.storeLocation }}
                    onChange={(selectedValue) => handleChange({ target: { id: 'storeLocation', value: selectedValue?.value } })}
                    materialProductType={optionStatus}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.storeLocation ? 'block' : 'none' }}>
                    {f({ id: 'receiving.list.storeLocation.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="batchNo">
                  <Form.Label>{f({ id: 'receiving.list.batchNumber' })}</Form.Label>
                  <Form.Control name="batchNo" value={values.batchNo || ''} onChange={handleChange} />
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
              <Col xs={12} md={6} className="mt-3">
                <Form.Group controlId="price">
                  <Form.Label>{f({ id: 'receiving.list.price' })}</Form.Label>
                  <Form.Control
                    as={NumberFormat}
                    // decimalScale={localStorage.getItem('ConfigDecimal')}
                    fixedDecimalScale
                    allowNegative={false}
                    readOnly={values.type?.value !== 'productSelect'}
                    name="receivingPrice"
                    value={values.receivingPrice || ''}
                    onChange={handleChange}
                  />
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
                    name="amount"
                    value={values.amount || ''}
                    onChange={handleChange}
                    // isInvalid={!!errors.amount}
                  />

                  {errors.amount && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.amount.required' })}</div>}
                  {checkLimit && <div className="d-block invalid-feedback">{f({ id: 'receiving.error.exceeded.required' })}</div>}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.amount.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <div className="mt-5" style={{ textAlign: 'center' }}>
                <Button type="submit" variant="primary" disabled={checkLimit}>
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

export default ReceiveItemModal;
