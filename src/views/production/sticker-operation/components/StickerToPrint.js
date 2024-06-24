import React, { useEffect, useMemo, useState } from 'react';
import clx from 'classnames';
import { Badge, Card, Col, Row, Table } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import { useIntl } from 'react-intl';
import useFormat from 'hooks/useFormat';

const StickerToPrint = React.forwardRef(({ tableInstance, stickerAmount, loading, componentRef, rowProps = () => ({}), isConfirmModal }, ref) => {
  const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
  const { formatNumber: n } = useFormat();
  const [indexGlobal, setIndexGlobal] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const { sort, sortColumn, sortDirection } = useSort();

  const translate = useMemo(
    () => ({
      priority: f({ id: 'cutting.group.priority' }),
      priority1: f({ id: 'cutting.group.priority.1.desc' }),
      priority2: f({ id: 'cutting.group.priority.2.desc' }),
    }),
    [f]
  );
  useEffect(() => {
    if (tableInstance?.productPiecePerPack !== undefined) {
      setRowCount(15 * Math.floor(stickerAmount / tableInstance?.productPiecePerPack / 15));
    } else {
      setRowCount(15 * Math.floor(stickerAmount / 15));
    }
  }, [stickerAmount]);
  return (
    <div ref={componentRef} style={{ width: '35cm', height: '21cm' }} className={isConfirmModal ? clx('react-table page-print') : 'd-none'}>
      {/* <Table> */}
      <Table bordered hover>
        <Row md="12" style={{ paddingTop: '0.4cm', paddingBottom: '0.6cm', paddingLeft: '1cm', paddingRight: '0.9cm' }}>
          {[...Array(rowCount)].map((__, colIndex) => {
            return (
              <Col
                md="4"
                style={{
                  pageBreakAfter: (colIndex + 1) % 15 === 0 ? 'always' : 'inherit',
                  width: '11.22cm',
                  height: '4.1cm',
                  paddingTop: colIndex > 14 ? '0.4cm' : '0cm',
                  paddingLeft: '0px',
                  paddingRight: '0px',
                }}
                key={colIndex}
              >
                <tr style={{ height: '2mm' }}>
                  <td colSpan="4" style={{ width: '11.22cm', border: '1px solid', fontWeight: 'bold', fontSize: '14px' }} className="text-center">
                    KSP Printing & Packaging
                  </td>
                </tr>
                <tr style={{ height: '6.75mm', fontSize: '12px' }}>
                  <td style={{ width: '1.5cm', border: '1px solid', fontWeight: 'bold', paddingLeft: '4px' }}>Product</td>
                  <td
                    colSpan="3"
                    style={{ width: '9.72cm', border: '1px solid', background: '#C1E1C1', fontSize: '14px', fontWeight: 'bold', paddingLeft: '4px' }}
                  >
                    {tableInstance?.productAbbr}
                  </td>
                </tr>
                <tr style={{ height: '6.75mm', fontSize: '12px' }}>
                  <td style={{ width: '1.5cm', border: '1px solid', fontWeight: 'bold', paddingLeft: '4px' }}>Part No</td>
                  <td
                    colSpan="3"
                    style={{ width: '9.72cm', border: '1px solid', background: '#C1E1C1', fontSize: '14px', fontWeight: 'bold', paddingLeft: '4px' }}
                  >
                    {tableInstance?.productPartNo}
                  </td>
                </tr>
                <tr style={{ height: '10mm', fontSize: '12px' }}>
                  <td style={{ width: '1.5cm', border: '1px solid', fontWeight: 'bold', paddingLeft: '4px' }}>Amount</td>
                  <td style={{ width: '2.1cm', border: '1px solid', textAlign: 'center' }}>{stickerAmount}</td>
                  <td style={{ width: '1.62cm', border: '1px solid', fontWeight: 'bold', paddingLeft: '4px' }}>Customer</td>
                  <td style={{ width: '6cm', border: '1px solid', fontSize: '12px' }}>{tableInstance?.customerAbbr}</td>
                </tr>
                <tr style={{ height: '10mm', fontSize: '12px' }}>
                  <td style={{ width: '1.5cm', border: '1px solid', fontWeight: 'bold', paddingLeft: '4px' }}>QC By</td>
                  <td style={{ width: '2.1cm', border: '1px solid' }}> </td>
                  <td style={{ width: '1.62cm', border: '1px solid', fontWeight: 'bold', paddingLeft: '4px' }}>Lot No</td>
                  <td style={{ width: '6cm', border: '1px solid', paddingBottom: '0mm', fontSize: '12px', paddingLeft: '4px' }}>
                    {tableInstance?.productionOrderNo}
                  </td>
                </tr>
              </Col>
            );
          })}
        </Row>
      </Table>
      {/* </Table> */}
    </div>
  );
});

export default StickerToPrint;
