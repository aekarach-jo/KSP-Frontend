import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useMutation } from 'react-query';
import clx from 'classnames';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion, Modal } from 'react-bootstrap';
import { SERVICE_URL } from 'config';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import ReactToPrint from 'react-to-print';
import useCuttingData from 'hooks/api/cutting/useCuttingData';
import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import DropdownPageSize from 'components/dropdown-page-size';
import Table from 'views/sales/components/table/TableCuttingList';
import PageTitle from '../../sales/components/page-title/PageTitle';
import TablePagination from './components/TablePagination';
import CuttingSearch from './components/CuttingSearch';
import FilterForm from './components/FilterForm';
import TableGroup from './components/TableGroup';
import CardPrintContainer from './components/CardPrintingCuttingList';

const callGetCuttingList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: '/cuttingList/pendingList', params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
};
const callGetCuttingSubmitList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: '/cuttingList/finishedList', params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
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

const CuttingList = () => {
  const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
  const { push } = useHistory();

  const lang = useMemo(
    () => ({
      title: f({ id: 'cutting.list.title' }),
      description: f({ id: 'cutting.list.description' }),
    }),
    [f]
  );

  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [isShowFilter, setShowFilter] = useState(false);
  // const [result, setResult] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const componentRef = useRef(null);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [productionOrder, setProductionOrder] = useState('');
  const [isConfirmModalCutDate, setIsConfirmModalCutDate] = useState(false);

  const toggleFilter = () => {
    setShowFilter(!isShowFilter);
  };

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      // {
      //   Header: () => f({ id: 'cutting.field.ordering' }),
      //   accessor: 'ordering',
      //   sortable: true,
      //   headerClassName: 'text-muted text-uppercase w-30',
      //   Cell: ({ index }) => index + 1,
      //   colProps: {
      //     md: 1,
      //   },
      // },
      {
        Header: () => f({ id: 'cutting.field.name' }),
        accessor: 'productName',
        sortable: true,
        headerClassName: 'text-muted text-uppercase',
      },
      {
        Header: () => f({ id: 'cutting.field.lotNo' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-muted text-uppercase',
        // Cell: BadgeCell,
      },
      {
        Header: () => f({ id: 'cutting.field.qtyPerItem' }),
        accessor: 'amount',
        sortable: true,
        headerClassName: 'text-muted text-uppercase',
        // Cell: BadgeCell,
      },
      {
        Header: () => f({ id: 'cutting.field.due' }),
        accessor: 'dueDate',
        sortable: true,
        headerClassName: 'text-muted text-uppercase',
        // Cell: BadgeCell,
        Cell: ({ value }) => `${fd(value)} ${ft(value)}`,
      },
      {
        Header: () => f({ id: 'cutting.field.remaining' }),
        accessor: 'remaining',
        sortable: true,
        headerClassName: 'text-muted text-uppercase',
        // Cell: BadgeCell,
        colProps: {
          md: 1,
        },
      },
      /* {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row }) => {
          const { checked, onChange } = row.getToggleRowSelectedProps();
          return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
        },
      }, */
    ];
  }, [f, fd, ft]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, group, material) => {
        let pushItem = '';
        console.log(item.productionOrderList[0].cuttingStartAt);
        if (item.productionOrderList[0].cuttingStartAt === undefined) {
          setProductionOrder(group);
          setIsConfirmModalCutDate(true);
        } else {
          pushItem = push(
            `/production/cutting/group?${new URLSearchParams({
              productionOrder: group,
              // materialBatchNo: group.materialBatchNo,
            }).toString()}`
          );
        }
        return pushItem;
      },
    }),
    [push]
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      setData,
      setFilter,
      manualGlobalFilter: true,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      // autoResetSortBy: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );
  const tableInstance2 = useTable(
    {
      columns,
      data: data2,
      setData: setData2,
      setFilter,
      manualGlobalFilter: true,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      // autoResetSortBy: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  const {
    gotoPage,
    setPageSize,
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { isFetching: isFetchingPending, refetch } = useQuery(
    ['cuttingList', pageSize, filter, sortBy],
    () => callGetCuttingList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: resultResp, pagination } = resp;
        setData(resultResp);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
  const { isFetching: isFetchingSubmit } = useQuery(
    ['finishedList', pageSize, filter, sortBy],
    () => callGetCuttingSubmitList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: resultResp, pagination } = resp;
        setData2(resultResp);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
  const ToastCreateSuccess = () => {
    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'company.save.success' })}</span>
        </div>
      </>
    );
  };
  const createCuttingDate = () =>
    request({
      method: 'post',
      url: `${SERVICE_URL}/cuttingList/saveCutting`,
      data: {
        productionOrder,
        cuttingStartAt: new Date(),
      },
      headers: {
        'content-type': 'application/json',
      },
    }).then((res) => res.data);
  const { mutate: cuttingDateFn } = useMutation(createCuttingDate, {
    onSuccess() {
      setIsConfirmModalCutDate(false);
      refetch();
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('create company error :', err);
    },
  });
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page: globalFilter !== undefined && 0,
      productName: globalFilter,
    }));
  }, [globalFilter]);
  // const { data, isLoading } = useSummaryPendingListQuery({ filter, pageIndex, limit: pageSize, sortBy });

  // useEffect(() => {
  //   setResult(data || []);
  // }, [data]);

  const handleCuttingSearch = useCallback(
    (keyword) => {
      // console.debug('handleAutocompleteSearch', keyword);
      // searchCustomerByKeyword(keyword);
      gotoPage(0);
      setFilter({ materialName: keyword });
    },
    [gotoPage]
  );

  const handleFilterFormSearch = useCallback(
    (_filter) => {
      // console.log('filter :', _filter);
      gotoPage(0);
      setFilter(_filter);
    },
    [gotoPage]
  );
  const handlefilterFormReset = useCallback(() => {
    gotoPage(0);
    setFilter({});
  }, [gotoPage]);

  const handleCancel = () => {
    setIsConfirmModal(false);
  };
  const handleCancelCutDate = () => {
    setIsConfirmModalCutDate(false);
  };

  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => {
                return (
                  <Button variant="info" size="small" onClick={() => setModal()} disabled={loading}>
                    {f({ id: 'common.ok' })}
                  </Button>
                );
              }}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const ConfirmModalDate = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <Button variant="info" size="small" onClick={() => cuttingDateFn(false)} disabled={loading}>
              {f({ id: 'common.ok' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  console.log(data);
  return (
    <>
      {/* Title Start */}
      <PageTitle
        title={lang.title}
        description={lang.description}
        isLoading={isFetchingPending}
        buttons={{
          // cancel: { label: f({ id: 'common.cancel' }), onCancel: cancelEdit, isHide: !isEditMode || !id },
          // edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || isEditMode },
          // save: { label: f({ id: 'common.save' }), onSubmit: handleSaveClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode },
          // delete: { label: ' ', onSubmit: handleCancelClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode || !id },
          // submit: { label: f({ id: 'common.submit' }), onSubmit: handleSubmitClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode },
          export: { label: f({ id: 'common.export' }), onSubmit: () => setIsConfirmModal(true) },
        }}
      />
      {/* Title End */}

      <Row className="mb-3">
        <Col md="6" lg="4" xxl="3" className="mb-1">
          {/* Search Start */}
          {<CuttingSearch gotoPage={gotoPage} setFilter={setFilter} />}
          {/* Search End */}
        </Col>
        <Col md="6" lg xxl className="mb-1 text-end">
          {/* Length Start */}
          <ButtonFilterToggle onClick={toggleFilter} open={isShowFilter} />
          <DropdownPageSize currentPageSize={pageSize} setPageSize={setPageSize} />
          {/* Length End */}
        </Col>
      </Row>

      <FilterForm tableInstance={tableInstance} show={isShowFilter} isLoading={isFetchingPending} />

      {/* Table Start */}
      <Row className={clx({ 'overlay-spinner': isFetchingPending })}>
        <Col xs="12">
          {/* <TableGroup
            // ref={(el) => {
            //   componentRef.current = el;
            // }}
            className="react-table rows"
            tableInstance={tableInstance}
            rowProps={rowProps}
            tabs={[
              {
                eventKey: 'newStatus',
                label: 'Unsu List',
                tableInstance,
                isLoading: isFetching,
                // filter: ,
              },
              {
                eventKey: 'completeStatus',
                label: 'Complete List',
                tableInstance,
                isLoading: isFetching,
                // filter: ,
              },
            ]}
          /> */}
          <Table
            // setShowModal={setShowModal}
            // setProductId={setProductId}
            // setProductList={setProductList}
            ref={(el) => {
              componentRef.current = el;
            }}
            className="react-table rows"
            rowProps={rowProps}
            tabs={[
              {
                eventKey: 'pending',
                label: 'Pending',
                tableInstance,
                isLoading: isFetchingPending,
                // filter: ,
              },
              {
                eventKey: 'submitted',
                label: 'Submitted',
                tableInstance: tableInstance2,
                isLoading: isFetchingSubmit,
                // filter: ,
              },
            ]}
          />
          <CardPrintContainer
            rowProps={rowProps}
            componentRef={componentRef}
            className="react-table rows"
            tableInstance={tableInstance}
            isConfirmModal={isConfirmModal}
          />
        </Col>
        {/* <Col xs="12">
          <TablePagination tableInstance={tableInstance} />
        </Col> */}
      </Row>
      {/* Table End */}

      <ConfirmModal
        show={isConfirmModal}
        setModal={setIsConfirmModal}
        // loading={supplier}
        titleText={f({ id: 'common.warning' })}
        confirmText={f({ id: 'common.confirm' })}
        // onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ConfirmModalDate
        show={isConfirmModalCutDate}
        setModal={setIsConfirmModalCutDate}
        // loading={supplier}
        titleText={f({ id: 'common.createdCutting' })}
        confirmText={f({ id: 'common.confirm' })}
        // onConfirm={handleConfirm}
        onCancel={handleCancelCutDate}
      />
    </>
  );
};

export default CuttingList;
