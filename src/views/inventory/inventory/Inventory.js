import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState, useRowSelect } from 'react-table';
import { useIntl } from 'react-intl';
import { SERVICE_URL } from 'config';
import { request } from 'utils/axios-utils';
import { Row, Col, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
// import Table from 'views/sales/components/table/Table';
import TableMultiInventory from 'views/sales/components/table/TableMultiInventory';
import InventorySearch from './components/InventorySearch';
import FilterComponent from './components/Filter';

import { API, INTL, NAVIGATION, QUERY } from './constants';
import { useAddReceivingItemInventory } from '../../receiving/components/FormMutation';
import ReceiveItemModal from '../../receiving/components/ReceiveItemModal';
import PurchaseItemModal from './components/PurchaseItemModal';

const callGetInventoryList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: API.FIND_INVENTORY_LIST, params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
};
const callGetInventorySupplier = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: '/inventory/material/find?isSupplier=true', params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
};
const callGetInventorySales = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: '/inventory/product/find?isSale=true', params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
};
const callGetProduct = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data = await request({ url: '/inventory/product/find', params: { ...filter, ...sortBy, page: page + 1, limit } });
  return data?.data;
};
const callGetInventoryCombineList = async ({ page = 0, limit = 10, filter = {}, sortBy = {} }) => {
  const data1 = await request({ url: API.FIND_INVENTORY_LIST, params: { ...filter, ...sortBy, page: page + 1, limit } });
  const data2 = await request({ url: '/inventory/product/find', params: { ...filter, ...sortBy, page: page + 1, limit } });

  // Combine data1 and data2
  const combinedData = {
    data: [...data1.data.data, ...data2.data.data],
    // pagination: {
    //   totalPage: data1.data.pagination.totalPage + data2.data.pagination.totalPage,
    // },
  };
  combinedData.data.forEach((element) => {
    if (element.materialId === undefined) {
      element.materialCode = element.productCode;
      element.materialName = element.productName;
    }
  });
  console.log(combinedData);
  return combinedData;
};

