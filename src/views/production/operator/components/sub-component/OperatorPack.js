/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient, ReactQueryConfigProvider } from 'react-query';
import { Accordion, Button, Card, Col, Form, Row, Modal } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { request } from 'utils/axios-utils';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import clx from 'classnames';
import ReactToPrint from 'react-to-print';
import * as Yup from 'yup';
import { SERVICE_URL } from 'config';
import { toast } from 'react-toastify';
import Glide from 'components/carousel/Glide';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Select from 'react-select';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import LovCautionListSelect from 'components/lov-select/LovDefectSelectOne';
import useActualProduction from 'hooks/useActualProduction';
import LovStoreLocationSelect from 'components/lov-select/LovStoreLocationMatSelect';

const userLogin = JSON.parse(window.localStorage.getItem('token'));

const OperatorPack = ({ id, isEditMode, initResult, mockData, data: dataList, onHide, onHandleChange, setStickerAmount, calculateData, isFetchingActual }) => {
  const { formatMessage: f } = useIntl();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [optionStatus, setOptionStatus] = useState([]);
  const [isShowMessage, setShowMessage] = useState(false);
  const [boxList, setBoxList] = useState([]);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentGlideIndex, setCurrentGlideIndex] = useState(0);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [list, setList] = useState([]);
  const [data, setData] = useState({});
  const [availableSum, setAvailableSum] = useState(0);
  const [valueCal, setValueCal] = useState();
  const componentRef = useRef(null);
  const [minTime, setMinTime] = useState(null);
  const { useCalculateOperation } = useActualProduction();

  const ToastCreateSuccess = () => {
    const { formatMessage: f } = useIntl();

    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.save.success' })}</span>
        </div>
      </>
    );
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
  };
  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="info" size="small" onClick={() => setModal(false)} disabled={loading}>
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
  };

  const callAdjustItem = (data = {}) => request({ url: '/inventory/product/adjust', data, method: 'post' });

  const formik = useFormik({
    initialValues: {
      defectiveAmount: dataList?.defectiveAmount,
      availableAmount: dataList?.availableAmount || 0,
      meterAmount: dataList?.meterAmount,
      materialId: dataList?.materialId,
      storeLocation: dataList?.storeLocation,
      batchList: dataList?.batchList,
      productPiecePerPack: dataList?.productPiecePerPack,
      productPortionSentCustomer: dataList?.productPortionSentCustomer || [],
      actualProduction: dataList?.actualProduction || dataList?.actualProducedAmount,
      actualProducedAmount: valueCal?.b_actualProduction,
      actualProducedAmountA: dataList?.actualProducedAmountA || valueCal?.b_actualProduction,
      productionProducedAmount: dataList?.productionProducedAmount,
      pickInventory: dataList?.pickInventory,
      pickInventoryFragment: dataList?.pickInventoryFragment,
      lostPack: dataList?.lostPack || 0,
      lostFrac: dataList?.lostFrac || 0,
      useAmount: dataList?.useAmount || Math.floor(dataList?.actualProducedAmount / dataList?.productPiecePerPack) || 0,
    },
    // validationSchema,
    onSubmit,
    enableReinitialize: true,
  });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;
  const { mutate: adjustMaterial } = useMutation((currentData) => callAdjustItem(currentData), {
    onSuccess() {
      toast(f({ id: 'inventory.detail.adjusting.success' }));
    },
    onError(err) {
      toast.error(f({ id: 'inventory.detail.adjusting.error' }));
      console.error('adjusting error :', err);
    },
  });
  const onChangeDefectAmount = (e) => {
    const val = useCalculateOperation({
      lots: calculateData?.data,
      currentStep: dataList?.step,
      actual: calculateData?.actual,
      actualProducedAmount: dataList?.actualProducedAmount,
      defect: Number(e.target.value),
    });
    setValueCal(val);
    const defectValue = val.d_defect || 0;
    onHandleChange({ target: { id: `defectAmount`, value: defectValue } });
    console.log(values.actualProducedAmount, Number(e.target.value));
    onHandleChange({ target: { id: `actualProducedAmount`, value: values.actualProducedAmount - Number(e.target.value) } });
  };
  const onChangeActualProducedAmount = (e) => {
    // onHandleChange({ target: { id: `actualProducedAmount`, value: Number(e.target.value) } });
    const val = useCalculateOperation({
      lots: calculateData?.data,
      currentStep: dataList?.step,
      actual: calculateData?.actual,
      actualProducedAmount: Number(e.target.value),
    });
    onHandleChange({ target: { id: `actualProducedAmount`, value: Number(e.target.value) } });
    setValueCal(val);
  };

  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);
  // useEffect(() => {
  //   if (!isFetching) {
  //     onHandleChange({ target: { id: 'actualProducedAmount', value: initData?.actual } });
  //   }
  // }, [initData, isFetching]);
  useEffect(() => {
    let pickInventory = 0;
    let pickInventoryFragment = 0;
    values.batchList?.forEach((e) => {
      pickInventory += Number(e.amount);
      pickInventoryFragment += Number(e.fraction);
    });
    onHandleChange({ target: { id: 'pickInventory', value: pickInventory } });
    onHandleChange({ target: { id: 'pickInventoryFragment', value: pickInventoryFragment } });
  }, [values.batchList]);
  // useEffect(() => {
  //   values.productPortionSentCustomer?.forEach((e) => {
  //     console.log(e);
  //   });
  // }, [values.productPortionSentCustomer]);
  useEffect(() => {
    // let amountToproduceFragment = 0;
    let amountToproduce = 0;
    // if (values.productPortionSentCustomer !== ) {
    if (values.productPortionSentCustomer !== undefined) {
      values.productPortionSentCustomer?.forEach((e, i) => {
        amountToproduce += Number(e.amount);
        // amountToproduceFragment += Number(e.fraction);
      });
      console.log(values?.actualProducedAmount, amountToproduce, values.productPortionSentCustomer, values?.actualProducedAmount - amountToproduce);
      const num = values?.actualProducedAmount - amountToproduce;
      onHandleChange({ target: { id: `actualProducedAmount`, value: num } });
    }
    // }
  }, [values.productPortionSentCustomer]);
  console.log(values?.actualProducedAmount);
  useEffect(() => {
    if (!isFetchingActual) {
      const val = useCalculateOperation({
        lots: calculateData?.data,
        currentStep: dataList?.step,
        actual: calculateData?.actual,
        actualProducedAmount: dataList?.operationDoc?.actualProducedAmount,
        defect: dataList?.operationDoc?.defectAmount,
      });
      setValueCal(val);
    }
  }, [isFetchingActual]);
  // useEffect(() => {
  //   const amo = values.actualProducedAmount - values.actualProducedAmountA;
  //   console.log(amo);
  //   onHandleChange({ target: { id: `actualProducedAmountA`, value: values.actualProducedAmountA - amo } });
  // }, [values.actualProducedAmount]);

  return (
    <>
      <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />
      <Card className="mb-4 p-2">
        <Row className="mb-1">
          <Row className="d-flex flex-row justify-content-center align-items-center mb-1">
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control disabled type="text" name="productPiecePerPack" value={values.productPiecePerPack} />
                <label className="form-label">{f({ id: 'product.piecePerPack' })}</label>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control disabled type="text" name="pack" value={f({ id: 'dailyPlan.field.pack' })} />
                <label className="form-label">{f({ id: 'dailyPlan.field.pack' })}</label>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control
                  type="text"
                  disabled
                  name="packFraction"
                  value={`${Math.floor(values.productionProducedAmount / values.productPiecePerPack)} ห่อ ${Math.floor(
                    values.productionProducedAmount % values.productPiecePerPack
                  )} ชิ้น`}
                />
                <label className="form-label">{f({ id: 'dailyPlan.field.packFraction' })}</label>
              </div>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control
                  type="text"
                  disabled
                  name="availableAmount"
                  value={`${Math.floor(values.availableAmount / values.productPiecePerPack)} ห่อ ${Math.floor(
                    values.availableAmount % values.productPiecePerPack
                  )} ชิ้น`}
                />
                <label className="form-label">{f({ id: 'dailyPlan.field.inventoryAmount' })}</label>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control disabled type="text" name="b_actualProduction" value={values.actualProducedAmount} />
                <label className="form-label">{f({ id: 'dailyPlan.field.actual' })}</label>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control disabled type="text" name="printBy" value={values.useAmount} />
                <label className="form-label">{f({ id: 'dailyPlan.field.useAmount' })}</label>
              </div>
            </Col>
          </Row>
          <Row className="d-flex flex-row justify-content-center align-items-center mb-1">
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control type="text" name="pickInventory" disabled value={Math.floor(values.pickInventory)} />
                <label className="form-label">{f({ id: 'dailyPlan.field.pickInventory' })}</label>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control type="text" min={0} disabled name="pickInventoryFragment" value={`${Math.floor(values.pickInventoryFragment)}`} />
                <label className="form-label">{f({ id: 'dailyPlan.field.fraction' })}</label>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-3">
              <div className="form-floating">
                <Form.Control type="text" disabled name="lostPack" value={`${Math.floor(values.lostPack)} ห่อ ${Math.floor(values.lostFrac)} ชิ้น`} />
                <label className="form-label">{f({ id: 'dailyPlan.field.lostPack' })}</label>
              </div>
            </Col>
          </Row>
          <Row className="d-flex flex-row justify-content-center align-items-center mb-1">
            <Col xs={12} md={12} className="mt-1">
              <Form.Group controlId="storeLocation">
                <Form.Label className="col-form-label">{f({ id: 'operator.storeLocationSupplier' })}</Form.Label>
                <LovStoreLocationSelect
                  value={values.storeLocation || ''}
                  productId={dataList?.productId}
                  productPiecePerPack={dataList?.productPiecePerPack}
                  inputProps={{ required: true, isInvalid: !!errors.storeLocation }}
                  onChange={(selectedValue) => {
                    onHandleChange({ target: { id: 'batchList', value: selectedValue?.detail?.batchNoList } });
                    selectedValue?.detail?.batchNoList?.forEach((element, index) => {
                      onHandleChange({ target: { id: `batchList.${index}.amount`, value: element.amount } });
                      onHandleChange({
                        target: {
                          id: `batchList.${index}.fraction`,
                          value: element.fraction,
                        },
                      });
                    });
                    onHandleChange({ target: { id: 'inventoryList', value: [] } });
                    onHandleChange({ target: { id: 'storeLocation', value: selectedValue?.value } });
                    onHandleChange({ target: { id: 'materialId', value: selectedValue?.detail?.materialId } });
                    onHandleChange({ target: { id: 'availableAmount', value: selectedValue?.detail?.availableAmount } });
                    // onHandleChange({ target: { id: 'pickInventory', value: selectedValue?.detail?.availableAmount } });
                  }}
                  materialProductType={optionStatus}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="p-2 mb-2">
            <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.batchList' })}</Form.Label>
            <OverlayScrollbarsComponent
              options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
              style={{ maxHeight: '290px' }}
            >
              <FormikProvider value={formik}>
                <FieldArray
                  name="batchList"
                  render={(arrayHelpers) => {
                    return [
                      values.batchList?.map((detail, index) => {
                        return (
                          <Row key={index}>
                            <Col md="4">
                              <Form.Group className="position-relative tooltip-end-top" controlId="start">
                                <Form.Label className="col-form-label">{f({ id: 'inventory.batchList' })}</Form.Label>
                                <Select classNamePrefix="react-select" options={values.batchList} isDisabled value={detail?.optionValue} />
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.pickInventory' })}</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="amount"
                                  value={detail?.amount}
                                  min={0}
                                  disabled
                                  onChange={(value) => {
                                    if (
                                      value === null ||
                                      /^[0-9.]+$/.test(value.target.value.trim()) ||
                                      value.target.value === '' ||
                                      value.target.value === ' '
                                    ) {
                                      // console.log(Number(values.pickInventory), Number(value.target.value));
                                      onHandleChange({ target: { id: `batchList.${index}.amount`, value: value.target.value } });
                                      // onHandleChange({ target: { id: 'pickInventory', value: value.target.value } });
                                      onHandleChange({
                                        target: {
                                          id: `batchList.${index}.lostAmount`,
                                          value: detail?.optionAmount / values.productPiecePerPack - value.target.value,
                                        },
                                      });

                                      onHandleChange({
                                        target: {
                                          id: `useAmount`,
                                          value: Math.floor(detail?.optionAmount / values.productPiecePerPack - value.target.value),
                                        },
                                      });
                                    } else {
                                      value.preventDefault();
                                    }
                                  }}
                                />
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.fraction' })}</Form.Label>
                                <Form.Control
                                  type="text"
                                  min={0}
                                  name="fraction"
                                  value={detail?.fraction}
                                  onChange={(value) => {
                                    if (
                                      value === null ||
                                      /^[0-9.]+$/.test(value.target.value.trim()) ||
                                      value.target.value === '' ||
                                      value.target.value === ' ' ||
                                      Number(value.target.value) < values.productPiecePerPack
                                    ) {
                                      onHandleChange({ target: { id: `batchList.${index}.fraction`, value: value.target.value } });
                                      onHandleChange({
                                        target: {
                                          id: `batchList.${index}.lostFrac`,
                                          value: (values.productionProducedAmount % values.productPiecePerPack) - value.target.value,
                                        },
                                      });
                                    } else {
                                      value.preventDefault();
                                    }
                                  }}
                                />
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.infraction' })}</Form.Label>
                                <Form.Control
                                  type="text"
                                  min={0}
                                  name="optionAmount"
                                  disabled
                                  value={`${detail?.calculateAmount} ห่อ ${detail?.calculateFrac} ชิ้น`}
                                />
                                {/* {errors.endTime && touched.endTime && <div className="d-block invalid-feedback">{f({ id: errors.endTime })}</div>} */}
                              </Form.Group>
                            </Col>
                            <Col md="2">
                              <Form.Group className="position-relative tooltip-end-top" controlId="end">
                                <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.lostPack' })}</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="lostAmount"
                                  value={`${Math.floor(detail?.lostAmount)} ห่อ ${Math.floor(detail?.lostFrac)} ชิ้น`}
                                  disabled
                                  // onChange={(e) => {
                                  //   onHandleChange({ target: { id: `batchList.${index}.lostAmount`, value: e.target.value } });
                                  // }}
                                />
                                {/* {errors.endTime && touched.endTime && <div className="d-block invalid-feedback">{f({ id: errors.endTime })}</div>} */}
                              </Form.Group>
                            </Col>
                            {/* <Form.Control.Feedback type="invalid">Please provide Print color</Form.Control.Feedback> */}
                          </Row>
                        );
                      }),
                      // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                    ];
                  }}
                />
              </FormikProvider>
            </OverlayScrollbarsComponent>
          </div>
          <Col xs={12} md={10} className="mt-1">
            {' '}
          </Col>
          <Col xs={12} md={2} className="mt-1">
            <Button
              variant="warning"
              className="btn-icon btn-icon-start mb-1 w-100"
              disabled={!values.batchList}
              style={{ minWidth: '24.5%' }}
              onClick={(addedItem) => {
                // const amount = values.actualProducedAmount / values.productPiecePerPack;
                values.batchList?.forEach((element) => {
                  adjustMaterial({
                    productId: dataList?.productId,
                    batchNo: element.optionValue?.label,
                    amount: element.lostAmount > 0 ? element.amount * dataList?.productPiecePerPack : -1 * (element.amount * dataList?.productPiecePerPack),
                    storeLocation: values?.storeLocation,
                    cautionList: ['22'],
                  });
                });
              }}
              // disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="edit" /> <span>{f({ id: 'inventory.detail.adjust' })}</span>
            </Button>
          </Col>
        </Row>
      </Card>
      <Card className={`p-2 ${values.productPortionSentCustomer?.length > 3 ? 'overflow-card' : ''}`} style={{ position: 'relative', zIndex: '1' }}>
        <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.fracCustomer' })}</Form.Label>
        <FormikProvider value={formik}>
          <FieldArray
            name="productPortionSentCustomer"
            render={(arrayHelpers) => {
              return [
                values.productPortionSentCustomer?.map((detail, index) => {
                  return (
                    <Row key={index}>
                      <Col md="6">
                        <Form.Group className="position-relative tooltip-end-top" controlId="start">
                          <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.fracName' })}</Form.Label>
                          <Form.Control
                            type="text"
                            name="fracName"
                            value={detail?.name}
                            onChange={(e) => {
                              onHandleChange({ target: { id: `productPortionSentCustomer.${index}.name`, value: e.target.value } });
                            }}
                          />
                          {/* {errors.startTime && touched.startTime && <div className="d-block invalid-feedback">{f({ id: errors.startTime })}</div>} */}
                        </Form.Group>
                      </Col>
                      <Col md="5">
                        <Form.Group className="position-relative tooltip-end-top" controlId="end">
                          <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.fracAmount' })}</Form.Label>
                          <Form.Control
                            type="text"
                            name="fracAmount"
                            value={detail?.amount}
                            onChange={(e) => {
                              onHandleChange({ target: { id: `productPortionSentCustomer.${index}.amount`, value: e.target.value } });
                            }}
                          />
                          {/* {errors.endTime && touched.endTime && <div className="d-block invalid-feedback">{f({ id: errors.endTime })}</div>} */}
                        </Form.Group>
                      </Col>
                      <Col style={{ paddingTop: '35px' }} md="1">
                        <Button
                          className="btn-icon btn-icon-only"
                          variant="outline-danger"
                          hidden={index !== values.productPortionSentCustomer?.length - 1}
                          onClick={() => {
                            delete dataList?.productPortionSentCustomer[index];
                            const productPortionSentCustomer = dataList?.productPortionSentCustomer.filter((e) => e !== undefined);
                            onHandleChange({ target: { id: `productPortionSentCustomer`, value: productPortionSentCustomer } });
                            return arrayHelpers.remove(index);
                          }}
                        >
                          <CsLineIcons icon="bin" />
                        </Button>
                      </Col>
                      <Form.Control.Feedback type="invalid">Please provide Print color</Form.Control.Feedback>
                    </Row>
                  );
                }),
                // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
              ];
            }}
          />
        </FormikProvider>
      </Card>
      <FormikProvider value={formik}>
        <FieldArray
          name="productPortionSentCustomer"
          render={(arrayHelpers) => {
            return [
              <div key="addproductPortionSentCustomer" className="d-grid gap-2 mb-3">
                <Button
                  variant="outline-primary"
                  className="btn-icon btn-icon-start mb-1"
                  onClick={() => {
                    arrayHelpers.insert(values.productPortionSentCustomer?.length, '');
                    onHandleChange({ target: { id: `productPortionSentCustomer.${values.productPortionSentCustomer?.length}.name`, value: '' } });
                    onHandleChange({ target: { id: `productPortionSentCustomer.${values.productPortionSentCustomer?.length}.amount`, value: '' } });
                  }}
                >
                  <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                </Button>
              </div>,
            ];
          }}
        />
      </FormikProvider>
      <div className="mb-3">
        <Row className="d-flex flex-row justify-content-center align-items-center">
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
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.meterAmount' })}</Form.Label>
              <Form.Control
                type="number"
                // disabled={props?.isDisable || props?.isFetchingActualProduction}
                value={valueCal?.c_actualProduceAmount}
                onChange={onChangeActualProducedAmount}
              />
            </Form.Group>
          </Col>
          <Col md="3">
            <Form.Group className="position-relative tooltip-end-top" controlId="print-color">
              <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.wrong' })}</Form.Label>
              <Form.Control
                type="number"
                // disabled={props?.isDisable || props?.isFetchingActualProduction}
                value={valueCal?.d_defect}
                onChange={onChangeDefectAmount}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OperatorPack;
