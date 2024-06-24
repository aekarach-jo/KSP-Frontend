/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import InformationForm from './components/InformationForm';

const EmployeeDetail = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;
  // const [machineOptions, setMachine] = useState();
  const [departmentOptions, setDepartment] = useState();
  const [positionOptions, setPosition] = useState();
  const [salesAreaOptions, setSalesArea] = useState();

  // const callGetMasterDataMachine = async () => {
  //   const {
  //     data: { data },
  //   } = await axios.get(`${SERVICE_URL}/masterData/machine/find`);
  //   return data;
  // };

  const callGetMasterDataDepartment = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/masterData/lov/employeeDepartment`);
    return data;
  };

  const callGetMasterDataPosition = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/masterData/lov/employeePosition`);
    return data;
  };

  const callGetMasterDataSalesArea = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/masterData/lov/employeeSalesArea`);
    return data;
  };

  useEffect(async () => {
    // eslint-disable-next-line no-use-before-define
    // const resultMachine = await callGetMasterDataMachine();
    const resultDepartment = await callGetMasterDataDepartment();
    const resultPosition = await callGetMasterDataPosition();
    const resultSalesArea = await callGetMasterDataSalesArea();
    // eslint-disable-next-line no-var
    // var listMachine = [];
    // for (const elementMachine of resultMachine) {
    //   // eslint-disable-next-line no-var
    //   if (!elementMachine.isDeleted) {
    //     var objMachine = {
    //       value: elementMachine.name,
    //       label: elementMachine.name,
    //     };
    //     listMachine.push(objMachine);
    //   }
    // }
    // setMachine(listMachine);

    var listDepartment = [];
    for (const elementDepartment of resultDepartment) {
      // eslint-disable-next-line no-var
      if (!elementDepartment.isDeleted) {
        var objDepartment = {
          detail: elementDepartment,
          value: elementDepartment.name,
          label: elementDepartment.name,
        };
        listDepartment.push(objDepartment);
      }
    }
    setDepartment(listDepartment);

    var listPosition = [];
    for (const elementPosition of resultPosition) {
      // eslint-disable-next-line no-var
      if (!elementPosition.isDeleted) {
        var obj = {
          detail: elementPosition,
          value: elementPosition.name,
          label: elementPosition.name,
        };
        listPosition.push(obj);
      }
    }
    setPosition(listPosition);

    var listSalesArea = [];
    for (const elementSalesArea of resultSalesArea) {
      // eslint-disable-next-line no-var
      if (!elementSalesArea.isDeleted) {
        var objSalesArea = {
          detail: elementSalesArea,
          value: elementSalesArea.code,
          label: elementSalesArea.name,
        };
        listSalesArea.push(objSalesArea);
      }
    }
    setSalesArea(listSalesArea);
  }, []);

  return (
    <>
      {departmentOptions && positionOptions && salesAreaOptions  ? (
        <InformationForm id={id} departmentOptions={departmentOptions} positionOptions={positionOptions} salesAreaOptions={salesAreaOptions}/>
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

export default EmployeeDetail;