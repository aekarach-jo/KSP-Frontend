import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { Button, Tab, Nav, NavLink, Row, OverlayTrigger, Tooltip, Col } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import GeneratePastelColors from 'views/production/product2Produce/components/PastelPersistHash';

export const useProductionTableInstance = ({ setShowModal, setProductId, setProductList, setProductionData }) => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState();
  const [pageCount, setPageCount] = useState(1);
  const { push } = useHistory();

  // Table columns
  const columns = useMemo(() => {
    return [
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.product' }),
        accessor: 'productAbbr',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <div>
              {cell.row.original.isWork && <CsLineIcons className="text-warning mb-1" icon="email" />} {cell.value || '-'}
            </div>
          );
        },
      },
      {
        Header: () => f({ id: 'production.produce.customer' }),
        accessor: 'customerName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 3,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.producedAmount' }),
        accessor: 'producedAmount',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.cutting-status' }),
        accessor: 'productionCuttingStatus',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <>
              {`${
                (cell.value === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                (cell.value === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                (cell.value === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                (cell.value === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
              } `}
            </>
          );
        },
      },
      {
        Header: () => f({ id: 'production.produce.createdAt' }),
        accessor: 'productionOrderCreatedAt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{moment(cell.value).add(543, 'year').format('DD/MM/YYYY') || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.CODeliverDt' }),
        accessor: 'CODeliverDt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{moment(cell.value).add(543, 'year').format('DD/MM/YYYY') || '-'}</>;
        },
      },
      {
        Header: () => '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          const outputSubTypeColor = GeneratePastelColors(cell.row.original?.productSubTypeName || '');
          const outputPrintColor = GeneratePastelColors(cell.row.original?.productPrintCategory || '');
          console.log(cell.row.original);

          return (
            <Row>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Print Category {cell.row.original?.productPrintCategory}</Tooltip>}>
                  <div style={{ background: outputPrintColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{cell.row.original?.productSubTypeName}</Tooltip>}>
                  <div style={{ background: outputSubTypeColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
            </Row>
          );
        },
      },
    ];
  }, [f, fD, fT]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, group) => {
        setShowModal(true);
        setProductId(undefined);
        setProductList(item);
        setProductionData(item);
      },
    }),
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      setPageCount,
      rowProps,
      planTab: 3,
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no: globalFilter,
    }));
  }, [globalFilter]);

  return tableInstance;
};

export const useProductPlanDraftTableInstance = ({ setShowModal, setProductId, setProductList }) => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState();
  const [pageCount, setPageCount] = useState(1);

  // Table columns
  const columns = useMemo(() => {
    return [
      // {
      //   accessor: 'id',
      // },
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.product' }),
        accessor: 'productAbbr',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <div>
              {cell.row.original.status === 'SUBMITTED' && <CsLineIcons className="text-success mb-1" icon="check-circle" />} {cell.value || '-'}
            </div>
          );
        },
      },
      {
        Header: () => f({ id: 'production.produce.customer' }),
        accessor: 'customerName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 3,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.producedAmount' }),
        accessor: 'producedAmount',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.cutting-status' }),
        accessor: 'productionCuttingStatus',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <>
              {`${
                (cell.value === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                (cell.value === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                (cell.value === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                (cell.value === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
              } `}
            </>
          );
        },
      },

      {
        Header: () => f({ id: 'production.produce.status' }),
        accessor: 'currentStep',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell?.value?.label || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.createdAt' }),
        accessor: 'productionOrderCreatedAt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{moment(cell.value).add(543, 'year').format('DD/MM/YYYY') || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.CODeliverDt' }),
        accessor: 'CODeliverDt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{moment(cell.value).add(543, 'year').format('DD/MM/YYYY') || '-'}</>;
        },
      },
      {
        Header: () => '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          const outputSubTypeColor = GeneratePastelColors(cell.row.original?.productSubTypeName || '');
          const outputPrintColor = GeneratePastelColors(cell.row.original?.productPrintCategory || '');
          return (
            <Row>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Print Category {cell.row.original?.productPrintCategory}</Tooltip>}>
                  <div style={{ background: outputPrintColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{cell.row.original?.productSubTypeName}</Tooltip>}>
                  <div style={{ background: outputSubTypeColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
            </Row>
          );
        },
      },
    ];
  }, [f, fD, fT]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, productId) => {
        setShowModal(true);
        setProductId(productId);
        setProductList(item);
      },
    }),
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      setPageCount,
      rowProps,
      planTab: 2,
      initialState: { pageIndex: 0, sortBy: [{ id: 'createdAt', desc: true }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      no: globalFilter,
    }));
  }, [globalFilter]);

  return tableInstance;
};

