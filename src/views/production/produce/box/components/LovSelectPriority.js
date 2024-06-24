import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useMaterialLovData from 'hooks/api/master/lov/useMaterialLov';
import { useIntl } from 'react-intl';

const data = [
  { label: 'ด่วน', value: 'URGENT' },
  { label: 'ปกติ', value: 'NORMAL' },
];

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
  }));
}

const LovSelectPriority = ({
  name,
  value,
  lov,
  lovLabel = 'label',
  lovValue = 'value',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(data[1]);
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data , lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);
  
  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);

    setInternalValue(findOption);
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      const { value: _value } = e || {};
      onChange?.(_value);
    },
    [onChange]
  );

  return (
    <Select
      name={name} //
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={options}
      // isLoading={isFetching}
      {...props}
      isClearable={isClearable}
      placeholder={selectPlaceholder}
      menuPlacement={menuPlacement}
      value={internalValue}
      onChange={internalOnChange}
    />
  );
};

export default LovSelectPriority;
