import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const SelectCreatable = ({ values, onChange, isEditMode }) => {
  // console.log(values);
  const [data, setData] = useState([]);
  const options = [];

  useEffect(() => {
    setData([]);
    values = values?.map((e) => ({
      label: e,
      value: e,
      __isNew__: true,
    }));
    setData(values);
  }, []);

  useEffect(() => {
    onChange(data);
  }, [data]);

  return (
    <>
      <CreatableSelect classNamePrefix="react-select" isDisabled={isEditMode} isMulti isClearable={false} options={options} value={data} onChange={setData} />
    </>
  );
};

export default SelectCreatable;
