import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
// import makeAnimated from 'react-select/animated';
import { useIntl } from 'react-intl';
import useStoreLocationData from 'hooks/api/store-location/useStoreLocationData';
// import { debounce } from 'lodash';

// const animatedComponents = makeAnimated();

function defaultMapOptions(list, label, value) {
  return (list || []).map((item) => {
    return {
      label: item?.[label] || item?.label,
      value: item?.[value] || item?.value,
    };
  });
}

function defaultMapDataOnChange(values, list, label, value) {
  list = list || [];
  if (values && !Array.isArray(values)) {
    return list.find((item) => (item?.[value] || item?.value) === (values?.[value] || values?.value));
  }
  return (values || []).map((item) => {
    return (
      list.find((opt) => {
        return opt?.[value] === item?.value;
      }) || item
    );
  });
}

const AsyncSelect = ({
  name,
  value,
  data,
  isLoading,
  isDisabled,
  placeholder,
  optionLabelKey = 'label',
  optionValueKey = 'value',
  mapOptions = defaultMapOptions,
  mapDataOnChange = defaultMapDataOnChange,
  onChange,
  onSearchChange,
  ...props
}) => {
  const { formatMessage: f } = useIntl();
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select.placeholder' }), [f, placeholder]);
  const loadingMsg = useCallback(() => f({ id: 'common.select.loading' }), [f]);
  const noOptionsMsg = useCallback(() => f({ id: 'common.select.empty' }), [f]);

  // const [internalSearchValue, setInternalSearchValue] = useState('');
  const [internalSelectedValue, setInternalSelectedValue] = useState([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  /* const debounceSetInternalSearchValue = useCallback(
    debounce((val) => setInternalSearchValue(val), 500),
    []
  ); */

  useEffect(() => {
    const val = value || [];
    setInternalSelectedValue(mapOptions(Array.isArray(val) ? val : [val] || [], optionLabelKey, optionValueKey));
  }, [mapOptions, optionLabelKey, optionValueKey, value]);

  const options = useMemo(() => {
    // console.debug('Data ->', data);
    return mapOptions(data || [], optionLabelKey, optionValueKey);
  }, [data, mapOptions, optionLabelKey, optionValueKey]);

  // console.debug(' options ->', options);

  const filterOption = useCallback(() => true, []);

  const handleOnInputChange = useCallback(
    (val, opt) => {
      if (opt.action !== 'input-change') {
        onSearchChange?.('');
        return;
      }

      onSearchChange?.(val);
    },
    [onSearchChange]
  );

  const internalOnChange = useCallback(
    (values) => {
      // console.debug('internalOnChange :', values);
      setInternalSelectedValue(values);

      const mapped = mapDataOnChange(values, data, optionLabelKey, optionValueKey);
      // console.debug('internalOnChange mapped:', mapped);
      onChange?.(mapped);
    },
    [mapDataOnChange, data, optionLabelKey, optionValueKey, onChange]
  );

  return (
    <Select
      name={name}
      // components={animatedComponents}
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={options}
      isLoading={isLoading}
      {...props}
      placeholder={selectPlaceholder}
      loadingMessage={loadingMsg}
      noOptionsMessage={noOptionsMsg}
      value={internalSelectedValue}
      onChange={internalOnChange}
      filterOption={filterOption}
      onInputChange={handleOnInputChange}
    />
  );
};

export default AsyncSelect;
