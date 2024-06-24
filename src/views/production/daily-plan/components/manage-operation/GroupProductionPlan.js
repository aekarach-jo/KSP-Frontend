/* eslint-disable no-else-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import './Product2Produce.style.scss';
import P2PGrouped from './components/P2PGrouped';
import P2PUngrouped from './components/P2PUngrouped';

const GroupProductionPlan = ({
  tableInstance,
  tableInstanceGroup,
  machineOptions,
  isLoading,
  isLoadingGroup,
  tableTab,
  onChangeDate,
  toolingOptions,
  operationQuery,
  operationQueryGroup,
}) => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();
  const [dataGrouped, setDataGrouped] = useState([]);
  const [dataUngrouped, setDataUngrouped] = useState([]);
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const setDataGroup = (value) => {
    const dataList = value;
    const dataGroup = dataList.flatMap((obj) => obj.machine);
    const newArrayDataGroup = dataGroup.map((itemArr) => {
      console.log(itemArr?.planDate);
      return { ...itemArr, planDate: itemArr?.planDate?.filter((item) => item.planDate !== '1957-01-01T00:00:00.000Z') };
    });
    console.log(newArrayDataGroup);
    setDataGrouped(newArrayDataGroup || []);
  };

  const setData = (value) => {
    const dataList = value;
    console.log(dataList);
    const newArr = dataList.flatMap((obj) => obj.machine);
    console.log(newArr);
    setDataUngrouped(newArr || []);
  };

  // useEffect(() => {
  //   if (tableInstance.data.length > 0 && tableTab === 'fourt') {
  //     setData(tableInstance.data);
  //   }
  // }, [tableInstance.data]);

  // useEffect(() => {
  //   if (tableInstanceGroup.data.length > 0 && tableTab === 'fourt') {
  //     setDataGroup(tableInstanceGroup.data);
  //   }
  // }, [tableInstanceGroup.data]);

  useEffect(() => {
    if (!operationQuery.isFetching) {
      const filterProductionOrderItemList = [];
      operationQuery.data.data.forEach((res) => {
        res?.productSubType?.forEach((itemRes) => {
          itemRes?.machine?.forEach((itemMachine) => {
            itemMachine?.planDate?.forEach((itemDate) => {
              itemDate?.itemList?.forEach((listItem) => {
                listItem = { ...listItem, stepName: planOptionsList.find((item) => item.value === listItem.step) };
                listItem.currentStep = { ...listItem.currentStep, stepName: planOptionsList.find((item) => item.value === listItem.currentStep.step) };
              });
            });
          });
          filterProductionOrderItemList.push({
            producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
            machine: itemRes.machine,
          });
        });
      });

      console.log(filterProductionOrderItemList);
      const newArr = filterProductionOrderItemList.flatMap((obj) => obj.machine);
      setDataUngrouped(newArr || []);
    }
  }, [operationQuery.isFetching]);

  useEffect(() => {
    console.log(tableInstance);
    console.log(tableInstanceGroup);
    if (!operationQueryGroup.isFetching) {
      const filterProductionOrderItemList = [];
      operationQueryGroup.data.data.forEach((res) => {
        res?.productSubType?.forEach((itemRes) => {
          itemRes?.machine?.forEach((itemMachine) => {
            itemMachine?.planDate?.forEach((itemDate) => {
              itemDate?.itemList?.forEach((listItem) => {
                listItem.step = { ...listItem.step, stepName: planOptionsList.find((item) => item.value === listItem.step) };
                listItem.currentStep = { ...listItem.currentStep, stepName: planOptionsList.find((item) => item.value === listItem.currentStep.step) };
              });
            });
          });
          filterProductionOrderItemList.push({
            producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
            machine: itemRes.machine,
          });
        });
      });

      console.log(filterProductionOrderItemList);
      const dataGroup = filterProductionOrderItemList.flatMap((obj) => obj.machine);
      const newArrayDataGroup = dataGroup.map((itemArr) => {
        console.log(itemArr?.planDate);
        return { ...itemArr, planDate: itemArr?.planDate?.filter((item) => item.planDate !== '1957-01-01T00:00:00.000Z') };
      });
      console.log(newArrayDataGroup);
      setDataGrouped(newArrayDataGroup || []);
    }
  }, [operationQueryGroup.isFetching]);

  const handleDragOnEnd = useCallback(
    (e, value) => {
      // console.debug('handleDragOnEnd', e);
      // console.log(e);
      // const { item, from, to } = e;
      // console.info(`Move ${item.id} from ${from.id} to ${to.id}`);
      // console.log(e);
      // console.log(from);
      // console.log(to);

      const dataList =
        value?.map((data) => {
          return { id: data?.id, index: data?.index };
        }) || [];
      console.log(value);
      tableInstanceGroup.setDataIndexList(dataList);
    },
    [tableInstanceGroup]
  );

  const handleProduceClick = useCallback(
    ({ type, saleOrderGroupId, saleOrderDetailId }) => {
      // console.debug(`Produce click with type ${type} : ${saleOrderGroupId || saleOrderDetailId}`);
      let id = -1;

      if (type === 'group') {
        id = saleOrderGroupId;
      } else if (type === 'item') {
        id = saleOrderDetailId;
      }

      push(`/production/produce/${type}/${id}`);
    },
    [push]
  );

  const columns = useMemo(
    () => [
      {
        id: 'customer',
        accessor: 'customer',
        sortable: true,
        colProps: {
          md: 2,
          className: 'd-flex flex-column pe-1 justify-content-center text-start',
        },
        header: f({ id: 'dailyPlan.field.customer' }),
      },
      {
        id: 'step',
        accessor: 'step',
        sortable: true,
        colProps: {
          md: 3,
          className: 'd-flex flex-column pe-1 justify-content-end text-start',
        },
        header: f({ id: 'dailyPlan.field.step' }),
      },
      {
        id: 'status',
        accessor: 'status',
        sortable: true,
        colProps: {
          md: 2,
          className: 'd-flex flex-column pe-1 justify-content-end text-center',
        },
        header: f({ id: 'dailyPlan.field.status' }),
      },
      {
        id: 'date',
        accessor: 'date',
        sortable: true,
        colProps: {
          md: 2,
          className: 'd-flex flex-column pe-1 justify-content-end text-center',
        },
        header: f({ id: 'dailyPlan.field.planDate' }),
      },
    ],
    [f]
  );

  return (
    <>
      <P2PUngrouped
        useSorting
        isLoading={isLoading}
        list={dataUngrouped || []}
        setList={setDataUngrouped}
        onProduceClick={handleProduceClick}
        onDragOnEnd={handleDragOnEnd}
        onChangeDate={onChangeDate}
        tableInstance={tableInstance}
        toolingOptions={toolingOptions}
        machineOptions={machineOptions}
      />
      <P2PGrouped
        useSorting
        isLoadingGroup={isLoadingGroup}
        list={dataGrouped || []}
        setList={setDataGrouped}
        onProduceClick={handleProduceClick}
        onDragOnEnd={handleDragOnEnd}
        onChangeDate={onChangeDate}
        tableInstance={tableInstanceGroup}
        toolingOptions={toolingOptions}
        machineOptions={machineOptions}
      />
    </>
  );
};

export default GroupProductionPlan;
