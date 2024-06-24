import React, { useCallback, useMemo, useState } from 'react';
import clx from 'classnames';
import { Badge, Card, Col, Row, Table } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import { useIntl } from 'react-intl';
import useFormat from 'hooks/useFormat';
import './style.css';

const CardPrintingOperationList = React.forwardRef(({ tableInstance, loading, componentRef, rowProps = () => ({}), isConfirmModal }, ref) => {
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
  let prevIndexCore = null;
  const handleRowClick = useCallback((oc, itemD, group) => (e) => oc?.(e, itemD, group), []);

  return (
    <div className={isConfirmModal ? clx('react-table page-print') : 'd-none'} ref={componentRef}>
      <Table striped bordered hover className="table-print">
        <thead>
          <tr className={clx({ 'custom-sort': useSorting })}>
            <th>Ordering</th>
            <th>Material</th>
            <th>Product</th>
            <th>Lot No.</th>
            <th>Product Amount</th>
            <th>Total Amount</th>
            <th>Order Amount</th>
            <th>Remaining</th>
            <th>Total Remaining</th>
            <th>Due Date</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {page.map((material, indexCore) => {
            prepareRow(material);
            const {
              original: { materialId, materialCode, materialName, materialBatchNo, priority, producedSizeList },
            } = material;
            return producedSizeList.map((itemB) => {
              const { productList } = itemB;
              let totalAmount = 0;
              let totalRemain = 0;
              productList.forEach((eAmount) => {
                eAmount.productionOrderList.forEach((eList) => {
                  const itemAmount = parseFloat(eList.amount);
                  const itemRemain = parseFloat(eList.remaining);
                  totalAmount += itemAmount;
                  totalRemain += itemRemain;
                });
              });
              return productList.map((itemD, productIndex) => {
                const { productName, productionOrderList } = itemD;
                let itemListLength = 0;
                productList.forEach((e) => {
                  itemListLength += e.productionOrderList.length;
                });
                return productionOrderList.map((itemt, subIndex) => {
                  const { amount, dueDate, remaining, productionOrderNo } = itemt;
                  let unit;
                  let remainingUnit;
                  const unitAmount = amount.indexOf(' ');
                  const unitRemain = remaining.indexOf(' ');
                  if (unitAmount !== -1) {
                    unit = amount.slice(unitAmount + 1);
                    remainingUnit = remaining.slice(unitRemain + 1);
                  } else {
                    unit = '-';
                    remainingUnit = '-';
                  }
                  const shouldRenderMaterialName = prevIndexCore !== indexCore; // Compare with the previous indexCore
                  const rowIndexSpanElement = shouldRenderMaterialName ? <td rowSpan={itemListLength}>{indexCore + 1}</td> : null;
                  const rowMatSpanElement = shouldRenderMaterialName ? <td rowSpan={itemListLength}>{materialName}</td> : null;
                  const rowTotalAmountSpanElement = shouldRenderMaterialName ? (
                    <td rowSpan={itemListLength}>
                      {totalAmount} {unit}
                    </td>
                  ) : null;
                  const rowTotalRemainSpanElement = shouldRenderMaterialName ? (
                    <td rowSpan={itemListLength}>
                      {totalRemain} {remainingUnit}
                    </td>
                  ) : null;
                  prevIndexCore = indexCore;

                  return (
                    <tr key={`${materialId}-${productName}-${subIndex}`}>
                      {rowIndexSpanElement}
                      {rowMatSpanElement}
                      <td>{itemD.productName}</td>
                      <td>{productionOrderNo || '-'}</td>
                      <td>{amount || '-'}</td>
                      {rowTotalAmountSpanElement}
                      <td>-</td>
                      <td>{remaining}</td>
                      {rowTotalRemainSpanElement}
                      <td>{fd(dueDate)}</td>
                      <td>-</td>
                    </tr>
                  );
                });
              });
            });
          })}
        </tbody>
      </Table>
    </div>
  );
});

export default CardPrintingOperationList;
