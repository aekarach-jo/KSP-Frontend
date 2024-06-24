import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useIntl } from 'react-intl';
import { Row, Col, Form, Card, Button, InputGroup } from 'react-bootstrap';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useFormik } from 'formik';
import { SERVICE_URL } from 'config';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import TableCard from 'views/sales/components/table/TableCardInventory';

import { API, QUERY } from './constants';
import { useAddReceivingItemInventory } from '../../receiving/components/FormMutation';
import TransferItemModal from './components/TransferItemModal';
import AdjustItemModal from './components/AdjustItemModal';

const getDefaultValues = () => ({
  productId: '',
  productCode: '',
  productName: '',
});

const getStockDetail = (id) => () =>
  request({ url: `${API.PRODUCT_DETAIL_SALE}&productId=${id}` })
    .then((res) => {
      return res.data.data;
    })
    .then((data) => ({
      ...getDefaultValues(),
      ...data,
    }));

const getProductDetail = (id) => () =>
  request({ url: `${API.PRODUCT_DETAIL}&productId=${id}` })
    .then((res) => {
      return res.data.data;
    })
    .then((data) => ({
      ...getDefaultValues(),
      ...data,
    }));

const callTransferItem = (data = {}) => request({ url: API.TRANSFER_ITEM, data, method: 'post' });

const callAdjustItem = (data = {}) => request({ url: API.ADJUST_ITEM_PRODUCT, data, method: 'post' });

const callReturnItem = (data = {}) => request({ url: API.RETURN_ITEM, data, method: 'post' });

const callTransformMaterial = (data = {}) => request({ url: API.TRANSFORM_ITEM, data, method: 'post' });

