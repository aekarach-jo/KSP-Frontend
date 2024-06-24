import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import Table from './Table';
import { getColumn } from './Columns';

const historyList = (props) => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const [data, setData] = useState(props.dataPo.history);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const setManualGlobalFilterSearch = (no) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no,
    }));
  };

  const onRefetch = () => {
    props.onRefetch(true);
  }

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd, onRefetch), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'item', desc: true }] },
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

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;


  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);
  
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no: globalFilter,
    }));
  }, [globalFilter]);
  

  return (
    <>
      <Table tableInstance={tableInstance}/>
    </>
  );
};

export default historyList;
