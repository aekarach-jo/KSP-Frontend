/* eslint-disable prefer-template */
/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-curly-brace-presence */
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { FormikProvider, useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import 'moment/locale/th';
import { Button, Card, Col, Form, FormLabel, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import SupplierSelect from 'components/async-select/SupplierSelect';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import Select from 'react-select';
import moment from 'moment';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import AutoCompleteEmployee from './AutoCompleteEmployee';
import AutoCompleteSupplier from './AutoCompleteSupplier';
import LovStatusTypeSelect from './LovStatusTypeSelect';
import LovSupplierSelect from './LovSupplierSelect';

const ToolingDetailCard = ({
  name,
  disabled,
  formValues,
  validationSchema,
  onChange,
  onDelete,
  isOpenModal,
  setIsOpenModal,
  statusOptions,
  objectiveOptions,
  onRefetchLov,
  setOnRefetchLov,
}) => {
  const { formatMessage: f } = useIntl();

  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loginName, setLoginName] = useState();
  const isEdit = !!formValues;
  moment.locale('th');

  useEffect(() => {
    const storedValue = localStorage.getItem('token');
    const token = JSON.parse(storedValue);
    const ResName = token.user.employee;
    setLoginName(`${ResName.firstName}${' '}${ResName.lastName}`);
  }, [formValues]);

  const onSubmit = (values) => {
    const data = {
      completedDt: values.completedDt,
      modifiedBy: values.modifiedBy,
      sentBy: values.sentBy,
      sentDt: values.sentDt,
      objective: values.objective,
      statusType: values.statusType,
      returnStatus: values.returnStatus,
    };
    onChange?.(data);
    setIsOpenAddEditModal(false);
    if (!isEdit) {
      setIsOpenModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      sentDt: formValues?.sentDt || '',
      completedDt: formValues?.completedDt || '',
      sentBy: formValues?.sentBy !== undefined ? formValues?.sentBy : loginName,
      modifiedBy: formValues?.modifiedBy || '',
      statusType: formValues?.statusType || '',
      objective: formValues?.objective || '',
      returnStatus: formValues?.returnStatus || false,
    },
    validationSchema,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit,
  });

  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  useEffect(() => {
    if (isOpenModal) {
      setIsOpenAddEditModal(true);
    }
  }, [isOpenModal]);

  const handleOpenModalClick = () => {
    resetForm();
    if (!disabled && !isEdit) {
      setIsOpenAddEditModal(true);
    }
  };

  const handleCloseModalClick = () => {
    resetForm();
    setIsOpenAddEditModal(false);
    if (!isEdit) {
      setIsOpenModal(false);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.(formValues);
    setIsDeleteModalOpen(false);
  };

  const handleSelectEmployee = (value) => {
    handleChange({ target: { id: 'sentBy', value: value?.name } });
  };

  const handleSelectSupplier = (v) => {
    console.log(v);
    handleChange({ target: { id: 'modifiedBy', value: v } });
  };

  const handlesentDt = (value) => {
    const sentDt = value;
    handleChange({ target: { id: 'sentDt', value: sentDt } });
  };

  const handleReturnStatus = () => {
    const status = true;
    handleChange({ target: { id: 'returnStatus', value: status } });
  };

  const handlecompletedDt = (value) => {
    const completedDt = value;
    handleChange({ target: { id: 'completedDt', value: completedDt } });
    handleReturnStatus();
  };

  const handleChangeObjective = (value) => {
    const objective = value;
    handleChange({ target: { id: 'objective', value: objective } });
  };

  const handleChangeStatusTypeItem = (value) => {
    const statusType = value;
    console.log(value);
    handleChange({ target: { id: 'statusType', value: statusType } });
  };

  // console.log(values);
  return (
    <div
      className={classNames('supplier-address-detail-card form-check custom-card w-100 position-relative p-0 mb-2 h-100 ', {
        'through-content': isEdit,
      })}
    >
      <input type="radio" className="form-check-input position-absolute s-5 t-2 z-index-1" name={name} checked={isEdit && values.isDefault} readOnly />
      <Card className="form-check-label w-100 h-100 cursor-pointer" onClick={handleOpenModalClick}>
        {isEdit && (
          <Card.Body>
            <Row as="dl" className="row g-2 m-0">
              <Col as="dt" xs="6" md="4">
                <Row>
                  <div className="d-flex flex-column">
                    <FormLabel>{f({ id: 'tooling.mantenance.sent-dt' })}</FormLabel>
                    <FormLabel>{moment(values.sentDt).add(543, 'year').format('DD/MM/YYYY')}</FormLabel>
                  </div>
                </Row>
              </Col>
              <Col as="dt" xs="6" md="4">
                <Row>
                  {' '}
                  <div className="d-flex flex-column">
                    <FormLabel>{f({ id: 'tooling.mantenance.complete-dt' })}</FormLabel>
                    <FormLabel> {values.completedDt !== '' ? moment(values.completedDt).add(543, 'year').format('DD/MM/YYYY') : '-'}</FormLabel>
                  </div>{' '}
                </Row>
              </Col>
              <Col as="dt" xs="6" md="4">
                <Row>
                  <div className="d-flex flex-column">
                    <FormLabel>{f({ id: 'tooling.objective' })}</FormLabel>
                    <FormLabel> {values.objective.value}</FormLabel>
                  </div>
                </Row>
              </Col>
              <Col as="dt" xs="6" md="4">
                <Row>
                  <div className="d-flex flex-column">
                    <FormLabel>{f({ id: 'tooling.statusType' })}</FormLabel>
                    <FormLabel>{values.statusType.label}</FormLabel>
                  </div>{' '}
                </Row>
              </Col>
              <Col as="dt" xs="6" md="4">
                <Row>
                  <div className="d-flex flex-column">
                    <FormLabel>{f({ id: 'tooling.mantenance.sent-by' })}</FormLabel>
                    <FormLabel>{values.sentBy || '-'}</FormLabel>
                  </div>{' '}
                </Row>
              </Col>
              <Col as="dt" xs="6" md="4">
                <Row>
                  <div className="d-flex flex-column">
                    <FormLabel>{f({ id: 'tooling.mantenance.modified-by' })}</FormLabel>
                    <FormLabel>{values?.modifiedBy?.label || values?.modifiedBy || '-'}</FormLabel>
                  </div>
                </Row>
              </Col>
            </Row>
            <div className="btn-group" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <Button className="btn-icon btn-icon-only" variant="outline-info" size="sm" onClick={() => setIsOpenAddEditModal(true)} disabled={disabled}>
                <CsLineIcons icon="edit" />
              </Button>{' '}
              <Button className="btn-icon btn-icon-only" variant="outline-danger" size="sm" onClick={() => setIsDeleteModalOpen(true)} disabled={disabled}>
                <CsLineIcons icon="bin" />
              </Button>
            </div>
          </Card.Body>
        )}
      </Card>

      <Modal className="modal-right large fade" show={isOpenAddEditModal} onHide={handleCloseModalClick}>
        <Modal.Header closeButton>
          <Modal.Title>
            {f({ id: `common.${isEdit ? 'edit' : 'add'}` })} {f({ id: 'tooling.mantenance' })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <FormikProvider value={formik}>
              <div className="mb-3">
                <Form.Label> {f({ id: 'tooling.mantenance.sent-dt' })}</Form.Label>
                <DatepickerThaiYear dateFormat="dd/MM/yyyy" onChange={(value) => handlesentDt(value)} value={values.sentDt} />
                <Form.Control.Feedback type="invalid" style={{ display: errors.sentDt ? 'block' : 'none' }}>
                  {f({ id: 'tooling.detail.validation.modify.sent-dt.required' })}
                </Form.Control.Feedback>
              </div>
              <div className="mb-3">
                <Form.Label className="col-form-label">{f({ id: 'tooling.objective' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="customerList">
                  <Select classNamePrefix="react-select" options={objectiveOptions} value={values.objective} required onChange={handleChangeObjective} />
                </Form.Group>
              </div>
              <div className="mb-3">
                <Form.Label className="col-form-label">{f({ id: 'tooling.statusType' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="statusType">
                  {/* <Select classNamePrefix="react-select" options={statusOptions} value={values.statusType} required onChange={handleChangeStatusTypeItem} /> */}
                  <LovStatusTypeSelect
                    classNamePrefix="react-select"
                    // options={statusOptions}
                    value={values.statusType}
                    required
                    onRefetchLov={onRefetchLov}
                    setOnRefetchLov={setOnRefetchLov}
                    onChange={handleChangeStatusTypeItem}
                  />
                </Form.Group>
              </div>
              <div className="mb-3">
                <Form.Label> {f({ id: 'tooling.mantenance.complete-dt' })}</Form.Label>
                <DatepickerThaiYear dateFormat="dd/MM/yyyy" onChange={(value) => handlecompletedDt(value)} value={values.completedDt} />
                <Form.Control.Feedback type="invalid" style={{ display: errors.completedDt ? 'block' : 'none' }}>
                  {f({ id: 'tooling.detail.validation.modify.complete-dt.required' })}
                </Form.Control.Feedback>
              </div>
              <div className="mb-3">
                <Form.Label> {f({ id: 'tooling.mantenance.sent-by' })}</Form.Label>
                <AutoCompleteEmployee onChange={(value) => handleSelectEmployee({ name: value })} value={values.sentBy} inputProps={{ required: true }} />
                <Form.Control.Feedback type="invalid" style={{ display: errors.sentBy ? 'block' : 'none' }}>
                  {f({ id: 'tooling.detail.validation.modify.sent-by.required' })}
                </Form.Control.Feedback>
              </div>
              <div className="mb-3">
                <Form.Label> {f({ id: 'tooling.mantenance.modified-by' })}</Form.Label>
                {/* <AutoCompleteSupplier onChange={(value) => handleSelectSupplier({ name: value })} value={values.modifiedBy} inputProps={{ required: true }} /> */}
                {/* <SupplierSelect name="modifiedBy" type={['01', '02', '03', '04', '06']} onChange={handleSelectSupplier} value={values.modifiedBy} /> */}
                <LovSupplierSelect
                  name="supplierId"
                  type={['01', '02', '03', '04', '06']}
                  onChange={handleSelectSupplier}
                  value={values?.modifiedBy?.value || values?.modifiedBy}
                  initialValue={values?.modifiedBy?.value || values?.modifiedBy}
                />
                <Form.Control.Feedback type="invalid" style={{ display: errors.modifiedBy ? 'block' : 'none' }}>
                  {f({ id: 'tooling.detail.validation.modify.modified-by.required' })}
                </Form.Control.Feedback>
              </div>
            </FormikProvider>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={handleCloseModalClick}>
            {f({ id: 'common.cancel' })}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {f({ id: 'common.save' })}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={isDeleteModalOpen}
        confirmText={f({ id: 'product.detail.bom.confirm-remove' })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ToolingDetailCard;
