import React from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';

const CustomField = ({ name, placeholder, isEditMode, f, formik, keyIsEnabled = 'isEnabled', keyName = 'name', keyValue = 'value' }) => {
  const { handleChange, values, touched, errors } = formik;

  return (
    <Row>
      <Col sm="4" md="3" lg="4">
        <InputGroup>
          <InputGroup.Checkbox
            name={`${name}.${keyIsEnabled}`}
            onChange={handleChange}
            checked={values[name]?.[keyIsEnabled] || false}
            value
            disabled={!isEditMode}
          />
          <Form.Control
            type="text"
            name={`${name}.${keyName}`}
            className="placeholder-muted"
            onChange={handleChange}
            value={values[name]?.[keyName] || ''}
            isInvalid={errors[name]?.[keyName] && touched[name]?.[keyName]}
            readOnly={!isEditMode}
            disabled={!values[name]?.[keyIsEnabled]}
            placeholder={placeholder}
            autoComplete="off"
          />
        </InputGroup>
      </Col>
      <Col sm="8" md="9" lg="8">
        <Form.Control
          type="text"
          name={`${name}.${keyValue}`}
          onChange={handleChange}
          value={values[name]?.[keyValue] || ''}
          isInvalid={errors[name]?.[keyValue] && touched[name]?.[keyValue]}
          readOnly={!isEditMode}
          disabled={!values[name]?.[keyIsEnabled]}
          autoComplete="off"
        />
        {errors[name]?.value && touched[name]?.value && <div className="d-block invalid-tooltip">{f({ id: errors[name]?.value })}</div>}
      </Col>
    </Row>
  );
};

export default CustomField;
