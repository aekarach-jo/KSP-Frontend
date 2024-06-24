// cra imports
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from 'reportWebVitals.js';

// import redux requirements
import { Provider } from 'react-redux';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import { store, persistedStore } from 'store.js';

// import html head tags requirements
import { Helmet } from 'react-helmet';
import { REACT_HELMET_PROPS } from 'config.js';

// import multi language
import LangProvider from 'lang/LangProvider';

// import routing modules
import { BrowserRouter as Router } from 'react-router-dom';
import RouteIdentifier from 'routing/components/RouteIdentifier';
import Loading from 'components/loading/Loading';

// import routes
import { getLayoutlessRoutes } from 'routing/helper';
import defaultRoutes from 'routing/default-routes';
import routesAndMenuItems from 'routes.js';

// import toastify for notification
import { Slide, ToastContainer } from 'react-toastify';

if (process.env.REACT_APP_USE_MOCK) {
  // mock server
  import('@mock-api');
}

const Main = () => {
  const layoutlessRoutes = useMemo(() => getLayoutlessRoutes({ data: routesAndMenuItems }), []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <Helmet {...REACT_HELMET_PROPS}>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/bootstrap-icons.css" />
        </Helmet>
        <Router basename={process.env.REACT_APP_BASENAME}>
          <LangProvider>
            <ToastContainer transition={Slide} newestOnTop />
            <RouteIdentifier routes={[...layoutlessRoutes, ...defaultRoutes]} fallback={<Loading />} />
          </LangProvider>
        </Router>
      </PersistGate>
    </Provider>
  );
};

ReactDOM.render(<Main />, document.getElementById('root'));

/*
 * If you want to start measuring performance in your app, pass a function
 * to log results (for example: reportWebVitals(console.log))
 * or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();
