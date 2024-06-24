import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { Spinner } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import axios from 'axios';
import { request } from 'utils/axios-utils';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SERVICE_URL } from 'config';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';

import Title from './components/Title';
import InformationForm from './components/InformationForm';
import Detail from './components/Detail';

const initialData = {
  customerId: '',
  // customerCode: '',
  // customerAddress: '',
  // deliverDt: '',
  // creditTerm: '',
  reference: '',
};

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Required'),
});

const getAddress = (addresses) => {
  if (!addresses || addresses.length === 0) {
    return '';
  }

  const { address } = addresses.find((item) => item.isDefault) || addresses[0];
  return address;
};

const getCreditTerm = (addresses) => {
  if (!addresses || addresses.length === 0) {
    return '';
  }

  const { creditTerm } = addresses.find((item) => item.isDefault) || addresses[0];
  return creditTerm;
};
const callGetMasterDataSalesArea = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/employeeSalesArea?isDeleted=false`);
  return data;
};
const callGetMasterDataDepartment = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/employeeDepartment?isDeleted=false`);
  return data;
};
const callGetEmployee = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/employee/find`);
  return data;
};
const callSaveSync = (flagList = {}) => {
  return request({ url: `/saleOrderExp/updateItem`, method: 'post', data: { saleOrderExpIdList: flagList } });
};
const callGetSalesOrder = async (id, setDisableSubmit) => {
  const {
    data: { data },
  } = await request({ url: `/saleOrderExp/${id}` });
  const responseSales = await request({
    url: `/inventory/product/find?isSale=true`,
  });
  const {
    detail,
    customerId: { id: customerId, code: customerCode, name: customerName, list: addresses },
  } = data;
  const dataListSales = responseSales?.data?.data;
  const newDetail = detail.map((item) => {
    if (item?.product?.id) {
      item.productId = item.product.id;
      item.code = item.product?.code;
      item.name = item.product?.name;
      item.no = item?.reference;
    }
    dataListSales.map((item2) =>
      detail.forEach((item3) => {
        if (item3.product.id === item2.productId) {
          if (item3.amount > item2.amount) {
            item.statusWarning = true;
          } else {
            item.statusWarning = false;
          }
        } else {
          item.statusWarning = true;
          setDisableSubmit(true);
        }
      })
    );
    return item;
  });
  const resultSalesArea = await callGetMasterDataSalesArea();
  const resultDepartment = await callGetMasterDataDepartment();
  const saleObject = resultSalesArea.find((item) => item.code === data.salesUser.salesArea);
  data.saleData = resultSalesArea;
  data.area = saleObject?.name;
  data.department = data.salesUser?.department;
  data.salesUser = data.salesUser?.id;
  data.departmentList = resultDepartment;
  return { ...data, customerId, customerCode, customerName, customerAddress: getAddress(addresses), detail: newDetail, creditTerm: getCreditTerm(addresses) };
};

const callSaveOrder = (data = {}, discountState, setIsLoading) => {
  setIsLoading(true);
  let discount = '';
  let netPrice = '';
  if (data?.id) data.orderId = data.id;
  if (data?.detail) {
    const reference = [];
    data.detail = data.detail.map((item) => {
      if (!reference.find((ref) => ref === item.reference)) {
        reference.push(item.reference);
      }
      discount = parseFloat(item.discount);
      netPrice = item.price * item.amount - parseFloat(item.discount);
      return item.id;
    });
    data.reference = reference.toString();
  } else {
    data.detail = [];
    data.reference = '';
  }
  const discountData = [];
  const deliverData = [];
  discountState?.forEach((e) => {
    discountData.push({ id: e.id, discount: e.discount, netPrice: e.netPrice });
    deliverData.push({ id: e.id, product: e.product, amount: e.amount });
  });
  request({ url: `/saleOrderExp/updateItem`, method: 'post', data: { saleOrderDetail: discountData } });
  request({ url: `/saleOrderExp/deliver`, method: 'post', data: { saleOrderDetail: deliverData } });
  return request({ url: `/saleOrderExp/save`, method: 'post', data });
};

const callExportOrder = (data = {}, setIsLoading) => {
  setIsLoading(true);
  const exportData = {
    saleOrderExpIdList: [data.id],
  };
  return request({ url: `/express/transferSaleOrder`, method: 'post', data: exportData });
};

const SalesOrderDetail = () => {
  const { formatMessage: f } = useIntl();
  const history = useHistory();

  const title = f({ id: 'salesOrder.detail.title' });
  const description = '';

  const { id } = useParams();
  const isEdit = !!id;

  const [isEditMode, setEditMode] = useState(!id);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [onRefetch, setOnRefetch] = useState(false);
  const [flagList, setFlagList] = useState([]);
  const [syncState, setSyncState] = useState(false);
  const [syncFlagState, setSyncFlagState] = useState('');
  const [dataSO, setDataSO] = useState(undefined);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [discountState, setDiscountState] = useState([]);
  const [isDeleteRow, setIsDeleteRow] = useState(false);
  const { data, isFetching, refetch } = useQuery('salesOrder', () => callGetSalesOrder(id, setDisableSubmit), {
    enabled: !!id,
    initialData,
    refetchOnWindowFocus: false,
  });

  const { mutate: saveOrder } = useMutation((currentData) => callSaveOrder(currentData, discountState, setIsLoading), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
        return;
      }

      if (id) {
        setOnRefetch(true);
        refetch();
      }
      history.replace({ pathname: `/sales/sales-order/${savedData.id}` });
      if (!isDeleteRow) {
        toast('บันทึกสำเร็จ');
      }
      setEditMode(false);
      setIsDeleteRow(false);
      setIsLoading(false);
    },
    onError(err) {
      setIsLoading(false);
      console.error('save order error :', err);
    },
  });
  const { mutate: saveOrderSync } = useMutation(() => callSaveSync(flagList), {
    onSuccess({ data: { message, error, data: savedData } }) {
      if (error) {
        console.error('save order error :', message);
        return;
      }
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('save order error :', err);
    },
  });
  const { mutate: exportOrder } = useMutation(() => callExportOrder(data, setIsLoading), {
    onSuccess({ data: { message, error } }) {
      if (error) {
        console.error('expoer order error :', message);
        return;
      }
      refetch();
      setIsLoading(false);
      toast('นำออกสำเร็จ');
    },
    onError(err) {
      setIsLoading(false);
      console.error('save order error :', err);
    },
  });

  const onSubmit = (formData) => {
    if (isUpload) {
      return;
    }
    saveOrderSync(flagList);
    saveOrder(formData);
  };
  useEffect(async () => {
    const listSO = {};
    if (!isEdit) {
      const resultSalesArea = await callGetMasterDataSalesArea();
      const resultEmployee = await callGetEmployee();
      const resultDepartment = await callGetMasterDataDepartment();
      const userLogin = JSON.parse(window.localStorage.getItem('token'));
      listSO.salesUser = userLogin?.user.employee.id;
      const saleUserData = resultEmployee?.find((item) => item.id === listSO?.salesUser);
      const saleObject = resultSalesArea?.find((item) => item.code === saleUserData?.salesArea);
      const departmentData = resultDepartment?.find((item) => item.code === saleUserData?.department);
      listSO.area = saleObject?.name;
      listSO.department = departmentData?.name;
      listSO.saleData = resultSalesArea;
      listSO.departmentList = resultDepartment;
    }
    setDataSO(listSO);
  }, [onRefetch]);
  useEffect(() => {
    if (data.detail === undefined || data.detail?.length === 0) {
      setDisableSubmit(true);
    } else {
      setDisableSubmit(false);
      data.detail?.forEach((e, index) => {
        if (e.statusWarning || discountState[index]?.netPrice < 0) {
          setDisableSubmit(true);
        }
      });
    }
  }, [data, discountState]);
  const formik = useFormik({ initialValues: data, onSubmit, validationSchema, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm } = formik;
  const handleCancelClick = (value) => {
    handleChange({ target: { id: 'status', value: 'CANCELLED' } });
    handleSubmit();
    refetch();
    history.replace({ pathname: `/sales/sales-order/${id}` });
  };
  const handleSave = () => {
    setIsUpload(false);
    handleChange({ target: { id: 'status', value: 'NEW' } });
    handleSubmit();
  };
  const cancelEdit = () => {
    setEditMode(false);
    resetForm();
  };
  const handleSubmitClick = () => {
    handleChange({ target: { id: 'status', value: 'SUBMITTED' } });
    handleChange({ target: { id: 'isSubmit', value: true } });
    handleSubmit();
  };
  const handleEditClick = () => {
    setEditMode(true);
  };
  const fontStyle = {
    fontFamily: 'Poppins, sans-serif',
  };
  const customStyleDescrip = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
  };
  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  useEffect(() => {
    console.log(data);
    const aList = [];
    let check = false;
    if (flagList.length > 0) {
      flagList.forEach((v) => {
        if (v.id === syncFlagState) {
          check = true;
          aList.push({ id: v.id, isFlagSync: syncState });
        } else {
          aList.push({ id: v.id, isFlagSync: v.isFlagSync || false });
        }
      });
    } else {
      data?.detail?.forEach((v) => {
        aList.push({ id: v.id, isFlagSync: v.isFlagSync });
      });
    }
    if (!check && syncFlagState !== '') {
      aList.push({ id: syncFlagState, isFlagSync: syncState });
    }
    setFlagList(aList);
  }, [syncFlagState, syncState, data?.detail]);
  console.log(flagList);
  return (
    <>
      <HtmlHead title={title} description={description} />
      {/* <PageTitle
        title={data?.no ? `${f({ id: 'salesOrder.detail.title' })}: ${data.no}` : f({ id: 'salesOrder.detail.add' })}
        description={data?.no ? `${f({ id: 'salesOrder.detail.lastUpdatedAt' })} ${data.updatedAt}` : ''}
        isLoading={isFetching || isLoading}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: handleCancelClick, isHide: !isEdit },
          // edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: isEditMode },
          save: {
            label: f({ id: 'common.save' }),
            onSubmit: () => {
              setIsUpload(false);
              handleSubmit();
            },
          },
          submit: { label: f({ id: 'common.export' }), onSubmit: exportOrder, isHide: data?.transferredAt || !id },
        }}
      /> */}
      {/* <Title data={data} isLoading={isLoading} onSubmit={handleSave} isEditMode={isEditMode} handleEditClick={handleEditClick} /> */}
      <PageTitle
        fontStyle={fontStyle}
        customStyleDescrip={customStyleDescrip}
        title={data.no ? `${f({ id: 'salesOrder.detail.title' })} ${data.no}` : f({ id: 'salesOrder.detail.add' })}
        description={data.updatedAt ? `${f({ id: 'salesOrder.detail.lastUpdatedAt' })} ${data.updatedAt}` : ''}
        isLoading={isLoading}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: cancelEdit, isHide: !isEditMode || !id },
          edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: data.status === 'SUBMITTED' || data.status === 'CANCELLED' || isEditMode },
          save: { label: f({ id: 'common.save' }), onSubmit: handleSave, isHide: data.status === 'SUBMITTED' || data.status === 'CANCELLED' || !isEditMode },
          delete: { label: ' ', onDelete: handleCancelClick, isHide: data.status === 'CANCELLED' || isEditMode || !id },
          submit: {
            label: f({ id: 'common.submit' }),
            onSubmit: handleSubmitClick,
            isHide: data.status === 'SUBMITTED' || data.status === 'CANCELLED' || !isEditMode,
            disabled: disableSubmit,
          },
        }}
      />
      {dataSO ? (
        <InformationForm
          data={data}
          form={formik}
          getAddress={getAddress}
          getCreditTerm={getCreditTerm}
          uploadModal={uploadModal}
          setUploadModal={setUploadModal}
          isLoading={isFetching || isLoading}
          isUpload={isUpload}
          setIsUpload={setIsUpload}
          saveOrder={saveOrder}
          dataSO={dataSO}
          isEditMode={isEditMode}
          customStyle={customStyle}
        />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      <Detail
        data={data}
        form={formik}
        setUploadModal={setUploadModal}
        isLoading={isFetching || isLoading}
        handleSave={handleSave}
        setIsDeleteRow={setIsDeleteRow}
        customStyle={customStyle}
        isEditMode={isEditMode}
        setDisableSubmit={setDisableSubmit}
        discountState={discountState}
        setDiscountState={setDiscountState}
        setSyncState={setSyncState}
        setSyncFlagState={setSyncFlagState}
      />
    </>
  );
};

export default SalesOrderDetail;
