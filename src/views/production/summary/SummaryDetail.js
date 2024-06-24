import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { SERVICE_URL } from 'config';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Accordion, Button, Card, Col, Row, Tabs, Tab } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import DropdownPageSize from 'components/dropdown-page-size';
import DatePicker from 'react-datepicker';
import { extractErrorResponse, request } from 'utils/axios-utils';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { mockResp } from './mock';
// import DailyFilterForm from './components/DailyFilterForm';
// import DailyPlanModal from './components/DailyPlanModal';

const SummaryDetail = (props) => {
  const id = props?.match?.params?.id;
  const paramId = id.split(',');
  // const cusId = id.split(',').pop();
  const [key, setKey] = useState('home');
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
  // const { push } = useHistory();
  const title = f({ id: 'summary.list.titleDetail' });
  const description = f({ id: 'summary.list.descriptionDetail' });
  
  // const [filter, setFilter] = useState({});
  // const [isEditMode, setEditMode] = useState();
  // const [pageCount, setPageCount] = useState(1);
  const [commonData, setList] = useState(mockResp);
  // const [showModal, setShowModal] = useState(false);
  // const [listDailyItem, setListDailyItem] = useState(null);

  // const [startDate, setStartDate] = useState(null);paramId
  // const [endDate, setEndDate] = useState(null);
  const productionGetReq = async (productPlanId) =>{ 
    const resp = await request({ url:`${SERVICE_URL}/productionPlan/${productPlanId}`})
      return resp.data;
  };
  const getCustomerFn =  async (customerId)  =>{
  const resp = await request({ url: `${SERVICE_URL}/customer/${customerId}`})
   .then((res) => res.data.data)
   .then((data) => {
     data.contactName = data.list[0].contacts[0].name
     data.phone = data.list[0].contacts[0].phone
     return {
       ...data,
     };
   });
   return resp
  }
  const getCompanyFn =  async ()  =>{
    const resp = await request({ url: `${SERVICE_URL}/masterData/company/find?isDefault=${true}`})
     .then((res) => res.data.data)
     .then((data) => {
       return {
         ...data,
       };
     });
     return resp
    }
  const getSaleOrderFn =  async (productId)  =>{
  const resp = await request({ url: `${SERVICE_URL}/saleOrder/toProducedList`})
   .then((res) => res.data.data)
   .then((data) => {
    // data.forEach((itemA) => {console.log(itemA)});
    // const list = data.groupItem.find((item) => item.groupItem.productId === productId);
    // data.quantity = data.groupItem.detail.find((item) => item.productId === productId )
    // const groupItemV = data.groupItem
    // const detailV = groupItemV.detail[0];
    // console.log(detailV)
     return {
       ...data,
     };
   });
   return resp
  }
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [saleOrderData, setSaleOrderData] = useState([]);
  useQuery(
    ['productPlan', ], () => productionGetReq(paramId[0]), {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result } = resp;
        console.log(result);
        setProductData(result);
        },
      onError(err) {
        console.error('Error:', err);
        },
      },
  );
  useQuery(
  ['customer', ],( ) => getCustomerFn(paramId[1]), {
    refetchOnWindowFocus: false,
    onSuccess(cusResp) {
      setCustomerData(cusResp);
      },
    onError(err) {
      console.error('Error:', err);
      },
    },
  );
  useQuery(
    ['company', ],( ) => getCompanyFn(), {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { 0: result } = resp;
        setCompanyData(result);
        },
      onError(err) {
        console.error('Error:', err);
        },
      },
    );
    useQuery(
      ['saleOrder', ],( ) => getSaleOrderFn(paramId[2]), {
        refetchOnWindowFocus: false,
        onSuccess(resp) {
          setSaleOrderData(resp)
          },
        onError(err) {
          console.error('Error:', err);
          },
        },
      );
      
  console.log(productData);
  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        <div className="page-title-container mb-3">
          <Row>
            <Col className="mb-2">
              <Col className="mb-2">
                <h1 className="mb-2 pb-0 display-4">{title}</h1>
                <div className="font-weight-bold font-heading text-small">{description}</div>
              </Col>
            </Col>
          </Row>
        </div>
        <Row className="mb-3">
        <Card body className="border rounded-1 mb-5">
          <Row>
            <Col lg="7" md="7" xs="12">
            <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'stockManagement.companyName' })}</div>
              <div className="text-muted">{companyData.nameEn}</div>
            </Col>
            <Col>
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.taskNo' })}</div>
              <div className="text-muted">{productData.customerCode}</div>
            </Col>
          </Row>
          <Row>
            <Col lg="2" md="2" xs="6">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'dailyPlan.field.date' })}</div>
              <div className="text-muted">{fD(productData.planDate)}</div>
            </Col>
            <Col lg="2" md="2" xs="6">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.customerCode' })}</div>
              <div className="text-muted">{productData.customerCode}</div>
            </Col>
            <Col lg="3" md="3" xs="6">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'salesOrder.field.customerName' })}</div>
              <div className="font-weight-bold">{productData.customerName}</div>
            </Col>
            <Col lg="3" md="3" xs="6">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'customer.field.contactName' })}</div>
              <div className="text-muted">{customerData.contactName}</div>
            </Col>
            <Col>
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'customer.field.phone' })}</div>
              <div className="text-muted">{customerData.phone}</div>
            </Col>
          </Row>
          <Row>
            <Col lg="2" md="2" xs="6">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.completeDate' })}</div>
              <div className="text-muted">{fD(productData.createdAt)}</div>
            </Col>
            <Col lg="5" md="5" xs="12">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderTime' })}</div>
              <div className="text-muted">{fT(productData.createdAt)}</div>
            </Col>
            <Col>
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'production.group.field.quantity' })}</div>
              <div className="text-muted">3000</div>
            </Col>
          </Row>
          <Row>
            <Col lg="2" md="2" xs="6">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.prodDetail' })}</div>
              <div className="text-muted">{customerData.remark === '' ? "-" :"-"}</div>
            </Col>
          </Row>
          <Row>
            <Col lg="7" md="7" xs="12">
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.lot' })}</div>
              <div className="text-muted">{productData.no}</div>
            </Col>
            <Col>
              <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.dueDate' })}</div>
              <div className="text-muted">{fD(productData.planDate)}</div>
            </Col>
          </Row>
        </Card>
        </Row>
        {/* Tab section */}
        <Row className="mb-3">
          <Card body className="mb-5">
            <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            {commonData.data.map((itemC, indexC) => (
             <Tab        
                key={indexC}
                tabClassName= {itemC.departmentType === 'แผนกตัด' ? '' :'d-none'}
                eventKey={itemC.departmentType}
                title={itemC.departmentType}
              >
                {itemC.department_detail.map((itemD, indexD) => (
                <div key={indexD} className= {itemC.departmentType === 'แผนกตัด' ? '' :'d-none'}>
                <Row >
                  <Col lg="4" md="4" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted">{itemD.workerName}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted">{itemD.orderer}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted">{fD(itemD.startDate)}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.issues' })}</div>
                    <div className="text-muted">{itemD.issues}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.rootCaution' })}</div>
                    <div className="text-muted">{itemD.rootCaution}</div>
                  </Col>
                </Row>
                </div>
                ))} 
              </Tab>
              ))}
              {commonData.data.map((itemC, indexC) => (
              <Tab
                key={indexC}
                tabClassName= {itemC.departmentType === 'แผนกพิมพ์' ? '' :'d-none'}
                eventKey={itemC.departmentType}
                title={itemC.departmentType}
              >
                {itemC.department_detail.map((itemD, indexD) => (
                <div key={indexD} className= {itemC.departmentType === 'แผนกพิมพ์' ? '' :'d-none'}>
                <Row  >
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted">{itemD.workerName}</div>
                  </Col>
                  <Col lg="6" md="6" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted">{itemD.orderer}</div>
                  </Col>
                  <Col >
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted">{fD(itemD.startDate)}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.machine' })}</div>
                    <div className="text-muted">{itemD.machine}</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.material' })}</div>
                    <div className="text-muted">{itemD.material}</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.gram' })}</div>
                    <div className="text-muted">{itemD.gram}</div>
                  </Col>
                  <Col >
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.thickness' })}</div>
                    <div className="text-muted">{itemD.thickness}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobChar' })}</div>
                    <div className="text-muted">{itemD.jobChar}</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.plateNo' })}</div>
                    <div className="text-muted">{itemD.plateNo}</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.printChar' })}</div>
                    <div className="text-muted">{itemD.printChar}</div>
                  </Col>
                  <Col >
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.reprint' })}</div>
                    <div className="text-muted">{itemD.reprint}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6" md="6" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobDetails' })}</div>
                    <div className="text-muted">{itemD.jobDetails}</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.printOrder' })}</div>
                    <div className="text-muted">{itemD.printOrder}</div>
                  </Col>
                  <Col lg="3" md="3" xs="6">
                    <div className="font-weight-bold text-truncate text-medium text-uppercase">{f({ id: 'summary.field.coatChar' })}</div>
                    <div className="text-muted">{itemD.coatChar}</div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.caution' })}</div>
                    <div className="text-muted">{itemD.caution}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.issues' })}</div>
                    <div className="text-muted">{itemD.issues}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.rootCaution' })}</div>
                    <div className="text-muted">{itemD.rootCaution}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="9" md="9" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.totalDef' })}</div>
                    <div className="text-muted">{itemD.totalDef}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.completeDate' })}</div>
                    <div className="text-muted">{itemD.completeDate}</div>
                  </Col>
                </Row>
                </div>
                ))} 
              </Tab>
             ))}
             {commonData.data.map((itemC, indexC) => (
             <Tab        
                key={indexC}
                tabClassName= {itemC.departmentType === 'แผนกเคลือบ' ? '' :'d-none'}
                eventKey={itemC.departmentType}
                title={itemC.departmentType}
              >
                {itemC.department_detail.map((itemD, indexD) => (
                <div key={indexD} className= {itemC.departmentType === 'แผนกเคลือบ' ? '' :'d-none'}>
                <Row >
                  <Col lg="4" md="4" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coat' })}</div>
                    <div className="text-muted">{itemD.coatAt}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatAt' })}</div>
                    <div className="text-muted">{itemD.coatAt}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted">{fD(itemD.acceptDate)}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" md="4" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatAmount' })}</div>
                    <div className="text-muted">{itemD.coatAmount}</div>
                  </Col>
                  <Col >
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatFail' })}</div>
                    <div className="text-muted">{itemD.coatFail}</div>
                  </Col>
                </Row>
                <Row>
                <Col lg="8" md="8" xs="6">{}</Col>
                  <Col >
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatTotal' })}</div>
                    <div className="text-muted">{itemD.coatCount}</div>
                  </Col>
                </Row>
                </div>
                ))} 
              </Tab>
              ))}
             {commonData.data.map((itemC, indexC) => (
             <Tab       
                key={indexC}
                tabClassName= {itemC.departmentType === 'แผนกปั้ม' ? '' :'d-none'}
                eventKey={itemC.departmentType}
                title={itemC.departmentType}
              >
                {itemC.department_detail.map((itemD, indexD) => (
                <div key={indexD} className= {itemC.departmentType === 'แผนกปั้ม' ? '' :'d-none'}>
                <Row >
                  <Col lg="4" md="4" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted">{itemD.workerName}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted">{itemD.orderer}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted">{fD(itemD.startDate)}</div>
                  </Col>
                </Row>
                <Row >
                  <Col lg="4" md="4" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpMachine' })}</div>
                    <div className="text-muted">{itemD.pumpMachine}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobChar' })}</div>
                    <div className="text-muted">{itemD.pumpMachine}</div>
                  </Col>
                </Row>
                <Row >
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpDetails' })}</div>
                    <div className="text-muted">{itemD.pumpDetails}</div>
                  </Col> 
                </Row>
                <Row >
                <Col lg="2" md="2" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.caution' })}</div>
                    <div className="text-muted">{itemD.pumpMachine}</div>
                </Col>
                </Row>
                <Row >
                <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpAmount' })}</div>
                    <div className="text-muted">{itemD.pumpAmount}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpFail' })}</div>
                    <div className="text-muted">{itemD.pumpFail}</div>
                  </Col>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpTotal' })}</div>
                    <div className="text-muted">{itemD.pumpTotal}</div>
                  </Col>
                  </Row>
                </div>
                ))} 
              </Tab>
              ))} 
              {commonData.data.map((itemC, indexC) => (
             <Tab        
                key={indexC}
                tabClassName= {itemC.departmentType === 'แผนกปะ' ? '' :'d-none'}
                eventKey={itemC.departmentType}
                title={itemC.departmentType}
              >
                {itemC.department_detail.map((itemD, indexD) => (
                <div key={indexD} className= {itemC.departmentType === 'แผนกปะ' ? '' :'d-none'}>
                <Row >
                  <Col lg="4" md="4" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted">{itemD.workerName}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted">{itemD.orderer}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted">{fD(itemD.startDate)}</div>
                  </Col>
                </Row>
                <Row >
                  <Col lg="4" md="4" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchMachine' })}</div>
                    <div className="text-muted">{itemD.patchMachine}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobChar' })}</div>
                    <div className="text-muted">{itemD.patchMachine}</div>
                  </Col>
                </Row>
                <Row >
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchDetails' })}</div>
                    <div className="text-muted">{itemD.patchDetails}</div>
                  </Col> 
                </Row>
                <Row >
                <Col lg="2" md="2" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.caution' })}</div>
                    <div className="text-muted">{itemD.patchMachine}</div>
                </Col>
                </Row>
                <Row >
                <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchAmount' })}</div>
                    <div className="text-muted">{itemD.patchAmount}</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchFail' })}</div>
                    <div className="text-muted">{itemD.patchFail}</div>
                  </Col>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchTotal' })}</div>
                    <div className="text-muted">{itemD.patchTotal}</div>
                  </Col>
                  </Row>
                </div>
                ))} 
              </Tab>
              ))}
              
            </Tabs> 
          </Card>
        </Row>
      </Col>
    </>
  );
};

export default SummaryDetail;
