import React, { useCallback, useEffect, useState } from 'react';
import useSupplierData from 'hooks/api/master/supplier/useSupplierData';
import AsyncSelect from './AsyncSelect';

const SupplierSelect = ({ name, value, isDisabled, onChange, placeholder, type, ...props }) => {
  const [optionType, setOptionType] = useState([]);
  const [values, setValues] = useState([]);
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const { useFindSupplierQuery } = useSupplierData();
  const { data, isFetching } = useFindSupplierQuery({ filter: { name: internalSearchValue, limit: 100 } });

  useEffect(() => {
    if (!isFetching) {
      // const filteredArr2 = data.filter((item) => item.type.some((t) => type.includes(t)));
      setOptionType(data.filter((item) => item.type.some((t) => type.includes(t))));
      if (props.isMulti) {
        setValues(data.filter((item) => value.some((arrItem) => arrItem.id === item.id)));
      } else {
        setValues(data.find((item) => item?.name === value || value?.name));
      }
    }
  }, [isFetching, value]);

  const handleSearchChange = useCallback((val) => {
    setInternalSearchValue(val);
  }, []);

  const handleOnChange = (e) => {
    if (props.isMulti) {
      console.log(1);
      onChange(e);
    } else {
      console.log(e);
      onChange(e?.name);
    }
  };

  return (
    <AsyncSelect
      name={name}
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      data={optionType || data}
      isLoading={isFetching}
      {...props}
      optionLabelKey="name"
      optionValueKey="id"
      value={value}
      onChange={handleOnChange}
      placeholder={placeholder}
      onSearchChange={handleSearchChange}
    />
  );
};

export default SupplierSelect;
