import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import clx from 'classnames';
import { NavLink, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion } from 'react-bootstrap';
import { request } from 'utils/axios-utils';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import Filter from './components/FilterForm';

const bomResponseTranform = (response) => {
  return response.data;
};

const searchBomFn =
  ({ filter, limit = 10, sortBy = {} }) =>
  // TODO: SortBy
  async () => {
    const response = await request({
      url: `/bom/find`,
      params: { ...filter, ...sortBy, page: filter.page + 1, limit },
    });

    return bomResponseTranform(response);
  };

const SearchElement = (p) => <Form.Control {...p} type="text" />;

const BomList = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();

  const title = f({ id: 'bom.list.title' });
  const description = f({ id: 'bom.list.description' });

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
        Header: f({ id: 'bom.field.no' }),
        accessor: 'no',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell, row }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: f({ id: 'bom.field.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-70',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: f({ id: 'bom.field.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>{cell.value ? f({ id: 'bom.status.active' }) : f({ id: 'bom.status.inactive' })}</Badge>
        ),
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
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }], hiddenColumns: ['id'] },
      placeholderText: f({ id: 'common.placeholder.bom' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`/master/bom/${id}`),
    }),
    [push]
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

  const { isFetching } = useQuery(['searchBom', filter, pageSize, sortBy], searchBomFn({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }), {
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      const { data: result, pagination } = resp;
      setPageCount(pagination.totalPage);
      setTotal(pagination.total);
      setData(result);
    },
    onError(err) {
      console.error('Search error :', err);
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
      <PageTitle title={title} description={description} addButton={{ label: f({ id: 'common.add' }), link: '/master/bom/add' }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={Filter} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};

export default BomList;
