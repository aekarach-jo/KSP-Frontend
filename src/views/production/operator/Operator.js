/* eslint-disable import/order */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { request } from 'utils/axios-utils';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { Button, Modal } from 'react-bootstrap';
import { useMutation, useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import clx from 'classnames';
import { SERVICE_URL } from 'config';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import queryClient from 'utils/query-client';
import moment from 'moment';

import ReactToPrint from 'react-to-print';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import HtmlHead from 'components/html-head/HtmlHead';
import TableCard from './components/TableCardProductionPlan';
import Table from 'views/sales/components/table/TableCardOperationPlan';
import PageTitle from './components/PageTitle';

import FilterComponent from './components/FilterForm';

import { API, INTL, QUERY } from './constants';
import InformationForm from './components/informationForm';
import OperationPrint from './components/OperationPrint';

const productPlanRespTransform = (res, planOptionsList) => {
  const objData = {
    data: res.data.data,
    error: res.data.error,
    message: res.data.message,
    pagination: res.data.pagination,
  };
  return objData;
};

const getProductPlan = async ({ filter, limit = 10, sortBy = {}, planOptionsList }) => {
  const res = await request({ url: API.FIND_PRODPLAN_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return productPlanRespTransform(res, planOptionsList);
};

const updateProductioPlanFn = (plan) =>
  axios
    .post(
      `${SERVICE_URL}/productionPlan/editList`,
      { ...plan },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    )
    .then((res) => res.data);

const editPlan = ({ id, plan }) =>
  axios
    .post(
      `${SERVICE_URL}/productionPlan/${id}/edit`,
      { ...plan },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    )
    .then((res) => res.data);

const sortByFromTable = ([field]) => {
  if (!field) {
    return {};
  }

  return {
    sortField: field.id,
    sortDirection: field.desc ? 'desc' : 'asc',
  };
};

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.save.success' })}</span>
      </div>
    </>
  );
};

const ToastSubmitSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'operator.save.success' })}</span>
      </div>
    </>
  );
};