export const useProductPlanTableInstance = ({
  setShowModal,
  setProductId,
  setProductList,
  setShowModalReceive,
  updateStatusReceivingItem,
  setOnDeliverRefetch,
}) => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);
  const onSetShowModalReceive = (list) => {
    setShowModalReceive(true);
    setProductList(list);
  };
  const columns = useMemo(() => {
    return [
      // {
      //   accessor: 'id',
      // },
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.product' }),
        accessor: 'productAbbr',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.customer' }),
        accessor: 'customerName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 3,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.producedAmount' }),
        accessor: 'producedAmount',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.cutting-status' }),
        accessor: 'productionCuttingStatus',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <>
              {`${
                (cell.value === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                (cell.value === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                (cell.value === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                (cell.value === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
              } `}
            </>
          );
        },
      },

      {
        Header: () => f({ id: 'production.produce.status' }),
        accessor: 'currentStep',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell?.value?.label || '-'}</>;
        },
      },

      {
        Header: () => f({ id: 'production.produce.createdAt' }),
        accessor: 'productionOrderCreatedAt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{moment(cell.value).add(543, 'year').format('DD/MM/YYYY') || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.CODeliverDt' }),
        accessor: 'CODeliverDt',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{moment(cell.value).add(543, 'year').format('DD/MM/YYYY') || '-'}</>;
        },
      },
      {
        accessor: 'productionOrder',
        headerClassName: 'text-medium text-uppercase', // Header styles
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          // Cell component
          return (
            <Row>
              <Button
                variant="warning"
                className="btn-icon btn-icon-only mb-1 btn btn-info btn-sm"
                disabled={cell.row.original.productionReceivedStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetShowModalReceive(cell.row.original);
                }}
              >
                <CsLineIcons icon="destination" />
              </Button>{' '}
              <Button
                variant="success"
                className="btn-icon btn-icon-only mb-1 btn btn-dark btn-sm"
                disabled={cell.row.original.productionDeliveredStatus}
                hidden={!cell.row.original.productionReceivedStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  const tempData = { productionOrder: cell.row.original.productionOrderId, deliveredStatus: true };
                  updateStatusReceivingItem(tempData);
                  setOnDeliverRefetch(true);
                }}
              >
                <CsLineIcons icon="navigate-diagonal" />
              </Button>
            </Row>
          );
        },
      },
    ];
  }, [f, fD, fT]);

  const rowProps = useMemo(
    () => ({
      onClick: (_, item, productId) => {
        setShowModal(true);
        setProductId(productId);
        setProductList(item);
      },
    }),
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      rowProps,
      setPageCount,
      planTab: 1,
      initialState: { pageIndex: 0, sortBy: [{ id: 'planDate', desc: false }] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;
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

  return tableInstance;
};
export const useOperationTableInstance = () => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);
  const [dataIndexList, setDataIndexList] = useState([]);

  const columns = useMemo(() => {
    return [
      // {
      //   accessor: 'id',
      // },
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.product' }),
        accessor: 'productAbbr',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.customer' }),
        accessor: 'customerName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 3,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.producedAmount' }),
        accessor: 'producedAmount',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.cutting-status' }),
        accessor: 'productionCuttingStatus',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <>
              {`${
                (cell.value === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                (cell.value === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                (cell.value === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                (cell.value === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
              } `}
            </>
          );
        },
      },

      {
        Header: () => f({ id: 'production.produce.status' }),
        accessor: 'currentStep',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell?.value?.label || '-'}</>;
        },
      },
      {
        Header: () => '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          const outputSubTypeColor = GeneratePastelColors(cell.row.original?.productSubTypeName || '');
          const outputPrintColor = GeneratePastelColors(cell.row.original?.productPrintCategory || '');
          return (
            <Row>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Print Category {cell.row.original?.productPrintCategory}</Tooltip>}>
                  <div style={{ background: outputPrintColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{cell.row.original?.productSubTypeName}</Tooltip>}>
                  <div style={{ background: outputSubTypeColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
            </Row>
          );
        },
      },
    ];
  }, [f, fD, fT]);

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      dataIndexList,
      setDataIndexList,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      hidePageSize: false,
      hideSearch: false,
      pageCount,
      setPageCount,
      initialState: { sortBy: [{ id: 'planDate', desc: false }], hiddenColumns: ['id'] },
      globalFilter: 'custom',
      type: 'UNGROUP',
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    // useRowSelect,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  useEffect(() => {
    console.log('ungroup-------------1');
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    console.log('ungroup-------------2');
    setFilter((currentFilter) => ({
      ...currentFilter,
      PONo: globalFilter,
    }));
  }, [globalFilter]);

  return tableInstance;
};
export const useOperationTableInstanceGroup = () => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);
  const [dataIndexList, setDataIndexList] = useState([]);

  const columns = useMemo(() => {
    return [
      // {
      //   accessor: 'id',
      // },
      {
        Header: () => f({ id: 'production.produce.manufacturing.field.product' }),
        accessor: 'productAbbr',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.customer' }),
        accessor: 'customerName',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 3,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 2,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.producedAmount' }),
        accessor: 'producedAmount',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell.value || '-'}</>;
        },
      },
      {
        Header: () => f({ id: 'production.produce.cutting-status' }),
        accessor: 'productionCuttingStatus',
        sortable: true,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return (
            <>
              {`${
                (cell.value === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                (cell.value === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                (cell.value === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                (cell.value === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
              } `}
            </>
          );
        },
      },

      {
        Header: () => f({ id: 'production.produce.status' }),
        accessor: 'currentStep',
        sortable: true,
        headerClassName: 'text-medium text-uppercase w-10',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          return <>{cell?.value?.label || '-'}</>;
        },
      },
      {
        Header: () => '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-uppercase',
        colProps: {
          md: 1,
        },
        Cell: ({ cell }) => {
          const outputSubTypeColor = GeneratePastelColors(cell.row.original?.productSubTypeName || '');
          const outputPrintColor = GeneratePastelColors(cell.row.original?.productPrintCategory || '');
          return (
            <Row>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Print Category {cell.row.original?.productPrintCategory}</Tooltip>}>
                  <div style={{ background: outputPrintColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
              <Col sm="1" md="1" lg="1">
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{cell.row.original?.productSubTypeName}</Tooltip>}>
                  <div style={{ background: outputSubTypeColor, borderRadius: '50%', width: '10px', height: '10px' }}> </div>
                </OverlayTrigger>
              </Col>
            </Row>
          );
        },
      },
    ];
  }, [f, fD, fT]);

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      dataIndexList,
      setDataIndexList,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      hidePageSize: false,
      hideSearch: false,
      pageCount,
      setPageCount,
      initialState: { sortBy: [{ id: 'planDate', desc: false }], hiddenColumns: ['id'] },
      globalFilter: 'custom',
      type: 'GROUP',
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    // useRowSelect,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  useEffect(() => {
    console.log('group-------------1');
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    console.log('group-------------2');
    setFilter((currentFilter) => ({
      ...currentFilter,
      PONo: globalFilter,
    }));
  }, [globalFilter]);

  return tableInstance;
};
