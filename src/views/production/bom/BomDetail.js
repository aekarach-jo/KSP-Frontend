import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import { Field, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

import HtmlHead from 'components/html-head/HtmlHead';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavLink, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import { rawMaterialSchema } from '../rm/RmDetail';
import RmList from './components/RmList';

const NEW_BOM_DATA = 'NewBomData';
const EDIT_BOM_DATA = 'BomData';

const getDefaultValues = () => ({
  no: '',
  name: '',
  materialList: [],
  status: false,
});

const validationSchema = Yup.object().shape({
  no: Yup.string().required('bom.detail.validation.no.required'),
  name: Yup.string().required('bom.detail.validation.name.required'),
  materialList: Yup.array().of(Yup.object()),
  status: Yup.bool().default(false).required('bom.detail.validation.status.required'),
});

const requestTransformer = (bom) => {
  return {
    id: bom.id,
    no: bom.no,
    name: bom.name,
    materialList: bom.materialList.map((rm) => rm.id),
    status: bom.status || false,
  };
};

const responseTransformer = (response) => {
  return response.data;
};

const getBomFn = async ({ id }) => {
  const response = await request({
    url: `/bom/${id}`,
    method: 'get',
  });
  return responseTransformer(response);
};

const createBomFn = async (bom) => {
  const response = await request({ url: `/bom/add`, method: 'post', data: requestTransformer(bom) });
  return responseTransformer(response);
};

const saveBomFn = async ({ id, bom }) => {
  const response = await request({ url: `/bom/${id}/edit`, method: 'post', data: requestTransformer(bom) });
  return responseTransformer(response);
};

const deleteBomFn = async ({ id }) => {
  const response = await request({ url: `/bom/${id}/delete`, method: 'post' });
  return responseTransformer(response);
};

const useBomData = (id) =>
  useQuery(id ? [EDIT_BOM_DATA, id] : NEW_BOM_DATA, () => getBomFn({ id }), {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

const ToastSuccess = (value) => {
  const { formatMessage: f } = useIntl();
  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: value.textAlert })}</span>
      </div>
    </>
  );
};

