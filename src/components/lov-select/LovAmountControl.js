import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import useOutsourceData from 'hooks/api/master/lov/useOutsource';
import { useIntl } from 'react-intl';

const LovAmountControl = ({
  type,
  ref,
  name,
  value,
  lov,
  lovLabel = 'name',
  lovValue = 'id',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
      setInternalValue(e.target.value);
    },
    [onChange]
  );

  return (
    <Form.Control
      type={type}
      ref={ref}
      name={name} //
      value={internalValue}
      onChange={internalOnChange}
    />
  );
};

export default LovAmountControl;
