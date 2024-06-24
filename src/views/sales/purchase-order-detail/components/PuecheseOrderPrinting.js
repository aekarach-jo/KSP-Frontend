import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { Row } from 'react-bootstrap';
import moment from 'moment';
import './style.css';
import useConvert from 'hooks/useConvert';

const PuecheseOrderPrinting = React.forwardRef((props, ref) => {
  const { values: data } = props.form;
  const { useConvertCurrency } = useConvert();
  const onSumProduct = () => {
    const result = data.detail.reduce((acc, current) => {
      const existingItem = acc.find((item) => item.code === current.code);
      if (existingItem) {
        existingItem.price += current.price * current.amount;
      } else {
        acc.push({
          id: current.code,
          price: current.price * current.amount,
          pricePerUnit: current.price,
          amount: current.amount,
          name: current.name,
          baseUOM: current.baseUOM,
          item: current.item,
        });
      }
      return acc;
    }, []);

    const result2 = result.reduce((acc, current) => {
      const existingItem = acc.find((item) => item.id === current.id);
      if (existingItem) {
        existingItem.price += current.price;
        existingItem.amount += current.amount;
      } else {
        acc.push({ ...current });
      }
      return acc;
    }, []);

    return result2;
  };

  const initialState = () => {
    const sumCN = onSumProduct().reduce((a, b) => a + b.price, 0);
    return {
      ...data,
      detail: onSumProduct(),
      sum: sumCN,
      sumVat: sumCN / 7,
      total: sumCN + sumCN / 7,
      company: { ...props.defaultCompany },
      supplier: { ...props.supplier },
      title: `ใบสั่งซื้อ`,
      titleEn: `Puechese Order`,
    };
  };

  const formik = useFormik({ initialValues: initialState(), enableReinitialize: true });
  const { values } = formik;

  return (
    <>
      <div ref={ref} className="bg-white" id="page-wrap">
        <div id="detail">
          <div className="d-flex flex-row w-100 align-items-center mb-2">
            <div style={{ width: '23%', maxHeight: '7rem' }}>
              <img src={values.company.logo} alt="logo" style={{ width: '160px', objectFit: 'contain', marginRight: '10px', height: '7rem' }} />
            </div>
            <div style={{ width: '70%' }} id="style-select">
              <div style={{ width: '100%', height: '30px', fontSize: '16px', fontWeight: '900' }}>{values.company.name}</div>
              <div style={{ width: '100%', height: '30px', fontSize: '16px', fontWeight: '900' }}>{values.company.nameEn}</div>
              <div style={{ width: '100%', height: '17px' }} id="addressTh">
                {values.company.address}
              </div>
              <div style={{ width: '100%', height: '17px' }} id="addressEn">
                {values.company.addressEn}
              </div>
              <div style={{ width: '100%', height: '17px', paddingLeft: '2px' }} id="tel">
                {values.company.officeNo[0]}
              </div>
            </div>
            <div style={{ width: '30%' }} className="d-flex flex-column align-items-end">
              <div
                style={{ textAlign: 'center', padding: '10px 2px', width: '100%', height: '55px', fontSize: '18px', fontWeight: '900', border: '1px solid' }}
              >
                {values.title}
              </div>
              <div
                style={{ textAlign: 'center', padding: '10px 2px', width: '100%', height: '55px', fontSize: '18px', fontWeight: '900', border: '1px solid' }}
              >
                {values.titleEn}
              </div>
            </div>
          </div>
          <table id="items-detail">
            <tbody>
              <td style={{ width: '60%', padding: '0px' }}>
                <div className="d-flex flex-column justify-content-between">
                  <div className="d-flex flex-column w-100">
                    <div style={{ width: '100%' }}>
                      <div style={{ paddingLeft: '2px', paddingTop: '2px' }}>ชื่อลูกค้า / บริษัท</div>
                      <div style={{ paddingLeft: '3rem' }} id="style-select-customer">
                        {values.supplier.name}
                      </div>
                    </div>
                    <div style={{ width: '100%', paddingLeft: '0px' }}>
                      <Row>
                        <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                        <div style={{ width: '85%', paddingLeft: '0px' }}>{values.supplier?.list[0].address}</div>
                      </Row>
                      <Row>
                        <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                        <div style={{ width: '85%', paddingLeft: '0px' }}>{values.supplier?.list[0].phone[0]}</div>
                      </Row>
                      <Row>
                        <div style={{ width: '13%', paddingLeft: '0px' }}> </div>
                        <div style={{ width: '85%', paddingLeft: '0px' }}>{values.supplier?.list[0].phone[1]}</div>
                      </Row>
                    </div>
                  </div>
                </div>
              </td>

              <td style={{ width: '40%', padding: '0px' }}>
                <div className="d-flex flex-row justify-center w-100 h-100" style={{ borderBottom: '1px solid' }}>
                  <div className="w-40" style={{ paddingLeft: '2px' }}>
                    <div>เลขที่</div>
                    <div>No.</div>
                  </div>
                  <div className="w-60 d-flex pt-2">{values.no}</div>
                </div>
                <div className="d-flex flex-row w-100 h-100">
                  <div className="w-40" style={{ paddingLeft: '2px' }}>
                    <div>วันที่</div>
                    <div>Date</div>
                  </div>
                  <div className="w-60 d-flex flex-column justify-content-center">{moment(values.createdAt).add(543, 'year').format('DD/MM/YYYY') || '-'}</div>
                </div>
              </td>
            </tbody>
          </table>
          <div className="mt-1">บริษัทฯ ------------------------ / We are pleased to submit our purchase order as follows :</div>
          <table id="items" style={{ marginTop: '0', verticalAlign: 'middle' }}>
            <thead>
              <tr>
                <th className="th-col">
                  <div>ลำดับ</div>
                  <div>ITEM</div>
                </th>
                <th className="th-col">
                  <div>รหัสวัสดุ</div>
                  <div>MATERIAL CODE</div>
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
              {values?.detail.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{item.id}</td>
                  <td>{item.name}</td>
                  <td className="text-center">{item.amount.toFixed(2)}</td>
                  <td className="text-center">{item.baseUOM}</td>
                  <td className="text-center">{item.pricePerUnit}</td>
                  <td className="text-end ps-1">{useConvertCurrency(item.price)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="blank">
                  &nbsp;
                </td>
                <td colSpan="1" className="total-line">
                  รวมเป็นเงิน
                </td>
                <td className=" text-end">{useConvertCurrency(values?.sum)}</td>
              </tr>

              <tr>
                <td colSpan="5" className="blank ">
                  <div>
                    กำหนดส่งมอบวันที่ <span className="ms-3">...........................................</span>
                  </div>
                </td>
                <td colSpan="1" className="total-line">
                  ภาษีมูลค่าเพิ่ม 7%
                </td>
                <td className="text-end">{useConvertCurrency(values?.sumVat)}</td>
              </tr>

              <tr>
                <td colSpan="5" className="blank">
                  <div>
                    กำหนดชำระเงิน <span className="ms-5">...........................................</span>
                  </div>
                </td>
                <td colSpan="1" className="total-line">
                  รวมเป็นเงินทั้งสิ้น
                </td>
                <td className="text-end">{useConvertCurrency(values?.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* <div style={{ position: 'absolute', bottom: '10rem', right: '1.2rem', fontSize: '25px', fontWeight: '600', color: 'red' }}>DRAFT</div> */}
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
                      <input maxLength={38} id="bidder" type="text" />
                      <div>)</div>
                    </div>
                    <div>ผู้เสนอราคา / ผู้ขาย</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default PuecheseOrderPrinting;
