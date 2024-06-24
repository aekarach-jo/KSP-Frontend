import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Badge } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import HtmlHead from 'components/html-head/HtmlHead';

import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';

import FilterComponent from './components/FilterForm';

import { API, INTL, NAVIGATION, QUERY } from './constants';

/**
 * @param {import('axios').AxiosResponse} res Response object
 */

const callGetMasterDataDepartment = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/employeeDepartment`);
  return data;
};

const employeeRespTransform = async (res) => {
  const resultDepartment = await callGetMasterDataDepartment();

  res.data.data.forEach((item1) => {
    resultDepartment.forEach((item2) => {
      if (item1.department === item2.code) {
        item1.department = item2.name;
      }
    });
  });
  return res.data;
};

const searchEmployee = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_EMPLOYEE_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return employeeRespTransform(res);
};

const Employee = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();
  const { push } = useHistory();
  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

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
        Header: () => f({ id: 'employee.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'employee.firstName' }),
        accessor: 'firstName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'employee.lastName' }),
        accessor: 'lastName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-40',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'employee.department' }),
        accessor: 'department',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'employee.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value === 'active' ? 'outline-success' : 'outline-danger'}>
            {cell.value === 'active' ? f({ id: 'employee.status.active' }) : f({ id: 'employee.status.inactive' })}
          </Badge>
        ),
      },
    ];
  }, [f]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`${NAVIGATION.EMPLOYEE_DETAIL}/${id}`),
    }),
    [push]
  );

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  // const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  // const [total, setTotal] = useState(0);

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
      placeholderText: f({ id: 'common.placeholder.employees' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  // console.log('global Filter : ', globalFilter);

  const { isFetching } = useQuery(
    [QUERY.EMPLOYEE_LIST, filter, pageSize, sortBy],
    () => searchEmployee({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
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
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_EMPLOYEE }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};
export default Employee;
