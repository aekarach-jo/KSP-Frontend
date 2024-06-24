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
import { Accordion, Button, Card, Col, Dropdown, Form, Modal, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import Select from 'react-select';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import PageCoatingColorQCLog from './PageCoatingColorQCLog';

const PagePrintingThird1 = ({
  validationSchema,
  onChange,
  data,
  isDisable,
  QCLOption,
  setQCLOption,
  onAddPrintGroupItems,
  onAddCoatingGroupItems,
  QCLCoatingOption,
  setQCLCoatingOption,
}) => {
  const { formatMessage: f } = useIntl();
  const [selectIndex, setSelectIndex] = useState({ lebel: 'Printing 1', value: 0 });
  const [selectCoatingIndex, setSelectCoatingIndex] = useState({ lebel: 'Coating 1', value: 0 });

  const initialDataPrinting = {
    startTime: data?.operationDoc?.qualityCheck?.startTime || '',
    endTime: data?.operationDoc?.qualityCheck?.endTime || '',
    printColor: data?.operationDoc?.qualityCheck?.printColor?.length > 0 ? data?.operationDoc?.qualityCheck?.printColor : data?.productPrintColor,
    printMeasuredList: data?.operationDoc?.qualityCheck?.printMeasuredList,
    coatingMeasuredList: data?.operationDoc?.qualityCheck?.coatingMeasuredList || [],
    coatingColor: data?.operationDoc?.qualityCheck?.coatingColor?.length > 0 ? data?.operationDoc?.qualityCheck?.coatingColor : data?.productCoatingMethod,
    coatingSpeed: data?.operationDoc?.qualityCheck?.coatingSpeed || 0,
    percenSprey: data?.operationDoc?.qualityCheck?.percenSprey || 0,
  };
  const initialDataCoating = {
    startTime: data?.operationDoc?.qualityCheck?.startTime || '',
    endTime: data?.operationDoc?.qualityCheck?.endTime || '',
    printColor: data?.operationDoc?.qualityCheck?.printColor || [],
    printMeasuredList:
      data?.operationDoc?.qualityCheck?.printMeasuredList?.length > 0 ? data?.operationDoc?.qualityCheck?.printMeasuredList : data?.productPrintColor,
    coatingColor:
      data?.operationDoc?.qualityCheck?.coatingColor?.length > 0 ? data?.operationDoc?.qualityCheck?.coatingColor : data?.productCoatingMethod || [],
    coatingMeasuredList: data?.operationDoc?.qualityCheck?.coatingMeasuredList || [],
    coatingSpeed: data?.operationDoc?.qualityCheck?.coatingSpeed || 0,
    percenSprey: data?.operationDoc?.qualityCheck?.percenSprey || 0,
  };

  const onSubmit = (formData) => {
    console.log(formData);
    onChange({ target: { id: `operationDoc.qualityCheck`, value: formData } });
  };

  const formik = useFormik({
    initialValues: data?.step === 13 ? initialDataCoating : initialDataPrinting,
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const handleChangeProductPrintColor = (index, name, data) => {
    handleChange({ target: { id: `printMeasuredList[${selectIndex?.value}].measured[${index}].${name}`, value: data } });
    handleChange({
      target: {
        id: `printMeasuredList[${selectIndex?.value}].measured[${index}].code`,
        value:
          values?.printMeasuredList[selectIndex?.value]?.measured[index].color || values?.printMeasuredList[selectIndex?.value]?.measured[index].code || '',
      },
    });
    handleChange({
      target: {
        id: `printMeasuredList[${selectIndex?.value}].measured[${index}].defaultValue`,
        value: values?.printMeasuredList[selectIndex?.value]?.measured[index].density || '',
      },
    });
    handleSubmit();
  };

  const handleChangeProductCoatingMethod = (index, name, data) => {
    handleChange({ target: { id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].${name}`, value: data } });
    handleChange({
      target: {
        id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].code`,
        value:
          values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].text ||
          values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].code ||
          '',
      },
    });
    handleChange({
      target: {
        id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].defaultValue`,
        value:
          values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].density ||
          values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].value ||
          '',
      },
    });
    handleSubmit();
  };

  const handleChangeCoatingMethod = (index, name, data) => {
    // console.log(values?.coatingColor[index]);
    handleChange({ target: { id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].${name}`, value: data } });
    handleChange({
      target: {
        id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].code`,
        value: values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].code || '',
      },
    });
    handleChange({
      target: {
        id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].text`,
        value: values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].text || '',
      },
    });
    handleChange({
      target: {
        id: `coatingMeasuredList[${selectCoatingIndex?.value}].measured[${index}].defaultValue`,
        value: values?.coatingMeasuredList[selectCoatingIndex?.value]?.measured[index].value || '',
      },
    });
    handleSubmit();
  };

  const handleChangeValue = (name, data) => {
    // const momentDate = moment(values.maintenanceDt).add(543, 'year').format('DD/MM/YYYY HH:mm');
    handleChange({ target: { id: `${name}`, value: data } });
    handleSubmit();
  };

  const handleChangeTime = (type, index, name, data) => {
    // const momentDate = moment(values.maintenanceDt).add(543, 'year').format('DD/MM/YYYY HH:mm');
    handleChange({ target: { id: `[${type}][${index}].${name}`, value: data } });
    handleSubmit();
  };

  const onDeletepmList = (index) => {
    const arrDetail = values.printMeasuredList.filter((data, i) => i !== index);
    if (values.printMeasuredList.length > 1) {
      onChange({ target: { id: `operationDoc.printMeasuredList`, value: arrDetail } });
    }
  };

  const handleAddPrintOption = () => {
    onAddPrintGroupItems({ startTime: '', endTime: '', measured: data?.productPrintColor || [], machine: data?.machineId || '' });
    const addIndex = values?.printMeasuredList.map((data, index) => {
      setSelectIndex({ label: `Printing ${index + 1}`, value: index });
      return { label: `Printing ${index + 1}`, value: index };
    });
    setQCLOption(addIndex);
  };

  const handleAddCoatingOption = () => {
    onAddCoatingGroupItems({ startTime: '', endTime: '', measured: data?.productCoatingMethod || [], machine: data?.machineId || '' });
    const addIndex = values?.coatingMeasuredList.map((data, index) => {
      setSelectCoatingIndex({ label: `Coating ${index + 1}`, value: index });
      return { label: `Coating ${index + 1}`, value: index };
    });
    setQCLCoatingOption(addIndex);
  };

  const handleAddCoating = () => {
    onAddCoatingGroupItems({ startTime: '', endTime: '', measured: data?.productCoatingMethod || [], machine: data?.machineId || '' });
    const addIndex = values?.coatingMeasuredList.map((data, index) => {
      setSelectCoatingIndex({ label: `Coating ${index + 1}`, value: index });
      return { label: `Coating ${index + 1}`, value: index };
    });
    setQCLCoatingOption(addIndex);
  };

  useEffect(() => {
    setQCLOption(undefined);
    setQCLCoatingOption(undefined);
    const addIndexTpPrint = values?.printMeasuredList.map((data, index) => {
      setSelectIndex({ label: `Printing ${index + 1}`, value: index });
      return { label: `Printing ${index + 1}`, value: index };
    });
    setQCLOption(addIndexTpPrint);

    if (data?.step === 13) {
      if (values?.coatingMeasuredList.length === 0) {
        onAddCoatingGroupItems({ startTime: '', endTime: '', measured: data?.productCoatingMethod || [], machine: data?.machineId || '' });
      }
      const addIndex = values?.coatingMeasuredList.map((data, index) => {
        setSelectCoatingIndex({ label: `Coating ${index + 1}`, value: index });
        return { label: `Coating ${index + 1}`, value: index };
      });
      setQCLCoatingOption(addIndex);
    } else {
      const addIndexToCoating = values?.coatingMeasuredList.map((data, index) => {
        setSelectCoatingIndex({ label: `Coating ${index + 1}`, value: index });
        return { label: `Coating ${index + 1}`, value: index };
      });
      setQCLCoatingOption(addIndexToCoating);
    }
  }, []);

  return (
    <>
      {data?.step === 13 ? (
        <>
          <Card className="mb-3 pb-3">
            <div className="d-flex flex-row justify-content-between align-items-center ps-4 gap-3">
              <Col xs="5" sm="9" md="9" lg="9">
                <Form.Label className="form-label pl-2">{f({ id: 'dailyPlan.field.title3-2' })}</Form.Label>
              </Col>
              <Col xs="5" sm="2" md="2" lg="2">
                <Select
                  placeholder="ประวัติ"
                  className="w-100 float-end"
                  classNamePrefix="react-select"
                  options={QCLCoatingOption}
                  onChange={setSelectCoatingIndex}
                  value={selectCoatingIndex}
                  required
                />
              </Col>
              <Col xs="2" sm="2" md="2" lg="2">
                <Button className="btn-icon btn-icon-only z-index-1000" variant="outline-primary" onClick={() => handleAddCoating()} disabled={isDisable}>
                  <CsLineIcons icon="plus" />
                </Button>{' '}
                <Button
                  className="btn-icon btn-icon-only z-index-1000"
                  variant="danger"
                  onClick={() => onDeletepmList(selectCoatingIndex?.value)}
                  disabled={isDisable}
                  hidden
                >
                  <CsLineIcons icon="bin" />
                </Button>
              </Col>
            </div>
            <div className="d-flex flex-row justify-content-center align-items-center px-4 pt-2">
              <table className="w-100">
                <thead>
                  <tr>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.coatingColorName' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.printColorNo' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.defaultValue' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.measuredValue' })}</Form.Label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {values.coatingMeasuredList[selectCoatingIndex?.value]?.measured?.map((data, index) => (
                    <tr key={index}>
                      <td style={{ padding: '2px' }}>
                        <Form.Control type="text" name="color" disabled value={data?.text || data?.code} />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control type="text" name="no" value={data?.no || ''} onChange={(e) => handleChangeCoatingMethod(index, 'no', e.target.value)} />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="number"
                          name="value"
                          value={data?.value || data?.defaultValue || ''}
                          disabled
                          onChange={(e) => handleChangeCoatingMethod(index, 'value', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="number"
                          name="measuredValue"
                          value={data.measuredValue || ''}
                          onChange={(e) => handleChangeCoatingMethod(index, 'measuredValue', Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-1 g-3 px-4 d-flex flex-row justify-content-center align-items-center gap-4">
              <div style={{ width: '50%' }}>
                <Form.Group className="position-relative tooltip-end-top" controlId="start">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="start">
                    <div className="">
                      <DatepickerThaiYearTime
                        // disableDayPicker
                        disabled={isDisable}
                        className="form-control ps-4"
                        value={values.coatingMeasuredList[selectCoatingIndex?.value]?.startTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(e) => handleChangeTime('coatingMeasuredList', selectCoatingIndex?.value, 'startTime', e)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                  {errors.operator && touched.operator && <div className="d-block invalid-feedback">{f({ id: errors.operator })}</div>}
                </Form.Group>
              </div>
              <div style={{ width: '50%' }}>
                <Form.Group className="position-relative tooltip-end-top" controlId="end">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="end">
                    <div className="">
                      <DatepickerThaiYearTime
                        // disableDayPicker
                        className="form-control"
                        disabled={isDisable}
                        value={values.coatingMeasuredList[selectCoatingIndex?.value]?.endTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(e) => handleChangeTime('coatingMeasuredList', selectCoatingIndex?.value, 'endTime', e)}
                        filterTime={new Date(values.coatingMeasuredList[selectCoatingIndex?.value]?.startTime)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                  {errors.date && touched.date && <div className="d-block invalid-feedback">{f({ id: errors.date })}</div>}
                </Form.Group>
              </div>
            </div>
          </Card>
          <Row className="mb-0 g-3">
            <Col md="6">
              <Form.Group style={{ marginLeft: '9.3rem' }} className="position-relative tooltip-end-top" controlId="speedCoating">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.speedCoating' })}</Form.Label>
                <Form.Control
                  style={{ width: '10rem' }}
                  type="number"
                  name="coatingSpeed"
                  disabled
                  value={values?.coatingSpeed}
                  onChange={(e) => handleChangeValue('coatingSpeed', Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md="6">
              <Form.Group style={{ marginLeft: '9.3rem' }} className="position-relative tooltip-end-top" controlId="percen">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.percen' })}</Form.Label>
                <Form.Control
                  style={{ width: '10rem' }}
                  type="number"
                  name="percenSprey"
                  disabled
                  value={values?.percenSprey}
                  onChange={(e) => handleChangeValue('percenSprey', Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* <div className="d-flex flex-column justify-content-center align-items-center mt-2">
            <Form.Label className="form-label">{f({ id: 'dailyPlan.field.title3-3' })}</Form.Label>
          </div>
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
            style={{ minHeight: '400px', maxHeight: '400px' }}
          >
            {values?.coatingColor.map((item, index) => (
              <>
                <PageCoatingColorQCLog
                  idx={index}
                  isDisable={isDisable}
                  productCoatingList={values?.coatingMeasuredList || []}
                  coatingColor={item}
                  data={data?.operationDoc?.coating[index]}
                  // initialData={initialData}
                  isStepCoating
                  onChange={onChange}
                />
              </>
            ))}
          </OverlayScrollbarsComponent> */}
        </>
      ) : (
        <>
          <Card className="mb-3 pb-3">
            <div className="d-flex flex-row justify-content-between align-items-center ps-4 gap-3">
              <Col xs="5" sm="9" md="9" lg="9">
                <Form.Label className="form-label text-start pl-2">{f({ id: 'dailyPlan.field.title3-1' })}</Form.Label>
              </Col>
              <Col xs="5" sm="2" md="2" lg="2">
                <Select
                  placeholder="ประวัติ"
                  className="w-100 float-end"
                  classNamePrefix="react-select"
                  options={QCLOption}
                  onChange={setSelectIndex}
                  value={selectIndex}
                  required
                />
              </Col>
              <Col xs="2" sm="2" md="2" lg="2">
                <Button className="btn-icon btn-icon-only z-index-1000" variant="outline-primary" onClick={() => handleAddPrintOption()} disabled={isDisable}>
                  <CsLineIcons icon="plus" />
                </Button>{' '}
                <Button
                  className="btn-icon btn-icon-only z-index-1000"
                  variant="danger"
                  onClick={() => onDeletepmList(selectIndex?.value)}
                  disabled={isDisable}
                  hidden
                >
                  <CsLineIcons icon="bin" />
                </Button>
              </Col>
            </div>
            <div className="d-flex flex-row justify-content-center align-items-center px-4 pt-2">
              <table className="w-100">
                <thead>
                  <tr>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.printColorName' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.printColorNo' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.defaultValue' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.measuredValue' })}</Form.Label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {values.printMeasuredList[selectIndex?.value]?.measured?.map((data, index) => (
                    <tr key={index}>
                      <td style={{ padding: '2px' }}>
                        <Form.Control type="text" name="color" disabled value={data.color || data?.code} />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="text"
                          name="no"
                          onChange={(e) => handleChangeProductPrintColor(index, 'no', e.target.value)}
                          value={data.no || ''}
                        />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="number"
                          name="density"
                          value={data?.density || data?.defaultValue || ''}
                          disabled
                          onChange={(e) => handleChangeProductPrintColor(index, 'density', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="number"
                          name="measuredValue"
                          value={data.measuredValue || ''}
                          onChange={(e) => handleChangeProductPrintColor(index, 'measuredValue', Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-1 g-3 px-4 d-flex flex-row justify-content-center align-items-center gap-4">
              <div style={{ width: '50%' }}>
                <Form.Group className="position-relative tooltip-end-top" controlId="start">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="start">
                    <div className="">
                      <DatepickerThaiYearTime
                        // disableDayPicker
                        disabled={isDisable}
                        className="form-control ps-4"
                        value={values?.printMeasuredList[selectIndex?.value]?.startTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(e) => handleChangeTime('printMeasuredList', selectIndex?.value, 'startTime', e)}
                        filterTime={new Date()}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                  {errors.operator && touched.operator && <div className="d-block invalid-feedback">{f({ id: errors.operator })}</div>}
                </Form.Group>
              </div>
              <div style={{ width: '50%' }}>
                <Form.Group className="position-relative tooltip-end-top" controlId="end">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="end">
                    <div className="">
                      <DatepickerThaiYearTime
                        // disableDayPicker
                        className="form-control"
                        disabled={isDisable}
                        value={values?.printMeasuredList[selectIndex?.value]?.endTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(e) => handleChangeTime('printMeasuredList', selectIndex?.value, 'endTime', e)}
                        filterTime={new Date(values?.printMeasuredList[selectIndex?.value]?.startTime)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                  {errors.date && touched.date && <div className="d-block invalid-feedback">{f({ id: errors.date })}</div>}
                </Form.Group>
              </div>
            </div>
          </Card>
          <Card className="mb-3 pb-3">
            <div className="d-flex flex-row justify-content-between align-items-center ps-4 gap-3">
              <Col xs="5" sm="9" md="9" lg="9">
                <Form.Label className="form-label pl-2">{f({ id: 'dailyPlan.field.title3-2' })}</Form.Label>
              </Col>
              <Col xs="5" sm="2" md="2" lg="2">
                <Select
                  placeholder="ประวัติ"
                  className="w-100 float-end"
                  classNamePrefix="react-select"
                  options={QCLCoatingOption}
                  onChange={setSelectCoatingIndex}
                  value={selectCoatingIndex}
                  required
                />
              </Col>
              <Col xs="2" sm="2" md="2" lg="2">
                <Button className="btn-icon btn-icon-only z-index-1000" variant="outline-primary" onClick={() => handleAddCoatingOption()} disabled={isDisable}>
                  <CsLineIcons icon="plus" />
                </Button>{' '}
                <Button
                  className="btn-icon btn-icon-only z-index-1000"
                  variant="danger"
                  onClick={() => onDeletepmList(selectCoatingIndex?.value)}
                  disabled={isDisable}
                  hidden
                >
                  <CsLineIcons icon="bin" />
                </Button>
              </Col>
            </div>
            <div className="d-flex flex-row justify-content-center align-items-center px-4 pt-2">
              <table className="w-100">
                <thead>
                  <tr>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.coatingColorName' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.printColorNo' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.defaultValue' })}</Form.Label>
                    </th>
                    <th className="th-col" style={{ width: '25%' }}>
                      <Form.Label>{f({ id: 'dailyPlan.field.measuredValue' })}</Form.Label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {values.coatingMeasuredList[selectCoatingIndex?.value]?.measured?.map((data, index) => (
                    <tr key={index}>
                      <td style={{ padding: '2px' }}>
                        <Form.Control type="text" name="color" disabled value={data?.text || data?.code} />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="text"
                          name="no"
                          value={data?.no || ''}
                          onChange={(e) => handleChangeProductCoatingMethod(index, 'no', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="number"
                          name="value"
                          value={data?.value || data?.defaultValue || ''}
                          disabled
                          onChange={(e) => handleChangeProductCoatingMethod(index, 'value', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '2px' }}>
                        <Form.Control
                          type="number"
                          name="measuredValue"
                          value={data.measuredValue || ''}
                          onChange={(e) => handleChangeProductCoatingMethod(index, 'measuredValue', Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-1 g-3 px-4 d-flex flex-row justify-content-center align-items-center gap-4">
              <div style={{ width: '50%' }}>
                <Form.Group className="position-relative tooltip-end-top" controlId="start">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="start">
                    <div className="">
                      <DatepickerThaiYearTime
                        // disableDayPicker
                        disabled={isDisable}
                        className="form-control ps-4"
                        value={values.coatingMeasuredList[selectCoatingIndex?.value]?.startTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(e) => handleChangeTime('coatingMeasuredList', selectCoatingIndex?.value, 'startTime', e)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                  {errors.operator && touched.operator && <div className="d-block invalid-feedback">{f({ id: errors.operator })}</div>}
                </Form.Group>
              </div>
              <div style={{ width: '50%' }}>
                <Form.Group className="position-relative tooltip-end-top" controlId="end">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="end">
                    <div className="">
                      <DatepickerThaiYearTime
                        // disableDayPicker
                        className="form-control"
                        disabled={isDisable}
                        value={values.coatingMeasuredList[selectCoatingIndex?.value]?.endTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(e) => handleChangeTime('coatingMeasuredList', selectCoatingIndex?.value, 'endTime', e)}
                        filterTime={new Date(values.coatingMeasuredList[selectCoatingIndex?.value]?.startTime)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                  {errors.date && touched.date && <div className="d-block invalid-feedback">{f({ id: errors.date })}</div>}
                </Form.Group>
              </div>
            </div>
          </Card>
          <Row className="mb-0 g-3">
            <Col md="6">
              <Form.Group style={{ marginLeft: '9.3rem' }} className="position-relative tooltip-end-top" controlId="speedCoating">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.speedCoating' })}</Form.Label>
                <Form.Control
                  style={{ width: '10rem' }}
                  type="number"
                  name="coatingSpeed"
                  disabled
                  value={values?.coatingSpeed}
                  onChange={(e) => handleChangeValue('coatingSpeed', Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md="6">
              <Form.Group style={{ marginLeft: '9.3rem' }} className="position-relative tooltip-end-top" controlId="percen">
                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.percen' })}</Form.Label>
                <Form.Control
                  style={{ width: '10rem' }}
                  type="number"
                  name="percenSprey"
                  disabled
                  value={values?.percenSprey}
                  onChange={(e) => handleChangeValue('percenSprey', Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default PagePrintingThird1;
