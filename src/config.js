import { LAYOUT, MENU_BEHAVIOUR, NAV_COLOR, MENU_PLACEMENT, RADIUS, THEME_COLOR, USER_ROLE } from 'constants.js';

export const IS_DEMO = true;
export const IS_AUTH_GUARD_ACTIVE = true;
// export const SERVICE_URL = 'https://us-central1-tensorbrick-api-a35f3.cloudfunctions.net/app';
// export const SERVICE_URL = 'https://us-central1-kspuat-api.cloudfunctions.net/app';
export const SERVICE_URL = 'https://us-central1-kspdev-api.cloudfunctions.net/app';
export const USE_MULTI_LANGUAGE = true;

// For detailed information: https://github.com/nfl/react-helmet#reference-guide
export const REACT_HELMET_PROPS = {
  defaultTitle: 'KSP Printing : ERP System',
  titleTemplate: '%s | KSP Printing : ERP System',
};

export const DEFAULT_PATHS = {
  APP: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  USER_WELCOME: '/dashboards/default',
  NOTFOUND: '/page-not-found',
  UNAUTHORIZED: '/unauthorized',
  INVALID_ACCESS: '/invalid-access',
  LOGOUT: '/logout',
};

export const DEFAULT_SETTINGS = {
  MENU_PLACEMENT: MENU_PLACEMENT.Vertical,
  MENU_BEHAVIOUR: MENU_BEHAVIOUR.Pinned,
  LAYOUT: LAYOUT.Boxed,
  RADIUS: RADIUS.Rounded,
  COLOR: THEME_COLOR.LightBlue,
  NAV_COLOR: NAV_COLOR.Dark,
  USE_SIDEBAR: true,
};

export const DEFAULT_USER = {
  id: 1,
  name: 'Lisa Jackson',
  thumb: '/img/profile/profile-9.webp',
  role: USER_ROLE.Admin,
  email: 'lisajackson@gmail.com',
};

export const supplierStoreId = {
  dev: '64d4dc9ac70e18d66ed32ed6',
  uat: '66163e3b0579957470734977',
  production: 'production',
};

export const REDUX_PERSIST_KEY = 'service-provider';
