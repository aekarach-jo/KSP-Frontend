import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { Form } from 'react-bootstrap';
import { useIntl } from 'react-intl';

const DepartmentInput = ({ name, value, isClearable, isDisabled, onChange, placeholder, options, menuPlacement, ...props }) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const findOption = options?.find((item) => item.code === value);
    setInternalValue(findOption?.name === undefined ? value : findOption?.name);
  }, [options, value]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
    },
    [onChange]
  );

  return (
    <Form.Control
      name={name} //
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      {...props}
      isClearable={isClearable}
      menuPlacement={menuPlacement}
      value={internalValue}
      onChange={internalOnChange}
      disabled
    />
  );
};

export default DepartmentInput;
