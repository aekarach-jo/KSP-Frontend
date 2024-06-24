import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLogin } from 'utils/auth';
import clx from 'classnames';
import { request } from 'utils/axios-utils';

const Login = () => {
  const { replace } = useHistory();
  const { requestLogin, isFetching, error } = useLogin();

  const { formatMessage: f } = useIntl();

  const title = f({ id: 'auth.login' });
  const description = f({ id: 'auth.description' });

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(f({ id: 'auth.validation.username.required' })),
    password: Yup.string()
      // .min(6, 'Must be at least 6 chars!')
      .required(f({ id: 'auth.validation.password.required' })),
  });
  const initialValues = { username: '', password: '' };
  const onSubmit = async (values) => {
    // console.log('submit form', values);

    try {
      await requestLogin(values, true);
      replace('/');
    } catch (err) {
      console.error('Login error :  ', err);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const getDefaultCompany = async () => {
    const res = await request({ url: `/masterData/company/find?isDefault=true` });
    localStorage.setItem('ConfigDecimal', res.data.data[0]?.configDecimal);
  };

  useEffect(() => {
    if (!isFetching) {
      getDefaultCompany();
    }
  }, [isFetching]);

  const leftSide = (
    <div className="min-h-100 d-flex align-items-center">
      <div className="w-100 w-lg-75 w-xxl-50">
        <div>
          <div className="mb-5">
            <img className="w-100" src="/img/logo/Tensorbrick-logo.png" alt="KSP Logo" />
          </div>
        </div>
      </div>
    </div>
  );

  const rightSide = (
    <div
      className={clx(
        'sw-lg-70 min-h-100 bg-outline-secondary d-flex justify-content-center align-items-center shadow-deep py-5 full-page-content-right-border',
        {
        'overlay-spinner': isFetching,
      })}
    >
      <div className="sw-lg-60 px-5">
        <div className="mb-3 w-100">
          <img className="w-100" src="/img/logo/KSP.logo.png" alt="KSP Logo" />
        </div>
        <div className="mb-5">
          <p className="h6">{f({ id: 'auth.description' })}</p>
        </div>
        <div>
          <form id="loginForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="user" />
              <Form.Control
                type="text"
                name="username"
                placeholder={f({ id: 'auth.username' })}
                value={values.username}
                onChange={handleChange}
                disabled={isFetching}
              />
              {errors.username && touched.username && <div className="d-block invalid-tooltip">{errors.username}</div>}
            </div>
            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="lock-off" />
              <Form.Control
                type="password"
                name="password"
                onChange={handleChange}
                value={values.password}
                placeholder={f({ id: 'auth.password' })}
                disabled={isFetching}
              />
              {/* <NavLink className="text-small position-absolute t-3 e-3" to="/forgot-password">
                Forgot?
              </NavLink> */}
              {errors.password && touched.password && <div className="d-block invalid-tooltip">{errors.password}</div>}
            </div>
            <Button size="lg" type="submit">
              {f({ id: 'auth.login' })}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <LayoutFullpage left={leftSide} right={rightSide} />
    </>
  );
};

export default Login;
