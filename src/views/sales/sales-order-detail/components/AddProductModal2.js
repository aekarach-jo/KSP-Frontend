import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Accordion, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import RmSearchAutocomplete from 'views/production/rm/components/RmSearchAutocomplete';
import RmFilterForm from 'views/production/rm/RmFilterForm';
import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import DropdownPageSize from 'components/dropdown-page-size';
import { TableBoxed } from 'components/react-table-custom';
import Table from 'components/table/Table';

import { request } from 'utils/axios-utils';
// import TablePagination from './TablePagination';

const searchRmFn =
  ({ filter, page = 0, limit = 10, customerId, reference, show, setDisableSubmit, sortBy = {} }) =>
  async () => {
    if (!show) {
      return [];
    }
    console.log(customerId);
    const response = await request({
      url: `/saleOrderExp/findCO`,
      params: {
        ...filter,
        ...sortBy,
        page: page + 1,
        limit,
        customerId,
        reference,
      },
    });
    const responseSales = await request({
      url: `/inventory/product/find?isSale=true`,
      params: {
        ...filter,
        page: page + 1,
        limit,
        customerId,
        reference,
      },
    });
    const dataListSales = responseSales?.data?.data;
    const dataList = response?.data?.data;
    dataList.map((item1) =>
      dataListSales.map((item2) =>
        item1.detail.forEach((item3) => {
          console.log(item3.product.id, item2.productId);
          if (item3.product.id === item2.productId) {
            if (item3.amount > item2.amount) {
              item1.statusWarning = true;
              setDisableSubmit(true);
            } else {
              item1.statusWarning = false;
            }
          } else {
            item1.statusWarning = true;
            setDisableSubmit(true);
          }
        })
      )
    );
    console.log(dataList);
    return dataList
      ?.map((item) =>
        item.detail.map(({ id, product, amount, price, ...rest }) => ({
          id,
          amount,
          price,
          product: product?.id,
          no: item.no,
          code: product?.code,
          name: product?.name,
          reference: rest?.reference,
          statusWarning: item.statusWarning,
        }))
      )
      .flat();
  };

