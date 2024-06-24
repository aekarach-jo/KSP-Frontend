import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import { PURCHASE_ORDER_API, QUERY } from '../constants';

const sortByFromTable = ([field]) => {
  if (!field) {
    return {};
  }

  return {
    sortField: field.id,
    sortDirection: field.desc ? 'desc' : 'asc',
  };
};

const getPurchaseOrderList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  console.log(filter.supplierName);
  const data = await request({
    url: PURCHASE_ORDER_API.FIND_PURCHASE_ORDER,
    params: { ...filter, ...sortBy, type: filter?.type?.value, page: page + 1, limit },
  });
  return data?.data;
};

const getPurchaseItemList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({
    url: PURCHASE_ORDER_API.FIND_PURCHASE_ITEM,
    params: filter?.supplierName === undefined ? { ...filter, ...sortBy, type: filter?.type?.value, page: page + 1, limit } : { supplierName : filter?.supplierName },
  });
  return data?.data;
};

export const usePurchaseOrderQuery = ({ tableInstance }) => {
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const query = useQuery(
    [QUERY.PURCHASE_ORDER, pageSize, filter, sortBy],
    () => getPurchaseOrderList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        setData(result);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching purchase order list', err);
      },
    }
  );

  return query;
};

export const usePurchaseItemQuery = ({ tableInstance }) => {
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const query = useQuery(
    [QUERY.PURCHASE_ITEM, pageSize, filter, sortBy],
    () => getPurchaseItemList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        setData(result);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching purchase item list', err);
      },
    }
  );

  return query;
};


export const usePurchaseOrderExpressQuery = ({ tableInstance }) => {
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const query = useQuery(
    [QUERY.PURCHASE_ORDER, pageSize, filter, sortBy],
    () => getPurchaseOrderList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        setData(result);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching purchase order list', err);
      },
    }
  );

  return query;
};