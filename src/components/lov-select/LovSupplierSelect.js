import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useOutsourceData from 'hooks/api/master/lov/useOutsource';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue) {
  // const filter = lovList?.filter((data) => data.type === '01' || data.type === '05');
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovSupplierSelect = ({
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
  const { useSupplierData } = useOutsourceData();
  const { data, isFetching } = useSupplierData({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);
  
  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);
  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    setInternalValue(findOption);
  }, [lov, lovValue, options, value]);


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

export default LovSupplierSelect;
