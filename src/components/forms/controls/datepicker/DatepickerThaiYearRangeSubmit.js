/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/layouts/prime.css';
import moment from 'moment';
import thai_th from './Locale.Thai';
import thai from './Calendar.Thai';


const DatepickerThaiYearRangeSubmit = ({ disabled, onChange }) => {
  const onSetDate = (date) => {
    const startDate = new Date(date[0]);
    const endDate = new Date(date[1]);
    const dateRange = [moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')]; // ส่งออก
    const arry = [];
    arry.startDate = startDate;
    arry.endDate = endDate;
    arry.dateRange = dateRange;
    onChange(arry);
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
      // value={moment(value).add(543, 'year').format('DD/MM/YYYY')}
      onChange={onSetDate}
      disabled={disabled}
      range
    />
  );
};

export default DatepickerThaiYearRangeSubmit;
