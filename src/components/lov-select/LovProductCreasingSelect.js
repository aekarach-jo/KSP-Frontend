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

const LovProductCreasingSelect = ({
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
  const { useCreasingLov } = useProductLovData();
  const { data, isFetching, refetch } = useCreasingLov({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);
  console.log(data);
  const options = useMemo(() => {
    return mapOptions(data?.[lov] || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);

  useEffect(() => {
    refetch();
    if (!isFetching) {
      props.setValueChange(false);
    }
  }, [props.valueChange]);

  useEffect(() => {
    const findOption = [];
    if (value !== undefined) {
      options.forEach((dataI) => {
        if (value && Array.isArray(value)) {
          value?.forEach((dataJ) => {
            if (dataJ === dataI.value) {
              findOption.push(dataI);
            }
          });
        }
      });
    }
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

export default LovProductCreasingSelect;
