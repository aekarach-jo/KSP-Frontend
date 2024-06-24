import useFormat from 'hooks/useFormat';
import React, { useCallback, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const DND_REGEX = /^-|^\d*\.$/;

const NumberSpinner2 = ({ id, name, value, disabled, step = 1, min, max, onChange, isClearable = false, inputProps = {}, ...restProps }) => {
  const [internalVal, setInternalVal] = useState(null);

  const { formatNumber: formatNumberFn } = useFormat();

  const formatNumber = useCallback((num) => formatNumberFn(num, 0, { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }), []);

  useEffect(() => {
    setInternalVal(`${typeof value === 'number' ? formatNumber(value) : ''}`);
  }, [formatNumber, value]);

  const changeVal = useCallback(
    (newValue) => {
      setInternalVal(`${typeof newValue === 'number' ? formatNumber(newValue) : ''}`);
      onChange?.(newValue);
    },
    [formatNumber, onChange]
  );

  const isOutbound = useCallback(
    (val) => {
      return (typeof max !== 'undefined' && Number(val) > Number(max)) || (typeof min !== 'undefined' && Number(val) < Number(min));
    },
    [max, min]
  );

  const stepValue = useCallback(
    (val, _step) => {
      const newValue = (Number(val) || 0) + _step;

      if (isOutbound(newValue)) {
        return Number(val || min || 0);
      }

      return newValue;
    },
    [isOutbound, min]
  );

  const handleOnChange = useCallback(
    (e) => {
      // console.debug('num onchange:', e);
      const { value: val } = e.target;

      if (val === '' || DND_REGEX.test(val)) {
        setInternalVal(val);
        return;
      }

      const newValue = val || (isClearable ? null : 0);

      setInternalVal(newValue);
    },
    [isClearable]
  );

  const handleOnBlur = useCallback(() => {
    if (internalVal === '-') {
      changeVal(isClearable ? null : 0);
      return;
    }

    if (!internalVal || internalVal === '' || isOutbound(internalVal)) {
      setInternalVal(`${isClearable ? null : Number(value || min || 0)}`);
      return;
    }

    changeVal(Number(internalVal));
  }, [changeVal, internalVal, isClearable, isOutbound, min, value]);

  const handleOnIncreaseClick = useCallback(() => {
    changeVal(stepValue(internalVal, step));
  }, [changeVal, internalVal, step, stepValue]);

  const handleOnDecreaseClick = useCallback(() => {
    changeVal(stepValue(internalVal, -step));
  }, [changeVal, internalVal, step, stepValue]);

  return (
    <InputGroup className="spinner">
      <InputGroup.Text>
        <button type="button" className="spin-down single" disabled={disabled} onClick={handleOnDecreaseClick} tabIndex="-1">
          -
        </button>
      </InputGroup.Text>
      <Form.Control
        id={id}
        name={name}
        disabled={disabled}
        value={internalVal || ''}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        style={{ textAlign: 'center' }}
        {...inputProps}
      />
      <InputGroup.Text>
        <button type="button" className="spin-up single" disabled={disabled} onClick={handleOnIncreaseClick} tabIndex="-1">
          +
        </button>
      </InputGroup.Text>
    </InputGroup>
  );
};

export default NumberSpinner2;
