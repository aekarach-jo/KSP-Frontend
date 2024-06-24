import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import { useIntl } from 'react-intl';
import { Badge, Col, Form, Row } from 'react-bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import moment from 'moment';
// import Table from 'views/sales/components/table/Table';
import Table from 'views/sales/components/table/TableProduction';

import { API, QUERY } from './constants';

/**
 * @param {import('axios').AxiosResponse} res Response object
 */
const productionListReq = (res) => {
  return res.data;
};

const searchProduction = async ({ filter, limit = 10, sortBy = {}, page = 1 }) => {
  const res = await request({
    url: API.FIND_PRODUCTION_LIST,
    params: {
      ...filter,
      page: page + 1,
      limit,
      ...sortBy,
      status: 'SUBMITTED',
    },
  });
  return productionListReq(res);
};

const ManufacturingSubmit = () => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
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

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ status: 'SUBMITTED' });
  const [pageCount, setPageCount] = useState(1);

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'production.produce.no' }),
        accessor: 'no',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.group' }),
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      // {
      //   Header: () => f({ id: 'production.produce.manufacturing.field.no' }),
      //   accessor: 'producedProductCode',
      //   sortable: true,
      //   headerClassName: 'text-medium text-uppercase w-20',
      //   Cell: ({ cell, row }) => {
      //     return (
      //       <NavLink to={`/production/produce/view/${row.values.id}`} className="text-medium text-truncate h-100 d-flex align-items-center">
      //         {cell.value || '-'}
      //       </NavLink>
      //     );
      //   },
      // },
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.product' }),
        accessor: 'producedProductName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.created-at' }),
        accessor: 'createdAt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        Cell: ({ cell }) => (
          <>
            <div className="text-medium">{moment(cell.value).add(543, 'year').format('DD/MM/YYYY HH:mm') || '-'}</div>
          </>
        ),
      },
      // {
      //   Header: '',
      //   id: 'action',
      //   headerClassName: 'empty w-10',
      //   Cell: ({ row }) => {
      //     const { checked, onChange } = row.getToggleRowSelectedProps();
      //     return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
      //   },
      // },
    ];
  }, [f, fD, fT]);


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
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }], hiddenColumns: ['id'] },
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
    [QUERY.PRODUCTION_LIST, filter, pageSize, sortBy],
    () => searchProduction({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result } = resp;
        setData(result?.docs);
        console.log(result);
        setPageCount(result.totalPages);
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
      no: globalFilter,
    }));
  }, [globalFilter]);

  return (
    <>
      {/* <HtmlHead title={title} description={description} /> */}
      {/* <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_COMPANY }} /> */}
      <Table tableInstance={tableInstance} isLoading={isFetching} />
    </>
  );
};

export default ManufacturingSubmit;
