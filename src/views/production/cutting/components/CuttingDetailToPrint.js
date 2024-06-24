import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { NavLink, useHistory, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Row, Col, Button, Form, Card, FormLabel } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';

import ReactToPrint from 'react-to-print';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useCuttingData from 'hooks/api/cutting/useCuttingData';
import BoxItem from 'views/test/konva/BoxItem';
import { toast } from 'react-toastify';
import './style.css';

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

const CuttingDetailToPrint = React.forwardRef(({ match }, ref) => {
  // console.debug('Match :', match);
  const { productionOrderId } = useParams();
  // console.debug(`productionOrderId : ${productionOrderId}`);

  const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
  const { push, replace, goBack } = useHistory();
  const componentRef = useRef(null);
  const [boxList, setBoxList] = useState();
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(400);
  const boxProps = useMemo(() => ({ width, height, enableAmountAdjustment: false }), [width, height]);

  const [defectTitle, setDefectTitle] = useState('');
  const [defectDesc, setDefectDesc] = useState('');
  const [defectAmount, setDefectAmount] = useState('');
  const [isConfirmShow, setConfigmShow] = useState(false);

  const { useGetDetailForCuttingQuery, useSaveCuttingDetailMutation, useCompleteCuttingMutation } = useCuttingData();

  const { data, isLoading } = useGetDetailForCuttingQuery({
    productionOrder: productionOrderId,
  });

  const { mutateAsync: saveCuttingAsync, isLoading: isSaving } = useSaveCuttingDetailMutation();

  const { mutateAsync: completeCuttingAsync, isLoading: isFinishing } = useCompleteCuttingMutation();

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
            cuttingLayout: layout,
          };
        })
      );
    }
  }, [data]);

  const handleDefectTitleChange = useCallback((e) => {
    setDefectTitle(e.target.value);
  }, []);
  const handleDefectDescChange = useCallback((e) => {
    setDefectDesc(e.target.value);
  }, []);
  const handleDefectAmountChange = useCallback((e) => {
    setDefectAmount(e.target.value);
  }, []);

  const formik = useFormik({ initialValues: data || getDefaultValues(), validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, setFieldValue, resetForm, values, touched, errors, setFieldError } = formik;

  const title = values?.producedProductName;
  const description = values?.no;

  const handleAddDefectClick = useCallback(() => {
    const defectList = [...(values.defectList || [])];

    setFieldError('defectTitle', undefined);

    let isError = false;
    if (!defectTitle) {
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

    const defect = {
      title: defectTitle,
      description: defectDesc,
      amount: parseFloat(defectAmount || '0'),
    };

    defectList.push(defect);

    setFieldValue('defectList', defectList);

    setDefectTitle('');
    setDefectDesc('');
    setDefectAmount('');
  }, [defectAmount, defectDesc, defectTitle, setFieldError, setFieldValue, values.defectList]);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('chrome') > -1) {
      console.log(userAgent);

      document.body.classList.add('chrome-browser');
    }
  }, []);


  return (
    <>
      <div ref={ref}>
        {/* <Card.Body> */}
        <Row className="h-100">
          <Col
            xs={12}
            className={classNames({
              'overlay-spinner': isLoading,
            })}
            style={{ maxHeight: '300px', position: 'relative' }}
          >
            {boxList?.map((box, idx) => (
              <div key={idx} style={{ fontSize: '1.1rem', minHeight: '100vh' }} id="boxItem-print">
                <Col>
                  <div className="py-3">
                    <Row>
                      <Col>
                        <h1 className="pb-0 display-4">{title}</h1>
                        <div className="text-muted font-heading text-medium">{description}</div>
                      </Col>
                      {/* <div style={{ position: 'absolute', right: '0'}}>
                          {idx + 1}
                        </div> */}
                    </Row>
                  </div>
                </Col>
                <Col>
                  <Form onSubmit={handleSubmit}>
                    <Row className="style-to-print">
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
                </Col>

                <BoxItem
                  boxId={box.boxId}
                  producedAmount={box.producedAmount}
                  onDisableDefault="true"
                  // materialId={box.materialId}
                  productId={box.productId}
                  defaultCuttingLayout={box.cuttingLayout}
                  boxProps={boxProps}
                  defaultMaterial={box.materialId}
                  selectedArea={box.storeData}
                  fontSize={2.5}
                  RightSide={(rProps) => {
                    const selectedCuttingLayout = rProps?.selectedCuttingLayout;
                    const materialUsedAmount = rProps?.selectedCuttingLayout?.materialUsedAmount;
                    const printedAmount = rProps?.selectedCuttingLayout?.printedAmount;
                    const cuttingLayout = rProps?.selectedCuttingLayout?.name;

                    const cuttingLayoutValue = useMemo(
                      () => rProps.cuttingLayoutOptions?.filter((cl) => cl.value === rProps.selectedCuttingLayout.item) || null,
                      [rProps.cuttingLayoutOptions, rProps.selectedCuttingLayout.item]
                    );

                    if (!rProps.isLoadingCuttingLayout) {
                      const cuttingLayoutList = cuttingLayoutValue;
                      rProps?.onCuttingLayoutChange?.(cuttingLayoutList[0].value);
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
                        <Row>
                          <Col sm="12" md="12" lg="12">
                            <div style={{ fontWeight: '900' }}>{f({ id: 'production.produce.cutting-layout' })}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Col className="mb-2" sm="12" md="12" lg="12">
                            <Form.Control type="text" name="cuttingLayout" value={cuttingLayout || ''} readOnly />
                          </Col>
                        </Row>

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
                              <span className="align-middle text-alternate">
                                <b>{selectedCuttingLayout?.producedAmount || <CsLineIcons icon="question-hexagon" className="text-muted me-2" size="18" />}</b>
                                {/* <NumberFormat className="form-control" thousandSeparator="," value={selectedCuttingLayout?.producedAmount} decimalSeparator="." prefix="" /> */}
                              </span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2 text-hover-body">
                              <span className="align-middle text-alternate">
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
                              <CsLineIcons icon="maximize" className="text-muted me-2" size="18" />
                              <span className="align-middle text-alternate">
                                {f({ id: 'production.produce.grain' })}:{' '}
                                <b>{selectedCuttingLayout?.grainSize || <CsLineIcons icon="question-hexagon" className="text-muted me-2" size="18" />}</b>
                              </span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2 text-hover-body">
                              <i className="me-2 align-middle text-muted cs-icon icon-18 bi-ui-checks-grid" />
                              <span className="align-middle text-alternate">
                                {f({ id: 'production.produce.cavity' })}:{' '}
                                <b>{selectedCuttingLayout?.cavity || <CsLineIcons icon="question-hexagon" className="text-muted me-2" size="18" />}</b>
                              </span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2 text-hover-body">
                              <CsLineIcons icon="grid-1" className="text-muted me-2" size="18" />
                              <span className="align-middle text-alternate">
                                {f({ id: 'production.produce.cutting-pieces' })}:{' '}
                                <b>{selectedCuttingLayout?.cuttingPieces || <CsLineIcons icon="question-hexagon" className="text-muted me-2" size="18" />}</b>
                                {f({ id: 'production.produce.cutting-pieces-unit' })}
                              </span>
                            </div>
                          </Col>

                          <Col md={6}>
                            <div className="mb-2 text-hover-body">
                              <i className="me-2 align-middle text-muted cs-icon icon-18 bi-speedometer" />
                              <span className="align-middle text-alternate">
                                {f({ id: 'production.produce.efficiency' })}: <b>{Number(selectedCuttingLayout?.efficiency || 0).toFixed(2)} %</b>
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </Row>
                    );
                  }}
                />
              </div>
            ))}
          </Col>
        </Row>
        {/* </Card.Body> */}
        {/* 
        <Card.Body>
          <Row>
            <Col className="" md={6}>
              <b>{f({ id: 'cutting.detail.total' })}</b>: {data?.producedAmount} {f({ id: 'common.unit.piece' })}
            </Col>
            <Col className="" sm={5}>
              <Form.Check
                type="switch"
                label={f({ id: 'cutting.detail.found-defect' })}
                className=""
                id="isFoundDefect"
                name="isFoundDefect"
                checked={values.isFoundDefect}
                onChange={handleChange}
                isInvalid={errors.defectList}
              />
              {errors.defectList && <div className="d-block invalid-feedback">{f({ id: errors.defectList })}</div>}
            </Col>
          </Row>
          <Row>
            <Col sm={10}>
              <div className="mb-2 text-hover-body">
                <FormLabel>{f({ id: 'cutting.detail.defect-title' })}:</FormLabel>
                <Form.Control
                  type="text"
                  name="defectTitle"
                  className="text-field"
                  value={defectTitle}
                  onChange={handleDefectTitleChange}
                  isInvalid={errors.defectTitle}
                  disabled={!values.isFoundDefect}
                />
                {errors.defectTitle && <div className="d-block invalid-feedback">{f({ id: errors.defectTitle })}</div>}
              </div>
            </Col>
            <Col sm={2}>
              <div className="mb-2 text-hover-body">
                <FormLabel>{f({ id: 'cutting.detail.defect-amount' })}:</FormLabel>
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
                id='deleteBorder'
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
        </Card.Body> */}

        {values.defectList?.map((defect, idx) => (
          // eslint-disable-next-line no-underscore-dangle
          <div key={defect._id || `df${idx}_${defect.title}-${defect.description}-${defect.amount}`} className="mb-3">
            <Row style={{ border: '1px solid', margin: '1rem', padding: '.4rem' }}>
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
            </Row>
          </div>
        ))}
      </div>
    </>
  );
});

export default CuttingDetailToPrint;
