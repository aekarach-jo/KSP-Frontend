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

const PageCoatingColorQCLog = ({ idx, validationSchema, coatingColor, data, onChange, productCoatingList, isDisable }) => {
  const { formatMessage: f } = useIntl();
  // console.log(productCoatingList);
  const initialData = {
    no: data?.operationDoc?.coating?.no || data?.no || '',
    colorCode: data?.operationDoc?.coating?.colorCode || data?.colorCode || '',
    startTime: data?.operationDoc?.coating?.startTime || new Date(data?.startTime) || '',
    endTime: data?.operationDoc?.coating?.endTime || new Date(data?.endTime) || '',
    speedPerHour: data?.operationDoc?.coating?.speedPerHour || data?.speedPerHour || 0,
    usedPowder: data?.operationDoc?.coating?.usedPowder || data?.usedPowder || 0,
    defectiveAmount: data?.operationDoc?.coating?.defectiveAmount || data?.defectiveAmount || 0,
  };
  const onSubmit = (formData) => {
    const dataForm = {
      no: idx + 1,
      // eslint-disable-next-line no-underscore-dangle
      colorCode: coatingColor._id,
      startTime: formData.startTime,
      endTime: formData.endTime,
      speedPerHour: formData.speedPerHour,
      usedPowder: formData.usedPowder,
      defectiveAmount: formData.defectiveAmount,
    };
    onChange({ target: { id: `operationDoc.coating[${idx}]`, value: dataForm } });
  };

  const formik = useFormik({ initialValues: initialData, onSubmit, validationSchema, enableReinitialize: false });
  const { handleSubmit, handleChange, values } = formik;

  const handleChangeProductCoatingColor = (name, data) => {
    handleChange({ target: { id: `${name}`, value: data } });
    handleSubmit();
  };

  return (
    <>
      <Row
        style={{ border: '1px solid #bababa', borderRadius: '20px', marginBottom: '10px' }}
        className="p-3 d-flex flex-row justify-content-center align-items-start "
        key={idx}
      >
        <Col md="4" className="d-flex flex-column justify-content-start align-items-start ">
          <Form.Label className="col-form-label">
            {f({ id: 'dailyPlan.field.colorNo' })} {idx + 1}
          </Form.Label>
          <Form.Label className="col-form-label form-control" style={{ background: '#eee' }}>
            {coatingColor?.text}
          </Form.Label>
          <Form.Group className="position-relative tooltip-end-top" controlId="speedMachine">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.speedMachine' })}</Form.Label>
            <Form.Control
              type="number"
              name="speedPerHour"
              disabled={isDisable}
              value={values?.speedPerHour}
              onChange={(e) => handleChangeProductCoatingColor('speedPerHour', Number(e.target.value))}
            />
          </Form.Group>
        </Col>
        <Col md="6">
          <Row>
            <Col md="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="start">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="start">
                  <div className="filled">
                    {/* <CsLineIcons icon="clock" /> */}
                    <DatepickerThaiYearTime
                      // disableDayPicker
                      disabled={isDisable}
                      className="form-control ps-4"
                      value={values.startTime}
                      format="DD/MM/YYYY HH:mm"
                      formatOnChange="YYYY-MM-DD HH:mm"
                      onChange={(e) => handleChangeProductCoatingColor('startTime', e)}
                      plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                    />
                  </div>
                </Form.Group>
              </Form.Group>
            </Col>
            <Col md="6">
              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
                <Form.Group className="position-relative tooltip-end-top" controlId="end">
                  <div className="filled">
                    {/* <CsLineIcons icon="clock" />{' '} */}
                    <DatepickerThaiYearTime
                      // disableDayPicker
                      disabled={isDisable}
                      className="form-control ps-4"
                      value={values.endTime}
                      format="DD/MM/YYYY HH:mm"
                      formatOnChange="YYYY-MM-DD HH:mm"
                      onChange={(e) => handleChangeProductCoatingColor('endTime', e)}
                      filterTime={new Date(values.startTime)}
                      plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                    />
                  </div>
                </Form.Group>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.percen' })}</Form.Label>
              <Form.Control
                type="number"
                name="usedPowder"
                disabled={isDisable}
                value={values?.usedPowder}
                onChange={(e) => handleChangeProductCoatingColor('usedPowder', Number(e.target.value))}
              />
            </Col>
            <Col md="6">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.defectiveAmount' })}</Form.Label>
              <Form.Control
                type="number"
                name="defectiveAmount"
                disabled
                value={values?.defectiveAmount}
                onChange={(e) => handleChangeProductCoatingColor('defectiveAmount', Number(e.target.value))}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default PageCoatingColorQCLog;
