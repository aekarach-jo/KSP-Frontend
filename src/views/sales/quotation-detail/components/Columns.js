import React from 'react';
import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export const getColumn = (f, fd, onRefetch) => [
  {
    Header: f({ id: 'quotation.field.round' }),
    accessor: 'item',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell, row }) => {
      return (
        <NavLink
          to={{
            pathname: `/sales/quotation/his=${row.original.id}`,
          }}
          onClick={onRefetch}
          className="text-truncate h-100 d-flex align-items-center"
        >
          {cell.value}
        </NavLink>
      );
    },
  },
  {
    Header: f({ id: 'quotation.field.modification' }),
    accessor: 'note',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-30',
    Cell: ({ row }) => <>{row?.original?.note || '-'}</>,
  },
  {
    Header: f({ id: 'quotation.field.date' }),
    accessor: 'date',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) => fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit' }),
  },
  {
    Header: f({ id: 'quotation.field.by' }),
    accessor: 'updatedBy',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ row }) => <>{row?.original?.updatedBy || '-'}</>,
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
