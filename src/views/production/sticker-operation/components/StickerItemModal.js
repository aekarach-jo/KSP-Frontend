import React, { useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import clx from 'classnames';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NumberFormat from 'react-number-format';
import ReactToPrint from 'react-to-print';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import Select from 'react-select';
import LovMaterialSelect from 'components/lov-select/LovMaterialSelect';
import LovProductListSelect from 'components/lov-select/LovProductListSelect';
import LovStickerLotSelect from 'components/lov-select/LovStickerLotSelect';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import moment from 'moment';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';

const optionsSelect = [
  { value: 'materialSelect', label: 'วัสดุ' },
  { value: 'productSelect', label: 'สินค้า' },
];

const StickerItemModal = ({
  isReceiving,
  show,
  onHide,
  onAdd,
  data,
  inventoryReceiving,
  setIsConfirmModal,
  componentRef,
  setStickerAmount,
  saveOrder,
  setStickerObj,
}) => {
  const { formatMessage: f, locale } = useIntl();
  const [checkLimit, setCheckLimit] = useState(false);
  const [optionStatus, setOptionStatus] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [minTime, setMinTime] = useState(null);
  const userLogin = JSON.parse(window.localStorage.getItem('token'));
  const stickerAmountRef = useRef(null);

  const validationSchema = Yup.object().shape({
    productionOrder: Yup.object().required(),
    product: Yup.string().required(),
    supplier: Yup.string().required(),
    storeLocation: Yup.string().required(),
    batchNo: Yup.string().required(),
    amount: Yup.string().required(),
    mfgDt: Yup.string().required(),
    expDt: Yup.string().required(),
  });

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
  useEffect(() => {
    const list = [];
    data?.forEach((v) => {
      list.push({ ...v, label: v?.productionOrderNo, value: v?.productionOrderId });
    });
    setOptionList(list);
  }, [data]);
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
        <Modal.Title>{f({ id: 'sticker.list.titleModal' })}</Modal.Title>
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
              <Col xs={4} md={4} className="mt-3">
                <Form.Label>{f({ id: 'cutting.field.lotNo' })}</Form.Label>
                <LovStickerLotSelect
                  name="productionOrder"
                  value={values.productionOrder}
                  onChange={(value) => {
                    resetForm();
                    if (value !== null) {
                      setOptionStatus(value.value);
                      handleChange({ target: { id: 'customerName', value: value.detail?.customerName } });
                      handleChange({ target: { id: 'producedAmount', value: value.detail?.producedAmount } });
                      handleChange({ target: { id: 'productPiecePerPack', value: value.detail?.productPiecePerPack } });
                      handleChange({ target: { id: 'product', value: value.detail?.productId } });
                      handleChange({ target: { id: 'productionOrder', value } });
                      setStickerObj((prevStickerObj) => {
                        return {
                          ...prevStickerObj,
                          productionOrder: value.detail?.productionOrderId,
                          stickerPrintAmount: value.detail?.producedAmount,
                          stickerPrintStatus: 'NEW',
                        };
                      });
                    } else {
                      setOptionStatus([]);
                      handleChange({ target: { id: 'productionOrder', value: '' } });
                      handleChange({ target: { id: 'customerName', value: '' } });
                      handleChange({ target: { id: 'producedAmount', value: '' } });
                      handleChange({ target: { id: 'productPiecePerPack', value: '' } });
                      handleChange({ target: { id: 'product', value: '' } });
                    }
                  }}
                />
                {errors.productionOrder && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.type.required' })}</div>}
              </Col>
              <Col xs={8} md={8} className="mt-3">
                <Form.Group controlId="product">
                  <Form.Label>{f({ id: 'operator.field.product' })}</Form.Label>
                  <LovProductListSelect
                    name="product"
                    isDisabled
                    value={values.product || ''}
                    onChange={(selectedValue) => {
                      handleChange({ target: { id: 'product', value: selectedValue?.value } });
                    }}
                  />
                  {/* {errors.product && <div className="d-block invalid-feedback">{f({ id: 'receiving.list.product.required' })}</div>} */}
                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'receiving.list.product.required' })}</Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col xs={8} md={8} className="mt-3">
                <div className="form-floating">
                  <Form.Control disabled type="text" name="customerName" value={values.customerName} />
                  <label className="form-label">{f({ id: 'dailyPlan.field.customer' })}</label>
                </div>
              </Col>
              <Col xs={4} md={4} className="mt-3">
                <div className="form-floating">
                  <Form.Control
                    type="text"
                    name="producedAmount"
                    value={values.producedAmount}
                    onChange={(selectedValue) => {
                      // setStickerAmount(selectedValue.target.value);
                      setStickerObj((prevStickerObj) => {
                        return {
                          ...prevStickerObj,
                          stickerPrintStatus: 'NEW',
                          stickerPrintAmount: selectedValue.target.value,
                        };
                      });
                      handleChange({ target: { id: 'producedAmount', value: selectedValue.target.value } });
                    }}
                    autoFocus
                  />
                  <label className="form-label">{f({ id: 'material-production.total' })}</label>
                </div>
              </Col>

              <Col xs={8} md={8} className="mt-3">
                <div className="form-floating">
                  <Form.Control disabled type="text" name="printBy" value={`${userLogin.user.employee.firstName} ${userLogin.user.employee.lastName}`} />
                  <label className="form-label">{f({ id: 'summary.field.printBy' })}</label>
                </div>
              </Col>
              <Col xs={4} md={4} className="mt-3">
                <div className="form-floating">
                  <Form.Control disabled type="text" name="productPiecePerPack" value={values.productPiecePerPack} />
                  <label className="form-label">{f({ id: 'product.perPack' })}</label>
                </div>
              </Col>
              <div className="mt-5" style={{ textAlign: 'center' }}>
                {/* <ReactToPrint
                  trigger={() => {
                    // saveOrder();
                    setIsConfirmModal(true);
                    return ( */}
                <Button
                  variant="info"
                  size="small"
                  onClick={() => {
                    onHide();
                    return saveOrder();
                  }}
                >
                  {f({ id: 'common.ok' })}
                </Button>
                {/* );
                  }}
                  content={() => componentRef.current}
                /> */}{' '}
                <Button
                  variant="light"
                  onClick={() => {
                    setIsConfirmModal(false);
                    return onHide();
                  }}
                >
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

export default StickerItemModal;
