import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Tab, Tabs, Form, Badge, Spinner } from 'react-bootstrap';
import clx from 'classnames';
import { useIntl } from 'react-intl';
import moment from 'moment';
import './style.css';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useProductPlanOptions from 'hooks/useProductPlanOptions';

const CardContainer = (props) => {
  const { page, prepareRow } = props.tableInstance;
  const { page: page2, prepareRow: prepareRow2 } = props.tableInstance2;
  const [key, setKey] = useState('pending');
  const { formatMessage: f } = useIntl();
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const onSetShowModal = (id, data) => {
    // if (data?.status === 'NEW') {
    //   console.log(data?.previousStepStatus);
    //   if (
    //     data?.previousStepStatus === 'PENDING' ||
    //     data?.previousStepStatus === 'CONFIRMED' ||
    //     data?.previousStepStatus === 'COMPLETED' ||
    //     data?.previousStepStatus === null
    //   ) {
    //     props.setShowModal(true);
    //   } else {
    //     props?.setConfirm(true);
    //   }
    // } else {
      props?.setConfirm(true);
    // }

    props.setProductId(id);
    props.setOperationData(data);
  };

  const setQcOperation = (id, data) => {
    props.setProductId(id);
    props.setShowModalConfirmQc(true);
    props.setOperationData(data);
  };

  return (
    <>
      <Card className="mt-3 p-4">
        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3 ">
          <Tab
            eventKey="pending"
            title="รอดำเนินการ"
            // className={clx('react-table page-print z-index-1000', {
            //   'overlay-spinner z-index-1000': props?.isFetching,
            // })}
          >
            {!props?.isFetching ? (
              <>
                {page.map((production, index) => {
                  prepareRow(production);
                  const {
                    original: { productSubType, producedSize },
                  } = production;
                  return (
                    <>
                      <Row>
                        <Badge bg="info" style={{ display: 'flex', justifyContent: 'flex-start' }} className="h6 badge-lg">
                          {index + 1} {'.'} {producedSize}
                        </Badge>
                      </Row>
                      <Card key={`card.${index}`} className="mb-3" style={{ fontSize: '1.2rem' }}>
                        <Row>
                          {productSubType.map((itemType, indexType) => (
                            <div key={indexType}>
                              {itemType.planDate.map((itemDate, indexDate) => (
                                <div key={indexDate}>
                                  {itemDate?.itemList.map((itemD, indexD) => {
                                    const step = planOptionsList?.find((item) => item?.value === itemD?.step);
                                    return (
                                      <Card
                                        className=" rounded-5 p-0 cursor-pointer position-relative card-operation mb-2"
                                        key={indexD}
                                        style={{
                                          // ทำสี backdrond ของ card ให้สลับกัน
                                          ...(index % 2 === 0 ? { background: '#f9f9f9' } : {}),
                                          // ...(itemD?.previousStepStatus === 'NEW' || ? { background: '#cacaca' } : {}),
                                        }}
                                      >
                                        <Row onClick={() => onSetShowModal(itemD.id, itemD)}>
                                          <Col lg="3" md="0" xs="0" className="wrap-img">
                                            <img
                                              className="image-operationStep"
                                              src={`/img/operation/step${step?.value?.toString().length !== 3 ? step?.value : 'QC'}.webp` || ''}
                                              alt={step?.label || `img-${step?.value}`}
                                            />
                                          </Col>
                                          <Col lg="9" md="12" xs="12" className="p-3">
                                            <Row className="">
                                              <Col lg="7" md="12" xs="12" className="mb-2">
                                                <Form.Label className="text-medium text-uppercase mb-0">
                                                  {f({ id: 'dailyPlan.field.name' })} ({itemD.status})
                                                </Form.Label>
                                                <div> {itemD.productName}</div>
                                              </Col>
                                              <Col lg="3" md="12" xs="12" className="mb-2">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
                                                <div>{itemD?.customer?.length > 0 && itemD?.customer[0]?.customerName}</div>
                                              </Col>
                                              <Col lg="2" md="12" xs="12" className="mb-2">
                                                <Form.Label className="text-medium text-uppercase mb-0">
                                                  {f({ id: 'dailyPlan.field.cutting_status' })}
                                                </Form.Label>
                                                <div>
                                                  {`${
                                                    (itemD?.productionCuttingStatus === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                                                    (itemD?.productionCuttingStatus === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                                                    (itemD?.productionCuttingStatus === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                                                    (itemD?.productionCuttingStatus === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
                                                  } `}
                                                </div>
                                              </Col>
                                              <Col lg="3" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.number' })}</Form.Label>
                                                <div>{itemD.materialUsedAmount}</div>
                                              </Col>

                                              <Col lg="4" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                                                <div>{itemD.productionOrderNo}</div>
                                              </Col>
                                              <Col lg="3" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'operator.field.machin' })}</Form.Label>
                                                <div>{itemD.machineName}</div>
                                              </Col>
                                              <Col lg="2" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.planDate' })}</Form.Label>
                                                <div>{moment(itemD.planDate).add(543, 'year').format('DD/MM/YYYY')}</div>
                                              </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                        {itemD?.status === 'CONFIRMED' && (
                                          <Row className="mb-1 position-absolute z-index-1000" style={{ right: '4rem', top: '3.5rem' }}>
                                            <Button
                                              variant="body"
                                              onClick={() => setQcOperation(itemD.id, itemD)}
                                              className="btn-icon btn-icon-only cursor-pointer"
                                              // style={{ backgroundColor: '#e6946a' }}
                                            >
                                              <CsLineIcons icon="check-square" />
                                            </Button>
                                          </Row>
                                        )}
                                      </Card>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          ))}
                        </Row>
                      </Card>
                    </>
                  );
                })}
              </>
            ) : (
              // <InformationForm id={id} departmentOptions={departmentOptions} positionOptions={positionOptions} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spinner animation="border" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </Tab>
          <Tab
            eventKey="pending"
            title="ดำเนินการแล้ว"
            // className={clx('react-table page-print z-index-1000', {
            //   'overlay-spinner z-index-1000': props?.isFetching,
            // })}
          >
            {!props?.isFetching ? (
              <>
                {page.map((production, index) => {
                  prepareRow(production);
                  const {
                    original: { productSubType, producedSize },
                  } = production;
                  return (
                    <>
                      <Row>
                        <Badge bg="info" style={{ display: 'flex', justifyContent: 'flex-start' }} className="h6 badge-lg">
                          {index + 1} {'.'} {producedSize}
                        </Badge>
                      </Row>
                      <Card key={`card.${index}`} className="mb-3" style={{ fontSize: '1.2rem' }}>
                        <Row>
                          {productSubType.map((itemType, indexType) => (
                            <div key={indexType}>
                              {itemType.planDate.map((itemDate, indexDate) => (
                                <div key={indexDate}>
                                  {itemDate?.itemList.map((itemD, indexD) => {
                                    const step = planOptionsList?.find((item) => item?.value === itemD?.step);
                                    return (
                                      <Card
                                        className=" rounded-5 p-0 cursor-pointer position-relative card-operation mb-2"
                                        key={indexD}
                                        style={{
                                          // ทำสี backdrond ของ card ให้สลับกัน
                                          ...(index % 2 === 0 ? { background: '#f9f9f9' } : {}),
                                          // ...(itemD?.previousStepStatus === 'NEW' || ? { background: '#cacaca' } : {}),
                                        }}
                                      >
                                        <Row onClick={() => onSetShowModal(itemD.id, itemD)}>
                                          <Col lg="3" md="0" xs="0" className="wrap-img">
                                            <img
                                              className="image-operationStep"
                                              src={`/img/operation/step${step?.value?.toString().length !== 3 ? step?.value : 'QC'}.webp` || ''}
                                              alt={step?.label || `img-${step?.value}`}
                                            />
                                          </Col>
                                          <Col lg="9" md="12" xs="12" className="p-3">
                                            <Row className="">
                                              <Col lg="7" md="12" xs="12" className="mb-2">
                                                <Form.Label className="text-medium text-uppercase mb-0">
                                                  {f({ id: 'dailyPlan.field.name' })} ({itemD.status})
                                                </Form.Label>
                                                <div> {itemD.productName}</div>
                                              </Col>
                                              <Col lg="3" md="12" xs="12" className="mb-2">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
                                                <div>{itemD?.customer?.length > 0 && itemD?.customer[0]?.customerName}</div>
                                              </Col>
                                              <Col lg="2" md="12" xs="12" className="mb-2">
                                                <Form.Label className="text-medium text-uppercase mb-0">
                                                  {f({ id: 'dailyPlan.field.cutting_status' })}
                                                </Form.Label>
                                                <div>
                                                  {`${
                                                    (itemD?.productionCuttingStatus === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                                                    (itemD?.productionCuttingStatus === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                                                    (itemD?.productionCuttingStatus === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                                                    (itemD?.productionCuttingStatus === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
                                                  } `}
                                                </div>
                                              </Col>
                                              <Col lg="3" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.number' })}</Form.Label>
                                                <div>{itemD.materialUsedAmount}</div>
                                              </Col>

                                              <Col lg="4" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                                                <div>{itemD.productionOrderNo}</div>
                                              </Col>
                                              <Col lg="3" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'operator.field.machin' })}</Form.Label>
                                                <div>{itemD.machineName}</div>
                                              </Col>
                                              <Col lg="2" md="6" xs="6">
                                                <Form.Label className="text-medium text-uppercase mb-0">{f({ id: 'dailyPlan.field.planDate' })}</Form.Label>
                                                <div>{moment(itemD.planDate).add(543, 'year').format('DD/MM/YYYY')}</div>
                                              </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                        {itemD?.status === 'CONFIRMED' && (
                                          <Row className="mb-1 position-absolute z-index-1000" style={{ right: '4rem', top: '3.5rem' }}>
                                            <Button
                                              variant="body"
                                              onClick={() => setQcOperation(itemD.id, itemD)}
                                              className="btn-icon btn-icon-only cursor-pointer"
                                              // style={{ backgroundColor: '#e6946a' }}
                                            >
                                              <CsLineIcons icon="check-square" />
                                            </Button>
                                          </Row>
                                        )}
                                      </Card>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          ))}
                        </Row>
                      </Card>
                    </>
                  );
                })}
              </>
            ) : (
              // <InformationForm id={id} departmentOptions={departmentOptions} positionOptions={positionOptions} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spinner animation="border" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </Tab>
        </Tabs>
      </Card>
    </>
  );
};
export default CardContainer;
