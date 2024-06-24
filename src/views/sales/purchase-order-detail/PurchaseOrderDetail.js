import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { Button, Modal, Spinner } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ReactToPrint from 'react-to-print';
import clx from 'classnames';
import { SERVICE_URL } from 'config';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from '../components/page-title/PageTitle';
import InformationForm from './components/InformationForm';
import Detail from './components/Detail';
import { usePurchaseOrderQuery } from './components/FormQuery';
import { useSavePurchaseOrder } from './components/FormMutation';
import AddPurchaseItemModal from './components/AddPurchaseItemModal2';
import { QUERY } from './constants';
import PuecheseOrderPrinting from './components/PuecheseOrderPrinting';

const typeOptions = [
  { value: '01', label: 'สั่งสำรองวัตถุดิบ' },
  { value: '02', label: 'เรียกวัตถุดิบ' },
  { value: '03', label: 'สั่งซื้อวัตถุดิบ' },
  { value: '04', label: 'สั่งซื้อวัสดุอื่นๆ' },
];

const getAddress = (addresses) => {
  if (!addresses || addresses.length === 0) {
    return '';
  }

  const defaultAddress = addresses.find((item) => item.isDefault);
  if (defaultAddress) {
    return defaultAddress.address;
  }

  const { address } = addresses[0];
  return address;
};

