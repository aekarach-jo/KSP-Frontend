// import { NavLink } from 'react-router-dom';

export const getColumn = () => [
  {
    Header: 'รหัสวัตถุดิบ',
    accessor: 'materialCode',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) => <div className="text-muted text-medium">{cell.value || '-'}</div>,
  },
  {
    Header: 'ชื่อวัตถุดิบ',
    accessor: 'materialName',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-30',
    Cell: ({ cell }) => <div className="text-muted text-medium">{cell.value || '-'}</div>,
  },
  {
    Header: 'Stock Location',
    accessor: 'stockLocation',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-20',
    Cell: ({ cell }) => <div className="text-muted text-medium">{cell.value || '-'}</div>,
  },
  {
    Header: 'จำนวน',
    accessor: 'amount',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) => <div className="text-muted text-medium">{cell.value || '-'}</div>,
  },
  {
    Header: 'ต่ำสุด',
    accessor: 'amountMin',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) =><div className="text-muted text-medium">{ cell.value || '-' }</div>,
  },
  {
    Header: 'สูงสุุด',
    accessor: 'amountMax',
    sortable: true,
    headerClassName: 'text-medium text-uppercase w-10',
    Cell: ({ cell }) => <div className="text-muted text-medium">{cell.value || '-'}</div>,
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
