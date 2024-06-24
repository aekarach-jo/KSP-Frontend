import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Row, Col, Button, Form, Card, FormLabel } from 'react-bootstrap';
import Glide from 'components/carousel/Glide';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import './components/style.css';

import ReactToPrint from 'react-to-print';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useCuttingData from 'hooks/api/cutting/useCuttingData';
import BoxItem from 'views/test/konva/BoxItem';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import { toast } from 'react-toastify';
import LovCautionListSelect from 'components/lov-select/LovDefectSelect';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import CuttingDetailToPrint from './components/CuttingDetailToPrint';

const getDefaultValues = () => ({
  isFoundDefect: false,
  defectList: [],
});

const defectSchema = Yup.object({
  title: Yup.string().required(),
  description: Yup.string(),
  amount: Yup.number().min(0).required(),
});

const validationSchema = Yup.object({
  isFoundDefect: Yup.bool(),
  defectList: Yup.array(defectSchema) //
    .when('isFoundDefect', {
      is: true, //
      then: Yup.array(defectSchema).required('cutting.detail.validation.defectList').min(1, 'cutting.detail.validation.defectList'),
    }),
});

const CuttingDetail = ({ match }) => {
  // console.debug('Match :', match);
  const { productionOrderId } = match.params;
  // console.debug(`productionOrderId : ${productionOrderId}`);

  const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
  const { push, replace, goBack } = useHistory();
  const componentRef = useRef(null);
  const [boxList, setBoxList] = useState([]);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [isShowMessage, setShowMessage] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [isComplatedAll, setIsComplatedAll] = useState(true);
  const boxProps = useMemo(() => ({ width, height, enableAmountAdjustment: false }), [width, height]);

  const [defectTitle, setDefectTitle] = useState('');
  const [defectDesc, setDefectDesc] = useState('');
  const [defectAmount, setDefectAmount] = useState('');
  const [isConfirmShow, setConfigmShow] = useState(false);
  const { useGetDetailForCuttingQuery, useSaveCuttingDetailMutation, useCompleteCuttingMutation, useSaveLayoutStatusMutation, useUpdateCuttingStatusMutation } =
    useCuttingData();

  const { data, isLoading, refetch } = useGetDetailForCuttingQuery({
    productionOrder: productionOrderId,
  });

  const { mutateAsync: saveLayoutStatusAsync, isLoading: isStatusSaving } = useSaveLayoutStatusMutation();
  const { mutateAsync: saveCuttingAsync, isLoading: isSaving } = useSaveCuttingDetailMutation();
  const { mutateAsync: completeCuttingAsync, isLoading: isFinishing } = useCompleteCuttingMutation();
  const { mutateAsync: updateCuttingStatusMutation } = useUpdateCuttingStatusMutation();

  useEffect(() => {
    if (data) {
      setBoxList(
        data.detail.map((d) => {
          const layout = d.layoutDetail?.find((ld) => ld.item === d.selectedLayout);
          return {
            boxId: d.id,
            item: d.item,
            materialId: d.materialId,
            materialName: d.materialName,
            productId: data.producedProductId,
            producedAmount: layout?.producedAmount,
            selectedLayout: d.selectedLayout,
            layoutDetail: d.layoutDetail,
            status: d.status,
            cuttingLayout: layout,
            storeData: d.storeData,
          };
        })
      );
      const toProduced = localStorage.getItem(`${data?.no}_toProduced`) || false;
      console.log(toProduced);
      if (toProduced === 'false') {
        setIsMatch(true);
      } else {
        setIsMatch(false);
      }
    }
  }, [data]);

  useEffect(() => {
    if (boxList.length > 0) {
      const state = boxList?.some((item) => item.status !== 'COMPLETED');
      if (!state) {
        setIsComplatedAll(false);
      }
    }
  }, [data, boxList]);

  const handleDefectDescChange = useCallback((e) => {
    setDefectDesc(e.target.value);
  }, []);
  const handleDefectAmountChange = useCallback((e) => {
    setDefectAmount(e.target.value);
  }, []);

  // Form stuff
  const onSubmit = useCallback(() => {
    setConfigmShow(true);
  }, []);

  const formik = useFormik({ initialValues: data || getDefaultValues(), validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, setFieldValue, values, touched, errors, setFieldError } = formik;

  const title = values?.producedProductName;
  const description = values?.no;

  const handleAddDefectClick = useCallback(() => {
    const defectList = [...(values.defectList || [])];

    setFieldError('defectTitle', undefined);

    let isError = false;
    if (!defectTitle || defectTitle === undefined || defectTitle === '') {
      setFieldError('defectTitle', 'cutting.detail.validation.defectTitle');
      isError = true;
    }

    /* if (!defectDesc) {
      setFieldError('defectDescription', 'cutting.detail.validation.defectDescription');
      isError = true;
    } */

    if (!defectAmount) {
      setFieldError('defectAmount', 'cutting.detail.validation.defectAmount');
      isError = true;
    }

    if (isError) {
      return;
    }
    const textDefect = [];
    defectTitle?.forEach((element, index) => {
      if (index > 0) {
        textDefect.push(', '); // Add a comma and space before the label
      }
      textDefect.push(element.label);
    });

    const concatenatedText = textDefect.join('');
    const defect = {
      title: concatenatedText,
      description: defectDesc,
      amount: parseFloat(defectAmount || '0'),
    };

    console.debug('defect: ', defect);

    defectList.push(defect);

    setFieldValue('defectList', defectList);

    setDefectTitle([]);
    setDefectDesc('');
    setDefectAmount('');
  }, [defectAmount, defectDesc, defectTitle, setFieldError, setFieldValue, values.defectList]);

  const createHandleDeleteDefectClick = useCallback(
    (defect, idx) => () => {
      const defectList = [...(values.defectList || [])];

      defectList.splice(idx, 1);
      setFieldValue('defectList', defectList);
    },
    [setFieldValue, values.defectList]
  );

  const handleSave = useCallback(async () => {
    try {
      const { id: productionOrder, defectList, isFoundDefect } = values;
      await saveCuttingAsync({
        productionOrder,
        defectList,
        isFoundDefect,
      });
      toast.success(f({ id: 'common.save.success' }));
    } catch (err) {
      toast.error(f({ id: 'customer.save.fail' }));
    }
  }, [f, saveCuttingAsync, values]);

  const handleSubmitLayout = useCallback(
    async (value) => {
      try {
        await saveLayoutStatusAsync({
          productionOrderDetail: value?.boxId,
          status: 'COMPLETED',
        });
        toast.success(f({ id: 'common.save.success' }));
        refetch();
      } catch (err) {
        toast.error(f({ id: 'customer.save.fail' }));
      }
    },
    [f, refetch, saveLayoutStatusAsync]
  );

  const handleConfirm = useCallback(async () => {
    try {
      await completeCuttingAsync({ productionOrder: values.id });
      const tempData = {
        productionOrder: values.id,
        cuttingStatus: 'COMPLETED',
      };
      await updateCuttingStatusMutation({ formData: tempData });
      setConfigmShow(false);
      push('/production/cutting');
      toast.info(f({ id: 'common.save.success' }));
    } catch (err) {
      toast.error(f({ id: 'customer.save.fail' }));
    }
  }, [completeCuttingAsync, f, push, values.id]);

  const handleChangeCautionList = (value) => {
    if (value !== null) {
      setDefectTitle(value);
      handleChange({ target: { id: 'cautionList', value } });
    } else {
      const cautionList = '';
      setDefectTitle(cautionList);
      handleChange({ target: { id: 'cautionList', value: cautionList } });
    }
  };
  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  // console.log(isMatch);
  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        {/* Title Start */}
        <div className="page-title-container mb-3">
          <Row>
            <Col xs="auto" className="mb-2 align-self-md-center">
              <NavLink to="#" onClick={goBack} className="btn-link btn-icon-start w-100 w-md-auto">
                <CsLineIcons icon="arrow-left" /> {/* <span>{f({ id: 'common.back' })}</span> */}
              </NavLink>
            </Col>
            <Col className="mb-2">
              <h1 className="mb-2 pb-0 display-4">{title}</h1>
              <div className="text-muted font-heading text-medium">{description}</div>
            </Col>
            <Col xs="12" sm="auto" className="align-self-md-center">
              {data?.status !== 'COMPLETED' && data?.status !== 'CANCELLED' && (
                <Button
                  className={classNames('btn-icon', {
                    'overlay-spinner': isSaving,
                  })}
                  variant="outline-info"
                  onClick={handleSave}
                  disabled={isMatch}
                >
                  <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                </Button>
              )}{' '}
              {/* {data?.status !== 'COMPLETED' && data?.status !== 'CANCELLED' && ( */}
                <Button className="btn-icon" variant="success" onClick={handleSubmit}>
                  <CsLineIcons icon="check" /> {f({ id: 'cutting.group.field.submit' })}
                </Button>{' '}
              {/* )}{' '} */}
              <ReactToPrint
                trigger={() => (
                  <Button variant="info" size="small" disabled={isLoading}>
                    {f({ id: 'common.print' })}
                  </Button>
                )}
                content={() => componentRef.current}
              />
            </Col>
          </Row>
        </div>
      </Col>

      <Card
        className={classNames('mb-5', {
          'overlay-spinner': isLoading,
        })}
      >
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3 g-3" style={{ fontSize: '1.3rem' }}>
              <Col md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="operatorName">
                  <Form.Label>{f({ id: 'cutting.group.field.operator' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="operatorName"
                    onChange={handleChange}
                    value={data?.operator || ''}
                    // isInvalid={errors.operatorName && touched.operatorName}
                    readOnly
                    autoComplete="off"
                  />
                </Form.Group>
              </Col>

              <Col md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="orderDate">
                  <Form.Label>{f({ id: 'cutting.group.field.orderDate' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="orderDate"
                    onChange={handleChange}
                    value={data ? `${fd(data.producedCODate)} ${ft(data.producedCODate)}` : ''}
                    isInvalid={errors.orderDate && touched.orderDate}
                    readOnly
                    autoComplete="off"
                  />
                  {errors.orderDate && touched.orderDate && <div className="d-block invalid-feedback">{f({ id: errors.lotNo })}</div>}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card
        className={classNames('mb-5', {
          'overlay-spinner': isLoading,
        })}
      >
        <Card className="p-1">
          <Row>
            <Col
              xs={12}
              className={classNames({
                'overlay-spinner': isLoading,
              })}
              style={{ minHeight: 200 }}
            >
              {boxList.length > 0 && (
                <>
                  <Glide
                    options={{
                      gap: 1,
                      perView: 1,
                      dragThreshold: 0,
                    }}
                  >
                    {boxList?.map((box, idx) => (
                      <Glide.Item key={`single.${idx}`}>
                        <Card
                          // key={box.boxId}
                          className={classNames('mb-3', {
                            'overlay-spinner': isLoading,
                          })}
                        >
                          <>
                            <div style={{ display: 'flex', justifyContent: 'end', padding: '0 10px' }}>
                              <Button
                                // variant="outline-info"
                                size="sm"
                                disabled={box?.status === 'COMPLETED' || isMatch}
                                className={classNames('btn-icon mt-1', {
                                  'overlay-spinner': isLoading,
                                })}
                                style={{ fontSize: '1.2rem', width: '49%' }}
                                onClick={() => handleSubmitLayout(box)}
                              >
                                {box?.status === 'COMPLETED' ? (
                                  <>{f({ id: 'cutting.group.field.completed' })}</>
                                ) : (
                                  <>{f({ id: 'cutting.group.field.complete' })} </>
                                )}
                              </Button>
                            </div>

                            <div className="p-2" style={{ fontSize: '1.2rem' }}>
                              <BoxItem
                                boxId={box.boxId}
                                producedAmount={box.producedAmount}
                                // materialId={box.materialId}
                                productId={box.productId}
                                defaultCuttingLayout={box.cuttingLayout}
                                boxProps={boxProps}
                                defaultMaterial={box.materialId}
                                selectedArea={box.storeData}
                                RightSide={(rProps) => {
                                  const selectedCuttingLayout = rProps?.selectedCuttingLayout;
                                  const materialUsedAmount = rProps?.selectedCuttingLayout?.materialUsedAmount;
                                  const printedAmount = rProps?.selectedCuttingLayout?.printedAmount;
                                  const cuttingLayout = rProps?.selectedCuttingLayout?.name;
                                  // const cuttingLayoutForm = { value: rProps?.selectedCuttingLayout?.item, label: rProps?.selectedCuttingLayout?.name };
                                  // console.log(box);

                                  const cuttingLayoutValue = useMemo(
                                    () => rProps.cuttingLayoutOptions?.filter((cl) => cl.value === rProps.selectedCuttingLayout.item) || null,
                                    [rProps.cuttingLayoutOptions, rProps.selectedCuttingLayout.item]
                                  );

                                  if (!rProps.isLoadingCuttingLayout) {
                                    const cuttingLayoutList = cuttingLayoutValue;
                                    // console.log(cuttingLayoutList);
                                    rProps?.onCuttingLayoutChange?.(cuttingLayoutList?.[0]?.value);
                                  }

                                  return (
                                    <Row>
                                      <Row>
                                        <Col sm="12" md="12" lg="12">
                                          <div style={{ fontWeight: '900' }}>{f({ id: 'cutting.group.field.lotNo' })}</div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col className="mb-2" sm="12" md="12" lg="12">
                                          <Form.Control type="text" name="lotNo" value={data?.lotNo || ''} readOnly />
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col sm="12" md="12" lg="12">
                                          <div style={{ fontWeight: '900' }}>{f({ id: 'production.produce.raw-material' })}</div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col className="mb-2" sm="12" md="12" lg="12">
                                          <Form.Control type="text" name="materialName" value={box?.materialName || ''} readOnly />
                                        </Col>
                                      </Row>
                                      {/* <Row>
                                        <Col sm="12" md="12" lg="12">
                                          <div style={{ fontWeight: '900' }}>{f({ id: 'production.produce.cutting-layout' })}</div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col className="mb-2" sm="12" md="12" lg="12">
                                          <Form.Control type="text" name="cuttingLayout" value={cuttingLayout || ''} readOnly />
                                        </Col>
                                      </Row> */}

                                      <Row>
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <span className="align-middle" style={{ fontWeight: '900' }}>
                                              {f({ id: 'production.produce.produce-amount' })}
                                            </span>
                                          </div>
                                        </Col>
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <span className="align-middle" style={{ fontWeight: '900' }}>
                                              {f({ id: 'production.produce.orderedBy' })}
                                            </span>
                                          </div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <span className="align-middle ">
                                              <b>
                                                {selectedCuttingLayout?.producedAmount || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}
                                              </b>
                                              {/* <NumberFormat className="form-control" thousandSeparator="," value={selectedCuttingLayout?.producedAmount} decimalSeparator="." prefix="" /> */}
                                            </span>
                                          </div>
                                        </Col>
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <span className="align-middle ">
                                              <b>{(Number(rProps?.producedAmount) || rProps?.amount || 0).toFixed(0)}</b>
                                            </span>
                                          </div>
                                        </Col>
                                      </Row>

                                      <Row>
                                        <Col sm="12" md="12" lg="6">
                                          <div style={{ fontWeight: '900' }}>{f({ id: 'production.produce.material-useAmount' })}</div>
                                        </Col>
                                        <Col sm="12" md="12" lg="6">
                                          <div style={{ fontWeight: '900' }}>{f({ id: 'production.produce.print-amount' })}</div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col className="mb-2" sm="12" md="12" lg="6">
                                          <div style={{ fontWeight: '100' }}>{materialUsedAmount}</div>
                                        </Col>
                                        <Col className="mb-2" sm="12" md="12" lg="6">
                                          <div style={{ fontWeight: '100' }}>{printedAmount}</div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col sm="12" md="12" lg="12">
                                          <div style={{ fontWeight: '900' }}>{f({ id: 'cutting.detail.warning' })}</div>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col sm="12" md="12" lg="12">
                                          <div style={{ fontWeight: '100' }}>-</div>
                                        </Col>
                                      </Row>
                                      <Row className="mb-2">
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <CsLineIcons icon="maximize" className=" me-2" size="18" />
                                            <span className="align-middle ">
                                              {f({ id: 'production.produce.grain' })}:{' '}
                                              <b>{selectedCuttingLayout?.grainSize || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
                                            </span>
                                          </div>
                                        </Col>
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <i className="me-2 align-middle  cs-icon icon-18 bi-ui-checks-grid" />
                                            <span className="align-middle ">
                                              {f({ id: 'production.produce.cavity' })}:{' '}
                                              <b>{selectedCuttingLayout?.cavity || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
                                            </span>
                                          </div>
                                        </Col>
                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <CsLineIcons icon="grid-1" className=" me-2" size="18" />
                                            <span className="align-middle ">
                                              {f({ id: 'production.produce.cutting-pieces' })}:{' '}
                                              <b>
                                                {selectedCuttingLayout?.cuttingPieces || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}
                                              </b>
                                              {f({ id: 'production.produce.cutting-pieces-unit' })}
                                            </span>
                                          </div>
                                        </Col>

                                        <Col md={6}>
                                          <div className="mb-2 text-hover-body">
                                            <i className="me-2 align-middle  cs-icon icon-18 bi-speedometer" />
                                            <span className="align-middle ">
                                              {f({ id: 'production.produce.efficiency' })}: <b>{Number(selectedCuttingLayout?.efficiency).toFixed(2)} %</b>
                                            </span>
                                          </div>
                                        </Col>
                                      </Row>
                                    </Row>
                                  );
                                }}
                              />
                            </div>
                          </>
                        </Card>
                      </Glide.Item>
                    ))}
                  </Glide>
                </>
              )}
            </Col>
          </Row>
        </Card>
      </Card>

      <Card
        className={classNames('mb-3', {
          'overlay-spinner': isLoading,
        })}
      >
        <Card.Body>
          <Row>
            <Col className="" md={5}>
              <b>{f({ id: 'cutting.detail.total' })}</b>: {data?.producedAmount} {f({ id: 'common.unit.piece' })}
            </Col>
            <Col className="" sm={4}>
              <Row>
                <Col md="8" className="text-end">
                  <Form.Label>{f({ id: 'cutting.detail.found-defect' })}</Form.Label>
                </Col>
                <Col md="4">
                  <Form.Check
                    type="switch"
                    id="isFoundDefect"
                    name="isFoundDefect"
                    checked={values.isFoundDefect}
                    onChange={handleChange}
                    isInvalid={errors.defectList}
                  />
                  {errors.defectList && <div className="d-block invalid-feedback">{f({ id: errors.defectList })}</div>}
                </Col>{' '}
              </Row>
            </Col>
            <Col sm={3} style={{ textAlign: 'right' }}>
              <CsLineIcons className="text-primary" icon="plus" />
              <a href="#" onClick={toggleManageAddModal}>
                {f({ id: 'common.message' })}
              </a>
              {/* <Button className="w-100" variant="outline-primary" disabled={!isEditMode} onClick={toggleManageAddModal}>
                    จัดการข้อความ
                  </Button> */}
            </Col>
          </Row>
          <Row>
            <Col sm={8}>
              <Form.Label className="col-form-label">{f({ id: 'product.field.problem' })}</Form.Label>
            </Col>
            <Col sm={4}>
              <FormLabel>{f({ id: 'cutting.detail.defect-amount' })}:</FormLabel>
            </Col>
            <Col sm={8}>
              <LovCautionListSelect
                name="cautionList"
                isClearable
                onChange={handleChangeCautionList}
                value={values.cautionList || ''}
                isMulti
                valueChange={valueChangeCaution}
                setValueChange={setValueChangeCaution}
                typeMessage="P"
                isDisabled={!values.isFoundDefect}
              />
              {errors.defectTitle && <div className="d-block invalid-feedback">{f({ id: errors.defectTitle })}</div>}
              <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />
            </Col>
            <Col sm={4}>
              <div className="mb-2 text-hover-body">
                <Form.Control
                  type="number"
                  name="defectAmount"
                  className="text-field"
                  value={defectAmount}
                  onChange={handleDefectAmountChange}
                  min={0}
                  isInvalid={errors.defectAmount}
                  style={{
                    textAlign: 'center',
                  }}
                  disabled={!values.isFoundDefect}
                />
                {errors.defectAmount && <div className="d-block invalid-feedback">{f({ id: errors.defectAmount })}</div>}
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <div className="mb-2 text-hover-body">
                <FormLabel>{f({ id: 'cutting.detail.defect-description' })}:</FormLabel>
                <Form.Control
                  as="textarea"
                  name="defectDescription"
                  className="text-field"
                  rows={3}
                  value={defectDesc}
                  onChange={handleDefectDescChange}
                  isInvalid={errors.defectDescription}
                  disabled={!values.isFoundDefect}
                />
                {errors.defectDescription && <div className="d-block invalid-feedback">{f({ id: errors.defectDescription })}</div>}
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm={12} className="text-center d-flex-center">
              <FormLabel className="w-100" />
              <Button
                variant="info"
                className="btn-icon btn-icon-only d-flex justify-content-center align-items-center mx-auto d-block"
                style={{ padding: '20px 300px', fontSize: '24px' }}
                onClick={handleAddDefectClick}
                disabled={!values.isFoundDefect}
              >
                <span className="d-inline-block text-center">
                  <CsLineIcons icon="plus" /> {f({ id: 'cutting.detail.save' })}
                </span>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {values.defectList?.map((defect, idx) => (
        // eslint-disable-next-line no-underscore-dangle
        <Card key={defect._id || `df${idx}_${defect.title}-${defect.description}-${defect.amount}`} className="mb-3">
          <Card.Body>
            <Row>
              <Col sm={11}>
                <Row>
                  <Col className="" md={12}>
                    <b>{f({ id: 'cutting.detail.defect' })}</b>: {defect?.title}
                  </Col>
                  <Col className="" md={12}>
                    <b>{f({ id: 'cutting.detail.defect-description' })}</b>: {defect?.description}
                  </Col>
                  <Col className="" md={12}>
                    <b>{f({ id: 'cutting.detail.defect-amount2' })}</b>: {defect?.amount}
                  </Col>
                </Row>
              </Col>
              <Col sm className="m-auto text-center">
                <Button onClick={createHandleDeleteDefectClick(defect, idx)} disabled={!values.isFoundDefect}>
                  {f({ id: 'common.delete' })}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      <div id="printing">
        <CuttingDetailToPrint
          ref={(el) => {
            componentRef.current = el;
          }}
        />
      </div>
      <ConfirmModal
        show={isConfirmShow}
        titleText={f({ id: 'cutting.detail.confirm.title' })}
        confirmText={f({ id: 'cutting.detail.confirm.desc' })}
        okText={f({ id: 'common.yes' })}
        cancelText={f({ id: 'common.no' })}
        loading={isFinishing}
        onConfirm={handleConfirm}
        onCancel={() => setConfigmShow(false)}
      />
    </>
  );
};

export default CuttingDetail;
