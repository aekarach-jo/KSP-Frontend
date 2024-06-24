import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { Button, Form } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useConvert from 'hooks/useConvert';

import Table from 'components/table/Table';

// import AddProductModal from './AddPurchaseItemModal';

import { QUERY } from '../constants';

const DetailPurchaseItem = ({ isEditMode, typePo }) => {
  const queryClient = useQueryClient();
  const { formatMessage: f } = useIntl();
  const { detail: list } = queryClient.getQueryData(QUERY.PURCHASE_ORDER);
  const { useConvertCurrency } = useConvert();

  // console.log(list);

  const handleOnRemove = (currentIndex) => {
    queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
      const detail = currentData.detail.filter((x, index) => index !== currentIndex);
      return {
        ...currentData,
        detail,
      };
    });
  };

  const columns = [
    {
      Header: f({ id: 'purchaseOrder.field.no' }),
      accessor: 'code',
      sortable: false,
      headerClassName: ' text-uppercase w-10',
      cellClassName: 'text-alternate',
      Cell: ({ cell }) => {
        return <>{cell?.value || cell.row.original.materialCode || '-'}</>;
      },
    },
    {
      Header: f({ id: 'purchaseOrder.field.materialName' }),
      accessor: 'name',
      sortable: false,
      headerClassName: ' text-uppercase w-20',
      Cell: ({ cell }) => {
        return <>{cell?.value || cell.row.original.materialName || '-'}</>;
      },
    },
    {
      Header: f({ id: 'purchaseOrder.field.weight' }),
      accessor: 'weight',
      sortable: true,
      headerClassName: ' text-uppercase w-10',
      Cell: ({ cell, row }) => {
        if (row.original.weighingUOM === 'กรัม') {
          cell.value *= row.original.amount / 1000;
        } else {
          cell.value *= row.original.amount;
        }

        cell.value =
          Number(cell?.value).toFixed(localStorage.getItem('ConfigDecimal')) === 'NaN'
            ? 'ไม่พบข้อมูล'
            : Number(cell?.value).toFixed(localStorage.getItem('ConfigDecimal'));

        return <>{useConvertCurrency(cell.value)}</>;
      },
    },
    {
      Header: f({ id: 'purchaseOrder.field.priceUnit' }),
      accessor: 'price',
      sortable: true,
      headerClassName: ' text-uppercase w-10',
      Cell: ({ cell, row }) =>
        useConvertCurrency(Number(cell?.value || 0) * Number(row.original?.amount || 0)) || useConvertCurrency(Number(cell.original?.availableAmount || 0)),
    },

    {
      Header: f({ id: 'purchaseOrder.field.onStock' }),
      accessor: 'inventoryAmount',
      sortable: false,
      headerClassName: ' text-uppercase w-10',
      Cell: ({ cell }) => {
        return <>{useConvertCurrency(Number(cell.value)) || 0}</>;
      },
    },
    {
      Header: f({ id: 'purchaseOrder.field.quantity' }),
      accessor: 'amount',
      sortable: false,
      headerClassName: ' text-uppercase w-10',
      Cell: ({ cell, row }) => {
        // console.log(row);
        const filterMaterial = list.filter((data) => data?.materialId === row?.original?.materialId);
        const totalAmount = filterMaterial.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.amount;
        }, 0);
        // console.log(totalAmount);
        return (
          <Form.Control
            type="number"
            name="amount"
            min={0}
            max={row.original.availableAmount}
            disabled={!isEditMode}
            isInvalid={
              (row.original.amountToChack > row.original.inventoryAmount || totalAmount > row.original.inventoryAmount) &&
              row.original.inventoryAmount !== 0 &&
              typePo === '02'
            }
            defaultValue={useConvertCurrency(cell.value)}
            onChange={(e) => {
              if (typePo === '02') {
                if (row.original.inventoryAmount === 0) {
                  cell.row.original.amount = Number(e.target.value);
                }
                if (Number(e.target.value) <= row.original.inventoryAmount) {
                  cell.row.original.amount = Number(e.target.value);
                  cell.row.original.amountToChack = Number(e.target.value);
                } else {
                  cell.row.original.amountToChack = Number(e.target.value);
                }
              } else {
                cell.row.original.amount = Number(e.target.value);
              }
            }}
          />
        );
      },
    },
    {
      Header: f({ id: 'purchaseOrder.field.unit' }),
      accessor: 'unit',
      sortable: false,
      headerClassName: ' text-uppercase w-10 text-center',
      Cell: ({ cell }) => <div style={{ textAlign: 'center' }}>{cell?.value || cell.row.original.baseUOM || '-'}</div>,
    },
    {
      Header: f({ id: 'purchaseOrder.field.discountPercentage' }),
      accessor: 'discountPercentage',
      sortable: false,
      headerClassName: ' text-uppercase w-10',
      Cell: ({ cell, row }) => {
        const onChange = (e) => {
          queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
            console.log(currentData.detail);
            const currentDetail = currentData.detail.find((item) => item.id === row.original.id);
            currentDetail.discountPercentage = Number(e.target.value) || 0;
            return currentData;
          });
        };
        return (
          <Form.Control
            disabled={!isEditMode}
            type="number"
            name="discountPercentage"
            // autoFocus
            min={1}
            value={cell.value}
            onChange={onChange}
          />
        );
      },
    },
    {
      Header: '',
      accessor: 'actions',
      Cell: ({ cell, row }) => (
        <div style={{ padding: '0 5px' }}>
          {isEditMode && (
            <>
              <Button
                variant="outline-info"
                size="sm"
                className="btn-icon btn-icon-only mb-1"
                onClick={() => {
                  // console.log(row.original);
                  // if (row.original.amount <= row.original.inventoryAmount) {
                  queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
                    return currentData;
                  });
                  // }
                }}
              >
                <CsLineIcons icon="edit" />
              </Button>{' '}
              <Button
                disabled={!isEditMode}
                variant="outline-danger"
                size="sm"
                className="btn-icon btn-icon-only mb-1"
                onClick={() => handleOnRemove(cell.row.index)}
              >
                <CsLineIcons icon="bin" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
  const rowStyle = {
    height: '40px',
    border: '1px solid rgba(0, 0, 0, 0)',
    borderWidth: '1px 0',
    background: 'var(--foreground)',
  };

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  return (
    <>
      <Table
        columns={columns}
        data={list}
        sort={{ sortBy: 'item', desc: false }}
        hideSelectAll
        hideControl
        hidePageSize
        showTotal
        customStyle={customStyle}
        rowStyle={rowStyle}
      />
      {/* <AddProductModal
        isEdit={isEdit}
        modal={modal}
        setModal={setModal}
        onAdd={handleOnAdd}
        editData={editData?.value}
        setEditData={setEditData}
        poType={queryData?.type}
      /> */}
    </>
  );
};

export default DetailPurchaseItem;
