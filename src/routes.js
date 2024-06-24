/* eslint-disable */
import { lazy } from 'react';
import { USER_ROLE } from 'constants.js';
import { DEFAULT_PATHS } from 'config.js';

const blog = lazy(() => import('views/blog/Blog'));
const community = {
  index: lazy(() => import('views/community/Community')),
  list: lazy(() => import('views/community/CommunityList')),
};
const upgrade = lazy(() => import('views/upgrade/Upgrade'));

const dashboard = {
  gettingStarted: lazy(() => import('views/dashboard/DashboardGettingStarted')),
  analysis: lazy(() => import('views/dashboard/DashboardAnalysis')),
};
const services = {
  database: lazy(() => import('views/services/ServicesDatabase')),
  databaseAdd: lazy(() => import('views/services/ServicesDatabaseAdd')),
  databaseDetail: lazy(() => import('views/services/ServicesDatabaseDetail')),
  storage: lazy(() => import('views/services/ServicesStorage')),
  storageFolder: lazy(() => import('views/services/ServicesStorageFolder')),
  hosting: lazy(() => import('views/services/ServicesHosting')),
  users: lazy(() => import('views/services/ServicesUsers')),
};
const account = {
  list: lazy(() => import('views/account/user/User')),
  detail: lazy(() => import('views/account/user-detail/UserDetail')),
  settings: lazy(() => import('views/account/AccountSettings')),
  billing: lazy(() => import('views/account/AccountBilling')),
  commerce: lazy(() => import('views/account/Commerce')),
};
const support = {
  docs: lazy(() => import('views/support/SupportDocs')),
  docsDetail: lazy(() => import('views/support/SupportDocsDetail')),
  knowledgeBase: lazy(() => import('views/support/SupportKnowledgeBase')),
  tickets: lazy(() => import('views/support/SupportTickets')),
  ticketsDetail: lazy(() => import('views/support/SupportTicketsDetail')),
};
const customer = {
  list: lazy(() => import('views/customer/CustomerList')),
  add: lazy(() => import('views/customer/CustomerDetail')),
};

const sales = {
  salesOrder: lazy(() => import('views/sales/sales-order/SalesOrder')),
  salesOrderDetail: lazy(() => import('views/sales/sales-order-detail/SalesOrderDetail')),
};
const batchProcess = {
  batchProcess: lazy(() => import('views/master/batch-process/BatchProcess')),
};
const sticker = {
  stickerOperation: lazy(() => import('views/production/sticker-operation/StickerOperation')),
};
const exportScheduler = {
  exportScheduler: lazy(() => import('views/master/time-export/ExportScheduler')),
};

const production = {
  bom: lazy(() => import('views/production/bom/BomList')),
  bomDetail: lazy(() => import('views/production/bom/BomDetail')),
  rm: lazy(() => import('views/production/rm/RmList')),
  rmDetail: lazy(() => import('views/production/rm/RmDetail')),
  product2Produce: lazy(() => import('views/production/product2Produce/index')),
  produceBox: lazy(() => import('views/production/produce/box/ProduceBox')),
  cutting: lazy(() => import('views/production/cutting/CuttingList')),
  cuttingGroup: lazy(() => import('views/production/cutting/CuttingGroupList')),
  cuttingDetail: lazy(() => import('views/production/cutting/CuttingDetail')),
  dailyPlan: lazy(() => import('views/production/daily-plan/DailyPlan')),
  operator: lazy(() => import('views/production/operator/Operator')),
  printingDailyPlan: lazy(() => import('views/production/printingDailyPlan/PrintingDailyPlan')),
  summary: lazy(() => import('views/production/summary/JobSummary')),
  summaryDetail: lazy(() => import('views/production/summary/SummaryDetail')),
  outsource: lazy(() => import('views/production/outsource/Outsource')),
  outsourceDetail: lazy(() => import('views/production/outsource-detail/OutsourceDetail')),
};

const product = {
  list: lazy(() => import('views/master/product/Product')),
  detail: lazy(() => import('views/master/product-detail/ProductDetail')),
};

const supplier = {
  list: lazy(() => import('views/master/supplier/Supplier')),
  detail: lazy(() => import('views/master/supplier-detail/SupplierDetail')),
};

const test = {
  konva: lazy(() => import('views/test/konva/index')),
};

const purchaseOrder = {
  list: lazy(() => import('views/sales/purchase-order/PurchaseOrder')),
  detail: lazy(() => import('views/sales/purchase-order-detail/PurchaseOrderDetail')),
};

