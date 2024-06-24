// export const API = {
//   FIND_PRODPLAN_LIST: '/productionPlan/find',
//   FIND_SaleOrder_LIST: '/saleOrder/find',
// };
export const API = {
  FIND_MATCHING_LIST: '/jobMatching/toMatchingList',
  GET_MATCHING_DETAIL: '/jobMatching/getDetailMatching',
  FIND_MATCHING_HISTORY: '/jobMatching/itemDetail',
  ADD_MATCHING_ITEM: '/jobMatching/addItem',
  DELETE_MATCHING_ITEM: '/jobMatching/:itemId/deleteItem',
  EDIT_MATCHING_ITEM: '/jobMatching/:itemId/editItem',
  GET_INVENTORYG_DETAIL: '/inventory/material/find',
};
export const NAVIGATION = {
  // PRODPLAN_DETAIL: '/production/daily-plan',
};

export const INTL = {
  TITLE: 'summary.list.title',
  DESCRIPTION: 'summary.list.description',
};

// export const QUERY = {
//   PRODPLAN_LIST: 'productPlanList',
// };
export const QUERY = {
  MATCHING_LIST: 'materialMatching',
  MATCHING_ITEM: 'materialMatchingItem',
  MATCHING_HISTORY: 'materialMatchingHisotory',
};