const callPurchaseItem = (data = {}) => {
  return request({ url: API.PURCHASE_ITEM, data, method: 'post' });
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

const Inventory = () => {
  const { formatMessage: f, formatDate: fd } = useIntl();
  const { push } = useHistory();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [data, setData] = useState([]);
  const [dataMat, setDataMat] = useState(false);
  const [dataProduct, setDataProduct] = useState([]);
  const [dataInventory, setDataInventory] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataSupplier, setDataSupplier] = useState([]);
  const [pageProductCount, setPageProductCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  // const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });

  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [inventoryReceiving, setInventoryReceiving] = useState(false);
  const [purchaseItemModal, setPurchaseItemModal] = useState(false);
  const [isSale, setIsSale] = useState(true);
  const [purchaseType, setPurchaseType] = useState({});
  const [purchasingItem, setPurchasingItem] = useState({});
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [listData, setListData] = useState([]);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('activeTab') !== 'KSP_RM' &&
      localStorage.getItem('activeTab') !== 'KSP_Product' &&
      localStorage.getItem('activeTab') !== 'Supplier' &&
      localStorage.getItem('activeTab') !== 'Sales'
      ? 'KSP_RM'
      : localStorage.getItem('activeTab')
  );
  const queryClient = useQueryClient();
  const columns = useMemo(() => {
    return [
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: '12%' }}>{f({ id: 'inventory.materialName' })}</div>
          );
        },
        accessor: 'materialName',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
              {f({ id: 'inventory.materialCode' })}
            </div>
          );
        },
        accessor: 'materialCode',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ row, cell }) => <NavLink to={`${NAVIGATION.INVENTORY_DETAIL}/${row.original.materialId}`}>{cell.value}</NavLink> || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.onHand' })}</div>;
        },
        accessor: 'amount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.available' })}</div>;
        },
        accessor: 'availableAmount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-4',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => (cell.value >= 0 || cell.value < 0 ? cell.value : '-'),
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.unit' })}</div>;
        },
        accessor: 'materialBaseUOM',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-5',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => (cell.value >= 0 || cell.value < 0 ? cell.value : '-'),
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
              {f({ id: 'inventory.lastUpdate' })}
            </div>
          );
        },
        accessor: 'updatedAt',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-6',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) || '-',
      },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mb-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
        headerProps: { xs: 12, md: 1 },
        headerClassName: 'd-none',
        Cell: ({ row }) => (
          <>
            <Button
              variant="info"
              className="btn-icon btn-icon-start mb-1 position-md-absolute"
              style={{ minWidth: 140 }}
              onClick={() => {
                setPurchaseItemModal(true);
                setPurchaseType({ value: '01', label: 'สั่งสำรองวัตถุดิบ' });
                setPurchasingItem(row.original);
              }}
              // disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="plus" /> <span>{f({ id: 'inventory.list.purchase' })}</span>
            </Button>
          </>
        ),
      },
    ];
  }, [f, fd]);
  const columnProduct = useMemo(() => {
    return [
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: '12%' }}>
              {f({ id: 'product.field.productName' })}
            </div>
          );
        },
        accessor: 'productName',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
              {f({ id: 'production.group.field.productCode' })}
            </div>
          );
        },
        accessor: 'productCode',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ row, cell }) => <NavLink to={`${NAVIGATION.INVENTORY_SALE_DETAIL}/${row.original.productId}`}>{cell.value}</NavLink> || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.onHand' })}</div>;
        },
        accessor: 'amount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.available' })}</div>;
        },
        accessor: 'availableAmount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-4',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '0',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.unit' })}</div>;
        },
        accessor: 'materialBaseUOM',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-5',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => f({ id: 'inventory.item' }),
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
              {f({ id: 'inventory.lastUpdate' })}
            </div>
          );
        },
        accessor: 'updatedAt',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-6',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) || '-',
      },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mb-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
        headerProps: { xs: 12, md: 1 },
        headerClassName: 'd-none',
        Cell: ({ row }) => (
          <>
            <Button
              variant="info"
              className="btn-icon btn-icon-start mb-1 position-md-absolute"
              style={{ minWidth: 140 }}
              disabled
              onClick={() => {
                setPurchaseItemModal(true);
                setPurchasingItem(row.original);
              }}
              // disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="plus" /> <span>{f({ id: 'inventory.list.purchase' })}</span>
            </Button>
          </>
        ),
      },
    ];
  }, [f, fd]);
  const columnSales = useMemo(() => {
    return [
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: '12%' }}>
              {f({ id: 'product.field.productName' })}
            </div>
          );
        },
        accessor: 'productName',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
              {f({ id: 'production.group.field.productCode' })}
            </div>
          );
        },
        accessor: 'productCode',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ row, cell }) => <NavLink to={`${NAVIGATION.INVENTORY_SALE_DETAIL}/${row.original.productId}?isSale=${isSale}`}>{cell.value}</NavLink> || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.onHand' })}</div>;
        },
        accessor: 'amount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.available' })}</div>;
        },
        accessor: 'availableAmount',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-4',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => cell.value || '0',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.unit' })}</div>;
        },
        accessor: 'materialBaseUOM',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-5',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => f({ id: 'inventory.item' }),
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
              {f({ id: 'inventory.lastUpdate' })}
            </div>
          );
        },
        accessor: 'updatedAt',
        sortable: true,
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-6',
        headerClassName: 'text-medium text-uppercase',
        headerProps: { xs: 4, md: 2 },
        Cell: ({ cell }) => fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) || '-',
      },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mb-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
        headerProps: { xs: 12, md: 1 },
        headerClassName: 'd-none',
        Cell: ({ row }) => (
          <>
            <Button
              variant="info"
              className="btn-icon btn-icon-start mb-1 position-md-absolute"
              style={{ minWidth: 140 }}
              disabled
              onClick={() => {
                setPurchaseItemModal(true);
                setPurchasingItem(row.original);
              }}
              // disabled={row.original.availableAmount <= 0}
            >
              <CsLineIcons icon="plus" /> <span>{f({ id: 'inventory.list.purchase' })}</span>
            </Button>
          </>
        ),
      },
    ];
  }, [f, fd]);
  // const columnProduct = useMemo(() => {
  //   return [
  //     {
  //       Header: () => {
  //         return (
  //           <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '5px', width: '12%' }}>
  //             {dataMat ? f({ id: 'product.field.productName' }) : f({ id: 'inventory.materialName' })}
  //           </div>
  //         );
  //       },
  //       accessor: dataMat ? 'productName' : 'materialName',
  //       sortable: true,
  //       colClassName: 'd-flex flex-column mb-2 order-1 order-md-1 position-relative',
  //       headerClassName: 'text-medium text-uppercase',
  //       headerProps: { xs: 12, md: 11 },
  //       Cell: ({ cell }) => cell.value || '-',
  //     },
  //     {
  //       Header: () => {
  //         // setDataMat(cell);
  //         return (
  //           <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
  //             {dataMat ? f({ id: 'production.group.field.productCode' }) : f({ id: 'inventory.materialCode' })}
  //           </div>
  //         );
  //       },
  //       accessor: 'materialCode',
  //       sortable: true,
  //       colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
  //       headerClassName: 'text-medium text-uppercase',
  //       headerProps: { xs: 4, md: 2 },
  //       Cell: ({ row, cell }) => {
  //         console.log(cell);
  //         return cell.row.original.materialId !== undefined ? (
  //           <NavLink to={`${NAVIGATION.INVENTORY_DETAIL}/${row.original.materialId}`}>{cell.value}</NavLink>
  //         ) : (
  //           <NavLink to={`${NAVIGATION.INVENTORY_SALE_DETAIL}/${row.original.productId}`}>{cell.value}</NavLink>
  //         );
  //       },
  //     },
  //     {
  //       Header: () => {
  //         return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.onHand' })}</div>;
  //       },
  //       accessor: 'amount',
  //       sortable: true,
  //       colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-2 order-md-3',
  //       headerClassName: 'text-medium text-uppercase',
  //       headerProps: { xs: 4, md: 2 },
  //       Cell: ({ cell }) => cell.value || '-',
  //     },
  //     {
  //       Header: () => {
  //         return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.available' })}</div>;
  //       },
  //       accessor: 'availableAmount',
  //       sortable: true,
  //       colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-4',
  //       headerClassName: 'text-medium text-uppercase',
  //       headerProps: { xs: 4, md: 2 },
  //       Cell: ({ cell }) => cell.value || '0',
  //     },
  //     {
  //       Header: () => {
  //         return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'inventory.unit' })}</div>;
  //       },
  //       accessor: 'materialBaseUOM',
  //       sortable: true,
  //       colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-5',
  //       headerClassName: 'text-medium text-uppercase',
  //       headerProps: { xs: 4, md: 2 },
  //       Cell: ({ cell }) => f({ id: 'inventory.item' }),
  //     },
  //     {
  //       Header: () => {
  //         return (
  //           <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px' }}>
  //             {f({ id: 'inventory.lastUpdate' })}
  //           </div>
  //         );
  //       },
  //       accessor: 'updatedAt',
  //       sortable: true,
  //       colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-6',
  //       headerClassName: 'text-medium text-uppercase',
  //       headerProps: { xs: 4, md: 2 },
  //       Cell: ({ cell }) => fd(cell.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) || '-',
  //     },
  //     {
  //       id: 'action',
  //       colClassName: 'd-flex flex-column justify-content-center align-items-md-end mt-2 mb-2 mt-md-0 mb-md-0 order-last text-end order-md-2 position-relative',
  //       headerProps: { xs: 12, md: 1 },
  //       headerClassName: 'd-none',
  //       Cell: ({ row, cell }) => (
  //         <>
  //           <Button
  //             variant="info"
  //             className="btn-icon btn-icon-start mb-1 position-md-absolute"
  //             style={{ minWidth: 140 }}
  //             disabled={cell.row.original.materialId === undefined}
  //             onClick={() => {
  //               setPurchaseItemModal(true);
  //               setPurchasingItem(row.original);
  //             }}
  //             // disabled={row.original.availableAmount <= 0}
  //           >
  //             <CsLineIcons icon="plus" /> <span>{f({ id: 'inventory.list.purchase' })}</span>
  //           </Button>
  //         </>
  //       ),
  //     },
  //   ];
  // }, [f, fd]);
  const columnsCombined = useMemo(() => {
    // Return the combined columns based on the selected tab
    return columnSales;
  }, [f, fd, activeTab]);

  const setManualGlobalFilterSearch = (materialName) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      materialName,
    }));
  };
  const setManualGlobalFilterSaleSearch = (productName) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      productName,
    }));
  };

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount,
      placeholderText: f({ id: 'common.search.productInventory' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  const tableInstanceSale = useTable(
    {
      columns: columnSales,
      data: dataSale,
      setData: setDataSale,
      setFilter,
      setGlobalFilter: setManualGlobalFilterSaleSearch,
      manualGlobalFilter: true,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      // autoResetSortBy: false,
      placeholderText: f({ id: 'common.search.product' }),
      pageCount: pageProductCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'productCode', desc: true }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );
  const tableInstanceProduct = useTable(
    {
      columns: columnProduct,
      data: dataProduct,
      setData: setDataProduct,
      setFilter,
      setGlobalFilter: setManualGlobalFilterSaleSearch,
      manualGlobalFilter: true,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      // autoResetSortBy: false,
      placeholderText: f({ id: 'common.search.product' }),
      pageCount: pageProductCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'productCode', desc: true }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );
  const tableInstanceInventory = useTable(
    {
      columns,
      data: dataInventory,
      setData: setDataInventory,
      filter,
      setFilter,
      setGlobalFilter: setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount,
      placeholderText: f({ id: 'common.search.inventory' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  // const tableInstanceProduct = useTable(
  //   {
  //     columns: columnProduct,
  //     data,
  //     setData,
  //     setFilter,
  //     setGlobalFilter: setManualGlobalFilterSaleSearch,
  //     manualGlobalFilter: true,
  //     manualPagination: true,
  //     manualFilters: true,
  //     manualSortBy: true,
  //     autoResetPage: false,
  //     hideControl: true,
  //     // autoResetSortBy: false,
  //     placeholderText: f({ id: 'common.search.inventory' }),
  //     pageCount,
  //     initialState: { pageIndex: 0, sortBy: [{ id: 'productCode', desc: true }], hiddenColumns: ['id'] },
  //   },
  //   useGlobalFilter,
  //   useSortBy,
  //   usePagination,
  //   useRowSelect,
  //   useRowState
  // );
  const tableInstanceSupplier = useTable(
    {
      columns,
      data: dataSupplier,
      setData: setDataSupplier,
      filter,
      setFilter,
      setGlobalFilter: setManualGlobalFilterSearch,
      initialState: { pageIndex: 0, sortBy: [{ id: 'no', desc: false }] },
      manualGlobalFilter: true,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      hideControl: true,
      pageCount,
      placeholderText: f({ id: 'common.search.inventory' }),
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  let activeTable = '';
  if (activeTab === 'KSP_RM') {
    activeTable = tableInstanceInventory;
  } else if (activeTab === 'KSP_Product') {
    activeTable = tableInstanceProduct;
  } else if (activeTab === 'Supplier') {
    activeTable = tableInstanceSupplier;
  } else {
    activeTable = tableInstanceSale;
  }

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = activeTable;

  // const { isFetching: isFetchingInventory } = useQuery(
  //   [QUERY.INVENTORY, pageSize, filter, sortBy],
  //   () => callGetInventoryList({ limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
  //   {
  //     enabled: true,
  //     refetchOnWindowFocus: false,
  //     onSuccess(resp) {
  //       const { data: result, pagination } = resp;
  //       setData(result);
  //       setPageCount(pagination?.totalPage);
  //       // setTotal(pagination.total);
  //       // setPageIndex(pagination.page - 1);
  //     },
  //     onError(err) {
  //       console.error('Error fetching sales order list', err);
  //     },
  //   }
  // );
  // const { isFetching } = useQuery(
  //   ['productList', pageSize, filter, sortBy],
  //   () => callGetInventoryCombineList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
  //   {
  //     enabled: true,
  //     refetchOnWindowFocus: false,
  //     onSuccess(resp) {
  //       const { data: resultResp, pagination } = resp;
  //       setData(resultResp);
  //       setPageCount(pagination?.totalPage);
  //       // setTotal(pagination.total);
  //       // setPageIndex(pagination.page - 1);
  //     },
  //     onError(err) {
  //       console.error('Error fetching sales order list', err);
  //     },
  //   }
  // );
  const { isFetching: isFetchingSales } = useQuery(
    ['salesList', pageSize, filter, sortBy],
    () => callGetInventorySales({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: resultResp, pagination } = resp;
        setDataSale(resultResp);
        setPageProductCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
  const { isFetching: isFetchingProduct } = useQuery(
    ['productList', pageSize, filter, sortBy],
    () => callGetProduct({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: resultResp, pagination } = resp;
        setDataProduct(resultResp);
        setPageProductCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching product order list', err);
      },
    }
  );
  const { isFetching: isFetchingInventory } = useQuery(
    ['inventoryList', pageSize, filter, sortBy],
    () => callGetInventoryList({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: resultResp, pagination } = resp;
        setDataInventory(resultResp);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
  const { isFetching: isFetchingSupplier } = useQuery(
    ['supplierList', pageSize, filter, sortBy],
    () => callGetInventorySupplier({ page, limit: pageSize, filter, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: resultResp, pagination } = resp;
        setDataSupplier(resultResp);
        setPageCount(pagination?.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching sales order list', err);
      },
    }
  );
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
  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    console.log(activeTab);
    if (activeTab === 'KSP_RM') {
      setFilter((currentFilter) => ({
        ...currentFilter,
        page: globalFilter !== undefined && 0,
        materialName: globalFilter,
      }));
    } else if (activeTab === 'KSP_Product') {
      setFilter((currentFilter) => ({
        ...currentFilter,
        page: globalFilter !== undefined && 0,
        productName: globalFilter,
      }));
    } else if (activeTab === 'Supplier') {
      setFilter((currentFilter) => ({
        ...currentFilter,
        page: globalFilter !== undefined && 0,
        materialName: globalFilter,
      }));
    } else {
      setFilter((currentFilter) => ({
        ...currentFilter,
        page: globalFilter !== undefined && 0,
        productName: globalFilter,
      }));
    }
  }, [globalFilter, activeTab]);
  useEffect(async () => {
    queryClient.resetQueries(QUERY.INVENTORY_DETAIL);
    const onFetch = await onFetchType();
    setListData(onFetch);
  }, [queryClient]);

  const afterAddItem = () => {
    setIsPurchasing(false);
    setPurchaseItemModal(false);
  };
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
    localStorage.setItem('activeTab', eventKey);
  };
  const { mutate: addReceivingItemInventory } = useAddReceivingItemInventory({ afterAddItem });
  const { mutate: purchaseItem } = useMutation((currentData) => callPurchaseItem(currentData), {
    onSuccess(res) {
      afterAddItem();
      toast('สั่งซื้อสำเร็จ');
      push(`${NAVIGATION.PURCHASE_ORDER}/${res?.data?.data?.id}`);
    },
    onError(err) {
      afterAddItem();
      toast.error('สั่งซื้อล้มเหลว');
      console.error('purchase item error :', err);
    },
  });

  return (
    <>
      <HtmlHead title={title} />
      <PageTitle
        title={title}
        description={description}
        buttons={{
          receiving: {
            label: f({ id: 'receiving.list.title' }),
            onSubmit: () => {
              setReceiveModal(true);
              setInventoryReceiving(true);
              // setReceivingItem(values);
            },
          },
        }}
      />

      <TableMultiInventory
        // filter={FilterComponent}
        // isLoading={isFetching}
        tabs={[
          {
            eventKey: 'KSP_RM',
            label: f({ id: 'common.kspRm' }),
            tableInstance: tableInstanceInventory,
            isLoading: isFetchingInventory,
            // filter: ,
          },
          {
            eventKey: 'KSP_Product',
            label: f({ id: 'common.kspProduct' }),
            tableInstance: tableInstanceProduct,
            isLoading: isFetchingProduct,
            // filter: ,
          },
          {
            eventKey: 'Supplier',
            label: f({ id: 'common.kspSupplier' }),
            tableInstance: tableInstanceSupplier,
            isLoading: isFetchingSupplier,
            // filter: ,
          },
          {
            eventKey: 'Sales',
            label: f({ id: 'common.productForSale' }),
            tableInstance: tableInstanceSale,
            isLoading: isFetchingSales,
            // filter: ,
          },
        ]}
        onTabChange={handleTabChange}
        activeKey={activeTab}
      />
      <PurchaseItemModal
        isPurchasing={isPurchasing}
        purchaseType={purchaseType}
        show={purchaseItemModal}
        onAdd={(addedItem) => {
          setIsPurchasing(true);
          purchaseItem(addedItem);
        }}
        onHide={() => {
          setPurchaseItemModal(false);
          setPurchasingItem({});
        }}
        data={purchasingItem}
      />
      <ReceiveItemModal
        isReceiving={isReceiving}
        show={receiveModal}
        onAdd={(addItem) => {
          setIsReceiving(true);
          addReceivingItemInventory(addItem);
        }}
        onHide={() => {
          setReceiveModal(false);
          // setReceivingItem({});
        }}
        listData={listData}
        data={data}
        inventoryReceiving={inventoryReceiving}
      />
    </>
  );
};

export default Inventory;
