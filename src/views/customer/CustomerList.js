import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { NavLink, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Badge, ToggleButton } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import HtmlHead from 'components/html-head/HtmlHead';

import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import TablePagination from './components/TablePagination';

import { API, INTL, NAVIGATION, QUERY } from './constants';
import FilterForm from './components/FilterForm';

/**
 * @param {import('axios').AxiosResponse} res Response object
 */
const customerRespTransform = (res) => {
  return res.data;
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

const searchCustomerFn = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_CUSTOMER_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return customerRespTransform(res);
};

const CustomerList = () => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
  const { push } = useHistory();

  const title = f({ id: 'customer.list.title' });
  const description = f({ id: 'customer.list.description' });

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'customer.field.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-uppercase text-medium w-20',
        Cell: ({ cell }) => <div className="text-medium text-truncate">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'customer.field.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-uppercase text-medium w-70',
        Cell: ({ cell }) => <div className="text-medium text-truncate">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'customer.field.status' }),
        accessor: 'customerStatus',
        sortable: true,
        headerClassName: 'text-uppercase text-medium w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
            {cell.value ? f({ id: 'customer.customer-status.active' }) : f({ id: 'customer.customer-status.inactive' })}
          </Badge>
        ),
      },
    ];
  }, [f]);

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);

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
      placeholderText: f({ id: 'common.placeholder.customer' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`/master/customer/${id}`),
    }),
    [push]
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery(
    [QUERY.CUSTOMER_LIST, filter, pageSize, sortBy],
    () => searchCustomerFn({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result);
        setPageCount(pagination.totalPage);
      },
      onError(err) {
        console.error('Error fetching customer list', err);
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
      page: globalFilter !== undefined && 0,
      name: globalFilter,
    }));
  }, [globalFilter]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_CUSTOMER }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterForm} isLoading={isFetching} />
    </>
  );
};
export default CustomerList;
