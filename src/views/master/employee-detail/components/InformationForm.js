/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */
/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import classNames from 'classnames';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';

const initialData = {
  code: '',
  prefix: '',
  name: '',
  firstName: '',
  lastName: '',
  firstNameEn: '',
  lastNameEn: '',
  department: '',
  position: '',
  status: '',
  createdAt: '',
  createdBy: '',
  updatedAt: '',
  updatedBy: '',
  roleList: '',
  isDeleted: '',
};

const prefixList = [
  { label: 'คุณ', value: 'คุณ' },
  { label: 'นาย', value: 'นาย' },
  { label: 'นาง', value: 'นาง' },
  { label: 'นางสาว', value: 'นางสาว' },
];

const InformationForm = ({ id, departmentOptions, positionOptions, salesAreaOptions }) => {
  const [isEditMode, setEditMode] = useState(!id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [name, setName] = useState('');
  const [errCode, setErrorCode] = useState('');
  const { push } = useHistory();
  const queryClient = useQueryClient();
  const { formatMessage: f, formatDate: fd } = useIntl();

  const useEmployeeData = (employeeId) =>
    useQuery(`editEmployeeData`, getEmployeeFn(employeeId), {
      enabled: !!employeeId,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const getEmployeeFn = (employeeId) => () =>
    axios
      .get(`${SERVICE_URL}/employee/${employeeId}`)
      .then((res) => res.data.data)
      .then((data) => {
        data.salesArea = salesAreaOptions?.find((item) => item.detail.code === data.salesArea);
        data.department = departmentOptions?.find((item) => item.detail.code === data.department);
        data.position = positionOptions?.find((item) => item.detail.code === data.position);
        data.prefix = prefixList?.find((item) => item.label === data.prefix);
        return {
          ...initialData,
          ...data,
          name: `${data?.firstName} ${data?.lastName}`,
        };
      });

  const createEmployeeFn = (employee) => axios.post(`${SERVICE_URL}/employee/add`, employee).then((res) => res.data);

  const updateEmployeeFn = ({ id, employee }) =>
    axios
      .post(`${SERVICE_URL}/employee/${id}/edit`, employee, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => res.data);

  const validationSchema = Yup.object().shape({
    // code: Yup.string().required('employee.detail.validation.code.required'),
    prefix: Yup.object().required('employee.detail.validation.prefix.required'),
    department: Yup.object().required('employee.detail.validation.department.required'),
    position: Yup.object().required('employee.detail.validation.position.required'),
    firstName: Yup.string().max(70, 'employee.detail.validation.length.required').required('employee.detail.validation.firstName.required'),
    lastName: Yup.string().max(70, 'employee.detail.validation.length.required').required('employee.detail.validation.lastName.required'),
    firstNameEn: Yup.string().max(70, 'employee.detail.validation.length.required').required('employee.detail.validation.firstName.required'),
    lastNameEn: Yup.string().max(70, 'employee.detail.validation.length.required').required('employee.detail.validation.lastName.required'),
  });

  const { data: initResult, isFetching, error, refetch } = useEmployeeData(id);

  if (error) {
    console.error('error :', error);
  }

  const title =
    id === undefined
      ? f({ id: `employee.detail.title` }, { employeeName: '' })
      : f({ id: `employee.detail.title` }, { employeeName: name !== '' ? name : initResult?.name });
  const description =
    id === undefined
      ? f({ id: `employee.add.subTitle` })
      : f(
          { id: `employee.${!id ? 'add' : 'edit'}.subTitle` },
          {
            updatedBy: initResult?.updatedBy,
            updatedAt: new Date(initResult?.updatedAt || null),
          }
        );

  const onSubmit = (formData) => {};

  var init = '';
  if (id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const deleteEmployee = async (deleteID) => {
    setIsDeletingLoading(true);
    const resp = await axios({
      url: `/employee/${deleteID}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./');
    // return responseTransformer(resp);
  };

  const { mutate: createEmployee, isLoading: isAdding } = useMutation(createEmployeeFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableAdd(false);
      console.debug('create employee success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editEmployeeData');
    },
  });

  const { mutate: updateEmployee, isLoading: isSaving } = useMutation(updateEmployeeFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableEdit(false);
      console.debug('update employee success :', data);
      refetch();
      toast(<ToastCreateSuccess />);
      setErrorCode('');
    },
    onError(err) {
      setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('editEmployeeData');
    },
  });

  const ToastCreateSuccess = () => {
    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'employee.save.success' })}</span>
        </div>
      </>
    );
  };

  const handleDeleteConfirm = () => {
    deleteEmployee(id);
  };

  const handleSave = () => {
    var data = {
      code: values.code,
      prefix: values.prefix?.value === undefined ? values.prefix : values.prefix.value,
      firstName: values.firstName,
      lastName: values.lastName,
      firstNameEn: values.firstNameEn,
      lastNameEn: values.lastNameEn,
      address1: values.address1,
      address2: values.address2,
      department: values.department?.value === undefined ? values.department : values.department.detail.code,
      position: values.position?.value === undefined ? values.position : values.position.detail.code,
      salesArea: values.salesArea?.value === undefined ? values.salesArea : values.salesArea.detail.code,
      roleList: ['ADMIN'],
      status: values.status,
    };
    console.log(data);
    if (Object.keys(errors).length === 0 && values.code !== '') {
      if (id) {
        // save
        // setEnableEdit(true);
        updateEmployee({ id, employee: data });
        setName(`${values.firstName} ${values.lastName}`);
      } else {
        // create
        // setEnableAdd(true);
        createEmployee(data);
      }
    }
  };

  const handleChangePrefix = (value) => {
    // setIsErrorDepartment(false);
    handleChange({ target: { id: 'prefix', value } });
  };
  const handleChangeDepartment = (value) => {
    // setIsErrorDepartment(false);
    handleChange({ target: { id: 'department', value } });
  };

  const handleChangePosition = (value) => {
    // setIsErrorDepartment(false);
    handleChange({ target: { id: 'position', value } });
  };

  const handleChangeSalesArea = (value) => {
    // setIsErrorDepartment(false);
    handleChange({ target: { id: 'salesArea', value } });
  };

  const handleChangeRole = (value) => {
    // setIsErrorPosition(false);
    handleChange({ target: { id: 'roleList', value } });
  };

  useEffect(() => {
    setErrorCode('');
  }, [values.code]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        <Form onSubmit={handleSubmit}>
          {/* Title Start */}
          <div className="page-title-container mb-3">
            <Row>
              <Col className="mb-2">
                <div className="page-title-container mb-3">
                  <Row>
                    <Col xs="auto" className="mb-2 align-self-md-center">
                      <NavLink to="/master/employee" className="btn-link btn-icon-start w-100 w-md-auto">
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
                          <Button className="btn-icon" variant="outline-danger" onClick={handleDeleteClick}>
                            <CsLineIcons icon="bin" />
                          </Button>
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

          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row>
                <Col sm="12" md="12" lg="12">
                  <Form.Label className="col-form-label">{f({ id: 'employee.code' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    onChange={handleChange}
                    value={values.code}
                    // disabled={values.id}
                    isInvalid={errors.code && touched.code}
                    readOnly={!isEditMode}
                  />
                  {errCode !== '' ? (
                    <div className="d-block invalid-feedback">{errCode}</div>
                  ) : (
                    errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>
                  )}
                </Col>
              </Row>
              <Row>
                <Col sm="12" md="2" lg="2">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.prefix' })}</Form.Label>
                  <Select
                    classNamePrefix="react-select"
                    options={prefixList}
                    isDisabled={!isEditMode}
                    value={values.prefix || ''}
                    required
                    onChange={handleChangePrefix}
                  />
                  {errors.prefix && touched.prefix && <div className="d-block invalid-feedback">{f({ id: errors.prefix })}</div>}
                </Col>
                <Col sm="12" md="5" lg="5">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.firstName' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    maxLength={70}
                    onChange={handleChange}
                    value={values.firstName || ''}
                    isInvalid={errors.firstName && touched.firstName}
                    readOnly={!isEditMode}
                  />
                  {errors.firstName && touched.firstName && <div className="d-block invalid-feedback">{f({ id: errors.firstName })}</div>}
                </Col>
                <Col sm="12" md="5" lg="5">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.lastName' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    maxLength={70}
                    onChange={handleChange}
                    value={values.lastName || ''}
                    isInvalid={errors.lastName && touched.lastName}
                    readOnly={!isEditMode}
                  />
                  {errors.lastName && touched.lastName && <div className="d-block invalid-feedback">{f({ id: errors.lastName })}</div>}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm="12" md="2" lg="2">
                  {' '}
                </Col>
                <Col sm="12" md="5" lg="5">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.firstNameEn' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstNameEn"
                    maxLength={70}
                    onChange={handleChange}
                    value={values.firstNameEn || ''}
                    isInvalid={errors.firstNameEn && touched.firstNameEn}
                    readOnly={!isEditMode}
                  />
                  {errors.firstNameEn && touched.firstNameEn && <div className="d-block invalid-feedback">{f({ id: errors.firstNameEn })}</div>}
                </Col>
                <Col sm="12" md="5" lg="5">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.lastNameEn' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastNameEn"
                    maxLength={70}
                    onChange={handleChange}
                    value={values.lastNameEn || ''}
                    isInvalid={errors.lastNameEn && touched.lastNameEn}
                    readOnly={!isEditMode}
                  />
                  {errors.lastNameEn && touched.lastNameEn && <div className="d-block invalid-feedback">{f({ id: errors.lastNameEn })}</div>}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm="12" md="6" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'employee.address1' })}</Form.Label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    name="address1"
                    maxLength={70}
                    onChange={handleChange}
                    value={values.address1 || ''}
                    // isInvalid={errors.address1 && touched.address1}
                    readOnly={!isEditMode}
                  />
                </Col>
                <Col sm="12" md="6" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'employee.address2' })}</Form.Label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    name="address2"
                    maxLength={70}
                    onChange={handleChange}
                    value={values.address2 || ''}
                    // isInvalid={errors.lastaddress2Name && touched.address2}
                    readOnly={!isEditMode}
                  />
                </Col>
              </Row>
              <Row>
                <Col sm="12" md="4">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.department' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="department">
                    <Select
                      classNamePrefix="react-select"
                      options={departmentOptions}
                      isDisabled={!isEditMode}
                      value={values.department || ''}
                      required
                      onChange={handleChangeDepartment}
                    />
                    {errors.department && touched.department && <div className="d-block invalid-feedback">{f({ id: errors.department })}</div>}
                  </Form.Group>
                </Col>
                <Col sm="12" md="4">
                  <Form.Label className="col-form-label required">{f({ id: 'employee.position' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="position">
                    <Select
                      classNamePrefix="react-select"
                      options={positionOptions}
                      isDisabled={!isEditMode}
                      value={values.position || ''}
                      required
                      onChange={handleChangePosition}
                    />
                    {errors.position && touched.position && <div className="d-block invalid-feedback">{f({ id: errors.position })}</div>}
                  </Form.Group>
                </Col>
                <Col sm="12" md="4">
                  <Form.Label className="col-form-label">{f({ id: 'employee.saleArea' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="salesArea">
                    <Select
                      classNamePrefix="react-select"
                      options={salesAreaOptions}
                      isDisabled={!isEditMode}
                      value={values.salesArea || ''}
                      required
                      onChange={handleChangeSalesArea}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {/* <Row className="mb-2 mt-4">
                <Col sm="12" md="12" lg="12">
                  <Form.Label className="col-form-label">{f({ id: 'employee.role' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="role">
                    <Select
                      classNamePrefix="react-select"
                      options={roleList}
                      isDisabled={!isEditMode}
                      value={values.roleList || ''}
                      required
                      onChange={handleChangeRole}
                      isMulti
                    />
                  </Form.Group>
                </Col>
              </Row> */}
              <Row>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.updatedBy' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="updatedBy"
                    onChange={handleChange}
                    value={values.updatedBy || ''}
                    isInvalid={errors.updatedBy && touched.updatedBy}
                    readOnly
                  />
                  {errors.updatedBy && touched.updatedBy && <div className="d-block invalid-feedback">{f({ id: errors.updatedBy })}</div>}
                </Col>
                <Col sm="12" md="12" lg="6">
                  <Form.Label className="col-form-label">{f({ id: 'supplier.updatedAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="updatedAt"
                    onChange={handleChange}
                    value={
                      values.updatedAt === ''
                        ? ''
                        : fd(values.updatedAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                            .replace('/', '-')
                            .replace('/', '-') || ''
                    }
                    isInvalid={errors.updatedAt && touched.updatedAt}
                    readOnly
                  />
                  {errors.updatedAt && touched.updatedAt && <div className="d-block invalid-feedback">{f({ id: errors.updatedAt })}</div>}
                </Col>
              </Row>
              <Row>
                <Col sm="12" md="12" lg="12">
                  <Form.Label className="col-form-label" htmlFor="status">
                    {f({ id: 'employee.status' })}
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status === 'active' ? 'employee.status.active' : 'employee.status.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    checked={values.status === 'active'}
                    disabled={!isEditMode}
                    onChange={(e) => handleChange({ target: { id: 'status', value: e.target.checked ? 'active' : 'inactive' } })}
                    // onChange={(e) => {
                    //   console.log(e.target.value);
                    // }}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <ConfirmModal
            show={isDeleting}
            loading={isDeletingLoading}
            titleText={f({ id: 'common.warning' })}
            confirmText={f({ id: 'employee.delete.confirmation' })}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        </Form>
      </Col>
    </>
  );
};

export default InformationForm;
