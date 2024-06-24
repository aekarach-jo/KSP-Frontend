import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowSelect, useRowState } from 'react-table';
import clx from 'classnames';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { toast } from 'react-toastify';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion, Modal } from 'react-bootstrap';
import Table from 'views/sales/components/table/TableMultiSales';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from '../components/page-title/PageTitle';
import FilterComponent from './components/Filter';

import { getColumn, getColumnSync } from './components/Columns';

import { API, INTL, NAVIGATION, QUERY } from './constants';

const callGetSalesOrderList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_SALES_ORDER, params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
};
const callGetSalesOrderSyncList = async ({ page = 0, limit = 10, filter = {}, sortBy = {}, transferredStatus = 'COMPLETED' }) => {
  const data = await request({ url: API.FIND_SALES_ORDER, params: { ...filter, ...sortBy, page: page + 1, limit, transferredStatus } });
  return data?.data;
};
const callSaveSyncDetail = (flagSyncStateList = {}) => {
  return request({ url: `/saleOrderExp/updateItem`, method: 'post', data: { saleOrderDetail: flagSyncStateList } });
};
const callSaveSync = (flagSyncStateList = {}) => {
  return request({ url: `/express/syncSaleOrder`, method: 'post', data: { saleOrderExpIdList: flagSyncStateList } });
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

const SalesOrder = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [dataSync, setDataSync] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageCountSync, setPageCountSync] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
  const [filterSync, setFilterSync] = useState({ page: 0 });
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [flagSyncStateList, setFlagSyncStateList] = useState([]);
  const [flagSyncState, setFlagSyncState] = useState('');
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('activeTab') !== 'export' && localStorage.getItem('activeTab') !== 'sync' ? 'export' : localStorage.getItem('activeTab')
  );
  const [syncState, setSyncState] = useState(0);
  const { push } = useHistory();

  const setManualGlobalFilterSearch = (no) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no,
    }));
  };

  const handleRowClick = (row) => {
    // Redirect to the link when the row is clicked
    window.location.href = `/sales/sales-order/${row.original.id}`;
  };

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd, handleRowClick, flagSyncState, setFlagSyncState, setSyncState), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      // setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount,
      placeholderText: f({ id: 'common.search.salesOrder' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );
  const tableInstance2 = useTable(
    {
      columns: useMemo(() => getColumnSync(f, fd, handleRowClick), [f, fd]),
      data: dataSync,
      filter: filterSync,
      setData: setDataSync,
      setFilter: setFilterSync,
      // setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount: pageCountSync,
      placeholderText: f({ id: 'common.search.salesOrder' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );
  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const {
    state: { globalFilter: globalFilterSync, pageIndex: pageSync, pageSize: pageSizeSync, sortBy: sortBySync },
  } = tableInstance2;

  const { isFetching, refetch } = useQuery(
    [QUERY.SALES_ORDER, pageSize, filter, sortBy],
    () => callGetSalesOrderList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        setData(result);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
  const { isFetching: isFetchingSync } = useQuery(
    [QUERY.SALES_ORDER_SYNC, pageSizeSync, filterSync, sortBySync],
    () => callGetSalesOrderSyncList({ page: pageSync, limit: pageSizeSync, filter: filterSync, sortBy: sortByFromTable(sortBySync) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        setDataSync(result);
        setPageCountSync(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
  const { mutate: saveOrder } = useMutation(() => callSaveSync(flagSyncStateList), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
        return;
      }
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('save order error :', err);
    },
  });
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);
  const { mutate: saveOrderDetail } = useMutation(() => callSaveSyncDetail(flagSyncStateList), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
        return;
      }
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('save order error :', err);
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
      customerName: globalFilter,
    }));
  }, [globalFilter]);
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page: globalFilterSync !== undefined && 0,
      customerName: globalFilterSync,
    }));
  }, [globalFilterSync]);
  useEffect(() => {
    const aList = [];
    let check = false;
    console.log(flagSyncStateList);

    if (flagSyncStateList.length > 0) {
      flagSyncStateList.forEach((v) => {
        if (v === flagSyncState) {
          check = true;
        } else {
          aList.push(v);
        }
      });
    }
    if (!check && flagSyncState !== '') {
      aList.push(flagSyncState);
      check = false;
    }
    setFlagSyncStateList(aList);
  }, [syncState]);
  console.log(flagSyncStateList);
  const fontStyle = {
    fontFamily: 'Poppins, sans-serif',
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
  const customStyleDescrip = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
  };
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
    localStorage.setItem('activeTab', eventKey);
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
            <Button
              variant="info"
              size="small"
              onClick={() => {
                setModal(false);
                saveOrder();
              }}
              disabled={loading}
            >
              {f({ id: 'common.ok' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  return (
    <>
      <HtmlHead title={title} />
      <PageTitle
        title={title}
        description={description}
        buttons={{
          export: { label: f({ id: 'common.export' }), onSubmit: () => setIsConfirmModal(true) },
        }}
        addButton={{ label: f({ id: INTL.ADD_BUTTON }), link: NAVIGATION.ADD_SALES_ORDER }}
        customStyle={customStyleDescrip}
        fontStyle={fontStyle}
      />
      <Table
        rowProps={handleRowClick}
        onTabChange={handleTabChange}
        activeKey={activeTab}
        tabs={[
          {
            eventKey: 'export',
            label: 'Export',
            tableInstance,
            isLoading: isFetching,
            // isLoading: isFetchingExport,
            filter: FilterComponent,
          },
          {
            eventKey: 'sync',
            label: 'Sync',
            // tableInstance,
            tableInstance: tableInstance2,
            isLoading: isFetchingSync,
            filter: FilterComponent,
          },
        ]}
        // filter={FilterComponent}
        isLoading={isFetching}
        customStyle={customStyle}
        rowStyle={rowStyle}
      />
      <ConfirmModal
        show={isConfirmModal}
        setModal={setIsConfirmModal}
        // loading={supplier}
        titleText={f({ id: 'common.confirm' })}
        confirmText={f({ id: 'common.confirm' })}
        // onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default SalesOrder;
