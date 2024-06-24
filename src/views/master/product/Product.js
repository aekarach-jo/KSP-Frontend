import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { NavLink } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import HtmlHead from 'components/html-head/HtmlHead';
// import CheckAll from 'components/check-all/CheckAll';

import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';

import FilterComponent from './components/FilterForm';
// import CustomerSearchAutocomplete from './CustomerAutocomplete';

import { API, INTL, NAVIGATION, QUERY } from './constants';

/**
 * @param {import('axios').AxiosResponse} res Response object
 */
const productRespTransform = (res) => {
  return res.data;
};

const searchProduct = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_PRODUCT_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return productRespTransform(res);
};

const Product = () => {
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

  // Table columns
  const handleClick = (id) => {
    // Handle the click event as needed
    window.location.href = `${NAVIGATION.PRODUCT_DETAIL}/${id}`;
  };

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'product.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'w-20',
        Cell: ({ cell, row }) => {
          return (
            <NavLink
              to={`${NAVIGATION.PRODUCT_DETAIL}/${row.values.id}`}
              className=" text-truncate h-100 d-flex align-items-center"
              style={{ cursor: 'pointer' }}
            >
              {cell.value || '-'}
            </NavLink>
          );
        },
      },
      {
        Header: () => f({ id: 'product.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'w-70',
        Cell: ({ cell, row }) => (
          <div onClick={() => handleClick(row.values.id)} style={{ cursor: 'pointer' }}>
            {cell.value}
          </div>
        ),
      },
      {
        Header: () => f({ id: 'product.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'w-10 justify-content-end text-end',
        Cell: ({ cell, row }) => (
          <div className="justify-content-end text-end" onClick={() => handleClick(row.values.id)} style={{ cursor: 'pointer' }}>
            <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
              {cell.value ? f({ id: 'product.status.active' }) : f({ id: 'common.inactive' })}
            </Badge>
          </div>
        ),
      },
    ];
  }, [f, fd]);

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
      placeholderText: f({ id: 'common.search.product' }),
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
    [QUERY.PRODUCT_LIST, filter, pageSize, sortBy],
    () => searchProduct({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result);
        setPageCount(pagination.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching product list', err);
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

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_PRODUCT }} />
      <Table tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} />
    </>
  );
};
export default Product;
