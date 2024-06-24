/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Modal, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
// import DatePicker from 'react-datepicker';

const PagePrintingThird2 = ({ idx, validationSchema, printColor, data, onChange, isStepCoating = false }) => {
  const { formatMessage: f } = useIntl();
  // console.log(data?.operationDoc);
  const initialData = {
    no: data?.operationDoc?.printing?.no || data?.no || '',
    colorCode: data?.operationDoc?.printing?.colorCode || data?.colorCode || '',
    startTime: data?.operationDoc?.printing?.startTime || new Date(data?.startTime) || '',
    endTime: data?.operationDoc?.printing?.endTime || new Date(data?.endTime) || '',
    speedPerHour: data?.operationDoc?.printing?.speedPerHour || data?.speedPerHour || 0,
    usedPowder: data?.operationDoc?.printing?.usedPowder || data?.usedPowder || 0,
    defectiveAmount: data?.operationDoc?.printing?.defectiveAmount || data?.defectiveAmount || 0,
  };
  // console.log(`${new Date(data?.startTime).getHours() - 7} : ${new Date(data?.startTime).getMinutes()}`);
  const onSubmit = (formData) => {
    console.log(formData);

    const dataForm = {
      no: idx + 1,
      // eslint-disable-next-line no-underscore-dangle
      colorCode: printColor._id,
      startTime: formData.startTime,
      endTime: formData.endTime,
      speedPerHour: formData.speedPerHour,
      usedPowder: formData.usedPowder,
      defectiveAmount: formData.defectiveAmount,
    };
    console.log(dataForm);
    onChange({ target: { id: `operationDoc.printing[${idx}]`, value: dataForm } });
  };

  const formik = useFormik({ initialValues: initialData, onSubmit, validationSchema, enableReinitialize: false });
  const { handleSubmit, handleChange, values } = formik;

  const handleChangeProductPrintColor = (name, data) => {
    console.log(name, data);
    handleChange({ target: { id: `${name}`, value: data } });
    handleSubmit();
  };

  return (
    <>
      <Row
        style={{ borderBottom: '1px solid #bababa', borderRadius: '20px', marginBottom: '10px' }}
        className=" d-flex flex-row justify-content-center align-items-start pb-4"
        key={idx}
      >
        <Col md="1" className="d-flex flex-column justify-content-start align-items-start ">
          <Form.Label className="col-form-label">สีที่ {idx + 1}</Form.Label>
          <Form.Label className="col-form-label form-control" style={{ background: '#eee' }}>
            {printColor?.color}
          </Form.Label>
        </Col>

        {isStepCoating ? (
          <>
            <Col md="2">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.usedPowder' })}</Form.Label>
              <Form.Control
                type="number"
                name="usedPowder"
                value={values?.usedPowder}
                onChange={(e) => handleChangeProductPrintColor('usedPowder', Number(e.target.value))}
              />
            </Col>
            <Col md="2"> </Col>
          </>
        ) : (
          <>
            <Col md="2">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.percen' })}</Form.Label>
              <Form.Control
                type="number"
                name="usedPowder"
                value={values?.usedPowder}
                onChange={(e) => handleChangeProductPrintColor('usedPowder', Number(e.target.value))}
              />
            </Col>
            <Col md="2">
              <Form.Group className="position-relative tooltip-end-top" controlId="speedMachine">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.speedMachine' })}</Form.Label>
                <Form.Control
                  type="number"
                  name="speedPerHour"
                  value={values?.speedPerHour}
                  onChange={(e) => handleChangeProductPrintColor('speedPerHour', Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </>
        )}
        <Col md="3">
          <Form.Group className="position-relative tooltip-end-top" controlId="start">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
            <Form.Group className="position-relative tooltip-end-top" controlId="start">
              <div className="filled">
                <DatepickerThaiYearTime
                  // disableDayPicker
                  className="form-control ps-4"
                  value={values.startTime}
                  format="DD/MM/YYYY HH:mm"
                  formatOnChange="YYYY-MM-DD HH:mm"
                  onChange={(e) => handleChangeProductPrintColor('startTime', e)}
                  plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                />
              </div>
            </Form.Group>
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group className="position-relative tooltip-end-top" controlId="end">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
            <Form.Group className="position-relative tooltip-end-top" controlId="end">
              <div className="filled">
                <DatepickerThaiYearTime
                  // disableDayPicker
                  className="form-control ps-4"
                  value={values.endTime}
                  format="DD/MM/YYYY HH:mm"
                  formatOnChange="YYYY-MM-DD HH:mm"
                  onChange={(e) => handleChangeProductPrintColor('endTime', e)}
                  filterTime={new Date(values.startTime)}
                  plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                />
              </div>
            </Form.Group>
          </Form.Group>
        </Col>
        <Col md="1">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.defectiveAmount' })}</Form.Label>
              <Form.Control
                type="number"
                name="defectiveAmount"
                value={values?.defectiveAmount}
                disabled
                onChange={(e) => handleChangeProductPrintColor('defectiveAmount', Number(e.target.value))}
              />
            </Col>
      </Row>
    </>
  );
};

export default PagePrintingThird2;
