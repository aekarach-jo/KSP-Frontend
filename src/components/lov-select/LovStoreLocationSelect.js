import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, isCode, value) {
  if (isCode) {
    lovLabel = 'code';
    lovList = lovList?.filter((data) => data.id !== value);
  }
  const filterSupplier = lovList.filter((data) => !data.isSupplier && !data.isSale);
  return (filterSupplier || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovStoreLocationSelect = ({
  name,
  value,
  lov,
  lovLabel = 'name',
  lovValue = 'id',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  isCode = false,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useStoreLocationLov } = useProductLovData();
  const { data, isFetching } = useStoreLocationLov({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue, isCode, value);
  }, [data, lov, lovLabel, lovValue]);

  // useEffect(() => {
  //   let findOption = options?.find((item) => item.value === value);
  //   console.log(options, value);
  //   if (findOption === undefined) {
  //     findOption = '';
  //   }
  //   setInternalValue(findOption);
  // }, [lov, lovValue, options, value, data]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
      setInternalValue(e);
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
      isMulti={props.isMulti}
      onChange={internalOnChange}
    />
  );
};

export default LovStoreLocationSelect;
