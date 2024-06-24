import React from 'react';
import { Badge, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

let a = 0;
export const getColumn = (f, fd, handleRowClick, flagSyncState, setFlagSyncState, setSyncState) => [
  {
    Header: f({ id: 'salesOrder.field.no' }),
    accessor: 'no',
    sortable: true,
    headerClassName: '',
    Cell: ({ cell, row }) => {
      return (
        <NavLink to={`/sales/sales-order/${row.original.id}`} className="list-item-heading" style={{ cursor: 'pointer' }}>
          {cell.value}
        </NavLink>
      );
    },
  },
  {
    Header: f({ id: 'salesOrder.field.customerName' }),
    accessor: 'customerName',
    sortable: true,
    headerClassName: 'w-40',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {row?.original?.customerId?.name || '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'salesOrder.field.createdAt' }),
    accessor: 'createdAt',
    sortable: true,
    headerClassName: 'w-15',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {cell.value ? fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'salesOrder.field.exportAt' }),
    accessor: 'transferredAt',
    sortable: true,
    headerClassName: 'w-15',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {cell.value ? fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'customerOrder.field.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'w-10 justify-content-end text-end',
    Cell: ({ cell, row }) => {
      return (
        <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer', textAlign: 'right' }}>
          <Badge bg="outline-primary">{cell.value}</Badge>
        </div>
      );
    },
  },
  {
    Header: '',
    id: 'action',
    headerClassName: 'empty w-10',
    Cell: ({ row }) => {
      const { checked, onChange } = row.getRowProps();
      return (
        <Form.Check
          disabled={row.original.status !== 'SUBMITTED'}
          className="form-check float-end mt-1"
          type="checkbox"
          checked={checked}
          onClick={(v) => {
            a += 1;
            setSyncState(a);
            setFlagSyncState(row.original.id);
            return onChange;
          }}
        />
      );
    },
  },
];
export const getColumnSync = (f, fd, handleRowClick) => [
  {
    Header: f({ id: 'salesOrder.field.no' }),
    accessor: 'no',
    sortable: true,
    headerClassName: '',
    Cell: ({ cell, row }) => {
      return (
        <NavLink to={`/sales/sales-order/${row.original.id}`} className="list-item-heading" style={{ cursor: 'pointer' }}>
          {cell.value}
        </NavLink>
      );
    },
  },
  {
    Header: f({ id: 'salesOrder.field.customerName' }),
    accessor: 'customerName',
    sortable: true,
    headerClassName: 'w-40',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {row?.original?.customerId?.name || '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'salesOrder.field.createdAt' }),
    accessor: 'createdAt',
    sortable: true,
    headerClassName: 'w-15',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {cell.value ? fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'salesOrder.field.exportAt' }),
    accessor: 'transferredAt',
    sortable: true,
    headerClassName: 'w-15',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {cell.value ? fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'customerOrder.field.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'w-10 justify-content-end text-end',
    Cell: ({ cell, row }) => {
      return (
        <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer', textAlign: 'right' }}>
          <Badge bg="outline-primary">{cell.value}</Badge>
        </div>
      );
    },
  },
];
