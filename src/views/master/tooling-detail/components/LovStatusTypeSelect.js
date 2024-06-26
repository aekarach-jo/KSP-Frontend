import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useToolingLov from 'hooks/api/master/lov/useToolingLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovStatusTypeSelect = ({
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
  onRefetchLov,
  setOnRefetchLov = false,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);
  const [options, setOptions] = useState();
  const { useToolingStatusTypeLov } = useToolingLov();
  const { data, isFetching, refetch } = useToolingStatusTypeLov({ isGroup: false });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  useEffect(() => {
    if (!isFetching) {
      const op = mapOptions(data || [], lovLabel, lovValue);
      setOptions(op);
      setOnRefetchLov(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (onRefetchLov) {
      refetch();
      setOnRefetchLov(false);
    }
  }, [onRefetchLov]);

  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    setInternalValue(findOption);
  }, [lov, lovValue, options, value, data]);

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

export default LovStatusTypeSelect;
