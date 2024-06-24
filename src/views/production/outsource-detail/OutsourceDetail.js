/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient } from 'react-query';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SERVICE_URL } from 'config';
import axios from 'axios';
import { request } from 'utils/axios-utils';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { NavLink, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import OutsourceCard from './components/OutsourceCard';
import AddWarningModal from './components/AddWarningModal';
import VerifiedCard from './components/VerifiedCard';
import OutsourceCardPrint from './components/OutsourceCardPrint';

const initialData = {
  product: '',
  machine: '',
  planDate: '',
  productionOrder: '',
  tooling: '',
  cuttingStatus: false,
  toolingStatus: false,
  status: '',
};
const OutsourceDetail = (props) => {
  const id = props?.match?.params?.id;
  const componentRef = useRef(null);
  const [dataOS, setDataOS] = useState(undefined);
  const [selectData, setSelectData] = useState(undefined);
  const [dataVerified, setDataVerified] = useState(undefined);
  const [outsourceData, setOutsourceData] = useState();
  const [verifiedData, setVerifiedData] = useState();
  const [isDefaultCompany, setIsDefaultCompany] = useState();
  const [isEditMode, setEditMode] = useState(!id);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [onRefetch, setOnRefetch] = useState(false);
  const { goBack } = useHistory();
  const [isDeleteOutsource, setIsDeleteOutsource] = useState(false);
  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [status, setStatus] = useState('NEW');
  const [listWarning, setListWarning] = useState([]);
  const [listTemplate, setListTemplate] = useState([]);
  const [handleSaveClick, setSaveClick] = useState(false);
  const [verifiedPrint, setVerifiedPrint] = useState(false);
  const [errCodeItemModal, setErrorCodeItemModal] = useState('');
  const [templatePrint, setTemplatePrint] = useState();
  const [preview, setPreview] = useState();
  // const [distributorOptions, setDistributor] = useState([]);
  const { formatMessage: f } = useIntl();

  const createOutsourceFn = (outsource) => axios.post(`${SERVICE_URL}/outsource/save`, outsource).then((res) => res.data);
  const handleOnAddWarning = (value) => {
    var data = {
      type: 'OUTSOURCE_WARNING',
      code: value.code,
      abbr: value.abbr,
      name: value.name,
      template: value.templateName,
      linkId: value.linkId,
    };

    var list = [...listWarning, data];
    setListWarning(list);
  };

  const handleCancelClick = () => {
    setEditMode(false);
  };
  const handleOnRemoveToolingTypeItem = (value) => {
    var list = [...listWarning.slice(0, value), ...listWarning.slice(value + 1)];
    setListWarning(list);
  };
  const handleEditClick = () => {
    setEditMode(true);
  };
  const handleSaveButton = () => {
    setSaveClick(true);
  };
  const handleVerifyEdit = () => {
    setVerifiedPrint(true);
    setOnRefetch(false);
  };
  const updateOutsourceFn = ({ id, outsource }) =>
    axios
      .post(`${SERVICE_URL}/outsource/${id}/save`, outsource, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => res.data);

  const ToastCreateSuccess = () => {
    const { formatMessage: f } = useIntl();
    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'outsource.save.success' })}</span>
        </div>
      </>
    );
  };
  const handleOnHideToolingTypeItem = () => {
    setAddModal(false);
    // setAddModalStatusType(false);
  };
  const confirmSendingText = () => {
    const text = (
      <>
        <div>ท่านต้องการส่งออกรายการงาน {outsourceData.productName}</div>
        <CsLineIcons icon="arrow-right" /> Lot. {outsourceData.productionOrderNo === undefined ? '-' : outsourceData.productionOrderNo} ไปยัง{' '}
        {outsourceData.supplierName}
      </>
    );
    return text;
  };
  const confirmDeleteText = () => {
    const text = (
      <>
        <div>ท่านต้องการลบรายการงาน {outsourceData.productName}</div> <CsLineIcons icon="arrow-right" /> Lot.{' '}
        {outsourceData.productionOrderNo === undefined ? '-' : outsourceData.productionOrderNo}
      </>
    );
    return text;
  };
  const confirmRecieveText = () => {
    const text = (
      <>
        <div>ท่านต้องการรับคืนรายการงาน {outsourceData.productName}</div> <CsLineIcons icon="arrow-right" /> Lot.{' '}
        {outsourceData.productionOrderNo === undefined ? '-' : outsourceData.productionOrderNo} จาก {outsourceData.supplierName}
      </>
    );
    return text;
  };
  const searchOutsource = async (id, resultDataCompany, resultDataCustomer) => {
    let res = '';
    res = await request({ url: `/outsource/${id}` });
    res.data.data.company = resultDataCompany.data.find((data) => data.id === res.data.data.companyId);
    res.data.data.customer = resultDataCustomer.data.find((data) => data.id === res.data.data.customerId);
    // res.data.data.supplierName = { label: res.data.data.supplierName, value: res.data.data.supplierId };
    return res.data;
  };
  // const searchProductPlan = async () => {
  //   let res = '';
  //   res = await request({ url: `/productionPlan/productionOrderList` });
  //   // res.data.data.supplierName = { label: res.data.data.supplierName, value: res.data.data.supplierId };
  //   return res.data.data;
  // };
  const callGetMasterDataType = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/outsource/lov/warning/list`);
    return data;
  };
  const callGetMasterTemplate = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/outsource/lov/template/list`);
    return data;
  };
  const searchCustomer = async () => {
    const res = await request({ url: `/customer/find` });
    return res.data;
  };
  const searchOutsourceProduct = async (productId) => {
    const res = await request({ url: `/masterData/product/${productId}` });
    return res.data;
  };
  const searchOutsourceProcess = async () => {
    const productData = await request({ url: `/masterData/product/find` });
    const colorData = await request({ url: `/masterData/lov/product/list?type=PRODUCT_COLOR` });
    const coatingData = await request({ url: `/masterData/lov/product/list?type=PRODUCT_COATING` });
    var list = [];
    list.productData = productData.data.data;
    list.colorData = colorData.data.data;
    list.coatingData = coatingData.data.data;
    return list;
  };
  const searchCompany = async () => {
    const res = await request({ url: `/masterData/company/find` });
    const list = [];
    res.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    return res.data;
  };

  const searchDefaultCompany = async () => {
    const res = await request({ url: `/masterData/company/find?isDefault=true` });
    return res.data.data[0];
  };
  const sortTemplate = (value) => {
    var list = [];
    for (const element of value) {
      if (!element.isDeleted) {
        var obj = {
          value: element.id,
          label: element.name,
        };
        list.push(obj);
      }
    }
    setIsDefaultCompany(list[0]);
    return list;
  };
  // const searchProductProcess = async () => {
  //   const res = await request({ url: `/masterData/lov/product/list?type=PRODUCT_COLOR` });
  //   const coatingData = await request({ url: `/masterData/lov/product/list?type=PRODUCT_COATING` });
  //   for (const element of res.data.data) {
  //     if (!element.isDeleted) {
  //       res.data.data.colorData = {
  //         value: element.code,
  //         label: element.name,
  //       };
  //     }
  //   }
  //   for (const element of coatingData.data.data) {
  //     if (!element.isDeleted) {
  //       res.data.data.coatingData = {
  //         value: element.code,
  //         label: element.name,
  //       };
  //     }
  //   }
  //   return res.data;
  // };

  const handleDeleteClick = () => {
    deleteOutsource(id);
  };
  const deleteOutsource = async (outId) => {
    const resp = await axios({
      url: `/outsource/${outId}/delete`,
      method: 'post',
    });
    setIsDeleteOutsource(false);
    goBack('./');
  };
  const handleOnUpload = () => {
    uploadOutsource(id);
  };
  const uploadOutsource = async (outId) => {
    const resp = await axios({
      url: `/content/upload`,
      method: 'post',
    });
  };
  const handleOnSaveWarning = () => {
    var result = {
      condition: 'warning',
      data: listWarning,
    };
    axios.post(`${SERVICE_URL}/outsource/lov/warning/save`, result).then((res) => {
      if (res.data.message === 'Success') {
        setAddModal(false);
        setOnRefetch(true);
      }
    });
  };

  useEffect(async () => {
    const resultDataType = await callGetMasterDataType();
    // const resultTemplate = await callGetMasterTemplate();
    const resultDataDefaultCustomer = await searchDefaultCompany();
    const userLogin = JSON.parse(window.localStorage.getItem('token'));
    // เซ็ท Template ตอนส่งไปหน้า card
    // resultDataType.forEach((dataI) => {
    //   resultTemplate.forEach((dataJ) => {
    //     if (dataI.linkId === dataJ.id) {
    //       dataI.template = dataJ.name;
    //     }
    //   });
    // });
    const selectData = {};
    const templateData = {};
    // templateData.templateData = sortTemplate(resultTemplate);
    selectData.templateData = templateData.templateData;
    selectData.warningData = resultDataType;
    if (id !== undefined) {
      const resultDataCompany = await searchCompany();
      const resultDataCustomer = await searchCustomer();
      const resultDataOS = await searchOutsource(id, resultDataCompany, resultDataCustomer);
      const resultVerifiedList = resultDataOS;

      if (resultVerifiedList.data.verifiedList[0]?.result === 'NOTSELECT') {
        resultVerifiedList.data.resultName = 'ยังไม่ได้เลือก';
      } else if (resultVerifiedList.data.verifiedList[0]?.result === 'PASS') {
        resultVerifiedList.data.resultName = 'ผ่าน';
      } else if (resultVerifiedList.data.verifiedList[0]?.result === 'NOTPASS') {
        resultVerifiedList.data.resultName = 'ไม่ผ่าน';
      } else {
        resultVerifiedList.data.verifiedList[0].result = 'NOTSELECT';
        resultVerifiedList.data.resultName = 'ยังไม่ได้เลือก';
      }
      resultVerifiedList.data.result = { value: resultVerifiedList.data.verifiedList[0].result, label: resultVerifiedList.data.resultName };
      if (resultVerifiedList.data.verifiedList[0].date === null) {
        resultVerifiedList.data.verifiedList[0].date = '';
      }
      if (resultDataOS.data.status !== 'COMPLETE') {
        resultVerifiedList.data.verifiedList[0].verifiedBy = userLogin.user.employee.id;
      }
      const resultOutsourceProduct = await searchOutsourceProduct(resultDataOS.data.productId);
      if (resultOutsourceProduct.data.coatingMethod.length > 1) {
        resultOutsourceProduct.data.coatingMethod.forEach((e) => {
          const dtemp = `, ${e.text}`;
          resultDataOS.data.productProcessType = `${resultOutsourceProduct.data.coatingMethod[0]?.text}${dtemp}`;
        });
      } else if (resultOutsourceProduct.data.coatingMethod.length === 1) {
        resultDataOS.data.productProcessType = `${resultOutsourceProduct.data.coatingMethod[0]?.text}`;
      } else {
        resultDataOS.data.productProcessType = '';
      }
      resultDataOS.data.cuttingSize = `${resultOutsourceProduct.data.cuttingSize.width} x ${resultOutsourceProduct.data.cuttingSize.length}`;
      resultDataOS.data.cavity = resultOutsourceProduct.data.cavity;
      let coating = '';
      if (resultDataOS.data?.productionPlanStep === 13) {
        coating = resultDataOS.data?.productCoatingMethod[0];
      } else if (resultDataOS.data?.productionPlanStep === 15 || resultDataOS.data?.productionPlanStep === 14) {
        coating = resultDataOS.data?.productCoatingMethod[1];
      } else if (resultDataOS.data?.productionPlanStep === 28) {
        coating = resultDataOS.data?.productCoatingMethod[2];
      } else if (resultDataOS.data?.productionPlanStep === 29) {
        coating = resultDataOS.data?.productCoatingMethod[3];
      } else {
        coating = resultDataOS.data?.productCoatingMethod[0];
      }
      resultDataOS.data.coatingValue = coating;
      setStatus(resultDataOS.data.status);
      setDataOS(resultDataOS.data);
      setDataVerified(resultVerifiedList.data);
    }
    setSelectData(selectData);
    setListTemplate(templateData);
    setListWarning(resultDataType);
    setIsDefaultCompany(resultDataDefaultCustomer);
  }, [onRefetch]);

  let title = '';
  const description = '';
  if (dataOS !== undefined) {
    title = id ? `แก้ไขรายละเอียด : ${dataOS.code}` : f({ id: 'outsource.field.add' });
  }
  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <Row>
          <Col className="mb-2">
            <div className="page-title-container mb-3">
              <Row>
                <Col xs="auto" className="mb-2 align-self-md-center text-end" md="2">
                  <NavLink to="/production/outsource" className="btn-link btn-icon-start w-100 w-md-auto">
                    <CsLineIcons icon="arrow-left" />
                  </NavLink>
                </Col>
                <Col className="mb-2" md="6">
                  <h1 className="mb-2 pb-0 display-4">{title}</h1>
                  <div className="text-muted font-heading text-small">{description}</div>
                </Col>
                <Col className="mb-2" md="2">
                  <Row className="d-flex flex-row justify-content-end">
                    <Col xs="12" sm="auto" className="align-self-md-center">
                      {status === 'NEW' && id && !isEditMode && (
                        <>
                          <Button className="btn-icon" variant="primary" onClick={handleEditClick}>
                            <CsLineIcons icon="edit" /> {f({ id: 'common.edit' })}
                          </Button>
                        </>
                      )}{' '}
                      {id && !isEditMode && (
                        <>
                          <Button className="btn-icon" variant="outline-danger" onClick={() => setIsDeleteOutsource(true)}>
                            <CsLineIcons icon="bin" />
                          </Button>
                        </>
                      )}
                      {(!id || isEditMode) && (
                        <>
                          {!!id && (
                            <Button className="btn-icon" variant="outline-alternate" onClick={handleCancelClick} disabled={isEnableAdd || isEnableEdit}>
                              <CsLineIcons icon="close" /> {f({ id: 'common.cancel' })}
                            </Button>
                          )}{' '}
                          <Button className="btn-icon" variant="primary" type="submit" onClick={handleSaveButton} disabled={isEnableAdd || isEnableEdit}>
                            <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                          </Button>
                        </>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
      <section className="w-100">
        {id ? (
          <>
            {dataOS && selectData && (
              <OutsourceCardPrint
                ref={(el) => {
                  componentRef.current = el;
                }}
                selectData={selectData}
                dataOS={dataOS}
                isEditMode={isEditMode}
                setEditMode={setEditMode}
                setIsDeleteModalOpen={setPrintModalOpen}
                setOutsourceData={setOutsourceData}
                handleSaveClick={handleSaveClick}
                verifiedPrint={verifiedPrint}
                setSaveClick={setSaveClick}
                setVerifiedPrint={setVerifiedPrint}
                distributorOptions
                templatePrint={templatePrint}
                preview={preview}
              />
            )}
            {dataOS && selectData ? (
              <OutsourceCard
                // ref={(el) => {
                //   componentRef.current = el;
                // }}
                selectData={selectData}
                dataOS={dataOS}
                isEditMode={isEditMode}
                setEditMode={setEditMode}
                setIsDeleteModalOpen={setPrintModalOpen}
                setOutsourceData={setOutsourceData}
                handleSaveClick={handleSaveClick}
                verifiedPrint={verifiedPrint}
                setSaveClick={setSaveClick}
                setVerifiedPrint={setVerifiedPrint}
                distributorOptions
                setOnRefetch={setOnRefetch}
                setTemplatePrint={setTemplatePrint}
                setPreview={setPreview}
                searchOutsourceProduct={searchOutsourceProduct}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spinner animation="border" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </>
        ) : (
          <>
            {/* {isDefaultCompany ? ( */}
            <OutsourceCard
              // ref={(el) => {
              //   componentRef.current = el;
              // }}
              selectData={selectData}
              dataOS={dataOS}
              isEditMode={isEditMode}
              setEditMode={setEditMode}
              setIsDeleteModalOpen={setPrintModalOpen}
              handleSaveClick={handleSaveClick}
              verifiedPrint={verifiedPrint}
              isDefaultCompany={isDefaultCompany}
              setSaveClick={setSaveClick}
              setVerifiedPrint={setVerifiedPrint}
              setOutsourceData={setOutsourceData}
              setOnRefetch={setOnRefetch}
              searchOutsourceProduct={searchOutsourceProduct}
            />
            {/* // ) : (
            //   <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            //     <Spinner animation="border" variant="primary">
            //       <span className="visually-hidden">Loading...</span>
            //     </Spinner>
            //   </div>
            // )} */}
          </>
        )}

        <div
          style={{ background: '#fff', width: '210mm', margin: '0px auto', marginTop: '0px', padding: '20px 20px 20px 20px' }}
          className="d-flex gap-2 justify-content-center"
        >
          {status === 'NEW' && outsourceData && outsourceData.id && (
            <Button style={{ width: '70mm', padding: '20px' }} variant="warning" color="secondary" onClick={() => setPrintModalOpen(true)}>
              พิมพ์
            </Button>
          )}
          {outsourceData && (
            <ConfirmModal
              show={isPrintModalOpen}
              confirmText={confirmSendingText()}
              onConfirm={handleVerifyEdit}
              onUpload={handleOnUpload}
              onCancel={() => setPrintModalOpen(false)}
            />
          )}
          {outsourceData && (
            <ConfirmModal
              show={isDeleteOutsource}
              confirmText={confirmDeleteText()}
              onConfirm={handleDeleteClick}
              onUpload={handleOnUpload}
              onCancel={() => setIsDeleteOutsource(false)}
            />
          )}
          {(status === 'COMPLETE' || status === 'CONFIRM') && (
            <ReactToPrint
              trigger={() => (
                <Button style={{ width: '70mm', padding: '20px' }} variant="warning" color="secondary">
                  พิมพ์
                </Button>
              )}
              content={() => componentRef.current}
            />
          )}
          <Button style={{ width: '70mm', padding: '20px' }} variant="primary" color="primary" onClick={() => setAddModal(true)}>
            <span>การจัดการข้อควรระวัง</span>
          </Button>
          {/* {listWarning.length > 0 && ( */}
          <AddWarningModal
            show={addModal}
            onHide={handleOnHideToolingTypeItem}
            list={listWarning}
            onAdd={handleOnAddWarning}
            onRemove={handleOnRemoveToolingTypeItem}
            codeResult=""
            abbrResult=""
            nameResult=""
            templateResult={listTemplate}
            onSave={handleOnSaveWarning}
          />
          {/* )} */}
        </div>
        {outsourceData && dataVerified && (
          <div style={{ background: '#fff', width: '210mm', margin: '0 auto', padding: '20px 20px 20px 20px' }}>
            <VerifiedCard outsourceData={outsourceData} dataVerified={dataVerified} setVerifiedData={setVerifiedData} onRefetch={setOnRefetch} />
          </div>
        )}
      </section>
    </>
  );
};

export default OutsourceDetail;
