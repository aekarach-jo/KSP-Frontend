/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import classNames from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Select from 'react-select';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovDefectSelectMulti from 'components/lov-select/LovDefectSelectMulti';
import useActualProduction from 'hooks/useActualProduction';

const PagePrintingFourth = ({
  valuesPlan,
  dataList,
  recordOption,
  setRecordOption,
  onAddProblemList,
  onChange,
  calculateData,
  isFetchingActualProduction,
  isDisable,
}) => {
  const { formatMessage: f } = useIntl();
  const [isShowMessage, setShowMessage] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [boxItemIndex, setBoxItemIndex] = useState(false);
  const [valueCal, setValueCal] = useState();
  const [valueDefect, setValueDefect] = useState();
  const [selectIndex, setSelectIndex] = useState({ lebel: 'Record 1', value: 0 });
  const { useCalculateOperation } = useActualProduction();
  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  const handleAddDetail = (index) => {
    const arrDetail = dataList[index]?.detail;
    arrDetail.unshift(valueDefect?.value);
    onChange({ target: { id: `operationDoc.problem[${index}].detail`, value: arrDetail } });
    // setValueDefect({ lebel: '', value: '' })
  };

  const handleDeleteDetail = (index, indexDetail) => {
    const arrDetail = dataList[index].detail.filter((data, i) => i !== indexDetail);
    onChange({ target: { id: `operationDoc.problem[${index}].detail`, value: arrDetail } });
  };

  const onDeleteProblemList = (index) => {
    const arrDetail = dataList.filter((data, i) => i !== index);
    if (dataList.length > 1) {
      onChange({ target: { id: `operationDoc.problem`, value: arrDetail } });
    }
  };

  const handleChangeDateValue = (index, name, data) => {
    onChange({ target: { id: `operationDoc.problem[${index}].${name}`, value: data } });
  };

  const handleChangeProblemValue = (index, name, data) => {
    onChange({ target: { id: `operationDoc.problem[${index}].${name}`, value: data } });
  };

  const onChangeDefectAmount = (e) => {
    const val = useCalculateOperation({
      lots: calculateData.data,
      currentStep: valuesPlan.step,
      actual: calculateData.actual,
      actualProducedAmount: valuesPlan?.operationDoc?.actualProducedAmount,
      defect: Number(e.target.value),
    });
    setValueCal(val);
    const defectValue = val.d_defect || 0;
    onChange({ target: { id: `operationDoc.defectAmount`, value: defectValue } });
  };

  const onChangeActualProducedAmount = (e) => {
    onChange({ target: { id: `operationDoc.actualProducedAmount`, value: Number(e.target.value) } });
    const val = useCalculateOperation({
      lots: calculateData?.data,
      currentStep: valuesPlan?.step,
      actual: calculateData?.actual,
      actualProducedAmount: Number(e.target.value),
      // defect: calculateData.actual,
    });
    setValueCal(val);
  };

  const onChangeDetailValue = (index, indexDetail, v) => {
    onChange({ target: { id: `operationDoc.problem[${index}].detail[${indexDetail}]`, value: v?.value } });
  };

  useEffect(() => {
    if (!boxItemIndex) {
      setBoxItemIndex(true);
    }
  }, [dataList]);

  useEffect(() => {
    if (!isFetchingActualProduction) {
      const val = useCalculateOperation({
        lots: calculateData.data,
        currentStep: valuesPlan.step,
        actual: calculateData.actual,
        actualProducedAmount: valuesPlan?.operationDoc?.actualProducedAmount,
        defect: valuesPlan?.operationDoc?.defectAmount,
      });
      setValueCal(val);
    }
  }, [calculateData]);

  const handleAddRecordOption = () => {
    onAddProblemList({ startTime: '', endTime: '', detail: [], correction: '' });
    const addIndex = dataList.map((data, index) => {
      setSelectIndex({ label: `Record ${index + 1}`, value: index });
      return { label: `Record ${index + 1}`, value: index };
    });
    setRecordOption(addIndex);
  };

  useEffect(() => {
    setRecordOption([]);
    const addIndex = dataList.map((data, index) => {
      setSelectIndex({ label: `Record ${index + 1}`, value: index });
      return { label: `Record ${index + 1}`, value: index };
    });
    setRecordOption(addIndex);
  }, []);

  return (
    <>
      <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />
      <div className="d-flex flex-row gap-2 m-2 justify-content-end align-items-end" style={{ paddingRight: '46px' }}>
        <Select className="z-index-1000 w-20" classNamePrefix="react-select" options={recordOption} value={selectIndex} onChange={setSelectIndex} required />

        <Button className="btn-icon btn-icon-only z-index-1000" variant="outline-primary" onClick={() => handleAddRecordOption()} disabled={isDisable}>
          <CsLineIcons icon="plus" />
        </Button>
        <Button
          className="btn-icon btn-icon-only z-index-1000"
          style={{ top: '-1.3rem', right: '0rem' }}
          variant="danger"
          onClick={() => onDeleteProblemList(selectIndex?.value)}
          disabled={isDisable}
          hidden={dataList.length === 1}
        >
          <CsLineIcons icon="bin" />
        </Button>
      </div>
      <div className="pb-3  position-relative">
        <div className="wizard wizard-default ">
          <div className="mb-4 p-2">
            <div className="d-flex flex-column justify-content-start align-items-start">
              <Form.Label className="form-label">{f({ id: 'dailyPlan.field.title3-5' })}</Form.Label>
            </div>
            <Row>
              <Col sm="12" md="4" lg="4" className="d-flex flex-column justify-content-center gap-5">
                <Form.Group className="position-relative tooltip-end-top" controlId="start">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.start' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="start">
                    <div className="filled">
                      <DatepickerThaiYearTime
                        disabled={isDisable || valuesPlan?.status === 'NEW'}
                        className="form-control ps-4"
                        value={dataList[selectIndex?.value]?.startTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(date) => handleChangeDateValue(selectIndex?.value, 'startTime', date)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                </Form.Group>
                <Form.Group className="position-relative tooltip-end-top" controlId="end">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.end' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="end">
                    <div className="filled">
                      <DatepickerThaiYearTime
                        disabled={isDisable || valuesPlan?.status === 'NEW'}
                        className="form-control ps-4"
                        value={dataList[selectIndex?.value]?.endTime || ''}
                        format="DD/MM/YYYY HH:mm"
                        formatOnChange="YYYY-MM-DD HH:mm"
                        onChange={(date) => handleChangeDateValue(selectIndex?.value, 'endTime', date)}
                        filterTime={new Date(dataList[selectIndex?.value]?.startTime)}
                        plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                      />
                    </div>
                  </Form.Group>
                </Form.Group>
              </Col>
              <Col sm="12" md="4" lg="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="other">
                  <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.note-save' })}</Form.Label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    name="other"
                    style={{ height: '175px' }}
                    disabled={isDisable || valuesPlan?.status === 'NEW'}
                    value={dataList[selectIndex?.value]?.correction || ''}
                    onChange={(e) => handleChangeProblemValue(selectIndex?.value, 'correction', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col sm="12" md="4" lg="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="other">
                  <Row className="mb-2">
                    <Col lg="4" md="4" sm="4" style={{ textAlign: 'left' }}>
                      <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.config' })}</Form.Label>
                    </Col>
                    <Col lg="8" md="8" sm="8" style={{ textAlign: 'right', paddingTop: '6px' }}>
                      <CsLineIcons className="text-primary" icon="plus" />
                      <a href="#" onClick={toggleManageAddModal}>
                        {f({ id: 'product.message' })}
                      </a>
                    </Col>
                  </Row>
                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                    style={{ maxHeight: '120px' }}
                  >
                    {dataList[selectIndex?.value]?.detail.map((item, indexDetail) => {
                      return (
                        <Row key={selectIndex?.value}>
                          <Col lg="10" md="10" sm="10" xs="10">
                            <LovDefectSelectMulti
                              name="cautionList"
                              className="my-1"
                              isDisabled
                              isClearable
                              onChange={(v) => {
                                if (v !== null) {
                                  onChangeDetailValue(selectIndex?.value, indexDetail, v);
                                } else {
                                  const cautionList = '';
                                  onChangeDetailValue(selectIndex?.value, indexDetail, cautionList);
                                }
                              }}
                              value={item || ''}
                              // isMulti
                              valueChange={valueChangeCaution}
                              setValueChange={setValueChangeCaution}
                            />
                          </Col>

                          <Col lg="1" md="1" sm="1" xs="1">
                            <Button
                              className="btn-icon btn-icon-only"
                              disabled={isDisable}
                              variant="outline-danger"
                              onClick={() => handleDeleteDetail(selectIndex?.value, indexDetail)}
                            >
                              <CsLineIcons icon="bin" />
                            </Button>
                          </Col>
                        </Row>
                      );
                    })}
                  </OverlayScrollbarsComponent>
                  <Row>
                    <Col lg="10" md="10" sm="10" xs="10">
                      <LovDefectSelectMulti
                        name="cautionList"
                        className="my-1"
                        // isDisabled
                        isClearable
                        onChange={(v) => {
                          if (v !== null) {
                            setValueDefect(v);
                          } else {
                            const cautionList = undefined;
                            setValueDefect(cautionList);
                          }
                        }}
                        value={valueDefect || ''}
                        valueChange={valueChangeCaution}
                        setValueChange={setValueChangeCaution}
                      />
                    </Col>
                    <Col lg="1" md="1" sm="1" xs="1">
                      <Button variant="primary" className="my-2" onClick={() => handleAddDetail(selectIndex?.value)} disabled={isDisable}>
                        {f({ id: 'common.add' })}
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <Row className="mb-2">
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="coating_format">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.additionalPrintedAmount' })}</Form.Label>
            <Form.Control type="text" value={valueCal?.e_additionalPrintedAmount} disabled />
          </Form.Group>
        </Col>
        <Col md="6">
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.sumaryDefect' })}</Form.Label>
            <Form.Control type="text" value={valueCal?.f_sumaryDefect} disabled />
          </Form.Group>
        </Col>
      </Row>
      <Row className=" mb-4">
        <Col md="3">
          <Form.Group className="position-relative tooltip-end-top" controlId="coating_format">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.number-produce' })}</Form.Label>
            <Form.Control type="text" value={valueCal?.a_amountToproduce} disabled />
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.actual' })}</Form.Label>
            <Form.Control type="text" value={valueCal?.b_actualProduction} disabled />
          </Form.Group>
        </Col>
        <Col
          md={valueCal?.j_nextStepHasChanged ? 2 : 3}
          className={classNames('', {
            'overlay-spinner': isFetchingActualProduction,
          })}
        >
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.meterAmount' })}</Form.Label>
            <Form.Control
              type="number"
              disabled={isDisable || isFetchingActualProduction || valuesPlan?.status === 'NEW'}
              value={valueCal?.c_actualProduceAmount}
              onChange={onChangeActualProducedAmount}
            />
          </Form.Group>
        </Col>
        <Col
          md={valueCal?.j_nextStepHasChanged ? 2 : 3}
          className={classNames('', {
            'overlay-spinner': isFetchingActualProduction,
          })}
        >
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.wrong' })}</Form.Label>
            <Form.Control
              type="number"
              disabled={isDisable || isFetchingActualProduction || valuesPlan?.status === 'NEW'}
              value={valueCal?.d_defect}
              onChange={onChangeDefectAmount}
            />
          </Form.Group>
        </Col>
        <Col
          md={valueCal?.j_nextStepHasChanged ? 2 : 0}
          className={classNames('', {
            'overlay-spinner': isFetchingActualProduction,
          })}
        >
          <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.QCwrong' })}</Form.Label>
            <Form.Control type="number" disabled value={valueCal?.i_nextStepDefect} onChange={onChangeDefectAmount} />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default PagePrintingFourth;
