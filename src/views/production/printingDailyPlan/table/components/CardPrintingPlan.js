import React, {useRef} from 'react';
import { Card, Col, Row, Table, Button } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const CardContainer = (props) => {
  const componentRef = useRef(null);
  const { page, prepareRow } = props.tableInstance;
  const { formatMessage: f } = useIntl();
  const onSetShowModal = (id) => {
    props.setShowModal(true);
    props.setProductId(id);
  };
  return (
    <>
    <div  ref={(el) => { componentRef.current = el;}}>
      {page.map((row, index) => {
        prepareRow(row);
        return (
          <Card className={index % 5 === 4 ? 'page-break mb-3 p-4' : 'mb-3 p-4'} 
          key={`card.${index}`} >
            <Row>
              <div className="font-weight-bold">
                {f({ id: 'dailyPlan.field.created-at' })}
                {' : '}
                {moment(row.original.date).add(543, 'year').format('DD/MM/YYYY')}
              </div>
            </Row>
            <OverlayScrollbarsComponent>
            {row.original.valueList.map((itemB, indexB) => (
            <Row className="g-0 h-100" key={indexB}>
                <div className="px-2 pt-2">
                  <Row className="font-weight-bold">
                    <div>
                      {f({ id: 'dailyPlan.field.machin-printing' })}
                      {' : '}
                      {itemB.value}
                    </div>
                  </Row>
                  <Row>
                        <div style={{width: "350mm"}} id="hoverableRows" >
                        <Table sx={{width: "100%"}} hover >
                              <thead>
                                <tr className="text-nowrap" style={{textAlign:"center", verticalAlign:"text-top" ,fontSize: 13.5}}>
                                  <th scope="col">{f({ id: 'printingDailyPlan.field.index' })}</th>
                                  <th scope="col" style={{minWidth: 250 }}>{f({ id: 'dailyPlan.field.name' })}</th>
                                  <th scope="col" style={{minWidth: 150 }}>{f({ id: 'dailyPlan.field.customer' })}</th>
                                  <th scope="col" style={{minWidth: 150 }}>{f({ id: 'dailyPlan.field.lot' })}</th>
                                  <th scope="col">{f({ id: 'dailyPlan.field.number' })}</th>
                                  <th scope="col" style={{}}>{f({ id: 'dailyPlan.field.cavity' })}</th>
                                  <th scope="col">{f({ id: 'dailyPlan.field.print_size' })}</th>
                                  <th scope="col" style={{minWidth: 115 }}>{f({ id: 'dailyPlan.field.print_fotmat' })}</th>
                                  <th scope="col" style={{minWidth: 130}}>{f({ id: 'dailyPlan.field.coating_format' })}</th>
                                  <th scope="col" style={{Width: 60}}>{f({ id: 'dailyPlan.field.machin_status' })}</th>
                                  <th scope="col" style={{Width: 60}}>{f({ id: 'dailyPlan.field.paper_status' })}</th>
                                  <th scope="col" style={{minWidth:230}}>{f({ id: 'printingDailyPlan.field.comment' })}</th>
                                  <th scope="col" style={{Width: 40}}>{f({ id: 'printingDailyPlan.field.water-based_status' })}</th>
                                </tr>
                              </thead>
                              {itemB.list?.map((itemC, indexC) => (
                              <tbody key={indexC}>
                                <tr style={{textAlign:"center" ,fontSize: 13, ...indexC % 2 === 0 ? {background: '#f9f9f9'}:{}}}>
                                  <td>{indexC+1}</td>
                                  <td style={{textAlign:"left"}}><div>{itemC.productName}</div><div style={{color: 'red'}}>{itemC.remark}</div></td>
                                  <td>{itemC.customerName}</td>
                                  <td>{itemC.no}</td>
                                  <td>{itemC.materialUsedAmount}</td>
                                  <td>{itemC.materialCavity}</td>
                                  <td>{itemC.materialSize}</td>
                                  <td>{itemC.productPrintMethod}</td>
                                  <td style={{whiteSpace: "normal"}}>{itemC.productCoatingMethod}</td>
                                  <td><div>{itemC.toolingStatus ? 'ใหม่' : 'เก่า'}</div></td>
                                  <td><div>{itemC.cuttingStatus ? 'ตัดแล้ว' : 'ยังไม่ได้ตัด'}</div></td>
                                  <td> </td>
                                  <td> </td>
                                </tr>
                              </tbody>
                              ))}
                            </Table>  
                          </div>
                  </Row>
                </div>  
            </Row>
            ))}
            </OverlayScrollbarsComponent>
          </Card>
        );
      })}
      </div>
      <div className="d-flex justify-content-center mt-4">
          <ReactToPrint
            trigger={() => (
              <Button variant="outline-dark" size="small" color="secondary">
                Export
              </Button>
            )}
            content={() => componentRef.current}
          />
      </div>
    </>
  );
};
export default CardContainer;
