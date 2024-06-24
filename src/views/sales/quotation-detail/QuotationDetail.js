/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { SERVICE_URL } from 'config';
import axios from 'axios';
import { request } from 'utils/axios-utils';
import { useMutation } from 'react-query';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { NavLink, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CommercialInvoice from './components/CommercialInvoice';
import HistoryList from './components/historyList';
import AddAdditionalItemModal from './components/AddAdditionalItemModal';

const searchQuotation = async (id, key, resultDataCompany, resultDataCustomer, resultDataPd) => {
  let res = '';
  if (key === 'id') {
    res = await request({ url: `/quotation/${id}` });
    console.log(res.data.data);
  } else {
    res = await request({ url: `/quotation//history/${id}` });
    console.log(res.data.data);
  }

  res.data.data.company = resultDataCompany.data.find((data) => data.id === res.data.data.companyId);
  res.data.data.customer = resultDataCustomer.data.find((data) => data.id === res.data.data.customerId);
  res.data.data.customer.name = { label: res.data.data.customer.name, value: res.data.data.customer.name };
  res.data.data.detail[0].productId = res.data.data.productId;
  res.data.data.detail[0].productName = res.data.data.productName;
  res.data.data.detail[0].material = { label: res.data.data.materialName, value: res.data.data.materialName };
  res.data.data.detail[0].materialId = res.data.data.materialId;
  res.data.data.detail[0].printMethod = res.data.data.printMethod;
  res.data.data.detail[0].coatingMethod = res.data.data.coatingMethod;
  res.data.data.detail[0].moldingMethod = res.data.data.moldingMethod;
  if (res.data.data.company) {
    res.data.data.company.name = { label: res.data.data.company.name, value: res.data.data.company.name };
  }

  res.data.data.detail.map((data) => {
    data.id = data.item;
    data.baseUOM = res.data.data.baseUOM;
    return data.id;
  });
  resultDataPd.forEach((data) => {
    if (data.id === res.data.data.productId) {
      res.data.data.detail[0].cuttingSize = `${data.cuttingSize.width} x ${data.cuttingSize.length}`;
    }
  });

  res.data.data.detail.forEach((data) => {
    data.totalPrice = data.totalPrice.toFixed(2);
  });
  res.data.data.additionalDetail.forEach((data) => {
    const { _id: id } = data;
    data.id = id;
    data.totalPrice = data.totalPrice.toFixed(2);
  });
  console.log(res.data.data);
  return res.data;
};

const QuotationDetail = (props) => {
  let id = props?.match?.params?.id;
  let spli = '';
  if (id) {
    spli = id.split('=');
  }
  const [key, code] = spli;
  id = code;
  const componentRef = useRef(null);
  const [errCodeItemModal, setErrorCodeItemModal] = useState('');
  const [onRefetch, setOnRefetch] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [dataPo, setDataPo] = useState(undefined);
  const [quotaionData, setQuotationData] = useState();
  const [listExpense, setListExpense] = useState([]);
  const [isDefaultCompany, setIsDefaultCompany] = useState();
  const [customerOptions, setCustomerOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [expenseOptions, setExpenseOptions] = useState([]);
  const [checkErrors, setCheckErrors] = useState([]);
  const [onSubmitForm, setOnSubmitForm] = useState(false);

  const { push } = useHistory();

  const { formatMessage: f } = useIntl();

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
    setCompanyOptions(list);
    return res.data;
  };

  const searchDefaultCompany = async () => {
    const res = await request({ url: `/masterData/company/find?isDefault=true` });
    const list = [];
    res.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        id: element.id,
        nameTh: { label: element.name, value: element.name },
        nameEn: element.nameEn,
        address: element.address,
        addressEn: element.addressEn,
        detail: element,
      };
      list.push(obj);
    });
    setIsDefaultCompany(list[0]);
    return res.data.data[0];
  };

  const searchCustomer = async () => {
    const res = await request({ url: `/customer/find` });
    const list = [];
    res.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setCustomerOptions(list);
    return res.data;
  };

  const searchProduct = async () => {
    const res = await request({ url: `/masterData/product/find` });
    const list = [];
    res.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setProductOptions(list);
    return res.data.data;
  };

  const searchExpense = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/quotation/lov/expense/list`);
    const list = [];
    data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setExpenseOptions(list);
    return data;
  };

  const createQuotationFn = (quotation) => axios.post(`${SERVICE_URL}/quotation/save`, quotation).then((res) => res.data);

  const updateQuotationFn = ({ id, quotation }) =>
    axios
      .post(`${SERVICE_URL}/quotation/${id}/save`, quotation, {
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
          <span className="align-middle text-primary heading font-heading">{f({ id: 'quotation.save.success' })}</span>
        </div>
      </>
    );
  };

  const { mutate: createQuotation, isLoading: isAdding } = useMutation(createQuotationFn, {
    onSuccess(data) {
      console.debug('create company success :', data);
      setOnRefetch(true);
      push('./');
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('create company error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('AddCompanyData');
    },
  });

  const { mutate: updateQuotation, isLoading: isSaving } = useMutation(updateQuotationFn, {
    onSuccess(data) {
      console.debug('update company success :', data);
      setOnRefetch(true);
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('update company error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editCompanyData');
    },
  });

  const handleSave = (formData) => {
    console.log(formData);
    const productList = formData.dataTable.map((v) => {
      return {
        item: v.item,
        amount: v.amount,
        price: v.price,
        totalPrice: v.totalPrice,
      };
    });
    const additionalList = formData.additionalDetail.map((v) => {
      if (Object.keys(v.expenseCode).length === 2) {
        v.expenseCodes = v.expenseCode;
      } else {
        v.expenseCode = v.expenseCode.detail.code;
        v.expenseCodes = v.expenseCode.detail.code;
      }
      return {
        item: v.item,
        amount: v.amount,
        expenseCode: id ? v.expenseCodes : v.expenseCode,
        price: v.price,
        totalPrice: v.totalPrice,
      };
    });

    var data = {
      id: formData.id,
      code: formData.code,
      date: moment(formData.date).format('YYYY-MM-DD'),
      company: formData.company.companyId,
      customer: formData.customer.customerId,
      validityDate: moment(formData.validityDate).format('YYYY-MM-DD'),
      salesPerson: formData.salesPerson.value ? formData.salesPerson.value : formData.salesPerson,
      product: formData.dataTable[0].productId.value ? formData.dataTable[0].productId.value : formData.dataTable[0].productId,
      material: formData.dataTable[0].materialId.value ? formData.dataTable[0].materialId.value : formData.dataTable[0].materialId,
      printMethod: formData.dataTable[0].printMethod.code ? formData.dataTable[0].printMethod.code : formData.dataTable[0].printMethod,
      coatingMethod: formData.dataTable[0].coatingMethod.code ? formData.dataTable[0].coatingMethod.code : formData.dataTable[0].coatingMethod,
      moldingMethod: formData.dataTable[0].moldingMethod.code ? formData.dataTable[0].moldingMethod.code : formData.dataTable[0].moldingMethod,
      baseUOM: formData.dataTable[0].baseUOM.value ? formData.dataTable[0].baseUOM.value : formData.dataTable[0].baseUOM,
      detail: productList,
      additionalDetail: additionalList,
      term: 'term',
      paymentTerm: 'paymment term',
      note: formData.note,
      status: 'NEW',
      isAmendment: false,
    };

    console.log(data);
    console.log('OK GOOD!');
    if (id) {
      // save
      data.isAmendment = true;
      updateQuotation({ id, quotation: data });
    } else {
      // create
      data.isAmendment = false;
      createQuotation(data);
    }
  };

  useEffect(async () => {
    if (onRefetch) {
      setDataPo(undefined);
    }
    const resultDataCompany = await searchCompany();
    const resultDataCustomer = await searchCustomer();
    const resultDataDefaultCustomer = await searchDefaultCompany();
    const resultDataPd = await searchProduct();
    const resultDataExpense = await searchExpense();
    if (id) {
      const resultDataQo = await searchQuotation(id, key, resultDataCompany, resultDataCustomer, resultDataPd, resultDataExpense);
      setDataPo(resultDataQo.data);
    }
    setListExpense(resultDataExpense);
    setIsDefaultCompany(resultDataDefaultCustomer);
    setOnRefetch(false);
  }, [onRefetch]);

  let title = '';
  const description = '';
  if (dataPo !== undefined) {
    title = id ? `${f({ id: 'quotation.field.edit' })} : ${dataPo.code}` : f({ id: 'quotation.field.add' });
  }

  const handleOnRemoveToolingTypeItem = (value) => {
    var list = [...listExpense.slice(0, value), ...listExpense.slice(value + 1)];
    setListExpense(list);
  };

  const handleOnHideToolingTypeItem = () => {
    setAddModal(false);
  };

  const handleOnAddExpense = (value) => {
    const checkCode = listExpense.find((data) => data.code === value.code);

    if (checkCode) {
      const message = `This code (${value.code}) already exists. Please input another one`;
      setErrorCodeItemModal(message);
    }
    var data = {
      type: 'QUOTATION_EXPENSE',
      abbr: value.abbr,
      code: value.code,
      name: value.name,
    };

    var list = [...listExpense, data];
    setListExpense(list);
  };

  const handleOnSaveExpense = () => {
    var result = {
      condition: 'expense',
      data: listExpense,
    };
    axios.post(`${SERVICE_URL}/quotation/lov/expense/save`, result).then((res) => {
      if (res.data.message === 'Success') {
        setAddModal(false);
        setOnRefetch(true);
      }
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <Row>
          <Col className="mb-2">
            <div className="page-title-container mb-3">
              <Row>
                <Col xs="auto" className="mb-2 align-self-md-center">
                  <NavLink to="/sales/quotation" className="btn-link btn-icon-start w-100 w-md-auto">
                    <CsLineIcons icon="arrow-left" />
                  </NavLink>
                </Col>
                <Col className="mb-2">
                  <h1 className="mb-2 pb-0 display-4">{title}</h1>
                  <div className="text-muted font-heading text-small">{description}</div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
      <section className="w-100">
        {id ? (
          <>
            {dataPo ? (
              <CommercialInvoice
                ref={(el) => {
                  componentRef.current = el;
                }}
                dataPo={dataPo}
                companyOptions={companyOptions}
                customerOptions={customerOptions}
                productOptions={productOptions}
                setQuotationData={setQuotationData}
                setCheckErrors={setCheckErrors}
                onSubmitForm={onSubmitForm}
                setOnSubmitForm={setOnSubmitForm}
                handleSave={handleSave}
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
            {isDefaultCompany ? (
              <CommercialInvoice
                ref={(el) => {
                  componentRef.current = el;
                }}
                // dataPo={dataPo}
                companyOptions={companyOptions}
                productOptions={productOptions}
                customerOptions={customerOptions}
                isDefaultCompany={isDefaultCompany}
                setQuotationData={setQuotationData}
                setCheckErrors={setCheckErrors}
                onSubmitForm={onSubmitForm}
                setOnSubmitForm={setOnSubmitForm}
                handleSave={handleSave}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spinner animation="border" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </>
        )}
        <>
          {isDefaultCompany ? (
            <div
              style={{ background: '#fff', width: '210mm', margin: '0px auto', marginTop: '0px', padding: '20px 20px 20px 20px' }}
              className="d-flex justify-content-between"
            >
              <div>
                <Button onClick={() => setAddModal(true)} variant="secondary" size="small">
                  จัดการค่าใช้จ่าย
                </Button>
              </div>
              <div className="d-flex gap-2">
                <ReactToPrint
                  trigger={() => (
                    <Button variant="dark" size="small">
                      ออกเอกสาร
                    </Button>
                  )}
                  content={() => componentRef.current}
                />
                <Button variant="info" size="small">
                  ยืนยัน
                </Button>
                {id ? (
                  <Button onClick={() => setOnSubmitForm(true)} variant="warning" size="small">
                    ปรับ QT
                  </Button>
                ) : (
                  <Button onClick={() => setOnSubmitForm(true)} variant="success" size="small">
                    บันทึก
                  </Button>
                )}
                <Button variant="danger" size="small">
                  ยกเลิก
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Spinner animation="border" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </>

        {id && dataPo && (
          <div style={{ background: '#fff', width: '210mm', margin: '0 auto', padding: '20px 20px 20px 20px' }}>
            <div style={{ borderRadius: '20px', opacity: '0.7', border: '2px solid', padding: '5px 0px', textAlign: 'start' }}>
              <div className="d-flex flex-row justify-content-center align-items-center gap-2 ">
                <div>รายการแก้ไข</div>
              </div>
            </div>
            <HistoryList dataPo={dataPo} onRefetch={setOnRefetch} />
          </div>
        )}
      </section>

      <AddAdditionalItemModal
        show={addModal}
        onHide={handleOnHideToolingTypeItem}
        list={listExpense}
        onAdd={handleOnAddExpense}
        onRemove={handleOnRemoveToolingTypeItem}
        codeResult=""
        abbrResult=""
        nameResult=""
        onSave={handleOnSaveExpense}
      />
    </>
  );
};

export default QuotationDetail;
