import React, { useState } from 'react';
import { Badge, Form } from 'react-bootstrap';
// import { Form } from 'react-bootstrap';
// import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { PURCHASE_ORDER_PAGE } from '../constants';

const typeList = [
  { value: '01', label: 'สั่งสำรองวัตถุดิบ' },
  { value: '02', label: 'เรียกวัตถุดิบ' },
  { value: '03', label: 'สั่งซื้อวัตถุดิบ' },
  { value: '04', label: 'สั่งซื้อวัสดุอื่นๆ' },
];

export const purchaseOrderColumns = (f, fd) => {
  return [
    {
      Header: f({ id: 'purchaseOrder.field.no' }),
      accessor: 'no',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-10',
      Cell: ({ cell, row }) => (
        <NavLink to={`/purchase/purchase-order/${row.original.id}`} className="list-item-heading" style={{ cursor: 'pointer' }}>
          {cell.value}
        </NavLink>
      ),
    },
    {
      Header: f({ id: 'purchaseOrder.field.supplierId' }),
      accessor: 'supplierName',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-40',
      Cell: ({ row }) => (
        <>
          <div className=" text-medium">{row?.original?.supplierId?.name || '-'}</div>
        </>
      ),
    },
    {
      Header: f({ id: 'purchaseOrder.field.createdAt' }),
      accessor: 'createdAt',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-20',
      Cell: ({ cell }) => (
        <div className=" text-medium">{fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })}</div>
      ),
    },
    {
      Header: f({ id: 'purchaseOrder.field.type' }),
      accessor: 'type',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-10',
      Cell: ({ cell }) => (
        <div className=" text-medium">
          {/* {cell.value} */}
          {typeList?.map((item, index) => (
            <div key={index}>{item.value === cell.value ? item.label : ''}</div>
          ))}
        </div>
      ),
    },
    {
      Header: f({ id: 'purchaseOrder.field.status' }),
      accessor: 'status',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-10 text-end',
      Cell: ({ cell }) => {
        return (
          <div style={{ textAlign: 'right' }}>
            <Badge bg="outline-primary">{cell.value}</Badge>
          </div>
        );
      },
    },
    {
      Header: '',
      id: 'action',
      headerClassName: 'empty w-10',
      Cell: ({ row, addOrRemoveRm }) => {
        // const { checked, onChange } = row.getRowProps();
        return (
          <Form.Check
            disabled={row.original.status !== 'SUBMITTED' || row.original.transferredStatus === 'COMPLETED' || row.original.transferredStatus === 'PENDING'}
            className="form-check float-end mt-1"
            type="checkbox"
            checked={row.original?.checked || false}
            onClick={(v) => {
              row.original.checked = v.target.checked;
              addOrRemoveRm(row.original);
            }}
          />
        );
      },
    },
  ];
};

export const purchaseItemColumns = (f, fd) => {
  return [
    {
      Header: f({ id: 'purchaseItem.field.code' }),
      accessor: 'code',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-20',
      Cell: ({ cell }) => <div className=" text-medium">{cell.value}</div>,
    },
    {
      Header: f({ id: 'purchaseItem.field.name' }),
      accessor: 'name',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-40',
      Cell: ({ cell }) => <div className=" text-medium">{cell.value}</div>,
    },
    {
      Header: f({ id: 'purchaseItem.field.amount' }),
      accessor: 'amount',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-10',
      Cell: ({ cell }) => <div className=" text-medium">{cell.value}</div>,
    },
    // {
    //   Header: f({ id: 'purchaseItem.field.availableAmount' }),
    //   accessor: 'availableAmount',
    //   sortable: true,
    //   headerClassName: 'text-medium text-uppercase w-10',
    //   Cell: ({ cell }) => <div className=" text-medium">{cell.value}</div>,
    // },
    {
      Header: f({ id: 'purchaseItem.field.unit' }),
      accessor: 'unit',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-10',
      Cell: ({ cell }) => (
        <>
          <div className=" text-medium">{cell.value || '-'}</div>
        </>
      ),
    },
    // {
    //   Header: f({ id: 'purchaseItem.field.createdBy' }),
    //   accessor: 'createdBy',
    //   sortable: true,
    //   headerClassName: 'text-medium text-uppercase w-20',
    //   Cell: ({ cell }) => (
    //     <div className=" text-medium">
    //       {cell.value}
    //     </div>
    //   ),
    // },
    {
      Header: f({ id: 'purchaseItem.field.createdAt' }),
      accessor: 'createdAt',
      sortable: true,
      headerClassName: 'text-medium text-uppercase w-20',
      Cell: ({ cell }) => (
        <>
          <div className=" text-medium">{fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })},</div>
        </>
      ),
    },
    // {
    //   Header: 'สถานะ',
    //   accessor: 'status',
    //   sortable: true,
    //   headerClassName: 'text-medium text-uppercase w-10 justify-content-end text-end',
    //   Cell: ({ cell }) => {
    //     return (
    //       <div style={{ textAlign: 'right' }}>
    //         <Badge bg="outline-primary">{cell.value}</Badge>
    //       </div>
    //     );
    //   },
    // },
  ];
};
