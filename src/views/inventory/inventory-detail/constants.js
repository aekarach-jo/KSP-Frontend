export const API = {
  FIND: '/inventory/material/viewDetail',
  PRODUCT_DETAIL: '/inventory/product/viewDetail?',
  PRODUCT_DETAIL_SALE: '/inventory/product/viewDetail?isSale=true',
  SUPPLIER_LIST: '/masterData/supplier/list',
  FIND_STORE_LOCATION: '/storeLocation/find',
  TRANSFER_ITEM: '/inventory/material/transfer',
  ADJUST_ITEM: '/inventory/material/adjust',
  ADJUST_ITEM_PRODUCT: '/inventory/product/adjust',
  RETURN_ITEM: '/inventory/material/return',
  TRANSFORM_ITEM: '/inventory/material/transform',
};

export const NAVIGATION = {
  ADD_NEW_STORE_LOCALION: '/inventory/stock-management/new',
  STORE_LOCATION_DETAIL: '/inventory/stock-management',
};

export const QUERY = {
  INVENTORY_DETAIL: 'inventoryDetail',
  FIND_PURCHASE_ITEM: 'findPurchaseItem',
};

export const INTL = {
  TITLE: 'stockManagement.list.title',
  DESCRIPTION: 'stockManagement.list.description',
  ADD_BUTTON: 'stockManagement.button.add',
};