const AddProductModal = ({ show, list = [], onHide, onAdd, onRemove, setDisableSubmit, data: { customerId, reference } }) => {
  const { formatMessage: f } = useIntl();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: f({ id: 'salesOrder.field.no' }),
        accessor: 'no',
        sortable: true,
        headerClassName: 'w-20',
        colClassName: 'w-20',
        Cell: ({ cell }) => {
          return <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>;
        },
      },
      {
        Header: f({ id: 'salesOrder.field.reference' }),
        accessor: 'reference',
        sortable: true,
        headerClassName: 'w-20',
        colClassName: 'w-20',
        Cell: ({ cell }) => <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>,
      },
      {
        Header: () => f({ id: 'product.code' }),
        accessor: 'code',
        sortable: true,
        headerClassName: 'w-30',
        colClassName: 'w-30',
        Cell: ({ cell }) => <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>,
      },
      {
        Header: () => f({ id: 'product.name' }),
        accessor: 'name',
        sortable: true,
        headerClassName: 'w-20',
        colClassName: 'w-20',
        Cell: ({ cell }) => <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>,
      },
      // {
      //   Header: f({ id: 'salesOrder.field.price' }),
      //   accessor: 'price',
      //   sortable: true,
      //   headerClassName: 'w-20',
      //   Cell: ({ cell }) => <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>,
      // },
      {
        Header: f({ id: 'salesOrder.field.amount' }),
        accessor: 'amount',
        sortable: true,
        // headerClassName: 'w-10',
        // colClassName: 'w-10',
        Cell: ({ cell }) => <span style={{ color: cell.row.original.statusWarning ? 'red' : 'inherit' }}>{cell.value}</span>,
      },
      {
        Header: '',
        id: 'action ',
        colClassName: 'text-end',
        Cell: ({ row, addOrRemoveRm }) => {
          const isExisted = list?.some((item) => item.id === row.values.id);
          return (
            <Button
              className="btn-icon btn-icon-only hover-outline active-scale-down"
              variant={isExisted ? 'outline-success' : 'outline-primary'}
              onClick={() => addOrRemoveRm(row)}
            >
              {isExisted ? <CsLineIcons icon="check" /> : <CsLineIcons icon="plus" />}
            </Button>
          );
        },
      },
    ];
  }, [f, list]);

  const [filter, setFilter] = useState({});
  const [isShowFilter, setShowFilter] = useState(false);
  const [result, setResult] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const addOrRemoveRm = (rm) => {
    console.log('addOrRemoveRm', rm);
    const isExisted = list?.some((item) => item.id === rm.values.id);

    if (isExisted) {
      onRemove?.(rm.values.id);
    } else {
      onAdd?.(rm.original);
    }
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
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
      placeholderText: f({ id: 'common.search' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  const {
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = tableInstance;

  const { isFetching } = useQuery(
    ['searchRm', filter, pageIndex, pageSize, sortBy, show],
    searchRmFn({ filter, page: pageIndex, limit: pageSize, sortBy: sortByFromTable(sortBy), customerId, reference, show, setDisableSubmit }),
    {
      enabled: show,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { pagination = {} } = resp;
        setPageCount(pagination.totalPage);
        setTotal(pagination.total);
        setResult(resp);
        setSearchData(resp);
      },
      onError(err) {
        console.error('Search Error:', err);
      },
    }
  );

  // useEffect(() => {
  //   console.log(data);
  //   if (data) {
  //     setResult(data);
  //   }
  // }, [data]);

  const toggleFilter = () => {
    setShowFilter(!isShowFilter);
  };

  const handleAutocompleteSearch = (keyword) => {
    gotoPage(0);
    setFilter({ name: keyword });
  };

  const handleFilterFormSearch = async (_filter) => {
    console.log('handleFilterFormSearch', _filter);
    gotoPage(0);
    setFilter(_filter);
  };

  const handlefilterFormReset = () => {
    gotoPage(0);
    setFilter({});
  };
  // const onFetchType = async (value) => {
  //   // const ListType = {};
  //   const dataList = await axios.get('/saleOrderExp/findCO').then((res) => res.data.data);
  //   const tempList = [];
  //   // const messageList = [];
  //   dataList.forEach((element) => {
  //     const o = {
  //       value: element.name,
  //       label: element.name,
  //       detail: element,
  //     };
  //     tempList.push(o);
  //   });

  //   // ListType?.data?.sort((a, b) => a.code - b.code);
  //   return dataList.data;
  // };
  const handleSearchToolingList = (e) => {
    const foundProducts = searchData?.filter(
      (item) =>
        item.name.indexOf(e.target.value) !== -1 ||
        item.code.indexOf(e.target.value) !== -1 ||
        item.no.indexOf(e.target.value) !== -1 ||
        item.amount === Number(e.target.value) ||
        item.reference.indexOf(e.target.value) !== -1
    );
    setResult(foundProducts);
  };

  return (
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: 'customerOrder.detail.addProductModal.title.add' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md="6" lg="5" xxl="5" className="mb-1">
            <Form.Control type="text" onChange={handleSearchToolingList} placeholder={f({ id: 'common.search' })} />
            {/* <RmSearchAutocomplete
              as={(p) => <Form.Control {...p} type="text" placeholder={f({ id: 'common.search' })} />}
              // onSuggestionSelected={handleSuggestionSelected}
              onSearch={handleAutocompleteSearch}
            /> */}
          </Col>
          {/* <Col md lg xxl className="mb-1 text-end">
            <ButtonFilterToggle onClick={toggleFilter} open={isShowFilter} />
            <DropdownPageSize currentPageSize={pageSize} setPageSize={setPageSize} />
          </Col> */}
        </Row>
        {/* <Row className="mb-3">
          <Col>
            <Accordion>
              <Accordion.Collapse in={isShowFilter}>
                <Card body>
                  <RmFilterForm onSubmit={handleFilterFormSearch} onReset={handlefilterFormReset} />
                </Card>
              </Accordion.Collapse>
            </Accordion>
          </Col>
        </Row> */}
        <Row>
          <Col xs="12">
            <Card>
              <Card.Body className="half-padding">
                {/* <Table className="react-table boxed" tableInstance={tableInstance} /> */}
                <TableBoxed className="react-table boxed" tableInstance={tableInstance} />
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

export default AddProductModal;
