/* eslint-disable no-unneeded-ternary */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import { API, QUERY } from '../constants';

const productPlanRespTransform = (res, planOptionsList) => {
  const filterProductionOrderItemList = [];
  res.data.data?.map((e) => {
    e.productSubType.forEach((itemRes) => {
      filterProductionOrderItemList.push({
        producedSize: `${e.producedSize} ${itemRes.productSubTypeName}`,
        itemList: itemRes.itemList.map((data) => {
          return {
            ...data,
            step: planOptionsList.find((item) => item.value === data.step),
          };
        }),
      });
    });

    return {
      producedSize: e?.producedSize,
      productSubType: e.productSubType,
      itemList: e?.itemList?.filter((s) => s?.productionOrderId === undefined),
    };
  });

  const objData = {
    data: filterProductionOrderItemList,
    error: res.data.error,
    message: res.data.message,
    pagination: res.data.pagination,
  };
  return objData;
};

const getProductPlan = async ({ filter, limit = 10, sortBy = {}, planOptionsList }) => {
  const res = await request({ url: API.FIND_PRODPLAN_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  console.log(res);
  return res.data;
};

const getProductPlanGroup = async ({ filter, limit = 10, sortBy = {}, planOptionsList }) => {
  const res = await request({ url: API.FIND_PRODPLAN_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  console.log(res);
  return res.data;
};

const productionDraftReq = (res) => {
  return res.data;
};

const searchProduction = async ({ filter, sortBy = {}, page = 0 }) => {
  const res = await request({
    url: API.FIND_PRODUCTIONORDER_LIST,
    params: {
      ...filter,
      page: page + 1,
      limit: 100,
      // status: 'NOTSTART',
    },
  });

  const resDraft = await request({
    url: API.FIND_PRODUCTIONORDER_LIST,
    params: {
      statusMulti: 'INPROGRESS,SUBMITTED',
      page: page + 1,
      limit: 100,
    },
  });

  // console.log(res.data.data);
  // console.log(resDraft.data.data);

  const bProductIdDict = {};
  resDraft.data.data.forEach((bItem) => {
    bItem.productSubType.forEach((bSubType) => {
      bSubType.itemList.forEach((item) => {
        bProductIdDict[item.productId] = true;
      });
    });
  });

  const modifiedA = res.data.data.map((aItem) => {
    const modifiedProductSubType = aItem.productSubType.map((aSubType) => {
      const modifiedItemList = aSubType.itemList.map((item) => {
        const isWork = bProductIdDict[item.productId] ? true : false;
        return { ...item, isWork };
      });
      return { ...aSubType, itemList: modifiedItemList };
    });
    return { ...aItem, productSubType: modifiedProductSubType };
  });

  return { data: modifiedA };
};
const searchProductionDraft = async ({ filter, sortBy = {}, page = 0 }) => {
  const res = await request({
    url: API.FIND_PRODUCTIONORDER_LIST,
    params: {
      ...filter,
      page: page + 1,
      limit: 100,
    },
  });

  return productionDraftReq(res);
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

export const getProductionQuery = ({ tableInstance, tableTab }) => {
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const query = useQuery(
    [QUERY.PRODUCTION_LIST, filter, pageSize, sortBy],
    () => searchProduction({ filter: { ...filter, status: 'NOTSTART' }, page, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: tableTab === 'first',
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result = [] } = resp;
        const filterProductionOrderItemList = [];
        if (result.length > 0) {
          result?.map((res) => {
            res?.productSubType?.forEach((itemRes) => {
              const newArr = itemRes.itemList.map((item) => {
                const findStep = planOptionsList.find((itemF) => itemF?.value === (item?.currentStep?.step || ''));
                filterProductionOrderItemList.push({ ...item, currentStep: findStep || '', producedSize: `${res.producedSize} ${itemRes.productSubTypeName}` });
                return { ...item, currentStep: findStep || '', producedSize: `${res.producedSize} ${itemRes.productSubTypeName}` };
              });
            });

            return {
              producedSize: res?.producedSize,
              productSubType: res.productSubType,
              itemList: res?.itemList?.filter((s) => s?.productionOrderId === undefined),
            };
          });
        }

        console.log(filterProductionOrderItemList);
        setData((tableTab === 'first' && filterProductionOrderItemList) || []);
        setPageCount(result.totalPages);
      },
      onError(err) {
        console.error('Error fetching company list', err);
      },
    }
  );

  return query;
};

export const getProductPlanDraftQuery = ({ tableInstance, tableTab }) => {
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { formatMessage: f } = useIntl();
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const query = useQuery(
    [QUERY.PRODPLAN_LIST_NEW, filter, pageSize, sortBy],
    () => searchProductionDraft({ filter: { ...filter, statusMulti: 'INPROGRESS,SUBMITTED' }, page, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: tableTab === 'second',
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        // console.log(result);
        const filterProductionOrderItemList = [];
        result?.map((res) => {
          res.productSubType.forEach((itemRes) => {
            itemRes.itemList.map((item) => {
              let currentStep;
              if (item?.currentStep?.step?.toString().length === 3) {
                item.currentStep = item?.parentStep;
                currentStep = item.currentStep;
              } else {
                currentStep = item.currentStep;
              }
              const findStep = planOptionsList.find((itemF) => itemF?.value === (item?.currentStep?.step || ''));
              filterProductionOrderItemList.push({
                ...item,
                currentStep: {
                  ...findStep,
                  ...currentStep,
                  label: `${findStep?.label || `${f({ id: 'dailyPlan.field.notStart' })}`} ${currentStep?.status ? `( ${currentStep?.status} )` : ''}`,
                },
                producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
              });
              return { ...item, currentStep: findStep || '', producedSize: `${res.producedSize} ${itemRes.productSubTypeName}` };
            });
          });

          return {
            producedSize: res?.producedSize,
            productSubType: res.productSubType,
            itemList: res?.itemList?.filter((s) => s?.productionOrderId === undefined),
          };
        });

        console.log(filterProductionOrderItemList);
        setData((tableTab === 'second' && filterProductionOrderItemList) || []);
        // console.log(filterProductionOrderItemList);
        setPageCount(pagination.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );

  return query;
};

export const getProductPlanQuery = ({ tableInstance, tableTab }) => {
  const {
    filter,
    setData,
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const query = useQuery(
    [QUERY.PRODPLAN_LIST, filter, pageSize, sortBy],
    () => searchProductionDraft({ filter: { ...filter, status: 'COMPLETED' }, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: tableTab === 'third',
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        // console.log(result);
        const filterProductionOrderItemList = [];
        result?.map((res) => {
          res.productSubType?.forEach((itemRes) => {
            itemRes?.itemList?.map((item) => {
              let currentStep;
              if (item?.currentStep?.step?.toString().length === 3) {
                item.currentStep = item?.parentStep;
                currentStep = item.currentStep;
              } else {
                currentStep = item.currentStep;
              }
              const findStep = planOptionsList.find((itemF) => itemF?.value === (item?.currentStep?.step || ''));
              filterProductionOrderItemList.push({
                ...item,
                currentStep: { ...findStep, ...currentStep, label: `${findStep.label} (${currentStep.status})` },
                producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
              });
              return { ...item, currentStep: findStep || '', producedSize: `${res.producedSize} ${itemRes.productSubTypeName}` };
            });
          });

          return {
            producedSize: res?.producedSize,
            productSubType: res.productSubType,
            itemList: res?.itemList?.filter((s) => s?.productionOrderId === undefined),
          };
        });

        console.log(filterProductionOrderItemList);
        setData((tableTab === 'third' && filterProductionOrderItemList) || []);
        setPageCount(pagination.totalPage);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );

  return query;
};

export const getOperationQuery = ({ tableInstance, tableTab }) => {
  const {
    filter,
    setData = [],
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const query = useQuery(
    [`${QUERY.PRODUCTION_LIST}-ungroup`, filter, pageSize, sortBy],
    () => getProductPlan({ filter, page, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: tableTab === 'fourt',
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        console.log(result);
        const filterProductionOrderItemList = [];
        if (result.length > 0) {
          result.forEach((res) => {
            res?.productSubType?.forEach((itemRes) => {
              itemRes?.machine?.forEach((itemMachine) => {
                itemMachine?.planDate?.forEach((itemDate) => {
                  itemDate?.itemList?.forEach((listItem) => {
                    listItem.step = planOptionsList.find((item) => item.value === listItem.step);
                    listItem.currentStep = { ...listItem.currentStep, stepName: planOptionsList.find((item) => item.value === listItem.currentStep.step) };
                  });
                });
              });
              filterProductionOrderItemList.push({
                producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
                machine: itemRes.machine,
              });
            });
          });
        }
        console.log(filterProductionOrderItemList);
        setData(filterProductionOrderItemList || []);
        setPageCount(pagination.totalPage);
      },
      onError(err) {
        console.error('Error fetching company list', err);
      },
    }
  );

  return query;
};

export const getOperationQueryGroup = ({ tableInstance, tableTab }) => {
  const {
    filter,
    setData = [],
    setPageCount,
    state: { pageIndex: page, pageSize, sortBy },
  } = tableInstance;
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const query = useQuery(
    [`${QUERY.PRODUCTION_LIST}-Group`, filter, pageSize, sortBy],
    () => getProductPlanGroup({ filter, page, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      enabled: tableTab === 'fourt',
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        console.log(result);
        const filterProductionOrderItemList = [];
        if (result.length > 0) {
          result.forEach((res) => {
            res?.productSubType?.forEach((itemRes) => {
              itemRes?.machine?.forEach((itemMachine) => {
                itemMachine?.planDate?.forEach((itemDate) => {
                  itemDate?.itemList?.forEach((listItem) => {
                    listItem.step = planOptionsList.find((item) => item.value === listItem.step);
                    listItem.currentStep = { ...listItem.currentStep, stepName: planOptionsList.find((item) => item.value === listItem.currentStep.step) };
                  });
                });
              });
              filterProductionOrderItemList.push({
                producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
                machine: itemRes.machine,
              });
            });
          });
        }
        console.log(filterProductionOrderItemList);
        setData(filterProductionOrderItemList || []);
        setPageCount(pagination.totalPage);
      },
      onError(err) {
        console.error('Error fetching company list', err);
      },
    }
  );

  return query;
};
