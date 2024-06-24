import React, { useCallback, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useIntl } from 'react-intl';
import { Row, Col, Button, OverlayTrigger, Tooltip, Card, Badge, FormCheck } from 'react-bootstrap';

import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useFormat from 'hooks/useFormat';
import useClone from 'hooks/useClone';
import useSort from 'hooks/useSort';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import clx from 'classnames';
import MoveHandle from './moveHandle';
import { detailFilter, detailSorter, groupFilter, groupSorter } from './comparators';
import './P2PGrouped.style.scss';

const P2PGrouped = ({ loading, columns, useSorting, renderColumns, list, setList, onProduceClick, onRemoveGroup, onDragOnEnd }) => {
  const { formatMessage: f } = useIntl();
  const { formatNumber: n } = useFormat();
  const { cloneJson } = useClone();

  const { sort, sortColumn, sortDirection } = useSort();

  const [filter, setFilter] = useState('');
  const [filterGroup, setFilterGroup] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  const [removingGroupId, setRemovingGroupId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleFilterGroupToggle = () => {
    setFilterGroup((prev) => !prev);
  };

  useEffect(() => {
    setFilteredList((prev) => {
      const clonedList = cloneJson(list);
      let newList;
      if (`${filter || ''}`.trim() === '') {
        newList = clonedList;
      } else if (filterGroup) {
        newList = clonedList.filter(groupFilter(filter));
      } else {
        newList = clonedList.filter((item) => {
          let isFound = false;

          if (item.detail) {
            const { detail } = item;
            item.detail = detail.filter(detailFilter(filter));

            if (item.detail.length) {
              isFound = true;
            }
          }

          return isFound;
        });
      }

      // Sort
      if (useSorting && newList?.length) {
        newList = newList.sort(groupSorter);
        newList.forEach((item) => {
          item.detail = item.detail.sort(detailSorter(sortColumn, sortDirection));
        });
      }

      //
      return newList;
    });
  }, [list, filter, filterGroup, cloneJson, useSorting, sortColumn, sortDirection]);

  const getReferenceDetail = useCallback((saleOrderGroupId) => list.find((item) => item.saleOrderGroupId === saleOrderGroupId), [list]);

  const setListForDataGrouped = useCallback(
    (saleOrderGroupId) => (value) => {
      // console.debug('setListForDataGrouped', saleOrderGroupId, value);
      setList((prev) => {
        console.log(prev);
        console.log(saleOrderGroupId);
        const group = prev.find((item) => item.saleOrderGroupId === saleOrderGroupId);
        if (group) {
          group.detail = value;
        }

        return [...prev];
      });
    },
    [setList]
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

  const handleProduceGroupClick = useCallback(
    (saleOrderGroupId) => () => {
      // console.debug(`Link to produce page with group and ${saleOrderGroupId}`);
      onProduceClick?.({ type: 'group', saleOrderGroupId });
    },
    [onProduceClick]
  );

  const handleRemoveGroupClick = useCallback(
    (saleOrderGroupId) => () => {
      setRemovingGroupId(saleOrderGroupId);
    },
    []
  );

  const handleRemoveGroupConfirmClick = async () => {
    setProcessing(true);
    await onRemoveGroup?.(removingGroupId);
    setProcessing(false);
    setRemovingGroupId(null);
  };

  const handleRemoveGroupCancelClick = () => {
    // console.log('handleRemoveGroupCancelClick');
    setRemovingGroupId(null);
  };

  const handleDragOnEnd = (e) => {
    onDragOnEnd?.(e);
  };

  return (
    <>
      <Row className="mb-3">
        <Col xs="auto" className="align-self-center">
          {/* Grouped */}
          <h2 className="h4">{f({ id: 'production.group.group-list' })}</h2>
        </Col>
        <Col xs="auto" className="align-self-center">
          <FormCheck id="checkGroup" label="Group" checked={filterGroup} onChange={handleFilterGroupToggle} />
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
        className={clx({
          'overlay-spinner': loading,
        })}
      >
        {renderColumns ? (
          renderColumns()
        ) : (
          <Row
            className={clx('g-0 h-100 align-content-center d-none d-md-flex ps-5 pe-5 mb-2', {
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
        <ReactSortable
          className="grouped-list list-scroll-y list-scroll-x-hidden max-h-400px mb-3"
          forceFallback
          scroll
          scrollSensitivity={200}
          list={list}
          setList={setFilteredList}
          handle=".move-handle"
          sort={false}
        >
          {filteredList.map((item) => (
            <div key={item.saleOrderGroupId} className="group-item">
              <div className="mb-2">
                <Badge bg="info" className="h6">
                  {item.saleOrderGroupName}
                </Badge>{' '}
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'production.group.tooltip.remove-group' })}</Tooltip>}>
                  <Button variant="outline-danger" size="sm" className="btn-icon btn-icon-only" onClick={handleRemoveGroupClick(item.saleOrderGroupId)}>
                    <CsLineIcons icon="bin" />
                  </Button>
                </OverlayTrigger>{' '}
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">{f({ id: 'production.group.tooltip.produce-group' })}</Tooltip>}>
                  <Button variant="outline-info" className="btn-icon btn-icon-only" onClick={handleProduceGroupClick(item.saleOrderGroupId)}>
                    <CsLineIcons icon="tool" />
                  </Button>
                </OverlayTrigger>
              </div>

              <ReactSortable
                id={item.saleOrderGroupId}
                className="list-group grouped"
                group={{
                  name: 'productGrouped',
                  put: (to, from, dragEl, event) => {
                    // console.debug({ to, from, dragEl, event });

                    // to
                    const toGroupId = to.el.id;
                    if (list.length <= 0) return true;

                    const toGroupDetail = list.find((i) => i.saleOrderGroupId === toGroupId)?.detail?.[0];
                    // console.debug('toGroupDetail: ', toGroupDetail);
                    if (!toGroupDetail) return true;

                    const { productName: toGroupProductName } = toGroupDetail;
                    if (!toGroupProductName) return false;

                    // from.
                    const fromProductName = dragEl.querySelector('.card')?.attributes['data-product-name']?.value;

                    if (!fromProductName) return false;

                    return fromProductName === toGroupProductName;
                  },
                }}
                animation={150}
                list={getReferenceDetail(item.saleOrderGroupId)?.detail || []}
                setList={setListForDataGrouped(item.saleOrderGroupId)}
                handle=".move-handle"
                onEnd={handleDragOnEnd}
                data-empty-txt="No product in this group"
              >
                {item.detail.map((itemD) => (
                  <Card key={itemD.saleOrderDetailId} id={itemD.saleOrderDetailId} className="mb-2 sh-md-4">
                    <Card className=" ps-3 pt-0 pb-0 sh-21 sh-md-6" data-product-name={item.productName}>
                      <Row className="g-0 h-100 align-content-center cursor-default">
                        <Col xs="11" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative">
                          <div className="text-medium d-md-none">{f({ id: 'production.group.field.po-no' })}</div>
                          <div className="text-truncate h-100 d-flex align-items-center">
                            <MoveHandle className="me-1" />
                            {itemD.saleOrderNo}
                          </div>
                        </Col>
                        <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                          <div className="text-medium d-md-none">{f({ id: 'production.group.field.productCode' })}</div>
                          <div>{itemD.productCode}</div>
                        </Col>
                        <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                          <div className="text-medium d-md-none">{f({ id: 'production.group.field.productName' })}</div>
                          <div>{itemD.productName}</div>
                        </Col>
                        <Col xs="6" md="2" className="d-flex flex-column justify-content-center align-items-md-end mb-2 mb-md-0 order-5 order-md-4">
                          <div className="text-medium d-md-none">{f({ id: 'production.group.field.quantity' })}</div>
                          <div>{n(itemD.amount)}</div>
                        </Col>
                      </Row>
                    </Card>
                  </Card>
                ))}
              </ReactSortable>
            </div>
          ))}
        </ReactSortable>

        <ConfirmModal
          centered
          show={!!removingGroupId}
          loading={processing}
          confirmText={f({ id: 'production.group.remove-group.msg' })}
          okText={f({ id: 'common.delete' })}
          onConfirm={handleRemoveGroupConfirmClick}
          onCancel={handleRemoveGroupCancelClick}
        />
      </div>
    </>
  );
};

export default P2PGrouped;
