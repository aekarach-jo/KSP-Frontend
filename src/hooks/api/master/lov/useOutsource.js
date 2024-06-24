import { groupBy } from 'lodash';
import { useMutation, useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import queryClient from 'utils/query-client';

/**
 * @typedef {'typegroup'} ProductLovCondition
 * @typedef {{
 *  condition: ProductLovCondition | undefined
 * }} ProductLovParams
 * @typedef {
 *  'PRODUCT_PRINT' |
 *  'PRODUCT_COATING'
 * } ProductType
 * @typedef {{
 *  abbr: string,
 *  code: string,
 *  name: string,
 *  isFixed?: boolean,
 *  isDeleted?: boolean,
 *  id: string,
 *  type: ProductType
 * }} ProductItem
 */

/**
 * Transform function
 * @param {ProductItem[]} data
 */
function transformLovByGroup(data) {
  return groupBy(data, 'type');
}

/**
 * @param {ProductLovParams} params
 *
 */

const productPlanListReq = async () => {
  const resp = await request({
    url: '/productionPlan/productionOrderList',
  });

  const respData = resp.data?.data;
  return respData;
};
const callGetMasterTemplate = async () => {
  const resp = await request({
    url: '/outsource/lov/template/list',
  });

  const respData = resp.data?.data;
  return respData;
};
const supplierListReq = async () => {
  const resp = await request({
    url: '/masterData/supplier/find',
  });

  const respData = resp.data?.data;
  return respData;
};
const masterProductListReq = async () => {
  const resp = await request({
    url: '/masterData/product/find',
  });

  const respData = resp.data?.data;
  return respData;
};
const bomListReq = async (bomList = []) => {
  const resp = await request({
    url: '/bom/find',
  });

  const respData = resp.data?.data;
  return respData;
};
const customerOrderListReq = async () => {
  const resp = await request({
    url: '/customer/list',
  });
  const respData = resp.data?.data;
  return respData;
};
const saleOrderListReq = async () => {
  const resp = await request({
    url: '/saleOrder/find',
  });
  const respData = resp.data?.data;
  return respData;
};
const useEmployeeDataReq = async () => {
  const {
    data: { data },
  } = await request({
    url: '/employee/find?isDeleted=false',
  });
  return data;
};
const usePurchaseOrderDataReq = async () => {
  const {
    data: { data },
  } = await request({
    url: '/purchaseOrder/find?isDeleted=false',
  });
  return data;
};
const customerListReq = async () => {
  const {
    data: { data },
  } = await request({
    url: '/customer/find?isDeleted=false',
  });
  return data;
};
const companyListReq = async () => {
  const {
    data: { data },
  } = await request({
    url: '/masterData/company/find',
  });
  return data;
};
const unitListReq = async () => {
  const {
    data: { data },
  } = await request({
    url: '/masterData/lov/product/list?type=PRODUCT_BASEUOM',
  });
  return data;
};
const printTypeSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/product/save',
    method: 'post',
    data: {
      condition: 'print',
      data,
    },
  });

  return resp.data?.data;
};

const useProductPlan = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductPlan', () => productPlanListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useTemplateData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useTemplateData', () => callGetMasterTemplate({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useSupplierData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useSupplierData', () => supplierListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useMasterProductData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useMasterProductData', () => masterProductListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useCustomerOrderData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useCustomerOrderData', () => customerOrderListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useSalesOrderData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useSalesOrderData', () => saleOrderListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useBOMData = ({ bomList } = {}, { isGroup } = {}, queryOptions = {}) =>
  useQuery('useBOMData', () => bomListReq(bomList, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useCustomerData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useCustomerData', () => customerListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useCompanyData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useCompanyData', () => companyListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useLovUnitData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useLovUnitData', () => unitListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useEmployeeData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useEmployeeData', () => useEmployeeDataReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const usePurchaseOrderData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('usePurchaseOrderData', () => usePurchaseOrderDataReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const reloadAllCachesPromises = () =>
  Promise.all([
    queryClient.invalidateQueries('useProductPlan', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useTemplateData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useSupplierData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useMasterProductData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useCustomerOrderData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useSalesOrderData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useBOMData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useCustomerData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useCompanyData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useLovUnitData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useEmployeeData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('usePurchaseOrderData', { refetchActive: true, refetchInactive: true }),
  ]);

const usePrintTypeSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(printTypeSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });
const useQuotationLov = () => {
  return {
    useProductPlan,
    useTemplateData,
    useSupplierData,
    useMasterProductData,
    useCustomerOrderData,
    useSalesOrderData,
    useBOMData,
    useCustomerData,
    useCompanyData,
    useEmployeeData,
    usePurchaseOrderData,
    usePrintTypeSaveMutation,
    useLovUnitData,
  };
};

export default useQuotationLov;
