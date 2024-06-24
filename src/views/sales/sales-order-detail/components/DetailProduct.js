import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { Button, Form } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import NumberFormat from 'react-number-format';

import Table from 'components/table/Table';

// import AddProductModal from './AddProductModal';
import AddProductModal from './AddProductModal2';
import './styleTable.css';

const DetailProduct = ({
  form,
  data: queryData,
  modal,
  setModal,
  isEdit,
  setIsEdit,
  editData,
  handleSave,
  setIsDeleteRow,
  isEditMode,
  setDisableSubmit,
  discountState,
  setDiscountState,
  setSyncState,
  setSyncFlagState,
}) => {
  const { formatMessage: f } = useIntl();
  const discountInputRef = useRef(null);
  const discountArray = useRef([]);
  const queryClient = useQueryClient();
  const [data, setData] = useState(queryData?.detail || []);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [test, setTest] = useState([]);
  // const [dataNo, setDataNo] = useState(queryData || []);
  const { handleSubmit, handleChange, resetForm, values, errors, isValid } = form;
  const handleOnAdd = (value) => {
    if (isEdit) {
      setIsEdit(false);
      data.splice(editData.index, 1, value);
      return;
    }
    const detail = [...data, value];
    // const no = [...dataNo, value]
    // setDataNo(no)
    setData(detail);
    queryClient.setQueryData('salesOrder', (currentData) => {
      return {
        ...currentData,
        detail,
      };
    });
  };

  // const handleOnEdit = (index, value) => {
  //   setIsEdit(true);
  //   setModal(true);
  //   setEditData({
  //     index,
  //     value,
  //   });
  // };

  const handleOnRemove = (val) => {
    const detail = data.filter((item) => item.id !== val.id);
    setData(detail);
    queryClient.setQueryData('salesOrder', (currentData) => {
      return {
        ...currentData,
        detail,
      };
    });
    setIsDeleteRow(true);
    // handleSave();
  };
  useEffect(() => {
    if (discountArray.current[globalIndex] && discountArray.current[globalIndex].current) {
      // handleChange({ target: { id: `detail.${globalIndex}.discount`, value: discountState[globalIndex] } });
      discountArray.current[globalIndex].current.focus();
    }
  }, [discountState]);
  const columns = useMemo(() => [
    {
      Header: '',
      accessor: 'isFlagSync',
      headerClassName: 'empty w-10',
      Cell: ({ cell, row }) => {
        const rowIndex = row.index;
        const { checked, onChange } = row.getRowProps();
        const [isActive, setIsActive] = useState(cell.value);
        return (
          <Form.Check
            // disabled={row.original.status !== 'SUBMITTED'}
            disabled={!isEditMode}
            className="form-check float-end mt-1"
            type="checkbox"
            checked={isActive}
            onClick={(v) => {
              // setSyncState(v.target.checked);
              // setSyncFlagState(row.original.id);
              setIsActive(v.target.checked);
            }}
          />
        );
      },
    },
    {
      Header: f({ id: 'product.code' }),
      accessor: 'code',
      sortable: true,
      headerClassName: 'legacy-text w-15',
      cellClassName: 'text-alternate custom-padding',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'customerOrder.detail.orderNo' }),
      accessor: 'no',
      sortable: true,
      headerClassName: 'legacy-text w-15',
      cellClassName: 'text-alternate custom-padding',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'product.name' }),
      accessor: 'name',
      sortable: true,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text w-15',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'salesOrder.field.reference' }),
      accessor: 'reference',
      sortable: true,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text w-10 text-center',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'salesOrder.field.amount' }),
      accessor: 'amount',
      sortable: false,
      headerClassName: 'legacy-text w-10 text-center custom-padding',
      cellClassName: 'text-center',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'salesOrder.field.unit' }),
      accessor: 'unit',
      sortable: false,
      headerClassName: 'custom-padding legacy-text w-10 text-center',
      cellClassName: 'text-center',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'salesOrder.field.price' }),
      accessor: 'price',
      sortable: true,
      headerClassName: 'legacy-text w-10 custom-padding',
      cellClassName: 'text-center',
      Cell: ({ cell }) => {
        return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
      },
    },
    {
      Header: f({ id: 'salesOrder.field.discount' }),
      accessor: 'discount',
      sortable: false,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text w-10 custom-padding',
      Cell: ({ cell }) => {
        const index = values.detail
          ?.slice()
          .reverse()
          .findIndex((i) => i.id === cell.row.original.id);
        // const index = values.detail?.findIndex((i) => i.id === cell.row.original.id);
        if (!discountArray.current[index]) {
          discountArray.current[index] = React.createRef();
        }
        return (
          <div className="w-80">
            <Form.Control
              allowNegative={false}
              disabled={!isEditMode}
              ref={discountArray.current[index]}
              name={`values.detail.${index}.discount`}
              value={discountState[index]?.discount}
              onChange={(event) => {
                const { value } = event.target;
                let numericValue = 0;
                if (/^[0-9.]+$/.test(value.trim())) {
                  numericValue = parseFloat(value);
                } else if (value === '' || value === ' ') {
                  numericValue = 0;
                }
                const newDiscountState = [...discountState];
                newDiscountState[index] = {
                  id: cell.row.original.id,
                  product: cell.row.original.product,
                  discount: numericValue,
                  amount: cell.row.original.amount,
                  netPrice: (cell.row.original.amount * cell.row.original.price - numericValue).toFixed(2),
                };
                setGlobalIndex(index);
                setDiscountState(newDiscountState);
              }}
            />
          </div>
        );
      },
    },
    {
      Header: f({ id: 'customerOrder.field.total' }),
      accessor: 'total',
      sortable: false,
      cellClassName: 'custom-padding',
      headerClassName: 'legacy-text w-10',
      Cell: ({ cell, row }) => {
        return (
          <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>
            {row?.values?.amount && row?.values?.price ? (row.values.amount * row.values.price).toFixed(2) : '-'}
          </span>
        );
      },
    },
    {
      Header: f({ id: 'customerOrder.field.netPrice' }),
      accessor: 'netPrice',
      sortable: false,
      headerClassName: 'legacy-text w-10',
      Cell: ({ cell, row }) => {
        const index = values.detail
          ?.slice()
          .reverse()
          .findIndex((i) => i.id === cell.row.original.id);
        return (
          <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>
            {row?.values?.amount && row?.values?.price && discountState[index]?.discount
              ? (row.values.amount * row.values.price - discountState[index]?.discount).toFixed(2)
              : '-'}
          </span>
        );
      },
    },
    {
      Header: '',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div style={{ padding: '0 5px' }}>
          <Button
            disabled={!isEditMode}
            variant="outline-danger"
            size="sm"
            className="btn-icon btn-icon-only mb-1"
            onClick={() => handleOnRemove(row.original)}
          >
            <CsLineIcons icon="bin" />
          </Button>
        </div>
      ),
    },
  ]);

  useEffect(() => {
    if (queryData?.detail) {
      queryData.detail.customerCode = queryData.no;
      setData(queryData?.detail);
    } else {
      setData([]);
    }
  }, [queryData]);
  return (
    <>
      <Table columns={columns} data={data} setData={setData} hideSelectAll hideControl hidePageSize showTotal />
      {/* <AddProductModal isEdit={isEdit} modal={modal} setModal={setModal} onAdd={handleOnAdd} editData={editData?.value} data={queryData} /> */}
      <AddProductModal
        show={modal}
        onHide={setModal}
        list={data}
        data={queryData}
        onAdd={handleOnAdd}
        onRemove={handleOnRemove}
        setDisableSubmit={setDisableSubmit}
      />
    </>
  );
};

export default DetailProduct;
