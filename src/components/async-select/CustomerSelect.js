import useCustomerData from 'hooks/api/customer/useCustomerData';
import React, { useCallback, useState } from 'react';
import AsyncSelect from './AsyncSelect';

const CustomerSelect = ({ name, value, isDisabled, onChange, placeholder, ...props }) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const { useSearchCustomerQuery } = useCustomerData();

  const { data, isFetching } = useSearchCustomerQuery({ filter: { name: internalSearchValue } });

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

export default CustomerSelect;
