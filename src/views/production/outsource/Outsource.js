import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from '../../sales/components/page-title/PageTitle';
import Table from '../../sales/components/table/Table';
import FilterComponent from './components/Filter';

import { API, INTL, NAVIGATION, QUERY } from './constants';

import { getColumn } from './components/Columns';

const getOutsource = async ({ limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_OUTSOURCE, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
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

const Outsource = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const setManualGlobalFilterSearch = (code) => {
    console.log(code);
    setFilter((currentFilter) => ({
      ...currentFilter,
      code,
    }));
  };

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      placeholderText: f({ id: 'common.search.outsource' }),
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
    [QUERY.OUTSOURCE, pageSize, filter, sortBy],
    () => getOutsource({ limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
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
        console.error('Error fetching quotation order list', err);
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

  return (
    <>
      <HtmlHead title={title} />
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_OUTSOURCE }} />
      <Table tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} />
    </>
  );
};

export default Outsource;
