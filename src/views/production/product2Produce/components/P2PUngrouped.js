/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-template */
import React, { useCallback, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useIntl } from 'react-intl';
import { Row, Col, Button, OverlayTrigger, Tooltip, Card, Badge } from 'react-bootstrap';

import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useFormat from 'hooks/useFormat';
import useClone from 'hooks/useClone';
import useSort from 'hooks/useSort';
import clx from 'classnames';
import MoveHandle from './moveHandle';
import { detailFilter, detailSorter } from './comparators';
import GeneratePastelColors from './PastelPersistHash';

const P2PUngrouped = ({ loading, columns, useSorting, renderColumns, list, setList, onProduceClick, onDragOnEnd }) => {
  const { formatMessage: f } = useIntl();
  const { formatNumber: n } = useFormat();
  const { cloneJson } = useClone();

  const { sort, sortColumn, sortDirection } = useSort();

  const [filter, setFilter] = useState('');

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    setList((prevList) => {
      let newList = cloneJson(prevList);
      if (useSorting) {
        newList = newList.sort(detailSorter(sortColumn, sortDirection));
      }

      return newList;
    });
  }, [cloneJson, setList, sortColumn, sortDirection, useSorting]);

  const handleOnSort = useCallback(
    (columnId) => (e) => {
      if (!useSorting) {
        return;
      }

      sort(columnId);
    },
    [sort, useSorting]
  );

  const handleProduceClick = useCallback(
    (saleOrderDetailId) => () => {
      // console.debug(`Link to produce page with ungroup and ${saleOrderDetailId}`);
      onProduceClick?.({ type: 'item', saleOrderDetailId });
    },
    [onProduceClick]
  );

  const displayFilter = useCallback((_filter, item) => {
    if (!_filter) {
      return true;
    }

    return detailFilter(_filter, ['saleOrderNo', 'productCode', 'productName'])(item);
  }, []);

  return (
    <>
      <Row className="mb-3">
        <Col xs="auto" className="align-self-center">
          <h2 className="h4">{f({ id: 'production.group.ungroup-list' })}</h2>
        </Col>
        <Col xs>
          {/* Ungrouped */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-20 shadow bg-foreground">
            <input type="text" className="form-control" placeholder={f({ id: 'common.search' })} value={filter} onChange={handleFilterChange} />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
          </div>
        </Col>
      </Row>

      <div
        className={clx('react-table page-print', {
          'overlay-spinner': loading,
        })}
      >
        {renderColumns ? (
          renderColumns()
        ) : (
          <Row
            className={clx('g-0 h-100 align-content-center d-none d-md-flex ps-5 pe-5 mb-2 thead-print', {
              'custom-sort': useSorting,
            })}
          >
            {columns.map((column) => (
              <Col key={column.id} {...(column.colProps || {})}>
                <div className={clx('text-medium cursor-pointer sort', sortColumn === column.id ? sortDirection : '')} onClick={handleOnSort(column.id)}>
                  {typeof column.header === 'function' ? column.header() : column.header}
                </div>
              </Col>
            ))}
          </Row>
        )}

        {list.map((itemSize, index) => {
          // const { itemList, producedSize } = itemSize;
          // console.log(itemSize);
          return (
            <div key={`${index}`} className="group-item">
              <div className="pt-2">
                <Row>
                  <Badge bg="info" style={{ display: 'flex', justifyContent: 'flex-start' }} className="h6 badge-lg">
                    {index + 1} {'.'} {itemSize?.producedSize}
                  </Badge>
                </Row>
              </div>
              <ReactSortable
                id="ungrouped"
                className="list-group ungrouped"
                group={{
                  name: 'productUngrouped',
                  put: 'productGrouped',
                }}
                animation={150}
                list={list}
                setList={setList}
                handle=".move-handle"
                onEnd={onDragOnEnd}
              >
                {itemSize?.itemList?.map((items) => {
                  const outputSubTypeColor = GeneratePastelColors(items?.productSubTypeName || '');
                  const outputPrintColor = GeneratePastelColors(items?.productPrintCategory || '');
                  return (
                    <Card
                      key={items.saleOrderDetailId}
                      id={items.saleOrderDetailId}
                      className={clx('mb-2 sh-md-4', {
                        'dp-n': !displayFilter(filter, items),
                      })}
                      // style={{
                      //   ทำสี backdrond ของ card ให้สลับกัน
                      //   ...(items?.isNewItem ? { background: '#EDF7D1' } : { background: '#fff' }),
                      // }}
                    >
                      <Card
                        className="ps-3 pt-0 pb-0 sh-21 sh-md-6"
                        data-product-name={items.productName}
                        // style={items?.isNewItem && { background: '#8aefff80' }}
                      >
                        <Row className="g-0 h-100 align-content-center cursor-default">
                          <Col xs="11" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative">
                            <div className="text-medium d-md-none">{f({ id: 'production.group.field.po-no' })}</div>
                            <div className="text-truncate h-100 d-flex align-items-center">
                              <MoveHandle className="me-1" /> {items.saleOrderNo}
                              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'production.group.tooltip.produce' })}</Tooltip>}>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="btn-icon btn-icon-only ms-1"
                                  onClick={handleProduceClick(items.saleOrderDetailId)}
                                >
                                  <CsLineIcons icon="tool" />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </Col>
                          <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                            <div className="text-medium d-md-none">{f({ id: 'production.group.field.productCode' })}</div>
                            <div>{items.productCode}</div>
                          </Col>
                          <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                            <div className="text-medium d-md-none">{f({ id: 'production.group.field.productName' })}</div>
                            <div>{items.productName}</div>
                          </Col>
                          <Col xs="6" md="2" className="d-flex flex-column justify-content-center align-items-md-center mb-2 mb-md-0 order-5 order-md-4">
                            <div className="text-medium d-md-none">{f({ id: 'production.group.field.quantity' })}</div>
                            <div>{n(items.amount)}</div>
                          </Col>
                          <Col xs="6" md="1" className="d-flex flex-row gap-2 justify-content-center align-items-md-center mb-2 mb-md-0 order-5 order-md-4">
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Print Category {items?.productPrintCategory}</Tooltip>}>
                              <div style={{ background: outputPrintColor, borderRadius: '50%', width: '10px', height: '10px' }}>
                                {/* <CsLineIcons icon="navigate-diagonal" className="text-white" /> */}
                              </div>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{items?.productSubTypeName}</Tooltip>}>
                              <div style={{ background: outputSubTypeColor, borderRadius: '50%', width: '10px', height: '10px' }}>
                                {/* <CsLineIcons icon="navigate-diagonal" className="text-white" /> */}
                              </div>
                            </OverlayTrigger>
                            {items?.isNewItem ? (
                              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">New </Tooltip>}>
                                <div style={{ background: 'green', borderRadius: '50%', width: '10px', height: '10px' }}>
                                  {/* <CsLineIcons icon="navigate-diagonal" className="text-white" /> */}
                                </div>
                              </OverlayTrigger>
                            ) : (
                              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Old </Tooltip>}>
                                <div style={{ background: 'transparent', border: '1px solid green', borderRadius: '50%', width: '10px', height: '10px' }}>
                                  {/* <CsLineIcons icon="navigate-diagonal" className="text-white" /> */}
                                </div>
                              </OverlayTrigger>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    </Card>
                  );
                })}
                {/* {itemSize?.productSubType?.map((itemProductSubType, indexSize) => {
                  return (
                    <>
                      <div className="pt-2">
                        <Row> </Row>
                      </div>
                      {itemProductSubType?.itemList?.map((items) => (
                        <Card
                          key={items.saleOrderDetailId}
                          id={items.saleOrderDetailId}
                          className={clx('mb-2', {
                            'dp-n': !displayFilter(filter, items),
                          })}
                          style={{
                            // ทำสี backdrond ของ card ให้สลับกัน
                            ...(items?.isNewItem ? { background: '#fff' } : { background: '#EDF7D1' }),
                          }}
                        >
                          <Card.Body
                            className="pt-0 pb-0 sh-21 sh-md-6"
                            data-product-name={items.productName}
                            // style={items?.isNewItem && { background: '#8aefff80' }}
                          >
                            <Row className="g-0 h-100 align-content-center cursor-default">
                              <Col
                                xs="11"
                                md="3"
                                className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative"
                              >
                                <div className="text-medium d-md-none">{f({ id: 'production.group.field.po-no' })}</div>
                                <div className="text-truncate h-100 d-flex align-items-center">
                                  <MoveHandle className="me-1" /> {items.saleOrderNo}
                                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'production.group.tooltip.produce' })}</Tooltip>}>
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      className="btn-icon btn-icon-only ms-1"
                                      onClick={handleProduceClick(items.saleOrderDetailId)}
                                    >
                                      <CsLineIcons icon="tool" />
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </Col>
                              <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                                <div className="text-medium d-md-none">{f({ id: 'production.group.field.productCode' })}</div>
                                <div>{items.productCode}</div>
                              </Col>
                              <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                                <div className="text-medium d-md-none">{f({ id: 'production.group.field.productName' })}</div>
                                <div>{items.productName}</div>
                              </Col>
                              <Col xs="6" md="2" className="d-flex flex-column justify-content-center align-items-md-end mb-2 mb-md-0 order-5 order-md-4">
                                <div className="text-medium d-md-none">{f({ id: 'production.group.field.quantity' })}</div>
                                <div>{n(items.amount)}</div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </>
                  );
                })} */}
              </ReactSortable>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default P2PUngrouped;
