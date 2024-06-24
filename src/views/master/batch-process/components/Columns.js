import React from 'react';
import { Badge, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { NAVIGATION } from '../constants';

// const handleRowClick = (row) => {
//   // Redirect to the link when the row is clicked
//   window.location.href = `${NAVIGATION.CUSTOMER_ORDER_DETAIL}/${row.original.id}`;
// };

let a = 0;
export const getColumn = (f, fd, setStateList, setSyncState) => [
  {
    Header: '',
    id: 'action',
    headerClassName: 'empty w-10',
    Cell: ({ row }) => {
      const { checked, onChange } = row.getRowProps();
      return (
        <Form.Check
          // disabled={row.original.status !== 'SUBMITTED'}
          className="form-check mt-1"
          type="checkbox"
          checked={checked}
          onClick={(v) => {
            // a += 1;
            // setSyncState(a);
            // setFlagSyncState(row.original.id);
            a += 1;
            setSyncState(a);
            setStateList(row.original.id);
            return onChange;
          }}
        />
      );
    },
  },
  {
    Header: f({ id: 'customerOrder.field.no' }),
    // accessor: ({ cell, row }) => console.log(row?.original),
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ cell, row }) => {
      let ref = row.original.referenceId;
      if (row.original.type === 'SO') ref = row.original.SONo;
      return ref;
    },
  },
  {
    Header: f({ id: 'cutting.field.lotNo' }),
    // accessor: 'productionOrderLotNo',
    sortable: true,
    headerClassName: 'w-30',
    Cell: ({ cell, row }) => {
      let ref = '';
      if (row.original.type === 'PD') {
        ref = row.original.productionOrderLotNo;
      } else if (row.original.type === 'SO' || row.original.type === 'PO') {
        row.original.productionOrderNo?.forEach((e, index) => {
          if (index + 1 === row.original.productionOrderNo.length || row.original.productionOrderNo.length === 1) {
            ref += `${e}`;
          } else {
            ref += `${e}, `;
          }
          console.log(ref);
        });
      } else if (row.original.type === 'PI') {
        ref = row.original.productionOrderNo;
      } else {
        ref = '-';
      }

      return ref;
    },
  },
  {
    Header: f({ id: 'dailyPlan.field.product' }),
    accessor: 'productName',
    sortable: true,
    headerClassName: 'w-20',
    Cell: ({ cell, row }) =>{
      let ref = '';
      // if (row.original.type === 'PD') {
      //   ref = row.original.productName;
      // } else if (row.original.type === 'SO' || row.original.type === 'PO') {
      //   // row.original.productionOrderNo?.forEach((e, index) => {
      //   //   if (index + 1 === row.original.productionOrderNo.length || row.original.productionOrderNo.length === 1) {
      //   //     ref += `${e}`;
      //   //   } else {
      //   //     ref += `${e}, `;
      //   //   }
      //   //   console.log(ref);
      //   // });
      //   ref = '-';
      // } else 
      if (row.original.type === 'PI') {
        ref = row.original.productName;
      } else {
        ref = '-';
      }

      return ref;
    },
  },
  {
    Header: f({ id: 'production.produce.type' }),
    accessor: 'isOnline',
    sortable: true,
    headerClassName: 'w-10',
    Cell: ({ cell, row }) => {
      // let ref = '-';
      // if (row.original.type === 'PD') ref = row.original.productionOrderLotNo;
      return row.original.isOnline ? 'Online' : 'Schedule';
    },
  },
  {
    Header: f({ id: 'customerOrder.field.status' }),
    accessor: 'status',
    sortable: true,
    headerClassName: 'w-10 justify-content-end text-end',
    Cell: ({ cell, row }) => (
      <div style={{ textAlign: 'right', cursor: 'pointer' }}>
        <Badge bg="outline-primary">{cell.value}</Badge>
      </div>
    ),
  },
];

// If you have the following style applied to your rows, you can apply the same to your new page:
// <div style={{ cursor: 'pointer' }}>
//    ... your table component ...
// </div>
