export const API = {
  FIND_CUSTOMER_ORDER:
    '/productionPlan/productionOrderList/?statusMulti=NOTSTART,INPROGRESS,COMPLETED,SUBMITTED',
  POST_STICKER: '/productionPlan/editList',
};

export const NAVIGATION = {
  ADD_CUSTOMER_ORDER: '/sales/customer-order/new',
  CUSTOMER_ORDER_DETAIL: '/sales/customer-order',
};

export const QUERY = {
  CUSTOMER_ORDER: 'customerOrderList',
};

export const INTL = {
  TITLE: 'sticker.list.title',
  DESCRIPTION: 'sticker.list.description',
  ADD_BUTTON: 'sticker.list.add',
};
