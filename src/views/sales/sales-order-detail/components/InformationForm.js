import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { Card, Col, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import DepartmentInput from 'components/input-auto/DepartmentInput';
import LovCustomerOrderSelect from 'components/lov-select/LovCustomerOrderSelect';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';

import AutocompleteCustomer from './AutocompleteCustomer';
import UploadProductModal from './UploadProductModal';

const InformationForm = ({
  form,
  getAddress,
  getCreditTerm,
  uploadModal,
  setUploadModal,
  isLoading,
  isUpload,
  setIsUpload,
  dataSO,
  isEditMode,
  setEditMode,
  customStyle,
}) => {
  const { formatMessage: f, formatDate: fd } = useIntl();
  const [saleStatus, setSaleStatus] = useState(false);
  if (!saleStatus) {
    form.values.area = dataSO.area;
    form.values.department = dataSO.department;
    form.values.salesUser = dataSO.salesUser;
    form.values.saleData = dataSO.saleData;
    form.values.departmentList = dataSO.departmentList;
    setSaleStatus(true);
  }
  const queryClient = useQueryClient();

  const { handleSubmit, handleChange, resetForm, values, errors, isValid } = form;

  const handleSelectCustomer = (value) => {
    queryClient.setQueryData('salesOrder', (currentData) => ({
      ...currentData,
      customerId: value?.detail.id,
      customerCode: value?.detail.code,
      customerAddress: getAddress(value?.detail.list),
      creditTerm: value?.detail.creditTerm,
    }));
  };

  const handleChangeReference = (e) => {
    handleChange(e);
    queryClient.setQueryData('salesOrder', (currentData) => ({
      ...currentData,
      reference: e.target.value,
    }));
  };

  const handleOnUpload = () => {
    setIsUpload(false);
    handleSubmit();
  };
  const handleSelectEmployee = (value) => {
    if (value !== null) {
      const salesUser = value.value;
      const saleArea = form.values.saleData.find((item) => item.code === value.detail?.salesArea);
      handleChange({ target: { id: 'salesUser', value: salesUser } });
      handleChange({ target: { id: 'saleCustomer', value } });
      handleChange({ target: { id: 'department', value: value.detail?.department } });
      if (saleArea !== undefined) {
        handleChange({ target: { id: 'area', value: saleArea?.name } });
      } else {
        handleChange({ target: { id: 'area', value: '' } });
      }
    } else {
      handleChange({ target: { id: 'saleCustomer', value: '' } });
      handleChange({ target: { id: 'salesUser', value: '' } });
      handleChange({ target: { id: 'department', value: '' } });
      handleChange({ target: { id: 'area', value: '' } });
    }
  };
  const onSetDeliverDate = (e) => {
    handleChange({ target: { id: 'deliverDt', value: e } });
  };

  useEffect(() => {
    return () => {
      queryClient.resetQueries('salesOrder', { exact: true });
      resetForm();
    };
  }, [queryClient, resetForm]);

  useEffect(() => {
    if (uploadModal) {
      handleSubmit();
      setIsUpload(true);
      setUploadModal(false);
    }
  }, [uploadModal, handleSubmit, setUploadModal, setIsUpload]);

  return (
    <>
      <h2 className="small-title">{f({ id: 'salesOrder.detail.information' })}</h2>
      <Card
        className={classNames('mb-5', {
          'overlay-spinner': isLoading,
        })}
      >
        <Card.Body>
          <Form noValidate>
            <Row className="form-row mb-3 g-3" style={customStyle}>
              <Col className="form-col-mt" md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="no">
                  <Form.Label>{f({ id: 'salesOrder.field.no' })}</Form.Label>
                  <Form.Control type="text" value={values.no || ''} isInvalid={!!errors.no} readOnly={!isEditMode} onChange={handleChange} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'salesOrder.field.no.required' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="customerId">
                  <Form.Label>{f({ id: 'salesOrder.field.customerName' })}</Form.Label>
                  <span className="text-danger"> *</span>
                  {/* <AutocompleteCustomer
                    value={values.customerId}
                    initialValue={values.customerName}
                    onSelect={handleSelectCustomer}
                    inputProps={{ required: true, isInvalid: !!errors.customerId }}
                  /> */}
                  <LovCustomerOrderSelect isClearable isDisabled={!isEditMode} value={values.customerId || ''} onChange={handleSelectCustomer} />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.customerId ? 'block' : 'none' }}>
                    {f({ id: 'salesOrder.field.customerName.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="customerCode">
                  <Form.Label>{f({ id: 'salesOrder.field.customerCode' })}</Form.Label>
                  <Form.Control readOnly disabled type="text" value={values.customerCode || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="8">
                <Form.Group className="position-relative tooltip-end-top" controlId="customerAddress">
                  <Form.Label>{f({ id: 'customerOrder.field.address' })}</Form.Label>
                  <Form.Control readOnly type="text" value={values.customerAddress || ''} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'customerOrder.field.address' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="validationStandard02">
                  <Form.Label>{f({ id: 'customerOrder.field.sales' })}</Form.Label>
                  <LovEmployeeSelect isDisabled={!isEditMode} isClearable value={values.salesUser || ''} onChange={handleSelectEmployee} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="validationStandard03">
                  <Form.Label>{f({ id: 'customerOrder.field.department' })}</Form.Label>
                  <DepartmentInput disabled isClearable value={values.department || ''} options={values.departmentList} />
                  <Form.Control.Feedback type="invalid">Please provide a valid city.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="validationStandard04">
                  <Form.Label>{f({ id: 'customerOrder.field.area' })}</Form.Label>
                  <Form.Control readOnly value={values.area || ''} type="text" required />
                  <Form.Control.Feedback type="invalid">Please choose a username.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="creditTerm">
                  <Form.Label>{f({ id: 'customerOrder.field.credit' })}</Form.Label>
                  <Form.Control type="number" readOnly value={values.creditTerm || ''} isInvalid={!!errors.creditTerm} />
                  <Form.Control.Feedback type="invalid">กรุณากรอกเครดิต</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="createdAt">
                  <Form.Label>{f({ id: 'salesOrder.field.createdAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.createdAt ? fd(values.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : ''
                    }
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="updatedAt">
                  <Form.Label>{f({ id: 'customerOrder.field.updatedAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.updatedAt ? fd(values.updatedAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : ''
                    }
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="createdBy">
                  <Form.Label>{f({ id: 'salesOrder.field.createdBy' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.createdBy || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="updatedBy">
                  <Form.Label>{f({ id: 'customerOrder.field.updatedBy' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.updatedBy || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="deliverDt">
                  <Form.Label>{f({ id: 'customerOrder.field.deliverDate' })}</Form.Label>
                  <DatepickerThaiYear
                    className="form-control"
                    value={values.deliverDt || ''}
                    onChange={(e) => onSetDeliverDate(e)}
                    format="YYYY/MM/DD"
                    disabled={!isEditMode}
                    // plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="deliverEx">
                  <Form.Label>{f({ id: 'customerOrder.field.exportDate' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.transferredAt
                        ? fd(values.transferredAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                        : ''
                    }
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="reference">
                  <Form.Label>{f({ id: 'salesOrder.field.reference' })}</Form.Label>
                  <Form.Control
                    type="text"
                    disabled={!isEditMode}
                    required
                    value={values.reference}
                    onChange={(e) => handleChangeReference(e)}
                    isInvalid={!!errors.reference}
                  />
                  <Form.Control.Feedback type="invalid">กรุณากรอกเลขที่อ้างอิง</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="status">
                  <Form.Label>{f({ id: 'salesOrder.field.status' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.status || ''} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      <UploadProductModal modal={isUpload && isValid} setModal={setIsUpload} onUpload={handleOnUpload} />
    </>
  );
};

export default InformationForm;
