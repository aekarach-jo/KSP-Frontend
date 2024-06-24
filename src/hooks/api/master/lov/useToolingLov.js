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

const statusTypeListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE',
    params,
  });

  const respData = resp.data?.data;
  return isGroup ? transformLovByGroup(respData) : respData;
};


const useToolingStatusTypeLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('statusTypeLovAll', () => statusTypeListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useToolingLov = () => {
  return {
    useToolingStatusTypeLov,
  };
};

export default useToolingLov;
