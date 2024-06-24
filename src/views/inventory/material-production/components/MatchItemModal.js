import React, { useEffect, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useQuery, useQueryClient } from 'react-query';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NumberFormat from 'react-number-format';
import Select from 'react-select';
import { request } from 'utils/axios-utils';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';

import Table from 'views/sales/components/table/Table';

import { API, QUERY } from '../constants';

let initialData = {
  material: '',
  batchNo: '',
  quantity: '',
  productionOrder: '',
};

const ToastSuccess = (value) => {
  const { formatMessage: f } = useIntl();
  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: value.textAlert })}</span>
      </div>
    </>
  );
};

const getMatchingDetail = async (productId, productOrderId) => {
  const res = await request({ method: 'post', url: API.GET_MATCHING_DETAIL, data: { product: productId, productionOrderId: productOrderId } });
  return res?.data;
};

const getInventoryDetail = async (code) => {
  const res = await request({ method: 'get', url: API.GET_INVENTORYG_DETAIL, params: { materialCode: code } });
  return res?.data?.data[0];
};

const findMatchingHistory =
  ({ product, productionOrder }) =>
  async () => {
    const response = await request({
      url: API.FIND_MATCHING_HISTORY,
      params: { product, productionOrder },
    });

    return response?.data?.data;
  };

const deleteItem = async (id) => {
  await request({ url: API.DELETE_MATCHING_ITEM.replace(':itemId', id), method: 'post' });
};

const editItem = async (id, am) => {
  await request({ url: API.EDIT_MATCHING_ITEM.replace(':itemId', id), method: 'post', data: { amount: Number(am) } });
};