const customerOrder = {
  list: lazy(() => import('views/sales/customer-order/CustomerOrder')),
  detail: lazy(() => import('views/sales/customer-order-detail/CustomerOrderDetail')),
};
const quotation = {
  list: lazy(() => import('views/sales/quotation/Quotation')),
  detail: lazy(() => import('views/sales/quotation-detail/QuotationDetail')),
};

const machine = {
  list: lazy(() => import('views/machine/Machine')),
  detail: lazy(() => import('views/machine/MachineDetail')),
};

const employee = {
  list: lazy(() => import('views/master/employee/Employee')),
  detail: lazy(() => import('views/master/employee-detail/EmployeeDetail')),
};

const tooling = {
  list: lazy(() => import('views/master/tooling/Tooling')),
  detail: lazy(() => import('views/master/tooling-detail/ToolingDetail')),
};

const company = {
  list: lazy(() => import('views/master/company/Company')),
  detail: lazy(() => import('views/master/company-detail/CompanyDetail')),
};

const receiving = {
  list: lazy(() => import('views/receiving/Receiving')),
};

const inventory = {
  list: lazy(() => import('views/inventory/inventory/Inventory')),
  detail: lazy(() => import('views/inventory/inventory-detail/InventoryDetail')),
  saleDetail: lazy(() => import('views/inventory/inventory-detail/InventoryProductDetail')),
};

const stockManagement = {
  list: lazy(() => import('views/inventory/stock-management/StockManagement')),
  detail: lazy(() => import('views/inventory/stock-management-detail/StockManagementDetail')),
};

const movement = {
  list: lazy(() => import('views/inventory/movement/Movement')),
  detail: lazy(() => import('views/inventory/movement-detail/MovementDetail')),
};

const materialProduction = {
  list: lazy(() => import('views/inventory/material-production/MaterialProduction')),
};

const appRoot = DEFAULT_PATHS.APP.endsWith('/') ? DEFAULT_PATHS.APP.slice(1, DEFAULT_PATHS.APP.length) : DEFAULT_PATHS.APP;

