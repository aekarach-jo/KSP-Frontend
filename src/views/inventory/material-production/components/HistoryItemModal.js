import React, { useEffect, useMemo, useState } from 'react';
// import { NavLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import moment from 'moment';
// import RmSearchAutocomplete from 'views/production/rm/components/RmSearchAutocomplete';
// import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import { request } from 'utils/axios-utils';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Table from 'views/sales/components/table/Table';

import { API, QUERY } from '../constants';

const findMatchingHistory =
  ({ product }) =>
  async () => {
    const response = await request({
      url: API.FIND_MATCHING_HISTORY,
      params: { product },
    });

    return response?.data?.data;
  };

const deleteItem = async (id) => {
  await request({ url: API.DELETE_MATCHING_ITEM.replace(':itemId', id), method: 'post' });
};

const HistoryItemModal = ({ show, onHide, data, refetchList }) => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: '#',
        accessor: 'count',
        sortable: false,
        headerClassName: 'text-muted text-uppercase',
        Cell: ({ row }) => <>{row.index + 1}</>,
      },
      {
        Header: () => f({ id: 'material-production.batchNo' }),
        accessor: 'batchNo',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-20',
      },
      {
        Header: () => f({ id: 'material-production.product' }),
        accessor: 'productName',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-30',
      },
      {
        Header: () => f({ id: 'material-production.amount' }),
        accessor: 'amount',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-10',
      },
      {
        Header: () => f({ id: 'material-production.productOrder' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-20',
      },
      {
        Header: () => f({ id: 'material-production.matchDate' }),
        accessor: 'dueDate',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-20',
        Cell: ({ cell }) => <div className="text-medium">{moment(cell.value).add(543, 'year').format('DD/MM/YYYY HH:mm') || '-'}</div>,
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row }) => {
          const { checked, onChange } = row.getToggleRowSelectedProps();
          return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
        },
      },
    ];
  }, [f, fd]);

  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    useRowState,
    useRowSelect
  );

  const { selectedFlatRows } = tableInstance;

  const { isFetching, refetch } = useQuery([QUERY.MATCHING_HISTORY], findMatchingHistory({ product: data?.productId }), {
    enabled: show,
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      setResult(resp);
    },
    onError(err) {
      console.error('Search Error:', err);
    },
  });

  const handleDelete = () => {
    setIsLoading(true);
    Promise.all(selectedFlatRows.map((row) => deleteItem(row.values.id)))
      .then(() => {
        refetch();
        refetchList();
        setIsLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    setResult([]);
  }, [show]);

  return (
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide} backdrop="static">
      <Modal.Header closeButton={!isFetching && !isLoading}>
        <Modal.Title>
          {f({ id: 'material-production.history2' })} : {data?.productName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* <Card className="mb-2">
          <Card.Body>
            <Row className="g-0 h-100 align-content-center">
              <Col xs={6} md={4} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1">
                <div className="text-muted text-medium">{f({ id: 'material-production.materialCode' })}</div>
                <div className="text-alternate text-medium">{data?.materialCode || '-'}</div>
              </Col>
              <Col xs={6} md={3} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-2">
                <div className="text-muted text-medium">{f({ id: 'material-production.total' })}</div>
                <div className="text-alternate text-medium">{data?.totalAmount || '-'}</div>
              </Col>
              <Col xs={6} md={3} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-3">
                <div className="text-muted text-medium">{f({ id: 'material-production.available' })}</div>
                <div className="text-alternate text-medium">{data?.availableAmount || '-'}</div>
              </Col>
              <Col xs={6} md={2} className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-4">
                <div className="text-muted text-medium">{f({ id: 'material-production.unit' })}</div>
                <div>
                  <div className="text-alternate text-medium">{data?.materialUOM || '-'}</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card> */}
        <Row
          className={clx({
            'overlay-spinner': isFetching || isLoading,
          })}
        >
          <Col xs="12" className="mt-3">
            <Button className="btn-icon btn-icon-start float-end" variant="danger" onClick={handleDelete} disabled={selectedFlatRows?.length === 0}>
              <CsLineIcons icon="bin" /> <span>{f({ id: 'common.delete' })}</span>
            </Button>
          </Col>
          <Col xs="12">
            <Table tableInstance={tableInstance} hideAdd hideEdit hideDelete hideSearch hidePagination hidePageSize />
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default HistoryItemModal;
