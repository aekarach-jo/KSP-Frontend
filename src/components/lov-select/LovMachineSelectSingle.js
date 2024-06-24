import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, value) {
  const list = lovList.filter((data) => (value?.type === undefined ? true : data.type === value.type));
  return (list || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovMachineSelectSingle = ({
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
  filterPrint,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useMachineLov } = useProductLovData();
  const { data, isFetching } = useMachineLov({ filterPrint, isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue, value);
  }, [data, lov, lovLabel, lovValue, value]);

  // useEffect(() => {
  //   setInternalValue();
  // }, [lov, lovValue, options, value]);

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

export default LovMachineSelectSingle;
