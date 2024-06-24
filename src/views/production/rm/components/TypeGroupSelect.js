import React, { useCallback, useEffect, useState } from 'react';
import AsyncSelect from 'components/async-select/AsyncSelect';

const TypeGroupSelect = ({ name, value, isDisabled, onChange, placeholder, materialGroup, ...props }) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!internalSearchValue) {
      setData(materialGroup);
    }

    setData(materialGroup.filter((g) => `${g?.name || ''}}`.includes(internalSearchValue)) || []);
  }, [internalSearchValue, materialGroup]);

  const handleSearchChange = useCallback((val) => {
    setInternalSearchValue(val);
  }, []);

  return (
    <AsyncSelect
      name={name}
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      data={data}
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

export default TypeGroupSelect;