const MatchItemModal = ({ isMatching, show, onHide, onAdd, data, refetchList, isSuccess }) => {
  const { formatMessage: f, formatDate: fd } = useIntl();
  const [batchOptions, setBatchOptions] = useState([]);
  const [rmOptions, setRMOptions] = useState([]);
  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productionOrderOptions, setProductionOrderOptions] = useState([]);
  const [matchSum, setMatchSum] = useState(0);
  const [totalMatch, setTotalMatch] = useState(0);
  const [isOverTotal, setIsOverTotal] = useState(false);
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const validationSchema = Yup.object().shape({
    batchNo: Yup.object().required(f({ id: 'material-production.batchNo.required' })),
    material: Yup.object().required(),
    // quantity: Yup.number().required().positive().min(0),
    productionOrder: Yup.object().required(),
  });

  const { isFetching, refetch: refetchMatching } = useQuery(
    [QUERY.MATCHING_ITEM, data?.productId, data?.id],
    () => getMatchingDetail(data?.productId, data?.id),
    {
      enabled: show,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: results } = resp;
        const items = results.flatMap((item) => item.productionOrderList.filter((lot) => lot.id === data.id).map((subItem) => ({ ...item, ...subItem })));
        const total = items?.map((el) => {
          el?.productionOrderList.filter((itemOrder) => itemOrder?.id === data?.id);
          return el.totalAmount;
        });

        items[0].batchNoList.forEach((item) => {
          // eslint-disable-next-line no-underscore-dangle
          item.value = item._id;
          item.label = item.batchNo;
        });

        const batchNoList = items[0].batchNoList.filter((item) => item.availableAmount > 0 && item?.batchNo !== 'TEMP_SUPPLIER');

        initialData = {
          material: { label: items[0].materialName, value: items[0].materialId },
          batchNo: [],
          quantity: '',
          productionOrder: { label: items[0]?.no, value: items[0]?.id },
        };
        setTotalMatch(total.reduce((accumulator, currentValue) => accumulator + currentValue, 0));
        setBatchOptions(batchNoList);
        setRMOptions(items.map((item) => ({ ...item, label: item.materialName, value: item.materialId })));
      },
      onError(err) {
        console.error('Error fetching matching material detail', err);
      },
    }
  );

  const { isFetching: isFetchingHistory, refetch: refetchHistory } = useQuery(
    [QUERY.MATCHING_HISTORY],
    findMatchingHistory({ product: data?.productId, productionOrder: data.id }),
    {
      enabled: show,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        setResult(resp);
        setMatchSum(resp.reduce((sum, item) => sum + item?.amount, 0));
      },
      onError(err) {
        console.error('Search Error:', err);
      },
    }
  );

  const onSubmit = async (values) => {
    const item = {
      amount: Number(values?.list[0].amount),
      batchNo: values?.list[0].batchNo,
      material: values?.list[0].material,
      productionOrder: values.productionOrder.value,
    };

    const submitValues = {
      product: data.productId,
      item,
    };

    setIsLoading(true);
    await onAdd?.(submitValues);
  };

  const formik = useFormik({ initialValues: initialData || { storeLocation: '', amount: 0 }, onSubmit, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  const handleOnRemove = (currentIndex, v) => {
    const list = values.list.filter((x, index) => index !== currentIndex);
    const quantityAfter = Number(values.quantity) + Number(v.amount);
    handleChange({ target: { id: 'list', value: list } });
    handleChange({ target: { id: 'quantity', value: quantityAfter } });
    handleSubmit();
  };

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => f({ id: 'material-production.material' }),
        accessor: 'materialName',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-auto',
        Cell: ({ cell }) => (
          <Col className="text-medium">
            <div>{cell.value}</div>
            <div>({cell.row.original.batchNo})</div>
          </Col>
        ),
      },
      {
        Header: f({ id: 'material-production.amount' }),
        accessor: 'amount',
        sortable: false,
        headerClassName: 'text-muted text-uppercase text-center w-20',
        Cell: ({ cell }) => {
          const onBlur = (e) => {
            handleChange({ target: { id: 'list.amount', value: Number(e.target.value).toFixed(configDecimal) } });
            cell.row.original.amount = Number(e.target.value).toFixed(configDecimal);
          };
          return (
            <Form.Control
              style={{ width: '100%', textAlign: 'center' }}
              type="number"
              name="amount"
              min={0}
              defaultValue={Number(cell.value).toFixed(configDecimal)}
              onBlur={onBlur}
            />
          );
        },
      },
      {
        Header: () => f({ id: 'material-production.productOrder' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-20',
      },
      {
        Header: () => f({ id: 'material-production.matchDate' }),
        accessor: 'dueDate',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-10',
        Cell: ({ cell }) => <div className="text-medium">{moment(cell.value).add(543, 'year').format('DD/MM/YYYY HH:mm') || '-'}</div>,
      },
      {
        Header: '',
        accessor: 'actions',
        headerClassName: 'text-muted text-uppercase',
        Cell: ({ cell }) => (
          <Col style={{ padding: '0 5px', textAlign: 'end' }}>
            <Button
              variant="outline-info"
              size="sm"
              className="btn-icon btn-icon-only mb-1"
              onClick={() => {
                setIsLoading(true);
                editItem(cell.row.original.id, Number(cell.row.original.amount).toFixed(configDecimal))
                  .then((res) => {
                    refetchHistory();
                    refetchMatching();
                    // refetchList();
                    resetForm();
                    setIsLoading(false);
                  })
                  .catch(console.error);
              }}
            >
              <CsLineIcons icon="edit" />
            </Button>{' '}
            <Button
              variant="outline-danger"
              size="sm"
              className="btn-icon btn-icon-only mb-1"
              onClick={() => {
                setIsLoading(true);
                deleteItem(cell.row.original.id)
                  .then((res) => {
                    console.log(res);
                    refetchHistory();
                    refetchMatching();
                    // refetchList();
                    resetForm();
                    setIsLoading(false);
                  })
                  .catch(console.error);
              }}
            >
              <CsLineIcons icon="bin" />
            </Button>
          </Col>
        ),
      },
    ];
  }, [f, fd]);

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      manualPagination: false,
      manualFilters: false,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
    // useRowSelect
  );

  const { selectedFlatRows, setPageSize, gotoPage } = tableInstance;

  const handleSelectMaterial = (material) => {
    resetForm();
    handleChange({ target: { id: 'material', value: material } });
    const batchNo = material?.batchNoList.filter((item) => item?.availableAmount !== 0);
    const productionOrder = material?.productionOrderList;
    batchNo.forEach((item) => {
      // eslint-disable-next-line no-underscore-dangle
      item.value = item._id;
      item.label = item.batchNo;
    });
    productionOrder.forEach((item) => {
      item.value = item.id;
      item.label = item.no;
    });
    setBatchOptions(batchNo);
    setProductionOrderOptions(productionOrder);
  };

  const handleSelectBatchNo = (batchNo) => {
    setIsOverTotal(false);
    handleChange({ target: { id: 'batchNo', value: batchNo } });
    handleChange({ target: { id: 'quantity', value: batchNo?.availableAmount } });
    handleChange({ target: { id: 'materialUOM', value: values.material?.materialBaseUOM } });
    if (batchNo?.availableAmount > totalMatch) {
      setIsOverTotal(true);
    }
  };

  const handleChangeQuantity = (quantity) => {
    console.log(Number(quantity.target.value).toFixed(configDecimal));
    console.log(Number(totalMatch - matchSum || 0).toFixed(configDecimal));
    if (Number(quantity.target.value).toFixed(configDecimal) <= (totalMatch - matchSum || 0).toFixed(configDecimal)) {
      handleChange({ target: { id: 'quantity', value: Number(quantity.target.value).toFixed(configDecimal) } });
      setIsOverTotal(false);
    } else {
      handleChange({ target: { id: 'quantity', value: Number(quantity.target.value).toFixed(configDecimal) } });
      setIsOverTotal(true);
    }
  };

  const handleSelectProductOrder = (productOrde) => {
    handleChange({ target: { id: 'productionOrder', value: productOrde } });
  };

  const handleChangeAmount = (e, indexAmount) => {
    values.list.forEach((x, index) => {
      if (index === indexAmount) {
        x.amount = e.target.value;
      }
    });
  };

  const onHideAndResetForm = () => {
    resetForm();
    onHide();
  };

  const handleOnAdd = () => {
    const quantityAfter = values.batchNo?.amount - values.quantity;

    const itemObj = {
      batchNo: values.batchNo.batchNo,
      amount: Number(values.quantity).toFixed(configDecimal),
      material: values.material.value,
      materialName: values.material.label,
      productionOrder: values.productionOrder.value,
      productionOrderName: values.productionOrder.label,
    };
    handleChange({ target: { id: 'list', value: [itemObj] } });
    handleChange({ target: { id: 'quantity', value: quantityAfter || 0 } });
    handleSubmit();
    // setIsLoading(false);
    handleChange({ target: { id: 'material', value: [] } });
    handleChange({ target: { id: 'batchNo', value: [] } });
    handleChange({ target: { id: 'quantity', value: 0 } });
    // toast(<ToastSuccess textAlert="common.save.success" />);
  };

  const handleDelete = () => {
    setIsLoading(true);
    Promise.all(selectedFlatRows.map((row) => deleteItem(row.values.id)))
      .then(() => {
        refetchHistory();
        refetchList();
        setIsLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (show) {
      setPageSize(5);
      gotoPage(0);
      setIsOverTotal(false);
      setResult([]);
      initialData = {
        material: '',
        batchNo: '',
        quantity: '',
        productionOrder: '',
      };

      refetchHistory();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      // setTotalMatch(0);
      refetchMatching();
    }
  }, [onAdd, editItem]);

  useEffect(async () => {
    if (isSuccess) {
      await refetchHistory();
      await refetchList();
      // refetchMatching();
      setIsLoading(false);
    }
  }, [isSuccess]);

  return (
    <Modal show={show} className={clx(['fade'])} size="xl" onHide={onHideAndResetForm} backdrop="static">
      <Modal.Header closeButton={!isFetching && !isMatching && !isLoading}>
        <Modal.Title>
          {f({ id: 'material-production.matching2' })} : {data?.productName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
        // className={clx({
        //   'overlay-spinner': isFetching || isMatching || isLoading,
        // })}
        >
          <Form onSubmit={handleSubmit}>
            <Row>
              <Row>
                <Col xs={12} lg={6} className="mt-3">
                  <Form.Group controlId="productOrder">
                    <Form.Label>{f({ id: 'material-production.productOrder' })}</Form.Label>
                    <Select
                      classNamePrefix="react-select"
                      placeholder={f({ id: 'material-production.productOrder.required' })}
                      options={productionOrderOptions}
                      value={values.productionOrder || ''}
                      onChange={handleSelectProductOrder}
                      isDisabled
                    />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.productionOrder ? 'block' : 'none' }}>
                      {f({ id: 'material-production.productOrder.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>{' '}
                <Col xs={12} lg={6} className="mt-3">
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Form.Label>Matched/Total</Form.Label>
                    <div>
                      <div className="text-alternate">{`${matchSum.toFixed(configDecimal) || '0'}/${totalMatch.toFixed(configDecimal)}`}</div>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs={12} lg={6} className="mt-3">
                  <Form.Group controlId="material">
                    <Form.Label>{f({ id: 'material-production.material' })}</Form.Label>
                    <Select
                      classNamePrefix="react-select"
                      placeholder={f({ id: 'material-production.material.required' })}
                      options={rmOptions}
                      value={values.material || ''}
                      onChange={handleSelectMaterial}
                      isDisabled={isFetching || isLoading || totalMatch === matchSum}
                    />
                    <Form.Control.Feedback type="invalid" style={{ display: errors.material ? 'block' : 'none' }}>
                      {f({ id: 'material-production.product.required' })}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} lg={6} className="mt-3">
                  <Form.Group controlId="batchNo">
                    <Form.Label>{f({ id: 'material-production.lotNo' })}</Form.Label>
                    <Select
                      classNamePrefix="react-select"
                      placeholder={f({ id: 'material-production.lotNo.required' })}
                      options={batchOptions}
                      value={values.batchNo || ''}
                      onChange={handleSelectBatchNo}
                      isInvalid={errors.batchNo && touched.batchNo}
                      isDisabled={isFetching || isLoading || totalMatch === matchSum}
                      isClearable
                      required
                    />
                    {/* {errors.batchNo && touched.batchNo && <div className="d-block invalid-feedback">{f({ id: errors.batchNo })}</div>} */}
                  </Form.Group>
                </Col>{' '}
              </Row>
              <Row>
                <Col xs={4} lg={5} className="mt-3">
                  <Form.Group controlId="quantity">
                    <Form.Label>{f({ id: 'material-production.quantity' })}</Form.Label>
                    <Form.Control
                      as={NumberFormat}
                      name="quantity"
                      value={values.quantity}
                      onChange={handleChangeQuantity}
                      isInvalid={errors.quantity && touched.quantity}
                      readOnly={values.batchNo.length === 0 || !values.batchNo}
                      // min={0}
                      max={values?.batchNo?.availableAmount}
                    />
                    {isOverTotal && <div className="d-block invalid-feedback">{f({ id: 'material-production.quantity.over' })}</div>}
                  </Form.Group>
                </Col>
                <Col xs={4} lg={1} className="mt-3">
                  <Form.Label>{f({ id: 'material-production.unit' })}</Form.Label>
                  <div>
                    <div className="text-alternate text-medium m-2">{values?.materialUOM || '-'}</div>
                  </div>
                </Col>{' '}
                <Col xs={4} lg={1} className="mt-3">
                  <Form.Label>{f({ id: 'material-production.matchingDate' })}</Form.Label>
                  <div>
                    <div className="text-alternate">{moment(data?.dueDate).add(543, 'year').format('DD/MM/YYYY') || '-'}</div>
                  </div>
                </Col>{' '}
              </Row>
              <div className="d-flex flex-column justify-content-end align-items-end w-100">
                <Button
                  variant="info"
                  className="btn-icon btn-icon-start my-3 px-5"
                  style={{ float: 'right' }}
                  disabled={!values.batchNo || isOverTotal}
                  onClick={handleOnAdd}
                >
                  <CsLineIcons icon="plus" /> {f({ id: 'material-production.addItem' })}
                </Button>
              </div>
              <div
                className={clx({
                  'overlay-spinner': isFetching || isLoading,
                })}
              >
                {/* <Col xs="12" className="mt-3">
                  <Button className="btn-icon btn-icon-start float-end" variant="danger" onClick={handleDelete} disabled={selectedFlatRows?.length === 0}>
                    <CsLineIcons icon="bin" /> <span>{f({ id: 'common.delete' })}</span>
                  </Button>
                </Col> */}
                <Table tableInstance={tableInstance} hideAdd hideEdit hideDelete hideSearch hidePagination hidePageSize />
              </div>
              <div className="mt-5" style={{ textAlign: 'center' }}>
                {/* <Button type="submit" variant="primary">
                  {f({ id: 'common.add' })}
                </Button>{' '} */}
                <Button variant="light" onClick={onHideAndResetForm}>
                  {f({ id: 'common.close' })}
                </Button>
              </div>
            </Row>
          </Form>
        </div>
      </Modal.Body>
      {/* <Modal.Footer>
      </Modal.Footer> */}
    </Modal>
  );
};

export default MatchItemModal;
