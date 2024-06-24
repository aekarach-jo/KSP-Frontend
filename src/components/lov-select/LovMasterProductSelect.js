import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useOutsourceData from 'hooks/api/master/lov/useOutsource';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, customerId, value, isEdit) {
  const optionFilter = lovList.filter((item1) => item1.customerId?.some((item2) => item2 === customerId));
  if (isEdit) {
    const optionRemove = lovList.filter((item) => item.id !== value);
  }
  return (optionFilter || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovMasterProductSelect = ({
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
  bomList,
  customerId,
  isEdit,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);
  const { useMasterProductData } = useOutsourceData();
  const { data, isFetching } = useMasterProductData({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue, customerId, value, isEdit);
  }, [data, lov, lovLabel, lovValue, customerId, value, isEdit]);
  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    console.log(findOption);
    if (findOption !== undefined) {
      props.setPriceList(findOption.detail);
    }
    setInternalValue(findOption);
  }, [lov, lovValue, options, value, isEdit]);

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

export default LovMasterProductSelect;
