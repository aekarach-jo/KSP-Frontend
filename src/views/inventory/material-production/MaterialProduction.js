import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
// import { Badge } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import TableCard from 'views/sales/components/table/TableCard';
import FilterComponent from './components/FilterForm';
import MatchItemModal from './components/MatchItemModal';
import HistoryItemModal from './components/HistoryItemModal';

import { useAddMatchingItem } from './components/FormMutation';

import { API, INTL, QUERY } from './constants';

const getMatchingList = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_MATCHING_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return res?.data;
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

const MaterialProduction = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [matchingModal, setMatchingModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [matchingItem, setMatchingItem] = useState({});
  const [isMatching, setIsMatching] = useState(false);

  const columns = useMemo(() => {
    return [
      {
        Header: () => {
          return (
            <div
              style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: 'max-content', fontWeight: '600', fontSize: '14px' }}
            >
              {f({ id: 'material-production.product' })}
            </div>
          );
        },
        accessor: 'productName',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => {
          return <>{`${cell.value} (${cell.row.original.no})` || '-'}</>;
        },
      },
      {
        Header: () => {
          return (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                padding: '5px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {f({ id: 'material-production.productCode' })}
            </div>
          );
        },
        accessor: 'productCode',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 3 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px', fontWeight: '600', fontSize: '14px' }}>
              {f({ id: 'material-production.total' })}
            </div>
          );
        },
        accessor: 'totalAmount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-2 order-md-3 text-center',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 3 },
        Cell: ({ cell }) => cell.value || '0',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px', fontWeight: '600', fontSize: '14px' }}>
              {f({ id: 'material-production.unit' })}
            </div>
          );
        },
        accessor: 'productBaseUOM',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-5 order-md-6 text-center',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                padding: '5px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {f({ id: 'material-production.dueDate' })}
            </div>
          );
        },
        accessor: 'dueDate',
        sortable: true,
        colClassName: 'order-5 order-md-6 text-center',
        headerClassName: 'text-medium text-uppercase text-center',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => <div className=" text-medium">{moment(cell.value).add(543, 'year').format('DD/MM/YYYY HH:mm') || '-'}</div>,
      },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
        headerProps: { xs: 12, md: 1 },
        headerClassName: 'd-none',
        Cell: ({ row }) => (
          <>
            {/* <Button
                variant="outline-alternate"
                className="btn-icon btn-icon-start mb-1 position-md-absolute top-md-100"
                style={{ minWidth: 140 }}
                onClick={() => {
                  setHistoryModal(true);
                  setMatchingItem(row.original);
                }}
              >
                <CsLineIcons icon="info-hexagon" /> <span>{f({ id: 'material-production.history' })}</span>
              </Button> */}
            {/* <div> </div> */}
            <Button
              variant="info"
              className="btn-icon btn-icon-start mb-1 position-md-absolute"
              style={{ minWidth: 140 }}
              onClick={() => {
                setMatchingModal(true);
                setMatchingItem(row.original);
              }}
              disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="plus" /> <span>{f({ id: 'material-production.matching' })}</span>
            </Button>{' '}
          </>
        ),
      },
    ];
  }, [f]);
  const columns2 = useMemo(() => {
    return [
      {
        Header: () => {
          return (
            <div
              style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: 'max-content', fontWeight: '600', fontSize: '14px' }}
            >
              {f({ id: 'material-production.product' })}
            </div>
          );
        },
        accessor: 'productName',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => {
          return <>{`${cell.value} (${cell.row.original.no})` || '-'}</>;
        },
      },
      {
        Header: () => {
          return (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                padding: '5px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {f({ id: 'material-production.productCode' })}
            </div>
          );
        },
        accessor: 'productCode',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 3 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px', fontWeight: '600', fontSize: '14px' }}>
              {f({ id: 'material-production.total' })}
            </div>
          );
        },
        accessor: 'totalAmount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-2 order-md-3 text-center',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 3 },
        Cell: ({ cell }) => cell.value || '0',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px', fontWeight: '600', fontSize: '14px' }}>
              {f({ id: 'material-production.unit' })}
            </div>
          );
        },
        accessor: 'productBaseUOM',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-5 order-md-6 text-center',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                padding: '5px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {f({ id: 'material-production.dueDate' })}
            </div>
          );
        },
        accessor: 'dueDate',
        sortable: true,
        colClassName: 'order-5 order-md-6 text-center',
        headerClassName: 'text-medium text-uppercase text-center',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => <div className=" text-medium">{moment(cell.value).add(543, 'year').format('DD/MM/YYYY HH:mm') || '-'}</div>,
      },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
        headerProps: { xs: 12, md: 1 },
        headerClassName: 'd-none',
        Cell: ({ row }) => (
          <>
            {/* <Button
                variant="outline-alternate"
                className="btn-icon btn-icon-start mb-1 position-md-absolute top-md-100"
                style={{ minWidth: 140 }}
                onClick={() => {
                  setHistoryModal(true);
                  setMatchingItem(row.original);
                }}
              >
                <CsLineIcons icon="info-hexagon" /> <span>{f({ id: 'material-production.history' })}</span>
              </Button> */}
            {/* <div> </div> */}
            <Button
              variant="info"
              className="btn-icon btn-icon-start mb-1 position-md-absolute"
              style={{ minWidth: 140 }}
              onClick={() => {
                setMatchingModal(true);
                setMatchingItem(row.original);
              }}
              disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="plus" /> <span>{f({ id: 'material-production.matching' })}</span>
            </Button>{' '}
          </>
        ),
      },
    ];
  }, [f]);

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0, status: 'SUBMITTED' });
  const [pageCount, setPageCount] = useState(1);
  const [data2, setData2] = useState([]);
  const [filter2, setFilter2] = useState({ page: 0, status: 'COMPLETED' });
  const [pageCount2, setPageCount2] = useState(1);

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
      initialState: { pageIndex: 0, sortBy: [{ id: 'dueDate', desc: true }] },
      placeholderText: f({ id: 'common.search.materialMatching' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  const tableInstance2 = useTable(
    {
      columns: columns2,
      data: data2,
      filter: filter2,
      setData: setData2,
      setFilter: setFilter2,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount2,
      initialState: { pageIndex: 0, sortBy: [{ id: 'dueDate', desc: true }] },
      placeholderText: f({ id: 'common.search.materialMatching' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const {
    state: { globalFilter2, pageIndex: page2, pageSize2, sortBy2 },
  } = tableInstance2;

  const { isFetching, refetch } = useQuery(
    [QUERY.MATCHING_LIST, filter, pageSize, sortBy],
    () => getMatchingList({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
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
        console.error('Error fetching supplier list', err);
      },
    }
  );

  const { isFetching: isFetching2, refetch: refetch2 } = useQuery(
    [`${QUERY.MATCHING_LIST}-2`, filter2, pageSize2, sortBy2],
    () => getMatchingList({ filter2, limit: pageSize2, sortBy: sortByFromTable(sortBy2) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData2(result);
        setPageCount2(pagination.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );

  const afterAddItem = () => {
    refetch();
    setIsMatching(false);
    // setMatchingModal(false);
  };

  const { mutate: addMatchingItem, isSuccess } = useAddMatchingItem({ afterAddItem });

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
      productName: globalFilter,
    }));
  }, [globalFilter]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page2,
    }));
  }, [page2]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page: globalFilter2 !== undefined && 0,
      productName: globalFilter2,
    }));
  }, [globalFilter2]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} />
      <TableCard
        tabs={[
          {
            eventKey: 'first',
            label: 'Matching',
            tableInstance,
            isLoading: isFetching,
            filter: FilterComponent,
          },
          {
            eventKey: 'second',
            label: 'Completed',
            tableInstance,
            isLoading: isFetching2,
            filter: FilterComponent,
          },
        ]}
      />
      <MatchItemModal
        isMatching={isMatching}
        show={matchingModal}
        onAdd={(addItem) => {
          setIsMatching(true);
          addMatchingItem(addItem);
        }}
        isSuccess={isSuccess}
        onHide={() => {
          if (isMatching) {
            return;
          }
          setMatchingModal(false);
          setMatchingItem({});
        }}
        refetchList={refetch}
        data={matchingItem}
      />
      <HistoryItemModal
        show={historyModal}
        onHide={() => {
          setHistoryModal(false);
          setMatchingItem({});
        }}
        data={matchingItem}
        refetchList={refetch}
      />
    </>
  );
};

export default MaterialProduction;
