import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from '../components/page-title/PageTitle';
import Table from '../components/table/Table';
import FilterComponent from './components/Filter';

import { API, INTL, NAVIGATION, QUERY } from './constants';

import { getColumn } from './components/Columns';

const getQuotation = async ({ limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_QUOTATION, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
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

const Quotation = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
  const { push } = useHistory();
  const setManualGlobalFilterSearch = (no) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no,
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
      initialState: { pageIndex: 0, sortBy: [{ id: 'code', desc: true }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`/sales/quotation/id=${id}`),
    }),
    [push]
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery(
    [QUERY.QUOTATION, pageSize, filter, sortBy],
    () => getQuotation({ limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        setData(result);
        console.log(result);
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
      customerName: globalFilter,
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
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_QUOTATION }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};

export default Quotation;
