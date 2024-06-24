import React, { useRef } from 'react';
import { Card, Col, Row, Table, Button } from 'react-bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const CardContainer = (props) => {
  const { page, prepareRow } = props.tableInstance;
  const { formatMessage: f } = useIntl();
  const onSetShowModal = (id) => {
    props.setShowModal(true);
    props.setProductId(id);
  };
  return (
    <>
      <Card className="mb-3 p-4">
        <Row>
          <div className="font-weight-bold">
            {f({ id: 'dailyPlan.field.created-at' })}
            {' : '}
            {/* {moment(page.original.createdAt).add(543, 'year').format('DD/MM/YYYY')} */}
          </div>
        </Row>
        <OverlayScrollbarsComponent>
          <Row className="g-0 h-100">
            <div className="px-2 pt-2">
              <Row>
                <div style={{ width: '350mm' }} id="hoverableRows">
                  <Table sx={{ width: '100%' }} hover>
                    <thead>
                      <tr className="text-nowrap" style={{ textAlign: 'center', verticalAlign: 'text-top', fontSize: 13.5 }}>
                        <th scope="col">#</th>
                        <th scope="col" style={{ minWidth: 150 }}>
                          เลขใบสั่งงาน
                        </th>
                        <th scope="col" style={{ minWidth: 300 }}>
                          {f({ id: 'dailyPlan.field.name' })}
                        </th>
                        <th scope="col" style={{ minWidth: 150 }}>
                          {f({ id: 'dailyPlan.field.customer' })}
                        </th>
                        <th scope="col" style={{ minWidth: 150 }}>
                          {f({ id: 'dailyPlan.field.lot' })}
                        </th>
                        <th scope="col">จำนวนใบพิมพ์</th>
                        <th scope="col">{f({ id: 'dailyPlan.field.cavity' })}</th>
                        <th scope="col">จำนวนชิ้นงาน</th>
                        <th scope="col">ทวนยอด</th>
                        <th scope="col">order</th>
                        <th scope="col">กำหนดส่ง</th>
                        <th scope="col">ผลิตเสร็จ</th>
                        <th scope="col">วันจัดส่ง</th>
                        <th scope="col">ตัด</th>
                        <th scope="col">พิมพ์</th>
                        <th scope="col">ผลิต</th>
                        <th scope="col">ปั้ม</th>
                        <th scope="col">ปะ</th>
                        <th scope="col">ซอย</th>
                        <th scope="col">พับ</th>
                        <th scope="col">สต๊อก</th>
                        <th scope="col">จำนวนผลิตได้</th>
                        <th scope="col">สุทธิ</th>
                      </tr>
                    </thead>
                    {page.map((itemC, indexC) => (
                      <tbody key={indexC}>
                        <tr style={{ textAlign: 'center', fontSize: 13, ...(indexC % 2 === 0 ? { background: '#f9f9f9' } : {}) }}>
                          <td>{indexC + 1}</td>
                          <td>{itemC.original.no}</td>
                          <td style={{ textAlign: 'left' }}>
                            <NavLink
                              to={`/production/summaryDetail/${itemC.original.id},${itemC.original.customerId},${itemC.original.productId}`}
                              className="text-medium h-100 d-flex align-items-center"
                            >
                              {itemC.original.productName}
                            </NavLink>
                          </td>
                          <td>{itemC.original.customerName}</td>
                          <td>{itemC.original.no}</td>
                          <td>{itemC.original.materialUsedAmount}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialSize}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                          <td>{itemC.original.materialCavity}</td>
                        </tr>
                      </tbody>
                    ))}
                  </Table>
                </div>
              </Row>
            </div>
          </Row>
        </OverlayScrollbarsComponent>
      </Card>
    </>
  );
};
export default CardContainer;
