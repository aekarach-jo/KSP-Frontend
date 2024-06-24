import React, { useEffect, useReducer, useRef, useState } from 'react';
import './style.css';
import * as Yup from 'yup';
import { Col, Row, Form, Card, Table, Button } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { SERVICE_URL } from 'config';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import moment from 'moment';
import Select from 'react-select';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import LovTemplateSelect from 'components/lov-select/LovTemplateSelect';
import LovOutsourceSelect from 'components/lov-select/LovOutsourceSelect';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import useProductPlanOptionsNoQC from 'hooks/useProductPlanOptionsNoQC';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import AutocompleteCompany from './AutocompleteCompany';
import LovCompanySelect from './LovCompanySelect';

const OutsourceCard = React.forwardRef((props, ref) => {
  const [content, setContent] = useState('');
  const h = useRef();
  const { formatMessage: f } = useIntl();
  const queryClient = useQueryClient();
  const [editPrint, setEditPrint] = useState(false);
  const [outsourceData, setOutsourceData] = useState();
  const [preview, setPreview] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [deleteFile, setDeleteFile] = useState();
  const [fileSizeAlert, setFileSizeAlert] = useState(false);
  const [fileAlert, setFileAlert] = useState(false);
  const { planOptions } = useProductPlanOptionsNoQC();
  const { goBack } = useHistory();
  let validationSchema = {};
  if (!editPrint && !props.verifiedPrint) {
    validationSchema = Yup.object().shape({
      productId: Yup.string().required('กรุณาระบุชื่อสินค้า'),
      supplierId: Yup.string().required('กรุณาระบุส่งทำที่'),
      sendingBy: Yup.string().required('กรุณาระบุวันที่แจ้งรับ'),
    });
  } else {
    validationSchema = Yup.object().shape({
      productId: Yup.string().required('กรุณาระบุชื่อสินค้า'),
      supplierId: Yup.string().required('กรุณาระบุส่งทำที่'),
      amount: Yup.string().required('กรุณากรอกจำนวน'),
      height: Yup.string().required('กรุณากรอกความสูง'),
      pallet: Yup.string().required('กรุณากรอกพาเลต'),
      receivingDate: Yup.string().required('กรุณาระบุวันที่รับงาน'),
      sendingDate: Yup.string().required('กรุณาระบุวันที่รับเข้า'),
      sendingBy: Yup.string().required('กรุณาระบุวันที่แจ้งรับ'),
      fileUpload: Yup.string().required('กรุณาระบุวันที่แจ้งรับ'),
    });
  }
  let initialState = {};
  if (props.dataOS !== undefined) {
    initialState = {
      header: 'OUTSOURCE',
      id: props.dataOS.id !== undefined ? props.dataOS.id : '',
      logo: props.dataOS.company !== undefined ? props.dataOS.company.logo : '/img/logo/KSP.logo.png',
      fileUpload: props.dataOS.fileUpload !== undefined ? props.dataOS.fileUpload : '',
      company: {
        companyId: props.dataOS.company !== undefined ? props.dataOS.company.id : '',
        companyTh: props.dataOS.company !== undefined ? props.dataOS.company.name : '',
        companyEn: props.dataOS.company !== undefined ? props.dataOS.company.nameEn : '',
        addressTh: props.dataOS.company !== undefined ? props.dataOS.company.address : '',
        addressEn: props.dataOS.company !== undefined ? props.dataOS.company.addressEn : '',
      },

      customer: {
        customerId: props.dataOS.customer !== undefined ? props.dataOS.customer.id : '',
        customerName: props.dataOS.customer !== undefined ? props.dataOS.customer.name : '',
        customerAddress: props.dataOS.customer !== undefined ? props.dataOS.customer.list[0].address : '',
        customerTel: props.dataOS.customer !== undefined ? props.dataOS.customer.list[0].phone : '',
        customerContact: props.dataOS.customer !== undefined ? props.dataOS.customer.list[0].contacts[0].name : '',
        customerFax: props.dataOS.customer !== undefined ? props.dataOS.customer.list[0].fax : '',
        creditTerm: props.dataOS.customer !== undefined ? props.dataOS.customer.creditTerm : '',
      },
      amount: props.dataOS.amount === null ? '' : props.dataOS.amount,
      code: props.dataOS.code,
      height: props.dataOS.height,
      isDeleted: props.dataOS.isDeleted,
      pallet: props.dataOS.pallet || '',
      receivingDate: props.dataOS.receivingDate === null ? '' : props.dataOS.receivingDate,
      sendingBy: props.dataOS.sendingBy,
      sendingName: props.dataOS.sendingName,
      sendingDate: props.dataOS.sendingDate === null ? '' : props.dataOS.sendingDate,
      status: props.dataOS.status,
      updatedAt: props.dataOS.updatedAt,
      updatedBy: props.dataOS.updatedBy,
      companyId: props.dataOS.companyId,
      companyCode: props.dataOS.companyCode,
      step: props.dataOS.productionPlanStep,
      cavity: props.dataOS.cavity,
      companyName: props.dataOS.companyName,
      productId: props.dataOS.productId,
      coatingValue: props.dataOS.coatingValue?.text,
      productCode: props.dataOS.productCode,
      productName: props.dataOS.productName,
      // productName: props.dataOS.productName.label,
      productionPlanStep: planOptions().find((j) => j.value === props.dataOS.productionPlanStep),
      bilVatName: props.dataOS.productName,
      productProcessType: props.dataOS.productProcessType,
      cuttingSize: props.dataOS.cuttingSize,
      productionOrderId: props.dataOS.productionOrderId,
      productionPlanId: props.dataOS.productionPlanId,
      productionOrderNo: props.dataOS.productionOrderNo,
      supplierCode: props.dataOS.supplierCode,
      supplierId: props.dataOS.supplierId,
      verifiedList: props.dataOS.verifiedList,
      supplierName: props.dataOS.supplierName,
      template: props.selectData.template,
      productCoating: props.dataOS.productCoating,
      templateData: props.selectData.templateData,
      warningData: props.selectData.warningData,
      cuttingData: props.selectData.cuttingData,
      colorManage: props.selectData.colorManage,
    };
  } else {
    initialState = {
      header: 'OUTSOURCE',
      logo: props.isDefaultCompany ? props.isDefaultCompany.logo : '/img/logo/KSP.logo.png',
      fileUpload: props.fileUpload ? props.fileUpload : '',
      company: {
        companyId: props.isDefaultCompany?.id,
        companyTh: props.isDefaultCompany?.name,
        companyEn: props.isDefaultCompany?.nameEn,
        addressTh: props.isDefaultCompany?.address,
        addressEn: props.isDefaultCompany?.addressEn,
      },

      customer: {
        customerName: '',
        customerAddress: '',
        customerTel: '',
        customerContact: '',
        customerFax: '',
        creditTerm: '',
      },
      productName: '',
      productId: '',
      step: '',
      productionOrderId: '',
      productionPlanId: '',
      sendingBy: '',
      supplierId: '',
      productCoating: '',
      amount: '',
      productProcessType: '',
      code: '',
      height: '',
      bilVatName: '',
      pallet: '',
      supplierName: '',
      sendingDate: '',
      receivingDate: '',
      coatingValue: '',
      template: props.selectData?.template,
      templateData: props.selectData?.templateData,
      warningData: props.selectData?.warningData,
      cuttingData: props.selectData?.cuttingData,
      colorManage: props.selectData?.colorManage,
      status: 'NEW',
    };
  }
  const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
      case 'setCompany':
        return { ...state, company: payload };
      case 'setLogo':
        return { ...state, logo: payload };
      case 'setSendingDate':
        return { ...state, sendingDate: payload };
      case 'setReceivingDate':
        return { ...state, receivingDate: payload };
      case 'setProduct':
        return { ...state, productId: payload };
      case 'setSupplier':
        return { ...state, supplierId: payload };
      case 'setStep':
        return { ...state, productionPlanStep: payload };
      case 'setSendingBy':
        return { ...state, sendingBy: payload };
      case 'setAmount':
        return { ...state, amount: payload };
      case 'setHeight':
        return { ...state, height: payload };
      case 'setPallet':
        return { ...state, pallet: payload };
      case 'setOrderNo':
        return { ...state, productionOrderId: payload };
      case 'setProcessType':
        return { ...state, productProcessType: payload };
      case 'setCuttingSize':
        return { ...state, cuttingSize: payload };
      case 'setFileUpload':
        return { ...state, fileUpload: payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  console.log(initialState);
  const { id, logo, company, status } = state;
  const createOutsourceFn = (outsource) => axios.post(`${SERVICE_URL}/outsource/save`, outsource).then((res) => res.data);
  const updateOutsourceFn = ({ osId, outsource }) =>
    axios
      .post(`${SERVICE_URL}/outsource/${osId}/save`, outsource, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => res.data);

  const { mutate: createOutsource, isLoading: isAdding } = useMutation(createOutsourceFn, {
    onSuccess(data) {
      console.debug('create outsource success :', data);
      goBack();
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('create outsource error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('AddOutsourceData');
    },
  });
  const { mutate: updateOutsource, isLoading: isSaving } = useMutation(updateOutsourceFn, {
    onSuccess(data) {
      console.debug('update outsource success :', data);
      props.setOnRefetch(true);
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      console.error('update outsource error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editCompanyData');
    },
  });

  const onSubmit = (formData) => {
    const data = {
      company: formData.company.companyId,
      product: formData.productId,
      productionOrder: formData.productionOrderId,
      supplier: formData.supplierId,
      amount: formData.amount,
      pallet: formData.pallet,
      height: formData.height,
      fileUpload: formData.fileUpload,
      sendingBy: formData.sendingBy,
      sendingDate: formData.sendingDate === '' ? '' : moment(formData.sendingDate).format('YYYY-MM-DD'),
      receivingDate: formData.receivingDate === '' ? '' : moment(formData.receivingDate).format('YYYY-MM-DD'),
      verifiedList: [
        {
          amount: '',
          date: '',
          result: 'NOTSELECT',
          remark: '',
        },
      ],
      status: formData.status,
    };

    if (id) {
      data.id = id;
      data.verifiedList = [
        {
          amount: outsourceData.verifiedList[0].amount,
          date: outsourceData.verifiedList[0].date,
          verifiedBy: outsourceData.verifiedList[0].verifiedBy,
          result: outsourceData.verifiedList[0].result,
          remark: outsourceData.verifiedList[0].remark,
        },
      ];
    }
    if (editPrint) {
      data.status = 'CONFIRM';
    }
    if (id) {
      // save
      setFileAlert(true);
      updateOutsource({ osId: id, outsource: data });
      props.setOnRefetch(true);
    } else {
      // create
      createOutsource(data);
    }
    props.setEditMode(false);
  };
  const formik = useFormik({ initialValues: initialState, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;
  const [template, setTemplate] = useState();
  const ToastCreateSuccess = () => {
    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'outsource.save.success' })}</span>
        </div>
      </>
    );
  };
  const onUploadFile = async (value) => {
    const formData = new FormData();
    formData.append('image', value);
    try {
      await axios
        .post(`${SERVICE_URL}/content/upload`, formData, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          const { imageUrl } = res.data.data;
          setFileAlert(false);
          handleChange({ target: { id: 'fileUpload', value: imageUrl } });
          dispatch({ type: 'setFileUpload', payload: imageUrl });
        });
    } catch (err) {
      console.log(err);
    }
  };
  const handleSelectCompany = (e) => {
    if (e !== null) {
      const { logo: logoData } = e.detail;
      const companyData = {
        companyId: e.detail.id,
        companyTh: { label: e.detail.name, value: e.detail.name },
        companyEn: e.detail.nameEn,
        addressTh: e.detail.address,
        addressEn: e.detail.addressEn,
      };
      handleChange({ target: { id: 'company', value: companyData } });
      handleChange({ target: { id: 'logo', value: logoData } });
      dispatch({ type: 'setCompany', payload: companyData });
      dispatch({ type: 'setLogo', payload: logoData });
    } else {
      const companyData = {
        companyTh: '',
        companyEn: '',
        addressTh: '',
        addressEn: '',
      };
      handleChange({ target: { id: 'company', value: companyData } });
      handleChange({ target: { id: 'logo', value: '' } });
      dispatch({ type: 'setCompany', payload: companyData });
      dispatch({ type: 'setLogo', payload: '' });
    }
  };
  const handleChangeAmount = (event) => {
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      handleChange({ target: { id: 'amount', value: event.target.value } });
    }
  };
  const onInputAmount = (event) => {
    const amount = parseInt(event.target.value || 0, 10);
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      dispatch({ type: 'setAmount', payload: amount });
    }
  };
  const onInputHeight = (event) => {
    const height = event.target.value;
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      dispatch({ type: 'setHeight', payload: height });
    }
  };
  const onInputPallet = (event) => {
    const pallet = event.target.value;
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      dispatch({ type: 'setPallet', payload: pallet });
    }
  };
  const handleSelectSupplier = (value) => {
    if (value !== null) {
      const supplier = value.value;
      handleChange({ target: { id: 'supplierId', value: supplier } });
      dispatch({ type: 'setSupplier', payload: supplier });
    } else {
      const supplier = '';
      handleChange({ target: { id: 'supplierId', value: supplier } });
      dispatch({ type: 'setSupplier', payload: supplier });
    }
  };
  const handleSelectStep = (value) => {
    if (value !== null) {
      const step = value.value;
      handleChange({ target: { id: 'productionPlanStep', value: step } });
      dispatch({ type: 'setStep', payload: step });
    } else {
      const step = '';
      handleChange({ target: { id: 'productionPlanStep', value: step } });
      dispatch({ type: 'setStep', payload: step });
    }
  };
  const handleSelectProduct = async (value) => {
    let bilVatName = '';
    let productionOrderNo = '';
    let productProcessType = '';
    let productId = '';
    let cuttingSize = '';
    let productionOrderId = '';
    if (value !== null) {
      const resultOutsourceProduct = await props.searchOutsourceProduct(value.detail.productId);
      productProcessType = `${resultOutsourceProduct.data.coatingMethod[0]?.text} - ${resultOutsourceProduct.data.coatingMethod[1]?.text}`;
      bilVatName = value.label;
      productionOrderId = value.detail.productionOrderId;
      productionOrderNo = value.detail.productionOrderNo;
      productId = value.detail.productId;
      cuttingSize = `${value.detail.productCuttingSize.width} x ${value.detail.productCuttingSize.length}`;
    }
    handleChange({ target: { id: 'bilVatName', value: bilVatName } });
    handleChange({ target: { id: 'productionOrderNo', value: productionOrderNo } });
    handleChange({ target: { id: 'productProcessType', value: productProcessType } });
    handleChange({ target: { id: 'productionOrderId', value: productionOrderId } });
    handleChange({ target: { id: 'cuttingSize', value: cuttingSize } });
    dispatch({ type: 'setOrderNo', payload: productionOrderNo });
    dispatch({ type: 'setCuttingSize', payload: cuttingSize });
    dispatch({ type: 'setProcessType', payload: productProcessType });
    dispatch({ type: 'setProduct', payload: productId });
    if (value !== null) {
      handleChange({ target: { id: 'productId', value: value.value } });
    } else {
      handleChange({ target: { id: 'productId', value: '' } });
    }
  };

  const handleSelectSending = (value) => {
    if (value !== null) {
      const sendingBy = value.value;
      handleChange({ target: { id: 'sendingBy', value: sendingBy } });
      dispatch({ type: 'setSendingBy', payload: sendingBy });
    } else {
      const sendingBy = '';
      handleChange({ target: { id: 'sendingBy', value: sendingBy } });
      dispatch({ type: 'setSendingBy', payload: sendingBy });
    }
  };
  const handleSelectTemplate = (value) => {
    setTemplate(value);
    if (status !== 'NEW') props.setTemplatePrint(value);
  };
  const onSetReceivingDate = (e) => {
    if (e === '1970/01/01 07:00') {
      handleChange({ target: { id: 'receivingDate', value: '' } });
    } else {
      handleChange({ target: { id: 'receivingDate', value: e } });
    }
    dispatch({ type: 'setReceivingDate', payload: e });
  };
  const onSetSendingDate = (e) => {
    if (e === '1970/01/01 07:00') {
      handleChange({ target: { id: 'sendingDate', value: '' } });
    } else {
      handleChange({ target: { id: 'sendingDate', value: e } });
    }
    dispatch({ type: 'setSendingDate', payload: e });
  };
  const handleChangeHeight = (event) => {
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      handleChange({ target: { id: 'height', value: event.target.value } });
    }
  };
  const handleChangePallet = (event) => {
    if (/^[0-9.]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      handleChange({ target: { id: 'pallet', value: event.target.value } });
    }
  };
  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    if (e.target.files[0].size > 1000000) {
      setSelectedFile(undefined);
      setFileSizeAlert(true);
    } else {
      onUploadFile(e.target.files[0]);
      setSelectedFile(e.target.files[0]);
      setFileSizeAlert(false);
    }
  };

  const getTotalIndex = () => {
    let counter = 1;
    const warning = [];
    for (let i = 0; i < values.warningData?.length; i += 1) {
      if (template?.value === values.warningData[i].linkId && values.warningData[i].isDeleted === false) {
        warning[i] = (
          <tr>
            <td className="blank" style={{ color: 'red' }}>
              {`${counter}. ${values.warningData[i].name}`}
            </td>
          </tr>
        );
        counter += 1;
      }
    }
    return warning;
  };
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    if (status !== 'NEW') {
      props.setPreview(objectUrl);
    }

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);
  useEffect(() => {
    props.setOutsourceData(state);
  }, [state]);
  useEffect(() => {
    setOutsourceData(state);
    if (props.handleSaveClick) {
      handleSubmit();
      // resetForm();
    }
    if (props.verifiedPrint) {
      if (values.fileUpload === '') {
        setFileAlert(true);
      }
      setEditPrint(true);
      handleSubmit();
      props.setEditMode(true);
      props.setIsDeleteModalOpen(false);
      props.setVerifiedPrint(false);
      // resetForm();
    }
    props.setSaveClick(false);
  }, [props.handleSaveClick, props.verifiedPrint]);
  return (
    <>
      <div id="template" className="bg-white">
        {/* <Select
          classNamePrefix="react-select"
          options={values.templateData}
          id="select-template"
          placeholder="Select Template Here..."
          onChange={handleSelectTemplate}
        /> */}
        <LovTemplateSelect
          id="select-template"
          name="template"
          isClearable
          onChange={handleSelectTemplate}
          value={template}
          // isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
        />
      </div>
      <div ref={ref} className="bg-white" id="page-wrap">
        <div className="d-flex flex-row w-100 align-items-center mb-4">
          <div style={{ width: '23%' }}>
            <img src={logo} alt="logo" style={{ width: '160px', objectFit: 'contain', marginRight: '10px' }} />
          </div>
          <div style={{ width: '55%' }} id="style-select">
            <LovCompanySelect
              name="company"
              isClearable
              // lov="customer"
              value={values.company.companyId}
              onChange={handleSelectCompany}
              isDisabled={!props.isEditMode}
            />
            <div style={{ width: '100%', height: '30px', fontSize: '18px', fontWeight: '900' }}>{company.companyEn}</div>
            <div style={{ width: '100%', height: '17px' }} id="addressTh">
              {company.addressTh}
            </div>
            <div style={{ width: '100%', height: '17px' }} id="addressEn">
              {company.addressEn}
            </div>
            <div style={{ width: '100%', height: '17px' }} id="tel">
              {company.tel}
            </div>
          </div>
        </div>
        <div className="d-flex flex-row w-100 align-items-center mb-4">
          <section className="scroll-section mb-3" id="images">
            {/* <Card body className="mb-5">
            <DropzoneImages />
          </Card> */}
            <Col sm="12" md="12" lg="7" style={{ alignItems: 'center' }} className="mb-2">
              {/* {preview !== undefined && ( */}
              {preview !== undefined || values.fileUpload !== '' ? (
                <img
                  src={preview !== undefined ? preview : values.fileUpload}
                  // className="rounded-md pt-2 ms-3"
                  alt="thumb"
                  style={{ width: '46rem', height: '26rem', objectFit: 'contain', alignItems: 'center' }}
                />
              ) : (
                <CsLineIcons icon="image" width="46rem" height="26rem" className="cs-icon icon me-3 align-middle" style={{ opacity: 0.03 }} />
              )}
              {/* )} */}
            </Col>
            {props.isEditMode && (
              <Col sm="12" md="12" lg="7">
                {/* <div className="h5 mb-0 font-weight-600 p-2">Upload new file</div> */}
                <button className="border-0 bg-white pb-2" type="button" style={{ borderRadius: '10px' }}>
                  <input
                    disabled={!props.isEditMode}
                    onChange={onSelectFile}
                    id="file-upload"
                    className="hidden form-control"
                    accept="image/jpeg, image/bmp, image/pmg, image/png"
                    type="file"
                  />
                </button>
                <Button
                  className="btn-icon btn-icon-only"
                  disabled={preview === undefined}
                  variant="outline-danger"
                  onClick={() => {
                    setFileAlert(true);
                    handleChange({ target: { id: 'fileUpload', value: '' } });
                    dispatch({ type: 'setFileUpload', payload: '' });
                    setPreview(undefined);
                  }}
                >
                  <CsLineIcons icon="bin" />
                </Button>
                {fileAlert || preview === undefined ? (
                  <div className="text-muted">
                    <span className="text-danger  p-2">Upload file before print.</span>
                  </div>
                ) : (
                  <div className="text-muted">
                    <span className="text-info p-2">The maximum file size allowed is 1MB.</span>
                  </div>
                )}
                {/* {errors.fileUpload && <div className="d-block invalid-feedback">{f({ id: errors.fileUpload })}</div>} */}
              </Col>
            )}
            {/* <input style={{align: 'center',}} type="file" multiple accept='image/*' onChange={imgOnChange}/> */}
            {/* {imageURLs.map((imageSrc,idx)=>(
                      <img alt="description of image" key={idx} width = "640" height="360" src = {imageSrc}/>
                    ))} */}
          </section>
        </div>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col xs={12} md={12} className="mb-2">
              <Form.Label>{f({ id: 'dailyPlan.field.name' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="productSelect">
                <div id="selectHide">
                  <LovOutsourceSelect
                    name="productId"
                    isClearable
                    lov="PRODUCT_TYPE"
                    onChange={handleSelectProduct}
                    value={values.productId || ''}
                    isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
                  />
                </div>
              </Form.Group>
              {errors.productId && touched.productId && <div className="d-block invalid-feedback">{f({ id: errors.productId })}</div>}
            </Col>
            <Col xs={12} md={12} className="mb-2">
              <Form.Label>{f({ id: 'outsource.field.bilVat' })}</Form.Label>
              <input name="bilVatName" value={values.bilVatName} disabled className="form-control" />
            </Col>
            <Col xs={12} md={8} className="mb-2">
              <Row>
                <Col xs={12} md={6} className="mb-0">
                  <Form.Label>{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                  <input name="productionOrderNo" value={values.productionOrderNo} disabled className="form-control" />
                </Col>
                <Col xs={12} md={6} className="mb-0">
                  <Form.Label>{f({ id: 'outsource.field.sendTo' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="supplierId">
                    <div id="selectHide">
                      <LovSupplierSelect
                        name="supplierId"
                        isClearable
                        placeholder="กรุณาเลือกชื่อบริษัท"
                        onChange={handleSelectSupplier}
                        value={values.supplierId || ''}
                        isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
                      />
                    </div>
                  </Form.Group>
                  {errors.supplierId && touched.supplierId && <div className="d-block invalid-feedback">{f({ id: errors.supplierId })}</div>}
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={12} className="mb-0">
                  <Form.Label>{f({ id: 'outsource.field.jobChar' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="supplierId">
                    <div id="selectHide">
                      <Form.Control
                        name="coatingValue"
                        value={values.coatingValue || ''}
                        disabled
                        // disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.print_size' })}</Form.Label>
                  <input name="cuttingSize" value={values.cuttingSize} disabled className="form-control" />
                </Col>
                <Col xs={12} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'receiving.list.amountDeliver' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="amount">
                    <Form.Control
                      name="amount"
                      type="number"
                      value={values.amount}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      isInvalid={errors.amount && touched.amount}
                      onChange={handleChangeAmount}
                      onInput={onInputAmount}
                    />
                    {errors.amount && touched.amount && <div className="d-block invalid-feedback">{f({ id: errors.amount })}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.palletAmount' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="pallet">
                    <Form.Control
                      name="pallet"
                      type="text"
                      value={values.pallet}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      onChange={handleChangePallet}
                      isInvalid={errors.pallet && touched.pallet}
                      onInput={onInputPallet}
                    />
                  </Form.Group>
                  {errors.pallet && touched.pallet && <div className="d-block invalid-feedback">{f({ id: errors.pallet })}</div>}
                </Col>
                <Col xs={12} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'product.height' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="height">
                    <Form.Control
                      name="height"
                      type="text"
                      value={values.height || ''}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      isInvalid={errors.height && touched.height}
                      onChange={handleChangeHeight}
                      onInput={onInputHeight}
                    />
                    {errors.height && touched.height && <div className="d-block invalid-feedback">{f({ id: errors.height })}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.receivingDate' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="sendingDate">
                    <DatepickerThaiYearTime
                      className="form-control"
                      value={values.sendingDate}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      onChange={(e) => onSetSendingDate(e)}
                      format="DD/MM/YYYY HH:mm"
                      plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                    />
                    {errors.sendingDate && touched.sendingDate && <div className="d-block invalid-feedback">{f({ id: errors.sendingDate })}</div>}
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.receivedDate' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="receivingDate">
                    <DatepickerThaiYearTime
                      className="form-control"
                      value={values.receivingDate}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      onChange={(e) => onSetReceivingDate(e)}
                      format="DD/MM/YYYY HH:mm"
                      plugins={[<TimePicker position="bottom" key="time" hideSeconds />]}
                    />
                    {errors.receivingDate && touched.receivingDate && <div className="d-block invalid-feedback">{f({ id: errors.receivingDate })}</div>}
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col xs={12} md={4} className="mb-2">
              <Table borderless ref={h} id="items" style={{ marginTop: '0', verticalAlign: 'middle' }}>
                <tbody>
                  <tr>
                    <td className="blank" style={{ color: 'red' }}>
                      **{f({ id: 'outsource.field.warning' })}**
                    </td>
                  </tr>
                  {getTotalIndex()}
                </tbody>
              </Table>
            </Col>
            <Col xs={12} md={12} className="mb-2">
              <Form.Label>{f({ id: 'outsource.field.sendName' })}</Form.Label>
              <Form.Group className="position-relative tooltip-end-top" controlId="sendingName">
                <div id="selectHide">
                  <LovEmployeeSelect
                    name="sendingBy"
                    isClearable
                    placeholder="กรุณาเลือกชื่อผู้ส่ง"
                    onChange={handleSelectSending}
                    value={values.sendingBy || ''}
                    isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
                  />
                </div>
                {errors.sendingBy && touched.sendingBy && <div className="d-block invalid-feedback">{f({ id: errors.sendingBy })}</div>}
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
});

export default OutsourceCard;
