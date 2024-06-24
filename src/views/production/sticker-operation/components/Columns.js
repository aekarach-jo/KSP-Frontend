import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Form, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import LovAmountControl from 'components/lov-select/LovAmountControl';
import { NAVIGATION } from '../constants';

const handleRowClick = (row) => {
  // Redirect to the link when the row is clicked
  window.location.href = `${NAVIGATION.CUSTOMER_ORDER_DETAIL}/${row.original.id}`;
};
export const getColumn = (f, fd, setIsConfirmModal, setStickerObj, setStickerAmount, setGlobalIndex, arryRef, setIsStickerSave) => {
  return [
    {
      Header: f({ id: 'operator.field.lot' }),
      accessor: 'productionOrderNo',
      sortable: true,
      headerClassName: 'w-20',
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: f({ id: 'product.field.productName' }),
      accessor: 'productName',
      sortable: true,
      headerClassName: 'w-20',
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: f({ id: 'salesOrder.field.customerName' }),
      accessor: 'customerName',
      sortable: true,
      headerClassName: 'w-10',
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: f({ id: 'sticker.field.amount' }),
      accessor: 'producedAmount',
      sortable: true,
      headerClassName: 'w-10',
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: f({ id: 'sticker.field.printQty' }),
      accessor: 'stickerPrintAmount',
      sortable: true,
      headerClassName: 'w-10',
      Cell: ({ cell, row }) => {
        const { value } = cell;
        const rowIndex = row.index;
        if (!arryRef.current[rowIndex]) {
          arryRef.current[rowIndex] = React.createRef();
        }
        return (
          <div style={{ textAlign: 'right', cursor: 'pointer' }}>
            <LovAmountControl
              name="stickerPrintAmount"
              ref={arryRef.current[rowIndex]}
              value={value}
              onChange={(e) => {
                setGlobalIndex(rowIndex);
                setStickerAmount(e.target.value);
                setStickerObj((prevStickerObj) => {
                  return {
                    ...prevStickerObj,
                    [rowIndex]: {
                      ...prevStickerObj[rowIndex],
                      productionOrder: row.original.productionOrderId,
                      stickerPrintAmount: e.target.value,
                    },
                  };
                });
              }}
            />
          </div>
        );
      },
    },

    {
      Header: f({ id: 'receiving.list.receivingBy' }),
      accessor: 'stickerPrintReceivedBy',
      sortable: true,
      headerClassName: 'w-20 justify-content-end text-end',
      Cell: ({ cell, row }) => {
        const rowIndex = row.index;
        // const [flags, setFlags] = useState(row.original.stickerPrintReceivedBy);
        const { value, onChange } = cell;
        return (
          <div style={{ textAlign: 'right', cursor: 'pointer' }}>
            <LovEmployeeSelect
              name="stickerPrintReceivedBy"
              value={value}
              isDisabled={row.original?.stickerPrintStatus === 'STICKER RECEIVED'}
              onChange={(e) => {
                setGlobalIndex(rowIndex);
                setStickerObj((prevStickerObj) => {
                  return {
                    ...prevStickerObj,
                    [rowIndex]: {
                      ...prevStickerObj[rowIndex],
                      productionOrder: row.original.productionOrderId,
                      stickerPrintReceivedBy: e.value,
                    },
                  };
                });
              }}
            />
          </div>
        );
      },
    },
    {
      Header: f({ id: 'customerOrder.field.status' }),
      accessor: 'stickerPrintStatus',
      sortable: true,
      headerClassName: 'w-10',
      Cell: ({ cell }) => cell.value || '-',
    },
    {
      Header: f({ id: 'production.group.field.action' }),
      id: 'confirm',
      headerClassName: 'empty w-10',
      Cell: ({ row }) => {
        const { checked, onChange } = row.getRowProps();
        const rowIndex = row.index;
        return (
          <div className="text-center d-flex gap-1">
            {/* <ReactToPrint
              trigger={() => {
               
                return ( */}
            <Button
              variant="outline-success"
              className="btn-icon btn-icon-only btn-sm"
              // disabled={stickerObj[rowIndex]?.stickerPrintAmount <= 0 || stickerObj[rowIndex]?.stickerPrintAmount === undefined}
              // onClick={() => setReceiveModal(true)}
              onClick={() => {
                setGlobalIndex(rowIndex);
                setStickerObj((prevStickerObj) => {
                  return {
                    ...prevStickerObj,
                    [rowIndex]: {
                      ...prevStickerObj[rowIndex],
                      stickerPrintStatus:
                        row.original.stickerPrintStatus !== 'PRINTED' && row.original.stickerPrintStatus !== 'STICKER RECEIVED'
                          ? 'NEW'
                          : row.original.stickerPrintStatus,
                    },
                  };
                });
                setIsStickerSave(true);
              }}
            >
              <span className="text-center">
                <CsLineIcons icon="edit" />
              </span>
            </Button>
            {/* );
              }}
              content={() => componentRef.current}
            />{' '} */}
            <Button
              variant="primary"
              className="btn-icon btn-icon-only btn-sm"
              // disabled={isLoading}
              onClick={() => {
                setGlobalIndex(rowIndex);
                setStickerObj((prevStickerObj) => {
                  return {
                    ...prevStickerObj,
                    [rowIndex]: {
                      ...prevStickerObj[rowIndex],
                      stickerPrintStatus: row.original.stickerPrintReceivedBy === undefined ? 'PRINTED' : 'STICKER RECEIVED',
                    },
                  };
                });
                setIsConfirmModal(true);
              }}
            >
              <span className="text-center">
                <CsLineIcons icon="print" />
              </span>
            </Button>
            {/* <Button
            variant="primary"
            className="btn-icon btn-icon-only btn-sm"
            // disabled={isLoading}
            // onClick={() => setReceiveModal(true)}
            // onClick={() => buttons?.export?.onSubmit()}
            onClick={() => setIsConfirmModal(true)}
          >
            <span className="text-center">
              <CsLineIcons icon="print" />
            </span>
          </Button> */}
          </div>
        );
      },
    },
  ];
};

// If you have the following style applied to your rows, you can apply the same to your new page:
// <div style={{ cursor: 'pointer' }}>
//    ... your table component ...
// </div>
