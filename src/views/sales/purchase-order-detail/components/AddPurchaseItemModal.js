import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';

import AutocompletePurchaseItem from './AutocompletePurchaseItem';
import AutocompleteMaterial from './AutocompleteMaterial';

// const typeOptions = {
//   '01': ['PI'],
//   '02': ['PI', 'MAT'],
//   '03': ['PI', 'MAT'],
//   '04': ['MAT'],
// };

// const initialOptions = [
//   { value: 'PI', label: 'Purchase Item' },
//   { value: 'MAT', label: 'Material' },
// ];

const initialValues = {
  type: {},
  amount: 0,
};

const validationSchema = Yup.object().shape({
  // purchaseItem: Yup.string().required('Required'),
  // material: Yup.string().required('Required'),
  amount: Yup.number().min(1, 'Too Short!').required('Required'),
});

const AddPurchaseItemModal = ({ modal, setModal, onAdd, isEdit, editData, setEditData, poType }) => {
  const { formatMessage: f } = useIntl();
  const [purchaseItem, setPurchaseItem] = useState({});
  const [type, setType] = useState({});
  // const [options, setOptions] = useState([]);

  const onSubmit = (formData) => {
    const result = {
      ...formData,
      type,
    };
    if (formData.type.value === 'PI') {
      result.purchaseItem = purchaseItem;
    } else if (formData.type.value === 'MAT') {
      result.material = purchaseItem;
    }
    onAdd(result);
    // eslint-disable-next-line no-use-before-define
    onHide();
  };

  const formik = useFormik({ initialValues: editData || initialValues, onSubmit, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, errors } = formik;

  const handleSelect = (id, value) => {
    setPurchaseItem(value);
    handleChange({ target: { id, value: value?.id } });
  };

  const handleChangeType = (value) => {
    resetForm();
    setType(value.value);
    handleChange({ target: { id: 'type', value } });
  };

  const onHide = () => {
    resetForm();
    setModal(false);
    setEditData({});
  };

  // const filterOptions = poType ? options.filter((item) => typeOptions[poType.value].indexOf(item.value) > -1) : [];

  useEffect(() => {
    if (poType) {
      console.log(poType);
      // const filterOptions = initialOptions.filter((item) => typeOptions[poType].indexOf(item.value) > -1);
      // setOptions(filterOptions);
      // setType(filterOptions[0].value);
      // handleChange({ target: { id: 'type', value: filterOptions[0] } });
    }
  }, [handleChange, poType]);

  useEffect(() => {
    if (editData?.type) {
      setType(editData?.type);
    }
  }, [editData]);

  return (
    <Modal className="modal-right large" show={modal} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? f({ id: 'purchaseOrder.detail.purchaseItem.modal.update' }) : f({ id: 'purchaseOrder.detail.purchaseItem.modal.add' })}
        </Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Modal.Body>
          <Row className="mb-3 g-3">
            {!editData?.type && (
              <Col md="12">
                <Form.Group controlId="type">
                  <Form.Label>{f({ id: 'purchaseOrder.detail.purchaseItem.modal.type' })}</Form.Label>
                  <Select classNamePrefix="react-select" options={[]} value={values.type} onChange={handleChangeType} />
                </Form.Group>
              </Col>
            )}
            {type === 'PI' && (
              <Col md="12">
                <Form.Group controlId="purchaseItem">
                  <Form.Label> {f({ id: 'purchaseOrder.detail.purchaseItem.modal.purchaseItem' })}</Form.Label>
                  <AutocompletePurchaseItem
                    onSelect={(value) => handleSelect('purchaseItem', value)}
                    editData={editData}
                    inputProps={{ required: true, isInvalid: !!errors.purchaseItem, disabled: isEdit }}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.purchaseItem ? 'block' : 'none' }}>
                    {f({ id: 'purchaseOrder.field.purchaseItem.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            {type === 'MAT' && (
              <Col md="12">
                <Form.Group controlId="material">
                  <Form.Label> {f({ id: 'purchaseOrder.detail.purchaseItem.modal.purchaseItem' })}</Form.Label>
                  <AutocompleteMaterial
                    onSelect={(value) => handleSelect('material', value)}
                    editData={editData}
                    inputProps={{ required: true, isInvalid: !!errors.material, disabled: isEdit }}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.material ? 'block' : 'none' }}>
                    {f({ id: 'purchaseOrder.field.purchaseItem.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md="12">
              <Form.Group controlId="amount">
                <Form.Label>{f({ id: 'purchaseOrder.field.amount' })}</Form.Label>
                <Form.Control required min={1} type="number" value={values.amount} onChange={handleChange} isInvalid={!!errors.amount} />
                <Form.Control.Feedback type="invalid">{f({ id: 'purchaseOrder.field.amount.invalid' })}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={onHide}>
            {f({ id: 'common.cancel' })}
          </Button>
          <Button type="submit">{isEdit ? f({ id: 'common.update' }) : f({ id: 'common.add' })}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddPurchaseItemModal;
