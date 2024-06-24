import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useQuotationLovData from 'hooks/api/master/lov/useQuotationLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovLabel2, lovValue) {
  return (lovList || []).map((lov) => ({
    label: `${lov[lovLabel]}${"   "}${lov[lovLabel2]}`,
    value: lov[lovValue],
    detail: lov
  }));
}

const LovEmployeeSelect = ({
  name,
  value,
  lov,
  lovLabel = 'firstName',
  lovLabel2 = 'lastName',
  lovValue = 'id',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useEmployeeLov } = useQuotationLovData();
  const { data, isFetching } = useEmployeeLov({ isGroup: true });
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);
  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovLabel2, lovValue);
  }, [data, lov, lovLabel, lovLabel2, lovValue]);
  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    setInternalValue(findOption || value);
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

export default LovEmployeeSelect;