const routesAndMenuItems = {
  mainMenuItems: [
    {
      path: `${appRoot}/sales`,
      label: 'menu.sales',
      icon: 'shipping',
      exact: true,
      redirect: true,
      // roles: [USER_ROLE.Admin, USER_ROLE.Editor],
      protected: true,
      to: `${appRoot}/sales/sales-order`,
      subs: [
        { path: '/sales-order', label: 'menu.sales-order', component: sales.salesOrder, exact: true },
        { path: '/sales-order/new', component: sales.salesOrderDetail, exact: true },
        { path: '/sales-order/:id', component: sales.salesOrderDetail, hideInMenu: true },
        { path: '/quotation', label: 'menu.quotation', component: quotation.list, exact: true },
        { path: '/quotation/new', component: quotation.detail, exact: true },
        { path: '/quotation/:id', component: quotation.detail, hideInMenu: true },
        { path: '/customer-order', label: 'menu.customer-order', component: customerOrder.list, exact: true },
        { path: '/customer-order/new', component: customerOrder.detail, exact: true },
        { path: '/customer-order/:id', component: customerOrder.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appRoot}/purchase`,
      label: 'menu.purchase',
      icon: 'shop',
      exact: true,
      redirect: true,
      protected: true,
      to: `${appRoot}/purchase/purchase-order`,
      subs: [
        { path: '/receiving', label: 'menu.receiving', component: receiving.list, exact: true },
        { path: '/purchase-order', label: 'menu.purchase-order', component: purchaseOrder.list, exact: true },
        { path: '/purchase-order/new', component: purchaseOrder.detail, exact: true },
        { path: '/purchase-order/:id', component: purchaseOrder.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appRoot}/production`,
      label: 'menu.production',
      protected: true,
      exact: true,
      icon: 'flask',
      subs: [
        // Group
        {
          path: '/produce',
          label: 'menu.production.group',
          component: production.product2Produce,
          subs: [
            // View
            {
              path: '/view/:id',
              component: ({ match, ...rest }) => {
                console.debug(' match :', match);
                match.params.productionState = 'MID';
                const ProduceBox = production.produceBox;
                return <ProduceBox {...rest} match={match} />;
              },
            },
            // Create
            {
              path: '/:type/:id',
              component: ({ match, ...rest }) => {
                match.params.productionState = 'PRE';
                const ProduceBox = production.produceBox;
                return <ProduceBox {...rest} match={match} />;
              },
            },
          ],
        },
        // END Group

        // Daily Plan
        {
          path: '/dailyplan',
          label: 'menu.production.daily-plan',
          component: production.dailyPlan,
          hideInMenu: false,
        },
        {
          path: '/summary',
          label: 'menu.production.summary',
          component: production.summary,
          hideInMenu: true,
        },
        {
          path: '/operator',
          label: 'menu.production.operator',
          component: production.operator,
          hideInMenu: false,
        },
        // Printing Daily Plan
        {
          path: '/printingDailyPlan',
          // label: 'menu.production.printingDailyPlan',
          component: production.printingDailyPlan,
          hideInMenu: true,
        },
        { path: '/summary', label: 'menu.production.summary', component: production.summary, exact: true, hideInMenu: true },
        { path: '/summary/new', component: production.summaryDetail, exact: true },
        { path: '/summary/:id', component: production.summaryDetail, hideInMenu: true },
        { path: '/sticker', label: 'menu.sticker', component: sticker.stickerOperation, exact: true, hideInMenu: false },
        { path: '/outsource', label: 'menu.outsource', component: production.outsource, exact: true, hideInMenu: false },
        { path: '/outsourceDetail/new', component: production.outsourceDetail, exact: true },
        { path: '/outsourceDetail/:id', component: production.outsourceDetail, hideInMenu: false },
        {
          path: '/cutting',
          label: 'menu.production.cutting',
          exact: true,
          component: production.cutting,
          hideInMenu: false,
          subs: [
            {
              path: '/group',
              component: production.cuttingGroup,
            },
            {
              path: '/detail/:productionOrderId',
              component: production.cuttingDetail,
            },
          ],
        },
      ],
    },
    {
      path: `${appRoot}/inventory`,
      label: 'menu.inventory',
      icon: 'handbag',
      exact: true,
      redirect: true,
      protected: true,
      to: `${appRoot}/inventory/stock`,
      subs: [
        { path: '/material-production', label: 'menu.material-production', component: materialProduction.list, exact: true, hideInMenu: false },
        { path: '/stock', label: 'menu.stock', component: inventory.list, exact: true },
        { path: '/stock-detail/:id', component: inventory.detail, hideInMenu: true },
        { path: '/stock-sale-detail/:id', component: inventory.saleDetail, hideInMenu: true },
        { path: '/movement', label: 'menu.movement', component: movement.list, exact: true, hideInMenu: false },
        { path: '/movement-detail/:id/:product', component: movement.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appRoot}/master`,
      label: 'menu.master',
      icon: 'boxes',
      exact: true,
      redirect: true,
      protected: true,
      subs: [
        { path: '/company', label: 'menu.company', component: company.list, exact: true },
        { path: '/company/new', component: company.detail, exact: true },
        { path: '/company/:id', component: company.detail, hideInMenu: true },
        { path: '/machine', label: 'menu.machine-item', component: machine.list, exact: true },
        { path: '/machine/new', component: machine.detail, exact: true },
        { path: '/machine/:id', component: machine.detail, hideInMenu: true },
        { path: '/tooling', label: 'menu.tooling', component: tooling.list, exact: true },
        { path: '/tooling/new', component: tooling.detail, exact: true },
        { path: '/tooling/:id', component: tooling.detail, hideInMenu: true },
        { path: '/stock-management', label: 'menu.stock-management', component: stockManagement.list, exact: true },
        { path: '/stock-management/new', component: stockManagement.detail, hideInMenu: true, exact: true },
        { path: '/stock-management/:id', component: stockManagement.detail, hideInMenu: true },
        { path: '/supplier', label: 'menu.supplier', component: supplier.list, exact: true },
        { path: '/supplier/new', component: supplier.detail, exact: true },
        { path: '/supplier/:id', component: supplier.detail, hideInMenu: true },
        { path: '/employee', label: 'menu.employee', component: employee.list, exact: true },
        { path: '/employee/new', component: employee.detail, exact: true },
        { path: '/employee/:id', component: employee.detail, hideInMenu: true },
        { path: '/customer', label: 'menu.customer.list', component: customer.list, exact: true },
        { path: '/customer/new', label: 'menu.customer.add', component: customer.add, exact: true, hideInMenu: true },
        { path: '/customer/:id', label: 'menu.customer.detail', component: customer.add, hideInMenu: true },
        { path: '/rm', label: 'menu.production.rm', exact: true, component: production.rm },
        { path: '/rm/add', label: 'menu.production.rm', component: production.rmDetail, hideInMenu: true },
        { path: '/rm/:id', label: 'menu.production.rm', exact: true, component: production.rmDetail, hideInMenu: true },
        { path: '/product', label: 'menu.product', component: product.list, exact: true },
        { path: '/product/new', component: product.detail, exact: true },
        { path: '/product/:id', component: product.detail, hideInMenu: true },
        { path: '/exportScheduler', label: 'menu.exportScheduler', component: exportScheduler.exportScheduler, exact: true, hideInMenu: false },
        { path: '/batchProcess', label: 'menu.batchProcess', component: batchProcess.batchProcess, exact: true, hideInMenu: false },
        { path: '/bom', label: 'menu.production.bom', exact: true, component: production.bom },
        { path: '/bom/add', label: 'menu.production.bom.add', component: production.bomDetail, hideInMenu: true },
        { path: '/bom/:id', label: 'menu.production.bom.edit', component: production.bomDetail, hideInMenu: true },
      ],
    },
    {
      path: `${appRoot}/test`,
      label: 'test',
      exact: true,
      hideInMenu: true,
      subs: [{ path: '/konva', label: 'konva', component: test.konva, exact: true }],
    },
    {
      path: DEFAULT_PATHS.APP,
      exact: true,
      redirect: true,
      protected: true,
      to: `${appRoot}/dashboard/getting-started`,
    },
    // {
    //   path: `${appRoot}/blog`,
    //   component: blog,
    //   label: 'menu.blog',
    //   icon: 'file-text',
    // },
    // {
    //   path: `${appRoot}/upgrade`,
    //   label: 'menu.upgrade',
    //   icon: 'trend-up',
    //   component: upgrade,
    // },
    // {
    //   path: `${appRoot}/community`,
    //   label: 'menu.community',
    //   icon: 'messages',
    //   component: community.index,
    //   subs: [
    //     {
    //       path: '/list',
    //       label: 'menu.community-list',
    //       hideInMenu: true,
    //       component: community.list,
    //     },
    //   ],
    // },
    {
      path: `${appRoot}/dashboard`,
      label: 'menu.dashboard',
      icon: 'grid-1',
      exact: true,
      redirect: true,
      protected: true,
      to: `${appRoot}/dashboard/getting-started`,
      hideInMenu: true,
      subs: [
        { path: '/getting-started', label: 'menu.getting-started', icon: 'navigate-diagonal', component: dashboard.gettingStarted },
        { path: '/analysis', label: 'menu.analysis', icon: 'chart-4', component: dashboard.analysis },
      ],
    },
    // {
    //   path: `${appRoot}/services`,
    //   label: 'menu.services',
    //   icon: 'grid-1',
    //   exact: true,
    //   redirect: true,
    //   to: `${appRoot}/services/database`,
    //   subs: [
    //     {
    //       path: '/database',
    //       label: 'menu.database',
    //       icon: 'database',
    //       component: services.database,
    //       subs: [
    //         { path: '/add', label: 'menu.database-add', hideInMenu: true, component: services.databaseAdd },
    //         { path: '/detail', label: 'menu.database-detail', hideInMenu: true, component: services.databaseDetail },
    //       ],
    //     },
    //     {
    //       path: '/storage',
    //       label: 'menu.storage',
    //       icon: 'file-image',
    //       component: services.storage,
    //       subs: [{ path: '/folder', label: 'menu.storage', hideInMenu: true, component: services.storageFolder }],
    //     },
    //     { path: '/storage-folder', component: services.storageFolder, hideInMenu: true },
    //     { path: '/hosting', label: 'menu.hosting', icon: 'router', component: services.hosting },
    //     { path: '/users', label: 'menu.users', icon: 'user', component: services.users },
    //   ],
    // },
    {
      path: `${appRoot}/account`,
      label: 'menu.account',
      icon: 'user',
      exact: true,
      protected: true,
      redirect: true,
      // to: `${appRoot}/account/user-account`,
      subs: [
        { path: '/user', label: 'menu.users', component: account.list, exact: true },
        { path: '/user/new', component: account.detail, exact: true },
        { path: '/user/:id', component: account.detail, hideInMenu: true },
      ],
    },
    // {
    //   path: `${appRoot}/support`,
    //   label: 'menu.support',
    //   icon: 'help',
    //   exact: true,
    //   redirect: true,
    //   to: `${appRoot}/support/docs`,
    //   subs: [
    //     {
    //       path: '/docs',
    //       label: 'menu.docs',
    //       icon: 'file-empty',
    //       component: support.docs,
    //       subs: [{ path: '/detail', label: 'menu.docs', icon: 'file-empty', component: support.docsDetail, hideInMenu: true }],
    //     },
    //     { path: '/knowledge-base', label: 'menu.knowledge-base', icon: 'notebook-1', component: support.knowledgeBase },
    //     {
    //       path: '/tickets',
    //       label: 'menu.tickets',
    //       icon: 'bookmark',
    //       component: support.tickets,
    //       subs: [{ path: '/detail', label: 'menu.tickets-detail', icon: 'file-empty', component: support.ticketsDetail, hideInMenu: true }],
    //     },
    //   ],
    // },
  ],
  sidebarItems: [],
};
export default routesAndMenuItems;
