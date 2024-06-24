import React, { useEffect, useState } from 'react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { FieldArray, FormikProvider, useFormik, getIn } from 'formik';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import clx from 'classnames';

const AddGroupModal = (props) => {
  const { show, loading, onHide, onSubmit } = props;

  const inputRefName = React.useRef();

  const { formatMessage: f } = useIntl();

  const initialValues = { name: '' };

  const onFormSubmit = (values) => {
    // console.log('submit form', values);
    onSubmit?.(values);
  };

  const formik = useFormik({ initialValues, onSubmit: onFormSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  useEffect(() => {
    if (show) {
      inputRefName.current.focus();
    } else {
      handleReset();
    }
  }, [handleReset, show]);

  const handleCloseModalClick = () => {
    handleReset();
    onHide?.();
  };

  return (
    <Modal
      centered
      className="large fade"
      show={show}
      onHide={handleCloseModalClick}
      contentClassName={clx({ 'overlay-spinner': loading })}
      backdrop={loading ? 'static' : true}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>{f({ id: 'production.group.add-group' })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col xs={12} md={6} className="mb-3">
              <Form.Label>{f({ id: 'production.group.field.groupName' })}</Form.Label>
              <Form.Control ref={inputRefName} type="text" name="name" onChange={handleChange} value={values.name} autoComplete="off" />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={handleCloseModalClick}>
            {f({ id: 'common.cancel' })}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {f({ id: 'common.add' })}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddGroupModal;
