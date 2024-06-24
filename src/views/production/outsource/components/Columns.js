import React from 'react';
import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import useProductPlanOptionsNoQC from 'hooks/useProductPlanOptionsNoQC';

const handleRowClick = (row) => {
  // Redirect to the link when the row is clicked
  window.location.href = `/production/outsourceDetail/${row.original.id}`;
};
const { planOptions } = useProductPlanOptionsNoQC();
export const getColumn = (f, fd) => [
  {
    Header: f({ id: 'outsource.field.no' }),
    accessor: 'code',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell, row }) => {
      return <div onClick={() => handleRowClick(row)}>{cell.value}</div>;
    },
  },
  {
    Header: f({ id: 'dailyPlan.field.product' }),
    accessor: 'productName',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-40',
    Cell: ({ cell, row }) => {
      return <div onClick={() => handleRowClick(row)}>{cell.value}</div>;
    },
  },
  {
    Header: f({ id: 'outsource.field.processType' }),
    accessor: 'productionPlanStep',
    sortable: true,
    headerClassName: 'text-truncate text-medium text-uppercase w-20 justify-content-end text-end',
    Cell: ({ cell, row }) => {
      let coating = '';
      if (cell.value === 13) {
        coating = row.original?.productCoatingMethod[0];
      } else if (cell.value === 15 || cell.value === 14) {
        coating = row.original?.productCoatingMethod[1];
      } else if (cell.value === 28) {
        coating = row.original?.productCoatingMethod[2];
      } else if (cell.value === 29) {
        coating = row.original?.productCoatingMethod[3];
      } else {
        coating = row.original?.productCoatingMethod[0];
      }
      return (
        <div onClick={() => handleRowClick(row)} style={{ textAlign: 'right' }}>
          {coating?.text}
        </div>
      );
    },
  },
  {
    Header: f({ id: 'outsource.field.sendDate' }),
    accessor: 'sendingDate',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell }) => {
      return <div>{fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>;
    },
  },
  {
    Header: f({ id: 'outsource.field.receivingStatus' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'text-truncate text-medium text-uppercase w-10 justify-content-end text-end',
    Cell: ({ cell }) => (
      <div style={{ textAlign: 'right' }}>
        <Badge bg={cell.value === 'COMPLETE' ? 'success' : 'outline-primary'}>{cell.value}</Badge>
      </div>
    ),
  },
];
