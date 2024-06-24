import { setDate } from 'date-fns/esm';
import React, { useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import CreatableSelect from 'react-select/creatable';

const SelectCreatable = ({ values, onChange, isEditMode }) => {
  console.log(values);
  const [data, setData] = useState([]);
  const options = [];
  
  useEffect(() => {
    // console.log(data);
    values = values?.map((e) => ({
      label: e,
      value: e,
      __isNew__: true
    }));
    // console.log(values);
    setData(values);
  }, []);

  useEffect(() => {
    onChange(data);
  }, [data]);

  return(
    <>
      <CreatableSelect classNamePrefix="react-select" isDisabled={isEditMode} isMulti isClearable={false} options={options} value={data} onChange={setData} placeholder="" />
      {/* <NumberFormat format="+66 ### ### ####" mask="-" className="form-control" allowEmptyFormatting /> */}
    </>
  )
};

export default SelectCreatable;
