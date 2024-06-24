import React, { useCallback, useEffect, useRef } from 'react';
import { Button, CloseButton, Col, Form, Modal, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import * as Yup from 'yup';

const getDefaultValues = () => ({
  code: '',
  abbr: '',
  name: '',
  type: 'MATERIAL_COLOR',
});

const validationSchema = Yup.object();

const AddModal = ({ show, onHide, translate, tableInstance }) => {
  const ctrlCodeRef = useRef();

  useEffect(() => {
    if (show) ctrlCodeRef.current.focus();
  }, [show]);

  const { selectedFlatRows, data, setData } = tableInstance;

  const onSubmit = useCallback(
    (_data, { resetForm }) => {
      const mapped = { ..._data };
      // console.debug('Submit :', mapped);

      setData((prev) => [...prev, mapped]);

      resetForm();
      onHide();
    },
    [onHide, setData]
  );

  const { handleSubmit, handleChange, values, touched, errors } = useFormik({
    initialValues: getDefaultValues(),
    validationSchema,
    onSubmit,
  });

  console.log('color:', values);
  return (
    <Modal centered size="md" show={show} onHide={onHide}>
      <Modal.Body>
        <Row className="mb-1">
          <Col xs="auto">
            <h3>{translate.subTitle}</h3>
          </Col>
          <Col className="text-end">
            <CloseButton onClick={onHide} />
          </Col>
        </Row>
        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md="3" className="mb-1">
              <Form.Group className="position-relative tooltip-end-top" controlId="code">
                <Form.Label>{translate.field.code}</Form.Label>
                <Form.Control
                  ref={ctrlCodeRef}
                  type="text"
                  name="code"
                  onChange={handleChange}
                  value={values.code || ''}
                  isInvalid={errors.code && touched.code}
                  autoComplete="off"
                />
              </Form.Group>
            </Col>
            <Col md="3" className="mb-1">
              <Form.Group className="position-relative tooltip-end-top" controlId="abbr">
                <Form.Label>{translate.field.abbr}</Form.Label>
                <Form.Control
                  type="text"
                  name="abbr"
                  onChange={handleChange}
                  value={values.abbr || ''}
                  isInvalid={errors.abbr && touched.abbr}
                  autoComplete="off"
                />
              </Form.Group>
            </Col>
            <Col md="4" className="mb-1">
              <Form.Group className="position-relative tooltip-end-top" controlId="name">
                <Form.Label>{translate.field.name}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={values.name || ''}
                  isInvalid={errors.name && touched.name}
                  autoComplete="off"
                />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group className="position-relative tooltip-end-top">
                <Form.Label className="w-100">&nbsp;</Form.Label>
                <Button type="submit" variant="success" className="btn-icon btn-icon-only">
                  <CsLineIcons icon="check" />
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddModal;
