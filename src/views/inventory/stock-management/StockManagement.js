import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { useHistory } from 'react-router-dom';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import FilterComponent from './components/Filter';

import { getColumn } from './components/Columns';

import { API, INTL, NAVIGATION, QUERY } from './constants';

const callGetStockList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_STORE_LOCATION_LIST, params: { ...filter, ...sortBy, page: page + 1, limit } });
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

const StockManagement = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
  const { push } = useHistory();
  const setManualGlobalFilterSearch = (code) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      code,
    }));
  };

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`${NAVIGATION.STORE_LOCATION_DETAIL}/${id}`),
    }),
    [push]
  );

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'code', desc: false }] },
      placeholderText: f({ id: 'common.placeholder.store' }),
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery(
    [QUERY.STOCK_MANAGEMENT, pageSize, filter, sortBy],
    () => callGetStockList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        result.forEach((v) => {
          if (v.isSupplier) {
            v.name = v?.storeName;
          }
        });
        setData(result);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching stock list', err);
      },
    }
  );

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      code: globalFilter,
    }));
  }, [globalFilter]);

  const rowStyle = {
    height: '40px',
    border: '1px solid rgba(0, 0, 0, 0)',
    borderWidth: '1px 0',
    background: 'var(--foreground)',
  };

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  return (
    <>
      <HtmlHead title={title} />
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_NEW_STORE_LOCALION }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};

export default StockManagement;
