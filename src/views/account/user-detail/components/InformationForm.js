/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Row, Col, Form, Card, Button, Accordion, useAccordionButton } from 'react-bootstrap';
import classNames from 'classnames';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import AddUserItemModal from './AddUserItemModal';
import DropzoneColumns from './DropzoneColumns';
import LovEmployeeSelect from './LovEmployeeSelect';

const initialData = {
  id: '',
  code: '',
  email: '',
  role: '',
  employee: '',
  username: '',
  password: '',
  passwordConfirm: '',
  status: false,
};

const createUserFn = (user) => axios.post(`${SERVICE_URL}/user/add`, user).then((res) => res.data);

const updateUserFn = ({ id, user }) =>
  axios
    .post(`${SERVICE_URL}/user/${id}/edit`, user, {
      headers: {
        'content-type': 'application/json',
      },
    })
    .then((res) => res.data);

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'common.save.success' })}</span>
      </div>
    </>
  );
};

const InformationForm = ({ id, roleOptions, permission }) => {
  const [isEditMode, setEditMode] = useState(!id);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [fileSizeAlert, setFileSizeAlert] = useState(false);
  const [errCode, setErrorCode] = useState('');
  const queryClient = useQueryClient();
  const { push } = useHistory();

  const getUserFn = (userId) => () =>
    axios
      .get(`${SERVICE_URL}/user/${userId}`)
      .then((res) => res.data.data)
      .then((data) => {
        var list = [];
        var obj = {};

        data.passwordConfirm = data.password;
        for (const elementP of permission) {
          for (const elementData of data.role.permissionList) {
            if (elementP.id === elementData) {
              elementP.status = true;
            }
          }
        }

        data.role = { value: data.role.id, label: data.role.name };
        return {
          ...initialData,
          ...data,
        };
      });

  const useUserData = (userId) =>
    useQuery(`editUserData`, getUserFn(userId), {
      enabled: !!userId,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const validationSchema = Yup.object().shape({
    // code: Yup.string().required('user.detail.validation.code.required'),
    email: Yup.string().required('user.detail.validation.email.required'),
    role: Yup.object().required('user.detail.validation.role.required'),
    employee: Yup.string().required('user.detail.validation.employee.required'),
    username: Yup.string().required('user.detail.validation.username.required'),
    password: Yup.string().min(8, 'user.detail.validation.passwordChar.required').required('user.detail.validation.password.required'),
    passwordConfirm: Yup.string()
      .required('user.detail.validation.passwordConfirm.required')
      .oneOf([Yup.ref('password'), null], 'user.detail.validation.passwordConfirmChar.required'),
  });

  const { data: initResult, isFetching, error, refetch } = useUserData(id);

  if (error) {
    console.error('error :', error);
  }

  const { formatMessage: f } = useIntl();

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  const formik = useFormik({ initialValues: init, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  const title = id === undefined ? f({ id: `user.detail.title` }, { userName: '' }) : f({ id: `user.detail.title` }, { userName: initResult?.name });
  const description =
    id === undefined
      ? f({ id: `user.add.subTitle` })
      : f(
          { id: `user.${!id ? 'add' : 'edit'}.subTitle` },
          {
            updatedBy: initResult?.updatedBy,
            updatedAt: new Date(initResult?.updatedAt || null),
          }
        );

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const { mutate: createUser, isLoading: isAdding } = useMutation(createUserFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableAdd(false);
      console.debug('create user success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      const message = `This username already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('AddUserData');
    },
  });

  const { mutate: updateUser, isLoading: isSaving } = useMutation(updateUserFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableEdit(false);
      console.debug('update user success :', data);
      refetch();
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      console.log(err);
      const message = `This username already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editUserData');
    },
  });

  const handleOnSaveUserTypeItem = async (value) => {
    var role = [];
    for (const elementRole of value) {
      // eslint-disable-next-line no-var
      var objR = {
        id: elementRole.id,
        code: elementRole.code,
        abbr: elementRole.abbr,
        name: elementRole.name,
        permissionList: elementRole.permissionList,
      };
      role.push(objR);
    }
    setShowModal(false);

    await axios
      .post(
        `${SERVICE_URL}/role/save`,
        { data: role },
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      )
      .then((res) => {
        if (res.statusText === 'OK') {
          toast(<ToastCreateSuccess />);
        }
      });
  };

  const hashPassword = async (password) => {
    try {
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Error hashing password');
    }
  };

  const handleSave = async () => {
    console.log(values);
    values.passwordConfirm = values.password;
    values.password = await hashPassword(values.password);

    var data = {
      code: values.code,
      name: values.username,
      email: values.email,
      role: values.role.length > 0 ? values.role[0].id : values.role.id,
      employee: values.employee !== undefined ? values.employee : values.employee.value,
      username: values.username,
      password: values.password,
      avatar: values.avatar,
      status: values.status,
    };
    if (Object.keys(errors).length === 0 && values.name !== '') {
      if (id) {
        // setEnableEdit(true);
        updateUser({ id, user: data });
      } else {
        // setEnableAdd(true);
        createUser(data);
      }
    }
  };

  function CustomToggleButton({ eventKey, value }) {
    const decoratedOnClick = useAccordionButton(eventKey, () => console.log(decoratedOnClick));

    return (
      <Select
        isInvalid={errors.role && touched.role}
        isDisabled={!isEditMode}
        classNamePrefix="react-select"
        options={roleOptions}
        // isDisabled={!isEditMode}
        value={value}
        // required
        onChange={(v) => handleChangeRole(v)}
      />
    );
  }

  const handleChangeRole = (value) => {
    const role = value;
    handleChange({ target: { id: 'role', value: role } });

    for (const elementP of permission) {
      elementP.status = false;
      for (const elementData of value.permissionList) {
        if (elementP.id === elementData) {
          elementP.status = true;
        }
      }
    }
  };

  const handleShowModal = async () => {
    setShowModal(true);
  };

  const handleChangeStatus = (e) => {
    setFieldValue('status', e.target.checked);
  };

  useEffect(() => {
    handleChange({ target: { id: 'passwordConfirm', value: values.password } });

    if (!selectedFile) {
      setPreview(undefined);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    if (e.target.files[0].size > 1000000) {
      handleChange({ target: { id: 'avatar', value: '/img/userEmpty/account.png' } });
      setSelectedFile(undefined);
      setFileSizeAlert(true);
    } else {
      onUploadFile(e.target.files[0]);
      setSelectedFile(e.target.files[0]);
      setFileSizeAlert(false);
    }
  };

  const onUploadFile = async (value) => {
    const formData = new FormData();
    formData.append('image', value);
    try {
      await axios
        .post(`${SERVICE_URL}/content/upload`, formData, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          const { imageUrl } = res.data.data;
          handleChange({ target: { id: 'avatar', value: imageUrl } });
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelect = (name, e) => {
    handleChange({ target: { id: [name], value: e.value } });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        <Form onSubmit={handleSubmit}>
          {/* Title Start */}
          <div className="page-title-container mb-3">
            <Row>
              <Col className="mb-2">
                {/* <h1 className="mb-2 pb-0 display-4">{title}</h1> */}
                <div className="page-title-container mb-3">
                  <Row>
                    <Col xs="auto" className="mb-2 align-self-md-center">
                      <NavLink to="/account/user" className="btn-link btn-icon-start w-100 w-md-auto">
                        <CsLineIcons icon="arrow-left" /> {/* <span>{f({ id: 'common.back' })}</span> */}
                      </NavLink>
                    </Col>
                    <Col className="mb-2">
                      <h1 className="mb-2 pb-0 display-4">{title}</h1>
                      <div className="text-muted font-heading description">{description}</div>
                    </Col>
                    <Col xs="12" sm="auto" className="align-self-md-center">
                      {!isEditMode && (
                        <>
                          <Button className="btn-icon" variant="primary" onClick={handleEditClick}>
                            <CsLineIcons icon="edit" /> {f({ id: 'common.edit' })}
                          </Button>{' '}
                          {/* <Button className="btn-icon" variant="outline-danger" onClick={handleDeleteClick}>
                            <CsLineIcons icon="bin" />
                          </Button> */}
                        </>
                      )}
                      {(!id || isEditMode) && (
                        <>
                          {!!id && (
                            <Button className="btn-icon" variant="outline-alternate" onClick={handleCancelClick} disabled={isEnableAdd || isEnableEdit}>
                              <CsLineIcons icon="close" /> {f({ id: 'common.cancel' })}
                            </Button>
                          )}{' '}
                          <Button className="btn-icon" variant="primary" type="submit" onClick={handleSave} disabled={isEnableAdd || isEnableEdit}>
                            <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                          </Button>
                        </>
                      )}
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
          {/* Title End */}
          {/* Customer detail Start */}
          {/* <h2 className="small-title">{f({ id: 'product.list.title' })}</h2> */}

          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="form-row">
                <Col sm="12" md="12" lg="2" className='form-col-mt'>
                  <Form.Label className="col-form-label">{f({ id: 'user.code' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    onChange={handleChange}
                    value={values.code || ''}
                    isInvalid={errors.code && touched.code}
                    readOnly={!isEditMode}
                  />
                  {errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>}
                </Col>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label required">{f({ id: 'user.employee' })}</Form.Label>
                  <LovEmployeeSelect
                    name="employee"
                    isClearable
                    value={values.employee || ''}
                    onChange={(e) => handleSelect('employee', e)}
                    isDisabled={!isEditMode}
                  />
                  {errors.employee && touched.employee && <div className="d-block invalid-feedback">{f({ id: errors.employee })}</div>}
                </Col>
                <Col sm="12" md="12" lg="4">
                  <Form.Label className="col-form-label required">{f({ id: 'user.email' })}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={values.email || ''}
                    isInvalid={errors.email && touched.email}
                    readOnly={!isEditMode}
                  />
                  {errors.email && touched.email && <div className="d-block invalid-feedback">{f({ id: errors.email })}</div>}
                </Col>
              </Row>

              <Row className="mb-2 mt-4">
                <Col sm="12" md="12" lg="12">
                  <Form.Label className="col-form-label required">{f({ id: 'user.role' })}</Form.Label>
                  <section className="scroll-section" id="default">
                    <Accordion>
                      <CustomToggleButton className="mb-1" eventKey="standardCollapse" value={values.role}>
                        Toggle with 'useAccordionButton'
                      </CustomToggleButton>
                      {errors.role && touched.role && <div className="d-block invalid-feedback">{f({ id: errors.role })}</div>}
                      <Accordion.Collapse eventKey="standardCollapse" className="show">
                        <Row>
                          <Col sm="12" md="12" lg="12">
                            <Form.Label className="col-form-label mt-3">{f({ id: 'user.permission' })}</Form.Label>
                            <Card className="no-shadow border d-flex flex-row gap-4 flex-wrap justify-content-between" style={{ padding: '30px' }}>
                              {permission?.map((item, index) => (
                                <Col lg="3" key={index}>
                                  <label className="form-check w-100 mb-0">
                                    <input type="checkbox" checked={item.status} readOnly disabled className="form-check-input" />
                                    <span className="form-check-label d-block">
                                      <span className="mb-1 lh-1-25">{item.label}</span>
                                      {/* <span className="text-muted d-block text-small mt-0">03.05.2021 - 12:00</span> */}
                                    </span>
                                  </label>
                                </Col>
                              ))}
                            </Card>
                          </Col>
                        </Row>
                      </Accordion.Collapse>
                    </Accordion>
                  </section>
                </Col>
              </Row>
              <Row className="mb-2 mt-4">
                <Col sm="12" md="12" lg="12">
                  <Button variant="primary" className="hover-scale-up w-100" type="button" onClick={handleShowModal}>
                    {f({ id: 'user.list.add' })}
                  </Button>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm="12" md="12" lg="4">
                  <Form.Label className="col-form-label required">{f({ id: 'user.username' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    onChange={handleChange}
                    value={values.username || ''}
                    isInvalid={errors.username && touched.username}
                    readOnly={!isEditMode}
                  />
                  {errCode !== '' ? (
                    <div className="d-block invalid-feedback">{errCode}</div>
                  ) : (
                    errors.username && touched.username && <div className="d-block invalid-feedback">{f({ id: errors.username })}</div>
                  )}
                </Col>

                <Col sm="12" md="12" lg="4">
                  <Form.Label className="col-form-label required">{f({ id: 'user.password' })}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    onChange={handleChange}
                    // value={''}
                    isInvalid={errors.password && touched.password}
                    placeholder="*********"
                    readOnly={!isEditMode}
                  />
                  {/* <Form.Text>Must be at least 6 chars!</Form.Text> */}
                  {errors.password && touched.password && <div className="d-block invalid-feedback">{f({ id: errors.password })}</div>}
                </Col>
                <Col sm="12" md="12" lg="4">
                  <Form.Label className="col-form-label required">{f({ id: 'user.confirmpassword' })}</Form.Label>
                  <Form.Control
                    type="password"
                    name="passwordConfirm"
                    onChange={handleChange}
                    // value={''}
                    isInvalid={errors.passwordConfirm && touched.passwordConfirm}
                    placeholder="*********"
                    readOnly={!isEditMode}
                  />
                  {errors.passwordConfirm && touched.passwordConfirm && <div className="d-block invalid-feedback">{f({ id: errors.passwordConfirm })}</div>}
                </Col>
              </Row>
              {/* )} */}
              <Row>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'user.avatar' })}</Form.Label>
                  <Card className="no-shadow border mt-2 p-2">
                    <Row className="mb-3">
                      <Col sm="12" md="12" lg="5" className="position-relative cursor-pointer">
                        <img
                          src={preview !== undefined ? preview : `${values.avatar ? values.avatar : '/img/userEmpty/account.png'}`}
                          className="rounded-md pt-2 ms-3"
                          alt="thumb"
                          style={{ width: '11rem', height: '7.8rem', objectFit: 'contain' }}
                        />
                        <input
                          disabled={!isEditMode}
                          onChange={onSelectFile}
                          // value={values.logo}
                          className="border-2"
                          id="file-upload"
                          style={{
                            width: '180px',
                            height: '120px',
                            borderRadius: '100%',
                            position: 'absolute',
                            left: '26px',
                            top: '13px',
                            opacity: '0',
                            cursor: 'pointer',
                          }}
                          accept="image/jpeg, image/bmp, image/pmg, image/png"
                          // jpeg bmp pmg
                          type="file"
                        />
                      </Col>
                      <Col sm="12" md="12" lg="7">
                        <div className="h5 mb-0 font-weight-600 p-2">Upload new avatar</div>
                        <button disabled={!isEditMode} className="border-0 bg-white pb-2" type="button" style={{ borderRadius: '10px' }}>
                          <input
                            disabled={!isEditMode}
                            onChange={onSelectFile}
                            id="file-upload"
                            className="hidden form-control"
                            accept="image/jpeg, image/bmp, image/pmg, image/png"
                            type="file"
                          />
                        </button>
                        <div className="text-muted">
                          <span className={`${fileSizeAlert ? 'text-danger  p-2' : 'text-info p-2'}`}>The maximum file size allowed is 1MB.</span>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'user.status' })}</Form.Label>
                  <Form.Check
                    type="switch"
                    id="status"
                    label={f({ id: values.status ? 'user.status.active' : 'user.status.inactive' })}
                    checked={values.status}
                    className="mt-2"
                    onChange={handleChangeStatus}
                    isInvalid={errors.status}
                    disabled={!isEditMode}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {permission && (
            <AddUserItemModal show={showModal} setShowModal={setShowModal} list={permission} roleOptions={roleOptions} onSave={handleOnSaveUserTypeItem} />
          )}
          {/* Customer detail End */}
        </Form>
      </Col>
    </>
  );
};

export default InformationForm;
