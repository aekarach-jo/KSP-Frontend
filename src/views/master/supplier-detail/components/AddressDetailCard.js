import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { FieldArray, FormikProvider, useFormik, getIn } from 'formik';
import React, { useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';

const defaultFormValues = () => ({
  taxId: '',
  address: '',
  phone: [],
  fax: [],
  isDefault: false,
});

const AddressDetailCard = ({ name, disabled, formValues, validationSchema, onChange, onDelete }) => {
  const { formatMessage: f } = useIntl();

  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // console.debug('formValues :', formValues);
  const isEdit = !!formValues;

  const onSubmit = (values) => {
    // console.debug('Submit values :', values);
    setIsOpenAddEditModal(false);
    onChange?.(values);
  };

  const formik = useFormik({
    initialValues: formValues || defaultFormValues(),
    onSubmit,
    enableReinitialize: true,
    validationSchema,
  });

  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  // console.log('errors :', errors);

  const handleOpenModalClick = () => {
    resetForm();
    if (!disabled && !isEdit) {
      setIsOpenAddEditModal(true);
    }
  };

  const handleCloseModalClick = () => {
    resetForm();
    setIsOpenAddEditModal(false);
  };

  const handleAddFieldOnChange =
    ({ arrayHelpers, index, name: fieldName }) =>
    (e) => {
      const {
        target: { value },
      } = e;
      arrayHelpers.insert(index, value);
      setTimeout(() => {
        document.getElementsByName(`${fieldName}.${index}`)[0].focus();
      }, 0);
    };

  const handleAddFieldKeyPress =
    ({ arrayHelpers, index, name: fieldName }) =>
    (e) => {
      const { charCode } = e;
      const key = String.fromCharCode(charCode);
      arrayHelpers.insert(index, key);
      setTimeout(() => {
        document.getElementsByName(`${fieldName}.${index}`)[0].focus();
      }, 0);
    };

  const handleAddFieldPaste =
    ({ arrayHelpers, index, name: fieldName }) =>
    (e) => {
      const text = e.clipboardData.getData('text');
      arrayHelpers.insert(index, text);
      setTimeout(() => {
        document.getElementsByName(`${fieldName}.${index}`)[0].focus();
      }, 0);
    };

  const handleDeleteConfirm = () => {
    onDelete?.(formValues);
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className={classNames('supplier-address-detail-card form-check card custom-card w-100 position-relative p-0 m-0 h-100 mb-3', {
        'through-content': isEdit,
      })}
    >
      <input type="radio" className="form-check-input position-absolute s-5 t-2 z-index-1" name={name} checked={isEdit && values.isDefault} readOnly />
      <Card className="form-check-label w-100 h-100" body={false} onClick={handleOpenModalClick}>
        {!isEdit && (
          <Card.Body className="text-center m-auto flex-grow-0">
            <CsLineIcons icon="plus" className="cs-icon icon text-primary" />
            <span className="mt-3 text-body text-primary d-block">{f({ id: 'common.add' })}</span>
          </Card.Body>
        )}
        {isEdit && (
          <Card.Body>
            <Row as="dl" className="row g-2 m-0">
              {/* address */}
              <Row as="dl" className="row g-2 m-0">
                <Col as="dt" xs="auto" sm={7}>
                  {f({ id: 'customer.field.address' })}
                </Col>
                <Col as="dt" xs="auto" sm={2}>
                  {f({ id: 'customer.field.phone' })}
                </Col>
                <Col as="dt" xs="auto" sm={3}>
                  {f({ id: 'supplier.fax' })}
                </Col>
              </Row>
              <Col as="dd" sm={7}>
                {values.address || '-'}
              </Col>
              {/* phone */}
              <Col as="dd" sm={2}>
                {values.phone ? (
                  <ul className="list-unstyled m-0">
                    {values.phone.map((phone, index) => (
                      <li key={`${index}${phone}`}>{phone}</li>
                    ))}
                    {!values.phone.length && <li>-</li>}
                  </ul>
                ) : (
                  '-'
                )}
              </Col>
              {/* fax */}
              <Col as="dd" sm={3}>
                {values.fax ? (
                  <ul className="list-unstyled m-0">
                    {values.fax.map((fax, index) => (
                      <li key={`${index}${fax}`}>{fax}</li>
                    ))}
                    {!values.fax.length && <li>-</li>}
                  </ul>
                ) : (
                  '-'
                )}
              </Col>
            </Row>
            <div className="btn-group">
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
          <Modal.Title>{f({ id: `common.${isEdit ? 'edit' : 'add'}` })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Make <FieldArray />s works outside <Formik />: https://stackoverflow.com/a/64709017 */}
            <FormikProvider value={formik}>
              {/* <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.tax-id' })}</Form.Label>
                <Form.Control
                  type="text"
                  name="taxId"
                  onChange={handleChange}
                  value={values.taxId || ''}
                  isInvalid={errors.taxId && touched.taxId}
                  autoComplete="off"
                />
              </div> */}
              <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.address' })}</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  rows={3}
                  onChange={handleChange}
                  value={values.address || ''}
                  isInvalid={errors.address && touched.address}
                />
              </div>
              <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.phone' })}</Form.Label>
                <FieldArray
                  name="phone"
                  render={(arrayHelpers) => {
                    return [
                      !!values.phone?.length &&
                        values.phone.map((phone, idx) => (
                          <Row key={`${idx}`} className="mb-1">
                            <Col xs>
                              <Form.Control
                                type="text"
                                name={`phone.${idx}`}
                                onChange={handleChange}
                                value={phone}
                                isInvalid={getIn(errors, `phone.${idx}`) && getIn(touched, `phone.${idx}`)}
                              />
                            </Col>
                            <Col xs="auto">
                              <Button type="button" className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(idx)}>
                                <CsLineIcons icon="bin" />
                              </Button>
                            </Col>
                          </Row>
                        )),
                      <Row key={`${values.phone.length}`} className="mb-1">
                        <Col xs>
                          <Form.Control
                            type="text"
                            name={`phone.${values.phone.length}`}
                            onChange={handleAddFieldOnChange({
                              arrayHelpers,
                              index: values.phone.length,
                              name: 'phone',
                            })}
                            onKeyPress={handleAddFieldKeyPress({
                              arrayHelpers,
                              index: values.phone.length,
                              name: 'phone',
                            })}
                            onPaste={handleAddFieldPaste({
                              arrayHelpers,
                              index: values.phone.length,
                              name: 'phone',
                            })}
                            placeholder="เพิ่มโทรศัพท์..."
                          />
                        </Col>
                        <Col xs="auto">
                          <Button type="button" className="btn-icon btn-icon-only" style={{ visibility: 'hidden' }}>
                            <CsLineIcons icon="plus" />
                          </Button>
                        </Col>
                      </Row>,
                    ];
                  }}
                />
              </div>
              <div className="mb-3">
                <Form.Label>{f({ id: 'supplier.fax' })}</Form.Label>
                <FieldArray
                  name="fax"
                  render={(arrayHelpers) => {
                    return [
                      !!values.fax?.length &&
                        values.fax.map((fax, idx) => (
                          <Row key={`${idx}`} className="mb-1">
                            <Col xs>
                              <Form.Control
                                type="text"
                                name={`fax.${idx}`}
                                onChange={handleChange}
                                value={fax}
                                isInvalid={getIn(errors, `fax.${idx}`) && getIn(touched, `fax.${idx}`)}
                              />
                            </Col>
                            <Col xs="auto">
                              <Button type="button" className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(idx)}>
                                <CsLineIcons icon="bin" />
                              </Button>
                            </Col>
                          </Row>
                        )),
                      <Row key={`${values.fax.length}`} className="mb-1">
                        <Col xs>
                          <Form.Control
                            type="text"
                            name={`fax.${values.fax.length}`}
                            onChange={handleAddFieldOnChange({
                              arrayHelpers,
                              index: values.phone.length,
                              name: 'fax',
                            })}
                            onKeyPress={handleAddFieldKeyPress({
                              arrayHelpers,
                              index: values.fax.length,
                              name: 'fax',
                            })}
                            onPaste={handleAddFieldPaste({
                              arrayHelpers,
                              index: values.fax.length,
                              name: 'fax',
                            })}
                            placeholder="เพิ่มแฟกซ์..."
                          />
                        </Col>
                        <Col xs="auto">
                          <Button type="button" className="btn-icon btn-icon-only" style={{ visibility: 'hidden' }}>
                            <CsLineIcons icon="plus" />
                          </Button>
                        </Col>
                      </Row>,
                    ];
                  }}
                />
              </div>
              <div className="mb-3">
                <Form.Check
                  type="switch"
                  label={f({ id: 'customer.field.isDefault' })}
                  className="mt-2"
                  id="isDefault"
                  name="isDefault"
                  checked={values.isDefault}
                  onChange={handleChange}
                  isInvalid={errors.isDefault && touched.isDefault}
                />
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
        confirmText={f({ id: 'customer.detail.address.confirm-remove' })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AddressDetailCard;
