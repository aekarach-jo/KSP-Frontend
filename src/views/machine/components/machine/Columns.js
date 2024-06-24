import React from 'react';
import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export const getColumn = (f, fd) => [
  {
    Header: f({ id: 'machine.field.machineCode' }),
    accessor: 'code',
    sortable: true,
    headerClassName: 'text-muted text-uppercase w-10',
    Cell: ({ cell, row }) => {
      return (
        <NavLink to={`/master/machine/${row.original.id}`} className="text-truncate">
          {cell.value}
        </NavLink>
      );
    },
  },
  {
    Header: f({ id: 'machine.field.machineName' }),
    accessor: 'name',
    sortable: true,
    headerClassName: 'text-muted text-uppercase w-10',
    Cell: ({ cell, row }) => <>{cell.value || '-'}</>,
  },
  {
    Header: f({ id: 'machine.field.machineType' }),
    accessor: 'type',
    sortable: true,
    headerClassName: 'text-muted text-uppercase w-10',
    Cell: ({ cell, row }) => <>{cell.value || '-'}</>,
  },
  {
    Header: f({ id: 'machine.field.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'text-muted text-uppercase w-10 justify-content-end text-end',
    Cell: ({ cell }) => {
      return (
        <div style={{ textAlign: 'right' }}>
          <Badge bg="outline-primary">{cell.value}</Badge>
        </div>
      );
    },
  },
];
