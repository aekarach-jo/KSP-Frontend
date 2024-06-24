import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { SERVICE_URL } from 'config';
import { useIntl } from 'react-intl';
import clx from 'classnames';
// import { Badge } from 'react-bootstrap';
import { Button, Modal } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import ReactToPrint from 'react-to-print';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import TableCard from 'views/sales/components/table/TableCard';
import CardContainer from './table/components/CardPrintingSummary';
import FilterComponent from './components/FilterForm';
// import MatchItemModal from './components/MatchItemModal';
// import HistoryItemModal from './components/HistoryItemModal';

import { useAddMatchingItem } from './table/components/FormMutation';

import { API, INTL, QUERY } from './constants';

const getMatchingList = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_MATCHING_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return res?.data;
};
const productionGetReq = async (productPlanId) => {
  const resp = await request({ url: `${SERVICE_URL}/productionPlan` });
  return resp.data;
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

const JobSummary = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [matchingModal, setMatchingModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [matchingItem, setMatchingItem] = useState({});
  const [isMatching, setIsMatching] = useState(false);
  const [productId, setProductId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [printModal, setPrintModal] = useState(false);
  const [productData, setProductData] = useState([]);
  const componentRef = useRef(null);

  const columns = useMemo(() => {
    return [
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: '10rem' }}>
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
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
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
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'material-production.total' })}</div>;
        },
        accessor: 'totalAmount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '0',
      },
      // {
      //   Header: () =>{
      //     return (
      //       <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px'}}>
      //       {f({ id: 'material-production.available' })}
      //       </div>
      //     );
      //   },
      //   accessor: 'availableAmount',
      //   sortable: true,
      //   colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-3 order-md-4',
      //   headerClassName: 'text-medium text-uppercase',
      //   headerProps: { xs: 4, md: 2 },
      //   Cell: ({ cell }) => cell.value || '0',
      // },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'material-production.unit' })}</div>;
        },
        accessor: 'productBaseUOM',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-between mb-2 mb-md-0 order-5 order-md-6',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 3 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
              {f({ id: 'material-production.dueDate' })}
            </div>
          );
        },
        accessor: 'dueDate',
        sortable: true,
        colClassName: 'order-5 order-md-6',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => <div className=" text-medium">{moment(cell.value).add(543, 'year').format('DD/MM/YYYY HH:mm') || '-'}</div>,
      },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mb-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
        headerProps: { xs: 12, md: 1 },
        headerClassName: 'd-none',
        Cell: ({ row }) => (
          <>
            <div className="justify-content-left">
              <Button
                variant="info"
                style={{ minWidth: 140 }}
                onClick={() => {
                  setIsConfirmModal(true);
                  setPrintModal(true);
                }}
                disabled={row.original.availableAmount <= 0}
              >
                <CsLineIcons icon="print" /> <span>{f({ id: 'common.export' })}</span>
              </Button>{' '}
            </div>
          </>
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
  const { isFetchingPrint, refetch: refetchPrint } = useQuery(['productPlan'], () => productionGetReq(), {
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      const { data: result } = resp;
      console.log(result);
      setProductData(result);
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

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
  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={() => setIsConfirmModal(false)}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header closeButton>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={() => setIsConfirmModal(false)} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button
                  variant="info"
                  size="small"
                  onClick={() => {
                    setModal(false);
                  }}
                >
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  console.log(printModal);
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} />
      <TableCard tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} />
      <ConfirmModal
        show={isConfirmModal}
        setModal={setIsConfirmModal}
        // loading={supplier}
        titleText={f({ id: 'common.export' })}
        confirmText={f({ id: 'common.confirm' })}
        printModal={printModal}
        // onConfirm={handleConfirm}
      />
      <CardContainer rowProps={tableInstance} componentRef={componentRef} className="react-table rows" tableInstance={tableInstance} printModal={printModal} isFetching={isFetchingPrint} />
      {/* <MatchItemModal
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
      /> */}
      {/* <HistoryItemModal
        show={historyModal}
        onHide={() => {
          setHistoryModal(false);
          setMatchingItem({});
        }}
        data={matchingItem}
        refetchList={refetch}
      /> */}
    </>
  );
};

export default JobSummary;
