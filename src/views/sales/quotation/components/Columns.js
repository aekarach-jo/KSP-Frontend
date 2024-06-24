import React from 'react';
import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export const getColumn = (f, fd) => [
  {
    Header: f({ id: 'quotation.field.no' }),
    accessor: 'code',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell }) => {
      return <div>{cell.value}</div>;
    },
  },
  {
    Header: f({ id: 'quotation.field.customerName' }),
    accessor: 'customerName',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-40',
    Cell: ({ row }) => <>{row?.original?.customerName || '-'}</>,
  },
  {
    Header: f({ id: 'quotation.field.createdAt' }),
    accessor: 'date',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) => fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit' }),
  },
  {
    Header: f({ id: 'quotation.field.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10 justify-content-end text-end',
    Cell: ({ cell }) => {
      return (
        <div style={{ textAlign: 'right' }}>
          <Badge bg="outline-primary">{cell.value}</Badge>
        </div>
      );
    },
  },
];
