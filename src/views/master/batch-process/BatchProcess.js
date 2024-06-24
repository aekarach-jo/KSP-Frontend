import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { toast } from 'react-toastify';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/TableBatch';
import FilterComponent from './components/Filter';

import { getColumn } from './components/Columns';

import { API, INTL, NAVIGATION, QUERY } from './constants';

const getBatchProcessList = async ({ limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_BATCH_PROCESS, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return data?.data;
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
const callSave = (stateList = [], isOnline, refetch) =>
  Promise.all(
    stateList.map((id) =>
      request({ url: `/batchProcess/${id}/edit`, method: 'post', data: { isOnline } }).then(() => {
        refetch();
        toast('บันทึกสำเร็จ');
      })
    )
  );
// request({ url: `/batchProcess/${id}/edit`, method: 'post', data: stateList });
// return request({ url: `/batchProcess/${id}/edit`, method: 'post', data: stateList });
const BatchProcess = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [stateList, setStateList] = useState();
  const [isBatch, setIsBatch] = useState(true);
  const [syncState, setSyncState] = useState(0);
  const [flagSyncStateList, setFlagSyncStateList] = useState([]);
  const [isOnline, setIsOnline] = useState('');
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const setManualGlobalFilterSearch = (no) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no,
    }));
  };

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd, setStateList, setSyncState), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      placeholderText: f({ id: 'common.search.product' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching, refetch } = useQuery(
    [QUERY.CUSTOMER_ORDER, pageSize, filter, sortBy],
    () => getBatchProcessList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
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
        console.error('Error fetching customer order list', err);
      },
    }
  );
  const { mutate: saveEdit } = useMutation(() => callSave(flagSyncStateList, isOnline, refetch), {
    onSuccess({ data: { message, error, data: savedData } }) {},
    onError(err) {
      console.error('save order error :', err);
    },
  });
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page: globalFilter !== undefined && 0,
      customerName: globalFilter,
    }));
  }, [globalFilter]);

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  useEffect(() => {
    const aList = [];
    let check = false;

    if (flagSyncStateList.length > 0) {
      flagSyncStateList.forEach((v) => {
        if (v === stateList) {
          check = true;
        } else {
          aList.push(v);
        }
      });
    }
    if (!check && stateList !== '') {
      aList.push(stateList);
      check = false;
    }
    if (aList[0] !== undefined) {
      setFlagSyncStateList(aList);
    }
  }, [syncState]);
  return (
    <>
      <HtmlHead title={title} />
      <PageTitle title={title} description={description} />
      <Table
        saveEdit={saveEdit}
        stateList={stateList}
        tableInstance={tableInstance}
        isBatch={isBatch}
        filter={FilterComponent}
        isLoading={isFetching}
        customStyle={customStyle}
        setIsOnline={setIsOnline}
      />
    </>
  );
};

export default BatchProcess;