const Operator = () => {
  const { formatMessage: f } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });
  const [showModal, setShowModal] = useState(false);
  const [showModalConfirmQc, setShowModalConfirmQc] = useState(false);
  const [confirmModal, setConfirm] = useState(false);
  const [productId, setProductId] = useState();
  const [productList, setProductList] = useState([]);
  const [productionData, setProductionData] = useState();
  const [toolingOptions, setToolingOptions] = useState([]);

  const [productNameOptions, setProductNameOptions] = useState();
  const [machineOptions, setMachineOptions] = useState();
  const componentRef = useRef(null);
  const [productListOptions, setProductListOptions] = useState();
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [actualAmount, setActualAmount] = useState();
  const [operationData, setOperationData] = useState();
  const [tableTab, setTableTab] = useState('fourt');
  const [filterData, setFilterData] = useState({
    productionOrderNo: '',
    productionOrderType: '',
    productionCuttingStatus: '',
    producedProductSize: '',
    productSubTypeName: '',
    productName: '',
  });
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const columns = useMemo(() => {
    return [
      {
        Header: () => f({ id: 'dailyPlan.field.date' }),
        accessor: 'date',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 position-relative',
        headerClassName: 'text-muted text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => cell.value || '-',
      },
    ];
  }, [f]);

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({
    page: 0,
    planDate: moment(new Date()).format('YYYY-MM-DD'),
    //  step: 11
  });
  const [pageCount, setPageCount] = useState(1);
  const [dataComplated, setDataComplated] = useState([]);
  const [filterComplated, setFilterComplated] = useState({ page: 0, status: 'COMPLETED' });
  const [pageCountComplated, setPageCountComplated] = useState(1);
  const [dataIndexList, setDataIndexList] = useState([]);

  const tableInstancePlan = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      dataIndexList,
      setDataIndexList,
      hideSearch: true,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      initialState: { sortBy: [{ id: 'planDate', desc: false }], hiddenColumns: ['id'] },
      globalFilter: 'custom',
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    // useRowSelect,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstancePlan;

  const { isFetching, refetch, isLoading } = useQuery(
    [QUERY.PRODPLAN_LIST, filter, pageSize, sortBy],
    () => getProductPlan({ filter: { ...filter }, limit: pageSize, sortBy: sortByFromTable(sortBy), planOptionsList }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        console.log(result);
        setData(result);
        setPageCount(pagination.totalPage);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );
  const { mutate: updateProductPlan, isLoading: isSaving } = useMutation(updateProductioPlanFn, {
    onSuccess(res) {
      console.debug('create tooling success :', res);
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('update tooling error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const { mutate: updateStatusPlan } = useMutation(editPlan, {
    onSuccess(response) {
      console.debug('create tooling success :', response);
      toast(<ToastSubmitSuccess />);

      console.log(response);
      console.log(operationData);
      console.log(actualAmount);
      if (operationData?.isLastStep) {
        const formData = {
          productionOrder: operationData?.productionOrderId,
          status: 'COMPLETED',
          completedAt: moment(new Date()).format('YYYY-MM-DD'),
          deliverAt: moment(operationData?.CODeliverDt).format('YYYY-MM-DD'),
          actualProducedAmount: (operationData?.productionPrintedAmount || 0) - actualAmount,
          planList: [],
        };
        console.log(formData);
        updateProductPlan(formData);
      }
    },
  });

  const callTooling = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/tooling/find` });
    const callGetMasterDataStatusType = async () => {
      const dataTooling = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE`);
      return dataTooling.data.data;
    };
    const resultDataStatusType = await callGetMasterDataStatusType();
    const list = [];
    dataProduct.data.data.dataList.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: { ...element, statusType: resultDataStatusType?.find((dataType) => dataType.code === element.statusType) },
      };
      list.push(obj);
    });

    setToolingOptions(list);
  };

  const callMachine = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/machine/find` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setMachineOptions(list);
  };

  const callProductionName = async () => {
    const dataProductCN = await request({ url: `${SERVICE_URL}/masterData/product/find` });
    const listCN = [];

    dataProductCN.data.data.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: element,
      };
      listCN.push(obj);
    });

    setProductListOptions(listCN);
    setProductNameOptions(listCN);
  };

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      PONo: globalFilter,
    }));
  }, [globalFilter]);

  useEffect(() => {
    callTooling();
    callMachine();
    callProductionName();
  }, []);

  const handleOnHideToolingTypeItem = () => {
    setShowModal(false);
    setConfirm(false);
  };

  const onSubmitModal = () => {
    console.log(operationData?.status);
    if (operationData?.status !== 'NEW') {
      setShowModal(false);
      setConfirm(true);
    } else {
      const formData = {
        productionOrder: operationData?.productionOrderId,
        step: operationData?.step?.value,
        status: 'INPROGRESS',
      };
      // updateStatusPlan({ id: operationData?.id, plan: formData });
      // setConfirm(false);
      // refetch();
    }
  };

  const handleConfirm = () => {
    setIsConfirmModal(false);
    return <ReactToPrint trigger={() => setIsConfirmModal(false)} content={() => componentRef.current} />;
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
  };

  const showModalComplete = async () => {
    const formData = {
      productionOrder: operationData?.productionOrderId,
      step: operationData?.step?.value,
      status: 'COMPLETED',
    };
    console.log(formData);
    updateStatusPlan({ id: operationData?.id, plan: formData });
    // ปะ เครื่อง step confirmed > completed ให้ทำการอัพเดทงานแพ็คไป pending ด้วย
    if (operationData.step === 22) {
      const dataStep = await request({ url: `${SERVICE_URL}/productionPlan/find?productionOrderNo=${operationData.productionOrderNo}&step=${25}` });
      const planId = dataStep.data.data[0].productSubType[0].planDate[0].itemList[0].id;
      console.log(dataStep);
      if (dataStep) {
        const form = {
          productionOrder: operationData?.productionOrderId,
          step: 25,
          status: 'PENDING',
        };
        console.log(form);
        updateStatusPlan({ id: planId, plan: form });
      }
    }
    setShowModal(false);
    setShowModalConfirmQc(false);
    refetch();
  };

  const onChangeDate = () => {
    refetch();
  };

  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, ...rest }) => {
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
              trigger={() => (
                <Button variant="info" size="small" onClick={onConfirm} disabled={loading}>
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const callSaveReIndex = ({ indexList }) => {
    console.log(indexList);
    return request({ url: `/productionPlan/reIndex`, method: 'post', data: { planList: indexList } });
  };

  const { mutate: saveReIndex } = useMutation(callSaveReIndex, {
    onSuccess(res) {
      console.log('create success :', res);
      refetch();
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('update error :', err);
    },
  });

  useEffect(() => {
    const toSortDataList = tableInstancePlan.dataIndexList?.map((item, newIndex) => ({
      id: item.id,
      index: newIndex + 1,
    }));
    if (toSortDataList.length > 0) {
      saveReIndex({ indexList: toSortDataList });
    }
  }, [tableInstancePlan.dataIndexList]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        setShowModal={setShowModal}
        setProductId={setProductId}
        componentRef={componentRef}
        buttons={{
          print: { label: f({ id: 'common.print' }), onPrint: () => setIsConfirmModal((prev) => !prev) },
        }}
      />
      <Table
        isOperation
        setShowModal={setShowModal}
        setProductId={setProductId}
        setProductList={setProductList}
        setProductionData={setProductionData}
        setOperationData={setOperationData}
        filterData={filterData}
        setConfirm={setConfirm}
        toolingOptions={toolingOptions}
        machineOptions={machineOptions}
        setFilterData={setFilterData}
        setTableTab={setTableTab}
        setShowModalConfirmQc={setShowModalConfirmQc}
        onChangeDate={onChangeDate}
        tableTab={tableTab}
        tabs={[
          {
            eventKey: 'fourt',
            label: ' ',
            tableInstance: tableInstancePlan,
            isLoading: isFetching,
            filter: FilterComponent,
          },
        ]}
      />

      {productNameOptions && machineOptions && productListOptions && (
        <InformationForm
          show={confirmModal}
          onHide={handleOnHideToolingTypeItem}
          setShowModal={setShowModal}
          setConfirm={setConfirm}
          id={productId}
          dataList={data}
          refetch={refetch}
          productNameOptions={productNameOptions}
          machineOptions={machineOptions}
          productListOptions={productListOptions}
          operationData={operationData}
          setActualAmount={setActualAmount}
          actualAmount={actualAmount}
          onChangeStatusInprogess={onSubmitModal}
        />
      )}
      <Modal backdrop="static" show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          {operationData?.productionCuttingStatus === 'COMPLETED' ? (
            <Modal.Title>{f({ id: `operator.list.confirm-operation` })}</Modal.Title>
          ) : (
            <Modal.Title>ยังไม่สามารถดำเนินการได้เนื่องจากยังไม่ได้ตัดกระดาษ</Modal.Title>
          )}
        </Modal.Header>
        {/* <Modal.Body className="pt-0">ฐ,</Modal.Body> */}
        <Modal.Footer className="p-3 px-5">
          <Button variant="outline-primary" onClick={() => setShowModal(false)}>
            {f({ id: 'common.cancel' })}
          </Button>
          <Button type="submit" variant="primary" disabled={operationData?.productionCuttingStatus !== 'COMPLETED'} onClick={onSubmitModal}>
            {f({ id: 'common.confirm' })}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal backdrop="static" show={showModalConfirmQc} onHide={() => setShowModalConfirmQc(false)} size="xs">
        <Modal.Header closeButton>
          <Modal.Title>{f({ id: `operator.list.confirm-operation` })}</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body className="pt-0">ฐ,</Modal.Body> */}
        <Modal.Footer className="p-3 px-5">
          <Button variant="outline-primary" onClick={() => setShowModalConfirmQc(false)}>
            {f({ id: 'common.cancel' })}
          </Button>
          <Button type="submit" variant="primary" onClick={showModalComplete}>
            {f({ id: 'common.confirm' })}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={isConfirmModal}
        // loading={supplier}
        // titleText={f({ id: 'common.warning' })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {isConfirmModal && (
        <OperationPrint
          ref={(el) => {
            componentRef.current = el;
          }}
          dataList={data}
          title={title}
          description={description}
        />
      )}
    </>
  );
};

export default Operator;
