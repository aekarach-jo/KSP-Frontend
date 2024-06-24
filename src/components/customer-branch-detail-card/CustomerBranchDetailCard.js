import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { FieldArray, FormikProvider, useFormik, getIn } from 'formik';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import './styles.scss';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import { mobileOrPhoneFormatMask } from 'utils/number-format';

const defaultFormValues = () => ({
  contacts: [
    {
      name: '',
      email: '',
      phone: '',
    },
  ],
  email: [],
  address: '',
  phone: [],
  fax: [],
  isDefault: false,
});

const CustomerBranchDetailCard = ({ name, disabled, formValues, validationSchema, onChange, onDelete }) => {
  const { formatMessage: f } = useIntl();

  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // console.debug('formValues :', formValues);
  const isEdit = !!formValues;

  const overlayDelay = useMemo(() => ({ show: 100, hide: 0 }), []);
  const overlayElement = useMemo(() => <Tooltip id="tooltip-top">{f({ id: 'customer.field.isDefault' })}</Tooltip>, [f]);

  const onSubmit = (values) => {
    // console.debug('Submit values :', values);
    onChange?.(values);
    setIsOpenAddEditModal(false);
  };

  const formik = useFormik({
    initialValues: formValues || defaultFormValues(),
    onSubmit,
    enableReinitialize: true,
    validationSchema,
  });

  const { handleSubmit, handleChange, setFieldValue, resetForm, values, touched, errors } = formik;

  const isDefaultChecked = useMemo(() => isEdit && values.isDefault, [isEdit, values.isDefault]);

  const handlePhoneChange = useCallback(
    (id) =>
      ({ value }) => {
        setFieldValue(id, value);
      },
    [setFieldValue]
  );
  // console.log('errors :', errors);
  // console.log('values :', values);

  const handleOpenModalClick = useCallback(() => {
    resetForm();
    if (!disabled && !isEdit) {
      setIsOpenAddEditModal(true);
    }
  }, [disabled, isEdit, resetForm]);

  const handleCloseModalClick = useCallback(() => {
    resetForm();
    setIsOpenAddEditModal(false);
  }, [resetForm]);

  const handleAddFieldOnChange = useCallback(
    ({ arrayHelpers, index, name: fieldName }) =>
      (e) => {
        const {
          target: { value },
        } = e;
        arrayHelpers.insert(index, value);
        setTimeout(() => {
          document.getElementsByName(`${fieldName}.${index}`)[0].focus();
        }, 0);
      },
    []
  );

  const handleAddFieldKeyPress = useCallback(
    ({ arrayHelpers, index, name: fieldName }) =>
      (e) => {
        const { charCode } = e;
        const key = String.fromCharCode(charCode);
        arrayHelpers.insert(index, key);
        setTimeout(() => {
          document.getElementsByName(`${fieldName}.${index}`)[0].focus();
        }, 0);
      },
    []
  );

  const handleAddFieldPaste = useCallback(
    ({ arrayHelpers, index, name: fieldName }) =>
      (e) => {
        const text = e.clipboardData.getData('text');
        arrayHelpers.insert(index, text);
        setTimeout(() => {
          document.getElementsByName(`${fieldName}.${index}`)[0].focus();
        }, 0);
      },
    []
  );
  const handleContactAddFieldOnChange = useCallback(
    ({ arrayHelpers, index, name: fieldName }) =>
      (e) => {
        const {
          target: { value },
        } = e;
        arrayHelpers.insert(index, { name: value });
        setTimeout(() => {
          document.getElementsByName(`${fieldName}`)[0].focus();
        }, 0);
      },
    []
  );

  const handleContactAddFieldKeyPress = useCallback(
    ({ arrayHelpers, index, name: fieldName }) =>
      (e) => {
        const { charCode } = e;
        const key = String.fromCharCode(charCode);
        arrayHelpers.insert(index, { name: key });
        setTimeout(() => {
          document.getElementsByName(`${fieldName}`)[0].focus();
        }, 0);
      },
    []
  );

  const handleContactAddFieldPaste = useCallback(
    ({ arrayHelpers, index, name: fieldName }) =>
      (e) => {
        const text = e.clipboardData.getData('text');
        arrayHelpers.insert(index, { name: text });
        setTimeout(() => {
          document.getElementsByName(`${fieldName}`)[0].focus();
        }, 0);
      },
    []
  );

  const handleDeleteConfirm = useCallback(() => {
    onDelete?.(formValues);
    setIsDeleteModalOpen(false);
  }, [formValues, onDelete]);

  const handleRemoveClick = useCallback((arrayHelpers, idx) => () => arrayHelpers.remove(idx), []);

  const renderFieldArrayContactName = useCallback(
    (arrayHelpers) => {
      return [
        values.contacts?.map((contact, idx) => (
          <Fragment key={`${idx}`}>
            <Row className="mb-2">
              <Col xs>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name={`contacts.${idx}.name`}
                    onChange={handleChange}
                    value={contact.name || ''}
                    isInvalid={getIn(errors, `contacts.${idx}.name`) && getIn(touched, `contacts.${idx}.name`)}
                    style={{ flexGrow: 1.5 }}
                  />
                  <Form.Control
                    type="text"
                    name={`contacts.${idx}.department`}
                    value={contact.department || ''}
                    className="placeholder-muted"
                    onChange={handleChange}
                    placeholder={f({ id: 'customer.detail.address.department.placeholder' })}
                  />
                </InputGroup>
                {getIn(errors, `contacts.${idx}.name`) && getIn(touched, `contacts.${idx}.name`) && (
                  <div className="d-block invalid-feedback">{f({ id: getIn(errors, `contacts.${idx}.name`) })}</div>
                )}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Form.Control
                  as={NumberFormat}
                  format={mobileOrPhoneFormatMask(contact.phone)}
                  type="tel"
                  name={`contacts.${idx}.phone`}
                  onValueChange={handlePhoneChange(`contacts.${idx}.phone`)}
                  value={contact.phone}
                  className="placeholder-muted"
                  placeholder={f({ id: 'customer.field.phone' })}
                  isInvalid={getIn(errors, `contacts.${idx}.phone`) && getIn(touched, `contacts.${idx}.phone`)}
                />
                {getIn(errors, `contacts.${idx}.phone`) && getIn(touched, `contacts.${idx}.phone`) && (
                  <div className="d-block invalid-feedback">{f({ id: getIn(errors, `contacts.${idx}.phone`) })}</div>
                )}
              </Col>
              <Col>
                <Form.Control
                  type="email"
                  name={`contacts.${idx}.email`}
                  onChange={handleChange}
                  value={contact.email}
                  className="placeholder-muted"
                  placeholder={f({ id: 'customer.field.email' })}
                  isInvalid={getIn(errors, `contacts.${idx}.email`) && getIn(touched, `contacts.${idx}.email`)}
                />
                {getIn(errors, `contacts.${idx}.email`) && getIn(touched, `contacts.${idx}.email`) && (
                  <div className="d-block invalid-feedback">{f({ id: getIn(errors, `contacts.${idx}.email`) })}</div>
                )}
              </Col>
              <Col xs="auto">
                <Button type="button" className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(idx)}>
                  <CsLineIcons icon="bin" />
                </Button>
              </Col>
            </Row>
            <hr />
          </Fragment>
        )),
        <Row key={`${values.contacts?.length || 0}`} className="mb-1">
          <Col xs>
            <Form.Control
              type="text"
              name={`contact.${values.contacts?.length || 0}`}
              className="placeholder-muted"
              onChange={handleContactAddFieldOnChange({
                arrayHelpers,
                index: values.contacts?.length || 0,
                name: `contacts.${values.contacts?.length || 0}.name`,
              })}
              onKeyPress={handleContactAddFieldKeyPress({
                arrayHelpers,
                index: values.contacts?.length || 0,
                name: `contacts.${values.contacts?.length || 0}.name`,
              })}
              onPaste={handleContactAddFieldPaste({
                arrayHelpers,
                index: values.contacts?.length || 0,
                name: `contacts.${values.contacts?.length || 0}.name`,
              })}
              placeholder={f({ id: 'customer.detail.address.contactName.placeholder' })}
              isInvalid={errors.contacts === 'string' && touched.contacts}
            />
            {typeof errors.contacts === 'string' && touched.contacts && <div className="d-block invalid-feedback">{f({ id: errors.contacts })}</div>}
          </Col>
          {/* <Col xs="auto">
            <Button type="button" className="btn-icon btn-icon-only" style={{ visibility: 'hidden' }}>
              <CsLineIcons icon="plus" />
            </Button>
          </Col> */}
        </Row>,
      ];
    },
    [
      errors,
      f,
      handleChange,
      handleContactAddFieldKeyPress,
      handleContactAddFieldOnChange,
      handleContactAddFieldPaste,
      handlePhoneChange,
      touched,
      values.contacts,
    ]
  );

  const renderFieldArrayEmail = useCallback(
    (arrayHelpers) => {
      return [
        values.email?.map((email, idx) => (
          <Row key={`${idx}`} className="mb-1">
            <Col xs>
              <Form.Control
                type="text"
                name={`email.${idx}`}
                onChange={handleChange}
                value={email}
                isInvalid={getIn(errors, `email.${idx}`) && getIn(touched, `email.${idx}`)}
              />
              {getIn(errors, `email.${idx}`) && getIn(touched, `email.${idx}`) && (
                <div className="d-block invalid-feedback">{f({ id: getIn(errors, `email.${idx}`) })}</div>
              )}
            </Col>
            <Col xs="auto">
              <Button type="button" className="btn-icon btn-icon-only" variant="outline-danger" onClick={handleRemoveClick(arrayHelpers, idx)}>
                <CsLineIcons icon="bin" />
              </Button>
            </Col>
          </Row>
        )),
        <Row key={`${values.email.length}`} className="mb-1">
          <Col xs>
            <Form.Control
              type="text"
              name={`email.${values.email.length}`}
              className="placeholder-muted"
              onChange={handleAddFieldOnChange({
                arrayHelpers,
                index: values.email.length,
                name: 'email',
              })}
              onKeyPress={handleAddFieldKeyPress({
                arrayHelpers,
                index: values.email.length,
                name: 'email',
              })}
              onPaste={handleAddFieldPaste({
                arrayHelpers,
                index: values.email.length,
                name: 'email',
              })}
              placeholder={f({ id: 'customer.detail.address.email.placeholder' })}
            />
          </Col>
          <Col xs="auto">
            <Button type="button" className="btn-icon btn-icon-only" style={{ visibility: 'hidden' }}>
              <CsLineIcons icon="plus" />
            </Button>
          </Col>
        </Row>,
      ];
    },
    [errors, f, handleAddFieldKeyPress, handleAddFieldOnChange, handleAddFieldPaste, handleChange, handleRemoveClick, touched, values.email]
  );

  const renderFieldArrayPhone = useCallback(
    (arrayHelpers) => {
      return [
        !!values.phone?.length &&
          values.phone.map((phone, idx) => (
            <Row key={`${idx}`} className="mb-1">
              <Col xs>
                <Form.Control
                  as={NumberFormat}
                  format={mobileOrPhoneFormatMask(phone)}
                  type="tel"
                  name={`phone.${idx}`}
                  // onChange={handleChange}
                  onValueChange={handlePhoneChange(`phone.${idx}`)}
                  value={phone}
                  isInvalid={getIn(errors, `phone.${idx}`) && getIn(touched, `phone.${idx}`)}
                />
                {getIn(errors, `phone.${idx}`) && getIn(touched, `phone.${idx}`) && (
                  <div className="d-block invalid-feedback">{f({ id: getIn(errors, `phone.${idx}`) })}</div>
                )}
              </Col>
              <Col xs="auto">
                <Button type="button" className="btn-icon btn-icon-only" variant="outline-danger" onClick={handleRemoveClick(arrayHelpers, idx)}>
                  <CsLineIcons icon="bin" />
                </Button>
              </Col>
            </Row>
          )),
        <Row key={`${values.phone.length}`} className="mb-1">
          <Col xs>
            <Form.Control
              type="tel"
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
              placeholder={f({ id: 'customer.detail.phone.placeholder' })}
            />
          </Col>
          <Col xs="auto">
            <Button type="button" className="btn-icon btn-icon-only" style={{ visibility: 'hidden' }}>
              <CsLineIcons icon="plus" />
            </Button>
          </Col>
        </Row>,
      ];
    },
    [errors, f, handleAddFieldKeyPress, handleAddFieldOnChange, handleAddFieldPaste, handlePhoneChange, handleRemoveClick, touched, values.phone]
  );

  const renderFieldArrayFax = useCallback(
    (arrayHelpers) => {
      return [
        !!values.fax?.length &&
          values.fax.map((fax, idx) => (
            <Row key={`${idx}`} className="mb-1">
              <Col xs>
                <Form.Control
                  as={NumberFormat}
                  format={mobileOrPhoneFormatMask(fax)}
                  type="tel"
                  name={`fax.${idx}`}
                  // onChange={handleChange}
                  onValueChange={handlePhoneChange(`fax.${idx}`)}
                  value={fax}
                  isInvalid={getIn(errors, `fax.${idx}`) && getIn(touched, `fax.${idx}`)}
                />
                {getIn(errors, `fax.${idx}`) && getIn(touched, `fax.${idx}`) && (
                  <div className="d-block invalid-feedback">{f({ id: getIn(errors, `fax.${idx}`) })}</div>
                )}
              </Col>
              <Col xs="auto">
                <Button type="button" className="btn-icon btn-icon-only" variant="outline-danger" onClick={handleRemoveClick(arrayHelpers, idx)}>
                  <CsLineIcons icon="bin" />
                </Button>
              </Col>
            </Row>
          )),
        <Row key={`${values.fax.length}`} className="mb-1">
          <Col xs>
            <Form.Control
              type="tel"
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
              placeholder={f({ id: 'customer.detail.fax.placeholder' })}
            />
          </Col>
          <Col xs="auto">
            <Button type="button" className="btn-icon btn-icon-only" style={{ visibility: 'hidden' }}>
              <CsLineIcons icon="plus" />
            </Button>
          </Col>
        </Row>,
      ];
    },
    [
      errors,
      f,
      handleAddFieldKeyPress,
      handleAddFieldOnChange,
      handleAddFieldPaste,
      handlePhoneChange,
      handleRemoveClick,
      touched,
      values.fax,
      values.phone.length,
    ]
  );

  return (
    <div
      className={classNames('customer-branch-detail-card form-check card custom-card w-100 position-relative p-0 m-0 h-100', {
        'through-content': isEdit,
      })}
    >
      <OverlayTrigger delay={overlayDelay} placement="top" overlay={overlayElement}>
        <input type="radio" className="form-check-input position-absolute s-5 t-2 z-index-1" name={name} checked={isDefaultChecked} readOnly />
      </OverlayTrigger>
      <Card className="form-check-label w-100 h-100" body={false} onClick={handleOpenModalClick}>
        {!isEdit && (
          <Card.Body className="text-center m-auto flex-grow-0">
            <CsLineIcons icon="plus" className="cs-icon icon text-primary" />
            <span className="mt-3 text-body text-primary d-block">{f({ id: 'customer.detail.address.add' })}</span>
          </Card.Body>
        )}
        {isEdit && (
          <Card.Body>
            <Row as="dl" className="row g-2 m-0">
              {/* Contact name */}
              <Row as="dt" xs="auto">
                <Col as="dd" sm={5}>
                  {f({ id: 'customer.field.contactName' })}
                </Col>
                <Col as="dd" sm={7}>
                  {f({ id: 'customer.field.address' })}
                </Col>
              </Row>
              <Col as="dd" sm={5}>
                {values.contacts?.length ? (
                  <ol style={{ paddingLeft: '15px' }} className="list-group m-0">
                    {values.contacts.map((contact, index) => (
                      <li key={`${index}${contact.name}`}>
                        <div>
                          {contact.name || '-'} {contact.department && <span>({contact.department})</span>}
                        </div>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`}>
                            <NumberFormat value={contact.phone} displayType="text" format={mobileOrPhoneFormatMask(contact.phone)} />
                          </a>
                        )}
                        {contact.email && (
                          <div>
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  '-'
                )}
              </Col>
              {/* address */}
              <Col as="dd" sm={7}>
                {values.address || '-'}
              </Col>
              {/* fax */}
              {!!values.fax?.length && (
                <>
                  <Col as="dd" sm={5}>
                    {f({ id: 'customer.field.fax' })}
                    <ul className="list-unstyled m-0">
                      {values.fax.map((fax, index) => (
                        <li key={`${index}${fax}`}>
                          <NumberFormat value={fax} displayType="text" format={mobileOrPhoneFormatMask(fax)} />
                        </li>
                      ))}
                      {!values.fax.length && <li>-</li>}
                    </ul>
                  </Col>
                  {/* Note */}
                  <Col as="dd" sm={7}>
                    {f({ id: 'customer.field.note' })}
                    <div style={{ whiteSpace: 'pre' }}>{values.note || '-'}</div>
                  </Col>
                </>
              )}
            </Row>
            {!disabled && (
              <div className="btn-group">
                <Button className="btn-icon btn-icon-only" variant="outline-info" size="sm" onClick={() => setIsOpenAddEditModal(true)} disabled={disabled}>
                  <CsLineIcons icon="edit" />
                </Button>{' '}
                <Button className="btn-icon btn-icon-only" variant="outline-danger" size="sm" onClick={() => setIsDeleteModalOpen(true)} disabled={disabled}>
                  <CsLineIcons icon="bin" />
                </Button>
              </div>
            )}
          </Card.Body>
        )}
      </Card>

      <Modal scrollable className="modal-right scroll-out-negative large fade" show={isOpenAddEditModal} onHide={handleCloseModalClick}>
        <Modal.Header>
          <Modal.Title>{f({ id: `customer.detail.address.${isEdit ? 'edit' : 'add'}` })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Make <FieldArray />s works outside <Formik />: https://stackoverflow.com/a/64709017 */}
            <FormikProvider value={formik}>
              <div className="mb-3">
                <Form.Label className="required">{f({ id: 'customer.field.contactName' })}</Form.Label>
                <FieldArray name="contacts" render={renderFieldArrayContactName} />
              </div>
              <div className="mb-3">
                <Form.Label className="required">{f({ id: 'customer.field.address' })}</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  rows={3}
                  onChange={handleChange}
                  value={values.address || ''}
                  isInvalid={errors.address && touched.address}
                />
                {errors.address && touched.address && <div className="d-block invalid-feedback">{f({ id: errors.address })}</div>}
              </div>
              {/* <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.email' })}</Form.Label>
                <FieldArray name="email" render={renderFieldArrayEmail} />
              </div>
              <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.phone' })}</Form.Label>
                <FieldArray name="phone" render={renderFieldArrayPhone} />
              </div> */}
              <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.fax' })}</Form.Label>
                <FieldArray name="fax" render={renderFieldArrayFax} />
              </div>
              <div className="mb-3">
                <Form.Label>{f({ id: 'customer.field.note' })}</Form.Label>
                <Form.Control as="textarea" name="note" type="text" value={values.note || ''} rows={4} onChange={handleChange} />
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

export default CustomerBranchDetailCard;
