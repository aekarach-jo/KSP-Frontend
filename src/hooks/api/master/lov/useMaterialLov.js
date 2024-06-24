import { groupBy } from 'lodash';
import { useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import queryClient from 'utils/query-client';

/**
 * @typedef {'typegroup'} MaterialLovCondition
 * @typedef {{
 *  condition: MaterialLovCondition | undefined
 * }} MaterialLovParams
 * @typedef {'MATERIAL_TYPE' |
 *  'MATERIAL_SUBTYPE' |
 *  'MATERIAL_GROUP' |
 *  'MATERIAL_ACTGROUP' |
 *  'MATERIAL_BASEUOM' |
 *  'MATERIAL_WEIGHINGUOM' |
 *  'MATERIAL_VOLUMETRICUOM' |
 *  'MATERIAL_DIMENSIONALUOM' |
 *  'MATERIAL_SELLINGUNIT' |
 *  'MATERIAL_STOREUNIT' |
 *  'MATERIAL_COLOR'} MaterialType
 * @typedef {{
 *  abbr: string,
 *  code: string,
 *  name: string,
 *  isFixed?: boolean,
 *  isDeleted?: boolean,
 *  id: string,
 *  type: MaterialType
 * }} MaterialItem
 */

/**
 * Transform function
 * @param {MaterialItem[]} data
 */
function transformLovByGroup(data) {
  return groupBy(data, 'type');
}

/**
 * @param {MaterialLovParams} params
 */
const materialListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/material/list',
    params,
  });

  const respData = resp.data?.data;
  return isGroup ? transformLovByGroup(respData) : respData;
};

const materialLovTypeGroupSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/material/save',
    method: 'post',
    data: {
      condition: 'typegroup',
      data,
    },
  });

  return resp.data?.data;
};

const unitOfMaterialGroupSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/material/save',
    method: 'post',
    data: {
      condition: 'uom',
      data,
    },
  });

  return resp.data?.data;
};

const colorSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/material/save',
    method: 'post',
    data: {
      condition: 'color',
      data,
    },
  });

  return resp.data?.data;
};

const useMaterialLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('materialLovAll', () => materialListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useMaterialLovTypeGroup = (queryOptions = {}) =>
  useQuery('materialLovAll', () => materialListReq({ condition: 'typegroup' }, true), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useMaterialLovTypeGroupList = (queryOptions = {}) =>
  useQuery('materialLovAllList', () => materialListReq({ condition: 'typegroup' }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useUnitOfMaterialGroup = (queryOptions = {}) =>
  useQuery('unitOfMaterial', () => materialListReq({ condition: 'uom' }, true), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useUnitOfMaterialList = (queryOptions = {}) =>
  useQuery('unitOfMaterialAll', () => materialListReq({ condition: 'uom' }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useColorGroup = (queryOptions = {}) =>
  useQuery('colorMaterial', () => materialListReq({ condition: 'color' }, true), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useColorList = (queryOptions = {}) =>
  useQuery('colorMaterialAll', () => materialListReq({ condition: 'color' }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useMaterialTypeGroupSelectFixed = () =>
  useMemo(
    () => [
      {
        id: 'MATERIAL_GROUP',
        name: 'กลุ่มวัสดุ',
      },
      {
        id: 'MATERIAL_ACTGROUP',
        name: 'กลุ่มบัญชี',
      },
      {
        id: 'MATERIAL_TYPE',
        name: 'ประเภทวัสดุ',
      },
      {
        id: 'MATERIAL_SUBTYPE',
        name: 'ประเภทย่อยวัสดุ',
      },
    ],
    []
  );

const useUnitOfMaterialSelectFixed = () =>
  useMemo(
    () => [
      {
        id: 'MATERIAL_BASEUOM',
        name: 'Base UOM',
      },
      {
        id: 'MATERIAL_WEIGHINGUOM',
        name: 'Weighing UOM',
      },
      {
        id: 'MATERIAL_STOREUNIT',
        name: 'Store Unit',
      },
      {
        id: 'MATERIAL_SELLINGUNIT',
        name: 'Selling Unit',
      },
      {
        id: 'MATERIAL_DIMENSIONALUOM',
        name: 'Dimensional UOM',
      },
      {
        id: 'MATERIAL_VOLUMETRICUOM',
        name: 'Volumetric Unit',
      },
    ],
    []
  );

const reloadAllCachesPromises = () =>
  Promise.all([
    queryClient.invalidateQueries('materialLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('materialLovAllList', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('unitOfMaterial', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('unitOfMaterialAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('colorMaterial', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('colorMaterialAll', { refetchActive: true, refetchInactive: true }),
  ]);

const useMaterialLovTypeGroupSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(materialLovTypeGroupSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useUnitOfMaterialGroupSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(unitOfMaterialGroupSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useColorpSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(colorSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useMaterialLovData = () => {
  return {
    useMaterialLov,
    useMaterialLovTypeGroup,
    useMaterialLovTypeGroupList,
    useMaterialTypeGroupSelectFixed,
    useMaterialLovTypeGroupSaveMutation,
    useUnitOfMaterialGroup,
    useUnitOfMaterialList,
    useUnitOfMaterialSelectFixed,
    useUnitOfMaterialGroupSaveMutation,
    useColorGroup,
    useColorList,
    useColorpSaveMutation,
  };
};

export default useMaterialLovData;
