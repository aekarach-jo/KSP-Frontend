import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { Card, Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import classNames from 'classnames';
import useConvert from 'hooks/useConvert';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';

import { QUERY } from '../constants';

const InformationForm = ({ form, getAddress, isLoading, typeOptions, setIsDisableButton, isEditMode, setType, id, setIsChangeType }) => {
  const { formatMessage: f, formatDate: fd } = useIntl();
  const queryClient = useQueryClient();
  const { useConvertCurrency } = useConvert();

  const { handleChange, resetForm, values, errors } = form;

  useEffect(() => {
    if (values.supplierId !== '' && values.type !== '') {
      setIsDisableButton(true);
    }
  }, [values]);

  const handleSelectSupplier = (value) => {
    console.log(value);
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

  const handleChangeType = (v) => {
    setType(v.value);
    queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
      return {
        ...currentData,
        type: v,
        typePO: v.value,
      };
    });
    setIsChangeType(true);
  };
  const sumWeight = values.detail.reduce((a, b) => a + (b.weighingUOM === 'กรัม' ? (b.weight * b.amount) / 1000 : b.weight * b.amount), 0);
  const sumPrice = values.detail.reduce((a, b) => a + b.price * b.amount, 0);

  useEffect(() => {
    return () => {
      queryClient.resetQueries(QUERY.PURCHASE_ORDER, { exact: true });
      resetForm();
    };
  }, [queryClient, resetForm]);

  return (
    <>
      <h2 className="small-title">{f({ id: 'purchaseOrder.detail.information' })}</h2>
      <Card
        className={classNames('mb-5', {
          'overlay-spinner': isLoading,
        })}
      >
        <Card.Body>
          <Form noValidate>
            <Row className="form-row g-3">
              <Col className="form-col-mt" md="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="no">
                  <Form.Label>{f({ id: 'purchaseOrder.field.no' })}</Form.Label>
                  <Form.Control type="text" name="no" value={values.no || ''} onChange={handleChange} disabled={!isEditMode} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'purchaseOrder.field.no.required' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="type">
                  <Form.Label>{f({ id: 'purchaseOrder.field.type' })}</Form.Label>
                  <Select
                    classNamePrefix="react-select"
                    isDisabled={id}
                    options={typeOptions}
                    value={values.type}
                    onChange={handleChangeType}
                    required
                    placeholder=""
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.type ? 'block' : 'none' }}>
                    {f({ id: 'purchaseOrder.field.type.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="status">
                  <Form.Label>{f({ id: 'purchaseOrder.field.status' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.status || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="supplierId">
                  <Form.Label>{f({ id: 'purchaseOrder.field.supplierId' })}</Form.Label>
                  <LovSupplierSelect
                    isDisabled={!isEditMode}
                    name="supplierName"
                    onChange={handleSelectSupplier}
                    value={values.supplierId}
                    initialValue={values.supplierName}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.supplierId ? 'block' : 'none' }}>
                    {f({ id: 'purchaseOrder.field.supplierId.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="supplierAddress">
                  <Form.Label>{f({ id: 'purchaseOrder.field.supplierAddress' })}</Form.Label>
                  <Form.Control readOnly type="text" value={values.supplierAddress || ''} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'purchaseOrder.field.supplierAddress.required' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="createdAt">
                  <Form.Label>{f({ id: 'purchaseOrder.field.createdAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.createdAt === ''
                        ? ''
                        : fd(values.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                            .replace('/', '-')
                            .replace('/', '-') || ''
                    }
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="createdBy">
                  <Form.Label>{f({ id: 'purchaseOrder.field.createdBy' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.createdBy || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="updatedAt">
                  <Form.Label>{f({ id: 'purchaseOrder.field.updatedAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.updatedAt === ''
                        ? ''
                        : fd(values.updatedAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                            .replace('/', '-')
                            .replace('/', '-') || ''
                    }
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="updatedBy">
                  <Form.Label>{f({ id: 'purchaseOrder.field.updatedBy' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.updatedBy || ''} />
                </Form.Group>
              </Col>
            
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top">
                  <Form.Label>{f({ id: 'purchaseOrder.field.weight-condition' })}</Form.Label>
                  <Form.Control type="text" readOnly value={useConvertCurrency(values.weightCondition) || 0} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top">
                  <Form.Label>{f({ id: 'purchaseOrder.field.weight' })}</Form.Label>
                  <Form.Control
                    type="text"
                    value={useConvertCurrency(sumWeight) || 0}
                    readOnly
                    style={{ color: sumWeight < values.weightCondition ? 'red' : 'green', fontWeight: 'bold', fontSize: '15px' }}
                    isInvalid={sumWeight < values.weightCondition}
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top">
                  <Form.Label>{f({ id: 'purchaseOrder.field.price-condition' })}</Form.Label>
                  <Form.Control type="text" readOnly value={useConvertCurrency(values.priceCondition) || 0} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top">
                  <Form.Label>{f({ id: 'purchaseOrder.field.price' })}</Form.Label>
                  <Form.Control
                    type="text"
                    value={useConvertCurrency(sumPrice) || 0}
                    readOnly
                    style={{ color: sumPrice < values.priceCondition ? 'red' : 'green', fontWeight: 'bold', fontSize: '15px' }}
                    isInvalid={sumPrice < values.priceCondition}
                  />
                </Form.Group>
              </Col>
              {/* {sumWeight > values.weightCondition && (
                <Col md="6" lg="6">
                  <Form.Group className="position-relative tooltip-end-top">
                    <Form.Label>ราคารวม</Form.Label>
                  </Form.Group>
                </Col>
              )}
              {sumWeight > values.weightCondition && (
                <Col md="6" lg="6">
                  <Form.Group className="position-relative tooltip-end-top">
                    <Form.Label>ราคารวม</Form.Label>
                  </Form.Group>
                </Col>
              )} */}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default InformationForm;
