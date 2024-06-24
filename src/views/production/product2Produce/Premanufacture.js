import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavLink, useHistory } from 'react-router-dom';
import axios from 'axios';
import { SERVICE_URL } from 'config.js';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion, ToggleButton, Tabs, Tab, Nav } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import AddGroupModal from './components/addGroupModal';
import P2PGrouped from './components/P2PGrouped';
import P2PUngrouped from './components/P2PUngrouped';
import './Product2Produce.style.scss';

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

const fetchGroupListFn = async () => {
  const resp = await axios.get(`${SERVICE_URL}/saleOrder/groupList`);
  return responseTransformer(resp.data);
};

const createGroupFn = async ({ name, detail = [] }) => {
  const resp = await axios.post(`${SERVICE_URL}/saleOrder/groupCreate`, { name, detail });
  return responseTransformer(resp.data);
};

const moveGroupFn = async ({ fromSaleOrderGroupId, toSaleOrderGroupId, saleOrderDetailId }) => {
  const resp = await axios.post(`${SERVICE_URL}/saleOrder/groupMove`, { fromId: fromSaleOrderGroupId, toId: toSaleOrderGroupId, detail: saleOrderDetailId });
  return responseTransformer(resp.data);
};

const removeGroupFn = async ({ saleOrderGroupId }) => {
  const resp = await axios.post(`${SERVICE_URL}/saleOrder/groupDelete`, { id: saleOrderGroupId });
  return responseTransformer(resp.data);
};

const addItemToGroupFn = async ({ saleOrderGroupId, saleOrderDetailId }) => {
  const resp = await axios.post(`${SERVICE_URL}/saleOrder/groupIn`, { id: saleOrderGroupId, detail: saleOrderDetailId });
  return responseTransformer(resp.data);
};

const removeItemFromGroupFn = async ({ saleOrderGroupId, saleOrderDetailId }) => {
  const resp = await axios.post(`${SERVICE_URL}/saleOrder/groupOut`, { id: saleOrderGroupId, detail: saleOrderDetailId });
  return responseTransformer(resp.data);
};

