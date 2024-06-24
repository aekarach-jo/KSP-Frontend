/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/layouts/prime.css';
import { useFormik } from 'formik';
import moment from 'moment';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import thai_th from './Locale.Thai';
import thai from './Calendar.Thai';

const DatepickerThaiYearRange = ({ onReset, setOnReset, value, disabled, tableInstance, start, end, isClear, handleChange: handleChangeDateValue }) => {
  const initialValues = {
    [start]: '',
    [end]: '',
  };
  const { gotoPage, setFilter } = tableInstance;

  const onSubmit = (dataResult) => {
    setFilter({ ...dataResult });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  useEffect(() => {
    if (onReset) {
      handleReset();
      setFilter({ page: 0 });
      gotoPage(0);
      handleChange({ target: { id: [start], value: '' } });
      handleChange({ target: { id: [end], value: '' } });
      setOnReset(false);
    }
  }, [onReset]);

  const onSetDate = (date) => {
    const startDate = new Date(date[0]);
    const endDate = new Date(date[1]);
    const dateRange = [moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')]; // ส่งออก
    handleChange({ target: { id: [start], value: dateRange[0].toString() } });
    handleChange({ target: { id: [end], value: dateRange[1].toString() } });
    handleChangeDateValue({ target: { id: [start], value: dateRange[0].toString() } });
    handleChangeDateValue({ target: { id: [end], value: dateRange[1].toString() } });
    handleSubmit();
  };

  return (
    <DatePicker
      className="rmdp-prime"
      format={'DD/MM/YYYY'}
      calendar={thai}
      locale={thai_th}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        height: '35px',
        opacity: '0.7',
        borderRadius: '10px',
        paddingLeft: '13px',
      }}
      containerStyle={{
        width: '100%',
      }}
      // value={null}
      onChange={onSetDate}
      disabled={disabled}
      onClear={isClear}
      range
      rangeHover
    />
  );
};

export default DatepickerThaiYearRange;
