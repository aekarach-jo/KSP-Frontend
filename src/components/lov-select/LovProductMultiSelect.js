import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, coatingMethod) {
  const list = lovList.filter((data) => !coatingMethod?.some((v) => data?.code === v?.text?.value));
  return (list || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
  }));
}

const LovProductMultiSelect = ({
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
  coatingMethod,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useProductLov } = useProductLovData();
  const { data, isFetching, refetch } = useProductLov({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data?.[lov] || [], lovLabel, lovValue, coatingMethod);
  }, [data, lov, lovLabel, lovValue]);

  useEffect(() => {
    refetch();
    if (!isFetching) {
      props.setValueChange(false);
    }
  }, [props.valueChange]);

  useEffect(() => {
    const findOption = [];
    options.forEach((dataI) => {
      // value.forEach((dataJ) => {
      if (value === dataI.value) {
        findOption.push(dataI);
      }
      // });
    });
    if (findOption.length) {
      setInternalValue(findOption);
    }
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      setInternalValue(e);
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

export default LovProductMultiSelect;
