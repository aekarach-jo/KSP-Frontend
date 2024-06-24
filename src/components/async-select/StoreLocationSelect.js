import React, { useCallback, useState } from 'react';
import useStoreLocationData from 'hooks/api/store-location/useStoreLocationData';
import AsyncSelect from './AsyncSelect';

const StoreLocationSelect = ({ name, value, isDisabled, onChange, placeholder, ...props }) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const { useFindStoreLocationQuery } = useStoreLocationData();

  const { data, isFetching } = useFindStoreLocationQuery({ filter: { code: internalSearchValue } });

  const handleSearchChange = useCallback((val) => {
    setInternalSearchValue(val);
  }, []);

  return (
    <AsyncSelect
      name={name}
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      data={data}
      isLoading={isFetching}
      {...props}
      optionLabelKey="code"
      optionValueKey="id"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onSearchChange={handleSearchChange}
    />
  );
};

export default StoreLocationSelect;
