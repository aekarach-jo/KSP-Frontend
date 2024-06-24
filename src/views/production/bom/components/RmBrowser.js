import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Accordion, Badge, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import RmSearchAutocomplete from 'views/production/rm/components/RmSearchAutocomplete';
import RmFilterForm from 'views/production/rm/RmFilterForm';
import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import DropdownPageSize from 'components/dropdown-page-size';
// import { TableBoxed } from 'components/react-table-custom';
// import TableBoxed from 'views/sales/components/table/Table';
import Table from 'views/sales/components/table/Table';
import { request } from 'utils/axios-utils';
import { DebounceInput } from 'react-debounce-input';
import TablePagination from './TablePagination';

const rmResponseTranform = (response) => {
  return response.data;
};

const searchRmFn =
  ({ filter, page = 0, limit = 10 }) =>
  async () => {
    const response = await request({
      url: `/masterData/material/find`,
      params: {
        ...filter,
        // page: page + 1,
        // limit,
      },
    });

    return rmResponseTranform(response);
  };

const RmBrowser = ({ show, list = [], setList, onHide }) => {
  const { formatMessage: f } = useIntl();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'rm.field.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-30',
      },
      {
        Header: () => f({ id: 'rm.field.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-40',
      },
      {
        Header: () => f({ id: 'rm.field.type' }),
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>,
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row, addOrRemoveRm }) => {
          const isExisted = list?.some((item) => item.id === row.values.id);
          const isCheckRmType = list?.some((item) => item.type === row.values.type);
          return (
            <Button
              className="btn-icon btn-icon-only hover-outline active-scale-down"
              variant={isExisted ? 'outline-success' : 'outline-primary'}
              onClick={() => addOrRemoveRm(row)}
              isDisabled={isCheckRmType}
            >
              {isExisted ? <CsLineIcons icon="check" /> : <CsLineIcons icon="plus" />}
            </Button>
          );
        },
      },
    ];
  }, [f, list]);

  const [filter, setFilter] = useState({});
  const [isShowFilter, setShowFilter] = useState(false);
  const [result, setResult] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const addOrRemoveRm = (rm) => {
    console.log('addOrRemoveRm', rm);
    const isExisted = list?.some((item) => item.id === rm.values.id);
    const isCheckRmType = list?.some((item) => item.type === rm.values.type && rm.values.type === 'RM');

    if (isExisted || isCheckRmType) {
      setList?.(list.filter((item) => item.id !== rm.values.id));
    } else {
      setList?.([...list, rm.original]);
    }
  };

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      // manualPagination: true,
      // manualFilters: true,
      // manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      addOrRemoveRm,
      initialState: { pageIndex: 0, hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { pageIndex, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery(['searchRm', filter], searchRmFn({ filter }), {
    enabled: !!show,
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      const { pagination = {} } = resp;
      setResult(resp.data);
      setPageCount(pagination.totalPage);
      setTotal(pagination.total);
    },
    onError(err) {
      console.error('Search Error:', err);
    },
  });

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
        <Modal.Title>RM Browser</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs="12">
            <Card>
              <Card.Body className="half-padding">
                <Table tableInstance={tableInstance} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default RmBrowser;
