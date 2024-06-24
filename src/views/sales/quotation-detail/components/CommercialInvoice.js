import React, { useEffect, useReducer, useRef, useState } from 'react';
import './style.css';
import { Row } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import DatepickerThaiYear from './DatepickerThaiYear';
import LovCustomerSelect from './LovCustomerSelect';
import LovCompanySelect from './LovCompanySelect';
import LovProductSelect from './LovProductSelect';
import LovMaterialSelect from './LovMaterialSelect';
import LovMethodSelect from './LovMethodSelect';
import LovExpenseSelect from './LovExpenseSelect';
import LovUOMSelect from './LovUOMSelect';
import LovEmployeeSelect from './LovEmployeeSelect';

const newDataTemplate = (length, baseUOM) => ({
  id: length,
  item: length,
  // productName: '',
  baseUOM: baseUOM || '',
  amount: '',
  price: '',
  totalPrice: '',
});

const newDataTemplateEmptyProduct = (length, baseUOM) => ({
  id: length || 0,
  item: length || 0,
  productName: '',
  material: '',
  printMethod: '',
  coatingMethod: '',
  moldingMethod: '',
  cuttingSize: '',
  baseUOM: baseUOM || '',
  amount: '',
  price: '',
  totalPrice: '',
});

const newNoteTemplate = (length) => ({
  id: length,
  item: length,
  expenseCode: '',
  unit: '',
  amount: '',
  price: '',
  totalPrice: '',
});

const templateOptions = [
  { id: 0, label: 'กล่องออฟเซต', value: 'กล่องออฟเซต' },
  { id: 1, label: 'ฉลากยาแบบสติ๊กเกอร์', value: 'ฉลากยาแบบสติ๊กเกอร์' },
  { id: 2, label: 'ฉลากยาแบบกระกาษ', value: 'ฉลากยาแบบกระกาษ' },
  { id: 3, label: 'เอกสารกำกับยา', value: 'เอกสารกำกับยา' },
  { id: 4, label: 'กล่องลูกฟูก', value: 'กล่องลูกฟูก' },
];

