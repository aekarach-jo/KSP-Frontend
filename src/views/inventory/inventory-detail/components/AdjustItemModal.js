import React, { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import clx from 'classnames';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import NumberFormat from 'react-number-format';
import Select from 'react-select';
import LovCautionListSelect from 'components/lov-select/LovDefectSelect';
import LovStockSupplier from 'components/lov-select/LovStockSupplier';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import { API, QUERY } from '../constants';

const typeOptions = [
  { value: '02', label: 'เรียกวัตถุดิบ' },
  { value: '03', label: 'สั่งซื้อวัตถุดิบ' },
  { value: '04', label: 'สั่งซื้อวัสดุอื่นๆ' },
];
const AdjustItemModal = ({ isAdjusting, show, onHide, onAdd, data, information, returnItemModal }) => {
  const { formatMessage: f } = useIntl();
  const [isShowMessage, setShowMessage] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);

  const options = [
    {
      value: 1,
      label: f({ id: 'inventory.detail.adjusting.increase' }),
    },
    {
      value: -1,
      label: f({ id: 'inventory.detail.adjusting.decrease' }),
    },
  ];

  const [adjustIndicator, setAdjustIndicator] = useState(options[0]);
  const [errorAmount, setErrorAmount] = useState(false);

  const validationSchema = Yup.object().shape({
    amount: Yup.number().required().positive().min(0),
    batchNo: Yup.object().nullable().required(),
  });

  const onSubmit = (values) => {
    if (values.availableAmount >= parseFloat(values.amount) || adjustIndicator?.value === 1) {
      const cautionList = [];
      delete values.storeLocationCode;
      delete values.materialCode;
      delete values.batchList;
      delete values.materialName;
      console.log(values);
      values.storeLocation = values.storeLocationId;
      delete values.storeLocationId;
      delete values.availableAmount;
      delete values.materialStoreUnit;
      values.purchaseOrderDetail = values.purchaseOrderDetail?.value;
      delete values.purchaseOrderNo;
      values.batchNo = values.batchNo?.label;
      if (values.cautionList?.length > 0) {
        if (values.cautionList[0]?.value !== undefined) {
          values.cautionList?.forEach((element) => {
            cautionList.push(element.detail.code);
          });
          values.cautionList = cautionList;
        } else {
          values.cautionList?.forEach((element) => element);
        }
      }
      onAdd?.({ ...values, amount: parseInt(values.amount, 10) * adjustIndicator?.value });
    } else {
      setErrorAmount(true);
    }
  };
  const [type, setType] = useState();
  const queryClient = useQueryClient();

  const formik = useFormik({ initialValues: { ...data, ...information }, onSubmit, validationSchema, enableReinitialize: true });
  const { handleChange, onChange, handleSubmit, resetForm, values, errors } = formik;
  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);
  const handleChangeType = (v) => {
    setType(v);
    // handleChange({ target: { id: 'batchNo', value: e?.label } });
    // queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
    //   return {
    //     ...currentData,
    //     type: v,
    //     typePO: v.value,
    //   };
    // });
  };
  const handleChangeCautionList = (value) => {
    if (value !== null) {
      handleChange({ target: { id: 'cautionList', value } });
    } else {
      const cautionList = '';
      handleChange({ target: { id: 'cautionList', value: cautionList } });
    }
  };
  useEffect(() => {
    resetForm();
  }, [show, resetForm]);
  return (
    <Modal show={show} className={clx(['fade'])} size="lg" onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title> {!returnItemModal ? f({ id: 'inventory.detail.adjusting.title' }) : f({ id: 'inventory.detail.return.title' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card
          className={clx({
            'overlay-spinner': isAdjusting,
          })}
        >
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={12} className="mt-3">
                  <Form.Group controlId="materialCode">
                    <Form.Label>{f({ id: 'inventory.materialCode' })}</Form.Label>
                    <Form.Control name="materialCode" value={values.materialCode || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col xs={12} md={12} className="mt-3">
                  <Form.Group controlId="materialName">
                    <Form.Label>{f({ id: 'inventory.materialName' })}</Form.Label>
                    <Form.Control name="materialName" value={values.materialName || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col xs={12} md={8} className="mt-3">
                  <Form.Group controlId="batchList">
                    <Form.Label>{f({ id: 'inventory.batchList' })}</Form.Label>
                    <Select
                      classNamePrefix="react-select"
                      options={values.batchList}
                      value={values.batchNo}
                      onChange={(e) => {
                        if (e !== undefined) {
                          if (e.receivingLog !== undefined) {
                            const purchaseOrderNos = (e.receivingLog || []).map((v) => ({
                              label: v.purchaseOrderNo,
                              value: v.purchaseOrderDetail,
                              purchaseOrderType: v.purchaseOrderType,
                            }));
                            handleChange({ target: { id: 'purchaseOrderNo', value: purchaseOrderNos } });
                          }
                          handleChange({ target: { id: 'availableAmount', value: e?.availableAmount } });
                          handleChange({ target: { id: 'batchNo', value: e } });
                        } else {
                          handleChange({ target: { id: 'availableAmount', value: '' } });
                          handleChange({ target: { id: 'batchNo', value: '' } });
                        }
                        onChange?.(e);
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4} className="mt-3">
                  <Form.Group controlId="availableAmount">
                    <Form.Label>{f({ id: 'inventory.availableAmount' })}</Form.Label>
                    <Form.Control name="availableAmount" value={values.availableAmount || ''} readOnly />
                  </Form.Group>
                </Col>
                {/* {returnItemModal && type?.value === '02' && (
                  <Col xs={12} md={12} className="mt-3">
                    <Form.Group>
                      <Form.Label>{f({ id: 'inventory.detail.adjusting.stockSupplier' })}</Form.Label>
                      <LovStockSupplier
                        isClearable
                        isCode="true"
                        value={values.storeLocation || ''}
                        inputProps={{ required: true, isInvalid: !!errors.storeLocation }}
                        onChange={(selectedValue) => {
                          if (selectedValue !== undefined) {
                            handleChange({ target: { id: 'storeLocation', value: selectedValue?.value } });
                          } else {
                            handleChange({ target: { id: 'storeLocation', value: '' } });
                          }
                        }}
                      />
                    </Form.Group>
                  </Col>
                )} */}
                {returnItemModal && (
                  <Col xs={12} md={6} className="mt-3">
                    <Form.Group>
                      <Form.Label>{f({ id: 'inventory.detail.adjusting.refPo' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={values.purchaseOrderNo}
                        isDisabled={!values.batchNo}
                        value={values.purchaseOrderDetail}
                        onChange={(e) => {
                          if (e !== undefined) {
                            const typeTemp = typeOptions.find((v) => v.value === e.purchaseOrderType);
                            if (typeTemp !== undefined) {
                              setType(typeTemp);
                            } else {
                              setType({});
                            }
                            handleChange({ target: { id: 'purchaseOrderDetail', value: e } });
                          } else {
                            handleChange({ target: { id: 'purchaseOrderDetail', value: '' } });
                          }
                          onChange?.(e);
                        }}
                      />
                      {/* <Select
                        classNamePrefix="react-select"
                        // options={typeOptions}
                        // value={type}
                        // onChange={handleChangeType}
                        // required
                        placeholder=""
                      /> */}
                    </Form.Group>
                  </Col>
                )}
                {returnItemModal && (
                  <Col xs={12} md={6} className="mt-3">
                    <Form.Group>
                      <Form.Label>{f({ id: 'inventory.detail.adjusting.type' })}</Form.Label>
                      <Select classNamePrefix="react-select" options={typeOptions} isDisabled value={type} onChange={handleChangeType} />
                    </Form.Group>
                  </Col>
                )}
                <Col xs={12} md={4} className="mt-3">
                  <Form.Group controlId="amount">
                    <Form.Label>{f({ id: 'inventory.detail.adjusting.amount' })}</Form.Label>
                    <Form.Control
                      as={NumberFormat}
                      name="amount"
                      value={values.amount}
                      min={0}
                      disabled={!values.batchNo}
                      onChange={(element) => {
                        const amount = parseFloat(element.target.value);
                        if (values.availableAmount >= amount && amount >= 0) {
                          handleChange({ target: { id: 'amount', value: amount } });
                          setErrorAmount(false);
                        } else {
                          handleChange({ target: { id: 'amount', value: amount } });
                          if (adjustIndicator?.value === 1) {
                            setErrorAmount(false);
                          } else {
                            setErrorAmount(true);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === '-') {
                          e.preventDefault();
                        } else {
                          handleChange(e);
                        }
                      }}
                      isInvalid={!!errors.amount || errorAmount}
                    />
                    {errorAmount ? (
                      <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.transfering.amountMore.required' })}</Form.Control.Feedback>
                    ) : (
                      <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.adjusting.amount.required' })}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={4} className="mt-3">
                  <Form.Group controlId="materialStoreUnit">
                    <Form.Label>{f({ id: 'inventory.unit' })}</Form.Label>
                    <Form.Control name="materialStoreUnit" value={values.materialStoreUnit || '-'} readOnly />
                  </Form.Group>
                </Col>

                <Col xs={12} md={4} className="mt-3">
                  <Form.Group>
                    <Form.Label>{f({ id: 'inventory.detail.adjusting.type' })}</Form.Label>
                    {!returnItemModal ? (
                      <Select
                        classNamePrefix="react-select"
                        options={options}
                        value={adjustIndicator}
                        onChange={(element) => {
                          setAdjustIndicator(element);
                          const amount = parseFloat(values.amount);
                          if (values.availableAmount >= amount && amount >= 0) {
                            setErrorAmount(false);
                          } else if (adjustIndicator?.value === -1) {
                            setErrorAmount(false);
                          } else {
                            setErrorAmount(true);
                          }
                        }}
                      />
                    ) : (
                      <div className="mt-2 px-2">{f({ id: 'inventory.detail.return' })}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col lg="8" md="8" sm="8">
                  <Form.Label className="col-form-label">{f({ id: 'product.field.remark' })}</Form.Label>
                </Col>
                <Col lg="4" md="4" sm="4" style={{ textAlign: 'right' }}>
                  <CsLineIcons className="text-primary" icon="plus" />
                  <a href="#" onClick={toggleManageAddModal}>
                    {f({ id: 'common.message' })}
                  </a>
                  {/* <Button className="w-100" variant="outline-primary" disabled={!isEditMode} onClick={toggleManageAddModal}>
                    จัดการข้อความ
                  </Button> */}
                </Col>
                <Col sm="12" md="12" lg="12">
                  <LovCautionListSelect
                    name="cautionList"
                    isClearable
                    onChange={handleChangeCautionList}
                    value={values.cautionList || ''}
                    isMulti
                    valueChange={valueChangeCaution}
                    setValueChange={setValueChangeCaution}
                    typeMessage="R"
                  />
                  <ManageMessageModalAdd
                    setValueChange={setValueChangeCaution}
                    show={isShowMessage}
                    setShowModal={setShowMessage}
                    hide={toggleManageAddModal}
                  />
                </Col>
                <div className="mt-5" style={{ textAlign: 'center' }}>
                  <Button type="submit" variant="primary">
                    {!returnItemModal ? f({ id: 'inventory.detail.adjust' }) : f({ id: 'inventory.detail.return' })}
                  </Button>{' '}
                  <Button variant="light" onClick={onHide}>
                    {f({ id: 'common.cancel' })}
                  </Button>
                </div>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Modal.Body>
      {/* <Modal.Footer>
      </Modal.Footer> */}
    </Modal>
  );
};

export default AdjustItemModal;
