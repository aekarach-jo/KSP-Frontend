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

const employeeListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/employee/find',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const methodListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/product/list',
    params,
  });

  const respData = resp.data?.data;
  return isGroup ? transformLovByGroup(respData) : respData;
};

const productListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/product/find',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const expenseListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/quotation/lov/expense/list',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const UOMListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/material/list?condition=uom',
    params,
  });

  const respData = resp.data?.data;
  return isGroup ? transformLovByGroup(respData) : respData;
};

const companyListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/company/find',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const materialListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/machine/list',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const machineListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/material/find',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const customerListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/customer/find',
    params,
  });

  const respData = resp.data?.data;
  return respData;
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

const coatingTypeSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/product/save',
    method: 'post',
    data: {
      condition: 'coating',
      data,
    },
  });

  return resp.data?.data;
};

const useUOMLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('UOMLovAll', () => UOMListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useComapnyLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('companyLovAll', () => companyListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useMachineLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('machineLovAll', () => machineListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useMaterialLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('materialLovAll', () => machineListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useCustomerLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('customerLovAll', () => customerListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useExpenseLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('expenseLovAll', () => expenseListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProductLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('productLovAll', () => productListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useEmployeeLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('employeeLovAll', () => employeeListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useMethodLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('methodLovAll', () => methodListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProductLovTypePrint = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('productLovTypePrint', () => productListReq({ type: 'PRODUCT_PRINT' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProductLovTypeCoating = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductLovTypeCoating', () => productListReq({ type: 'PRODUCT_COATING' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const reloadAllCachesPromises = () =>
  Promise.all([
    queryClient.invalidateQueries('companyLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('employeeLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('machineLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('materialLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('customerLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('methodLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('UOMLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('expenseLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('productLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('productLovTypePrint', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useProductLovTypeCoating', { refetchActive: true, refetchInactive: true }),
  ]);

const usePrintTypeSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(printTypeSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useCoatingTypeSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(coatingTypeSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useQuotationLov = () => {
  return {
    useUOMLov,
    useMethodLov,
    useComapnyLov,
    useMachineLov,
    useExpenseLov,
    useProductLov,
    useMaterialLov,
    useCustomerLov,
    useEmployeeLov,
    useProductLovTypePrint,
    useProductLovTypeCoating,
    usePrintTypeSaveMutation,
    useCoatingTypeSaveMutation,
  };
};

export default useQuotationLov;
