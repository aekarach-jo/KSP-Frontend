import React from 'react';
import { Badge } from 'react-bootstrap';

export const getColumn = (f, fd) => [
  {
    Header: f({ id: 'stockManagement.stockNo' }),
    accessor: 'code',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
  },
  {
    Header: f({ id: 'stockManagement.stockName' }),
    accessor: 'name',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-50',
    Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
  },
  {
    Header: f({ id: 'stockManagement.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) => (
      <Badge bg={cell.value ? 'outline-success' : 'outline-danger'}>
        {cell.value ? f({ id: 'stockManagement.status.active' }) : f({ id: 'stockManagement.status.inactive' })}
      </Badge>
    ),
  },
  {
    Header: f({ id: 'stockManagement.lastUpdatedAt' }),
    accessor: 'updatedAt',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell }) => (
      <div className="text-medium">{fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })}</div>
    ),
  },
];
