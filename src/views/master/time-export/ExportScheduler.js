import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Accordion, Button, Card, Col, Form, Row, Modal } from 'react-bootstrap';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import clx from 'classnames';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { toast } from 'react-toastify';

import StickerItemModal from 'views/production/sticker-operation/components/StickerItemModal';
import StickerToPrint from 'views/production/sticker-operation/components/StickerToPrint';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/Table';
import FilterComponent from './components/Filter';

import { getColumn } from './components/Columns';

import { API, INTL, NAVIGATION, QUERY } from './constants';

const getBatchList = async ({ limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_BATCH, params: { ...filter } });
  return data?.data;
};
const postExportList = ({ dataList = {} }) => {
  return request({
    url: API.EDIT_BATCH,
    method: 'post',
    data: {
      scheduleList: [dataList],
    },
  });
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

const ExportScheduler = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState();
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [stickerAmount, setStickerAmount] = useState(0);
  const componentRef = useRef(null);
  const [flagsGlobal, setFlagsGlobal] = useState({});
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isPage, setIsPage] = useState(false);

  const setManualGlobalFilterSearch = (no) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no,
    }));
  };

  const tableInstance = useTable(
    {
      columns: useMemo(() => getColumn(f, fd, setReceiveModal, flagsGlobal, setFlagsGlobal, setIsReceiving), [f, fd]),
      data,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      placeholderText: f({ id: 'common.search.export' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching, refetch } = useQuery(
    [QUERY.CUSTOMER_ORDER, pageSize, filter, sortBy],
    () => getBatchList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
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
        console.error('Error fetching customer order list', err);
      },
    }
  );
  const { mutate: saveOrder } = useMutation((d) => postExportList({ dataList: flagsGlobal }), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
        return;
      }
      setIsReceiving(false);
      refetch();
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('save order error :', err);
    },
  });
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      schedule: globalFilter,
    }));
  }, [globalFilter]);

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  console.log(flagsGlobal);
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
      <PageTitle title={title} description={description} />
      <Table tableInstance={tableInstance} isLoading={isFetching} customStyle={customStyle} isPage={isPage} />;
      <ConfirmModal
        show={isReceiving}
        setModal={setIsReceiving}
        // loading={supplier}
        titleText={f({ id: 'common.warning' })}
        confirmText={f({ id: 'common.confirm' })}
        // onConfirm={handleConfirm}
        onCancel={() => {
          setIsReceiving(false);
        }}
      />
    </>
  );
};

export default ExportScheduler;
