import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import useOutsourceData from 'hooks/api/master/lov/useOutsource';
import useProductPlanOptionsNoQC from 'hooks/useProductPlanOptionsNoQC';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const StepInputDisplay = ({
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
  const { useCustomerData } = useOutsourceData();
  const { data, isFetching } = useCustomerData({ isGroup: true });
  const { planOptions } = useProductPlanOptionsNoQC();
  const planData = planOptions();

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);
  useEffect(() => {
    planData.forEach((e) => {
      if (e.value === value) {
        setInternalValue(e.label);
      }
    });
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
    },
    [onChange]
  );

  return (
    // <Select
    //   name={name} //
    //   isDisabled={isDisabled}
    //   classNamePrefix="react-select"
    //   options={options}
    //   isLoading={isFetching}
    //   {...props}
    //   isClearable={isClearable}
    //   placeholder={selectPlaceholder}
    //   menuPlacement={menuPlacement}
    //   value={internalValue}
    //   onChange={internalOnChange}
    // />
    <Form.Control
      {...props}
      name={name} //
      // onChange={handleChange}
      value={internalValue}
    />
  );
};

export default StepInputDisplay;
