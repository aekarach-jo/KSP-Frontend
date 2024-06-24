export const API = {
  FIND_INVENTORY_LIST: '/inventory/material/find',
  FIND_PURCHASE_ORDER: '/purchaseOrder/find',
  PURCHASE_ITEM: '/purchaseOrder/add',
};

export const NAVIGATION = {
  INVENTORY_DETAIL: '/inventory/stock-detail',
  INVENTORY_SALE_DETAIL: '/inventory/stock-sale-detail',
  // INVENTORY_SALES: '/inventory/product/find?isSale=true',
  PURCHASE_ORDER: '/purchase/purchase-order',
  ADD_PURCHASE_ORDER: '/purchase/purchase-order/new',
};

export const QUERY = {
  INVENTORY: 'inventoryList',
  INVENTORY_DETAIL: 'inventoryDetail',
};

export const INTL = {
  TITLE: 'inventory.list.title',
  DESCRIPTION: 'inventory.list.description',
  ADD_BUTTON: 'inventory.list.add',
};
