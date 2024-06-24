/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/layouts/prime.css';
import moment from 'moment';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import thai from 'components/forms/controls/datepicker/Calendar.Thai';
import thai_th from 'components/forms/controls/datepicker/Locale.Thai';

const DatepickerThaiYear = ({ onChange, value, disabled, validate, idAttr }) => {
  const onSetDate = (date) => {
    const dt = new Date(date)
    onChange(dt); // ส่งออก
  };

  return (
    <DatePicker
      id={idAttr}
      className="rmdp-prime"
      format={'DD/MM/YYYY'}
      placeholder={validate}
      calendar={thai}
      locale={thai_th}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        height: '22px',
        border: 'none',
      }}
      containerStyle={{
        width: '100%',
      }}
      // value={value}
      value={moment(value) 
        .add(543, 'year')
        .format('DD/MM/YYYY')}
      onChange={onSetDate}
      disabled={disabled}
    />
  );
};

export default DatepickerThaiYear;
