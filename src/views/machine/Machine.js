/* eslint-disable prettier/prettier */
/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
// TEST MERGE REQUEST
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import { request } from 'utils/axios-utils';
import { SERVICE_URL } from 'config';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import { Badge } from 'react-bootstrap';

import HtmlHead from 'components/html-head/HtmlHead';
import Filter from './components/machine/Filter';

const callGetMasterDataMachineList = async ({ filter, limit = 10, sortBy = {} }) => {
  const data = await request({ url: `${SERVICE_URL}/masterData/machine/find`, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return data?.data;
};

const Machine = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: 'machine.list.title' });
  const description = f({ id: 'machine.list.description' });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
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
        Header: f({ id: 'machine.field.machineCode' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: f({ id: 'machine.field.machineName' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-50',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: f({ id: 'machine.field.machineType' }),
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: f({ id: 'machine.field.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10 justify-content-end',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
            {cell.value ? f({ id: 'machine.status.active' }) : f({ id: 'machine.status.inactive' })}
          </Badge>
        ),
      },
    ];
  }, [f]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`/master/machine/${id}`),
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
      placeholderText: f({ id: 'common.placeholder.machine' }),
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
    ['masterdataMachineList', pageSize, filter, sortBy],
    () => callGetMasterDataMachineList({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        // var list = [];
        const { data: result, pagination } = resp;
        // for (const element of result) {
        //   var value = {
        //     ...element,
        //     type : listMachineType.filter(item => item.code === element.type)[0].name
        //   };
        //   list.push(value);
        //   console.log('listMachineType : ', value);
        // }
        setData(result);
        setPageCount(pagination?.totalPage);
      },
      onError(err) {
        console.error('Error fetching master data machine list', err);
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
    // <>
    //   <HtmlHead title={title} />
    //   <Title title={title} description={description} />
    //   <List tableInstance={tableInstance} isLoading={isFetching} filter={<Filter show={showFilter} tableInstance={tableInstance} />} />
    // </>
    <>
      {/* history.push('/master/machine/new') */}
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} addButton={{ label: f({ id: 'machine.list.add' }), link: '/master/machine/new' }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={Filter} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};

export default Machine;
