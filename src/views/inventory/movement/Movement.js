import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { Card, Col, Row } from 'react-bootstrap';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import { useFormik } from 'formik';
import Glide from 'components/carousel/Glide';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import FilterComponent from './components/Filter';

import { getColumn } from './components/Columns';

import { API, INTL, QUERY } from './constants';

const initialValues = { status: '' };
const callGetStockList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_STORE_LOCATION_LIST, params: { ...filter, ...sortBy, page: page + 1, limit } });
  const productData = await request({ url: API.FIND_PRODUCT });
  data.data.data.productList = productData?.data.data;
  return data?.data;
};
const styles = {
  selected: {
    backgroundColor: 'blue', // Customize with your preferred background color
  },
};
const sortByFromTable = ([field]) => {
  if (!field) {
    return {};
  }

  return {
    sortField: field.id,
    sortDirection: field.desc ? 'desc' : 'asc',
  };
};

const Movement = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState({});
  const [list, setList] = useState([]);
  const [movement, setMovement] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
  const [statusData, setStatusData] = useState({});
  const [count, setCount] = useState(false);
  const setManualGlobalFilterSearch = (materialCode) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      materialCode,
    }));
  };

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd), [f, fd]),
      data: list,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: true }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount,
      placeholderText: f({ id: 'common.search.movement' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { gotoPage } = tableInstance;

  const { isFetching } = useQuery(
    [QUERY.STOCK_MANAGEMENT, pageSize, filter, sortBy],
    () => callGetStockList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        result.detailList.forEach((item) => {
          if (item.materialId === undefined) {
            item.materialId = item.productId;
            item.materialCode = item.productCode;
            item.materialName = item.productName;
            item.materialStoreUnit = f({ id: 'inventory.item' });
          }
          result.productList.forEach((item2) => {
            if (item2.id === item.product) {
              item.materialCode = item2.code;
              item.materialName = item2.name;
              item.materialStoreUnit = f({ id: 'inventory.item' });
            }
          });
        });
        setData(result);
        if (!count) {
          result.countOverall = result.countReceived + result.countTransferred + result.countProduced + result.countAdjusted;
          setStatusData(result);
        }
        setList(result.detailList);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching movement list', err);
      },
    }
  );
  const onSubmit = (values) => {
    let dataResult = {};
    dataResult = {
      status: values.status,
    };
    setCount(true);
    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);
  const handleChangeType = (value, index) => {
    handleChange({ target: { id: 'status', value } });
    setSelectedItemIndex(index);
    handleSubmit();
  };
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page: globalFilter !== undefined && 0,
      materialCode: globalFilter,
    }));
  }, [globalFilter]);

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };

  return (
    <>
      <HtmlHead title={title} />
      <PageTitle title={title} description={description} />
      <Row className="gx-2">
        <Col className="p-0">
          <Glide
            // noControls

            options={{
              gap: 0,
              rewind: false,
              bound: true,
              perView: 6,

              breakpoints: {
                400: { perView: 1 },
                600: { perView: 2 },
                1400: { perView: 3 },
                1600: { perView: 4 },
                1900: { perView: 5 },
                3840: { perView: 6 },
              },
            }}
          >
            {/* {toolingType.current.length > 0 && resultData(toolingType.current)} */}
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5"
                style={{ backgroundColor: selectedItemIndex === 0 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('', 0)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.overall' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-quaternary">{statusData.countOverall || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5"
                style={{ backgroundColor: selectedItemIndex === 1 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('RECEIVED', 1)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.received' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-primary">{statusData.countReceived || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5"
                style={{ backgroundColor: selectedItemIndex === 2 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('TRANSFERRED', 2)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.transferred' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-secondary">{statusData.countTransferred || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5"
                style={{ backgroundColor: selectedItemIndex === 3 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('PRODUCED', 3)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.produced' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-tertiary">{statusData.countProduced || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5"
                style={{ backgroundColor: selectedItemIndex === 4 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('ADJUSTED', 4)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.adjusted' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-quaternary">{statusData.countAdjusted || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5"
                style={{ backgroundColor: selectedItemIndex === 5 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('RETURNED', 5)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.return' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-quaternary">{statusData.countReturned || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card
                className="hover-border-primary mb-5 selected"
                style={{ backgroundColor: selectedItemIndex === 6 ? '#EAFAFF' : '' }}
                onClick={() => handleChangeType('TRANSFORMED', 6)}
              >
                <Card.Body className="h-100 py-3 align-items-center">
                  <Row className="g-0">
                    <Col>
                      <div className="p-2">
                        <div className="d-flex sh-5 sw-5 bg-gradient-light align-items-center justify-content-center rounded-xl">
                          <CsLineIcons icon="print" className="text-white" />
                        </div>
                      </div>
                      <div className="sh-5 d-flex align-items-center lh-1-25">{f({ id: 'movement.list.transform' })}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center">
                      <div className="cta-2 text-quaternary">{statusData.countTransformed || '0'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
          </Glide>
        </Col>
      </Row>
      <Table tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} isMovement={movement} />
    </>
  );
};

export default Movement;