const InventoryProductDetail = (props) => {
  // console.debug('customer add props :', props);
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;
  const isSale = props?.location?.search;
  const [data, setData] = useState({});
  const [list, setList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const [transferItemModal, setTransferItemModal] = useState(false);
  const [transformItemModal, setTransformItemModal] = useState(false);
  const [transferItem, setTransferItem] = useState({});
  const [isTransfering, setIsTransfering] = useState(false);

  const [adjustItemModal, setAdjustItemModal] = useState(false);
  const [returnItemModal, setReturnItemModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState({});
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [listData, setListData] = useState([]);

  const queryClient = useQueryClient();

  const {
    data: initialValues,
    isFetching,
    error,
    refetch,
  } = useQuery([QUERY.INVENTORY_DETAIL], isSale ? getStockDetail(id) : getProductDetail(id), {
    enabled: !!id,
    initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
    onSuccess(res) {
      const resArray = Object.values(res);
      const filteredResArray = resArray.filter((value) => value !== '');
      setData(filteredResArray[0]);
      setList(filteredResArray);
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

  if (error) {
    console.error('error :', error);
  }

  const { formatMessage: f } = useIntl();
  const title = f({ id: `inventory.detail.titleProduct` }, { productName: data?.productName });
  const formik = useFormik({ initialValues, enableReinitialize: true });
  const { values, errors } = formik;
  const afterAddItem = () => {
    setIsReceiving(false);
    setReceiveModal(false);
  };
  const { mutate: addReceivingItemInventory } = useAddReceivingItemInventory({ afterAddItem });

  const columns = useMemo(() => {
    return [
      {
        Header: () => f({ id: 'inventory.stockNo' }),
        accessor: 'storeLocationCode',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-md-0 mt-4 ',
        headerClassName: ' text-medium text-uppercase',
        headerProps: { xs: 12, md: 3 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => f({ id: 'inventory.stockName' }),
        accessor: 'storeLocationName',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 mt-4 position-relative',
        headerClassName: ' text-medium text-uppercase',
        headerProps: { xs: 12, md: 9 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        id: 'action',
        accessor: 'supplier',
        colClassName: 'd-flex flex-column justify-content-end align-items-end mb-2 mt-2 position-relative',
        headerProps: { xs: 12, md: 12 },
        headerClassName: 'd-none',
        Cell: ({ column, cell }) => (
          <Col className="w-100">
            <Button
              variant="info"
              className="btn-icon btn-icon-start mb-1"
              style={{ minWidth: '24.5%' }}
              onClick={() => {
                setTransferItemModal(true);
                let bList = [];
                cell?.row?.original?.batchNoList?.forEach((v, index) => {
                  bList.push({ label: v.batchNo, value: v.id, availableAmount: v.availableAmount });
                });
                cell.row.original.batchList = bList;
                setTransferItem({
                  fromStoreLocation: cell?.row?.original?.storeLocationId,
                  storeLocationCode: cell?.row?.original?.storeLocationCode,
                  batchList: cell?.row?.original?.batchList,
                  materialStoreUnit: f({ id: 'inventory.item' }),
                });
                bList = [];
              }}
              // disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="destination" /> <span>{f({ id: 'inventory.detail.transfer' })}</span>
            </Button>{' '}
            <Button
              variant="success"
              className="btn-icon btn-icon-start mb-1 "
              style={{ minWidth: '24.5%' }}
              // disabled={isSale === '' || !isSale}
              onClick={() => {
                setAdjustItemModal(true);
                let bList = [];
                cell?.row?.original?.batchNoList?.forEach((v) => {
                  bList.push({ label: v.batchNo, value: v.id, availableAmount: v.availableAmount });
                });
                cell.row.original.batchList = bList;
                setAdjustItem({
                  productId: id,
                  storeLocationId: cell?.row?.original?.storeLocationId,
                  storeLocationCode: cell?.row?.original?.storeLocationCode,
                  batchList: cell?.row?.original?.batchList,
                  materialStoreUnit: f({ id: 'inventory.item' }),
                });
                bList = [];
              }}
            >
              <CsLineIcons icon="edit" /> <span>{f({ id: 'inventory.detail.adjust' })}</span>
            </Button>{' '}
            <Button
              variant="warning"
              className="btn-icon btn-icon-start mb-1"
              style={{ minWidth: '24.5%' }}
              disabled
              onClick={() => {
                setReturnItemModal(true);
                let bList = [];
                cell?.row?.original?.batchNoList?.forEach((v, index) => {
                  bList.push({ label: v.batchNo, value: v.id, availableAmount: v.availableAmount, receivingLog: v.receivingLog });
                });
                cell.row.original.batchList = bList;
                setAdjustItem({
                  productId: id,
                  storeLocationId: cell?.row?.original?.storeLocationId,
                  storeLocationCode: cell?.row?.original?.storeLocationCode,
                  batchList: cell?.row?.original?.batchList,
                  materialStoreUnit: f({ id: 'inventory.item' }),
                });
                bList = [];
              }}
            >
              <CsLineIcons icon="recycle" /> <span>{f({ id: 'inventory.detail.return' })}</span>
            </Button>{' '}
            <Button
              variant="danger"
              className="btn-icon btn-icon-start mb-1"
              style={{ minWidth: '24.5%' }}
              disabled
              onClick={() => {
                setTransformItemModal(true);
                let bList = [];
                cell?.row?.original?.batchNoList?.forEach((v, index) => {
                  bList.push({ label: v.batchNo, value: v.id, availableAmount: v.availableAmount });
                });
                cell.row.original.batchList = bList;
                setTransferItem({
                  fromStoreLocation: cell?.row?.original?.storeLocationId,
                  storeLocationCode: cell?.row?.original?.storeLocationCode,
                  batchList: cell?.row?.original?.batchList,
                  fromMaterialId: cell?.row?.original?.materialId,
                  materialStoreUnit: f({ id: 'inventory.item' }),
                });
                bList = [];
              }}
              // disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="record" /> <span>{f({ id: 'inventory.detail.transform.title' })}</span>
            </Button>
          </Col>
        ),
      },
      {
        // Header: () => f({ id: 'inventory.supplier' }),
        accessor: 'supplier',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-4 ',
        headerClassName: ' text-uppercase',
        headerProps: { xs: 12, md: 12 },
        Cell: ({ cell }) => {
          return (
            <div>
              <>
                <div className="d-flex flex-row justify-content-start">
                  <div className="w-30 text-bold text-uppercase">{f({ id: 'inventory.supplier' })}</div>
                  <div className="w-30 text-bold text-uppercase">{f({ id: 'inventory.batchNumber' })}</div>
                  <div className="w-30 text-bold text-uppercase">{f({ id: 'inventory.available' })}</div>
                  <div className="w-10 text-bold text-uppercase">{f({ id: 'inventory.unit' })}</div>
                </div>
                {cell?.row?.original?.batchNoList?.map((v, index) => (
                  <div className="d-flex flex-row justify-content-start" key={index}>
                    <div className="w-30" style={index % 2 !== 0 ? { background: '#FFF' } : { background: '#CCC' }}>
                      {cell?.row?.original?.supplier?.name || '-'}
                    </div>
                    <div className="w-30" style={index % 2 !== 0 ? { background: '#FFF' } : { background: '#CCC' }}>
                      {v?.batchNo}
                    </div>
                    <div className="w-30" style={index % 2 !== 0 ? { background: '#FFF' } : { background: '#CCC' }}>
                      {v?.availableAmount}
                    </div>
                    <div className="w-10" style={index % 2 !== 0 ? { background: '#FFF' } : { background: '#CCC' }}>
                      {f({ id: 'inventory.item' })}
                    </div>
                  </div>
                ))}
              </>
            </div>
          );
        },
      },
    ];
  }, [f, values]);
  const onFetchType = async () => {
    const defectType = await axios.get(`${SERVICE_URL}/receiving/toReceivedList?completeStatus=false`).then((res) => res.data.data);
    const listTemps = [];
    defectType.forEach((element) => {
      const o = {
        materialId: element.materialId,
        detail: element,
      };
      listTemps.push(o);
    });
    return listTemps;
  };
  const afterTransferItem = () => {
    refetch();
    setIsTransfering(false);
    setTransferItemModal(false);
    setTransformItemModal(false);
  };

  const { mutate: transferMaterial } = useMutation((currentData) => callTransferItem(currentData), {
    onSuccess() {
      afterTransferItem();
      toast(f({ id: 'inventory.detail.transfering.success' }));
    },
    onError(err) {
      afterTransferItem();
      toast.error(f({ id: 'inventory.detail.transfering.error' }));
      console.error('transfering error :', err);
    },
  });

  const afterAdjustItem = () => {
    refetch();
    setIsAdjusting(false);
    setAdjustItemModal(false);
    setReturnItemModal(false);
    setTransformItemModal(false);
  };

  const { mutate: adjustMaterial } = useMutation((currentData) => callAdjustItem(currentData), {
    onSuccess() {
      afterAdjustItem();
      toast(f({ id: 'inventory.detail.adjusting.success' }));
    },
    onError(err) {
      afterAdjustItem();
      toast.error(f({ id: 'inventory.detail.adjusting.error' }));
      console.error('adjusting error :', err);
    },
  });

  const { mutate: returnMaterial } = useMutation((currentData) => callReturnItem(currentData), {
    onSuccess() {
      afterAdjustItem();
      toast(f({ id: 'inventory.detail.adjusting.success' }));
    },
    onError(err) {
      afterAdjustItem();
      toast.error(f({ id: 'inventory.detail.adjusting.error' }));
      console.error('adjusting error :', err);
    },
  });
  const { mutate: transformMaterial } = useMutation((currentData) => callTransformMaterial(currentData), {
    onSuccess() {
      afterAdjustItem();
      toast(f({ id: 'inventory.detail.adjusting.success' }));
    },
    onError(err) {
      afterAdjustItem();
      toast.error(f({ id: 'inventory.detail.adjusting.error' }));
      console.error('adjusting error :', err);
    },
  });
  const tableInstance = useTable(
    {
      columns,
      data: list,
      setData: setList,
      filter,
      setFilter,
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }] },
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      hideSearch: true,
      pageCount,
      setPageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  useEffect(async () => {
    queryClient.resetQueries(QUERY.INVENTORY_DETAIL);
    const onFetch = await onFetchType();
    setListData(onFetch);
  }, [queryClient]);
  return (
    <>
      <HtmlHead title={title} />
      <PageTitle
        title={title}
        isLoading={isFetching}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
        }}
      />

      <Col>
        <h2 className="small-title">{f({ id: 'inventory.detail.information' })}</h2>
        <Form>
          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="productCode">
                    <Form.Label>{f({ id: 'production.group.field.productCode' })}</Form.Label>
                    <Form.Control readOnly type="text" value={data.productCode || ''} isInvalid={!!errors.productCode} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.productCode.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="productName">
                    <Form.Label>{f({ id: 'product.field.productName' })}</Form.Label>
                    <Form.Control readOnly type="text" value={data.productName || ''} isInvalid={!!errors.productName} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.productName.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="amount">
                    <Form.Label>{f({ id: 'inventory.onHand' })}</Form.Label>
                    <Form.Control readOnly type="text" value={data.amount || ''} isInvalid={!!errors.amount} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.onHand.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialUnit">
                    <Form.Label>{f({ id: 'inventory.unit' })}</Form.Label>
                    <Form.Control type="text" value={f({ id: 'inventory.item' })} isInvalid={!!errors.materialBaseUOM} readOnly />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.unit.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="availableAmount">
                    <Form.Label>{f({ id: 'inventory.available' })}</Form.Label>
                    <Form.Control readOnly type="text" value={data.availableAmount} isInvalid={!!errors.availableAmount} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.available.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialUnit">
                    <Form.Label>{f({ id: 'inventory.unit' })}</Form.Label>
                    <Form.Control type="text" value={f({ id: 'inventory.item' })} isInvalid={!!errors.materialStoreUnit} readOnly />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.unit.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3 g-3">
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="minAmount">
                    <Form.Label>{f({ id: 'inventory.minimum' })}</Form.Label>
                    <InputGroup className="spinner">
                      <InputGroup.Text id="basic-addon1">
                        <button type="button" className="spin-down single">
                          -
                        </button>
                      </InputGroup.Text>
                      <Form.Control className="text-center" type="text" value={data.minAmount || 0} isInvalid={!!errors.minAmount} readOnly />
                      <InputGroup.Text id="basic-addon2">
                        <button type="button" className="spin-up single">
                          +
                        </button>
                      </InputGroup.Text>
                    </InputGroup>
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.minimum.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="position-relative tooltip-end-top" controlId="maxAmount">
                    <Form.Label>{f({ id: 'inventory.maximum' })}</Form.Label>
                    <InputGroup className="spinner">
                      <InputGroup.Text id="basic-addon1">
                        <button type="button" className="spin-down single">
                          -
                        </button>
                      </InputGroup.Text>
                      <Form.Control className="text-center" type="text" value={data.maxAmount || 0} isInvalid={!!errors.maxAmount} readOnly />
                      <InputGroup.Text id="basic-addon2">
                        <button type="button" className="spin-up single">
                          +
                        </button>
                      </InputGroup.Text>
                    </InputGroup>
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.minimum.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Form>
      </Col>
      <div className="mt-5" />
      <h2 className="small-title">{f({ id: 'inventory.detail.store' })}</h2>
      <TableCard tableInstance={tableInstance} isLoading={isFetching} />
      <TransferItemModal
        isTransfering={isTransfering}
        show={transferItemModal}
        onAdd={(addedItem) => {
          setIsTransfering(true);
          transferMaterial(addedItem);
        }}
        onHide={() => {
          setTransferItemModal(false);
          setTransferItem({});
        }}
        data={transferItem}
        information={{
          materialId: data.materialId,
          materialCode: data.productCode,
          materialName: data.productName,
        }}
      />
      <TransferItemModal
        isTransfering={isTransfering}
        show={transformItemModal}
        onAdd={(addedItem) => {
          setIsTransfering(true);
          transformMaterial(addedItem);
        }}
        onHide={() => {
          setTransformItemModal(false);
          setTransferItem({});
        }}
        data={transferItem}
        information={{
          fromMaterialId: data.materialId,
          materialCode: data.productCode,
          materialName: data.productName,
          // fromBatchNo: data.batchNo,
        }}
        transformItemModal={transformItemModal}
      />
      <AdjustItemModal
        isAdjusting={isAdjusting}
        show={adjustItemModal}
        onAdd={(addedItem) => {
          setIsAdjusting(true);
          adjustMaterial(addedItem);
        }}
        onHide={() => {
          setAdjustItemModal(false);
          setAdjustItem({});
        }}
        data={adjustItem}
        information={{
          materialId: data.materialId,
          materialCode: data.productCode,
          materialName: data.productName,
        }}
      />
      <AdjustItemModal
        isAdjusting={isAdjusting}
        show={returnItemModal}
        onAdd={(addedItem) => {
          setIsAdjusting(true);
          returnMaterial(addedItem);
        }}
        onHide={() => {
          setReturnItemModal(false);
          setAdjustItem({});
        }}
        data={adjustItem}
        information={{
          materialId: data.materialId,
          materialCode: data.productCode,
          materialName: data.productName,
        }}
        returnItemModal={returnItemModal}
      />

      {/* <ReturnItemModal
        // isAdjusting={isAdjusting}
        show={returnItemModal}
        onAdd={(addedItem) => {
          setIsAdjusting(true);
          adjustMaterial(addedItem);
        }}
        onHide={() => {
          setReturnItemModal(false);
        }}
        data={adjustItem}
        information={{
          materialId: data.materialId,
          productCode: data.productCode,
          productName: data.productName,
        }}
      /> */}
    </>
  );
};

export default InventoryProductDetail;
