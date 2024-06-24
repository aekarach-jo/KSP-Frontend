export const API = {
  FIND_PRODUCT_RECEIVING_LIST: '/receiving/toReceivedList',
  // FIND_PRODUCT_RECEIVING_LIST: '/receiving/toReceivedList?completeStatus=true',
  FIND_SUPPLIER: '/masterData/supplier/find',
  FIND_RECEIVING_HISTORY: '/receiving/itemDetail',
  ADD_RECEIVING_ITEM: '/receiving/addItem',
  ADD_RECEIVING_ITEM_INVENTORY: '/receiving/addItemManual',
  FIND_STORE_LOCATION: '/storeLocation/find',
};

export const NAVIGATION = {};

export const INTL = {
  TITLE: 'receiving.list.title',
  DESCRIPTION: 'receiving.list.description',
  ADD_BUTTON: 'receiving.list.add',
};

export const QUERY = {
  RECEIVING_LIST: 'productReceiving',
  RECEIVING_LIST_SUBMIT: 'productReceivingSubmit',
  RECEIVING_HISTORY: 'productReceivingHisotory',
};
