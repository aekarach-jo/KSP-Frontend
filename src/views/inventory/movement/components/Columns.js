// import { NavLink } from 'react-router-dom';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { NAVIGATION } from '../constants';

const handleRowClick = (row) => {
  let isProduct = true;
  console.log(row.original.productId);
  if (row.original.productId === undefined) {
    isProduct = false;
  }
  // Redirect to the link when the row is clicked
  window.location.href = `${NAVIGATION.STORE_LOCATION_DETAIL}/${row.original.materialId}/${isProduct ? 'product' : 'material'}`;
};

export const getColumn = (f, fd) => [
  {
    Header: f({ id: 'movement.materialCode' }),
    accessor: 'materialCode',
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ cell, row }) => {
      let isProduct = true;
      if (row.original.productId === undefined) {
        isProduct = false;
      }
      return (
        <NavLink
          to={`${NAVIGATION.STORE_LOCATION_DETAIL}/${row.original.materialId}/${isProduct ? 'product' : 'material'}`}
          className="text-truncate h-100 d-flex align-items-center"
        >
          {cell.value || '-'}
        </NavLink>
      );
    },
  },
  {
    Header: f({ id: 'movement.materialName' }),
    accessor: 'materialName',
    sortable: true,
    headerClassName: 'w-30',
    Cell: ({ cell, row }) => <div onClick={() => handleRowClick(row)}>{cell.value || '-'}</div>,
  },
  {
    Header: f({ id: 'movement.type' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'w-10',
    Cell: ({ cell, row }) => <div onClick={() => handleRowClick(row)}>{cell.value || '-'}</div>,
  },
  {
    Header: f({ id: 'movement.amount' }),
    accessor: 'amount',
    sortable: true,
    headerClassName: 'w-10',
    Cell: ({ cell, row }) => <div onClick={() => handleRowClick(row)}>{cell.value || '-'}</div>,
  },
  {
    Header: f({ id: 'movement.unit' }),
    accessor: 'materialStoreUnit',
    sortable: true,
    headerClassName: 'w-10',
    Cell: ({ cell, row }) => <div onClick={() => handleRowClick(row)}>{cell.value || '-'}</div>,
  },
  {
    Header: f({ id: 'movement.lastUpdate' }),
    accessor: 'updatedAt',
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ cell, row }) => (
      <div onClick={() => handleRowClick(row)}>{fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })}</div>
    ),
  },
  // {
  //   Header: '',
  //   id: 'action',
  //   headerClassName: 'empty w-10',
  //   Cell: ({ row }) => {
  //     const { checked, onChange } = row.getToggleRowSelectedProps();
  //     return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
  //   },
  // },
];
