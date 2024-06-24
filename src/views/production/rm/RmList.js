import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import { NavLink, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { Badge } from 'react-bootstrap';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import HtmlHead from 'components/html-head/HtmlHead';
import Table from 'views/sales/components/table/Table';
import FilterForm from './components/FilterForm';

const rmResponseTranform = (response) => {
  return response.data;
};

const searchRmFn =
  ({ filter, limit = 10, sortBy = {} }) =>
  async () => {
    const response = await request({
      url: `/masterData/material/find`,
      params: { ...filter, ...sortBy, page: filter.page + 1, limit },
    });

    return rmResponseTranform(response);
  };

const RmList = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();

  const title = f({ id: 'rm.list.title' });
  const description = f({ id: 'rm.list.description' });

  const [filter, setFilter] = useState({});
  const [isShowFilter, setShowFilter] = useState(false);
  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const toggleFilter = () => {
    setShowFilter(!isShowFilter);
  };

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'rm.field.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-30',
        Cell: ({ cell, row }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'rm.field.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-50',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'rm.field.type' }),
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>,
      },
      {
        Header: () => f({ id: 'rm.field.completeStatus' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
            {cell.value ? f({ id: 'rm.field.status.true' }) : f({ id: 'rm.field.status.false' })}
          </Badge>
        ),
      },
    ];
  }, [f]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`/master/rm/${id}`),
    }),
    [push]
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'code', desc: false }], hiddenColumns: ['id'] },
      placeholderText: f({ id: 'common.placeholder.rm' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const sortByFromTable = ([field]) => {
    if (!field) {
      return {};
    }

    return {
      sortField: field.id,
      sortDirection: field.desc ? 'desc' : 'asc',
    };
  };

  const { isFetching } = useQuery(['searchRm', filter, pageSize, sortBy], searchRmFn({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }), {
    enabled: true,
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      const { data: result, pagination } = resp;
      setPageCount(pagination.totalPage);
      setTotal(pagination.total);
      setData(result);
    },
    onError(err) {
      console.error('Search Error:', err);
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
      name: globalFilter,
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
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} addButton={{ label: f({ id: 'common.add' }), link: '/master/rm/add' }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterForm} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};

export default RmList;
