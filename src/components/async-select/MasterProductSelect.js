import useProductData from 'hooks/api/master/product/useProductData';
import React, { useCallback, useState } from 'react';
import AsyncSelect from './AsyncSelect';

const MasterProductSelect = ({ name, value, isDisabled, onChange, placeholder, ...props }) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const { useProductQuery } = useProductData();

  const { data, isFetching } = useProductQuery({ filter: { name: internalSearchValue }, limit: 100 });

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
      optionLabelKey="name"
      optionValueKey="id"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onSearchChange={handleSearchChange}
    />
  );
};

export default MasterProductSelect;
