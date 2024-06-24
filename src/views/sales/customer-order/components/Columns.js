import React from 'react';
import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { NAVIGATION } from '../constants';

const handleRowClick = (row) => {
  // Redirect to the link when the row is clicked
  window.location.href = `${NAVIGATION.CUSTOMER_ORDER_DETAIL}/${row.original.id}`;
};

export const getColumn = (f, fd) => [
  {
    Header: f({ id: 'customerOrder.field.no' }),
    accessor: 'no',
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ row }) => (
      <NavLink to={`${NAVIGATION.CUSTOMER_ORDER_DETAIL}/${row.original.id}`} className="list-item-heading" style={{ cursor: 'pointer' }}>
        {row?.original?.no || '-'}
      </NavLink>
    ),
  },
  {
    Header: f({ id: 'salesOrder.field.customerName' }),
    accessor: 'customerName',
    sortable: true,
    headerClassName: 'w-30',
    Cell: ({ row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {row?.original?.customerId?.name || '-'}
      </div>
    ),
  },
  {
    Header: f({ id: 'salesOrder.field.reference' }),
    accessor: 'reference',
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ cell }) => cell.value,
  },
  {
    Header: f({ id: 'salesOrder.field.createdAt' }),
    accessor: 'createdAt',
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
        {fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })}
      </div>
    ),
  },
  {
    Header: f({ id: 'customerOrder.field.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'w-10 justify-content-end text-end',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)} style={{ textAlign: 'right', cursor: 'pointer' }}>
        <Badge bg="outline-primary">{cell.value}</Badge>
      </div>
    ),
  },
];

// If you have the following style applied to your rows, you can apply the same to your new page:
// <div style={{ cursor: 'pointer' }}>
//    ... your table component ...
// </div>
