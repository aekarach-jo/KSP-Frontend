import React, { useEffect, useMemo, useState } from 'react';
// import { NavLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Card, Col, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import moment from 'moment';
import clx from 'classnames';
// import RmSearchAutocomplete from 'views/production/rm/components/RmSearchAutocomplete';
// import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import { request } from 'utils/axios-utils';

import { API, QUERY } from '../constants';

const findReceivingHistory =
  ({ purchaseOrderDetail }) =>
  async () => {
    const response = await request({
      url: API.FIND_RECEIVING_HISTORY,
      params: { purchaseOrderDetail },
    });
    // console.log(response?.data?.data);
    // response?.data?.data?.map((item) => (item.amount / 500));
    return response?.data?.data;
  };

const HistoryItemModal = ({ show, onHide, data }) => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'receiving.list.supplier' }),
        accessor: 'supplierName',
        sortable: true,
        headerClassName: 'text-uppercase w-30',
        Cell: ({ cell }) => <>{cell?.value || '-'}</>,
      },
      {
        Header: () => f({ id: 'receiving.list.receivedAmount' }),
        accessor: 'amount',
        sortable: true,
        headerClassName: 'text-uppercase w-20',
        Cell: ({ cell }) => <>{cell?.value || '-'}</>,
      },
      {
        Header: () => f({ id: 'receiving.list.deliveryBillNo' }),
        accessor: 'deliveryBillNo',
        sortable: true,
        headerClassName: 'text-uppercase w-20',
        Cell: ({ cell }) => <>{cell?.value || '-'}</>,
      },
      {
        Header: () => f({ id: 'receiving.list.receivingDt' }),
        accessor: 'receivingDt',
        sortable: true,
        headerClassName: 'text-uppercase w-10',
        Cell: ({ cell }) => moment(cell?.value).add(543, 'year').format('DD/MM/YYYY'),
      },

      {
        Header: () => f({ id: 'receiving.list.receivingBy' }),
        accessor: 'receivingBy',
        sortable: true,
        headerClassName: 'text-uppercase w-20',
        Cell: ({ cell }) => <>{cell?.value || '-'}</>,
      },
    ];
  }, [f, fd]);

  const [result, setResult] = useState([]);

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      // manualPagination: false,
      // manualFilters: false,
      // manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const { isFetching } = useQuery([QUERY.RECEIVING_HISTORY], findReceivingHistory({ purchaseOrderDetail: data?.purchaseOrderDetailId }), {
    enabled: show,
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      setResult(resp);
    },
    onError(err) {
      console.error('Search Error:', err);
    },
  });

  useEffect(() => {
    setResult([]);
  }, [show]);

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
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {f({ id: 'receiving.list.history' })} : {data?.materialName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-2">
          <>
            <Row className="g-0 h-100 align-content-center">
              <Col xs={6} md={2} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1">
                <div className="text-medium">{f({ id: 'receiving.list.materialCode' })}</div>
                <div className="text-alternate">{data?.materialCode}</div>
              </Col>
              <Col xs={6} md={3} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1">
                <div className="text-medium">{f({ id: 'receiving.list.purchaseOrderNo' })}</div>
                <div className="text-alternate">{data?.purchaseOrderNo}</div>
              </Col>
              <Col xs={6} md={2} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-2">
                <div className="text-medium">{f({ id: 'receiving.list.receivedTimes' })}</div>
                <div className="text-alternate">{data?.receivedCount || '0'}</div>
              </Col>
              <Col xs={6} md={3} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-3">
                <div className="text-medium">{f({ id: 'receiving.list.receivedAndTotal' })}</div>
                <div>
                  <div className="text-alternate">{`${data?.receivedAmount}/${data?.totalAmount}`}</div>
                </div>
              </Col>
              <Col xs={6} md={2} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-4">
                <div className="text-medium">{f({ id: 'receiving.list.materialStoreUnit' })}</div>
                <div>
                  <div className="text-alternate">{data?.materialStoreUnit || '-'}</div>
                </div>
              </Col>
            </Row>
          </>
        </Card>
        <Row>
          <Col xs="12">
            <div>
              <div
                className={clx({
                  'overlay-spinner': isFetching,
                })}
              >
                <Table className="react-table boxed" tableInstance={tableInstance} customStyle={customStyle} rowStyle={rowStyle} />
              </div>
            </div>
          </Col>
          <Col xs="12">{/* <TablePagination tableInstance={tableInstance} /> */}</Col>
        </Row>
      </Modal.Body>
      {/* <Modal.Footer>
      </Modal.Footer> */}
    </Modal>
  );
};

export default HistoryItemModal;
