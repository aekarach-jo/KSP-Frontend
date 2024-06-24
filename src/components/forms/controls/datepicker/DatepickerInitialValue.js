import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const DatepickerInitialValue = ({ dateFormat, onChange, value, disabled }) => {
  let convertDt = new Date();

  const onSetDate = (date) => {
    convertDt = moment(date).format('YYYY/MM/DD'); // type date หลังบ้าน require YYYY/MM/DD
    onChange(convertDt); // ส่งออก
  };

  useEffect(() => {
    if (!value) {
      convertDt = moment().format('YYYY/MM/DD');
      onChange(convertDt);
    }
  }, []);

  return (
    <DatePicker
      className="form-control"
      dateFormat={dateFormat}
      selected={convertDt}
      onChange={(date) => onSetDate(date)}
      value={moment(value || new Date())
        .add(543, 'year')
        .format('DD/MM/YYYY')}
      disabled={disabled}
      // showMonthDropdown
      // showYearDropdown
    />
  );
};

export default DatepickerInitialValue;
