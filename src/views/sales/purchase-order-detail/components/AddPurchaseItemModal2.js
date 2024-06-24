import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useQuery, useQueryClient } from 'react-query';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import useQuotationLovData from 'hooks/api/master/lov/useQuotationLov';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DropdownPageSize from 'components/dropdown-page-size';
import { toast } from 'react-toastify';
import Table from 'views/sales/components/table/Table';
import { request } from 'utils/axios-utils';
import { useFormik } from 'formik';
import Select from 'react-select';
import useConvert from 'hooks/useConvert';

import { QUERY } from '../constants';

const initialOptions = [
  { value: 'PI', label: 'Purchase Item' },
  { value: 'MAT', label: 'Material' },
];

const searchRmFn =
  ({ filter, page = 0, limit = 5, supplierId, sortBy = {}, typePo }) =>
  async () => {
    const { type, ...rest } = filter;
    let response = null;
    if (typePo === '01' || typePo === '02') {
      if (type?.value === 'PI') {
        const inventory = await request({ url: `/inventory/material/find?isSupplier=true` });
        response = await request({
          url: `/purchaseItem/find`,
          params: {
            ...rest,
            ...sortBy,
            page: page + 1,
            limit,
            supplierId,
            status: 'NEW',
            isAvailable: true,
          },
        });
        response.data.data.forEach((itemRm) => {
          itemRm.weight = itemRm?.netWeight;
          inventory.data.data.forEach((itemInven) => {
            if (itemInven.materialId === itemRm.materialId) {
              itemRm.inventoryAmount = itemInven.amount;
            }
          });
        });
        console.log(response.data.data);
        // response.data = filterArr;
      } else {
        const rm = await request({
          url: `/masterData/material/find?typeMulti=RM,RMU&subtype=03`,
          params: { page: page + 1, limit: 5, supplierId, ...rest, ...sortBy },
        });
        const inventory = await request({ url: `/inventory/material/find?isSupplier=true` });
        rm.data.data.forEach((itemRm) => {
          itemRm.weight = itemRm?.netWeight;
          inventory.data.data.forEach((itemInven) => {
            if (itemInven.materialId === itemRm.id) {
              itemRm.inventoryAmount = itemInven.amount;
            }
          });
        });
        // console.log(rm.data.data);
        response = rm;
      }
    }

    if (typePo === '03') {
      if (type.value === 'PI') {
        const inventory = await request({ url: `/inventory/material/find` });
        response = await request({
          url: `/purchaseItem/find`,
          params: {
            ...rest,
            ...sortBy,
            page: page + 1,
            limit,
            supplierId,
            status: 'NEW',
            isAvailable: true,
          },
        });
        response.data.data.forEach((itemRm) => {
          itemRm.weight = itemRm?.netWeight;
          inventory.data.data.forEach((itemInven) => {
            if (itemInven.materialId === itemRm.materialId) {
              itemRm.inventoryAmount = itemInven.amount;
            }
          });
        });
      } else {
        const rm = await request({
          url: `/masterData/material/find?typeMulti=RM,RMU&subtype=03`,
          params: { page: page + 1, limit: 5, supplierId, ...rest, ...sortBy },
        });
        const inventory = await request({ url: `/inventory/material/find` });
        rm.data.data.forEach((itemRm) => {
          itemRm.weight = itemRm?.netWeight;
          inventory.data.data.forEach((itemInven) => {
            // console.log(itemInven.materialId === itemRm.id);
            if (itemInven.materialId === itemRm.id) {
              itemRm.inventoryAmount = itemInven.amount;
            }
          });
        });
        // console.log(rm.data.data);
        response = rm;
      }
    }

    if (typePo === '04') {
      const rm = await request({ url: `/masterData/material/find?type=OTHERS&subtype=03`, params: { page: page + 1, limit: 5 } });
      const inventory = await request({ url: `/inventory/material/find` });
      rm.data.data.forEach((itemRm) => {
        itemRm.weight = itemRm?.netWeight;
        inventory.data.data.forEach((itemInven) => {
          if (itemInven.materialId === itemRm.id) {
            itemRm.inventoryAmount = itemInven.amount;
          }
        });
      });
      response = rm;
    }

    response?.data.data.forEach((data) => {
      if (data?.inventoryAmount === undefined) {
        data.inventoryAmount = 0;
      }
    });
    // console.log(response?.data.data);
    // response?.data.data.filter((item) => !item.name.includes('(หัวกระดาษ)'));
    // response?.data.data.forEach((item) => {
    //   item.name = item.name.replace(/\s*\([^)]*\)\s*/, ''); // เอาคำว่า  (หัวกระดาษ) ออก
    // });
    return response?.data;
  };

const searchRmFnByTypePo =
  ({ filter, page = 0, limit = 5, supplierId, sortBy = {}, typePo }) =>
  async () => {
    const { type, ...rest } = filter;
    let response = null;
    response = await request({ url: `/purchaseItem/findStockSupplier`, params: { ...rest, page: page + 1, limit: 5 } });
    // response?.data?.data.filter(v => v.availableAmount === 0)
    // response.data.data = response?.data?.data?.filter((item) => item.availableAmount !== 0);

    return response?.data;
  };

