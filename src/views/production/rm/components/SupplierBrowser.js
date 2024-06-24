import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Accordion, Badge, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import RmSearchAutocomplete from 'views/production/rm/components/RmSearchAutocomplete';
import DropdownPageSize from 'components/dropdown-page-size';
import { TableBoxed } from 'components/react-table-custom';
import useSupplierData from 'hooks/api/master/supplier/useSupplierData';
import TablePagination from '../../../customer/components/TablePagination';

const SupplierBrowser = ({ show, list = [], setList, onHide }) => {
  const { formatMessage: f } = useIntl();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'supplier.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-30',
        Cell: ({ cell, row }) => {
          return (
            <NavLink to={`/master/supplier/${row.values.id}`} target="_blank" className="text-truncate h-100 d-flex align-items-center">
              {cell.value || '-'}
            </NavLink>
          );
        },
      },
      {
        Header: () => f({ id: 'supplier.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase',
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row, addOrRemove }) => {
          const isExisted = list?.some((item) => item.id === row.values.id);
          return (
            <Button
              className="btn-icon btn-icon-only hover-outline active-scale-down"
              variant={isExisted ? 'outline-success' : 'outline-primary'}
              onClick={() => addOrRemove(row)}
            >
              {isExisted ? <CsLineIcons icon="check" /> : <CsLineIcons icon="plus" />}
            </Button>
          );
        },
      },
    ];
  }, [f, list]);

  const { useFindSupplierQuery } = useSupplierData();

  const [filter, setFilter] = useState({});
  const [isShowFilter, setShowFilter] = useState(false);
  const [result, setResult] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const addOrRemove = (e) => {
    console.log('addOrRemove', e);
    const isExisted = list?.some((item) => item.id === e.values.id);

    if (isExisted) {
      setList?.(list.filter((item) => item.id !== e.values.id));
    } else {
      setList?.([...list, e.original]);
    }
  };

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      addOrRemove,
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = tableInstance;

  const { data, isLoading } = useFindSupplierQuery(
    { filter, page: pageIndex, limit: pageSize, sortBy },
    {
      onSuccess(resp) {
        const { pagination = {} } = resp;
        setPageCount(pagination.totalPage);
        setTotal(pagination.total);
      },
      onError(err) {
        console.error('Search Error:', err);
      },
    }
  );

  // console.log('data :', data);

  useEffect(() => {
    if (data) {
      setResult(data);
    }
  }, [data]);

  const toggleFilter = () => {
    setShowFilter(!isShowFilter);
  };

  const handleAutocompleteSearch = (keyword) => {
    gotoPage(0);
    setFilter({ name: keyword });
  };

  const handleFilterFormSearch = async (_filter) => {
    console.log('handleFilterFormSearch', _filter);
    gotoPage(0);
    setFilter(_filter);
  };

  const handlefilterFormReset = () => {
    gotoPage(0);
    setFilter({});
  };

  return (
    <Modal show={show} className={clx('fade')} size="lg" onHide={onHide}>
      <Modal.Header>
        <Modal.Title>Supplier Browser</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md="6" lg="5" xxl="5" className="mb-1">
            {/* Search Start */}
            <RmSearchAutocomplete
              as={(p) => <Form.Control {...p} type="text" placeholder={f({ id: 'common.search' })} />}
              // onSuggestionSelected={handleSuggestionSelected}
              onSearch={handleAutocompleteSearch}
            />
            {/* Search End */}
          </Col>
          <Col md lg xxl className="mb-1 text-end">
            {/* Length Start */}
            {/* <ButtonFilterToggle onClick={toggleFilter} open={isShowFilter} /> */}
            <DropdownPageSize currentPageSize={pageSize} setPageSize={setPageSize} />
            {/* Length End */}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            {/* <Accordion>
              <Accordion.Collapse in={isShowFilter}>
                <Card body>
                  <RmFilterForm onSubmit={handleFilterFormSearch} onReset={handlefilterFormReset} />
                </Card>
              </Accordion.Collapse>
            </Accordion> */}
          </Col>
        </Row>
        <Row>
          <Col xs="12">
            <Card>
              <Card.Body className="half-padding">
                <TableBoxed className="react-table boxed" tableInstance={tableInstance} />
              </Card.Body>
            </Card>
          </Col>
          <Col xs="12">
            <TablePagination tableInstance={tableInstance} />
          </Col>
        </Row>
      </Modal.Body>
      {/* <Modal.Footer>
      </Modal.Footer> */}
    </Modal>
  );
};

export default SupplierBrowser;
