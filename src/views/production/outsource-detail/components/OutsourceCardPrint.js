import React, { useEffect, useReducer, useRef, useState } from 'react';
import './stylePrint.css';
import { Col, Row, Form, Card, Table } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';

import LovOutsourceSelect from 'components/lov-select/LovOutsourceSelect';
import LovSupplierSelect from 'components/lov-select/LovSupplierSelect';
import LovEmployeeSelect from 'components/lov-select/LovEmployeeSelect';
import DatepickerThaiYearTime from 'components/forms/controls/datepicker/DatepickerThaiYearTime';
import DatePicker from 'react-multi-date-picker';
import AutocompleteCompany from './AutocompleteCompany';

const OutsourceCardPrint = React.forwardRef((props, ref) => {
  const h = useRef();
  const { formatMessage: f } = useIntl();

  let initialState = {};
  if (props.dataOS !== undefined) {
    initialState = {
      header: 'OUTSOURCE',
      id: props.dataOS.id !== undefined ? props.dataOS.id : '',
      logo: props.dataOS.company !== undefined ? props.dataOS.company.logo : '/img/logo/KSP.logo.png',
      fileUpload: props.dataOS.fileUpload !== undefined ? props.dataOS.fileUpload : '/img/logo/KSP.logo.png',
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
      companyName: props.dataOS.companyName,
      productId: props.dataOS.productId,
      productCode: props.dataOS.productCode,
      productName: props.dataOS.productName,
      // productName: props.dataOS.productName.label,
      bilVatName: props.dataOS.productName,
      productProcessType: props.dataOS.productProcessType,
      cuttingSize: props.dataOS.cuttingSize,
      productionOrderId: props.dataOS.productionOrderId,
      productionOrderNo: props.dataOS.productionOrderNo,
      supplierCode: props.dataOS.supplierCode,
      supplierId: props.dataOS.supplierId,
      verifiedList: props.dataOS.verifiedList,
      supplierName: props.dataOS.supplierName,
      template: props.selectData?.template,
      productCoating: props.dataOS.productCoating,
      templateData: props.selectData?.templateData,
      warningData: props.selectData?.warningData,
      cuttingData: props.selectData?.cuttingData,
      colorManage: props.selectData?.colorManage,
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
      productionOrderId: '',
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
      case 'setSendingDate':
        return { ...state, sendingDate: payload };
      case 'setReceivingDate':
        return { ...state, receivingDate: payload };
      case 'setProduct':
        return { ...state, productId: payload };
      case 'setSupplier':
        return { ...state, supplierId: payload };
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

  const { id, logo, company, status } = state;

  const formik = useFormik({ initialValues: initialState, enableReinitialize: true });
  const { values, touched, errors } = formik;
  // const [template, setTemplate] = useState();

  const getTotalIndex = () => {
    let counter = 1;
    const warning = [];
    for (let i = 0; i < values.warningData?.length; i += 1) {
      if (props.templatePrint?.value === values.warningData[i].linkId && values.warningData[i].isDeleted === false) {
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

  return (
    <>
      <div ref={ref} className="bg-white" id="page-wrap-print">
        <div className="d-flex flex-row w-100 align-items-center">
          <div style={{ width: '23%' }}>
            <img src={logo} alt="logo" style={{ width: '160px', objectFit: 'contain', marginRight: '10px' }} />
          </div>
          <div style={{ width: '55%' }} id="identity">
            <AutocompleteCompany value={company.companyTh || ''} initialValue={company.companyTh} inputProps={{ required: true }} />
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
        <div style={{ marginBottom: '1.44rem' }}>
          <section className="scroll-section" id="images">
            {/* <Card body className="mb-5">
            <DropzoneImages />
          </Card> */}
            <Col sm="12" md="12" lg="7" style={{ alignItems: 'center' }}>
              {/* {preview !== undefined && ( */}
              <img
                src={props.preview !== undefined ? props.preview : values.fileUpload}
                // className="rounded-md pt-2 ms-3"
                alt="thumb"
                style={{ width: '46rem', height: '26rem', objectFit: 'contain', alignItems: 'center' }}
              />
              {/* )} */}
            </Col>
            {/* <input style={{align: 'center',}} type="file" multiple accept='image/*' onChange={imgOnChange}/> */}
            {/* {imageURLs.map((imageSrc,idx)=>(
                      <img alt="description of image" key={idx} width = "640" height="360" src = {imageSrc}/>
                    ))} */}
          </section>
        </div>
        <Form>
          <Row>
            <Col xs={7} md={7}>
              <Row>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={11} md={11} className="mb-2">
                  <Form.Label>{f({ id: 'dailyPlan.field.name' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="productSelect">
                    <div id="selectHide">
                      <LovOutsourceSelect
                        name="productId"
                        isClearable
                        lov="PRODUCT_TYPE"
                        placeholder="กรุณาเลือกชื่อสินค้า"
                        value={values.productId || ''}
                        isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={11} md={11} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.bilVat' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="productSelect">
                    <input name="bilVatName" value={values.bilVatName} disabled className="form-control" />
                  </Form.Group>
                </Col>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={11} md={11} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.sendTo' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="supplierId">
                    <div id="selectHide">
                      <LovSupplierSelect
                        name="supplierId"
                        isClearable
                        placeholder="กรุณาเลือกชื่อบริษัท"
                        value={values.supplierId || ''}
                        isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
                      />
                    </div>
                  </Form.Group>
                  {errors.supplierId && touched.supplierId && <div className="d-block invalid-feedback">{f({ id: errors.supplierId })}</div>}
                </Col>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={11} md={11} className="mb-2">
                  <Form.Label>{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                  <input name="productionOrderNo" value={values.productionOrderNo} disabled className="form-control" />
                </Col>
              </Row>
              <Row>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={5} md={6} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.jobChar' })}</Form.Label>
                  <input name="productProcessType" value={values.productProcessType} disabled className="form-control" />
                </Col>
                <Col xs={5} md={5} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.print_size' })}</Form.Label>
                  <input name="cuttingSize" value={values.cuttingSize} disabled className="form-control" />
                </Col>
              </Row>
              <Row>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={4} md={4} className="mb-2">
                  <Form.Label>{f({ id: 'receiving.list.amount' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="amount">
                    <Form.Control
                      name="amount"
                      type="number"
                      value={values.amount}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      isInvalid={errors.amount && touched.amount}
                    />
                    {errors.amount && touched.amount && <div className="d-block invalid-feedback">{f({ id: errors.amount })}</div>}
                  </Form.Group>
                </Col>
                <Col xs={3} md={3} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.palletAmount' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="pallet">
                    <Form.Control
                      name="pallet"
                      type="text"
                      value={values.pallet}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      isInvalid={errors.pallet && touched.pallet}
                    />
                  </Form.Group>
                  {errors.pallet && touched.pallet && <div className="d-block invalid-feedback">{f({ id: errors.pallet })}</div>}
                </Col>
                <Col xs={4} md={4} className="mb-2">
                  <Form.Label>{f({ id: 'product.height' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="height">
                    <Form.Control
                      name="height"
                      type="text"
                      value={values.height || ''}
                      disabled={(status !== 'NEW' || id) && !props.isEditMode}
                      isInvalid={errors.height && touched.height}
                    />
                    {errors.height && touched.height && <div className="d-block invalid-feedback">{f({ id: errors.height })}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={1} md={1}>
                  {' '}
                </Col>
                <Col xs={4} md={4} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.sendName' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="sendingName">
                    <div id="selectHide">
                      <LovEmployeeSelect
                        name="sendingBy"
                        isClearable
                        placeholder="กรุณาเลือกชื่อผู้ส่ง"
                        value={values.sendingBy || ''}
                        isDisabled={(status !== 'NEW' || id) && !props.isEditMode}
                      />
                    </div>
                    {errors.sendingBy && touched.sendingBy && <div className="d-block invalid-feedback">{f({ id: errors.sendingBy })}</div>}
                  </Form.Group>
                </Col>
                <Col xs={4} md={4} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.receivingDate' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="receivingDate">
                    <DatePicker format="DD/MM/YYYY HH:mm" value={values.sendingDate} />
                  </Form.Group>
                </Col>
                <Col xs={3} md={3} className="mb-2">
                  <Form.Label>{f({ id: 'outsource.field.receivedDate' })}</Form.Label>
                  <Form.Group className="position-relative tooltip-end-top" controlId="receivedDate">
                    <DatePicker format="DD/MM/YYYY HH:mm" value={values.receivingDate} />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col xs={5} md={5}>
              <Row>
                <Col xs={12} md={12}>
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
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
});

export default OutsourceCardPrint;
