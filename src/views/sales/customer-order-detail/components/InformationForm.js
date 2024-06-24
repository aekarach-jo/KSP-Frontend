import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { Card, Col, Form, Row, Modal, Button } from 'react-bootstrap';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import LovCustomerOrderSelect from 'components/lov-select/LovCustomerOrderSelect';
import DepartmentInput from 'components/input-auto/DepartmentInput';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import classNames from 'classnames';
import { SERVICE_URL } from 'config';

import PageTitle from '../../components/page-title/PageTitle';
import UploadProductModal from './UploadProductModal';

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Required'),
});

const callSaveOrder = (refetch, data = {}, file, setIsLoading, id, history, errorReason, setShowModalConfirm, setEditMode) => {
  setIsLoading(true);
  const formData = new FormData();
  formData.append('order', JSON.stringify(data));
  if (data?.id) formData.append('orderId', data.id);
  if (file) formData.append('file', file);
  if (data?.no) formData.append('no', data.no);
  if (data?.isSubmit) formData.append('isSubmit', true);
  if (data?.isCancel) formData.append('isCancel', true);
  if (data?.isRevert) {
    formData.append('isRevert', true);
    if (data?.reason !== undefined || data?.reason !== null || data?.reason !== '') {
      formData.append('reason', data.reason);
    }
  }
  if (!errorReason) {
    return axios
      .post(`${SERVICE_URL}/saleOrder/save`, formData)
      .then(function (response) {
        // setEditMode(false);
        toast('บันทึกสำเร็จ');
        history.replace(`/sales/customer-order/${response.data.data.id}`);
        setShowModalConfirm(false);
        refetch();
      })
      .catch(function (error) {
        console.error(error);
        refetch();
      });
  }
  return undefined;
};
const InformationForm = ({
  data,
  getAddress,
  getCreditTerm,
  uploadModal,
  setUploadModal,
  isLoading,
  setIsLoading,
  setOnRefetch,
  dataCO,
  isEditMode,
  refetch,
  setEditMode,
  id,
  setModalData,
}) => {
  const { formatMessage: f, formatDate: fd } = useIntl();

  const [isUpload, setIsUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [errorReason, setErrorReason] = useState(false);

  const queryClient = useQueryClient();
  const history = useHistory();
  const [saleStatus, setSaleStatus] = useState(false);
  if (!saleStatus && !id) {
    data.area = dataCO?.area;
    data.department = dataCO?.department;
    data.salesUser = dataCO?.salesUser;
    data.saleData = dataCO?.saleData;
    data.departmentList = dataCO?.departmentList;
    setSaleStatus(true);
  }
  const { mutate: saveOrder } = useMutation(
    (currentData) => callSaveOrder(refetch, currentData, uploadFile, setIsLoading, id, history, errorReason, setEditMode),
    {
      onSuccess({ data: { message, error, data: savedData } }) {
        const {
          id: idSave,
          detail = [],
          customerId: { id: customerId },
        } = savedData;
        queryClient.setQueryData('customerOrder', (currentData) => {
          const newDetail = detail.map((item) => {
            if (item?.product?.id) {
              item.productId = item.product.id;
            }
            return item;
          });
          return {
            ...currentData,
            ...savedData,
            customerId,
            detail: newDetail,
            id,
          };
        });
        setEditMode(false);
        setIsLoading(false);
        setOnRefetch(true);
        setUploadFile(null);
        history.replace({ pathname: `/sales/customer-order/${savedData.id}` });
      },
      onError(err) {
        setIsLoading(false);
        console.error('save order error :', err);
      },
    }
  );

  const onSubmit = (formData) => {
    if (isUpload) {
      return;
    }
    saveOrder(formData);
  };

  const formik = useFormik({ initialValues: data, onSubmit, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, errors, isValid } = formik;
  const handleSelectCustomer = (value) => {
    queryClient.setQueryData('customerOrder', (currentData) => ({
      ...currentData,
      customerId: value?.detail.id,
      customerCode: value?.detail.code,
      customerAddress: getAddress(value?.detail.list),
      creditTerm: value?.detail.creditTerm,
    }));
    setModalData([]);
  };
  const handleSelectEmployee = (value) => {
    if (value !== null) {
      const salesUser = value.value;
      const saleArea = dataCO?.saleData.find((item) => item.code === value.detail.salesArea);
      handleChange({ target: { id: 'salesUser', value: salesUser } });
      handleChange({ target: { id: 'department', value: value.detail.department } });
      if (saleArea === undefined) {
        handleChange({ target: { id: 'area', value: '' } });
      } else {
        handleChange({ target: { id: 'area', value: saleArea.name } });
      }
    } else {
      const salesUser = '';
      handleChange({ target: { id: 'salesUser', value: salesUser } });
      handleChange({ target: { id: 'department', value: '' } });
      handleChange({ target: { id: 'area', value: '' } });
    }
  };
  const handleEditClick = () => {
    setEditMode(true);
  };
  const handleSave = (value) => {
    handleChange({ target: { id: 'status', value: 'NEW' } });
    handleSubmit();
  };
  const handleOnUpload = (file) => {
    setUploadFile(file);
    setIsUpload(false);
    handleSubmit();
  };
  const onSetDeliverDate = (e) => {
    handleChange({ target: { id: 'deliverDt', value: e } });
  };
  const cancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const revertSave = () => {
    handleChange({ target: { id: 'isRevert', value: true } });
    if (values.reason !== undefined) {
      setShowModalConfirm(false);
      setErrorReason(false);
      handleSubmit();
    } else {
      setErrorReason(true);
    }
  };

  const handleCancelClick = () => {
    handleChange({ target: { id: 'status', value: 'CANCELLED' } });
    handleChange({ target: { id: 'isCancel', value: true } });
    refetch();
    handleSubmit();
    window.location.reload();
  };
  const handleSubmitClick = () => {
    if (id !== undefined) {
      handleChange({ target: { id: 'instanceSubmit', value: true } });
    }
    handleChange({ target: { id: 'isSubmit', value: true } });
    handleSubmit();
  };

  useEffect(() => {
    return () => {
      queryClient.resetQueries('customerOrder', { exact: true });
      resetForm();
    };
  }, [queryClient, resetForm]);

  useEffect(() => {
    if (uploadModal) {
      handleSubmit();
      setIsUpload(true);
      setUploadModal(false);
    }
  }, [uploadModal, handleSubmit, setUploadModal]);
  console.log(values);
  return (
    <>
      {/* <Title data={data} isLoading={isLoading} onSubmit={handleSave} isEditMode={isEditMode} handleEditClick={handleEditClick} /> */}
      <PageTitle
        title={data?.no ? `${f({ id: 'customerOrder.detail.title' })} ${data?.no}` : f({ id: 'customerOrder.detail.add' })}
        description={data.updatedAt ? `${f({ id: 'customerOrder.detail.lastUpdatedAt' })} ${data?.updatedAt}` : ''}
        isLoading={isLoading}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: cancelClick, isHide: !isEditMode || !id },
          edit: {
            label: f({ id: 'common.edit' }),
            onEdit: handleEditClick,
            isHide: data?.status === 'SUBMITTED' || data?.status === 'CANCELLED' || isEditMode,
          },
          save: { label: f({ id: 'common.save' }), onSubmit: handleSave, isHide: data?.status === 'SUBMITTED' || data?.status === 'CANCELLED' || !isEditMode },
          revert: { label: f({ id: 'common.revert' }), onSubmit: () => setShowModalConfirm(true), isHide: data?.status === 'NEW' || isEditMode || !id },
          delete: { label: ' ', onDelete: handleCancelClick, isHide: data?.status === 'CANCELLED' || isEditMode || !id },
          submit: {
            label: f({ id: 'common.submit' }),
            onSubmit: handleSubmitClick,
            isHide: data?.status === 'SUBMITTED' || data?.status === 'CANCELLED' || !isEditMode,
          },
        }}
      />
      {/* <h2 className="small-title">{f({ id: 'salesOrder.detail.information' })}</h2> */}
      <Card
        className={classNames('mb-5', {
          'overlay-spinner': isLoading,
        })}
      >
        <Card.Body>
          <Form noValidate>
            <Row className="form-row mb-3 g-3">
              <Col className="form-col-mt" md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="no">
                  <Form.Label>{f({ id: 'salesOrder.field.no' })}</Form.Label>
                  <Form.Control type="text" value={values.no || ''} readOnly={!isEditMode} isInvalid={!!errors.no} onChange={handleChange} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'salesOrder.field.no.required' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="6">
                <Form.Group className="position-relative tooltip-end-top" controlId="customerId">
                  <Form.Label>{f({ id: 'salesOrder.field.customerName' })}</Form.Label>
                  <span className="text-danger"> *</span>
                  {/* <AutocompleteCustomer
                    value={values.customerId}
                    initialValue={values.customerName}
                    onSelect={handleSelectCustomer}
                    inputProps={{ required: true, isInvalid: !!errors.customerId }}
                  /> */}
                  <LovCustomerOrderSelect
                    isClearable
                    isDisabled={!isEditMode}
                    value={values.customerId || ''}
                    // inputProps={{ required: true, isInvalid: !!errors.customerId }}
                    onChange={handleSelectCustomer}
                  />
                  <Form.Control.Feedback type="invalid" style={{ display: errors.customerId ? 'block' : 'none' }}>
                    {f({ id: 'salesOrder.field.customerName.required' })}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="4">
                <Form.Group className="position-relative tooltip-end-top" controlId="customerCode">
                  <Form.Label>{f({ id: 'salesOrder.field.customerCode' })}</Form.Label>
                  <Form.Control readOnly type="text" value={values.customerCode || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="8">
                <Form.Group className="position-relative tooltip-end-top" controlId="customerAddress">
                  <Form.Label>{f({ id: 'customerOrder.field.address' })}</Form.Label>
                  <Form.Control readOnly type="text" value={values.customerAddress || ''} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'customerOrder.field.address.required' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="validationStandard02">
                  <Form.Label>{f({ id: 'customerOrder.field.sales' })}</Form.Label>
                  <LovEmployeeSelect isDisabled={!isEditMode} isClearable value={values.salesUser || ''} onChange={handleSelectEmployee} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="validationStandard03">
                  <Form.Label>{f({ id: 'customerOrder.field.department' })}</Form.Label>
                  <DepartmentInput disabled isClearable value={values.department || ''} options={values.departmentList} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="validationStandard04">
                  <Form.Label>{f({ id: 'customerOrder.field.area' })}</Form.Label>
                  <Form.Control value={values.area} readOnly type="text" required />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="creditTerm">
                  <Form.Label>{f({ id: 'customerOrder.field.credit' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.creditTerm || ''} isInvalid={!!errors.creditTerm} />
                  <Form.Control.Feedback type="invalid">{f({ id: 'customerOrder.field.credit.required' })}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="createdAt">
                  <Form.Label>{f({ id: 'salesOrder.field.createdAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.createdAt ? fd(values.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : ''
                    }
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="updatedAt">
                  <Form.Label>{f({ id: 'customerOrder.field.updatedAt' })}</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={
                      values.updatedAt ? fd(values.updatedAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' }) : ''
                    }
                  />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="createdBy">
                  <Form.Label>{f({ id: 'salesOrder.field.createdBy' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.createdBy || ''} />
                </Form.Group>
              </Col>
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="updatedBy">
                  <Form.Label>{f({ id: 'customerOrder.field.updatedBy' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.updatedBy || ''} />
                </Form.Group>
              </Col>
              {/* <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="deliverDt">
                  <Form.Label>{f({ id: 'customerOrder.field.deliverDate' })}</Form.Label>
                  <DatepickerThaiYear
                    className="form-control"
                    value={values.deliverDt || ''}
                    onChange={(e) => onSetDeliverDate(e)}
                    format="DD/MM/YYYY"
                    disabled={!isEditMode}
                    // plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                  />
                </Form.Group>
              </Col> */}
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="deliverEx">
                  <Form.Label>{f({ id: 'customerOrder.field.exportDate' })}</Form.Label>
                  <Form.Control type="text" readOnly value={values.deliverEx || ''} onChange={handleChange} />
                </Form.Group>
              </Col>
              {/* <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="reference">
                  <Form.Label>อ้างอิง</Form.Label>
                  <Form.Control type="text" required value={values.reference} onChange={handleChange} isInvalid={!!errors.reference} />
                  <Form.Control.Feedback type="invalid">กรุณากรอกเลขที่อ้างอิง</Form.Control.Feedback>
                </Form.Group>
              </Col> */}
              <Col className="form-col-mt" md="3">
                <Form.Group className="position-relative tooltip-end-top" controlId="status">
                  <Form.Label>{f({ id: 'customerOrder.field.status' })}</Form.Label>
                  <Form.Control id="status" type="text" readOnly value={values.status || ''} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      <UploadProductModal modal={isUpload && isValid} setModal={setIsUpload} onUpload={handleOnUpload} />
      {showModalConfirm && (
        <Modal
          // contentClassName={classNames({ 'overlay-spinner': isDeletingLoading })}
          // backdrop={isDeletingLoading ? 'static' : true}
          show={showModalConfirm}
          onHide={() => setShowModalConfirm(false)}
          size="xs"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {f({ id: `customerOrder.revert` })} {values.no}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Col>
              {/* <Form.Group className="position-relative tooltip-end-top" controlId="reason"> */}
              {/* <Form.Label>{f({ id: 'customerOrder.field.reason' })}</Form.Label> */}
              <textarea
                style={{
                  width: '100%',
                  height: '165px',
                  fontSize: '450',
                }}
                className="form-control"
                name="reason"
                type="text"
                placeholder="เหตุผล..."
                onChange={handleChange}
                onInvalid={errorReason}
              />
              {errorReason && <div className="d-block invalid-feedback">{f({ id: 'customerOrder.field.reason.required' })}</div>}
              {/* </Form.Group> */}
            </Col>
          </Modal.Body>
          <Modal.Footer className="p-3 px-5">
            <Button variant="outline-primary" onClick={() => setShowModalConfirm(false)}>
              {f({ id: 'common.cancel' })}
            </Button>
            <Button type="submit" variant="primary" onClick={revertSave}>
              {f({ id: 'common.submit' })}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default InformationForm;
