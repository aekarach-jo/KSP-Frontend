import React from 'react';
import { Button, Tab, Nav } from 'react-bootstrap';
// import { Form } from 'react-bootstrap';
// import { Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

export const receivingPenddingColumns = (f, setReceiveModal, setHistoryModal, setReceivingItem) => {
  return [
    {
      Header: () => {
        return (
          <div style={{ background: 'rgba(0,0,0, 0.08)', borderRadius: '8px', padding: '5px', width: 'max-content' }}>
            {f({ id: 'receiving.list.materialName' })}
          </div>
        );
      },
      accessor: 'materialName',
      sortable: true,
      colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 12, md: 12 },
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: () => {
        return (
          <div style={{ background: 'rgba(0,0,0, 0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
            {f({ id: 'receiving.list.materialCode' })}
          </div>
        );
      },
      accessor: 'materialCode',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 2 },
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: () => {
        return <div style={{ background: 'rgba(0,0,0, 0.08)', padding: '5px' }}>{f({ id: 'receiving.list.purchaseOrderNo' })}</div>;
      },
      accessor: 'purchaseOrderNo',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 2 },
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: () => {
        return <div style={{ background: 'rgba(0,0,0, 0.08)', padding: '5px' }}>{f({ id: 'receiving.list.receivedTimes' })}</div>;
      },
      accessor: 'receivedCount',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-4 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 2 },
      Cell: ({ cell }) => cell.value || '0',
    },
    {
      Header: () => {
        return <div style={{ background: 'rgba(0,0,0, 0.08)', padding: '5px' }}>{f({ id: 'receiving.list.receivedAndTotal' })}</div>;
      },
      accessor: 'totalAmount',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-5 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 3 },
      Cell: ({ cell, row }) =>
        `${row.original.receivedAmount.toFixed(localStorage.getItem('ConfigDecimal'))}/${cell.value.toFixed(localStorage.getItem('ConfigDecimal'))}` || '-',
    },
    {
      Header: () => {
        return (
          <div style={{ background: 'rgba(0,0,0, 0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
            {f({ id: 'receiving.list.materialStoreUnit' })}
          </div>
        );
      },
      accessor: 'materialBaseUOM',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-6 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 1 },
      Cell: ({ cell }) => cell.value || '0',
    },
    // {
    //   Header: () => f({ id: 'supplier.status' }),
    //   accessor: 'status',
    //   sortable: true,
    //   headerClassName: 'text-muted text-medium text-uppercase',
    //   Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>,
    // },
    {
      id: 'action',
      colClassName: 'd-flex flex-column justify-content-center align-items-md-end  order-last text-end order-md-2 position-relative',
      headerProps: { xs: 12, md: 0 },
      headerClassName: 'd-none',
      Cell: ({ row }) => (
        <>
          <Button
            variant="info"
            className="btn-icon btn-icon-start mb-1 position-md-absolute"
            style={{ minWidth: 140 }}
            onClick={() => {
              setReceiveModal(true);
              setReceivingItem(row.original);
            }}
            disabled={row.original.availableAmount <= 0}
          >
            <CsLineIcons icon="plus" /> <span>{f({ id: 'receiving.list.receive' })}</span>
          </Button>{' '}
          <Button
            variant="outline-alternate"
            className="btn-icon btn-icon-start position-md-absolute top-md-100 mt-md-4"
            style={{ minWidth: 140 }}
            onClick={() => {
              setHistoryModal(true);
              setReceivingItem(row.original);
            }}
          >
            <CsLineIcons icon="info-hexagon" /> <span>{f({ id: 'receiving.list.history' })}</span>
          </Button>
        </>
      ),
    },
  ];
};

export const receivingSubmitColumns = (f, setReceiveModal, setHistoryModal, setReceivingItem) => {
  return [
    {
      Header: () => {
        return (
          <div style={{ background: 'rgba(0,0,0, 0.08)', borderRadius: '8px', padding: '5px', width: 'max-content' }}>
            {f({ id: 'receiving.list.materialName' })}
          </div>
        );
      },
      accessor: 'materialName',
      sortable: true,
      colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 12, md: 12 },
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: () => {
        return (
          <div style={{ background: 'rgba(0,0,0, 0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
            {f({ id: 'receiving.list.materialCode' })}
          </div>
        );
      },
      accessor: 'materialCode',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 2 },
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: () => {
        return <div style={{ background: 'rgba(0,0,0, 0.08)', padding: '5px' }}>{f({ id: 'receiving.list.purchaseOrderNo' })}</div>;
      },
      accessor: 'purchaseOrderNo',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 2 },
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: () => {
        return <div style={{ background: 'rgba(0,0,0, 0.08)', padding: '5px' }}>{f({ id: 'receiving.list.receivedTimes' })}</div>;
      },
      accessor: 'receivedCount',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-4 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 2 },
      Cell: ({ cell }) => cell.value || '0',
    },
    {
      Header: () => {
        return <div style={{ background: 'rgba(0,0,0, 0.08)', padding: '5px' }}>{f({ id: 'receiving.list.receivedAndTotal' })}</div>;
      },
      accessor: 'totalAmount',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-5 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 3 },
      Cell: ({ cell, row }) =>
        `${row.original.receivedAmount.toFixed(localStorage.getItem('ConfigDecimal'))}/${cell.value.toFixed(localStorage.getItem('ConfigDecimal'))}` || '-',
    },
    {
      Header: () => {
        return (
          <div style={{ background: 'rgba(0,0,0, 0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
            {f({ id: 'receiving.list.materialStoreUnit' })}
          </div>
        );
      },
      accessor: 'materialBaseUOM',
      sortable: true,
      colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-6 text-center',
      headerClassName: 'text-medium text-uppercase',
      headerProps: { xs: 4, md: 1 },
      Cell: ({ cell }) => cell.value || '0',
    },
    // {
    //   Header: () => f({ id: 'supplier.status' }),
    //   accessor: 'status',
    //   sortable: true,
    //   headerClassName: 'text-muted text-medium text-uppercase',
    //   Cell: ({ cell }) => <Badge bg="outline-primary">{cell.value}</Badge>,
    // },
    {
      id: 'action',
      colClassName: 'd-flex flex-column justify-content-center align-items-md-end  order-last text-end order-md-2 position-relative',
      headerProps: { xs: 12, md: 0 },
      headerClassName: 'd-none',
      Cell: ({ row }) => (
        <>
          <Button
            variant="info"
            className="btn-icon btn-icon-start mb-1 position-md-absolute "
            style={{ minWidth: 140 }}
            onClick={() => {
              setReceiveModal(true);
              setReceivingItem(row.original);
            }}
            disabled={row.original.availableAmount <= 0}
          >
            <CsLineIcons icon="plus" /> <span>{f({ id: 'receiving.list.receive' })}</span>
          </Button>{' '}
          <Button
            variant="outline-alternate"
            className="btn-icon btn-icon-start position-md-absolute  top-md-100 mt-md-4"
            style={{ minWidth: 140 }}
            onClick={() => {
              setHistoryModal(true);
              setReceivingItem(row.original);
            }}
          >
            <CsLineIcons icon="info-hexagon" /> <span>{f({ id: 'receiving.list.history' })}</span>
          </Button>
        </>
      ),
    },
  ];
};
