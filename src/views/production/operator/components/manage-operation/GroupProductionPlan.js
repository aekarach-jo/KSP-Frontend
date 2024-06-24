/* eslint-disable no-else-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavLink, useHistory } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { SERVICE_URL } from 'config.js';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion, ToggleButton, Tabs, Tab, Nav } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import './Product2Produce.style.scss';
import P2PGrouped from './components/P2PGrouped';
import P2PUngrouped from './components/P2PUngrouped';
import AddGroupModal from './components/addGroupModal';

const responseTransformer = (resp) => {
  const { data } = resp;
  return data;
};

const createNumberFn =
  (formatNumber) =>
  (value, defValue = 0) =>
    !value ? defValue : formatNumber(value, { style: 'decimal' });

const createCurrencyFn =
  (formatNumber) =>
  (value, defValue = 0) =>
    !value ? defValue : formatNumber(value, { style: 'currency', currency: 'THB' });

const fetchItemListFn = async () => {
  const resp = await axios.get(`${SERVICE_URL}/saleOrder/toProducedList`);
  return responseTransformer(resp.data);
};

const GroupProductionPlan = ({
  tableInstance,
  className = '',
  customStyle,
  rowStyle,
  toolingOptions,
  machineOptions,
  tableTab,
  onChangeDate,
  setConfirm,
  setProductId,
  setOperationData,
  setShowModalConfirmQc,
}) => {
  const { formatMessage: f, formatNumber } = useIntl();
  const queryClient = useQueryClient();
  const { push } = useHistory();

  const [dataGrouped, setDataGrouped] = useState([]);
  const [dataUngrouped, setDataUngrouped] = useState([]);
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const setData = (value) => {
    const filterProductionOrderItemList = [];
    value.forEach((res) => {
      res?.productSubType?.forEach((itemRes) => {
        filterProductionOrderItemList.push({
          producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
          machine: itemRes.machine,
        });
        console.log(itemRes);
        itemRes?.machine?.forEach((itemMachine) => {
          itemMachine?.planDate?.forEach((itemDate) => {
            itemDate?.itemList?.forEach((listItem) => {
              listItem.step = planOptionsList.find((item) => item.value === listItem.step);
              listItem.currentStep.step = planOptionsList.find((item) => item.value === listItem.currentStep.step);
            });
          });
        });
      });
    });

    console.log(filterProductionOrderItemList);
    const newArr = filterProductionOrderItemList.flatMap((obj) => obj.machine);
    const dataGroup = filterProductionOrderItemList.flatMap((obj) => obj.machine);
    const newArrayDataGroup = dataGroup.map((itemArr) => {
      return { ...itemArr, planDate: itemArr.planDate.filter((item) => item.planDate !== '1957-01-01T00:00:00.000Z') };
    });
    console.log(newArrayDataGroup);
    console.log(newArr);
    setDataUngrouped(newArr || []);
    setDataGrouped(dataGroup || []);
  };

  useEffect(() => {
    setData([]);
    if (tableInstance.data.length > 0 && tableTab === 'fourt') {
      setDataGrouped([]);
      setDataUngrouped([]);
      setTimeout(() => {
        setData(tableInstance.data);
      }, 100);
      clearTimeout();
    }
  }, [tableInstance.data]);
  const [isProcessingGroup, setIsProcessingGroup] = useState(false);

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
      tableInstance.setDataIndexList(dataList);
    },
    [tableInstance]
  );

  const [addingGroup, setAddingGroup] = useState(false);

  const handleOnHide = useCallback(() => {
    setAddingGroup(null);
  }, []);

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

  const handleAddGroupOnSubmit = useCallback(
    async (values) => {
      // console.debug('handleAddGroupOnSubmit', values);

      setIsProcessingGroup(true);
      // await createGroup({ name: values.name });
      // console.debug('created group');

      setAddingGroup(null);
      setIsProcessingGroup(false);
    },
    [
      // createGroup
    ]
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
      {/* <P2PUngrouped
        useSorting
        list={dataUngrouped || []}
        setList={setDataUngrouped}
        columns={columns}
        onProduceClick={handleProduceClick}
        onDragOnEnd={handleDragOnEnd}
        onChangeDate={onChangeDate}
        tableInstance={tableInstance}
      /> */}
      <P2PGrouped
        useSorting
        list={dataGrouped || []}
        tableInstance={tableInstance}
        setList={setDataGrouped}
        columns={columns}
        onProduceClick={handleProduceClick}
        onDragOnEnd={handleDragOnEnd}
        onChangeDate={onChangeDate}
        setConfirm={setConfirm}
        setProductId={setProductId}
        setOperationData={setOperationData}
        toolingOptions={toolingOptions}
        machineOptions={machineOptions}
        setShowModalConfirmQc={setShowModalConfirmQc}
      />

      <AddGroupModal show={!!addingGroup} loading={isProcessingGroup} onHide={handleOnHide} onSubmit={handleAddGroupOnSubmit} />
    </>
  );
};

export default GroupProductionPlan;