const Premanufacture = (props) => {
  const { formatMessage: f, formatNumber } = useIntl();
  const n = createNumberFn(formatNumber);
  const nC = createCurrencyFn(formatNumber);

  const queryClient = useQueryClient();
  const { push } = useHistory();

  const [dataGrouped, setDataGrouped] = useState([]);
  const [dataUngrouped, setDataUngrouped] = useState([]);

  const {
    data,
    isFetching: isLoading,
    refetch: refetchToProduce,
  } = useQuery('itemListToProduce', fetchItemListFn, {
    refetchOnWindowFocus: false,
  });

  const onRefetch = () => {
    refetchToProduce();
  };
  const setData = (value) => {
    const { item, groupItem } = value;
    const filterProductionOrderGroupItem = groupItem.filter((res) => res?.productionOrderId === undefined);
    const filterProductionOrderItemList = [];
    item.map((res) => {
      res.productSubType.forEach((itemRes) => {
        itemRes.itemList = itemRes?.itemList?.filter((s) => s?.productionOrderId === undefined);
        filterProductionOrderItemList.push({
          producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
          itemList: itemRes.itemList,
        });
      });

      // console.log(res);
      return {
        producedSize: res?.producedSize,
        productSubType: res.productSubType,
        itemList: res?.itemList?.filter((s) => s?.productionOrderId === undefined),
      };
    });
    // const filterProductionOrderItem = item.filter((res) => res.productionOrderId === undefined);

    console.log(groupItem);
    // setDataUngrouped(filterProductionOrderItem.filter((v) => v.itemList.length > 0));
    setDataGrouped(groupItem);
    setDataUngrouped(filterProductionOrderItemList.filter((v) => v.itemList.length > 0));
  };

  useEffect(() => {
    if (!isLoading) {
      setDataGrouped([]);
      setDataUngrouped([]);
      setTimeout(() => {
        setData(data);
      }, 100);
      clearTimeout();
    }
  }, [isLoading]);

  const [isProcessingGroup, setIsProcessingGroup] = useState(false);
  const { mutateAsync: createGroup } = useMutation(createGroupFn, {
    onSuccess: (resp) => {
      // console.log('createGroupListFn', resp);
      onRefetch();
      queryClient.invalidateQueries('itemListToProduce');
    },
  });

  const { mutate: moveItemToGroup } = useMutation(moveGroupFn, {
    onSuccess: (resp) => {
      onRefetch();
      // console.log('moveGroupFn', resp);
    },
  });

  const { mutateAsync: removeGroup } = useMutation(removeGroupFn, {
    onSuccess: () => {
      onRefetch();
      // console.log('removeGroupFn', resp);
      queryClient.invalidateQueries('itemListToProduce');
    },
  });

  const { mutate: addItemToGroup } = useMutation(addItemToGroupFn, {
    onSuccess: (resp) => {
      onRefetch();
      // console.log('addItemToGroupFn', data);
    },
  });

  const { mutate: removeItemFromGroup } = useMutation(removeItemFromGroupFn, {
    onSuccess: (resp) => {
      onRefetch();
      // console.log('removeItemFromGroupFn', data);
    },
  });

  const handleDragOnEnd = useCallback(
    (e) => {
      // console.debug('handleDragOnEnd', e);
      // console.log(e);
      const { item, from, to } = e;
      console.info(`Move ${item.id} from ${from.id} to ${to.id}`);

      console.log(from.id === 'ungrouped');
      console.log(to.id === 'ungrouped');

      // if (from.id === 'ungrouped' && to.id === 'ungrouped') {
      //   return;
      // }

      if (from?.id !== 'ungrouped' && to?.id !== 'ungrouped') {
        console.log(1);
        if (from?.id !== to?.id) {
          moveItemToGroup({
            fromSaleOrderGroupId: from?.id,
            toSaleOrderGroupId: to?.id,
            saleOrderDetailId: item?.id,
          });
        }
        return;
      }

      if (from?.id !== 'ungrouped') {
        console.log(2);
        removeItemFromGroup({
          saleOrderGroupId: from?.id,
          saleOrderDetailId: item?.id,
        });

        setDataGrouped((prev) => {
          const targetGroup = prev.find((g) => g?.saleOrderGroupId === from?.id);
          if (!targetGroup) return prev;

          if (targetGroup?.detail?.length) return prev;

          return prev.filter((g) => g?.saleOrderGroupId !== from?.id);
        });
      }

      if (to?.id !== 'ungrouped') {
        console.log(3);
        addItemToGroup({
          saleOrderGroupId: to?.id,
          saleOrderDetailId: item?.id,
        });
      }
    },
    [addItemToGroup, moveItemToGroup, removeItemFromGroup]
  );

  const [addingGroup, setAddingGroup] = useState(false);

  const handleAddGroupClick = useCallback(() => {
    setAddingGroup(true);
  }, []);

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
      await createGroup({ name: values.name });
      // console.debug('created group');

      setAddingGroup(null);
      setIsProcessingGroup(false);
    },
    [createGroup]
  );

  const handleRemoveGroupConfirmClick = useCallback(
    async (removingGroupId) => {
      // console.log('handleRemoveGroupConfirmClick');

      setIsProcessingGroup(true);

      await removeGroup({ saleOrderGroupId: removingGroupId });

      setIsProcessingGroup(false);
    },
    [removeGroup]
  );

  const columns = useMemo(
    () => [
      {
        id: 'saleOrderNo',
        accessor: 'saleOrderNo',
        colProps: {
          md: 3,
          className: 'd-flex flex-column mb-lg-0 pe-3 d-flex',
        },
        header: f({ id: 'production.group.field.po-no' }),
      },
      {
        id: 'productCode',
        accessor: 'productCode',
        colProps: {
          md: 3,
          className: 'd-flex flex-column pe-1 justify-content-center',
        },
        header: f({ id: 'production.group.field.productCode' }),
      },
      {
        id: 'productName',
        accessor: 'productName',
        colProps: {
          md: 3,
          className: 'd-flex flex-column pe-1 justify-content-center',
        },
        header: f({ id: 'production.group.field.productName' }),
      },
      {
        id: 'amount',
        accessor: 'amount',
        colProps: {
          md: 2,
          className: 'd-flex flex-column pe-1 justify-content-end text-end',
        },
        header: f({ id: 'production.group.field.quantity' }),
      },
      {
        id: 'alert',
        accessor: 'alert',
        colProps: {
          md: 1,
          className: 'd-flex flex-column pe-1 justify-content-end text-end',
        },
        header: '',
      },
    ],
    [f]
  );

  return (
    <>
      <Col xs="12" sm="auto" className="justify-content-end" style={{ position: 'absolute', right: 0 }}>
        <Button variant="link" className="btn-icon btn-icon-start w-100 w-md-auto" onClick={handleAddGroupClick}>
          <CsLineIcons icon="plus" /> <span>{f({ id: 'production.group.add-group' })}</span>
        </Button>
      </Col>
      <P2PGrouped
        useSorting
        list={dataGrouped}
        setList={setDataGrouped}
        loading={isLoading}
        columns={columns}
        onProduceClick={handleProduceClick}
        onRemoveGroup={handleRemoveGroupConfirmClick}
        onDragOnEnd={handleDragOnEnd}
      />

      <P2PUngrouped
        useSorting
        list={dataUngrouped}
        setList={setDataUngrouped}
        loading={isLoading}
        columns={columns}
        onProduceClick={handleProduceClick}
        onDragOnEnd={handleDragOnEnd}
      />

      <AddGroupModal show={!!addingGroup} loading={isProcessingGroup} onHide={handleOnHide} onSubmit={handleAddGroupOnSubmit} />
    </>
  );
};

export default Premanufacture;
