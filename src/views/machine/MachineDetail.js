/* eslint-disable no-self-compare */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { SERVICE_URL } from 'config';
import { request } from 'utils/axios-utils';

import InformationForm from './components/machine-detail/InformationForm';

const MachineDetail = (props) => {
  const { formatMessage: f } = useIntl();

  const title = f({ id: 'customerOrder.detail.title' });
  const description = '';

  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const [typeOptions, setMachineType] = useState();
  const [toolingOptions, setTooling] = useState();
  const [productOptions, setProduct] = useState();
  const [controllerOptions, setController] = useState();
  const [distributorOptions, setDistributor] = useState();
  const [manufacturerOptions, setManufacturer] = useState();

  // eslint-disable-next-line react/destructuring-assignment

  useEffect(() => {
    callMachineType();
  }, []);

  const callMachineType = async () => {
    const dataType = await request({ url: `${SERVICE_URL}/masterData/lov/machineType` });
    var list = [];
    for (const element of dataType.data.data) {
      var obj = {
        value: element.code,
        label: element.name,
      };
      list.push(obj);
    }
    callTooling();
    setMachineType(list);
  };

  const callTooling = async () => {
    const dataTooling = await request({ url: `${SERVICE_URL}/masterData/tooling/find` });
    var list = [];
    for (const element of dataTooling.data.data.dataList) {
      if (!element.isDeleted) {
        var obj = {
          value: element.id,
          label: element.name,
        };
        list.push(obj);
      }
    }
    callProduct();
    setTooling(list);
  };

  const callProduct = async () => {
    const dataTooling = await request({ url: `${SERVICE_URL}/masterData/machine/getProductList` });
    // const arr = element.machineId.filter((item) => item === id)
    // var newArr = [];
    var list = [];
    for (const element of dataTooling.data.data) {
      if (!element.isDeleted) {
        var obj = {
          value: element.id,
          label: element.name,
        };
        list.push(obj);
      }
    }
    callEmployee();
    setProduct(list);
  };

  const callEmployee = async () => {
    const dataEmp = await request({ url: `${SERVICE_URL}/employee/find?department=03` });
    var list = [];
    for (const element of dataEmp.data.data) {
      if (!element.isDeleted) {
        var obj = {
          value: element.id,
          label: `${element?.prefix}${' '}${element?.firstName}${' '}${element?.lastName}`,
        };
        list.push(obj);
      }
    }
    callSupplier();
    setController(list);
  };

  const callSupplier = async () => {
    const disType = ['01', '02', '03', '11'];
    const ManufactType = ['02'];
    const dataSupplier = await request({ url: `${SERVICE_URL}/masterData/supplier/find` });
    const filterManufacturer = dataSupplier.data.data.filter((item) => item.type.some((t) => disType.includes(t)));
    const filterDistributor = dataSupplier.data.data.filter((item) => item.type.some((t) => ManufactType.includes(t)));
    // const filterManufacturer = dataSupplier.data.data.filter(data => ManuType.includes(data.type));
    var listDistributor = [];
    var listManufacturer = [];
    for (const element of filterDistributor) {
      if (!element.isDeleted) {
        var obj1 = {
          value: element.id,
          label: element.name,
        };
        listDistributor.push(obj1);
      }
    }
    for (const element of filterManufacturer) {
      if (!element.isDeleted) {
        var obj2 = {
          value: element.id,
          label: element.name,
        };
        listManufacturer.push(obj2);
      }
    }
    setDistributor(listDistributor);
    setManufacturer(listManufacturer);
  };

  // console.log('controllerOptions : ' , controllerOptions)

  return (
    <>
      {typeOptions && toolingOptions && controllerOptions && manufacturerOptions && distributorOptions ? (
        <InformationForm
          // data={id === undefined ? initialData : data}
          id={id}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          typeOptions={typeOptions}
          toolingOptions={toolingOptions}
          productOptions={productOptions}
          controllerOptions={controllerOptions}
          distributorOptions={distributorOptions}
          manufacturerOptions={manufacturerOptions}
          type={id === undefined ? 'create' : 'edit'}
        />
      ) : (
        // <InformationForm id={id} departmentOptions={departmentOptions} positionOptions={positionOptions} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </>
  );
};

export default MachineDetail;
