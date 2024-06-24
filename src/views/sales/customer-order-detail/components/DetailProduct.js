import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { Button } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import Table from 'components/table/Table';

import AddProductModal from './AddProductModal';
import './styleTable.css';

const DetailProduct = ({ data: queryData, modal, setModal, isEdit, setIsEdit, editData, setEditData, modalData: data, setModalData: setData, isEditMode }) => {
  const { formatMessage: f } = useIntl();
  const queryClient = useQueryClient();

  // const [data, setData] = useState(queryData?.detail || []);

  const handleOnAdd = (value) => {
    if (isEdit) {
      setIsEdit(false);
      data.splice(editData.index, 1, value);
      return;
    }
    const detail = [...data, value];
    setData(detail);
    queryClient.setQueryData('customerOrder', (currentData) => {
      return {
        ...currentData,
        detail,
      };
    });
  };

  const handleOnEdit = (index, value) => {
    setIsEdit(true);
    setModal(true);
    setEditData({
      index,
      value,
    });
  };

  const handleOnRemove = (currentIndex) => {
    const detail = data.filter((x, index) => index !== currentIndex);
    setData(detail);
    queryClient.setQueryData('customerOrder', (currentData) => {
      return {
        ...currentData,
        detail,
      };
    });
  };
  const columns = [
    {
      Header: f({ id: 'customerOrder.field.productName' }),
      accessor: 'productName',
      sortable: true,
      cellClassName: 'custom-padding',
      headerClassName: `legacy-text w-40`,
      Cell: ({ row }) => {
        return (
          <a
            className="list-item-heading body"
            href="#!"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            {row?.original?.product?.name || '-'}
          </a>
        );
      },
    },
    {
      Header: f({ id: 'customerOrder.field.reference' }),
      accessor: 'reference',
      sortable: true,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text  w-20',
      Cell: ({ cell }) => <>{cell?.value || '-'}</>,
    },
    {
      Header: f({ id: 'customerOrder.field.amount' }),
      accessor: 'amount',
      sortable: false,
      cellClassName: 'text-center',
      headerClassName: 'legacy-text text-center  w-10',
    },
    {
      Header: f({ id: 'customerOrder.field.unit' }),
      accessor: 'unit',
      sortable: false,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text  w-10',
      Cell: ({ cell }) => <>{cell?.value || 'ชิ้น'}</>,
    },
    {
      Header: f({ id: 'customerOrder.field.price' }),
      accessor: 'price',
      sortable: true,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text  w-10',
      Cell: ({ cell }) => <>{cell?.value || '-'}</>,
    },
    {
      Header: f({ id: 'customerOrder.field.total' }),
      accessor: 'total',
      sortable: false,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text  w-10',
      Cell: ({ row }) => {
        let total = row.values.amount * row.values.price;
        if (row.values.discount !== undefined) {
          total = row.values.amount * row.values.price - row.values.discount;
        }
        total = total.toFixed(2);
        return <>{row?.values?.amount && row?.values?.price ? total : '-'}</>;
      },
    },
    {
      Header: f({ id: 'customerOrder.field.dueDate' }),
      accessor: 'deliverDt',
      sortable: false,
      headerClassName: 'legacy-text w-10',
      Cell: ({ cell }) => {
        const formatDate = (dateString) => {
          if (!dateString) return '-';
          const date = new Date(dateString);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = (date.getFullYear() + 543).toString();
          return `${day}/${month}/${year}`;
        };

        return <>{formatDate(cell?.value)}</>;
      },
    },
    {
      Header: '',
      accessor: 'actions',
      headerClassName: 'legacy-text w-0',
      Cell: ({ cell, row }) => (
        <div style={{ padding: '0 5px' }}>
          <Button
            disabled={!isEditMode}
            variant="outline-info"
            size="sm"
            className="btn-icon btn-icon-only mb-1"
            onClick={() => handleOnEdit(cell.row.index, row.original)}
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
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (queryData?.detail) {
      setData(queryData?.detail);
    } else {
      setData([]);
    }
  }, [queryData]);

  return (
    <>
      <Table columns={columns} data={data} setData={setData} hideSelectAll hideControl hidePageSize showTotal />
      <AddProductModal
        isEdit={isEdit}
        modal={modal}
        setModal={setModal}
        onAdd={handleOnAdd}
        editData={editData?.value}
        customerId={queryData?.customerId}
        productId={queryData?.productId}
      />
    </>
  );
};

export default DetailProduct;
