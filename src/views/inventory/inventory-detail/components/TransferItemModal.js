import React, { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import Select from 'react-select';
import clx from 'classnames';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import NumberFormat from 'react-number-format';
import LovInventory from 'components/lov-select/LovInventory';
import LovCautionListSelect from 'components/lov-select/LovDefectSelect';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovStoreSelectSupplier from './LovStoreSelectSupplier';
import AutocompleteStoreLocation from './AutocompleteStoreLocation';

const TransferItemModal = ({ isTransfering, show, onHide, onAdd, data, information, transformItemModal }) => {
  const { formatMessage: f } = useIntl();
  const [isShowMessage, setShowMessage] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [errorAmount, setErrorAmount] = useState(false);

  let validationSchema = '';
  if (!transformItemModal) {
    validationSchema = Yup.object().shape({
      amount: Yup.number().required().positive(),
      toStoreLocation: Yup.object().required(),
      batchNo: Yup.object().required(),
    });
  } else {
    validationSchema = Yup.object().shape({
      fromAmount: Yup.number().required().positive(),
      toMaterialId: Yup.array().required().min(2, 'Materials required'),
      toAmount: Yup.number().required().positive(),
      toStoreLocation: Yup.array().required(),
      fromBatchNo: Yup.object().required(),
    });
  }

  const onSubmit = (values) => {
    const cautionList = [];
    const toMaterialIdList = [];
    if (values?.cautionList?.length > 0) {
      if (values.cautionList[0].value !== undefined) {
        values.cautionList.forEach((element) => {
          cautionList.push(element.detail.code);
        });
        values.cautionList = cautionList;
      } else {
        values.cautionList.forEach((element) => element);
      }
    } else {
      values.cautionList = [];
    }
    values.toStoreLocation = values.toStoreLocation?.value;
    let amount = 0;
    let fromAmount = 0;
    if (transformItemModal) {
      values.fromBatchNo = values.fromBatchNo.label;
      amount = parseFloat(values.toAmount);
      fromAmount = parseFloat(values.fromAmount);
      if (values.toMaterialId?.length > 0) {
        if (values.toMaterialId[0]?.value !== undefined) {
          values.toMaterialId?.forEach((element) => {
            if (element !== undefined)
              toMaterialIdList.push({
                toMaterialId: element.value,
                toBatchNo: values.toBatchNo,
                toAmount: amount,
              });
          });
          values.toStoreLocation?.forEach((element, index) => {
            if (element !== undefined) {
              toMaterialIdList[index] = { ...toMaterialIdList[index], toStoreLocation: element.value };
            }
          });
          values.transformToList = toMaterialIdList;
        } else {
          values.toMaterialId?.forEach((element) => element);
        }
      }
    } else {
      amount = parseFloat(values.amount);
      values.batchNo = values.batchNo?.label;
    }
    if (values.availableAmount >= amount && (!transformItemModal || values.availableAmount >= fromAmount)) {
      delete values.storeLocationCode;
      delete values.materialCode;
      delete values.batchList;
      delete values.materialName;
      delete values.materialStoreUnit;
      delete values.availableAmountTrasnform;
      delete values.availableAmount;
      delete values.batchNoList;
      delete values.toMaterialId;
      delete values.toBatchNo;
      onAdd?.(values);
    } else {
      setErrorAmount(true);
    }
  };

  const formik = useFormik({ initialValues: { ...data, ...information }, onSubmit, validationSchema, enableReinitialize: true });
  const { handleChange, onChange, handleSubmit, resetForm, values, errors } = formik;
  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);
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
        <Modal.Title>{transformItemModal ? f({ id: 'inventory.detail.transform.title' }) : f({ id: 'inventory.detail.transfering.title' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card>
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
                {transformItemModal && (
                  <Col xs={12} md={12} className="mt-3">
                    <Form.Group controlId="materialName">
                      <Form.Label>{f({ id: 'inventory.transformMaterial' })}</Form.Label>
                      <LovInventory
                        isCode="true"
                        value={values.toMaterialId || ''}
                        inputProps={{ required: true, isInvalid: !!errors.toMaterialId }}
                        isMulti
                        isOptionDisabled={() => (values.toMaterialId || []).length > 1}
                        onChange={(selectedValue) => {
                          /* eslint-disable no-underscore-dangle */
                          // const valuesList = selectedValue.detail?.batchNoList.map((item) => ({
                          //   value: item._id,
                          //   label: item.batchNo,
                          //   availableAmountTrasnform: item.availableAmount,
                          // }));
                          // const optionBatch = { value: selectedValue.detail?.batchNoList, label: selectedValue.detail?.batchNoList };
                          // handleChange({ target: { id: 'batchNoList', value: valuesList } });
                          if (selectedValue !== undefined) {
                            handleChange({ target: { id: 'toMaterialId', value: selectedValue } });
                          } else {
                            handleChange({ target: { id: 'toMaterialId', value: '' } });
                          }
                        }}
                      />
                    </Form.Group>
                    {errors.toMaterialId && <div className="d-block invalid-feedback">{f({ id: 'inventory.detail.transfrom.fromRM.required' })}</div>}
                  </Col>
                )}
                {transformItemModal ? (
                  <Col xs={12} md={8} className="mt-3">
                    <Form.Group controlId="materialName">
                      <Form.Label>{f({ id: 'inventory.batchList' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={values.batchList}
                        value={values.fromBatchNo}
                        onChange={(e) => {
                          if (e !== undefined) {
                            handleChange({ target: { id: 'availableAmount', value: e?.availableAmount } });
                            handleChange({ target: { id: 'availableAmountTrasnform', value: e?.availableAmount } });
                            handleChange({ target: { id: 'toBatchNo', value: e?.label } });
                            handleChange({ target: { id: 'fromBatchNo', value: e } });
                          } else {
                            handleChange({ target: { id: 'availableAmount', value: '' } });
                            handleChange({ target: { id: 'availableAmount', value: '' } });
                            handleChange({ target: { id: 'toBatchNo', value: '' } });
                            handleChange({ target: { id: 'fromBatchNo', value: '' } });
                          }
                        }}
                      />
                      {errors.fromBatchNo && <div className="d-block invalid-feedback">{f({ id: 'inventory.detail.transfering.toLot.required' })}</div>}
                    </Form.Group>
                  </Col>
                ) : (
                  <Col xs={12} md={8} className="mt-3">
                    <Form.Group controlId="materialName">
                      <Form.Label>{f({ id: 'inventory.batchList' })}</Form.Label>
                      <Select
                        classNamePrefix="react-select"
                        options={values.batchList}
                        value={values.batchNo}
                        onChange={(e) => {
                          if (e !== undefined) {
                            handleChange({ target: { id: 'availableAmount', value: e?.availableAmount } });
                            handleChange({ target: { id: 'batchNo', value: e } });
                          } else {
                            handleChange({ target: { id: 'availableAmountTrasnform', value: '' } });
                            handleChange({ target: { id: 'batchNo', value: '' } });
                          }
                        }}
                      />
                      {errors.batchList && <div className="d-block invalid-feedback">{f({ id: 'inventory.detail.transfering.toLot.required' })}</div>}
                    </Form.Group>
                  </Col>
                )}
                <Col xs={12} md={4} className="mt-3">
                  <Form.Group controlId="availableAmount">
                    <Form.Label>{f({ id: 'inventory.availableAmount' })}</Form.Label>
                    <Form.Control name="availableAmount" value={values.availableAmount || ''} readOnly />
                  </Form.Group>
                </Col>
                {transformItemModal && (
                  <Col xs={12} md={8} className="mt-3">
                    <Form.Group controlId="transformLot">
                      <Form.Label>{f({ id: 'inventory.detail.transform.transformLot' })}</Form.Label>
                      <Form.Control name="fromBatchNo" value={values.toBatchNo} readOnly />
                    </Form.Group>
                  </Col>
                )}
                {transformItemModal && (
                  <Col xs={12} md={4} className="mt-3">
                    <Form.Group controlId="availableAmountTrasnform">
                      <Form.Label>{f({ id: 'inventory.availableAmount' })}</Form.Label>
                      <Form.Control name="availableAmountTrasnform" value={values.availableAmountTrasnform || ''} readOnly />
                    </Form.Group>
                  </Col>
                )}
                {transformItemModal ? (
                  <Col xs={12} md={4} className="mt-3">
                    <Form.Group controlId="fromAmount">
                      <Form.Label>{f({ id: 'inventory.detail.transfering.amount' })}</Form.Label>
                      <Form.Control
                        as={NumberFormat}
                        type="text"
                        name="fromAmount"
                        value={values.fromAmount}
                        disabled={!values.fromBatchNo}
                        min={0}
                        onChange={(element) => {
                          let amount = 0;
                          amount = parseFloat(element.target.value);
                          if (values.availableAmount >= amount && amount >= 0) {
                            handleChange({ target: { id: 'fromAmount', value: amount } });
                            setErrorAmount(false);
                          } else {
                            handleChange({ target: { id: 'fromAmount', value: amount } });
                            setErrorAmount(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-') {
                            e.preventDefault();
                          } else {
                            handleChange(e);
                          }
                        }}
                        isInvalid={!!errors.fromAmount || errorAmount}
                      />
                      {errorAmount ? (
                        <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.transfering.amountMore.required' })}</Form.Control.Feedback>
                      ) : (
                        <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.transfering.amount.required' })}</Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                ) : (
                  <Col xs={12} md={transformItemModal ? 4 : 8} className="mt-3">
                    <Form.Group controlId="amount">
                      <Form.Label>{f({ id: 'inventory.detail.transfering.amount' })}</Form.Label>
                      <Form.Control
                        as={NumberFormat}
                        type="text"
                        name="amount"
                        value={values.amount}
                        min={0}
                        disabled={!values.batchNo}
                        onChange={(element) => {
                          let amount = 0;
                          amount = parseFloat(element.target.value);
                          if (values.availableAmount >= amount && amount >= 0) {
                            handleChange({ target: { id: 'amount', value: amount } });
                            setErrorAmount(false);
                          } else {
                            handleChange({ target: { id: 'amount', value: amount } });
                            setErrorAmount(true);
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
                        <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.transfering.amount.required' })}</Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                )}
                {transformItemModal && (
                  <Col xs={12} md={4} className="mt-3">
                    <Form.Group controlId="amount">
                      <Form.Label>{f({ id: 'inventory.detail.transform.qty' })}</Form.Label>
                      <Form.Control
                        as={NumberFormat}
                        type="text"
                        name="toAmount"
                        value={values.toAmount}
                        disabled={!values.fromBatchNo}
                        min={0}
                        onChange={(element) => {
                          let amount = 0;
                          amount = parseFloat(element.target.value);
                          if (values.availableAmount >= amount && amount >= 0) {
                            handleChange({ target: { id: 'toAmount', value: amount } });
                            setErrorAmount(false);
                          } else {
                            handleChange({ target: { id: 'toAmount', value: amount } });
                            setErrorAmount(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-') {
                            e.preventDefault();
                          } else {
                            handleChange(e);
                          }
                        }}
                        isInvalid={!!errors.toAmount || errorAmount}
                      />
                      {errorAmount ? (
                        <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.transfering.amountMore.required' })}</Form.Control.Feedback>
                      ) : (
                        <Form.Control.Feedback type="invalid">{f({ id: 'inventory.detail.transfering.amount.required' })}</Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                )}
                <Col xs={12} md={4} className="mt-3">
                  <Form.Group controlId="materialStoreUnit">
                    <Form.Label>{f({ id: 'inventory.unit' })}</Form.Label>
                    <Form.Control name="materialStoreUnit" value={values.materialStoreUnit || '-'} disabled />
                  </Form.Group>
                </Col>
                <Col xs={12} md={12} className="mt-3">
                  <Form.Group controlId="storeLocationCode" disabled>
                    <Form.Label>{f({ id: 'inventory.detail.transfering.source' })}</Form.Label>
                    <Form.Control name="storeLocationCode" value={values.storeLocationCode || ''} disabled />
                  </Form.Group>
                </Col>
                <Col xs={12} md={12} className="mt-3">
                  <Form.Group controlId="toStoreLocation">
                    <Form.Label>{f({ id: 'inventory.detail.transfering.destination' })}</Form.Label>

                    {transformItemModal ? (
                      <LovStoreSelectSupplier
                        isClearable
                        isMulti
                        isCode="true"
                        value={values.toStoreLocation || ''}
                        isOptionDisabled={() => (values?.toStoreLocation || []).length > 1}
                        inputProps={{ required: true, isInvalid: !!errors.toStoreLocation }}
                        onChange={(selectedValue) => {
                          if (selectedValue !== undefined) {
                            handleChange({ target: { id: 'toStoreLocation', value: selectedValue } });
                          } else {
                            handleChange({ target: { id: 'toStoreLocation', value: '' } });
                          }
                        }}
                      />
                    ) : (
                      <LovStoreSelectSupplier
                        isClearable
                        isCode="true"
                        value={values.toStoreLocation || ''}
                        isOptionDisabled={() => (values?.toStoreLocation || []).length > 1}
                        inputProps={{ required: true, isInvalid: !!errors.toStoreLocation }}
                        onChange={(selectedValue) => {
                          if (selectedValue !== undefined) {
                            handleChange({ target: { id: 'toStoreLocation', value: selectedValue } });
                          } else {
                            handleChange({ target: { id: 'toStoreLocation', value: '' } });
                          }
                        }}
                      />
                    )}
                    {/* <AutocompleteStoreLocation
                      value={values.toStoreLocation}
                      onSelect={(selectedValue) => 
                      handleChange({ target: { id: 'toStoreLocation', value: selectedValue?.id } })}
                      inputProps={{ isInvalid: !!errors.toStoreLocation }}
                    /> */}
                    <Form.Control.Feedback type="invalid" style={{ display: errors.toStoreLocation ? 'block' : 'none' }}>
                      {f({ id: 'inventory.detail.transfering.destination.required' })}
                    </Form.Control.Feedback>
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
                    {transformItemModal ? f({ id: 'inventory.detail.transform.title' }) : f({ id: 'inventory.detail.transfer' })}
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

export default TransferItemModal;
