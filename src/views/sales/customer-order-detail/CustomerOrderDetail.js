import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Spinner } from 'react-bootstrap';
import { request } from 'utils/axios-utils';
import { useIntl } from 'react-intl';
import axios from 'axios';
import HtmlHead from 'components/html-head/HtmlHead';
import { SERVICE_URL } from 'config';

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
// const callVerifiedBy = async () => {
//   const {
//     data: { data },
//   } = await axios.get(`${SERVICE_URL}/employee/list`);
//   const list = [];
//   data.forEach((element) => {
//     if (!element.isDeleted && (element.department !== 'Production' || element.department !== 'แผนกผลิต' ) ) {
//       const obj = {
//         value: element.id,
//         label: element.name,
//       };
//     list.push(obj);
//   }
//   });
//   return list;
// };
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
const callGetSalesOrder = async (id) => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/saleOrder/${id}`);
  const {
    detail,
    customerId: { id: customerId, code: customerCode, name: customerName, list: addresses },
  } = data;
  const newDetail = detail.map((item) => {
    if (item?.product?.id) {
      item.productId = item.product.id;
    }
    return item;
  });
  const resultSalesArea = await callGetMasterDataSalesArea();
  const resultDepartment = await callGetMasterDataDepartment();
  const saleObject = resultSalesArea.find((item) => item.code === data.salesUser.salesArea);
  data.area = saleObject?.name;
  data.department = data.salesUser?.department;
  data.salesUser = data.salesUser?.id;
  data.departmentList = resultDepartment;
  return { ...data, customerId, customerCode, customerName, customerAddress: getAddress(addresses), detail: newDetail };
};

const CustomerOrderDetail = () => {
  const { formatMessage: f } = useIntl();

  const title = f({ id: 'customerOrder.detail.title' });
  const description = '';
  const [dataCO, setDataCO] = useState(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState(!id);
  const [onRefetch, setOnRefetch] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const { data, refetch } = useQuery(
    'customerOrder',
    async () => {
      setIsLoading(true);
      const result = await callGetSalesOrder(id);
      setIsLoading(false);
      return result;
    },
    {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
    }
  );
  const [modalData, setModalData] = useState(data?.detail || []);
  useEffect(async () => {
    const listCO = {};
    const resultSalesArea = await callGetMasterDataSalesArea();
    listCO.saleData = resultSalesArea;
    if (isEdit) {
      const resultEmployee = await callGetEmployee();
      const resultDepartment = await callGetMasterDataDepartment();
      const userLogin = JSON.parse(window.localStorage.getItem('token'));
      listCO.salesUser = userLogin?.user.employee.id;
      const saleUserData = resultEmployee?.find((item) => item.id === listCO?.salesUser);
      const saleObject = resultSalesArea?.find((item) => item.code === saleUserData?.salesArea);
      const departmentData = resultDepartment?.find((item) => item.code === saleUserData?.department);
      listCO.area = saleObject?.name;
      listCO.department = departmentData?.name;
      listCO.departmentList = resultDepartment;
    }
    setDataCO(listCO);
  }, []);
  return (
    <>
      <HtmlHead title={title} description={description} />
      {dataCO !== undefined ? (
        <InformationForm
          data={data}
          getAddress={getAddress}
          getCreditTerm={getCreditTerm}
          uploadModal={uploadModal}
          setUploadModal={setUploadModal}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setOnRefetch={setOnRefetch}
          dataCO={dataCO}
          isEditMode={isEdit}
          refetch={refetch}
          setEditMode={setIsEdit}
          id={id}
          setModalData={setModalData}
        />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      <Detail data={data} setUploadModal={setUploadModal} isLoading={isLoading} isEditMode={isEdit} modalData={modalData} setModalData={setModalData} />
    </>
  );
};

export default CustomerOrderDetail;
