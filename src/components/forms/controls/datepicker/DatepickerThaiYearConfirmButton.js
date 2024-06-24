/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/layouts/prime.css';
import moment from 'moment';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import thai_th from './Locale.Thai';
import thai from './Calendar.Thai';

const DatepickerThaiYear = (props) => {
  const onSetDate = (date) => {
    const dt = new Date(date);
    if (dt.getYear() === 70) {
      props.onChange('');
    } else {
      props.onChange(moment(dt).format('YYYY-MM-DD'), {}); // ส่งออก
    }
  };
  return (
    <DatePicker
      {...props}
      portal
      mapDays={({ date }) => {
        const p = {};
        const isWeekend = [0, 6].includes(date.weekDay.index);

        if (isWeekend) p.className = 'highlight highlight-red';

        return p;
      }}
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
      value={moment(props?.value || new Date())
        .add(543, 'year')
        .format('DD/MM/YYYY')}
      onChange={onSetDate}
      disabled={props.disabled}
      // minDate={new Date(props.filterTime)}
    />
  );
};

export default DatepickerThaiYear;
