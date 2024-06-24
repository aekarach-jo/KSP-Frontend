import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import clx from 'classnames';
import { useFormik } from 'formik';
import { useQueryClient } from 'react-query';
import * as Yup from 'yup';
import NumberFormat from 'react-number-format';
import Select from 'react-select';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';
import LovPurchaseOrderSelect from 'components/lov-select/LovPurchaseOrderSelect';
import AutocompletePurchaseOrder from './AutocompletePurchaseOrder';

import { QUERY } from '../constants';

const materialTypeOptions = [
  { value: 'PI', label: 'Purchase Item' },
  { value: 'MAT', label: 'Material' },
];
const typeOptions = [
  { value: '01', label: 'สั่งสำรองวัตถุดิบ' },
  { value: '02', label: 'เรียกวัตถุดิบ' },
  { value: '03', label: 'สั่งซื้อวัตถุดิบ' },
  { value: '04', label: 'สั่งซื้อวัสดุอื่นๆ' },
];
const getAddress = (addresses) => {
  if (!addresses || addresses.length === 0) {
    return '';
  }

  const defaultAddress = addresses.find((item) => item.isDefault);
  if (defaultAddress) {
    return defaultAddress.address;
  }

  const { address } = addresses[0];
  return address;
};
const PurchaseItemModal = ({ isPurchasing, show, onHide, onAdd, data, purchaseType }) => {
  const { formatMessage: f } = useIntl();

  const queryClient = useQueryClient();
  const [detail, setDetail] = useState([]);
  const [type, setType] = useState();
  const [isChangeType, setIsChangeType] = useState(false);

  const validationSchema = Yup.object().shape({
    // purchaseOrderId: Yup.string().required(),
    amount: Yup.number().required(),
  });

  const onSubmit = (values) => {
    const newValue = {
      type: values.materialType.value,
      amount: values.amount,
    };
    if (newValue.type === 'PI') {
      newValue.purchaseItem = {};
      newValue.purchaseItem.id = data.materialId;
    } else {
      newValue.material = {};
      newValue.material.id = data.materialId;
    }
    const currentDeatil = [...detail, newValue];
    const newDetail = currentDeatil.map((item) => {
      const result = {
        type: item.type,
        amount: item.amount,
      };
      if (item.type === 'PI') {
        result.purchaseItem = item.purchaseItem.id;
      } else {
        result.material = item.material.id;
      }
      return result;
    });
    const submitValues = {
      type: values.type?.value,
      supplierId: values.supplierId,
      detail: newDetail,
    };
    onAdd?.({ ...submitValues });
  };

  const formik = useFormik({
    initialValues: { type: purchaseType, supplierId: '' },
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  });
  const { handleChange, handleSubmit, resetForm, values, errors } = formik;

  const onSelectPurchaseOrder = (selectedValue) => {
    setDetail(selectedValue?.detail);
    handleChange({ target: { id: 'supplierId', value: selectedValue?.supplierId?.id } });
    handleChange({ target: { id: 'supplierName', value: selectedValue?.supplierId?.name } });
    handleChange({ target: { id: 'type', value: selectedValue?.type } });
    handleChange({ target: { id: 'purchaseOrderId', value: selectedValue?.id } });
  };

  const handleChangeMaterialType = (value) => {
    handleChange({ target: { id: 'materialType', value } });
  };
  const handleChangeType = (v) => {
    setType(v.value);
    handleChange({ target: { id: 'type', value: v } });
    queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
      return {
        ...currentData,
        type: v,
        typePO: v.value,
      };
    });
    setIsChangeType(true);
  };
  const handleSelectSupplier = (value) => {
    handleChange({ target: { id: 'supplierId', value: value.value } });
    queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
      return {
        ...currentData,
        supplierAddress: getAddress(value.detail.list),
        supplierName: value.detail.name || '',
        supplierId: value.detail.id || '',
        priceCondition: value.detail.priceCondition || '',
        weightCondition: value.detail.weightCondition || '',
        detail: [],
      };
    });
  };

  useEffect(() => {
    resetForm();
    setDetail([]);
  }, [show, resetForm]);

  return (
    <Modal show={show} className={clx(['fade'])} size="lg" onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {f({ id: 'inventory.list.purchase' })} : {data?.materialName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card
          className={clx({
            'mb-2': true,
            'overlay-spinner': isPurchasing,
          })}
        >
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* <Col xs={12} md={12} className="mt-3">
                  <Form.Group controlId="purchaseOrderId">
                    <Form.Label>{f({ id: 'purchaseOrder.field.no' })}</Form.Label>
                    <AutocompletePurchaseOrder
                      value={values.purchaseOrderId}
                      onSelect={onSelectPurchaseOrder}
                      inputProps={{ isInvalid: !!errors.purchaseOrderId }}
                    />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.purchaseOrderId ? 'block' : 'none' }}>
                      {f({ id: 'purchaseOrder.field.no.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col> */}
                {/* <Col md="12" className="mt-3">
                  <Form.Group>
                    <Form.Label>{f({ id: 'menu.purchase-order' })}</Form.Label>
                    <LovPurchaseOrderSelect
                      isClearable
                      isCode="true"
                      value={values.purchaseOrderId || ''}
                      inputProps={{ required: true, isInvalid: !!errors.purchaseOrderId }}
                      onChange={(selectedValue) => {
                        if (selectedValue !== undefined) {
                          handleChange({ target: { id: 'purchaseOrderId', value: selectedValue?.value } });
                        } else {
                          handleChange({ target: { id: 'purchaseOrderId', value: '' } });
                        }
                      }}
                    />
                  </Form.Group>
                </Col> */}
                <Col md="12" className="mt-3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="type">
                    <Form.Label>{f({ id: 'purchaseOrder.field.type' })}</Form.Label>
                    <Select classNamePrefix="react-select" options={typeOptions} value={values.type} onChange={handleChangeType} required placeholder="" />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.type ? 'block' : 'none' }}>
                      {f({ id: 'purchaseOrder.field.type.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md="12" className="mt-3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="supplierId">
                    <Form.Label>{f({ id: 'purchaseOrder.field.supplierId' })}</Form.Label>
                    <LovSupplierSelect name="supplierId" onChange={handleSelectSupplier} value={values.supplierId} initialValue={values.supplierId} />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.supplierId ? 'block' : 'none' }}>
                      {f({ id: 'purchaseOrder.field.supplierId.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                {/* <Col xs={12} md={12} className="mt-3">
                  <Form.Group controlId="type">
                    <Form.Label>{f({ id: 'purchaseOrder.field.type' })}</Form.Label>
                    <Form.Control name="type" value={values?.type || ''} readOnly />
                  </Form.Group>
                </Col> */}
                <Col xs={12} md={6} className="mt-3">
                  <Form.Group controlId="materialType">
                    <Form.Label>{f({ id: 'purchaseOrder.detail.purchaseItem.modal.type' })}</Form.Label>
                    <Select classNamePrefix="react-select" options={materialTypeOptions} value={values.materialType} onChange={handleChangeMaterialType} />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="mt-3">
                  <Form.Group controlId="amount">
                    <Form.Label>{f({ id: 'purchaseOrder.field.amount' })}</Form.Label>
                    <Form.Control as={NumberFormat} name="amount" value={values.amount || ''} onChange={handleChange} isInvalid={!!errors.amount} />
                    <Form.Control.Feedback type="invalid">{f({ id: 'purchaseOrder.field.amount.invalid' })}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <div className="mt-5" style={{ textAlign: 'center' }}>
                  <Button type="submit" variant="primary">
                    {f({ id: 'inventory.list.purchase' })}
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

export default PurchaseItemModal;
