export const API = {
  FIND_MATCHING_LIST: '/jobMatching/toMatchingList',
  GET_MATCHING_DETAIL: '/jobMatching/getDetailMatching',
  FIND_MATCHING_HISTORY: '/jobMatching/itemDetail',
  ADD_MATCHING_ITEM: '/jobMatching/addItem',
  DELETE_MATCHING_ITEM: '/jobMatching/:itemId/deleteItem',
  EDIT_MATCHING_ITEM: '/jobMatching/:itemId/editItem',
  GET_INVENTORYG_DETAIL: '/inventory/material/find',
};

export const NAVIGATION = {};

export const INTL = {
  TITLE: 'material-production.title',
  DESCRIPTION: 'material-production.description',
};

export const QUERY = {
  MATCHING_LIST: 'materialMatching',
  MATCHING_ITEM: 'materialMatchingItem',
  MATCHING_HISTORY: 'materialMatchingHisotory',
};
