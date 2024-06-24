import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Badge } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import HtmlHead from 'components/html-head/HtmlHead';
import axios from 'axios';
import { SERVICE_URL } from 'config';

import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';

import { API, INTL, NAVIGATION, QUERY } from './constants';
import FilterComponent from './components/FilterForm';

/**
 * @param {import('axios').AxiosResponse} res Response object
 */
const callGetMasterType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_TYPE`);
  return data;
};

const callGetMasterDataStatusType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE`);
  return data;
};
const toolingRespTransform = async (res) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line no-use-before-define
  const resultType = await callGetMasterType();
  const resultStatusType = await callGetMasterDataStatusType();
  console.log(resultStatusType);

  // console.log(type);
  res.data.data.dataList?.forEach((data) => {
    resultType?.forEach((dataType) => {
      if (dataType.code === data.type) {
        data.type = dataType.name;
      }
    });
  });

  res.data.data.dataList?.forEach((data) => {
    resultStatusType?.forEach((statusType) => {
      if (statusType.code === data.statusType) {
        data.statusType = statusType.name;
      }
    });
  });

  return res.data;
};

const searchTooling = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_TOOLING_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return toolingRespTransform(res);
};

const Tooling = () => {
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
        Header: () => f({ id: 'tooling.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'tooling.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-40',
        Cell: ({ cell }) => <div className="text-medium">{cell.value}</div>,
      },
      {
        Header: () => f({ id: 'tooling.table.type' }),
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => f({ id: 'tooling.table.statusType' }),
        accessor: 'statusType',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-20',
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => f({ id: 'tooling.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => (
          <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
            {cell.value ? f({ id: 'tooling.status.active' }) : f({ id: 'tooling.status.inactive' })}
          </Badge>
        ),
      },
    ];
  }, [f]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, id) => push(`${NAVIGATION.TOOLING_DETAIL}/${id}`),
    }),
    [push]
  );

  const [data, setData] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      filterList,
      setFilterList,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'code', desc: false }], hiddenColumns: ['id'] },
      placeholderText: f({ id: 'common.placeholder.tooling' }),
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
    [QUERY.TOOLING_LIST, filter, pageSize, sortBy],
    () => searchTooling({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result.dataList);
        setFilterList(result);
        setPageCount(pagination?.totalPage || 0);
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
      <PageTitle title={title} description={description} addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_TOOLING }} />
      <Table rowProps={rowProps} tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
    </>
  );
};
export default Tooling;
