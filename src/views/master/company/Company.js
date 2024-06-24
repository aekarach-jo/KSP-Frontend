import React, { useEffect, useMemo, useState } from 'react';
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
const companyRespTransform = (res) => {
  console.log(res);
  return res.data;
};

const searchCompany = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_COMPANY_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return companyRespTransform(res);
};

const Company = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

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

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);
  const { push } = useHistory();

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'company.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell, row }) => {
          return <div className="text-medium">{cell.value}</div>;
        },
      },
      {
        Header: () => f({ id: 'company.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-40',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium">
              {cell.value}
              {/* <Badge className='mx-2' bg="outline-primary">{row.values.isDefault ? 'A' : 'B'}</Badge> */}
            </div>
          );
        },
      },
      {
        Header: () => f({ id: 'company.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
            {cell.value ? f({ id: 'company.status.active' }) : f({ id: 'company.status.inactive' })}
          </Badge>
        ),
      },
      {
        Header: () => f({ id: 'company.updatedAt' }),
        accessor: 'updatedAt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20 text-end',
        Cell: ({ cell }) => (
          <div className="text-medium text-end">
            {fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })}
          </div>
        ),
      },
      {
        Header: () => f({ id: 'DEFAULT COMPANY' }),
        accessor: 'isDefault',
        // sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium">
              <Badge className="mx-2" bg="outline-primary">
                {cell.value ? 'DEFAULT' : ''}
              </Badge>
            </div>
          );
        },
      },
    ];
  }, [f]);

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
      placeholderText: f({ id: 'common.placeholder.company' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`${NAVIGATION.COMPANY_DETAIL}/${id}`),
    }),
    [push]
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery(
    [QUERY.COMPANY_LIST, filter, pageSize, sortBy],
    () => searchCompany({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result);
        setPageCount(pagination.totalPage);
      },
      onError(err) {
        console.error('Error fetching company list', err);
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
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_COMPANY }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle}/>
    </>
  );
};
export default Company;
