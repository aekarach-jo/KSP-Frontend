import React, { useCallback, useMemo, useState } from 'react';
import clx from 'classnames';
import { Badge, Card, Col, Row, Table } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import { useIntl } from 'react-intl';
import useFormat from 'hooks/useFormat';
import './style.css';

const CardPrintingCuttingList = React.forwardRef(({ tableInstance, loading, componentRef, rowProps = () => ({}), printModal }, ref) => {
  const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
  const { formatNumber: n } = useFormat();

  const { columns: allColumns, useSorting, page = [], prepareRow } = tableInstance;
  // const columns = useMemo(() => allColumns.filter((c) => c.isVisible), [allColumns]);

  const { sort, sortColumn, sortDirection } = useSort();

  const translate = useMemo(
    () => ({
      priority: f({ id: 'cutting.group.priority' }),
      priority1: f({ id: 'cutting.group.priority.1.desc' }),
      priority2: f({ id: 'cutting.group.priority.2.desc' }),
    }),
    [f]
  );

  const handleOnSort = useCallback(
    (columnId) => (e) => {
      if (!useSorting) {
        return;
      }
      sort(columnId);
    },
    [sort, useSorting]
  );
  // let prevIndexCore = null;
  const handleRowClick = useCallback((oc, itemD, group) => (e) => oc?.(e, itemD, group), []);
  console.log(printModal);
  return (
    <>
      {/* {page.map((row, index) => { */}
      {/* prepareRow(row); */}
      {/* return ( */}
      <div
        ref={(el) => {
          componentRef.current = el;
        }}
        className={printModal ? 'bg-white' : 'd-none'}
        id="page-wrap"
      >
        <table id="items-detail">
          <thead>
            <td>
              <Row>
                <Col lg="1" md="1" xs="1">
                  <div className="font-weight-bold text-medium text-uppercase">บริษัท</div>
                </Col>
                <Col lg="6" md="6" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">.....</div>
                </Col>
                <Col lg="2" md="2" xs="2">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.taskNo' })}</div>
                </Col>
                <Col>
                  <div className="font-weight-bold text-medium text-uppercase">.......</div>
                </Col>
              </Row>
              <Row>
                <Col lg="2" md="2" xs="6">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'dailyPlan.field.date' })}</div>
                </Col>
                <Col lg="2" md="2" xs="6">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.customerCode' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
                <Col lg="3" md="3" xs="6">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'salesOrder.field.customerName' })}</div>
                  <div className="font-weight-bold">.......</div>
                </Col>
                <Col lg="3" md="3" xs="6">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'customer.field.contactName' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
                <Col>
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'customer.field.phone' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
              </Row>
              <Row>
                <Col lg="2" md="2" xs="6">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.completeDate' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
                <Col lg="5" md="5" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderTime' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
                <Col>
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'production.group.field.quantity' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
              </Row>
              <Row>
                <Col lg="2" md="2" xs="6">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.prodDetail' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
              </Row>
              <Row>
                <Col lg="7" md="7" xs="12">
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.lot' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
                <Col>
                  <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.dueDate' })}</div>
                  <div className="text-muted mb-2">.......</div>
                </Col>
              </Row>
            </td>
          </thead>
          <tbody>
            <tr>
              <th className="th-col">
                <div className="mb-3">แผนกตัด</div>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.issues' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.rootCaution' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
              </th>
            </tr>
            <tr>
              <th className="th-col">
                <div className="mb-3">แผนกพิมพ์</div>
                <Row>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="6" md="6" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.machine' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.material' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.gram' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.thickness' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobChar' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.plateNo' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.printChar' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.reprint' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6" md="6" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobDetails' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="3" md="3" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.printOrder' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="3" md="3" xs="6">
                    <div className="font-weight-bold text-truncate text-medium text-uppercase">{f({ id: 'summary.field.coatChar' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.caution' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.issues' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.rootCaution' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="9" md="9" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.totalDef' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.completeDate' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
              </th>
            </tr>
            <tr>
              <th className="th-col">
                <div className="mb-3">แผนกปั้ม</div>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpMachine' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobChar' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpDetails' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.caution' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpAmount' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpFail' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.pumpTotal' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
              </th>
            </tr>
            <tr>
              <th className="th-col">
                <div className="mb-3">แผนกเคลือบ</div>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coat' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatAt' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" md="4" xs="6">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatAmount' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatFail' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="8" md="8" xs="6">
                    {}
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.coatTotal' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
              </th>
            </tr>
            <tr>
              <th className="th-col">
                <div className="mb-3">แผนกปะ</div>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.workerName' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.orderer' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.startDate' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchMachine' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.jobChar' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchDetails' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="2" md="2" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.caution' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchAmount' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col>
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchFail' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                  <Col lg="4" md="4" xs="12">
                    <div className="font-weight-bold text-medium text-uppercase">{f({ id: 'summary.field.patchTotal' })}</div>
                    <div className="text-muted mb-2">.......</div>
                  </Col>
                </Row>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      {/* ); */}
      {/* })} */}
    </>
  );
});

export default CardPrintingCuttingList;
