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

const DatepickerThaiYearTime = (props) => {
  const [internalValue, setInternalValue] = useState(moment.utc(props.value).add(543, 'year').format(props.format));
  const onSetDate = (date) => {
    const dt = new Date(date);
    props.onChange(moment(dt).format(props.formatOnChange)); // ส่งออก
  };
  useEffect(() => {
    setInternalValue(moment.utc(props.value).add(543, 'year').format(props.format));
  }, [props.value]);
  return (
    <DatePicker
      {...props}
      className="rmdp-prime"
      format={props.format}
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
      value={internalValue}
      onChange={onSetDate}
      disabled={props.disabled}
      minDate={new Date(props.filterTime)}
      // calendarPosition={`top`}
    />
  );
};

export default DatepickerThaiYearTime;
