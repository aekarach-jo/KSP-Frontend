import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
  }));
}

const LovColorPrintSelect = ({
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

  const [internalValue, setInternalValue] = useState();
  const { useProductColorPrint } = useProductLovData();
  const { data, isFetching, refetch } = useProductColorPrint({ isGroup: true });
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);
  const options = useMemo(() => {
    return mapOptions(data?.[lov], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);
  const findOption = [];
  useEffect(() => {
    refetch();
    if (!isFetching) {
      props.setValueChange(false);
    }
  }, [props.valueChange]);
  useEffect(() => {
    options?.forEach((dataI) => {
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

export default LovColorPrintSelect;
