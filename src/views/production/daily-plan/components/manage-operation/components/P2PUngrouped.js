/* eslint-disable array-callback-return */
/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-curly-brace-presence */
import React, { useCallback, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useIntl } from 'react-intl';
import { Row, Col, Button, OverlayTrigger, Tooltip, Card, Badge, Form, ToggleButton, Modal, Accordion, Table } from 'react-bootstrap';

import { SERVICE_URL } from 'config';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import axios from 'axios';
import moment from 'moment';
import useFormat from 'hooks/useFormat';
import useClone from 'hooks/useClone';
import useSort from 'hooks/useSort';
import Select from 'react-select';
import { useIsMobile } from 'hooks/useIsMobile';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import clx from 'classnames';
import InputIcon from 'react-multi-date-picker/components/input_icon';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYearConfirmButton';
import MoveHandle from './moveHandle';
import { detailFilter, detailSorter } from './comparators';
import './P2PGrouped.style.scss';
import FilterForm from './FilterForm';

const P2PUngrouped = ({
  loading,
  columns,
  useSorting,
  renderColumns,
  list = [],
  setList,
  onProduceClick,
  onDragOnEnd,
  machineOptions,
  onChangeDate,
  tableInstance,
  toolingOptions,
  isLoading,
}) => {
  const { formatMessage: f } = useIntl();
  const { formatNumber: n } = useFormat();
  const { cloneJson } = useClone();
  const { sort, sortColumn, sortDirection } = useSort();
  const [filter, setFilter] = useState('');
  const [selectItem, setSelectItem] = useState([]);
  const [showFilter, toggleFilter] = useState(false);
  const [isOpenMethodModal, setIsOpenMethodModal] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [rememberCondition, setRememberCondition] = useState({ value: 'B', label: 'B' });
  const isMobile = useIsMobile();
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();
  const { gotoPage, setFilter: setFilterSort } = tableInstance;
  const onSetFilter = (dataResult) => {
    const result = dataResult.map((item) => item.value).join(',');
    setFilterSort({ sortMultiCondition: result, page: 0 });
    gotoPage(0);
  };

  const displayFilter = useCallback((_filter, item) => {
    if (!_filter) {
      return true;
    }

    return detailFilter(_filter, ['saleOrderNo', 'productCode', 'productName'])(item);
  }, []);

  const handleSelectItem = (item, e) => {
    if (e.target.checked) {
      setSelectItem((prev) => {
        return [...prev, { id: item?.id, index: item?.index, planDate: moment(item?.planDate).format('YYYY-MM-DD') }];
      });
    } else {
      setSelectItem((prev) => {
        return prev.filter((data) => data.id !== item.id);
      });
    }
  };

  const handleChangeDatePlan = (e, item) => {
    const date = moment(e).format('YYYY-MM-DD');
    console.log('ok', date);
    console.log('item', item);

    try {
      console.log();
      axios
        .post(
          `${SERVICE_URL}/productionPlan/${item?.id}/edit`,
          { planDate: date },
          {
            headers: {
              'content-type': 'application/json',
            },
          }
        )
        .then((res) => {
          console.log(res);
          onChangeDate();
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeTransfer = (value) => {
    console.log(value);
    // const date = moment(e).format('YYYY-MM-DD');
    // console.log('ok', date);
    // console.log('item', item);

    // try {
    //   console.log();
    //   axios
    //     .post(
    //       `${SERVICE_URL}/productionPlan/${item?.id}/edit`,
    //       { planDate: date },
    //       {
    //         headers: {
    //           'content-type': 'application/json',
    //         },
    //       }
    //     )
    //     .then((res) => {
    //       console.log(res);
    //       onChangeDate();
    //     });
    // } catch (err) {
    //   console.log(err);
    // }
  };

  const handleChangeDatePlanMulti = (e, item) => {
    const date = moment(e).format('YYYY-MM-DD');
    console.log('ok', date);
    console.log('item', item);

    selectItem.forEach((data) => {
      data.planDate = date;
    });

    console.log(selectItem);
    try {
      axios
        .post(
          `${SERVICE_URL}/productionPlan/changePlanDate`,
          { planList: selectItem },
          {
            headers: {
              'content-type': 'application/json',
            },
          }
        )
        .then((res) => {
          console.log(res);
          onChangeDate();
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeFilter = (condition) => {
    setRememberCondition(condition);
    setDataList(list);
    if (condition?.value === 'A') {
      setDataList(list);
    }
    if (condition?.value === 'B') {
      const filteredData = list
        .map((machine) => ({
          ...machine,
          planDate: machine?.planDate
            .map((plan) => ({
              ...plan,
              itemList: plan.itemList.filter((item) => item.status !== 'NEW' && item.previousStepStatus === 'COMPLETED'),
            }))
            .filter((plan) => plan?.itemList?.length > 0),
        }))
        .filter((machine) => machine?.planDate?.length > 0);
      console.log(filteredData);
      setDataList(filteredData);
    }
    if (condition?.value === 'C') {
      const filteredData = list
        .map((machine) => ({
          ...machine,
          planDate: machine?.planDate
            .map((plan) => ({
              ...plan,
              itemList: plan.itemList.filter((item) => item.status === 'NEW' && (item.previousStepStatus === 'COMPLETED' || item.previousStepStatus === null)),
            }))
            .filter((plan) => plan?.itemList?.length > 0),
        }))
        .filter((machine) => machine?.planDate?.length > 0);
      console.log(filteredData);
      setDataList(filteredData);
    }
    if (condition?.value === 'D') {
      const filteredData = list
        .map((machine) => ({
          ...machine,
          planDate: machine?.planDate
            .map((plan) => ({
              ...plan,
              itemList: plan.itemList.filter((item) => item.status === 'NEW' && item.previousStepStatus === 'NEW'),
            }))
            .filter((plan) => plan?.itemList?.length > 0),
        }))
        .filter((machine) => machine?.planDate?.length > 0);
      console.log(filteredData);
      setDataList(filteredData);
    }
  };

  const handleCloseModalClick = () => {
    setIsOpenMethodModal(false);
  };

  useEffect(() => {
    setSelectItem([]);
    setDataList([]);
    if (list.length > 0) {
      const condition = rememberCondition;
      handleChangeFilter(condition);
    }
  }, [list]);

  return (
    <Card
      className={clx('mb-3 pt-0 ps-3 pb-0', {
        'overlay-spinner': isLoading,
      })}
    >
      <Accordion flush defaultActiveKey="1">
        <Accordion.Item eventKey="1">
          <Accordion.Header as="div" className="pb-0">
            <h2 className="font-weight-bold pb-0">{f({ id: 'dailyPlan.ungroup' })}</h2>
          </Accordion.Header>
          <Accordion.Body className="ps-2">
            <Row className="w-100">
              {/* <Col lg="2" md="12" xs="5">
          <div className="d-inline-block float-md-start w-auto me-1 mb-1 search-input-container w-20 shadow bg-foreground border">
            <input type="text" className="form-control " placeholder={f({ id: 'common.search' })} value={filter} onChange={handleFilterChange} />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
          </div>
        </Col>
        <Col lg="2" md="12" xs="5">
          <Select
            classNamePrefix="react-select"
            // placeholder="select by type"
            options={[
              { value: 'machineName', label: f({ id: 'dailyPlan.field.machin' }) },
              { value: 'productName', label: f({ id: 'dailyPlan.field.product' }) },
              { value: 'productionOrderNo', label: f({ id: 'dailyPlan.field.lot' }) },
              { value: 'planDate', label: f({ id: 'dailyPlan.field.planDate' }) },
              { value: 'customer', label: f({ id: 'dailyPlan.field.customer' }) },
            ]}
            // value={values?.productionOrderNo || ''}
            required
          />
        </Col> */}
              <Col lg="2" md="12" xs="4">
                <Select
                  classNamePrefix="react-select"
                  placeholder="Condition..."
                  options={[
                    { value: 'A', label: 'A' },
                    { value: 'B', label: 'B' },
                    { value: 'C', label: 'C' },
                    { value: 'D', label: 'D' },
                  ]}
                  isClearable
                  value={rememberCondition || ''}
                  onChange={handleChangeFilter}
                  required
                />
              </Col>
              <Col lg="3" md="12" xs="6">
                <Select
                  className="multiFilter"
                  classNamePrefix="react-select"
                  placeholder="select sorting..."
                  onChange={onSetFilter}
                  isMulti
                  isClearable
                  options={[
                    { label: 'ชื่อสินค้า', value: 'productName' },
                    { label: 'รหัสการผลิต', value: 'productionOrderNo' },
                    { label: 'จำนวนผลิต', value: 'producedAmount' },
                    { label: 'สถานะการตัด', value: 'cuttingStatus' },
                    { label: 'สถานะปัจจุบัน', value: 'status' },
                    { label: 'กำหนดส่ง', value: 'CODeliverDt' },
                    { label: 'step', value: 'step' },
                    { label: 'Printing Color', value: 'productPrintColor' },
                    { label: 'วันที่สร้าง', value: 'planDate' },
                  ]}
                />
              </Col>
              <Col lg="7" md="12" xs="2">
                <Card className="float-end">
                  <ToggleButton
                    id="filterToggle"
                    type="checkbox"
                    variant="foreground"
                    className="btn-icon btn-icon-only shadow"
                    checked={showFilter}
                    onClick={() => toggleFilter(!showFilter)}
                  >
                    <CsLineIcons icon="filter" />
                  </ToggleButton>
                </Card>
              </Col>
            </Row>
            <FilterForm show={showFilter} toggleFilter={!showFilter} tableInstance={tableInstance} />

            <div
              className={clx('react-table page-print mb-3', {
                'overlay-spinner': loading,
              })}
            >
              <OverlayScrollbarsComponent
                options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                style={{ maxHeight: '580px', borderRadius: '10px' }}
              >
                <>
                  {dataList?.map((itemSize, index) => {
                    return (
                      <div key={`plan-${index}`} className="group-item">
                        {itemSize.planDate.map((dataDate, indexDate) => (
                          <div key={indexDate}>
                            <div className="d-flex justify-content-start gap-2 mt-2">
                              {itemSize.machineName ? (
                                <Badge
                                  bg="info"
                                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                  className="h6 badge-lg"
                                >
                                  {itemSize.machineName === '-' ? f({ id: 'dailyPlan.field.noMachine' }) : itemSize.machineName}
                                </Badge>
                              ) : (
                                <Badge
                                  bg="info"
                                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                  className="h6 badge-lg"
                                >
                                  {f({ id: 'dailyPlan.field.noMachine' })}
                                </Badge>
                              )}
                              {dataDate?.planDate !== '1957-01-01T00:00:00.000Z' && (
                                <Badge
                                  bg="info"
                                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                  className="h6 badge-lg"
                                >
                                  {/* <DatepickerThaiYear disabled inputClass="custom-input-group" value={itemSize?.planDate} /> */}
                                  {moment(dataDate?.planDate).add(543, 'year').format('DD/MM/YYYY')}
                                </Badge>
                              )}
                              {/* <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'dailyPlan.field.scheduleDate' })}</Tooltip>}> */}
                              <DatepickerThaiYear
                                render={(value, openCalendar) => {
                                  return (
                                    <Button
                                      disabled={selectItem.length === 0}
                                      variant="info"
                                      size="sm"
                                      className="btn-icon"
                                      onClick={openCalendar}
                                      style={{ height: '25px', padding: '0px 12px' }}
                                    >
                                      <CsLineIcons icon="calendar" /> {f({ id: 'dailyPlan.field.scheduleDate' })}
                                    </Button>
                                  );
                                }}
                                disabled={selectItem.length === 0}
                                onChange={(e) => handleChangeDatePlanMulti(e, {})}
                                value={new Date()}
                              />
                              {/* </OverlayTrigger> */}
                              {moment(itemSize?.planDate).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD') && (
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'dailyPlan.field.transfer' })}</Tooltip>}>
                                  <Button variant="outline-info" size="sm" className="btn-icon" onClick={() => handleChangeTransfer(itemSize)}>
                                    <CsLineIcons icon="destination" /> {f({ id: 'dailyPlan.field.transfer' })}
                                  </Button>
                                </OverlayTrigger>
                              )}
                            </div>
                            <>
                              {isMobile ? (
                                <OverlayScrollbarsComponent
                                  options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'scroll', y: 'hidden' } }}
                                  style={{ maxWidth: '1000px', borderRadius: '10px' }}
                                >
                                  <div className=" d-flex flex-row justify-content-start align-items-center">
                                    <div className="card-style" style={{ width: '400px' }}>
                                      <div className="w-100 d-flex justify-content-start align-items-center">
                                        <div style={{ minWidth: '20px' }} className="d-flex flex-column justify-content-center align-items-center">
                                          {' '}
                                        </div>
                                        <div style={{ minWidth: '80px' }} className="d-flex flex-column justify-content-center align-items-end">
                                          <div>{f({ id: 'dailyPlan.field.name' })}</div>
                                        </div>
                                        <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-center">
                                          <div>{f({ id: 'dailyPlan.field.lot' })}</div>
                                        </div>
                                        <div style={{ minWidth: '100px' }} className="d-flex flex-column justify-content-center align-items-center">
                                          <div>{f({ id: 'dailyPlan.field.cuttingSheet' })}</div>
                                        </div>
                                        <div style={{ minWidth: '50px' }} className="d-flex flex-column justify-content-center align-items-center">
                                          <div>{f({ id: 'dailyPlan.field.cavity' })}</div>
                                        </div>
                                      </div>
                                      {dataDate?.itemList?.map((items, indexI) => {
                                        const getLastTwoDigits = (number) => {
                                          return number % 100;
                                        };
                                        let hex = '';
                                        if (items?.producedProductSize) {
                                          const splitSubType = items?.producedProductSize?.split('Subtype')[0];
                                          const splitValue = splitSubType?.split('x');
                                          const r = Number(splitValue[0].trim(' '));
                                          const g = Number(splitValue[1].trim(' '));
                                          const b = Number(splitValue[2].trim(' '));

                                          const redRange = [180, 255];
                                          const greenRange = [180, 255];
                                          const blueRange = [180, 255];

                                          const length = r;
                                          const width = g;
                                          const height = b;

                                          const red =
                                            Math.floor((length / 100 > 1 ? getLastTwoDigits(length) / 100 : length / 100) * (redRange[1] - redRange[0] + 1)) +
                                            redRange[0];
                                          const green =
                                            Math.floor((width / 100 > 1 ? getLastTwoDigits(width) / 100 : width / 100) * (greenRange[1] - greenRange[0] + 1)) +
                                            greenRange[0];
                                          const blue =
                                            Math.floor((height / 100 > 1 ? getLastTwoDigits(height) / 100 : height / 100) * (blueRange[1] - blueRange[0] + 1)) +
                                            blueRange[0];

                                          hex = `#${(red * 65536 + green * 256 + blue).toString(16).padStart(6, '0')}`;
                                        }
                                        return (
                                          <Card
                                            key={`planItem-${indexI}`}
                                            id={items.saleOrderDetailId}
                                            className={clx('sh-4 pt-0 pb-0 d-flex h-100 card-style mb-1 justify-content-center align-items-center', {
                                              'dp-n': !displayFilter(filter, items),
                                            })}
                                            style={{ width: '500px', background: hex }}
                                            data-product-name={items.productName}
                                          >
                                            <div className="w-100 d-flex justify-content-start align-items-center">
                                              <div style={{ minWidth: '20px' }} className="d-flex flex-column justify-content-center align-items-center">
                                                <Form.Check className="form-check  m-1 min-h-0" type="checkbox" onClick={(e) => handleSelectItem(items, e)} />
                                              </div>
                                              <div style={{ minWidth: '80px' }} className="d-flex flex-column justify-content-center align-items-center">
                                                <div className="ps-2">{items.productAbbr}</div>
                                              </div>
                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-center">
                                                <div>{items.productionOrderNo}</div>
                                              </div>
                                              <div style={{ minWidth: '100px' }} className="d-flex flex-column justify-content-center align-items-center">
                                                <div>{items.productionPrintedAmount.toFixed(2)}</div>
                                              </div>
                                              <div style={{ minWidth: '50px' }} className="d-flex flex-column justify-content-center align-items-center">
                                                <div>{items.productCavity}</div>
                                              </div>
                                            </div>
                                          </Card>
                                        );
                                      })}
                                      {/* </OverlayScrollbarsComponent> */}
                                    </div>
                                    <div className="card-style" style={{ width: '60%' }}>
                                      <OverlayScrollbarsComponent
                                        options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'scroll', y: 'hidden' } }}
                                        style={{ maxWidth: '100%', borderRadius: '10px' }}
                                      >
                                        <>
                                          <div className="d-flex">
                                            <div style={{ minWidth: '220px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div className="ps-4">{f({ id: 'dailyPlan.field.stepL' })}</div>
                                            </div>
                                            <div style={{ minWidth: '240px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div className="ps-4">{f({ id: 'dailyPlan.field.currentStep' })}</div>
                                            </div>
                                            <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div className="ps-3">{f({ id: 'dailyPlan.field.cuttingSize' })}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{f({ id: 'dailyPlan.field.paper_status' })}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{f({ id: 'dailyPlan.field.tooling' })}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{f({ id: 'dailyPlan.field.standard' })}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{f({ id: 'dailyPlan.field.print_fotmat' })}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{f({ id: 'dailyPlan.field.coating_format' })}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div className="ps-3">{f({ id: 'dailyPlan.field.customer' })}</div>
                                            </div>
                                            <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div className="ps-5">{f({ id: 'dailyPlan.field.planDate' })}</div>
                                            </div>
                                          </div>
                                        </>
                                        {dataDate?.itemList?.map((items, indexI) => {
                                          const getLastTwoDigits = (number) => {
                                            return number % 100;
                                          };
                                          let hex = '';
                                          if (items?.producedProductSize) {
                                            const splitSubType = items?.producedProductSize?.split('Subtype')[0];
                                            const splitValue = splitSubType?.split('x');
                                            const r = Number(splitValue[0].trim(' '));
                                            const g = Number(splitValue[1].trim(' '));
                                            const b = Number(splitValue[2].trim(' '));

                                            const redRange = [180, 255];
                                            const greenRange = [180, 255];
                                            const blueRange = [180, 255];

                                            const length = r;
                                            const width = g;
                                            const height = b;

                                            const red =
                                              Math.floor((length / 100 > 1 ? getLastTwoDigits(length) / 100 : length / 100) * (redRange[1] - redRange[0] + 1)) +
                                              redRange[0];
                                            const green =
                                              Math.floor(
                                                (width / 100 > 1 ? getLastTwoDigits(width) / 100 : width / 100) * (greenRange[1] - greenRange[0] + 1)
                                              ) + greenRange[0];
                                            const blue =
                                              Math.floor(
                                                (height / 100 > 1 ? getLastTwoDigits(height) / 100 : height / 100) * (blueRange[1] - blueRange[0] + 1)
                                              ) + blueRange[0];

                                            hex = `#${(red * 65536 + green * 256 + blue).toString(16).padStart(6, '0')}`;
                                          }

                                          let sum = toolingOptions?.filter((to) => items?.tooling?.some((ti) => to.value === ti));
                                          let InactiveTooling = false;
                                          sum?.forEach((data) => {
                                            if (!data?.detail?.status) {
                                              InactiveTooling = true;
                                            }
                                          });

                                          let filterToolingType = '';
                                          if (items?.step?.value === 11 || items?.step?.value === 12) {
                                            filterToolingType = sum.filter((data) => data.detail?.type === '01');
                                          }

                                          if (
                                            items?.step?.value === 13 ||
                                            items?.step?.value === 14 ||
                                            items?.step?.value === 15 ||
                                            items?.step?.value === 28 ||
                                            items?.step?.value === 29
                                          ) {
                                            filterToolingType = sum.filter((data) => data.detail?.type === '04');
                                          }
                                          if (
                                            items?.step?.value === 17 ||
                                            items?.step?.value === 18 ||
                                            items?.step?.value === 19 ||
                                            items?.step?.value === 20
                                          ) {
                                            filterToolingType = sum.filter((data) => data.detail?.type === '02');
                                          }
                                          sum = filterToolingType;
                                          const machineStandardList = items?.productMachineStandardList.filter((data) => data.machineId === items?.machineId);
                                          const machineOptionFilter = machineStandardList?.map((data) => {
                                            return { ...data, data: machineOptions.find((fil) => fil.value === data.machineId) };
                                          });
                                          let isCDTypeMachine = false;
                                          machineOptionFilter?.forEach((data) => {
                                            if (data?.data?.detail?.subType === 'CD') {
                                              isCDTypeMachine = true;
                                            }
                                          });
                                          return (
                                            <Card
                                              key={`planItem-${indexI}`}
                                              id={items?.saleOrderDetailId || ''}
                                              style={{ width: '1720px', background: hex }}
                                              className={clx('sh-4 d-flex flex-row pt-0 pb-0 mb-1 h-100 justify-content-start align-items-center', {
                                                'dp-n': !displayFilter(filter, items),
                                              })}
                                              data-product-name={items?.productName || ''}
                                            >
                                              <div style={{ minWidth: '240px' }} className="d-flex flex-column justify-content-center align-items-start ps-2">
                                                <div>
                                                  {`${items?.step?.label}` || ''}
                                                  <span style={{ fontStyle: 'normal', color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px' }}>
                                                    {' '}
                                                    {` ( ${items.status} )`}
                                                  </span>
                                                </div>
                                              </div>
                                              <div style={{ minWidth: '240px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                <div>
                                                  {`${items?.currentStep?.stepName?.label}` || ''}
                                                  <span style={{ fontStyle: 'normal', color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px' }}>
                                                    {` ( ${items?.currentStep?.status} )`}
                                                  </span>
                                                </div>
                                              </div>
                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                <div>{`${items?.productCuttingSize.width} x ${items?.productCuttingSize.length}`}</div>
                                              </div>

                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                <div>
                                                  {`${
                                                    (items?.productionCuttingStatus === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                                                    (items?.productionCuttingStatus === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                                                    (items?.productionCuttingStatus === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                                                    (items?.productionCuttingStatus === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
                                                  } `}
                                                </div>
                                              </div>
                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                {sum.length > 0 && (
                                                  <Button
                                                    onClick={() => setIsOpenMethodModal({ type: 'dailyPlan.field.tooling', list: sum })}
                                                    variant={`${InactiveTooling ? 'danger' : 'dark'}`}
                                                    size="sm"
                                                    className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                  >
                                                    <span>see more ({sum.length})</span>
                                                  </Button>
                                                )}
                                              </div>

                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                {machineStandardList.length > 0 && (
                                                  <Button
                                                    onClick={() => setIsOpenMethodModal({ type: 'dailyPlan.field.standard', list: machineStandardList })}
                                                    variant="dark"
                                                    size="sm"
                                                    className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                  >
                                                    <span>see more ({machineStandardList.length})</span>
                                                  </Button>
                                                )}
                                              </div>
                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                {(items?.step?.value === 11 || items?.step?.value === 12 || isCDTypeMachine) && (
                                                  <Button
                                                    onClick={() =>
                                                      setIsOpenMethodModal(
                                                        items?.step?.value === 11
                                                          ? { type: 'dailyPlan.field.print_fotmat', list: items.productPrintColor }
                                                          : { type: 'dailyPlan.field.print_fotmat', list: items.productPrintColorBack }
                                                      )
                                                    }
                                                    variant="dark"
                                                    size="sm"
                                                    className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                  >
                                                    <span>see more ({items.productPrintColor.length})</span>
                                                  </Button>
                                                )}
                                              </div>
                                              <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                {(items?.step?.value === 13 ||
                                                  items?.step?.value === 14 ||
                                                  items?.step?.value === 15 ||
                                                  items?.step?.value === 28 ||
                                                  items?.step?.value === 29 ||
                                                  isCDTypeMachine) && (
                                                  <Button
                                                    onClick={() =>
                                                      setIsOpenMethodModal({ type: 'dailyPlan.field.coating_format', list: items.productCoatingMethod })
                                                    }
                                                    variant="dark"
                                                    size="sm"
                                                    className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                  >
                                                    <span>see more ({items.productCoatingMethod.length})</span>
                                                  </Button>
                                                )}
                                              </div>
                                              <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                <div>{items?.customer[0]?.customerAbbr || ''}</div>
                                              </div>
                                              <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                                <DatepickerThaiYear
                                                  inputClass="custom-input text-center"
                                                  value={items?.planDate === '1957-01-01T00:00:00.000Z' ? ' ' : items?.planDate || ''}
                                                  onChange={(e) => handleChangeDatePlan(e, items)}
                                                />
                                              </div>
                                            </Card>
                                          );
                                        })}
                                      </OverlayScrollbarsComponent>
                                    </div>
                                  </div>
                                </OverlayScrollbarsComponent>
                              ) : (
                                <div className="w-100 d-flex flex-row justify-content-start align-items-center">
                                  <div className="card-style" style={{ minWidth: '400px' }}>
                                    <div className="w-100 d-flex justify-content-start align-items-center">
                                      <div style={{ minWidth: '20px' }} className="d-flex flex-column justify-content-center align-items-center">
                                        {' '}
                                      </div>
                                      <div style={{ minWidth: '80px' }} className="d-flex flex-column justify-content-center align-items-end">
                                        <div>{f({ id: 'dailyPlan.field.name' })}</div>
                                      </div>
                                      <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-center">
                                        <div>{f({ id: 'dailyPlan.field.lot' })}</div>
                                      </div>
                                      <div style={{ minWidth: '100px' }} className="d-flex flex-column justify-content-center align-items-center">
                                        <div>{f({ id: 'dailyPlan.field.cuttingSheet' })}</div>
                                      </div>
                                      <div style={{ minWidth: '50px' }} className="d-flex flex-column justify-content-center align-items-center">
                                        <div>{f({ id: 'dailyPlan.field.cavity' })}</div>
                                      </div>
                                    </div>
                                    {dataDate?.itemList?.map((items, indexI) => {
                                      const getLastTwoDigits = (number) => {
                                        return number % 100;
                                      };
                                      let hex = '';
                                      if (items?.producedProductSize) {
                                        const splitSubType = items?.producedProductSize?.split('Subtype')[0];
                                        const splitValue = splitSubType?.split('x');
                                        const r = Number(splitValue[0].trim(' '));
                                        const g = Number(splitValue[1].trim(' '));
                                        const b = Number(splitValue[2].trim(' '));

                                        const redRange = [180, 255];
                                        const greenRange = [180, 255];
                                        const blueRange = [180, 255];

                                        const length = r;
                                        const width = g;
                                        const height = b;

                                        const red =
                                          Math.floor((length / 100 > 1 ? getLastTwoDigits(length) / 100 : length / 100) * (redRange[1] - redRange[0] + 1)) +
                                          redRange[0];
                                        const green =
                                          Math.floor((width / 100 > 1 ? getLastTwoDigits(width) / 100 : width / 100) * (greenRange[1] - greenRange[0] + 1)) +
                                          greenRange[0];
                                        const blue =
                                          Math.floor((height / 100 > 1 ? getLastTwoDigits(height) / 100 : height / 100) * (blueRange[1] - blueRange[0] + 1)) +
                                          blueRange[0];

                                        hex = `#${(red * 65536 + green * 256 + blue).toString(16).padStart(6, '0')}`;
                                      }
                                      return (
                                        <Card
                                          key={`planItem-${indexI}`}
                                          id={items.saleOrderDetailId}
                                          className={clx('sh-4 pt-0 pb-0 d-flex h-100 card-style mb-1 justify-content-center align-items-center', {
                                            'dp-n': !displayFilter(filter, items),
                                          })}
                                          style={{ width: '500px', background: hex }}
                                          data-product-name={items.productName}
                                        >
                                          <div className="w-100 d-flex justify-content-start align-items-center">
                                            <div style={{ minWidth: '20px' }} className="d-flex flex-column justify-content-center align-items-center">
                                              <Form.Check className="form-check  m-1 min-h-0" type="checkbox" onClick={(e) => handleSelectItem(items, e)} />
                                            </div>
                                            <div style={{ minWidth: '80px' }} className="d-flex flex-column justify-content-center align-items-center">
                                              <div className="ps-2">{items.productAbbr}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-center">
                                              <div>{items.productionOrderNo}</div>
                                            </div>
                                            <div style={{ minWidth: '100px' }} className="d-flex flex-column justify-content-center align-items-center">
                                              <div>{items.productionPrintedAmount.toFixed(2)}</div>
                                            </div>
                                            <div style={{ minWidth: '50px' }} className="d-flex flex-column justify-content-center align-items-center">
                                              <div>{items.productCavity}</div>
                                            </div>
                                            {/* <div style={{ minWidth: '280px' }} className="d-flex flex-column justify-content-center align-items-start">
                                        <div>
                                          {`${items?.currentStep?.step?.label}` || ''}
                                          <span style={{ fontStyle: 'normal', color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px' }}>
                                            {` ( ${items?.currentStep?.status} )`}
                                          </span>
                                        </div>
                                      </div> */}
                                          </div>
                                        </Card>
                                      );
                                    })}
                                    {/* </OverlayScrollbarsComponent> */}
                                  </div>
                                  <div className="card-style" style={{ width: '70%' }}>
                                    <OverlayScrollbarsComponent
                                      options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'scroll', y: 'hidden' } }}
                                      style={{ maxWidth: '100%', borderRadius: '10px' }}
                                    >
                                      <div className="d-flex">
                                        <div style={{ minWidth: '250px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div className="ps-4">{f({ id: 'dailyPlan.field.stepL' })}</div>
                                        </div>
                                        <div style={{ minWidth: '240px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div className="ps-4">{f({ id: 'dailyPlan.field.currentStep' })}</div>
                                        </div>
                                        <div style={{ minWidth: '160px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div className="ps-3">{f({ id: 'dailyPlan.field.cuttingSize' })}</div>
                                        </div>
                                        <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div>{f({ id: 'dailyPlan.field.paper_status' })}</div>
                                        </div>
                                        <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div>{f({ id: 'dailyPlan.field.tooling' })}</div>
                                        </div>
                                        <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div>{f({ id: 'dailyPlan.field.standard' })}</div>
                                        </div>
                                        <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div>{f({ id: 'dailyPlan.field.print_fotmat' })}</div>
                                        </div>
                                        <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div>{f({ id: 'dailyPlan.field.coating_format' })}</div>
                                        </div>
                                        <div style={{ minWidth: '100px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div className="ps-3">{f({ id: 'dailyPlan.field.customer' })}</div>
                                        </div>
                                        <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                          <div className="ps-5">{f({ id: 'dailyPlan.field.planDate' })}</div>
                                        </div>
                                      </div>
                                      {dataDate?.itemList?.map((items, indexI) => {
                                        const getLastTwoDigits = (number) => {
                                          return number % 100;
                                        };
                                        let hex = '';
                                        if (items?.producedProductSize) {
                                          const splitSubType = items?.producedProductSize?.split('Subtype')[0];
                                          const splitValue = splitSubType?.split('x');
                                          const r = Number(splitValue[0].trim(' '));
                                          const g = Number(splitValue[1].trim(' '));
                                          const b = Number(splitValue[2].trim(' '));

                                          const redRange = [180, 255];
                                          const greenRange = [180, 255];
                                          const blueRange = [180, 255];

                                          const length = r;
                                          const width = g;
                                          const height = b;

                                          const red =
                                            Math.floor((length / 100 > 1 ? getLastTwoDigits(length) / 100 : length / 100) * (redRange[1] - redRange[0] + 1)) +
                                            redRange[0];
                                          const green =
                                            Math.floor((width / 100 > 1 ? getLastTwoDigits(width) / 100 : width / 100) * (greenRange[1] - greenRange[0] + 1)) +
                                            greenRange[0];
                                          const blue =
                                            Math.floor((height / 100 > 1 ? getLastTwoDigits(height) / 100 : height / 100) * (blueRange[1] - blueRange[0] + 1)) +
                                            blueRange[0];

                                          hex = `#${(red * 65536 + green * 256 + blue).toString(16).padStart(6, '0')}`;
                                        }

                                        let sum = toolingOptions?.filter((to) => items?.tooling?.some((ti) => to.value === ti));
                                        let InactiveTooling = false;
                                        sum?.forEach((data) => {
                                          if (!data?.detail?.status) {
                                            InactiveTooling = true;
                                          }
                                        });

                                        let filterToolingType = '';
                                        if (items?.step?.value === 11 || items?.step?.value === 12) {
                                          filterToolingType = sum.filter((data) => data.detail.type === '01');
                                        }

                                        if (
                                          items?.step?.value === 13 ||
                                          items?.step?.value === 14 ||
                                          items?.step?.value === 15 ||
                                          items?.step?.value === 28 ||
                                          items?.step?.value === 29
                                        ) {
                                          filterToolingType = sum.filter((data) => data.detail.type === '04');
                                        }
                                        if (items?.step?.value === 17 || items?.step?.value === 18 || items?.step?.value === 19 || items?.step?.value === 20) {
                                          filterToolingType = sum.filter((data) => data.detail.type === '02');
                                        }
                                        sum = filterToolingType;

                                        const machineStandardList = items?.productMachineStandardList.filter((data) => data.machineId === items?.machineId);
                                        const machineOptionFilter = machineStandardList?.map((data) => {
                                          return { ...data, data: machineOptions.find((fil) => fil.value === data.machineId) };
                                        });
                                        let isCDTypeMachine = false;
                                        machineOptionFilter?.forEach((data) => {
                                          if (data?.data?.detail?.subType === 'CD') {
                                            isCDTypeMachine = true;
                                          }
                                        });
                                        return (
                                          <Card
                                            key={`planItem-${indexI}`}
                                            id={items?.saleOrderDetailId || ''}
                                            style={{ width: '1730px', background: hex }}
                                            className={clx('sh-4 d-flex flex-row pt-0 pb-0 mb-1 h-100 justify-content-start align-items-center', {
                                              'dp-n': !displayFilter(filter, items),
                                            })}
                                            data-product-name={items?.productName || ''}
                                          >
                                            <div style={{ minWidth: '250px' }} className="d-flex flex-column justify-content-center align-items-start ps-2">
                                              <div>
                                                {`${items?.step?.label}` || ''}
                                                <span style={{ fontStyle: 'normal', color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px' }}>
                                                  {' '}
                                                  {` ( ${items.status} )`}
                                                </span>
                                              </div>
                                            </div>
                                            <div style={{ minWidth: '250px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>
                                                {`${items?.currentStep?.stepName?.label}` || ''}
                                                <span style={{ fontStyle: 'normal', color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px' }}>
                                                  {` ( ${items?.currentStep?.status} )`}
                                                </span>
                                              </div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{`${items?.productCuttingSize.width} x ${items?.productCuttingSize.length}`}</div>
                                            </div>

                                            <div style={{ minWidth: '170px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>
                                                {`${
                                                  (items?.productionCuttingStatus === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                                                  (items?.productionCuttingStatus === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                                                  (items?.productionCuttingStatus === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                                                  (items?.productionCuttingStatus === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
                                                } `}
                                              </div>
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              {sum.length > 0 && (
                                                <Button
                                                  onClick={() => setIsOpenMethodModal({ type: 'dailyPlan.field.tooling', list: sum })}
                                                  variant={`${InactiveTooling ? 'danger' : 'dark'}`}
                                                  size="sm"
                                                  className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                >
                                                  <span>see more ({sum.length})</span>
                                                </Button>
                                              )}
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              {machineStandardList.length > 0 && (
                                                <Button
                                                  onClick={() => setIsOpenMethodModal({ type: 'dailyPlan.field.standard', list: machineStandardList })}
                                                  variant="dark"
                                                  size="sm"
                                                  className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                >
                                                  <span>see more ({machineStandardList.length})</span>
                                                </Button>
                                              )}
                                            </div>
                                            <div style={{ minWidth: '150px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              {(items?.step?.value === 11 || items?.step?.value === 12 || isCDTypeMachine) && (
                                                <Button
                                                  onClick={() =>
                                                    setIsOpenMethodModal(
                                                      items?.step?.value === 11
                                                        ? { type: 'dailyPlan.field.print_fotmat', list: items.productPrintColor }
                                                        : { type: 'dailyPlan.field.print_fotmat', list: items.productPrintColorBack }
                                                    )
                                                  }
                                                  variant="dark"
                                                  size="sm"
                                                  className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                >
                                                  <span>see more ({items.productPrintColor.length})</span>
                                                </Button>
                                              )}
                                            </div>
                                            <div style={{ minWidth: '180px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              {(items?.step?.value === 13 ||
                                                items?.step?.value === 14 ||
                                                items?.step?.value === 15 ||
                                                items?.step?.value === 28 ||
                                                items?.step?.value === 29 ||
                                                isCDTypeMachine) && (
                                                <Button
                                                  onClick={() =>
                                                    setIsOpenMethodModal({ type: 'dailyPlan.field.coating_format', list: items.productCoatingMethod })
                                                  }
                                                  variant="dark"
                                                  size="sm"
                                                  className="sh-3 p-2 ms-1 d-flex flex-column justify-content-center align-items-center"
                                                >
                                                  <span>see more ({items.productCoatingMethod.length})</span>
                                                </Button>
                                              )}
                                            </div>
                                            <div style={{ minWidth: '100px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <div>{items?.customer[0]?.customerAbbr || ''}</div>
                                            </div>
                                            <div style={{ minWidth: '200px' }} className="d-flex flex-column justify-content-center align-items-start">
                                              <DatepickerThaiYear
                                                inputClass="custom-input text-center"
                                                value={items?.planDate === '1957-01-01T00:00:00.000Z' ? ' ' : items?.planDate || ''}
                                                onChange={(e) => handleChangeDatePlan(e, items)}
                                              />
                                            </div>
                                          </Card>
                                        );
                                      })}
                                    </OverlayScrollbarsComponent>
                                  </div>
                                </div>
                              )}
                            </>

                            {/* </ReactSortable> */}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              </OverlayScrollbarsComponent>
              <Modal className="modal-right small fade" show={isOpenMethodModal} onHide={handleCloseModalClick}>
                <Modal.Header>
                  <Modal.Title>{f({ id: `${isOpenMethodModal?.type}` })}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-1">
                  <Table striped>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Title</th>
                        <th scope="col">Value</th>
                        {isOpenMethodModal?.list?.[0]?.detail && <th scope="col">Status</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {isOpenMethodModal?.list?.map((item, index) => (
                        <tr key={index}>
                          <th className={item?.detail !== undefined ? `text-${item?.detail?.status ? 'dark' : 'danger'}` : 'text-dark'} scope="row">
                            {index + 1}
                          </th>
                          <td className={item?.detail !== undefined ? `text-${item?.detail?.status ? 'dark' : 'danger'}` : 'text-dark'}>
                            {item?.text || item?.color || item?.name || item?.detail?.name}
                          </td>
                          <td className={item?.detail !== undefined ? `text-${item?.detail?.status ? 'dark' : 'danger'}` : 'text-dark'}>
                            {item?.detail?.statusType?.name || item?.value || item?.density}
                          </td>
                          {item?.detail && (
                            <td className={item?.detail !== undefined ? `text-${item?.detail?.status ? 'dark' : 'danger'}` : 'text-dark'}>
                              {item?.detail?.status ? 'ACTIVE' : 'INACTIVE'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Modal.Body>
                <Modal.Footer className="p-1">
                  <Button variant="outline-primary" onClick={handleCloseModalClick}>
                    {f({ id: 'common.cancel' })}
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Card>
  );
};

export default P2PUngrouped;
