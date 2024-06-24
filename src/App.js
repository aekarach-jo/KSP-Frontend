import React, { useMemo } from 'react';
import { QueryClientProvider } from 'react-query';
// import { ReactQueryDevtools } from 'react-query/devtools';

// import redux for auth guard
// import { useSelector } from 'react-redux';

// import layout
import Layout from 'layout/Layout';

// import routing modules
import RouteIdentifier from 'routing/components/RouteIdentifier';
import { getRoutes } from 'routing/helper';
import routesAndMenuItems from 'routes.js';
import Loading from 'components/loading/Loading';

import 'react-toastify/dist/ReactToastify.css';
import 'react-dropzone-uploader/dist/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useToken } from 'utils/auth';
import queryClient from 'utils/query-client';
import { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';

registerLocale('th-TH', th);

const App = () => {
  // const { currentUser, isLogin } = useSelector((state) => state.auth);
  const { token, isLoading } = useToken();

  const isLogin = !!token;
  const routes = useMemo(() => getRoutes({ data: routesAndMenuItems, isLogin, userRole: 'user' }), [isLogin]);
  const fallback = useMemo(() => <Loading />, []);
  if (routes) {
    return (
      <QueryClientProvider client={queryClient}>
        <Layout>{isLoading ? fallback : <RouteIdentifier routes={routes} fallback={fallback} />}</Layout>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    );
  }
  return <></>;
};

export default App;
