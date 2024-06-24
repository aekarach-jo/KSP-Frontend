import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import AutocompleteProduct from './AutocompleteProduct';

const initialValues = {
  productId: '',
  amount: 0,
  price: 0,
  reference: '',
};

const validationSchema = Yup.object().shape({
  productId: Yup.string().required('Required'),
  amount: Yup.number().min(1, 'Too Short!').required('Required'),
});

const AddProductModal = ({ modal, setModal, onAdd, isEdit, editData, data }) => {
  const [product, setProduct] = useState({});

  const onSubmit = (formData) => {
    const { amount } = formData;
    const { priceList = [], code, name } = product;
    const { price } = priceList.find((item) => amount >= item.min && amount <= (item?.max || amount));
    onAdd({ ...formData, price, amount, product: { code, name } });
    // eslint-disable-next-line no-use-before-define
    onHide();
  };

  const formik = useFormik({ initialValues: editData || initialValues, onSubmit, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, errors } = formik;

  const handleSelect = (id, value) => {
    setProduct(value);
    handleChange({ target: { id, value: value?.id } });
  };

  const onHide = () => {
    setModal(false);
    setProduct({});
    resetForm();
  };

  const PricePerUnit = () => {
    const priceList = product?.priceList;
    return (
      <>
        {priceList.map((item, idx) => (
          <div key={idx}>{`${item.min} ${item.max ? `- ${item.max}` : 'ขึ้นไป'} : ${item.price}`}</div>
        ))}
      </>
    );
  };

  return (
    <Modal show={modal} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'อัปเดตรายการสินค้า' : 'เพิ่มรายการสินค้า'}</Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Modal.Body>
          <Row className="mb-3 g-3">
            <Col md="12">
              <Form.Group controlId="productId">
                <Form.Label>ค้นหาสินค้า</Form.Label>
                <AutocompleteProduct
                  customerId={data?.customerId}
                  reference={data?.reference}
                  onSelect={(value) => handleSelect('productId', value)}
                  editData={editData}
                  inputProps={{ required: true, isInvalid: !!errors.productId, disabled: isEdit }}
                />
                <Form.Control.Feedback type="invalid" style={{ display: errors.productId ? 'block' : 'none' }}>
                  กรุณาเลือกสินค้า
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="12">
              <Form.Group controlId="amount">
                <Form.Label>จำนวน</Form.Label>
                <Form.Control readOnly min={1} type="number" value={values.amount} onChange={handleChange} isInvalid={!!errors.amount} />
                <Form.Control.Feedback type="invalid">กรุณากรอกจำนวนที่ถูกต้อง</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="12">
              <Form.Group controlId="reference">
                <Form.Label>หมายเลขอ้างอิง</Form.Label>
                <Form.Control readOnly type="text" value={values.reference} onChange={handleChange} isInvalid={!!errors.reference} />
                <Form.Control.Feedback type="invalid">กรุณากรอกหมายเลขอ้างอิง</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          {product?.priceList && (
            <Row className="mb-3 g-3">
              <Col md="12">
                <h5>ราคาต่อหน่วย</h5>
                <PricePerUnit />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={onHide}>
            ยกเลิก
          </Button>
          <Button type="submit">{isEdit ? 'อัปเดต' : 'เพิ่ม'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
