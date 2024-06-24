import CsLineIcons from 'cs-line-icons/CsLineIcons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const InlineEdit = ({ as: As = 'div', render, input, inputProps = {}, value, disabled, onChange, ...rest }) => {
  const inputRef = useRef();
  const btnConfirmRef = useRef();
  const [internalValue, setInternalValue] = useState(value);
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleOnEditClick = useCallback(() => {
    setEditing(true);
    setTimeout(() => inputRef.current.focus(), 0);
  }, []);
  const handleConfirmClick = useCallback(() => {
    setEditing(false);
    onChange?.(internalValue);
  }, [internalValue, onChange]);
  const handleInternalValueChange = useCallback((e) => setInternalValue(e.target.value), []);
  const handleInternalKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
        onChange?.(internalValue);
        return;
      }

      if (e.key === 'Escape') {
        e.target.blur();
      }
    },
    [internalValue, onChange]
  );
  const handleInternalBlur = useCallback(
    (e) => {
      if (e.relatedTarget === btnConfirmRef.current) {
        onChange?.(internalValue);
      } else {
        setInternalValue(value);
      }
      setEditing(false);
    },
    [internalValue, onChange, value]
  );

  const FormControl = input || Form.Control;
  const Render =
    render ||
    (({ children }) => (
      <As>
        {children}{' '}
        {!disabled && (
          <Button
            variant="link"
            className="btn-icon btn-icon-only p-0"
            onClick={handleOnEditClick}
            style={{
              width: 'auto',
              height: 'auto',
              verticalAlign: 'top',
            }}
          >
            <CsLineIcons icon="edit" />
          </Button>
        )}
      </As>
    ));
  return !isEditing ? (
    <Render value={value} {...rest}>
      {value}
    </Render>
  ) : (
    <>
      <FormControl
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleInternalValueChange}
        onKeyDown={handleInternalKeyDown}
        onBlur={handleInternalBlur}
        {...inputProps}
      />
      <Button
        ref={btnConfirmRef}
        variant="outline-success"
        className="btn-icon btn-icon-only ms-1 p-1"
        onClick={handleConfirmClick}
        style={{
          width: 'auto',
          height: 'auto',
          verticalAlign: 'top',
        }}
      >
        <CsLineIcons className="text-success" icon="check" />
      </Button>
    </>
  );
};

export default InlineEdit;
