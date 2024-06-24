/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';

import { purchaseOrderColumns, purchaseItemColumns } from './Columns';

export const usePurchaseOrderTableInstance = (setPoList) => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const addOrRemoveRm = (value) => {
    setPoList((prevPoList) => {
      let newArr = [...prevPoList];
      const exitingId = newArr.find((v) => v === value.id);
      if (exitingId) {
        newArr = newArr.filter((v) => v !== value.id);
      } else {
        newArr.push(value.id);
      }
      return newArr;
    });
  };

  const tableInstance = useTable(
    {
      columns: useMemo(() => purchaseOrderColumns(f, fd), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      addOrRemoveRm,
      pageCount,
      setPageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page },
  } = tableInstance;

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      // ...currentFilter,
      supplierName: globalFilter,
    }));
  }, [globalFilter]);

  return tableInstance;
};

export const usePurchaseItemTableInstance = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const tableInstance = useTable(
    {
      columns: useMemo(() => purchaseItemColumns(f, fd), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }] },
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount,
      setPageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { pageIndex: page },
  } = tableInstance;

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  return tableInstance;
};

export const usePurchaseOrderTableExpressInstance = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const tableInstance = useTable(
    {
      columns: useMemo(() => purchaseOrderColumns(f, fd), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      setPageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page },
  } = tableInstance;

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      // ...currentFilter,
      supplierName: globalFilter,
    }));
  }, [globalFilter]);

  return tableInstance;
};
