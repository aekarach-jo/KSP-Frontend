import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { FormikProvider, useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, FormLabel, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import SupplierSelect from 'components/async-select/SupplierSelect';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import moment from 'moment';
import AutoCompleteEmployee from '../../../master/tooling-detail/components/AutoCompleteEmployee';
import AutoCompleteSupplier from '../../../master/tooling-detail/components/AutoCompleteSupplier';

const MachineDetailCard = ({ name, disabled, formValues, validationSchema, onChange, onDelete, isOpenModal, setIsOpenModal }) => {
  const { formatMessage: f } = useIntl();

  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [responseName, setResponseName] = useState();

  const isEdit = !!formValues;

  useEffect(() => {
    const storedValue = localStorage.getItem('token');
    const token = JSON.parse(storedValue);
    const ResName = token.user?.employee;
    setResponseName(`${ResName.firstName}${' '}${ResName.lastName}`);
  }, [formValues]);

  const onSubmit = (values) => {
    // const formData = {
    //   maintenanceBy: values.maintenanceBy?.name,
    //   responsibleBy: values.responsibleBy,
    //   maintenanceDt: values.maintenanceDt,
    //   isDefault: values.isDefault,
    // };
    onChange?.(values);
    setIsOpenAddEditModal(false);
    if (!isEdit) {
      setIsOpenModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      maintenanceBy: formValues?.maintenanceBy || '',
      responsibleBy: formValues?.responsibleBy !== undefined ? formValues?.responsibleBy : responseName || '',
      maintenanceDt: formValues?.maintenanceDt || '',
      isDefault: false,
    },
    enableReinitialize: true,
    validationSchema,
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
    handleChange({ target: { id: 'responsibleBy', value: value?.name } });
  };

  const handleSelectSupplier = (v) => {
    console.log(v);
    handleChange({ target: { id: 'maintenanceBy', value: v } });
  };

  const handlemaintenanceDt = (maintenanceDt) => {
    handleChange({ target: { id: 'maintenanceDt', value: maintenanceDt } });
  };

  return (
    <div
      className={classNames('supplier-address-detail-card form-check custom-card w-100 position-relative p-0 m-0 h-100 ', {
        'through-content': isEdit,
      })}
    >
      <input type="radio" className="form-check-input position-absolute s-5 t-2 z-index-1" name={name} checked={isEdit && values.isDefault} readOnly />
      <Card className="form-check-label w-100 h-100 cursor-pointer" body={false} onClick={handleOpenModalClick}>
        {isEdit && (
          <Card.Body>
            <Row>
              <Col>
                <Row>
                  <FormLabel>Maintenance By</FormLabel>
                  <FormLabel>{values.maintenanceBy || '-'}</FormLabel>
                </Row>
              </Col>
              <Col>
                <Row>
                  <FormLabel>Responsible By</FormLabel>
                  <FormLabel>{values.responsibleBy || '-'}</FormLabel>
                </Row>
              </Col>
              <Col>
                <Row>
                  <FormLabel> Maintenance Date</FormLabel>
                  <FormLabel>{moment(values.maintenanceDt).add(543, 'year').format('DD/MM/YYYY') || '-'}</FormLabel>
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
        <Modal.Header>
          <Modal.Title>{f({ id: `common.${isEdit ? 'edit' : 'add'}` })} Maintenance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <FormikProvider value={formik}>
              <div className="mb-3">
                <Form.Label>Maintenance By</Form.Label>
                {/* <AutoCompleteSupplier onChange={(value) => handleSelectSupplier({ name: value })} value={values.maintenanceBy} /> */}
                <SupplierSelect name="supplierList" type={['01', '02', '04', '06']} onChange={handleSelectSupplier} value={values.maintenanceBy} />
                <Form.Control.Feedback type="invalid" style={{ display: errors.maintenanceBy ? 'block' : 'none' }}>
                  Please provide Maintenance By
                </Form.Control.Feedback>
              </div>
              <div className="mb-3">
                <Form.Label>Responsible By</Form.Label>
                <AutoCompleteEmployee onChange={(value) => handleSelectEmployee({ name: value })} value={values.responsibleBy} />
                <Form.Control.Feedback type="invalid" style={{ display: errors.responsibleBy ? 'block' : 'none' }}>
                  Please provide Responsible By
                </Form.Control.Feedback>
              </div>
              <div className="mb-3">
                <Form.Label>Maintenance Date</Form.Label>
                <DatepickerThaiYear dateFormat="dd/MM/yyyy" onChange={(value) => handlemaintenanceDt(value)} value={values.maintenanceDt} />
                <Form.Control.Feedback type="invalid" style={{ display: errors.maintenanceDt ? 'block' : 'none' }}>
                  Please provide Maintenance Date
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

export default MachineDetailCard;
