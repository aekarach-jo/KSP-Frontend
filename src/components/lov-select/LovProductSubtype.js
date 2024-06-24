import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLov from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovProductSubtype = ({
  name,
  value,
  lov,
  lovLabel = 'name',
  lovValue = 'code',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);
  const { useSubtypeData } = useProductLov();
  const { data, isFetching, refetch } = useSubtypeData({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);
  if (props.valueChange) {
    refetch();
  }
  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);
  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    setInternalValue(findOption);
    props.setValueChange(false);
  }, [lov, lovValue, options, value, data, props.valueChange]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
    },
    [onChange]
  );
  return (
    <Select
      name={name} //
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={options}
      isLoading={isFetching}
      {...props}
      isClearable={isClearable}
      placeholder={selectPlaceholder}
      menuPlacement={menuPlacement}
      value={internalValue}
      onChange={internalOnChange}
    />
  );
};

export default LovProductSubtype;
