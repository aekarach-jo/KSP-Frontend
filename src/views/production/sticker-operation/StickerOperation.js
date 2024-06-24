import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Accordion, Button, Card, Col, Form, Row, Modal } from 'react-bootstrap';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import clx from 'classnames';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import ReactToPrint from 'react-to-print';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import StickerItemModal from 'views/production/sticker-operation/components/StickerItemModal';
import StickerToPrint from 'views/production/sticker-operation/components/StickerToPrint';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import Table from 'views/sales/components/table/Table';
import FilterComponent from './components/Filter';

import { getColumn } from './components/Columns';

import { API, INTL, NAVIGATION, QUERY } from './constants';

const getCustomerOrderList = async ({ limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_CUSTOMER_ORDER, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return data?.data;
};
const postStickerPrintList = ({ dataList = {}, index = 0 }) => {
  return request({ url: API.POST_STICKER, method: 'post', data: dataList[index] ? dataList[index] : dataList });
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

const StickerOperation = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [isStickerSave, setIsStickerSave] = useState(false);
  const [printConfirm, setPrintConfirm] = useState(false);
  const [stickerAmount, setStickerAmount] = useState(0);
  const [stickerObj, setStickerObj] = useState([]);
  const [globalIndex, setGlobalIndex] = useState(0);
  const arryRef = useRef([]);

  const componentRef = useRef(null);

  const setManualGlobalFilterSearch = (no) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no,
    }));
  };

  const buttonPrint = (
    <Button
      variant="outline-success"
      className="btn-icon btn-icon-only btn-sm"
      // disabled={stickerObj[rowIndex]?.stickerPrintAmount <= 0 || stickerObj[rowIndex]?.stickerPrintAmount === undefined}
      // onClick={() => setReceiveModal(true)}
      onClick={() => {
        setGlobalIndex(globalIndex);
        setIsConfirmModal(true);
        // setIsStickerSave(true);
      }}
    >
      <span className="text-center">
        <CsLineIcons icon="check-circle" />
      </span>
    </Button>
  );
  const tableInstance = useTable(
    {
      columns: useMemo(
        () => getColumn(f, fd, setIsConfirmModal, setStickerObj, setStickerAmount, setGlobalIndex, arryRef, setIsStickerSave, setPrintConfirm),
        [f, fd]
      ),
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
      placeholderText: f({ id: 'common.search.sticker' }),
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
    () => getCustomerOrderList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination } = resp;
        const arryData = [];
        result?.forEach((e) => {
          e.productSubType[0].itemList.forEach((i) => {
            arryData.push(i);
          });
        });
        setData(arryData);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching customer order list', err);
      },
    }
  );
  const { mutate: saveOrder } = useMutation((d) => postStickerPrintList({ dataList: stickerObj, index: globalIndex }), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
        return;
      }
      setIsStickerSave(false);
      setIsConfirmModal(false);
      toast('บันทึกสำเร็จ');
      refetch();
    },
    onError(err) {
      console.error('save order error :', err);
    },
  });
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
            <div
              onClick={() => {
                setModal(false);
                saveOrder();
              }}
            >
              <ReactToPrint
                trigger={() => {
                  return (
                    <Button variant="info" size="small" disabled={loading}>
                      {f({ id: 'common.ok' })}
                    </Button>
                  );
                }}
                content={() => componentRef.current}
              />
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const ConfirmModalEdit = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
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
            <div
              onClick={() => {
                setModal(false);
                saveOrder();
              }}
            >
              <Button variant="info" size="small" disabled={loading}>
                {f({ id: 'common.ok' })}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
      stickerPrintStatusMulti: 'NEW,PRINTED,STICKER RECEIVED',
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page: globalFilter !== undefined && 0,
      productName: globalFilter,
    }));
  }, [globalFilter]);
  useEffect(() => {
    if (isConfirmModal) {
      if (!stickerObj[globalIndex].stickerPrintAmount) {
        setStickerAmount(data[globalIndex].stickerPrintAmount);
        setStickerObj((prevStickerObj) => {
          return {
            ...prevStickerObj,
            [globalIndex]: {
              ...prevStickerObj[globalIndex],
              productionOrder: data[globalIndex].productionOrderId,
              stickerPrintAmount: data[globalIndex].stickerPrintAmount,
              stickerPrintReceivedBy: data[globalIndex].stickerPrintReceivedBy,
            },
          };
        });
      }
    }
  }, [isConfirmModal]);
  useEffect(() => {
    if (isStickerSave) {
      if (!stickerObj[globalIndex].stickerPrintAmount) {
        setStickerAmount(data[globalIndex].stickerPrintAmount);
        setStickerObj((prevStickerObj) => {
          return {
            ...prevStickerObj,
            [globalIndex]: {
              ...prevStickerObj[globalIndex],
              productionOrder: data[globalIndex].productionOrderId,
              stickerPrintAmount: data[globalIndex].stickerPrintAmount,
              stickerPrintStatus:
                data[globalIndex].stickerPrintStatus !== 'PRINTED' && data[globalIndex].stickerPrintStatus !== 'STICKER RECEIVED'
                  ? 'NEW'
                  : data[globalIndex].stickerPrintStatus,
              stickerPrintReceivedBy: data[globalIndex].stickerPrintReceivedBy,
            },
          };
        });
      }
    }
  }, [isStickerSave]);
  // useEffect(() => {
  //   if (arryRef.current[globalIndex] && arryRef.current[globalIndex]?.current) {
  //     // handleChange({ target: { id: `detail.${globalIndex}.discount`, value: discountState[globalIndex] } });
  //     arryRef.current[globalIndex].current.focus();
  //   }
  // }, [stickerObj]);

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
  };
  const handleCancelEdit = () => {
    setIsStickerSave(false);
  };
  return (
    <>
      <HtmlHead title={title} />
      <PageTitle
        title={title}
        description={description}
        buttons={{
          // cancel: { label: f({ id: 'common.cancel' }), onCancel: cancelEdit, isHide: !isEditMode || !id },
          // edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || isEditMode },
          // save: { label: f({ id: 'common.save' }), onSubmit: handleSaveClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode },
          // delete: { label: ' ', onSubmit: handleCancelClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode || !id },
          // submit: { label: f({ id: 'common.submit' }), onSubmit: handleSubmitClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode },
          export: { label: f({ id: 'common.stickerPrint' }), onSubmit: () => setReceiveModal(true) },
        }}
      />
      <Table tableInstance={tableInstance} filter={FilterComponent} isLoading={isFetching} customStyle={customStyle} />
      <StickerItemModal
        isReceiving={isReceiving}
        show={receiveModal}
        // onAdd={(addItem) => {
        //   setIsReceiving(true);
        //   // addReceivingItemInventory(addItem);
        // }}
        onHide={() => {
          setReceiveModal(false);
          // setReceivingItem({});
        }}
        listData={[]}
        data={data}
        inventoryReceiving="true"
        setIsConfirmModal={setIsConfirmModal}
        componentRef={componentRef}
        saveOrder={saveOrder}
        setStickerAmount={setStickerAmount}
        setStickerObj={setStickerObj}
      />
      <StickerToPrint
        // rowProps={rowProps}
        componentRef={(e) => {
          componentRef.current = e;
        }}
        className="react-table rows"
        tableInstance={data[globalIndex]}
        stickerAmount={stickerAmount}
        isConfirmModal={isConfirmModal}
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
      <ConfirmModalEdit
        show={isStickerSave}
        setModal={setIsStickerSave}
        // loading={supplier}
        titleText={f({ id: 'common.confirm' })}
        confirmText={f({ id: 'common.confirm' })}
        // onConfirm={handleConfirm}
        onCancel={handleCancelEdit}
      />
      ;
    </>
  );
};

export default StickerOperation;