const RmFilterForm = ({ formik, ...props }) => {
  const { formatMessage: f } = useIntl();
  const { useConvertCurrency } = useConvert();
  const { handleSubmit, handleChange, handleReset, values } = formik;

  const handleChangeType = (value) => {
    handleChange({ target: { id: 'type', value } });
  };

  const onReset = (e) => {
    // handleReset(e);
    handleChange({ target: { id: 'code', value: null } });
    handleChange({ target: { id: 'name', value: null } });
    props.onReset?.();
  };

  useEffect(() => {
    if (props.typePo === '01' || props.typePo === '04') {
      handleChange({ target: { id: 'type', value: initialOptions[1] } });
    } else {
      handleChange({ target: { id: 'type', value: initialOptions[0] } });
    }
    handleSubmit();
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col xs={3} className="mb-3">
          <Form.Group controlId="type">
            <Form.Label>{f({ id: 'purchaseOrder.detail.purchaseItem.modal.type' })}</Form.Label>
            <Select
              classNamePrefix="react-select"
              options={initialOptions}
              value={values.type}
              onChange={handleChangeType}
              isDisabled={props.typePo !== '03' && props.typePo !== '02'}
            />
          </Form.Group>
        </Col>
        <Col xs={3} className="mb-3">
          <Form.Group controlId="code">
            <Form.Label>{f({ id: 'purchaseItem.field.code' })}</Form.Label>
            <Form.Control type="text" name="code" value={values.code || ''} onChange={handleChange} />
          </Form.Group>
        </Col>
        <Col xs={6} className="mb-3">
          <Form.Group controlId="name">
            <Form.Label>{f({ id: 'purchaseItem.field.name' })}</Form.Label>
            <Form.Control type="text" name="name" value={values.name || ''} onChange={handleChange} />
          </Form.Group>
        </Col>
        <div className="mt-3" style={{ textAlign: 'center' }}>
          <Button type="submit" variant="primary">
            {f({ id: 'common.search' })}
          </Button>{' '}
          <Button variant="light" onClick={onReset}>
            {f({ id: 'common.reset' })}
          </Button>
        </div>
      </Row>
    </Form>
  );
};

const AddPurchaseItemModal = ({ show, list, onHide, onAdd, onRemove, supplierId, typePo }) => {
  const queryClient = useQueryClient();
  const { formatMessage: f } = useIntl();
  const { useConvertCurrency } = useConvert();
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const { detail: itemList = [] } = queryClient.getQueryData(QUERY.PURCHASE_ORDER);
  const { useUOMLov } = useQuotationLovData();
  const { data } = useUOMLov({ isGroup: true });

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: f({ id: 'purchaseOrder.field.Materialno' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'text-uppercase w-20',
        Cell: ({ cell }) => {
          return <>{cell?.value || cell.row.original.materialName || '-'}</>;
        },
      },
      {
        Header: f({ id: 'purchaseOrder.field.lot' }),
        accessor: 'productionNo',
        sortable: true,
        headerClassName: 'text-uppercase w-20',
        Cell: ({ cell }) => {
          return <>{cell?.value || cell.row.original.productionNo || '-'}</>;
        },
      },
      {
        Header: f({ id: 'purchaseOrder.field.materialName' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-uppercase w-40',
        Cell: ({ cell }) => {
          return <>{cell?.value || cell.row.original.materialName || '-'}</>;
        },
      },
      {
        Header: f({ id: 'purchaseOrder.field.available' }),
        accessor: 'amount',
        sortable: true,
        headerClassName: 'text-uppercase w-20',
        Cell: ({ cell }) => {
          if (cell?.value === undefined) {
            cell.value =
              Number(cell?.value) || Number(cell.row.original.availableAmount).toFixed(configDecimal) === 'NaN'
                ? 'ไม่พบข้อมูล'
                : Number(cell?.value) || Number(cell.row.original.availableAmount).toFixed(configDecimal);
          }

          return <>{cell.value}</>;
        },
      },
      {
        Header: f({ id: 'purchaseOrder.field.onStock' }),
        accessor: 'inventoryAmount',
        sortable: true,
        headerClassName: 'text-uppercase w-20 ',
        Cell: ({ cell }) => {
          if (cell.value === undefined) {
            cell.value = Number(cell.row.original.totalAmount || 0) === 0 ? 'ไม่พบข้อมูล' : Number(cell.row.original.totalAmount);
          }
          return (
            <>
              {cell.value === 'ไม่พบข้อมูล' ? cell.value : useConvertCurrency(cell.value)}
              {/* {cell.row.original.materialBaseUO || cell.row.original.unit} */}
            </>
          );
        },
      },
      // {
      //   Header: f({ id: 'purchaseOrder.field.unit' }),
      //   accessor: 'unit',
      //   sortable: true,
      //   headerClassName: 'text-uppercase w-10',
      //   Cell: ({ cell }) => <>{cell?.value || cell.row.original.materialBaseUOM || '-'}</>,
      // },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty text-uppercase w-10',
        Cell: ({ row, addOrRemoveRm }) => {
          let isExisted = false;
          if (row.original.typePo !== '02') {
            isExisted = list?.some((item) => item?.id === row.values.id);
          } else {
            isExisted = list?.some((item) => item?.materialId === row.original.materialId);
          }

          return (
            <Button
              className="btn-icon btn-icon-only hover-outline active-scale-down"
              variant={isExisted ? 'outline-success' : 'outline-primary'}
              onClick={() => addOrRemoveRm(row, itemList.length)}
            >
              {isExisted ? <CsLineIcons icon="check" /> : <CsLineIcons icon="plus" />}
            </Button>
          );
        },
      },
    ];
  }, [f, list]);

  const [filter, setFilter] = useState({});
  const [result, setResult] = useState([]);
  const [pageCount, setPageCount] = useState(1);

  const handleFilterFormSearch = async (_filter) => {
    // eslint-disable-next-line no-use-before-define
    gotoPage(0);
    setFilter(_filter);
  };
  const formik = useFormik({ initialValues: { type: '', code: '', name: '' }, onSubmit: handleFilterFormSearch });
  const {
    values: { type },
  } = formik;

  const addOrRemoveRm = (rm, itemIndex) => {
    let isExisted = false;
    if (typePo !== '02') {
      isExisted = list?.some((item) => item?.id === rm.values.id);
    } else {
      isExisted = list?.some((item) => item.index === rm.index);
    }
    console.log(isExisted);
    if (isExisted) {
      if (typePo !== '02') {
        onRemove?.(rm.values.id, typePo);
      } else {
        onRemove?.(rm.index, typePo);
      }
    } else {
      const id = {};
      const amount = rm.original.availableAmount !== undefined ? rm.original.availableAmount : 1;
      if (type.value === 'PI') {
        id.purchaseItem = rm.original.id;
      } else {
        id.material = rm.original.id;
      }
      if (filter.type.value === 'MAT') {
        const findBaseUom = data.MATERIAL_BASEUOM.find((baseUom) => baseUom?.code === rm.original?.baseUOM);
        rm.original.unit = findBaseUom?.name;
      }
      rm.original.weight = rm.original?.netWeight || rm.original?.materialNetWeight;
      rm.original.price = rm.original?.costPrice || rm.original?.materialSellingPrice;

      console.log({ ...rm.original, ...id, amount, type: type.value, index: rm.index, item: itemIndex });
      console.log(rm);
      if (typePo === '02') {
        if (rm?.original?.inventoryAmount === 0) {
          toast.error('ไม่พบคลังผู้จำหน่าย');
        } else {
          onAdd?.({ ...rm.original, ...id, amount, type: type.value, index: rm.index, item: itemIndex });
        }
      } else {
        onAdd?.({ ...rm.original, ...id, amount, type: type.value, index: rm.index, item: itemIndex });
      }
    }
  };

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      addOrRemoveRm,
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    setPageSize,
    gotoPage,
    state: { pageIndex, pageSize, sortBy },
  } = tableInstance;

  useEffect(() => {
    setPageSize(5);
  }, [show]);

  const sortByFromTable = ([field]) => {
    if (!field) {
      return {};
    }

    return {
      sortField: field.id,
      sortDirection: field.desc ? 'desc' : 'asc',
    };
  };

  const { isFetching, refetch } = useQuery(
    [QUERY.FIND_PURCHASE_ITEM, filter, pageIndex, pageSize, sortBy, typePo, supplierId],
    searchRmFn({ filter, page: pageIndex, limit: pageSize, sortBy: sortByFromTable(sortBy), type, supplierId, typePo }),
    {
      enabled: !!show,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { pagination = {} } = resp;
        setPageCount(pagination?.totalPage || 0);
        // setTotal(pagination.total);
        setResult(resp?.data);
      },
      onError(err) {
        console.error('Search Error:', err);
      },
    }
  );

  const handlefilterFormReset = () => {
    gotoPage(0);
    // setFilter({});
    refetch();
  };

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
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: 'purchaseOrder.detail.purchaseItem.modal.add' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col>
            <Card body>
              <RmFilterForm formik={formik} onReset={handlefilterFormReset} onHide={onHide} typePo={typePo} />
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs="12">
            <Card>
              <Card.Body className="half-padding">
                <Table tableInstance={tableInstance} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} hideControlSearch />
              </Card.Body>
            </Card>
          </Col>
          <Col xs="12">{/* <TablePagination tableInstance={tableInstance} /> */}</Col>
        </Row>
      </Modal.Body>
      {/* <Modal.Footer>
      </Modal.Footer> */}
    </Modal>
  );
};

export default AddPurchaseItemModal;
