/* eslint-disable no-self-compare */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import clx from 'classnames';
import { Badge, Card, Col, Row, Table } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { SERVICE_URL } from 'config';
import moment from 'moment';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import useFormat from 'hooks/useFormat';
import './style.css';

const CardPrintingMachineList = React.forwardRef(
  (
    {
      tableInstance,
      tableTab,
      loading,
      componentRef,
      filterPrint,
      toolingOptions,
      productList,
      patchingOptions,
      productTypeOptions,
      rowProps = () => ({}),
      isConfirmModal,
    },
    ref
  ) => {
    const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
    const { formatNumber: n } = useFormat();
    const { planOptions } = useProductPlanOptions();
    const planOptionsList = planOptions();
    const [dataGrouped, setDataGrouped] = useState([]);
    const [dataItemList, setDataItemList] = useState([]);
    const [dataStep, setStep] = useState();
    const { prepareRow } = tableInstance;

    const { sort, sortColumn, sortDirection } = useSort();
    const translate = useMemo(
      () => ({
        priority: f({ id: 'cutting.group.priority' }),
        priority1: f({ id: 'cutting.group.priority.1.desc' }),
        priority2: f({ id: 'cutting.group.priority.2.desc' }),
      }),
      [f]
    );
    const callStepList = async (id) => {
      const messageType = await request({ url: `${SERVICE_URL}/productionPlan/lov/messageType/list` });
      const defect = await request({ url: `${SERVICE_URL}/productionPlan/lov/defect/list` });
      var list = [];
      for (const element of messageType.data.data) {
        if (element.code === 'R') {
          for (const element1 of defect.data.data) {
            if (element.id === element1.mainLinkId) {
              var obj = {
                value: element1.id,
                label: element1.name,
              };
              list.push(obj);
            }
          }
        }
      }

      setStep(list);
    };

    // const handleOnSort = useCallback(
    //   (columnId) => (e) => {
    //     if (!useSorting) {
    //       return;
    //     }
    //     sort(columnId);
    //   },
    //   [sort, useSorting]
    // );
    let prevIndexCore = null;
    const setDataGroup = (value) => {
      const dataList = value;
      const dataGroup = dataList.flatMap((obj) => obj.machine);
      const newArrayDataGroup = dataGroup.map((itemArr) => {
        return { ...itemArr, planDate: itemArr?.planDate.filter((item) => item?.planDate !== '1957-01-01T00:00:00.000Z') };
      });
      setDataGrouped(newArrayDataGroup || []);
    };

    useEffect(() => {
      if (tableInstance.data.length > 0 && tableTab === 'fourt') {
        setDataGroup(tableInstance.data);
        callStepList();
      }
    }, [tableInstance.data, tableTab]);
    useEffect(() => {
      const lastResult = [];
      let temp = {};
      if (tableInstance.data.length > 0 && tableTab === 'fourt') {
        const dataList = dataGrouped?.filter((e) => {
          return filterPrint.machineCode === undefined || filterPrint.machineCode === '' ? true : filterPrint.machineCode === e.machineCode;
        });
        // let productGet = [];
        dataList.forEach((element) => {
          temp = element?.planDate?.filter((l) => {
            return filterPrint.productionOrderCreatedAt === '' || filterPrint.productionOrderCreatedAt === undefined
              ? true
              : filterPrint.productionOrderCreatedAt === moment(l.planDate).format('YYYY-MM-DD');
          });
          temp?.forEach((v, indexL) => {
            v.machineCode = element?.machineCode;
            v.machineName = element?.machineName;
            v.itemFilterList = v.itemList.filter((e) => {
              const product = productList?.find((innerData) => e.productId === innerData.value);
              e.patching = patchingOptions.find((o) => o.value === product?.detail?.patching);
              e.productType = productTypeOptions.find((o) => o?.detail?.code === product?.detail?.productType);
              e.productionStep = product?.detail?.productionStep.filter((o) => o < 100);
              if (e.status === 'NEW') {
                e.productionStepNext = `พร้อม${f({ id: `dailyPlan.step.step${e.currentStep?.step}` })}`;
              } else if (e.status === 'CONFIRM') {
                e.productionStepNext = `รอ${f({ id: `dailyPlan.step.step${e.productionStep[1] === undefined ? '' : e.productionStep[1]}` })}`;
              } else if (e.status === 'COMPLETED') {
                e.productionStepNext = `${f({ id: `dailyPlan.step.step${e.currentStep?.step}เสร็จสิ้น` })}`;
              } else {
                e.productionStepNext = `กำลัง${f({ id: `dailyPlan.step.step${e.currentStep?.step}` })}`;
              }
              e.toolingOptionsList = toolingOptions.filter((x) => e.tooling?.some((e) => e === x.value));
              if (e.step?.value === 11 || e.step?.value === 12) {
                e.stepValue = 'printing';
              } else if (e.step?.value === 17 || e.step?.value === 18 || e.step?.value === 19 || e.step?.value === 20) {
                e.stepValue = 'pumping';
              } else if (e.step?.value === 22 || e.step?.value === 27) {
                e.stepValue = 'glueing';
              } else if (e.step?.value === 26) {
                e.stepValue = 'rolling';
              } else {
                e.stepValue = '';
              }
              return filterPrint.type === undefined || filterPrint.type === '' ? true : filterPrint.type === e.stepValue;
            });
            if (temp !== undefined && temp[indexL]?.itemFilterList?.length > 0) {
              lastResult.push(temp);
            }
          });
        });
      }
      const dataItemFilter = lastResult.map((element) => {
        const res = element.filter((element1) => {
          return element1.itemFilterList.length > 0;
        });
        return res;
      });
      setDataItemList(dataItemFilter);
    }, [filterPrint, dataGrouped]);
    console.log(dataItemList);
    const handleRowClick = useCallback((oc, itemD, group) => (e) => oc?.(e, itemD, group), []);
    return (
      <div className={isConfirmModal ? clx('react-table page-print') : 'd-none'} ref={componentRef}>
        {dataItemList.map((product, indexCore) => {
          return product.map((itemA, innerProduct) => {
            const { itemFilterList: itemList, machineName, machineCode, planDate } = itemA;
            let machineType = '';
            let TableHead = (
              <tr>
                <th>ลำดับ</th>
                <th>ชื่องาน</th>
                <th>ชื่อลูกค้า</th>
                <th>Lot No.</th>
                <th>จำนวนใบพิมพ์</th>
                <th>Cavity</th>
                <th>ขนาดใบพิมพ์</th>
                <th>รูปแบบการพิมพ์</th>
                <th>รูปแบบการเคลือบ</th>
                <th>สถานะแม่พิมพ์</th>
                <th>สถานะกระดาษ</th>
                <th>หมายเหตุ</th>
                {/* <th>สถานะใบวอเตอร์เบส</th> */}
                {/* <th>ช่วงวลาที่ปฏิบัติงาน</th> */}
              </tr>
            );
            if (filterPrint.type === 'printing') {
              machineType = 'เครื่องพิมพ์';
              TableHead = (
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่องาน</th>
                  <th>ชื่อลูกค้า</th>
                  <th>Lot No.</th>
                  <th>จำนวนใบพิมพ์</th>
                  <th>Cavity</th>
                  <th>ขนาดใบพิมพ์</th>
                  <th>รูปแบบการพิมพ์</th>
                  <th>รูปแบบการเคลือบ</th>
                  <th>สถานะแม่พิมพ์</th>
                  <th>สถานะกระดาษ</th>
                  <th>หมายเหตุ</th>
                  {/* <th>สถานะใบวอเตอร์เบส</th> */}
                  {/* <th>ช่วงวลาที่ปฏิบัติงาน</th> */}
                </tr>
              );
            } else if (filterPrint.type === 'glueing') {
              machineType = 'เครื่องปะ';
              TableHead = (
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่องาน</th>
                  <th>ชื่อลูกค้า</th>
                  <th>Lot No.</th>
                  <th>จำนวนกล่อง</th>
                  <th>ขนาดกล่อง</th>
                  <th>รูปแบบกล่อง</th>
                  <th>รูปแบบการปะ</th>
                  <th>สถานะคู่มือการปะ</th>
                  <th>สถานะงาน</th>
                  <th>หมายเหตุ</th>
                  {/* <th>ช่วงวลาที่ปฏิบัติงาน</th> */}
                </tr>
              );
            } else if (filterPrint.type === 'rolling') {
              machineType = 'เครื่องรีดลาย';
              TableHead = (
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่องาน</th>
                  <th>ชื่อลูกค้า</th>
                  <th>Lot No.</th>
                  <th>จำนวนใบพิมพ์</th>
                  <th>Cavity</th>
                  <th>ขนาดใบพิมพ์</th>
                  <th>ความหนากระดาษ(gram)</th>
                  <th>น้ำหนักกด</th>
                  <th>อุณหภูมิ</th>
                  <th>สถานะงาน</th>
                  <th>หมายเหตุ</th>
                  {/* <th>ช่วงวลาที่ปฏิบัติงาน</th> */}
                </tr>
              );
            } else if (filterPrint.type === 'pumping') {
              machineType = 'เครื่องปั๊ม';
              TableHead = (
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่องาน</th>
                  <th>ชื่อลูกค้า</th>
                  <th>Lot No.</th>
                  <th>จำนวนใบพิมพ์</th>
                  <th>Cavity</th>
                  <th>ขนาดใบพิมพ์</th>
                  <th>สถานะงาน</th>
                  <th>สถานะแม่ปั๊ม</th>
                  <th>การจัดเตรียมแม่ปั๊ม</th>
                  <th>เลขแผ่นหน้าโม</th>
                  <th>หมายเหตุ</th>
                  {/* <th>ช่วงวลาที่ปฏิบัติงาน</th> */}
                </tr>
              );
            } else {
              machineType = 'เครื่อง';
            }
            return (
              <>
                <div>
                  <h1> {`วันที่ : ${fd(planDate)}`}</h1>
                  <h1> {`${machineType} : ${machineCode} ${machineName}`}</h1>
                </div>
                <Table bordered className="table-print" style={{ pageBreakAfter: 'always' }}>
                  <thead key={`${innerProduct}`}>{TableHead}</thead>
                  {itemList.map((itemt, indexSub) => {
                    const { productName, stepValue } = itemt;
                    const {
                      productionPrintedAmount,
                      productPrintColor,
                      dueDate,
                      remaining,
                      productionOrderNo,
                      customer,
                      productionProducedAmount,
                      producedProductSize,
                      productCoatingMethod,
                      step,
                      productCavity,
                      cuttingStatus,
                      remark,
                      productPrintCategory,
                      toolingOptionsList,
                      productCreasingLine,
                      productMachineStandardList,
                      patching,
                      productType,
                      productionStepNext,
                    } = itemt;
                    const shouldRenderMaterialName = prevIndexCore !== indexCore; // Compare with the previous indexCore
                    // const rowIndexSpanElement = shouldRenderMaterialName ? <td rowSpan={itemListLength}>{indexCore + 1}</td> : null;
                    prevIndexCore = indexCore;
                    let printColor = '';
                    let coatingMethod = '';
                    let remarkList = '';
                    let creasingList = '';
                    let machineStandard = '';
                    productPrintColor?.forEach((e, index) => {
                      index + 1 === productPrintColor.length || productPrintColor.length === 1 ? (printColor += `${e.color}`) : (printColor += `${e.color}-`);
                    });
                    productCoatingMethod?.forEach((e, index) => {
                      index + 1 === productCoatingMethod.length || productCoatingMethod.length === 1
                        ? (coatingMethod += `${e.text}`)
                        : (coatingMethod += `${e.text}, `);
                    });
                    dataStep?.forEach((e, index) => {
                      remark.forEach((r) => {
                        if (r === e.value) {
                          index + 1 === remark.length || remark.length === 1 ? (remarkList += `${e.label}`) : (remarkList += `${e.label}, `);
                        }
                      });
                    });
                    productCreasingLine?.forEach((e, index) => {
                      index + 1 === productCreasingLine.length || productCreasingLine.length === 1
                        ? (creasingList += `${e.name}`)
                        : (creasingList += `${e.name}, `);
                    });
                    productMachineStandardList?.forEach((e, index) => {
                      index + 1 === productMachineStandardList.length || productMachineStandardList.length === 1
                        ? (machineStandard += `${e.value}`)
                        : (machineStandard += `${e.value}, `);
                    });
                    let TableBody = (
                      <tr>
                        <td>{indexSub + 1}</td>
                        <td>{productName}</td>
                        <td>{customer[0]?.customerAbbr || '-'}</td>
                        <td>{productionOrderNo || '-'}</td>
                        <td>{productionPrintedAmount}</td>
                        <td>{productCavity}</td>
                        <td>{producedProductSize}</td>
                        <td>{printColor}</td>
                        <td>{coatingMethod}</td>
                        <td>{toolingOptionsList[0]?.detail?.statusType?.name}</td>
                        <td>{cuttingStatus ? 'ตัดแล้ว' : 'รอกระดาษ'}</td>
                        <td>{remarkList}</td>
                        {/* <td>{step?.label}</td> */}
                        {/* <td>{fd(dueDate)}</td> */}
                      </tr>
                    );
                    if (filterPrint.type === 'printing') {
                      TableBody = (
                        <tr>
                          <td>{indexSub + 1}</td>
                          <td>{productName}</td>
                          <td>{customer[0]?.customerAbbr || '-'}</td>
                          <td>{productionOrderNo || '-'}</td>
                          <td>{productionPrintedAmount}</td>
                          <td>{productCavity}</td>
                          <td>{producedProductSize}</td>
                          <td>{printColor}</td>
                          <td>{coatingMethod}</td>
                          <td>{toolingOptionsList[0]?.detail?.statusType?.name}</td>
                          <td>{cuttingStatus ? 'ตัดแล้ว' : 'รอกระดาษ'}</td>
                          <td>{remarkList}</td>
                          {/* <td>{step?.label}</td> */}
                          {/* <td>{fd(dueDate)}</td> */}
                        </tr>
                      );
                    } else if (filterPrint.type === 'glueing') {
                      TableBody = (
                        <tr>
                          <td>{indexSub + 1}</td>
                          <td>{productName}</td>
                          <td>{customer[0]?.customerAbbr || '-'}</td>
                          <td>{productionOrderNo || '-'}</td>
                          <td>{productionProducedAmount}</td>
                          <td>{producedProductSize}</td>
                          <td>{productType?.label}</td>
                          <td>{patching?.label}</td>
                          <td>-</td>
                          <td>{productionStepNext}</td>
                          <td>{remarkList}</td>
                          {/* <td>{step?.label}</td> */}
                          {/* <td>{fd(dueDate)}</td> */}
                        </tr>
                      );
                    } else if (filterPrint.type === 'rolling') {
                      TableBody = (
                        <tr>
                          <td>{indexSub + 1}</td>
                          <td>{productName}</td>
                          <td>{customer[0]?.customerAbbr || '-'}</td>
                          <td>{productionOrderNo || '-'}</td>
                          <td>{productionPrintedAmount}</td>
                          <td>{productCavity}</td>
                          <td>{producedProductSize}</td>
                          <td>{productionProducedAmount}</td>
                          {/* <td>{creasingList}</td> */}
                          <td>-</td>
                          <td>{machineStandard}</td>
                          <td>{productionStepNext}</td>
                          <td>{remarkList}</td>
                          {/* <td>{step?.label}</td> */}
                          {/* <td>{fd(dueDate)}</td> */}
                        </tr>
                      );
                    } else if (filterPrint.type === 'pumping') {
                      TableBody = (
                        <tr>
                          <td>{indexSub + 1}</td>
                          <td>{productName}</td>
                          <td>{customer[0]?.customerAbbr || '-'}</td>
                          <td>{productionOrderNo || '-'}</td>
                          <td>{productionPrintedAmount}</td>
                          <td>{productCavity}</td>
                          <td>{producedProductSize}</td>
                          <td>{productionStepNext}</td>
                          <td>{toolingOptionsList[0]?.detail?.statusType?.name}</td>
                          <td>-</td>
                          <td>{toolingOptionsList[0]?.label}</td>
                          <td>{remarkList}</td>
                          {/* <td>{step?.label}</td> */}
                          {/* <td>{fd(dueDate)}</td> */}
                        </tr>
                      );
                    }
                    return <tbody key={`${indexSub}`}>{TableBody}</tbody>;
                  })}
                </Table>
              </>
            );
          });
        })}
      </div>
    );
  }
);

export default CardPrintingMachineList;
