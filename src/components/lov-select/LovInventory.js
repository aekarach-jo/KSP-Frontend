import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, value) {
  const list = lovList;
  lovList = list.filter((element) => {
    const cutText = element.name.substring(0, element.name.indexOf('('));
    return cutText === '';
  });
  if (value[0]?.label !== undefined) {
    lovList = list.filter((element) => {
      const cutText = element.name.substring(0, element.name.indexOf(' ('));
      return cutText === value[0]?.label;
    });
  }
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovInventory = ({ name, value, lov, lovLabel = 'name', lovValue = 'id', isClearable, isDisabled, onChange, placeholder, menuPlacement, ...props }) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);
  const { useInventory } = useProductLovData();
  const { data, isFetching } = useInventory({ isGroup: true });
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue, value);
  }, [data, lov, lovLabel, lovValue, value]);

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
      isMulti={props.isMulti}
      onChange={internalOnChange}
    />
  );
};

export default LovInventory;