const PurchaseOrderDetail = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'purchaseOrder.list.title' });
  const description = f({ id: 'purchaseOrder.list.title' });
  const { id } = useParams();
  const componentRef = useRef(null);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isEditMode, setEditMode] = useState(!id);
  const [isLoading, setIsLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [isDefaultCompany, setIsDefaultCompany] = useState();
  const [supplier, setSupplier] = useState();
  const [type, setType] = useState();
  const [itemPIList, setItemPIList] = useState([]);
  const [isChangeType, setIsChangeType] = useState(false);

  const queryClient = useQueryClient();

  const { data, refetch, isFetching } = usePurchaseOrderQuery({ id, typeOptions, setIsLoading, getAddress });

  const { mutate: savePurchaseOrder } = useSavePurchaseOrder({ setIsLoading, typeOptions, refetch, itemPIList, typePo: type });

  const validationSchema = Yup.object().shape({
    type: Yup.object().required('Required'),
    supplierId: Yup.string().required('Required'),
  });

  const onSubmit = async (formData) => {
    setItemPIList(formData?.detail);
    setIsLoading(true);
    savePurchaseOrder(formData);
  };

  useEffect(() => {
    setType(data?.type?.value);
  }, [data.type]);

  const formik = useFormik({ initialValues: data, onSubmit, validationSchema, enableReinitialize: true });
  const {
    values: { no, updatedAt, status, supplierId },
    values,
    resetForm,
    handleChange,
    handleSubmit,
  } = formik;

  const handleOnAddPurchaseItem = (value) => {
    queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
      const detail = [...currentData.detail, value];

      return {
        ...currentData,
        detail,
      };
    });
  };

  const handleOnRemovePurchaseItem = (currentId, typePo) => {
    if (typePo !== '02') {
      queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
        const detail = currentData.detail.filter((item) => item?.id !== currentId);
        return {
          ...currentData,
          detail,
        };
      });
    } else {
      queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
        const detail = currentData.detail.filter((item) => item?.index !== currentId);
        return {
          ...currentData,
          detail,
        };
      });
    }
  };

  const handleSaveClick = () => {
    handleChange({ target: { id: 'status', value: 'NEW' } });
    handleSubmit();
    setEditMode(false);
  };

  const handleCancelClick = () => {
    handleChange({ target: { id: 'status', value: 'CANCELLED' } });
    handleSubmit();
    setIsDeleteModal(false);
  };

  const handleSubmitClick = () => {
    handleChange({ target: { id: 'status', value: 'SUBMITTED' } });
    handleSubmit();
    setEditMode(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleConfirm = () => {
    // setEditMode(true);
    setIsConfirmModal(false);
    return <ReactToPrint trigger={() => setIsConfirmModal(false)} content={() => componentRef.current} />;
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
    setIsDeleteModal(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    resetForm();
  };

  const searchDefaultCompany = async () => {
    const res = await request({ url: `/masterData/company/find?isDefault=true` });
    return res.data.data[0];
  };

  const searchSupplier = async (sid) => {
    const res = await request({ url: `/masterData/supplier/${sid}` });
    return res.data.data;
  };

  useEffect(async () => {
    const resultDataDefaultCustomer = await searchDefaultCompany();
    setIsDefaultCompany(resultDataDefaultCustomer);
    if (data.supplierId !== '') {
      const resultDataSupplier = await searchSupplier(data.supplierId);
      setSupplier(resultDataSupplier);
    }
  }, [isFetching]);

  useEffect(() => {
    if (isChangeType) {
      data.detail = [];
      setIsChangeType(false);
    }
  }, [isChangeType]);
  useEffect(async () => {
    const {
      data: { data: dataValue },
    } = await axios.get(`${SERVICE_URL}/inventory/material/find?isSupplier=true`);
    console.log(dataValue);
    return dataValue;
  }, []);

  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="info" size="small" onClick={onConfirm} disabled={loading}>
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const ConfirmModalDelete = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>

            <Button variant="info" size="small" onClick={onConfirm} disabled={loading}>
              {confirmText || f({ id: 'common.delete' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={no ? `${f({ id: 'purchaseOrder.detail.title' })} ${no}` : f({ id: 'purchaseOrder.detail.add' })}
        description={updatedAt ? `${f({ id: 'purchaseOrder.field.updatedAt' })} ${updatedAt}` : ''}
        isLoading={isLoading}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: cancelEdit, isHide: !isEditMode || !id },
          edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || isEditMode },
          save: {
            label: f({ id: 'common.save' }),
            onSubmit: handleSaveClick,
            isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode,
          },
          delete: { label: ' ', onDelete: () => setIsDeleteModal(true), isHide: status === 'CANCELLED' || isEditMode || !id },
          submit: { label: f({ id: 'common.submit' }), onSubmit: handleSubmitClick, isHide: status === 'SUBMITTED' || status === 'CANCELLED' || !isEditMode },
          export: { label: f({ id: 'common.print' }), onSubmit: () => setIsConfirmModal(true) },
        }}
      />
      <InformationForm
        isEditMode={isEditMode}
        form={formik}
        getAddress={getAddress}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        typeOptions={typeOptions}
        setIsDisableButton={setIsDisableButton}
        setType={setType}
        setIsChangeType={setIsChangeType}
        id={id}
      />
      {values.status !== 'SUBMITTED' && values.status !== 'CANCELLED' && (
        <div className="mb-3" style={{ textAlign: 'right' }}>
          <Button
            variant="primary"
            className="btn-icon btn-icon-start w-100 w-md-auto"
            onClick={() => setAddModal(true)}
            disabled={!isDisableButton || !isEditMode}
          >
            <CsLineIcons icon="plus" /> <span>{f({ id: 'purchaseOrder.detail.purchaseItem.add' })}</span>
          </Button>
        </div>
      )}
      <Detail data={data} isLoading={isLoading} isEditMode={isEditMode} typePo={type} />
      {data?.supplierId && (
        <AddPurchaseItemModal
          show={addModal}
          onHide={setAddModal}
          list={data?.detail}
          removedList={data?.removedList || []}
          supplierId={data?.supplierId}
          typePo={type}
          onAdd={handleOnAddPurchaseItem}
          onRemove={handleOnRemovePurchaseItem}
        />
      )}
      <ConfirmModal
        show={isConfirmModal}
        // loading={supplier}
        titleText={f({ id: 'common.warning' })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ConfirmModalDelete
        show={isDeleteModal}
        // loading={supplier}
        titleText={f({ id: 'common.warning' })}
        confirmText={f({ id: 'common.delete' })}
        onConfirm={handleCancelClick}
        onCancel={handleCancel}
      />
      {supplier !== undefined && (
        <PuecheseOrderPrinting
          ref={(el) => {
            componentRef.current = el;
          }}
          form={formik}
          defaultCompany={isDefaultCompany}
          supplier={supplier}
          setIsConfirmModal={setIsConfirmModal}
        />
      )}
    </>
  );
};

export default PurchaseOrderDetail;
