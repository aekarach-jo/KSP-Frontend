import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Badge } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import HtmlHead from 'components/html-head/HtmlHead';
import moment from 'moment';

import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';

import FilterComponent from './components/FilterForm';

import { API, INTL, NAVIGATION, QUERY } from './constants';

/**
 * @param {import('axios').AxiosResponse} res Response object
 */
const userRespTransform = (res) => {
  return res.data;
};

const searchUser = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({
    url: API.FIND_USER_LIST,
    params: { ...filter, ...sortBy, page: filter.page + 1, limit },
  });
  return userRespTransform(res);
};

const User = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });
  const { push } = useHistory();

  const sortByFromTable = ([field]) => {
    if (!field) {
      return {};
    }

    return {
      sortField: field.id,
      sortDirection: field.desc ? 'desc' : 'asc',
    };
  };

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'user.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase  w-30',
        Cell: ({ cell, row }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'user.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase  w-30',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'user.role' }),
        accessor: 'roleName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase  w-30',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
        // Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value ? f({ id: 'user.status.valid' }) : f({ id: 'user.status.invalid' })}</Badge>,
      },
      {
        Header: () => f({ id: 'user.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase  w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
            {cell.value ? f({ id: 'user.status.active' }) : f({ id: 'user.status.inactive' })}
          </Badge>
        ),
      },
    ];
  }, [f]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`${NAVIGATION.USER_DETAIL}/${id}`),
    }),
    [push]
  );

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
      placeholderText: f({ id: 'common.placeholder.user' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery([QUERY.USER_LIST, filter, pageSize, sortBy], () => searchUser({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }), {
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      const { data: result, pagination = {} } = resp;
      setData(result);
      setPageCount(pagination.totalPage);
    },
    onError(err) {
      console.error('Error fetching customer list', err);
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
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_USER }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};
export default User;
