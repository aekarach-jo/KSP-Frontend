import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import { API, QUERY } from '../constants';


const getProductForReceivingPending = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_PRODUCT_RECEIVING_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit, completeStatus: false } });
  return res?.data;
};

const getProductForReceivingSubmit = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_PRODUCT_RECEIVING_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit, completeStatus: true } });
  return res?.data;
};

const sortByFromTable = ([field]) => {
  if (!field) {
    return {};
  }

  return {
    sortField: field.id,
    sortDirection: field.desc ? 'desc' : 'asc',
  };
};

export const usereceivingPendingQuery = ({ tableInstance }) => {
  console.log('Pending');
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const query = useQuery(
    [QUERY.RECEIVING_LIST, filter, pageSize, sortBy],
    () => getProductForReceivingPending({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result);
        setPageCount(pagination.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );

  return query;
};

export const usereceivingSubmitQuery = ({ tableInstance }) => {
  console.log('Submit');
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const query = useQuery(
    [QUERY.RECEIVING_LIST_SUBMIT, filter, pageSize, sortBy],
    () => getProductForReceivingSubmit({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result);
        setPageCount(pagination.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );

  return query;
};