const CommercialInvoice = React.forwardRef((props, ref) => {
  const { formatMessage: f } = useIntl();
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState(templateOptions[0]);
  const h = useRef();
  const span = useRef();
  
  let initialState = {};
  if (props.dataPo !== undefined) {
    initialState = {
      header: 'QUOTATION',
      id: props.dataPo.id !== undefined ? props.dataPo.id : '',
      logo: props.dataPo.company !== undefined ? props.dataPo.company.logo : '/img/logo/KSP.logo.png',
      company: {
        companyId: props.dataPo.company !== undefined ? props.dataPo.company.id : '',
        companyTh: props.dataPo.company !== undefined ? props.dataPo.company.name : '',
        companyEn: props.dataPo.company !== undefined ? props.dataPo.company.nameEn : '',
        addressTh: props.dataPo.company !== undefined ? props.dataPo.company.address : '',
        addressEn: props.dataPo.company !== undefined ? props.dataPo.company.addressEn : '',
      },
      tel: `Tel. ${props.dataPo.company !== undefined ? props.dataPo.company.officeNo[0] : ''} Fax. ${
        props.dataPo.company !== undefined ? props.dataPo.company.faxNo[0] : ''
      }`,
      title: `ใบเสนอราคา`,
      titleEn: `Quotation`,
      customerName: '',
      customer: {
        customerId: props.dataPo.customer !== undefined ? props.dataPo.customer.id : '',
        customerName: props.dataPo.customer !== undefined ? props.dataPo.customer.name : '',
        customerAddress: props.dataPo.customer !== undefined ? props.dataPo.customer.list[0].address : '',
        customerTel: props.dataPo.customer !== undefined ? props.dataPo.customer.list[0].phone : '',
        customerContact: props.dataPo.customer !== undefined ? props.dataPo.customer.list[0].contacts[0].name : '',
        customerFax: props.dataPo.customer !== undefined ? props.dataPo.customer.list[0].fax : '',
        creditTerm: props.dataPo.customer !== undefined ? props.dataPo.customer.creditTerm : '',
      },
      code: props.dataPo.code !== undefined ? props.dataPo.code : '',
      date: props.dataPo.date !== undefined ? props.dataPo.date : '',
      validityDate: props.dataPo.validityDate !== undefined ? props.dataPo.validityDate : '',
      salesPerson: props.dataPo.salesPerson,
      paid: 0,
      note: props.dataPo.note !== undefined ? props.dataPo.note : '',
      dataTable: props.dataPo.detail !== undefined ? props.dataPo.detail : '',
      additionalDetail: props.dataPo.additionalDetail !== undefined ? props.dataPo.additionalDetail : '',
      total: 0,
    };
  } else {
    initialState = {
      header: 'QUOTATION',
      logo: props.isDefaultCompany ? props.isDefaultCompany.logo : '/img/logo/KSP.logo.png',
      company: {
        companyId: props.isDefaultCompany?.id,
        companyTh: props.isDefaultCompany?.nameTh,
        companyEn: props.isDefaultCompany?.nameEn,
        addressTh: props.isDefaultCompany?.address,
        addressEn: props.isDefaultCompany?.addressEn,
      },
      tel: `Tel.  Fax. `,
      title: `ใบเสนอราคา`,
      titleEn: `Quotation`,
      customerName: '',
      customer: '',
      code: '',
      date: '',
      salesPerson: '',
      validityDate: '',
      paid: 0,
      note: '',
      dataTable: [],
      additionalDetail: [],
      total: 0,
    };
  }

  const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
      case 'setHeader':
        return { ...state, header: payload };
      case 'setCompany':
        return { ...state, company: payload };
      case 'setTitle':
        return { ...state, title: payload };
      case 'setCustomer':
        return { ...state, customer: payload };
      case 'setCode':
        return { ...state, code: payload };
      case 'setDate':
        return { ...state, date: payload };
      case 'setValidityDate':
        return { ...state, validityDate: payload };
      case 'setPaid':
        return { ...state, paid: payload };
      case 'setNote':
        return { ...state, note: payload };
      case 'setDataTable':
        return { ...state, dataTable: payload };
      case 'setadditionalDetail':
        return { ...state, additionalDetail: payload };
      case 'setTotal':
        return { ...state, total: payload };
      case 'setNumber':
        return { ...state, number: payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const validationSchema = Yup.object().shape({
    customer: Yup.object().required('Please provide Customer required'),
    code: Yup.string().required('Please provide Code required'),
    date: Yup.string().required('Please provide Date required'),
    validityDate: Yup.string().required('Please provide Velidity date required'),
  });

  const onSubmit = (formData) => {
    props.handleSave(formData);
  };

  const formik = useFormik({ initialValues: initialState, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  useEffect(() => {
    if (props.onSubmitForm) {
      console.log(errors);
      props.setCheckErrors(errors);
      handleSubmit();
    }
    props.setOnSubmitForm(false);
  }, [props.onSubmitForm]);

  const onChooseTemplate = (evt) => {
    setTemplate(evt);
    const { dataTable } = values;
    if (dataTable.length === 0) {
      handleChange({ target: { id: 'dataTable', value: [...dataTable, newDataTemplateEmptyProduct(dataTable.length + 1)] } });
    }
  };

  const changeHandler = (evt) => {
    setContent(evt.target.value);
  };

  const updateItem = (id, itemAttributes) => {
    const { dataTable } = values;
    const index = dataTable.findIndex((x) => x.id === id);
    if (index === -1) {
      console.error("Something wen't wrong");
    } else {
      const data = [...dataTable.slice(0, index), Object.assign(dataTable[index], itemAttributes), ...dataTable.slice(index + 1)];
      dispatch({ type: 'setDataTable', payload: data });
      handleChange({ target: { id: 'dataTable', value: data } });
    }
  };

  const updateItemExpense = (id, itemAttributes) => {
    const { additionalDetail } = values;
    const index = additionalDetail.findIndex((x) => x.id === id);
    if (index === -1) {
      console.error("Something wen't wrong");
    } else {
      const data = [...additionalDetail.slice(0, index), Object.assign(additionalDetail[index], itemAttributes), ...additionalDetail.slice(index + 1)];
      dispatch({ type: 'setadditionalDetail', payload: data });
      handleChange({ target: { id: 'additionalDetail', value: data } });
    }
  };

  const getTotal = () => {
    let t1 = 0;
    let t2 = 0;
    const { dataTable, additionalDetail } = values;
    for (let i = 0; i < dataTable.length; i += 1) {
      t1 += dataTable[i].price * dataTable[i].amount;
    }
    for (let i = 0; i < additionalDetail.length; i += 1) {
      t2 += additionalDetail[i].price * additionalDetail[i].amount;
    }
    t1 += t2;
    return t1.toFixed(2);
  };

  const getVat = () => {
    const re = /^\d+(\.\d{1,2})?$/;
    let t1 = 0;
    let t2 = 0;
    let sum = 0;
    const { dataTable, additionalDetail } = values;
    for (let i = 0; i < dataTable.length; i += 1) {
      t1 += dataTable[i].price * dataTable[i].amount;
    }
    for (let i = 0; i < additionalDetail.length; i += 1) {
      t2 += additionalDetail[i].price * additionalDetail[i].amount;
    }
    sum = t1 + t2;
    sum += ((t1 + t2) * 7) / 100;
    return sum.toFixed(2);
  };

  const handleChangeType = (name) => (event) => {
    const stateType = `set${name.charAt(0).toUpperCase() + name.slice(1)}`;
    dispatch({ type: stateType, payload: event.target.value });
    // handleChange({ target: { id: [stateType], value: event.target.value } });
  };

  const handleChangeTable = (name, id) => (event) => {
    updateItem(id, { [name]: event.target.value });
  };
  const handleChangeTableExpense = (name, id) => (event) => {
    updateItemExpense(id, { [name]: event.target.value });
  };

  const handleChangeUnit = (name, id, event) => {
    if (name === 'baseUOM') {
      const { dataTable } = values;
      const index = dataTable.findIndex((x) => x.id === id);
      if (index === -1) {
        console.error("Something wen't wrong");
      } else {
        dataTable.forEach((item) => {
          item.baseUOM = event;
        });
        dispatch({ type: 'setDataTable', payload: dataTable });
        handleChange({ target: { id: 'dataTable', value: dataTable } });
      }
    }
  };

  const handleChangePrice = (name, id) => (event) => {
    const fieldTotalPrice = 'totalPrice';
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      updateItem(id, { [name]: event.target.value });
      let totalPrice = 0;
      const p = values.dataTable.forEach((data) => {
        if (id === data.id) {
          totalPrice = Number(data.amount) * Number(data.price);
        }
      });
      updateItem(id, { [fieldTotalPrice]: totalPrice.toFixed(2) });
    }
  };

  const handleChangePriceExpense = (name, id) => (event) => {
    const fieldTotalPrice = 'totalPrice';
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      updateItemExpense(id, { [name]: event.target.value });
      let totalPrice = 0;
      const p = values.additionalDetail.forEach((data) => {
        if (id === data.id) {
          totalPrice = Number(data.amount) * Number(data.price);
        }
      });

      updateItemExpense(id, { [fieldTotalPrice]: totalPrice.toFixed(2) });
    }
  };

  const handleAddRow = (e, type) => {
    e.preventDefault();
    const { dataTable, additionalDetail } = values;
    if (type === 'addRow') {
      // เพิ่มสินค้า
      if (props.dataPo !== undefined) {
        // ถ้าเข้าหน้ามา Edit จะให้เพิ่มโดยไม่ต้องมี Description
        console.log(1);
        handleChange({ target: { id: 'dataTable', value: [...dataTable, newDataTemplate(dataTable.length + 1, dataTable[0].baseUOM || '')] } });
      } else {
        console.log();
        // เข้ามาแบบ Add Quotation ให้ช่องแรกมี Description
        if (dataTable.length > 0) {
          console.log(2);
          handleChange({ target: { id: 'dataTable', value: [...dataTable, newDataTemplate(dataTable.length + 1, dataTable[0].baseUOM || '')] } });
        } else {
          console.log(3);
          handleChange({ target: { id: 'dataTable', value: [...dataTable, newDataTemplateEmptyProduct(dataTable.length + 1, dataTable.length > 1 ? dataTable[0].baseUOM || '' : '')] } });
        }
      }
    } else {
      // เพิ่ม item
      handleChange({ target: { id: 'additionalDetail', value: [...additionalDetail, newNoteTemplate(additionalDetail.length + 1)] } });
    }
  };

  const handleRemoveRow = (e, target) => {
    e.preventDefault();
    const { dataTable } = values;
    const array = [...dataTable];
    const index = array.indexOf(target);
    array.splice(index, 1);
    dispatch({ type: 'setDataTable', payload: array });
    handleChange({ target: { id: 'dataTable', value: array } });
    // re-calculate total
  };

  const handleRemoveNote = (e, target) => {
    e.preventDefault();
    const { additionalDetail } = values;
    const array = [...additionalDetail];
    const index = array.indexOf(target);
    array.splice(index, 1);
    handleChange({ target: { id: 'additionalDetail', value: array } });
    // re-calculate total
  };

  const handleSelectCustomer = (e) => {
    if (e !== null) {
      const customer = {
        customerId: e.detail.id,
        customerName: { label: e.detail.name, value: e.detail.id },
        customerAddress: e.detail.list.length > 0 ? e.detail.list[0].address : '',
        customerTel: e.detail.list.length > 0 ? e.detail.list[0].phone : '',
        customerContact: e.detail.list.length > 0 ? e.detail.list[0].contacts[0].name : '',
        customerFax: e.detail.list.length > 0 ? e.detail.list[0].fax : '',
        creditTerm: e.detail.creditTerm,
      };
      handleChange({ target: { id: 'customer', value: customer } });
    } else {
      const customer = {
        customerName: '',
        customerAddress: '',
        customerTel: '',
        customerContact: '',
        customerFax: '',
        creditTerm: '',
      };
      handleChange({ target: { id: 'customer', value: customer } });
    }
  };

  const handleSelectCompany = (e) => {
    console.log(e);
    if (e !== null) {
      const {logo} = e.detail;
      const company = {
        companyId: e.detail.id,
        companyTh: { label: e.detail.name, value: e.detail.name },
        companyEn: e.detail.nameEn,
        addressTh: e.detail.address,
        addressEn: e.detail.addressEn,
      };
      handleChange({ target: { id: 'company', value: company } });
      handleChange({ target: { id: 'logo', value: logo } });
    } else {
      const company = {
        companyTh: '',
        companyEn: '',
        addressTh: '',
        addressEn: '',
      };
      handleChange({ target: { id: 'company', value: company } });
    }
  };

  const handleSelectSalesPerson = (name, e) => {
    handleChange({ target: { id: [name], value: e } });
  };

  const handleSelectDescription = (value, name, id) => {
    const nameId = `${name}Id`;
    if (value !== null) {
      updateItem(id, { [name]: { label: value.detail.name, value: value.detail.id, code: value.detail.code } });
      if (name === 'expenseCode') {
        updateItemExpense(id, { [name]: value.value });
      }
      if (name === 'product') {
        updateItem(id, { [nameId]: value.detail.id });
        if (value.detail.cuttingSize) {
          const cuttingSize = `${value.detail.cuttingSize.width} x ${value.detail.cuttingSize.length}`;
          const cuttingName = 'cuttingSize';
          updateItem(id, { [cuttingName]: cuttingSize });
        }
      }
      if (name === 'material') {
        updateItem(id, { [nameId]: value.detail.id });
      }
      if (name === 'coatingMethod' || name === 'printMethod' || name === 'moldingMethod') {
        updateItem(id, { [nameId]: value.detail.code });
      }
    }
  };

  const onSetDate = (e, type) => {
    if (type === 'validityDate') {
      handleChange({ target: { id: 'validityDate', value: e } });
    } else {
      handleChange({ target: { id: 'date', value: e } });
    }
  };

  const handleSelectTemplate = (value) => {
    setTemplate(value);
  };

  const { dataTable, additionalDetail, validityDate, logo, customer, company, code, date, title, titleEn, note } = state;

  useEffect(() => {
    props.setQuotationData(values);
  }, [values]);

  console.log(values);

  const rowSpanDescription = (value) => {
    return (
      <>
        {value.productName !== undefined && (
          <td rowSpan={values.dataTable.length} className="item-description" style={{ verticalAlign: 'top' }}>
            <div id="select-description">
              <div>ชื่องาน </div>
              <LovProductSelect
                name="product"
                isClearable
                // lov="customer"
                value={values.dataTable[0].productId || ''}
                onChange={(e) => handleSelectDescription(e, 'productId', value.id || '')}
                // isDisabled={!isEditMode}
              />
            </div>
            <div id="select-description">
              <div>ขนาด (มม.)</div>
              <div className="ms-3">{value.cuttingSize}</div>
            </div>
            <div id="select-description">
              <div>วัตถุดิบ </div>
              <LovMaterialSelect
                name="material"
                isClearable
                // lov="customer"
                value={values.dataTable[0].materialId || ''}
                onChange={(e) => handleSelectDescription(e, 'materialId', value.id || '')}
                // isDisabled={!isEditMode}
              />
            </div>
            <div id="select-description">
              <div className="title-size">รูปแบบการพิมพ์ </div>
              <LovMethodSelect
                name="printMethod"
                isClearable
                lov="PRODUCT_PRINT"
                value={values.dataTable[0].printMethod || ''}
                onChange={(e) => handleSelectDescription(e, 'printMethod', value.id || '')}
                // isDisabled={!isEditMode}
              />
            </div>
            {template !== undefined && (template.id === 0 || template.id === 1 || template.id === 2) && (
              <div id="select-description">
                <div className="title-size">รูปแบบการเคลือบ </div>
                <LovMethodSelect
                  id="lov"
                  name="coatingMethod"
                  isClearable
                  lov="PRODUCT_COATING"
                  value={values.dataTable[0].coatingMethod || ''}
                  onChange={(e) => handleSelectDescription(e, 'coatingMethod', value.id || '')}
                  // isDisabled={!isEditMode}
                />
              </div>
            )}
            <div id="select-description">
              <div className="title-size">รูปแบบการขึ้นรูป</div>
              <LovMethodSelect
                name="moldingMethod"
                isClearable
                lov="PRODUCT_MOLDING"
                value={values.dataTable[0].moldingMethod || ''}
                onChange={(e) => handleSelectDescription(e, 'moldingMethod', value.id || '')}
                // isDisabled={!isEditMode}
              />
            </div>
          </td>
        )}
      </>
    );
  };

  const getRowDataTable = (dataArray) => {
    return dataArray.map((data, index) => (
      <tr
        // className={index % 5 === 4 ? 'page-break item-row' : 'item-row'}
        className="item-row"
        key={index.toString()}
      >
        <td className="item-num">
          <div className="delete-wpr">
            {data.item === 1 && <input value={data.item} onChange={handleChangeTable('item', data.id)} />}
            {props.dataPo !== undefined ? (
              <>
                {data.item > 1 && (
                  <a className="delete" href="#" onClick={(e) => handleRemoveRow(e, data)} title="Remove row">
                    X
                  </a>
                )}
              </>
            ) : (
              <>
                {data.item > 1 && (
                  <a className="delete" href="#" onClick={(e) => handleRemoveRow(e, data)} title="Remove row">
                    X
                  </a>
                )}
              </>
            )}
          </div>
        </td>
        {rowSpanDescription(data)}
        <td className="item-quantity">
          <input value={data.amount} onChange={handleChangePrice('amount', data.id)} />
        </td>
        <td className="item-unit" id="select-unit">
          {data.item === 1 ? (
            <LovUOMSelect name="baseUOM" isClearable value={data.baseUOM || ''} onChange={(e) => handleChangeUnit('baseUOM', data.id, e)} />
          ) : (
            // <Select
            //   value={data.unit || ''}
            // />
            <LovUOMSelect name="baseUOM" placeholder=" " value={data.baseUOM || ''} isDisabled />
          )}
        </td>
        <td className="item-price-unit">
          <input value={data.price} onChange={handleChangePrice('price', data.id)} />
        </td>
        <td className="item-amount">
          <div className="price text-end " style={{ paddingRight: '5px' }}>
            {data.totalPrice}
          </div>
        </td>
      </tr>
    ));
  };
  const getRowAdditional = (dataArray) => {
    return dataArray.map((data, index) => (
      <tr className="item-row" key={index.toString()}>
        <td className="item-num">
          <div className="delete-wpr">
            {/* <input value={data.item} onChange={handleChangeTable('item', data.id)} /> */}
            {/* {data.item > props.dataPo.detail.length && ( */}
            <a className="delete" href="#" onClick={(e) => handleRemoveNote(e, data)} title="Remove row">
              X
            </a>
            {/* )}  */}
          </div>
        </td>
        <td className="item-description" style={{ verticalAlign: 'top' }}>
          <div className="d-flex flex-row gap-2" id="select-description">
            <LovExpenseSelect
              name="expenseCode"
              isClearable
              value={data.expenseCode || ''}
              onChange={(e) => handleSelectDescription(e, 'expenseCode', data.id)}
              // isDisabled={!isEditMode}
            />
          </div>
        </td>
        <td className="item-quantity">
          <input value={data.amount} onChange={handleChangePriceExpense('amount', data.id)} />
        </td>
        <td className="item-unit">
          <input value={data.unit} onChange={handleChangeTableExpense('unit', data.id)} />
        </td>
        <td className="item-price-unit">
          <input value={data.price} onChange={handleChangePriceExpense('price', data.id)} />
        </td>
        <td className="item-amount">
          <div className="price text-end" style={{ paddingRight: '5px' }}>
            {data.totalPrice}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div id="template" className="bg-white">
        <Select
          classNamePrefix="react-select"
          options={templateOptions}
          id="select-template"
          placeholder="Select Template Here..."
          // isDisabled={!isEditMode}
          value={template}
          // required
          // isMulti
          onChange={onChooseTemplate}
        />
      </div>
      <div ref={ref} className="bg-white" id="page-wrap">
        <div className="d-flex flex-row w-100 align-items-center">
          <div style={{ width: '23%', maxHeight: '7rem' }}>
            <img src={values.logo} alt="logo" style={{ width: '160px', objectFit: 'contain', marginRight: '10px', height: '7rem' }} />
          </div>
          <div style={{ width: '55%' }} id="style-select">
            <LovCompanySelect
              name="company"
              isClearable
              // lov="customer"
              value={values.company.companyId}
              onChange={handleSelectCompany}
              // isDisabled={!isEditMode}
            />
            <div style={{ width: '100%', height: '30px', fontSize: '16px', fontWeight: '900' }}>{values.company.companyEn}</div>
            <div style={{ width: '100%', height: '17px' }} id="addressTh">
              {values.company.addressTh}
            </div>
            <div style={{ width: '100%', height: '17px' }} id="addressEn">
              {values.company.addressEn}
            </div>
            <div style={{ width: '100%', height: '17px' }} id="tel">
              {values.company.tel}
            </div>
          </div>
          <div style={{ width: '22%' }} className="d-flex flex-column align-items-end">
            <div style={{ textAlign: 'center', padding: '10px 2px', width: '160px', height: '55px', fontSize: '18px', fontWeight: '900', border: '2px solid' }}>
              {values.title}
            </div>
            <div style={{ textAlign: 'center', padding: '10px 2px', width: '160px', height: '55px', fontSize: '18px', fontWeight: '900', border: '2px solid' }}>
              {values.titleEn}
            </div>
          </div>
        </div>
        <table id="items-detail">
          <tbody>
            <td style={{ width: '60%', padding: '0px' }}>
              <div className="d-flex flex-column justify-content-between" style={{ height: '9rem' }}>
                <div className="d-flex flex-column w-100" style={{ height: '7.1rem' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ paddingLeft: '2px', paddingTop: '2px' }}>ชื่อลูกค้า / บริษัท</div>
                    <div style={{ paddingLeft: '0px' }} id="style-select-customer">
                      <LovCustomerSelect
                        name="customer"
                        isClearable
                        // lov="customer"
                        value={values.customer.customerName}
                        onChange={handleSelectCustomer}
                        // isDisabled={!isEditMode}
                      />
                      {errors.customer && touched.customer && <div className="d-block invalid-feedback">{f({ id: errors.customer })}</div>}
                    </div>
                  </div>
                  <div style={{ width: '100%', paddingLeft: '0px' }}>
                    <Row>
                      <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                      <div style={{ width: '85%', paddingLeft: '0px' }}>{values.customer.customerContact}</div>
                    </Row>
                    <Row>
                      <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                      <div style={{ width: '85%', paddingLeft: '0px' }}>{values.customer.customerAddress}</div>
                    </Row>
                    <Row>
                      <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                      {values.customer && (
                        <div style={{ width: '85%', paddingLeft: '0px' }}>
                          {values.customer.customerTel[0] !== undefined ? ` Tel: ${values.customer.customerTel[0]}` : ''}
                        </div>
                      )}
                    </Row>
                    <Row>
                      <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                      {values.customer && (
                        <div style={{ width: '85%', paddingLeft: '0px' }}>
                          {values.customer.customerFax[0] !== undefined ? ` Fax: ${values.customer.customerFax[0]}` : ''}
                        </div>
                      )}
                    </Row>
                  </div>
                </div>
              </div>
            </td>

            <td style={{ width: '40%', padding: '0px' }}>
              <div className="d-flex flex-row w-100" style={{ borderBottom: '1px solid' }}>
                <div className="w-40" style={{ paddingLeft: '2px' }}>
                  <div>เลขที่</div>
                  <div>No.</div>
                </div>
                <div className="w-60 d-flex ps-1">
                  <input
                    id="placeholderAlert"
                    name="code"
                    placeholder={`${errors.code && touched.code ? errors.code : ''}`}
                    style={{ border: 'none', width: '100%', height: '80%' }}
                    value={values.code}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="d-flex flex-row w-100" style={{ borderBottom: '1px solid' }}>
                <div className="w-40" style={{ paddingLeft: '2px' }}>
                  <div>วันที่</div>
                  <div>Date</div>
                </div>
                <div className="w-60 d-flex flex-column justify-content-center">
                  <DatepickerThaiYear
                    idAttr="placeholderAlert"
                    validate={`${errors.date && touched.date ? errors.date : ''}`}
                    value={values.date}
                    onChange={(e) => onSetDate(e, 'date')}
                  />
                </div>
              </div>
              <div className="d-flex flex-row w-100" style={{ borderBottom: '1px solid' }}>
                <div className="w-40" style={{ paddingLeft: '2px' }}>
                  <div>เงื่อนไขการชำระเงิน</div>
                  <div>Term of payment</div>
                </div>
                <div className="w-60 d-flex flex-column justify-content-center ps-1">
                  {values.customer.creditTerm ? <> {values.customer.creditTerm} วัน </> : ''}
                </div>
              </div>
              <div className="d-flex flex-row w-100">
                <div className="w-40" style={{ paddingLeft: '2px' }}>
                  <div>ยื่นราคาถึงวันที่</div>
                  <div>Velidity Date</div>
                </div>
                <div className="w-60 d-flex flex-column justify-content-center">
                  <DatepickerThaiYear
                    idAttr="placeholderAlert"
                    validate={`${errors.validityDate && touched.validityDate ? errors.validityDate : ''}`}
                    value={values.validityDate}
                    onChange={(e) => onSetDate(e, 'validityDate')}
                  />
                </div>
              </div>
            </td>
          </tbody>
        </table>
        <div className="mt-1">บริษัทฯ มีความยินดีขอเสนอราคา ตามรายการต่อไปนี้ / We are pleased to submit our quotation as follows :</div>
        <table ref={h} id="items" style={{ marginTop: '0', verticalAlign: 'middle' }}>
          <thead>
            <tr>
              <th className="th-col">
                <div>ลำดับ</div>
                <div>ITEM</div>
              </th>
              <th className="th-col">
                <div>รายละเอียด</div>
                <div>DESCRIPTION</div>
              </th>
              <th className="th-col">
                <div>จำนวน</div>
                <div>AMOUNT</div>
              </th>
              <th className="th-col">
                <div>หน่วย</div>
                <div>UNIT</div>
              </th>
              <th className="th-col">
                <div>ราคา/หน่วย</div>
                <div>PRICE/UNIT</div>
              </th>
              <th className="th-col">
                <div>จำนวนเงิน</div>
                <div>PRICE</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {getRowDataTable(values.dataTable)}
            {values.dataTable.length < 6 && (
              <tr id="hiderow">
                <td colSpan="6" style={{ background: 'rgb(173 221 228 / 60%)' }}>
                  <a
                    className="d-flex flex-row justify-content-center addrow"
                    id="addrow"
                    href="#"
                    onClick={(e) => handleAddRow(e, 'addRow')}
                    title="Add a row"
                  >
                    <div>+ Add row</div>
                  </a>
                </td>
              </tr>
            )}
            {getRowAdditional(values.additionalDetail)}
            {values.additionalDetail.length < 3 && (
              <tr id="hiderow">
                <td colSpan="6" style={{ background: 'rgb(173 221 228 / 60%)' }}>
                  <a
                    className="d-flex flex-row justify-content-center addrow"
                    id="addrow"
                    href="#"
                    onClick={(e) => handleAddRow(e, 'addNote')}
                    title="Add a row"
                  >
                    <div>+ Add row</div>
                  </a>
                </td>
              </tr>
            )}
            <tr>
              <td colSpan="3" className="blank">
                &nbsp;
              </td>
              <td colSpan="2" className="total-line">
                รวมเป็นเงิน
              </td>
              <td className="total-value">
                <div id="subtotal" className=" text-end">
                  {getTotal()}
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan="3" className="blank">
                <div className="d-flex flex-row justify-content-start align-items-center g-0">
                  <div style={{ width: '15%' }}> พนักงานขาย </div>
                  <div style={{ width: '85' }} id="select-description">
                    <LovEmployeeSelect
                      name="salesPerson"
                      placeholder="กรุณาเลือกพนักงานขาย..."
                      isClearable
                      value={values?.salesPerson || ''}
                      onChange={(e) => handleSelectSalesPerson('salesPerson', e)}
                    />
                  </div>
                </div>
              </td>

              <td colSpan="2" className="total-line">
                ภาษีมูลค่าเพิ่ม 7%
              </td>
              <td className="total-value">
                <div id="subtotal" className=" text-end">
                  {getVat()}
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan="3" className="blank">
                &nbsp;
              </td>
              <td colSpan="2" className="total-line">
                รวมเป็นเงินทั้งสิ้น
              </td>
              <td className="total-value">
                <div id="total" className=" text-end">
                  {getVat()}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div id="terms">
          <div className="group-signature" style={{ borderBottom: '2px solid', opacity: '0.7', paddingBottom: '5px' }}>
            TERM
          </div>
          <div style={{ textAlign: 'left', paddingTop: '5px' }}>
            <div>***กำหนดยืนยันราคาภายใน 15 วัน ส่งสินค้าภายใน 15 วันหลังจากได้รับใบสั่งซื้อ</div>
            จึงเรียนมาเพื่อพิจารณา และหวังเป็นอย่างยิ่งว่าจะได้รับการพิจารณาจากท่าน
          </div>
          <div style={{ border: '2px solid' }}>
            <div style={{ textAlign: 'left', fontSize: '15px' }}>
              <div className="d-flex flex-row w-100">
                <div
                  style={{ width: '55%', borderRight: '1px solid', padding: '5px' }}
                  className="d-flex flex-column justify-content-center align-items-center gap-2 "
                >
                  <div style={{ textAlign: 'start' }}>( สำหรับลูกค้า / For customer only )</div>
                  <div>บริษัทฯ ตกลงสั่งซื้อและว่าจ้างตามรายการในใบเสนอราคาฉบับนี้</div>
                  <div className="d-flex flex-row justify-content-center align-items-center gap-2 w-100">
                    <div className="w-70 d-flex flex-column justify-content-center align-items-center gap-2 ">
                      <div className="d-flex flex-row justify-content-center align-items-center gap-2 ">
                        ลงชื่อ ............................................ ผู้สั่งซื้อ
                      </div>
                      <div className="d-flex flex-row justify-content-center align-items-center gap-2 ">
                        ................./................./.................
                      </div>
                      <div className="d-flex flex-row justify-content-center align-items-center gap-2 ">
                        <div style={{ width: '12rem' }}>(วัน เดือน ปี ที่ออกหนังสือรับรองฯ)</div>
                      </div>
                    </div>
                    <div className="w-30">
                      <div id="seal">
                        <div>ประทับตรา</div>
                        <div>นิติบุคคล</div>
                        <div>(ถ้ามี)</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: '45%', padding: '5px' }} className="d-flex flex-column justify-content-center align-items-center gap-4">
                  <div>ขอแสดงความนับถือ</div>
                  <div className="d-flex flex-column justify-content-center align-items-center gap-0">
                    <div>............................................</div>
                    <div className="d-flex flex-row">
                      <div>(</div>
                      <span id="hide" ref={span}>
                        {content}
                      </span>
                      <input maxLength={38} id="bidder" type="text" onChange={changeHandler} />
                      <div>)</div>
                    </div>
                    <div>ผู้เสนอราคา / ผู้ขาย</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="note" style={{ border: '2px solid', padding: '10px', textAlign: 'start', marginTop: '1rem' }}>
            <div className="d-flex flex-row justify-content-start align-items-center gap-2 ">
              <div>Note:</div>
              <input
                value={values.note}
                style={{ border: '1px solid rgba(0,0,0,0)', borderRadius: '5px', padding: '5px 10px', width: '100%' }}
                type="text"
                name="note"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default CommercialInvoice;