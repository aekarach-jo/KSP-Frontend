/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import axios from 'axios';
import { request } from 'utils/axios-utils';
import { SERVICE_URL } from 'config';
import InformationForm from './components/InformationForm';

const callGetMasterDataType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list`);
  return data;
};
const callGetMasterDataStatusType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE`);
  return data;
};

const callGetMasterType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_TYPE`);
  return data;
};

const callGetMasterDataCustomer = async () => {
  const {
    data: { data },
  } = await request({ url: `${SERVICE_URL}/customer/list` });
  return data;
};

const callGetMasterDataSupplier = async () => {
  const {
    data: { data },
  } = await request({ url: `${SERVICE_URL}/masterData/supplier/find` });
  return data;
};

const ToolingDetail = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;
  const [typeOptions, setType] = useState();
  const [typeToolingOptions, setTypeTooling] = useState();
  const [typeToolingList, setTypeList] = useState();
  const [customerOptions, setCustomer] = useState();
  const [statusType, setStatusType] = useState();
  const [supplier, setSupplier] = useState();
  const [statusOptions, setStatus] = useState();

  useEffect(async () => {
    // eslint-disable-next-line no-use-before-define
    const resultDataType = await callGetMasterDataType();
    const resultType = await callGetMasterType();
    const resultSupplier = await callGetMasterDataSupplier();
    const resultDataStatusType = await callGetMasterDataStatusType();

    var sup = [];
    for (const elementType of resultSupplier) {
      // eslint-disable-next-line no-var
      if (!elementType.isDeleted) {
        const objType = {
          detail: elementType,
          value: elementType.id,
          label: elementType.name,
        };
        sup.push(objType);
      }
    }
    setSupplier(sup);

    var type = [];
    for (const elementType of resultType) {
      // eslint-disable-next-line no-var
      if (!elementType.isDeleted) {
        const objType = {
          detail: elementType,
          value: elementType.code,
          label: elementType.name,
        };
        type.push(objType);
      }
    }
    setTypeList(resultType);
    setTypeTooling(type);

    var listType = [];
    for (const elementType of resultDataType) {
      // eslint-disable-next-line no-var
      if (!elementType.isDeleted) {
        var objType = {
          detail: elementType,
          value: elementType.code,
          label: elementType.name,
        };
        listType.push(objType);
      }
    }
    setType(listType);

    var listStatus = [];
    for (const elementType of resultDataStatusType) {
      // eslint-disable-next-line no-var
      if (!elementType.isDeleted) {
        var objStatus = {
          detail: elementType,
          value: elementType.code,
          label: elementType.name,
        };
        listStatus.push(objStatus);
      }
    }
    var listStatusType = [];
    for (const elementType of resultDataStatusType) {
      // eslint-disable-next-line no-var
      if (!elementType.isDeleted) {
        var objStatusType = {
          isConstant: elementType.code === '888' || elementType.code === '999',
        };
        listStatusType.push({ ...elementType, ...objStatusType });
      }
    }

    listStatusType.sort((a, b) => {
      if (a.code === '888' || a.code === '999') {
        return -1; // ย้าย '888' และ '999' ไปด้านหน้า
      }
      if (b.code === '888' || b.code === '999') {
        return 1; // ย้าย '888' และ '999' ไปด้านหน้า
      }
      return a.id - b.id; // เรียงตามลำดับดั้งเดิม
    });

    setStatus(listStatus);
    setStatusType(listStatusType);

    const resultDataCustomer = await callGetMasterDataCustomer();

    var listCustomer = [];
    for (const elementCustomer of resultDataCustomer) {
      // eslint-disable-next-line no-var
      if (!elementCustomer.isDeleted) {
        var objCustomer = {
          value: elementCustomer.id,
          label: elementCustomer.name,
        };
        listCustomer.push(objCustomer);
      }
    }
    setCustomer(listCustomer);
  }, []);

  return (
    <>
      {typeOptions && customerOptions && typeOptions && supplier ? (
        <InformationForm
          id={id}
          typeOptions={typeOptions}
          statusType={statusType}
          customerOptions={customerOptions}
          statusOptions={statusOptions}
          typeToolingOptions={typeToolingOptions}
          supplierOptions={supplier}
          typeToolingList={typeToolingList}
          // onRefresh={handleOnRefresh}
        />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </>
  );
};

export default ToolingDetail;
