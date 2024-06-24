import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import LovMasterProductSelect from 'components/lov-select/LovMasterProductSelect';

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

const AddProductModal = ({ modal, setModal, onAdd, isEdit, editData, customerId, productId }) => {
  const { formatMessage: f } = useIntl();

  const [product, setProduct] = useState({});
  const [priceLists, setPriceList] = useState();

  const onSubmit = (formData) => {
    const { amount } = formData;
    const { priceList = [], code, name } = product;
    const { price } =
      priceList.find((item) => amount >= item.min && amount <= (item?.max || amount)) === undefined
        ? priceList.find((item) => item?.max === Math.max(...priceList.map((obj) => obj.max)))
        : priceList.find((item) => amount >= item.min && amount <= (item?.max || amount));
    const priceRange = priceList.filter((item) => (amount >= item.min && amount >= item.max) || (amount >= item.min && amount <= (item?.max || amount)));
    onAdd({ ...formData, price, amount, product: { code, name }, priceRange });
    // eslint-disable-next-line no-use-before-define
    onHide();
  };

  const formik = useFormik({ initialValues: editData || initialValues, onSubmit, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, errors } = formik;
  const handleSelect = (id, value) => {
    if (value === null) {
      setProduct({});
    } else {
      setProduct(value.detail);
    }
    handleChange({ target: { id, value: value?.value } });
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
        {priceList.length === 0 ? (
          <>
            <h4 style={{ color: '#dc3545' }}>
              {f({ id: 'product.detail.validation.priceRange.required' })} {product?.name}
            </h4>{' '}
            <br />
          </>
        ) : (
          priceList.map((item, idx) => (
            <>
              <h4 style={{ display: 'inline-block' }}>
                <Badge bg="primary">
                  {f({ id: 'product.field.range' })} {idx + 1}
                </Badge>
              </h4>{' '}
              <span key={idx}>{`${item.min} - ${item.max} : ${item.price}`}</span>
              <br />
            </>
          ))
        )}
      </>
    );
  };
  const onSetDeliverDate = (e) => {
    handleChange({ target: { id: 'deliverDt', value: e } });
  };
  useEffect(() => {
    if (priceLists !== undefined) {
      setProduct(priceLists);
    }
  }, [modal, priceLists]);
  useEffect(() => {
    if (!isEdit) {
      setProduct({});
    }
  }, [modal, isEdit]);
  return (
    <Modal className="modal-right large" show={modal} size="xl" onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? f({ id: 'customerOrder.detail.addProductModal.title.edit' }) : f({ id: 'customerOrder.detail.addProductModal.title.add' })}
        </Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Modal.Body>
          <Row className="mb-3 g-3">
            <Col md="12">
              <Form.Group controlId="productId">
                <Form.Label>{f({ id: 'customerOrder.detail.addProductModal.search' })}</Form.Label>
                {/* <AutocompleteProduct
                  customerId={customerId}
                  onSelect={(value) => handleSelect('customerId', value)}
                  editData={editData}
                  inputProps={{ required: true, isInvalid: !!errors.customerId, disabled: isEdit }}
                /> */}
                <LovMasterProductSelect
                  isClearable
                  onChange={(value) => handleSelect('productId', value)}
                  value={values.productId}
                  customerId={customerId}
                  isEdit={isEdit}
                  setPriceList={setPriceList}
                />
                <Form.Control.Feedback type="invalid" style={{ display: errors.productId ? 'block' : 'none' }}>
                  {f({ id: 'customerOrder.detail.addProductModal.search.required' })}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="12">
              <Form.Group controlId="amount">
                <Form.Label>{f({ id: 'customerOrder.detail.addProductModal.amount' })}</Form.Label>
                <Form.Control required min={1} type="number" value={values.amount} onChange={handleChange} isInvalid={!!errors.amount} />
                <Form.Control.Feedback type="invalid">{f({ id: 'customerOrder.detail.addProductModal.amount.required' })}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="12">
              <Form.Group className="position-relative tooltip-end-top" controlId="deliverDt">
                <Form.Label>{f({ id: 'customerOrder.field.deliverDate' })}</Form.Label>
                <DatepickerThaiYear
                  className="form-control"
                  value={values.deliverDt || ''}
                  onChange={(e) => onSetDeliverDate(e)}
                  format="DD/MM/YYYY"
                  filterTime={new Date()} 
                  // plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                />
              </Form.Group>
            </Col>
            <Col md="12">
              <Form.Group controlId="reference">
                <Form.Label>{f({ id: 'customerOrder.detail.addProductModal.reference' })}</Form.Label>
                <Form.Control type="text" value={values.reference} onChange={handleChange} isInvalid={!!errors.reference} />
                <Form.Control.Feedback type="invalid">{f({ id: 'customerOrder.detail.addProductModal.reference.required' })}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          {product?.priceList && (
            <Row className="mb-3 g-3">
              <Col md="12">
                <h5>{f({ id: 'customerOrder.field.price' })}</h5>
                <PricePerUnit />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={onHide}>
            {f({ id: 'common.cancel' })}
          </Button>
          <Button type="submit" disabled={product?.priceList?.length === 0}>
            {isEdit ? f({ id: 'common.update' }) : f({ id: 'common.add' })}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
