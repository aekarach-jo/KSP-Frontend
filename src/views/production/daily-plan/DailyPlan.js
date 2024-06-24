/* eslint-disable no-return-assign */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { request } from 'utils/axios-utils';
import { useMutation, useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { SERVICE_URL } from 'config';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

import axios from 'axios';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import Table from 'views/sales/components/table/TableCardProductionPlan';
import PageTitle from './components/PageTitle';

import { API, INTL, QUERY } from './constants';
import InformationForm from './informationForm';
import { getOperationQuery, getOperationQueryGroup, getProductPlanDraftQuery, getProductPlanQuery, getProductionQuery } from './components/TableQuery';
import {
  useOperationTableInstance,
  useOperationTableInstanceGroup,
  useProductPlanDraftTableInstance,
  useProductPlanTableInstance,
  useProductionTableInstance,
} from './components/TableInstance';
import { useUpdateStatusReceiving } from '../../receiving/components/FormMutation';
import FinalOperationModal from '../operator/components/FinalOperationModal';
import FilterPlan from './components/Filter';
import FilterForm from './components/manage-operation/components/FilterForm';

const DailyPlan = () => {
  const { formatMessage: f } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [showModal, setShowModal] = useState(false);
  const [showModalReceive, setShowModalReceive] = useState(false);
  const [isEditPlan, setIsEditPlan] = useState(false);
  const [isAddPlan, setIsAddPlan] = useState(false);
  const [productId, setProductId] = useState();
  const [productionData, setProductionData] = useState();
  const [productionPlanData, setProductionPlanData] = useState();
  const [productList, setProductList] = useState([]);
  const [productListOptions, setProductListOptions] = useState();
  const [productNameOptions, setProductNameOptions] = useState();
  const [productToCheckCreated, setProductToCheckCreated] = useState();
  const [machineOptions, setMachineOptions] = useState([]);
  const [patchingOptions, setPatchingOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [toolingOptions, setToolingOptions] = useState([]);
  const [productionStepOptions, setProductionStepOptions] = useState([]);
  const [onDeliverRefetch, setOnDeliverRefetch] = useState(false);
  const [defaultCompany, setDefaultCompany] = useState([]);
  const [tableTab, setTableTab] = useState('first');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTabPlan') || 'first');
  const [filterData, setFilterData] = useState({
    productionOrderNo: '',
    productionOrderType: '',
    productionCuttingStatus: '',
    producedProductSize: '',
    productSubTypeName: '',
    productName: '',
  });

  const { mutate: updateStatusReceivingItem } = useUpdateStatusReceiving();

  const handleUpdateDailyPlan = (itemId) => {
    // Call the updateDailyPlanFn function when the button is clicked
    // setDeliveredStatus(localStorage.setItem('receivedStatus', true));
    updateStatusReceivingItem();
  };

  const tableInstance1 = useProductPlanTableInstance({
    setShowModal,
    setProductId,
    setProductList,
    setProductionData,
    setShowModalReceive,
    updateStatusReceivingItem,
    setOnDeliverRefetch,
  });
  const tableInstance2 = useProductPlanDraftTableInstance({ setShowModal, setProductId, setProductList, setProductionData });
  const tableInstance3 = useProductionTableInstance({ setShowModal, setProductId, setProductList, setProductionData });
  const tableInstance4 = useOperationTableInstance();
  const tableInstance5 = useOperationTableInstanceGroup();

  const productPlanQuery = getProductPlanQuery({ tableInstance: tableInstance1, dataPlan: productionPlanData, tableTab });
  const productPlanDraftQuery = getProductPlanDraftQuery({ tableInstance: tableInstance2, dataPlan: productionPlanData, tableTab });
  const productionQuery = getProductionQuery({ tableInstance: tableInstance3, dataPlan: productionPlanData, tableTab });
  const operationQuery = getOperationQuery({ tableInstance: tableInstance4, dataPlan: productionPlanData, tableTab });
  const operationQueryGroup = getOperationQueryGroup({ tableInstance: tableInstance5, dataPlan: productionPlanData, tableTab });

  const afterAddItem = () => {
    setShowModal(false);
    productPlanQuery.refetch();
    productPlanDraftQuery.refetch();
    productionQuery.refetch();
  };

  const onChangeDate = () => {
    operationQuery.refetch();
  };

  useEffect(() => {
    if (isEditPlan) {
      console.log('isEditPlan');
      setShowModal(true);
      setIsEditPlan(false);
    }
  }, [isEditPlan, isAddPlan, productionQuery.isFetching, productPlanDraftQuery.isFetching, productPlanQuery.isFetching]);

  const callTooling = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/tooling/find` });
    const callGetMasterDataStatusType = async () => {
      const {
        data: { data },
      } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE`);
      return data;
    };
    const resultDataStatusType = await callGetMasterDataStatusType();
    const list = [];
    dataProduct.data.data.dataList.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: { ...element, statusType: resultDataStatusType?.find((data) => data.code === element.statusType) },
      };
      list.push(obj);
    });

    setToolingOptions(list);
  };
  const callMachine = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/machine/find` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.id,
        label: `${element.name} ( ${element.type} )`,
        detail: element,
      };
      list.push(obj);
    });
    setMachineOptions(list);
  };
  const callProductSubItem = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_PATCHING` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    const dataProductType = await request({ url: `${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_TYPE` });
    const list1 = [];
    dataProductType.data.data.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: element,
      };
      list1.push(obj);
    });
    setPatchingOptions(list);
    setProductTypeOptions(list1);
  };
  const callProductionName = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/productionPlan/productionOrderList` });
    const dataProductCN = await request({ url: `${SERVICE_URL}/masterData/product/find` });
    const list = [];
    const listCN = [];
    const filterProductionOrderItemList = [];
    dataProduct.data.data?.map((res) => {
      res.productSubType.forEach((itemRes) => {
        filterProductionOrderItemList.push({
          producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
          itemList: itemRes.itemList,
        });
      });

      return {
        producedSize: res?.producedSize,
        productSubType: res.productSubType,
        itemList: res?.itemList?.filter((s) => s?.productionOrderId === undefined),
      };
    });

    filterProductionOrderItemList.forEach((item) => {
      item.itemList = item.itemList.filter((itemList) => itemList.status === 'NOTSTART');
    });

    const newArr = filterProductionOrderItemList.flatMap((obj) => obj.itemList);

    newArr.forEach((element) => {
      const obj = {
        value: element.productId,
        label: element.productName,
        detail: element,
      };
      list.push(obj);
    });

    dataProductCN.data.data.forEach((element) => {
      const obj = {
        value: element.id,
        label: element.name,
        detail: element,
      };
      listCN.push(obj);
    });

    function areNumAndTypeEqual(obj) {
      const { productProductionRemainingStep, productProductionStep } = obj.detail;
      // ใช้ every() เพื่อตรวจสอบว่าทุกค่าใน num เหมือนกันกับทุกค่าใน type
      return (
        productProductionRemainingStep?.length === productProductionStep?.length &&
        productProductionRemainingStep?.every((value, index) => value === productProductionStep[index])
      );
    }
    function areNumAndTypeEqualCreated(obj) {
      const { productProductionRemainingStep, productProductionStep } = obj.detail;
      // ใช้ every() เพื่อตรวจสอบว่าทุกค่าใน num เหมือนกันกับทุกค่าใน type
      return (
        productProductionRemainingStep?.length !== productProductionStep?.length &&
        productProductionRemainingStep?.every((value, index) => value !== productProductionStep[index])
      );
    }
    const filteredArr = list.filter(areNumAndTypeEqual);
    const filteredArrCreated = list.filter(areNumAndTypeEqualCreated);

    setProductListOptions(listCN);
    setProductNameOptions(filteredArr);
    setProductToCheckCreated(filteredArrCreated);
  };

  const callProductionStep = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/productionPlan/lov/productionStep/list` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setProductionStepOptions(list);
  };

  const callDefaultCompany = async () => {
    const res = await request({ url: `/masterData/company/find?isDefault=true` });
    setDefaultCompany(res.data.data[0]);
  };

  useEffect(() => {
    console.log(tableTab);
  }, [tableTab]);

  useEffect(() => {
    callProductionName();
    callDefaultCompany();
    callTooling();
    callMachine();
    callProductSubItem();
    // }
  }, []);

  useEffect(() => {
    if (onDeliverRefetch) {
      productPlanQuery.refetch();
    }
  }, [onDeliverRefetch, productPlanQuery]);

  const handleOnHideToolingTypeItem = () => {
    setShowModal(false);
  };
  const handleOnHideReceiveModal = () => {
    setShowModalReceive(false);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.keyCode === 27) {
        // 27 is the keyCode for ESC key
        event.preventDefault(); // ป้องกันการทำงานปรกติของปุ่ม ESC
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const callSaveReIndex = ({ indexList }) => {
    console.log(indexList);
    return request({ url: `/productionPlan/reIndex`, method: 'post', data: { planList: indexList } });
  };

  const { mutate: saveReIndex, isLoading: isSaving } = useMutation(callSaveReIndex, {
    onSuccess(res) {
      console.debug('create success :', res);
      operationQuery.refetch();
      operationQueryGroup.refetch();
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('update error :', err);
    },
  });

  useEffect(() => {
    const toSortDataList = tableInstance4.dataIndexList?.map((item, newIndex) => ({
      id: item.id,
      index: newIndex + 1,
    }));
    if (toSortDataList.length > 0) {
      saveReIndex({ indexList: toSortDataList });
    }
  }, [tableInstance4.dataIndexList]);
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} setShowModal={setShowModal} setProductId={setProductId} />
      <Table
        setShowModal={setShowModal}
        setProductId={setProductId}
        productList={productListOptions}
        patchingOptions={patchingOptions}
        productTypeOptions={productTypeOptions}
        setProductList={setProductList}
        setProductionData={setProductionData}
        filterData={filterData}
        setFilterData={setFilterData}
        setTableTab={setTableTab}
        toolingOptions={toolingOptions}
        machineOptions={machineOptions}
        onChangeDate={onChangeDate}
        operationQuery={operationQuery}
        tableInstanceGroup={tableInstance5}
        operationQueryGroup={operationQueryGroup}
        tableTab={tableTab}
        tabs={[
          {
            eventKey: 'first',
            label: f({ id: 'dailyPlan.tab.first' }),
            tableInstance: tableInstance3,
            isLoading: productionQuery.isFetching,
            filter: FilterPlan,
          },
          {
            eventKey: 'second',
            label: f({ id: 'dailyPlan.tab.second' }),
            tableInstance: tableInstance2,
            isLoading: productPlanDraftQuery.isFetching,
            filter: FilterPlan,
          },
          {
            eventKey: 'third',
            label: f({ id: 'dailyPlan.tab.third' }),
            tableInstance: tableInstance1,
            isLoading: productPlanQuery.isFetching,
            filter: FilterPlan,
          },
          {
            eventKey: 'fourt',
            label: f({ id: 'dailyPlan.tab.fourt' }),
            tableInstance: tableInstance4,
            tableInstance2: tableInstance5,
            isLoading: operationQuery.isFetching,
            isLoadingGroup: operationQueryGroup.isFetching,
            // filter: FilterForm,
          },
        ]}
      />
      {productPlanQuery && productPlanDraftQuery && productionQuery && productNameOptions && (
        <InformationForm
          show={showModal}
          onHide={handleOnHideToolingTypeItem}
          afterAddItem={afterAddItem}
          id={productId}
          setProductId={setProductId}
          product={productList}
          productPlanQuery={productPlanQuery}
          productPlanDraftQuery={productPlanDraftQuery}
          productNameOptions={productNameOptions}
          productListOptions={productListOptions}
          productToCheckCreated={productToCheckCreated}
          machineOptions={machineOptions}
          setIsEditPlan={setIsEditPlan}
          toolingOptions={toolingOptions}
          productionStepOptions={productionStepOptions}
          callProductionStep={callProductionStep}
          productionData={productionData}
          setProductionData={setProductionData}
          defaultCompany={defaultCompany}
          setIsAddPlan={setIsAddPlan}
        />
      )}

      {productPlanQuery && (
        <FinalOperationModal productPlanQuery={productPlanQuery} show={showModalReceive} onHide={handleOnHideReceiveModal} data={productList} />
      )}
    </>
  );
};

export default DailyPlan;
