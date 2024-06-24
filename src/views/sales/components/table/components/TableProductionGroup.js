import React, { useCallback, useMemo, useState } from 'react';
import clx from 'classnames';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import useConvertUOM from 'hooks/useConvertUOM';
import { useIntl } from 'react-intl';
import useFormat from 'hooks/useFormat';
import './style.css';

const TableGroup = React.forwardRef(({ tableInstance, loading, rowProps = () => ({}) }, ref) => {
  const { columns: allColumns, useSorting, page = [], prepareRow } = tableInstance;
  const columns = useMemo(() => allColumns.filter((c) => c.isVisible), [allColumns]);
  const { sort, sortColumn, sortDirection } = useSort();

  const handleOnSort = useCallback(
    (columnId) => () => {
      if (!useSorting) {
        return;
      }
      sort(columnId);
    },
    [sort, useSorting]
  );

  const handleRowClick = useCallback((oc, itemD, group) => (e) => oc?.(e, itemD, group), []);

  return (
    <div
      className={clx('react-table page-print', {
        'overlay-spinner': loading,
      })}
      ref={ref}
    >
      <Row
        className={clx('g-0 h-100 align-content-center d-none d-md-flex ps-5 pe-5 mb-2 thead-print', {
          'custom-sort': useSorting,
        })}
      >
        {columns.map((column) => (
          <Col key={column.id} {...(column.colProps || {})}>
            <div
              className={clx('text-muted cursor-pointer sort', sortColumn === column.id ? sortDirection : '', column.headerClassName)}
              onClick={handleOnSort(column.id)}
            >
              {typeof column.Header === 'function' ? column.Header() : column.Header}
            </div>
          </Col>
        ))}
      </Row>

      {page.map((production, indexCore) => {
        prepareRow(production);
        const {
          original: { itemList, producedSize },
        } = production;

        return (
          <div key={`${indexCore}`} className="group-item">
            <div className="pt-2">
              <Row>
                <Badge bg="info" style={{ display: 'flex', justifyContent: 'flex-start' }} className="h6 badge-lg">
                  {indexCore + 1} {'.'} {producedSize}
                </Badge>
              </Row>
            </div>

            {itemList.map((itemD, index) => {
              const newRowProps = production.getRowProps(rowProps);
              return (
                <Card
                  key={`${index}`}
                  id={itemD.id}
                  className="mb-2 sh-md-4 pointer-cursor"
                  {...newRowProps}
                  onClick={handleRowClick(newRowProps.onClick, itemD, itemD?.id)}
                >
                  <Card className="ps-3 pt-0 pb-0 sh-21 sh-md-6">
                    <Row style={{ cursor: 'pointer' }} className="g-0 w-100 h-100 align-content-center cursor-default item-print">
                      {columns.map((column) => (
                        <Col key={column.id} {...column.colProps} className={clx('d-flex flex-column justify-content-center mb-2 mb-md-0', column.className)}>
                          <div className="text-muted text-small d-md-none">{typeof column.Header === 'function' ? column.Header() : column.Header}</div>
                          <div className="text-truncate h-100 d-flex align-items-center">
                            {typeof column.Cell === 'function'
                              ? column.Cell({
                                  value: column.accessor(itemD),
                                  cell: { value: column.accessor(itemD) },
                                  row: { values: itemD },
                                })
                              : column.accessor(itemD)}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

export default TableGroup;
