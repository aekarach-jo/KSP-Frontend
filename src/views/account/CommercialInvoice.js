import React, { useReducer, useState } from 'react';
import './style.css';
import moment from 'moment';

const CommercialInvoice = React.forwardRef((props, ref) => {
  console.log(props.dataPo.supplierId);
  const [supplier, setSupplier] = useState(props.dataPo.supplierId);

  const address = supplier.list?.map((data) => data.address);

  const initialState = {
    // header: 'INVOICE',
    companyTh: supplier.name,
    companyEn: 'K S P Printing And Packaging Co,. Ltd.  :Mock',
    addressTh: address[0],
    addressEn: `57/19 Moo. 15 T.Bangmuang A.Bangyai Nontaburi 11140 Tel. 0-2403-4623-4 Fax. 0-2403-4599  :Mock`,
    title: `ใบสั่งซื้อ/Perchase Order`,
    vender: 'บจก. ที เอส ที เปเปอร์  :Mock',
    invoiceNo: supplier.code,
    date: moment(supplier.createdAt).add(543, 'year').format('DD/MM/YYYY'),
    email: 'ksp.printing@gmail.com  :Mock',
    paid: 0,
    note: 'NET 30 Days. Finance Charge of 1.5% will be made on unpaid balances after 30 days.',
    // dataTable: props.dataPo.detail,
    dataTable: [
      {
        id: '1',
        item: 1,
        type: 'PI',
        amount: 50,
        purchaseItem: '630128397b97e1ebee28e231',
        code: 'RM-00002',
        name: 'กล่องแป้งบางเลนหลังขาว 500 แกรม 31.00*43.00 นิ้ว',
        unit: '',
        availableAmount: 160,
        price: 105,
        qty: 1,
      },
      {
        id: '2',
        item: 2,
        type: 'PI',
        amount: 120,
        purchaseItem: '630128397b97e1ebee28e232',
        code: 'RM-00003',
        name: 'กล่องแป้งบางเลนหลังขาว 800 แกรม ',
        unit: '',
        availableAmount: 200,
        price: 75,
        qty: 3,
      },
      {
        id: '3',
        item: 3,
        type: 'MAT',
        amount: 20,
        material: '6353cc25dbe090c64c3b76ce',
        code: 'RM-20221022',
        name: 'กล่องแป้งหลังขาว DH 350g #31x43 edit',
        unit: '',
        price: 35,
        qty: 20,
      },
      {
        id: '4',
        item: 4,
        type: 'PI',
        amount: 120,
        purchaseItem: '630128397b97e1ebee28e232',
        code: 'RM-00003',
        name: 'กล่องแป้งบางเลนหลังขาว 800 แกรม ',
        unit: '',
        availableAmount: 200,
        price: 124,
        qty: 5,
      },
      {
        id: '5',
        item: 5,
        type: 'MAT',
        amount: 20,
        material: '6353cc25dbe090c64c3b76ce',
        code: 'RM-20221022',
        name: 'กล่องแป้งหลังขาว DH 350g #31x43 edit',
        unit: '',
        price: 28,
        qty: 250,
      },
      {
        id: '6',
        item: 6,
        type: 'MAT',
        amount: 20,
        material: '6353cc25dbe090c64c3b76ce',
        code: 'RM-20221022',
        name: 'กล่องแป้งหลังขาว DH 800g #80x95 ',
        unit: '',
        price: 45,
        qty: 59,
      },
      {
        id: '7',
        item: 7,
        type: 'MAT',
        amount: 20,
        material: '6353cc25dbe090c64c3b76ce',
        code: 'RM-20221022',
        name: 'กล่องแป้งหลังขาว DH 1500g #54x67 ',
        unit: '',
        price: 110,
        qty: 300,
      },
    ],
    total: 0,
  };

  const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
      case 'setHeader':
        return { ...state, header: payload };
      case 'setCompanyTh':
        return { ...state, companyTh: payload };
      case 'setCompanyEn':
        return { ...state, companyEn: payload };
      case 'setAddressTh':
        return { ...state, addressTh: payload };
      case 'setAddressEn':
        return { ...state, addressEn: payload };
      case 'setTitle':
        return { ...state, title: payload };
      case 'setVender':
        return { ...state, vender: payload };
      case 'setInvoiceNo':
        return { ...state, invoiceNo: payload };
      case 'setDate':
        return { ...state, date: payload };
      case 'setEmail':
        return { ...state, email: payload };
      case 'setPaid':
        return { ...state, paid: payload };
      case 'setNote':
        return { ...state, note: payload };
      case 'setDataTable':
        return { ...state, dataTable: payload };
      case 'setTotal':
        return { ...state, total: payload };
      case 'setNumber':
        return { ...state, number: payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const updateItem = (id, itemAttributes) => {
    const { dataTable } = state;
    const index = dataTable.findIndex((x) => x.id === id);
    if (index === -1) {
      console.error("Something wen't wrong");
    } else {
      console.log(dataTable[index]);
      const data = [...dataTable.slice(0, index), Object.assign(dataTable[index], itemAttributes), ...dataTable.slice(index + 1)];
      dispatch({ type: 'setDataTable', payload: data });
    }
  };

  const getTotal = () => {
    let t = 0;
    const { dataTable } = state;
    for (let i = 0; i < dataTable.length; i += 1) {
      t += dataTable[i].price * dataTable[i].qty;
    }
    return t;
  };
  const getVat = () => {
    let t = 0;
    let sum = 0;
    const { dataTable } = state;
    for (let i = 0; i < dataTable.length; i += 1) {
      t += dataTable[i].price * dataTable[i].qty;
      sum = (t * 7) / 100;
      sum += t;
    }
    if (/^[\d]+$/.test(sum)) {
      console.log(sum);
    }
    return sum;
  };

  const handleChange = (name) => (event) => {
    const stateType = `set${name.charAt(0).toUpperCase() + name.slice(1)}`;
    dispatch({ type: stateType, payload: event.target.value });
  };

  const handleChangeTable = (name, id) => (event) => {
    updateItem(id, { [name]: event.target.value });
  };

  const handleChangePrice = (name, id) => (event) => {
    if (/^[\d]+$/.test(event.target.value.trim()) || event.target.value === '' || event.target.value === ' ') {
      console.log(event.target.value);
      updateItem(id, { [name]: event.target.value });
    }
  };

  const { dataTable, companyTh, companyEn, addressTh, addressEn, invoiceNo, vender, date, email, title, paid } = state;

  const getRow = (dataArray) => {
    return dataArray.map((data, index) => (
      <tr className="item-row" key={index.toString()}>
        <td className="item-num">
          <input value={data.item} readOnly />
        </td>
        <td className="item-code">
          <input value={data.code} onChange={handleChangeTable('code', data.id)} />
        </td>
        <td className="item-description">
          <input value={data.name} onChange={handleChangeTable('name', data.id)} />
        </td>
        <td className="item-quantity">
          <input value={data.qty} onChange={handleChangePrice('qty', data.id)} />
        </td>
        <td className="item-unit">
          <div className="text-center">R</div>
          {/* <input value="R" readOnly /> */}
        </td>
        <td className="item-price-unit">
          <input value={data.price} onChange={handleChangePrice('price', data.id)} />
        </td>
        <td className="item-amount">
          <div readOnly className="price text-center" value={data.qty * data.price}>
            {data.qty * data.price}
          </div>
        </td>
      </tr>
    ));
  };
  return (
    <div ref={ref}>
      <div className="bg-white" id="page-wrap">
        {/* <textarea id="header" value={header} onChange={handleChange('header')} /> */}
        {/* <div className="d-flex flex-column justify-content-between"> */}
          <div>
            <div style={{ height: '4rem' }} />
            <div id="identity">
              <textarea
                style={{
                  width: '100%',
                  height: '30px',
                  fontSize: '22px',
                  fontWeight: '900',
                }}
                id="companyTh"
                value={companyTh}
                onChange={handleChange('companyTh')}
              />
              <textarea
                style={{
                  width: '100%',
                  height: '34px',
                  fontSize: '22px',
                  fontWeight: '700',
                }}
                id="companyEn"
                value={companyEn}
                onChange={handleChange('companyEn')}
              />
              <textarea style={{ width: '100%', height: '17px' }} id="addressTh" value={addressTh} onChange={handleChange('addressTh')} />
              <textarea style={{ width: '100%' }} id="addressEn" value={addressEn} onChange={handleChange('addressEn')} />
              {/* <textarea style={{ width: '100%' }} id="email" value={email} onChange={handleChange('email')} /> */}
              {/* <div id="logo">
            <img id="image" src="/images/print_logo.jpg" alt="logo" />
          </div> */}
            </div>
            <textarea
              style={{
                textAlign: 'center',
                width: '100%',
                height: '30px',
                fontSize: '19px',
                fontWeight: '900',
              }}
              id="companyTh"
              value={title}
              onChange={handleChange('title')}
            />
            <table id="items-detail" style={{ marginTop: '0' }}>
              <tbody style={{ border: 'none', verticalAlign: 'top' }}>
                <tr style={{ width: '100%' }}>
                  <td style={{ fontSize: '15px', border: 'none', width: '20%' }}>ชื่อผู้ชาย/Vender</td>
                  <td style={{ fontSize: '15px', border: 'none', width: '30%' }}>
                    <textarea style={{ width: '100%', height: '22px' }} onChange={handleChange('vender')} value={vender} />
                  </td>
                  <td style={{ border: 'none', width: '15%' }}>เลขที่ใบสั่งซื้อ</td>
                  <td style={{ border: 'none', width: '25%' }}>
                    <textarea style={{ width: '100%', height: '17px' }} onChange={handleChange('invoiceNo')} value={invoiceNo} />
                  </td>
                </tr>
                <tr style={{ width: '100%' }}>
                  <td style={{ fontSize: '15px', border: 'none', width: '20%' }}>ที่อยู่/Address</td>
                  <td style={{ fontSize: '15px', border: 'none', width: '30%' }}>
                    3601/225-6 ตรอกนอกเขต ถ.สุดประเสริฐ แขวงบางโคล่ เขตบางคอแหลม กรุงเทพฯ 10120
                    {/* <textarea
                  style={{ width: "100%", height: "17px" }}
                  onChange={handleChange("vender")}
                  value={vender}
                /> */}
                  </td>
                  <td style={{ border: 'none', width: '15%' }}>วันที่</td>
                  <td style={{ border: 'none', width: '25%' }}>
                    <textarea style={{ width: '100%', height: '17px' }} onChange={handleChange('date')} value={date} />
                  </td>
                </tr>
                <tr style={{ width: '100%' }}>
                  <td style={{ fontSize: '15px', border: 'none', width: '20%' }}>โทรศัพท์/Tel.</td>
                  <td style={{ fontSize: '15px', border: 'none', width: '30%' }}>
                    0-2291-2291 0-2291-2291
                    {/* <textarea
                  style={{ width: "100%", height: "17px" }}
                  onChange={handleChange("vender")}
                  value={vender}
                /> */}
                  </td>
                  <td style={{ border: 'none', width: '15%' }}>
                    แฟกซ์/Fax.
                    {/* <textarea
                  style={{ width: "100%", height: "17px" }}
                  onChange={handleChange("date")}
                  value={date}
                /> */}
                  </td>
                  <td style={{ fontSize: '15px', border: 'none', width: '25%' }}>0-2291-2291</td>
                </tr>
                <tr style={{ width: '100%' }}>
                  <td style={{ fontSize: '15px', border: 'none', width: '20%' }}>เรียน/Attn.</td>
                  <td style={{ fontSize: '15px', border: 'none', width: '30%' }}>
                    คุณบอย
                    {/* <textarea
                  style={{ width: "100%", height: "17px" }}
                  onChange={handleChange("vender")}
                  value={vender}
                /> */}
                  </td>
                  <td style={{ border: 'none', width: '15%' }}>
                    Email :{' '}
                    {/* <textarea
                  style={{ width: "100%", height: "17px" }}
                  onChange={handleChange("date")}
                  value={date}
                /> */}
                  </td>
                  <td style={{ fontSize: '15px', border: 'none', width: '25%' }}>
                    <textarea style={{ width: '100%', height: '19px' }} onChange={handleChange('email')} value={email} />
                  </td>
                </tr>
              </tbody>
            </table>
            <table id="items" style={{ marginTop: '0', verticalAlign: 'middle' }}>
              <thead>
                <tr>
                  <th className="th-col">
                    <div>ลำดับ</div>
                    <div>ITEM</div>
                  </th>
                  <th className="th-col">
                    <div>รหัสสินค้า</div>
                    <div>PRODUCT CODE</div>
                  </th>
                  <th className="th-col">
                    <div>รายการ</div>
                    <div>DESCRIPTION</div>
                  </th>
                  <th className="th-col">
                    <div>จำนวน</div>
                    <div>QUANTITY</div>
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
                    <div>AMOUNT</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {getRow(dataTable)}
                <tr>
                  <td colSpan="4" className="blank">
                    &nbsp;
                  </td>
                  <td colSpan="2" className="total-line">
                    รวมเป็นเงิน
                  </td>
                  <td className="total-value">
                    <div id="subtotal">{getTotal()}</div>
                  </td>
                </tr>

                <tr>
                  <td colSpan="2" className="total-line">
                    <div>กำหนดส่งมอบวันที่</div>
                  </td>
                  <td colSpan="1" className="total-line">
                    <div>...............................</div>
                  </td>
                  <td colSpan="1" className="blank">
                    &nbsp;
                  </td>
                  <td colSpan="2" className="total-line">
                    ภาษีมูลค่าเพิ่ม 7%
                  </td>
                  <td className="total-value">
                    <div id="subtotal">{getVat()}</div>
                  </td>
                </tr>

                <tr>
                  <td colSpan="2" className="total-line">
                    <div>กำหนดชำระเงิน</div>
                  </td>
                  <td colSpan="1" className="total-line">
                    <div>...............................</div>
                  </td>
                  <td colSpan="1" className="blank">
                    &nbsp;
                  </td>
                  <td colSpan="2" className="total-line">
                    รวมเป็นเงินทั้งสิ้น
                  </td>
                  <td className="total-value">
                    <div id="total">{getVat()}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="terms">
            <div className="group-signature">
              <div className="signature">
                <div>..............................</div>
                <div>ออกโดย (Issued by)</div>
                <div className="group-date">
                  <p>วัน</p>
                  <p>/</p>
                  <p>/</p>
                </div>
              </div>
              <div className="signature">
                <div>..............................</div>
                <div>ผู้ตรวจสอบ (Checker)</div>
                <div className="group-date">
                  <p>วัน</p>
                  <p>/</p>
                  <p>/</p>
                </div>
              </div>{' '}
              <div className="signature">
                <div>..............................</div>
                <div>อนุมัติโดย (Approved by)</div>
                <div className="group-date">
                  <p>วัน</p>
                  <p>/</p>
                  <p>/</p>
                </div>
              </div>{' '}
              <div className="signature">
                <div>..............................</div>
                <div>รับทราบโดย (Vender Acknowledgement)</div>
                <div className="group-date">
                  <p>วัน</p>
                  <p>/</p>
                  <p>/</p>
                </div>
              </div>
            </div>
            {/* <h5>Terms</h5> */}
          </div>
        {/* </div> */}
      </div>
    </div>
  );
});

export default CommercialInvoice;
