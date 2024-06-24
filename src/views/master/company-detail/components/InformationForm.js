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
import NumberFormat from 'react-number-format';
import * as Yup from 'yup';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import AddCompanyItemModal from './AddCompanyItemModal';
import SelectCreatable from './SelectCreatable';

const initialData = {
  id: '',
  code: '',
  abbr: '',
  name: '',
  nameEn: '',
  exportId: '',
  address: '',
  addressEn: '',
  isDefault: false,
  status: false,
  codeDoc: [],
};

const createCompanyFn = (company) => axios.post(`${SERVICE_URL}/masterData/company/add`, company).then((res) => res.data);

const updateCompanyFn = ({ id, company }) =>
  request({
    method: 'post',
    url: `${SERVICE_URL}/masterData/company/${id}/edit`,
    data: company,
    headers: {
      'content-type': 'application/json',
    },
  }).then((res) => res.data);

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'company.save.success' })}</span>
      </div>
    </>
  );
};

const InformationForm = ({ id }) => {
  const queryClient = useQueryClient();
  const [isEditMode, setEditMode] = useState(!id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chooseCondition, setChooseCondition] = useState();
  const [errCode, setErrorCode] = useState('');
  const [preview, setPreview] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [fileSizeAlert, setFileSizeAlert] = useState(false);
  const { push } = useHistory();

  const getCompanyFn = (companyId) => () =>
    axios
      .get(`${SERVICE_URL}/masterData/company/${companyId}`)
      .then((res) => res.data.data)
      .then((data) => {
        return {
          ...initialData,
          ...data,
        };
      });

  const useCompanyData = (companyId) =>
    useQuery(`editCompanyData`, getCompanyFn(companyId), {
      enabled: !!companyId,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('company.detail.validation.name.required'),
    abbr: Yup.string().required('company.detail.validation.abbr.required'),
    nameEn: Yup.string().required('company.detail.validation.nameEn.required'),
    exportId: Yup.string().required('company.detail.validation.exportId.required'),
  });

  const { data: initResult, isFetching, error, refetch } = useCompanyData(id);

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
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  const title =
    id === undefined ? f({ id: `company.detail.title` }, { companyName: '' }) : f({ id: `company.detail.title` }, { companyName: initResult?.name });
  const description =
    id === undefined
      ? f({ id: `company.add.subTitle` })
      : f(
          { id: `company.${!id ? 'add' : 'edit'}.subTitle` },
          {
            updatedBy: initResult?.updatedBy,
            updatedAt: new Date(initResult?.updatedAt || null),
          }
        );

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

  const handleDeleteConfirm = () => {
    deleteCompany(id);
  };

  const deleteCompany = async (id) => {
    setIsDeletingLoading(true);
    await axios({
      url: `${SERVICE_URL}/masterData/company/${id}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./');
    // return responseTransformer(resp);
  };

  const { mutate: createCompany } = useMutation(createCompanyFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('create company success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
      setErrorCode('');
      if (data.data.isDefault) {
        localStorage.setItem('ConfigDecimal', data?.data?.configDecimal);
      }
    },
    onError(err) {
      console.error('create company error :', err);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries('AddCompanyData');
    },
  });

  const { mutate: updateCompany } = useMutation(updateCompanyFn, {
    onSuccess(data) {
      setEditMode(false);
      refetch();
      setEnableEdit(false);
      console.debug('update company success :', data);
      toast(<ToastCreateSuccess />);
      setErrorCode('');
      if (data.data.isDefault) {
        localStorage.setItem('ConfigDecimal', data?.data?.configDecimal);
      }
    },
    onError(err) {
      console.log(err);
      console.error('create company error :', err);
      const message = `This code (${values.code}) already exists. Please input another one`;
      setErrorCode(message);
    },
    onSettled() {
      queryClient.invalidateQueries(['editCompanyData', id]);
    },
  });

  const handleShowModal = (value) => {
    setShowModal(true);
    setChooseCondition(value);
    // onFetchType(value);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  const handleOnSaveCompanyTypeItem = async (value) => {
    const data = {
      condition: chooseCondition,
      data: value,
    };
    toast(<ToastCreateSuccess />);
    setShowModal(false);

    console.log(data);
    await axios.post(`${SERVICE_URL}/masterData/lov/employee/save`, data, {
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  const handleSave = () => {
    var data = {
      id: values.id,
      code: values.code,
      abbr: values.abbr,
      name: values.name,
      nameEn: values.nameEn,
      exportId: values.exportId,
      address: values.address,
      addressEn: values.addressEn,
      faxNo: values.faxNo,
      officeNo: values.officeNo,
      others: values.others,
      website: values.website,
      configDecimal: values.configDecimal,
      codeDoc: values.codeDoc,
      logo: values.logo,
      isDeleted: values.isDeleted,
      status: values.status,
      isDefault: values.isDefault,
    };

    if (Object.keys(errors).length === 0 && values.code !== '') {
      if (id) {
        // save
        setEnableEdit(true);
        updateCompany({ id, company: data });
      } else {
        // create
        createCompany(data);
      }
    }
  };

  const handleChangeList = (value, key) => {
    let officeNo = [];
    let faxNo = [];
    let others = [];
    let website = [];

    if (key === 'officeNo') {
      officeNo = value?.map((e) => e.value);
      handleChange({ target: { id: 'officeNo', value: officeNo } });
    }

    if (key === 'faxNo') {
      faxNo = value?.map((e) => e.value);
      handleChange({ target: { id: 'faxNo', value: faxNo } });
    }

    if (key === 'others') {
      others = value?.map((e) => e.value);
      handleChange({ target: { id: 'others', value: others } });
    }

    if (key === 'website') {
      website = value?.map((e) => e.value);
      handleChange({ target: { id: 'website', value: website } });
    }
  };

  useEffect(() => {
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
          handleChange({ target: { id: 'logo', value: imageUrl } });
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        <Form onSubmit={handleSubmit}>
          {/* Title Start */}
          <div className="page-title-container ">
            <Row className="form-row">
              <Col className="form-col-mt">
                {/* <h1 className="mb-2 pb-0 display-4">{title}</h1> */}
                <div className="page-title-container ">
                  <Row>
                    <Col xs="auto" className="mb-2 align-self-md-center">
                      <NavLink to="/master/company" className="btn-link btn-icon-start w-100 w-md-auto">
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
                            <Button className="btn-icon" variant="outline-alternate" onClick={handleCancelClick} disabled={isEnableEdit}>
                              <CsLineIcons icon="close" /> {f({ id: 'common.cancel' })}
                            </Button>
                          )}{' '}
                          <Button className="btn-icon" variant="primary" type="submit" onClick={handleSave} disabled={isEnableEdit}>
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
            className={classNames('', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="form-row">
                <Col sm="12" md="12" lg="4" className="form-col-mt">
                  <Form.Label className="col-form-label">{f({ id: 'company.code' })}</Form.Label>
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
                <Col sm="12" md="12" lg="4" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'company.abbr' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="abbr"
                    onChange={handleChange}
                    value={values.abbr}
                    // disabled={values.id}
                    isInvalid={errors.abbr && touched.abbr}
                    readOnly={!isEditMode}
                  />
                  {errors.abbr && touched.abbr && <div className="d-block invalid-feedback">{f({ id: errors.abbr })}</div>}
                </Col>
                <Col sm="12" md="12" lg="4" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'company.exportId' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="exportId"
                    onChange={handleChange}
                    value={values.exportId || ''}
                    isInvalid={errors.exportId && touched.exportId}
                    readOnly={!isEditMode}
                  />
                  {errors.exportId && touched.exportId && <div className="d-block invalid-feedback">{f({ id: errors.exportId })}</div>}
                </Col>
              </Row>
              <Row className=" form-row">
                <Col sm="12" md="12" lg="6" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'company.name.th' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={values.name || ''}
                    isInvalid={errors.name && touched.name}
                    readOnly={!isEditMode}
                  />
                  {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                </Col>
                <Col sm="12" md="12" lg="6" className="form-col-mt">
                  <Form.Label className="col-form-label required">{f({ id: 'company.name.en' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="nameEn"
                    onChange={handleChange}
                    value={values.nameEn || ''}
                    isInvalid={errors.nameEn && touched.nameEn}
                    readOnly={!isEditMode}
                  />
                  {errors.nameEn && touched.nameEn && <div className="d-block invalid-feedback">{f({ id: errors.nameEn })}</div>}
                </Col>
              </Row>
              <Row className=" form-row">
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.firstAddress' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      as="textarea"
                      rows={3}
                      onChange={handleChange}
                      value={values.address || ''}
                      isInvalid={errors.address && touched.address}
                      readOnly={!isEditMode}
                    />
                    {errors.address && touched.address && <div className="d-block invalid-feedback">{f({ id: errors.address })}</div>}
                  </Form.Group>
                </Col>
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.secondAddress' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="addressEn"
                      as="textarea"
                      rows={3}
                      onChange={handleChange}
                      value={values.addressEn || ''}
                      isInvalid={errors.addressEn && touched.addressEn}
                      readOnly={!isEditMode}
                    />
                    {errors.addressEn && touched.addressEn && <div className="d-block invalid-feedback">{f({ id: errors.addressEn })}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row className=" form-row">
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.officeNo' })}</Form.Label>
                    <Row>
                      {(values.officeNo !== undefined || isEditMode) && (
                        <SelectCreatable isEditMode={!isEditMode} values={values.officeNo} onChange={(value) => handleChangeList(value, 'officeNo')} />
                      )}
                    </Row>
                    {errors.officeNo && touched.officeNo && <div className="d-block invalid-feedback">{f({ id: errors.officeNo })}</div>}
                  </Form.Group>
                </Col>
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.faxNo' })}</Form.Label>
                    <Row>
                      {(values.faxNo !== undefined || isEditMode) && (
                        <SelectCreatable isEditMode={!isEditMode} values={values.faxNo} onChange={(value) => handleChangeList(value, 'faxNo')} />
                      )}
                    </Row>
                    {errors.faxNo && touched.faxNo && <div className="d-block invalid-feedback">{f({ id: errors.faxNo })}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row className=" form-row">
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.others' })}</Form.Label>
                    <Row>
                      {(values.others !== undefined || isEditMode) && (
                        <SelectCreatable isEditMode={!isEditMode} values={values.others} onChange={(value) => handleChangeList(value, 'others')} />
                      )}
                    </Row>
                    {errors.others && touched.others && <div className="d-block invalid-feedback">{f({ id: errors.others })}</div>}
                  </Form.Group>
                </Col>
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.web' })}</Form.Label>
                    <Row>
                      {(values.website !== undefined || isEditMode) && (
                        <SelectCreatable isEditMode={!isEditMode} values={values.website} onChange={(value) => handleChangeList(value, 'website')} />
                      )}
                    </Row>
                    {errors.website && touched.website && <div className="d-block invalid-feedback">{f({ id: errors.website })}</div>}
                  </Form.Group>
                </Col>
              </Row>

              <Row className=" form-row">
                <Col md="6" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="configDecimal">
                    <Form.Label className="col-form-label">{f({ id: 'company.decimal' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="configDecimal"
                      // as="textarea"
                      // rows={3}
                      onChange={handleChange}
                      value={values.configDecimal || ''}
                      isInvalid={errors.configDecimal && touched.configDecimal}
                      readOnly={!isEditMode}
                    />
                    {errors.configDecimal && touched.configDecimal && <div className="d-block invalid-feedback">{f({ id: errors.configDecimal })}</div>}
                  </Form.Group>
                </Col>
                <Col md="6" className="d-flex justify-content-center align-items-end gap-2 form-col-mt">
                  <Button variant="primary" className="hover-scale-up w-50" type="button" onClick={() => handleShowModal('department')}>
                    {f({ id: 'company.department' })}
                  </Button>
                  <Button variant="primary" className="hover-scale-up w-50" type="button" onClick={() => handleShowModal('position')}>
                    {f({ id: 'company.position' })}
                  </Button>
                  <Button variant="primary" className="hover-scale-up w-50" type="button" onClick={() => handleShowModal('salesArea')}>
                    {f({ id: 'company.salesArea' })}
                  </Button>
                </Col>
              </Row>
              <Row className="form-row">
                <Col md="3" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.createdAt' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="createdAt"
                      // as="textarea"
                      // rows={3}
                      onChange={handleChange}
                      value={moment(values.createdAt).add(543, 'year').format('DD/MM/YYYY') || '-'}
                      isInvalid={errors.createdAt && touched.createdAt}
                      readOnly
                    />
                    {errors.createdAt && touched.createdAt && <div className="d-block invalid-feedback">{f({ id: errors.createdAt })}</div>}
                  </Form.Group>
                </Col>
                <Col md="3" className="form-col-mt">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'company.updatedAt' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="updatedAt"
                      // as="textarea"
                      // rows={3}
                      onChange={handleChange}
                      value={moment(values.updatedAt).add(543, 'year').format('DD/MM/YYYY') || '-'}
                      isInvalid={errors.updatedAt && touched.updatedAt}
                      readOnly
                    />
                    {errors.updatedAt && touched.updatedAt && <div className="d-block invalid-feedback">{f({ id: errors.updatedAt })}</div>}
                  </Form.Group>
                </Col>

                <Col lg="3" md="6" sm="12">
                  <Form.Label className="col-form-label" htmlFor="status">
                    {f({ id: 'company.status' })}
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status ? 'company.status.active' : 'company.status.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    checked={values.status}
                    onChange={handleChange}
                    isInvalid={errors.status && touched.status}
                    disabled={!isEditMode}
                  />
                  {errors.status && touched.status && <div className="d-block invalid-tooltip">{f({ id: errors.status })}</div>}
                </Col>
                <Col  lg="3" md="6" sm="12">
                  <Form.Label className="col-form-label" htmlFor="isDefault">
                    {f({ id: 'company.default.company' })}
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.isDefault ? 'company.default.valid' : 'company.default.invalid' })}
                    className="mt-2"
                    id="isDefault"
                    name="isDefault"
                    checked={values.isDefault}
                    onChange={handleChange}
                    isInvalid={errors.isDefault && touched.isDefault}
                    disabled={!isEditMode}
                  />
                  {errors.isDefault && touched.isDefault && <div className="d-block invalid-tooltip">{f({ id: errors.isDefault })}</div>}
                </Col>
              </Row>
              <Row className="form-row">
                <Col sm="12" md="12" lg="6" className="form-col-mt">
                  <Form.Label className="col-form-label mt-2">{f({ id: 'user.avatar' })}</Form.Label>
                  <Card className="no-shadow border mt-2 p-2">
                    <Row className="">
                      <Col sm="12" md="12" lg="5" className="position-relative cursor-pointer">
                        <img
                          src={preview !== undefined ? preview : `${values.logo ? values.logo : '/img/logo/KSP.logo.png'}`}
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
                <Col sm="12" md="12" lg="6" className="form-col-mt">
                  <Row className="mb-1">
                    <Col sm="2" md="3" lg="3">
                      <Form.Label className="col-form-label" htmlFor="isDefault">
                        {f({ id: 'company.dataName' })}
                      </Form.Label>
                    </Col>
                    <Col sm="2" md="9" lg="9">
                      <Form.Label className="col-form-label" htmlFor="isDefault">
                        {f({ id: 'company.nextNumber' })}
                      </Form.Label>
                    </Col>
                  </Row>
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="codeDoc"
                      render={(arrayHelpers) => {
                        return [
                          values.codeDoc?.map(
                            (detail, index) => (
                              // isEditMode && (
                              // eslint-disable-next-line no-underscore-dangle
                              <Row className="mb-2" key={index}>
                                <Col sm="2" md="3" lg="3">
                                  <Form.Control
                                    className="form-control"
                                    allowNegative={false}
                                    name={`codeDoc.${index}.dataType`}
                                    value={detail.dataType}
                                    onChange={(e) => handleChange({ target: { id: `codeDoc.${index}.dataType`, value: e.target.value } })}
                                    readOnly={!isEditMode}
                                  />
                                </Col>
                                <Col sm="2" md="9" lg="8">
                                  <NumberFormat
                                    as={NumberFormat}
                                    className="form-control"
                                    allowNegative={false}
                                    name={`codeDoc.${index}.nextSeq`}
                                    value={detail.nextSeq}
                                    onChange={(e) => handleChange({ target: { id: `codeDoc.${index}.nextSeq`, value: e.target.value } })}
                                    readOnly={!isEditMode}
                                    mask="-"
                                    format="#######"
                                  />
                                </Col>
                                {isEditMode && ( // TODO: Change this before finish
                                  <Col sm="2" md="3" lg="1">
                                    <Button
                                      // disabled={isEditMode}
                                      className="btn-icon btn-icon-only"
                                      variant="outline-danger"
                                      onClick={() => arrayHelpers.remove(index)}
                                    >
                                      <CsLineIcons icon="bin" />
                                    </Button>
                                  </Col>
                                )}
                              </Row>
                            )
                            // )
                          ),

                          <div key="addConfigurationList" className="d-grid gap-2 ">
                            <Button
                              variant="outline-primary"
                              className="btn-icon btn-icon-start mb-1"
                              onClick={() =>
                                arrayHelpers.insert(values.codeDoc.length, {
                                  dataType: '',
                                  nextSeq: '',
                                })
                              }
                              disabled={!isEditMode}
                              hidden={values.codeDoc.length > 3}
                            >
                              <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                            </Button>
                          </div>,
                          !isEditMode && values?.codeDoc?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                        ];
                      }}
                    />
                  </FormikProvider>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <ConfirmModal
            show={isDeleting}
            loading={isDeletingLoading}
            titleText={f({ id: 'common.warning' })}
            confirmText={f({ id: 'company.delete.confirmation' })}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />

          {showModal && (
            <AddCompanyItemModal
              show={showModal}
              hide={handleHideModal}
              setShowModal={setShowModal}
              condition={chooseCondition}
              onSave={handleOnSaveCompanyTypeItem}
            />
          )}
        </Form>
      </Col>
    </>
  );
};

export default InformationForm;
