import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import ControlsSearch from 'components/react-table-custom/controls/ControlsSearch';
import ControlsAdd from 'components/react-table-custom/controls/ControlsAdd';
import ControlsPageSize from 'components/react-table-custom/controls/ControlsPageSize';
import { TableBoxed } from 'components/react-table-custom';
import TablePagination from 'components/react-table-custom/controls/TablePagination';
import ControlsDelete from 'components/react-table-custom/controls/ControlsDelete';
import ControlsEdit from 'components/react-table-custom/controls/ControlsEdit';
import RmBrowser from './RmBrowser';

const RmList = ({ rmList = [], setRmList, disabled }) => {
  const { formatMessage: f } = useIntl();
  const [pageCount, setPageCount] = useState(1);
  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
        disableGlobalFilter: true,
      },
      {
        Header: () => f({ id: 'rm.field.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-30',
        Cell: ({ cell, row }) => {
          return (
            <NavLink to={`/production/rm/${row.values.id}`} target="_blank" className="text-truncate h-100 d-flex align-items-center">
              {cell.value || '-'}
            </NavLink>
          );
        },
      },
      {
        Header: () => f({ id: 'rm.field.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
      },
      {
        Header: () => f({ id: 'rm.field.type' }),
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>,
      },
      /* {
        Header: () => f({ id: 'rm.field.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>,
      }, */
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row }) => {
          const { checked, onChange } = row.getToggleRowSelectedProps();
          return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />;
        },
      },
    ];
  }, [f, disabled]);

  const tableInstance = useTable(
    {
      columns,
      data: rmList,
      setData: setRmList,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      isOpenAddEditModal,
      setIsOpenAddEditModal,
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
      disabled,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  const {
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = tableInstance;

  return (
    <div>
      <Row className="mb-3">
        <Col sm="12" md="5" lg="4" xxl="3">
          <div className="d-inline-block float-md-start me-1 mb-1 mb-md-0 search-input-container w-100 shadow bg-foreground">
            <ControlsSearch tableInstance={tableInstance} />
          </div>
        </Col>
        <Col sm="12" md lg xxl className="text-end">
          <div className="d-inline-block me-0 me-sm-3 float-start float-md-none">
            <ControlsAdd tableInstance={tableInstance} disabled={disabled} />{' '}
            <ControlsDelete needConfirmation tableInstance={tableInstance} disabled={disabled} />
          </div>
          <div className="d-inline-block">
            <ControlsPageSize tableInstance={tableInstance} />
          </div>
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
      <RmBrowser show={isOpenAddEditModal} list={rmList} setList={setRmList} onHide={() => setIsOpenAddEditModal(false)} />
    </div>
  );
};

export default RmList;