const BomDetail = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const id = props.match?.params?.id;

  const { formatMessage: f } = useIntl();
  const [isEditMode, setEditMode] = useState(!id);
  const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false);
  const [errCode, setErrorCode] = useState('');

  const { push } = useHistory();

  const queryClient = useQueryClient();

  if (!id) {
    queryClient.resetQueries(NEW_BOM_DATA);
  }

  // Load BOM Data
  const { data: { data: initialValues = getDefaultValues() } = {}, isLoading } = useBomData(id);

  // Create BOM data
  const { mutate: createBom, isLoading: isAdding } = useMutation(createBomFn, {
    onSuccess: () => {
      toast(<ToastSuccess textAlert="bom.detail.add.success" />);
      // toast.success(f({ id: 'bom.detail.add.success' }));
      push('/master/bom');
      setErrorCode('');
    },
    onError: () => {
      toast.error(f({ id: 'bom.detail.add.fail' }));
      const message = `This code already exists.`;
      setErrorCode(message);
    },
  });

  // Update BOM data
  const { mutate: saveBom, isLoading: isSaving } = useMutation(saveBomFn, {
    onSuccess: () => {
      toast(<ToastSuccess textAlert="bom.detail.edit.success" />);
      // toast.success(f({ id: 'bom.detail.edit.success' }));
      setEditMode(false);
      queryClient.invalidateQueries([EDIT_BOM_DATA, id]);
      setErrorCode('');
    },
    onError: () => {
      toast.error(f({ id: 'bom.detail.edit.fail' }));
      const message = `This code already exists.`;
      setErrorCode(message);
    },
  });

  const { mutate: deleteBom, isLoading: isDeleting } = useMutation(deleteBomFn, {
    onSuccess: () => {
      toast(<ToastSuccess textAlert="bom.detail.delete.success" />);
      // toast.success(f({ id: 'bom.detail.delete.success' }));
      push('/master/bom');
    },
    onError: () => {
      toast.error(f({ id: 'bom.detail.delete.fail' }));
    },
  });

  const title = f({ id: `bom.detail.${!id ? 'add' : 'edit'}.title` }, { bomName: initialValues?.name });
  const description = f(
    { id: `bom.detail.${!id ? 'add' : 'edit'}.subTitle` },
    {
      updatedBy: initialValues?.updatedBy,
      updatedAt: new Date(initialValues?.updatedAt || new Date()),
    }
  );

  // Form stuff
  const onSubmit = (formData) => {
    console.log(formData);
    if (id) {
      // save
      saveBom({ id, bom: formData });
    } else {
      // create
      createBom(formData);
    }
    console.log('submit form', formData);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  // console.debug('errors :', errors);

  const setRmList = (list) => {
    setFieldValue('materialList', list);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    deleteBom({ id });
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmation(false);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        {/* Title Start */}
        <div className="page-title-container mb-3">
          <Row>
            <Col xs="auto" className="mb-2 align-self-md-center">
              <NavLink to="/master/bom" className="btn-link btn-icon-start w-100 w-md-auto">
                <CsLineIcons icon="arrow-left" />
              </NavLink>
            </Col>
            <Col className="mb-2">
              <h1 className="mb-2 pb-0 display-4">{title}</h1>
              <div className="font-heading description">{description}</div>
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
                    <Button className="btn-icon" variant="outline-alternate" onClick={handleCancelClick} disabled={isAdding || isSaving}>
                      <CsLineIcons icon="close" /> {f({ id: 'common.cancel' })}
                    </Button>
                  )}{' '}
                  <Button className="btn-icon" variant="primary" onClick={handleSubmit} disabled={isAdding || isSaving}>
                    <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </div>
        {/* Title End */}

        {/* Content Start */}
        <Form onSubmit={handleSubmit}>
          <h2 className="small-title">{f({ id: 'bom.detail.section.title' })}</h2>
          <Card
            className={classNames('mb-4', {
              'overlay-spinner': isLoading,
            })}
          >
            <Card.Body>
              <Row className="mb-3">
                <Col lg="3" md="4" sm="2">
                  <Form.Label className="col-form-label">{f({ id: 'bom.field.no' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="no"
                    onChange={handleChange}
                    value={values.no || ''}
                    isInvalid={errors.no && touched.no}
                    readOnly={!isEditMode}
                  />
                  {errCode !== '' ? (
                    <div className="d-block invalid-feedback">{errCode}</div>
                  ) : (
                    errors.no && touched.no && <div className="d-block invalid-feedback">{f({ id: errors.no })}</div>
                  )}{' '}
                </Col>
                <Col sm="5" md="6" lg="7">
                  <Form.Label className="col-form-label">{f({ id: 'bom.field.name' })}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={values.name || ''}
                    isInvalid={errors.name && touched.name}
                    readOnly={!isEditMode}
                    autoComplete="off"
                  />
                  {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                </Col>
                <Col sm="2" md="2" lg="2">
                  <Form.Label className="col-form-label">{f({ id: 'bom.field.status' })}</Form.Label>
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status ? 'bom.status.active' : 'bom.status.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    // checked={values.status}
                    // value={values.status}
                    onChange={handleChange}
                    isInvalid={errors.status && touched.status}
                    disabled={!isEditMode}
                    checked={values.status}
                  />
                  {errors.status && touched.status && <div className="d-block invalid-feedback">{f({ id: errors.status })}</div>}
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <h2 className="small-title">{f({ id: 'bom.detail.section.rm.title' })}</h2>

          <RmList rmList={values.materialList} setRmList={setRmList} disabled={!isEditMode} />
        </Form>
        {/* Content End */}

        <ConfirmModal
          show={isDeleteConfirmation}
          confirmText={f({ id: 'bom.delete.confirmation' })}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </Col>
    </>
  );
};

export default BomDetail;
