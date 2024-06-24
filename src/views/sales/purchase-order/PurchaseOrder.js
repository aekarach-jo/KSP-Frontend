import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import clx from 'classnames';
import { request } from 'utils/axios-utils';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from '../components/page-title/PageTitle';
import FilterPurchaseOrder from './components/FilterPurchaseOrder';
import FilterPurchaseItem from './components/FilterPurchaseItem';
import Table from '../components/table/TableMultiPurchase';

import { usePurchaseItemTableInstance, usePurchaseOrderTableInstance, usePurchaseOrderTableExpressInstance } from './components/TableInstance';
import { usePurchaseItemQuery, usePurchaseOrderQuery, usePurchaseOrderExpressQuery } from './components/TableQuery';

import { PURCHASE_ORDER_PAGE } from './constants';

const PurchaseOrder = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();

  const title = f({ id: 'purchaseOrder.list.title' });
  const description = f({ id: 'purchaseOrder.list.description' });
  const [poList, setPoList] = useState([]);

  useEffect(() => {
    console.log(poList);
  }, [poList]);

  const tableInstance = usePurchaseOrderTableInstance(setPoList);
  const tableInstance2 = usePurchaseItemTableInstance();
  const tableInstance3 = usePurchaseOrderTableExpressInstance();

  const purchaseOrderQuery = usePurchaseOrderQuery({ tableInstance });
  const purchaseItemQuery = usePurchaseItemQuery({ tableInstance: tableInstance2 });
  const purchaseOrderQueryExpress = usePurchaseOrderExpressQuery({ tableInstance });
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('activeTabPO') !== 'export' && localStorage.getItem('activeTabPO') !== 'sync' ? 'export' : localStorage.getItem('activeTabPO')
  );
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
    localStorage.setItem('activeTabPO', eventKey);
  };

  const callSaveExportPo = () => {
    console.log(poList);
    return request({ url: `/express/syncPurchaseOrder`, method: 'post', data: { purchaseOrderIdList: poList } });
  };

  const { mutate: saveExpressPO, isLoading: isSaving } = useMutation(callSaveExportPo, {
    onSuccess(res) {
      console.debug('create success :', res);
      setPoList([]);
      purchaseItemQuery.refetch();
      purchaseOrderQueryExpress.refetch();
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      console.error('update error :', err);
    },
  });

  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <Button
              variant="info"
              size="small"
              onClick={() => {
                setModal(false);
                onConfirm();
              }}
              disabled={loading}
            >
              {f({ id: 'common.ok' })}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
  };
  const fontStyle = {
    fontFamily: 'Poppins, sans-serif',
  };
  const rowStyle = {
    height: '40px',
    border: '1px solid rgba(0, 0, 0, 0)',
    borderWidth: '1px 0',
    background: 'var(--foreground)',
  };

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  const customStyleDescrip = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        buttons={{
          export: { label: f({ id: 'common.export' }), onSubmit: () => setIsConfirmModal(true), isHide: poList.length === 0 },
        }}
        addButton={{ label: f({ id: 'purchaseOrder.list.add' }), link: PURCHASE_ORDER_PAGE.ADD_PURCHASE_ORDER }}
        customStyle={customStyleDescrip}
        fontStyle={fontStyle}
      />

      <Table
        // tableInstance={tableInstance}
        // filter={FilterComponent}
        // rowProps={rowProps}
        onTabChange={handleTabChange}
        customStyle={customStyle}
        rowStyle={rowStyle}
        activeKey={activeTab}
        tabs={[
          {
            eventKey: 'first',
            label: f({ id: 'purchaseOrder.list.title' }),
            tableInstance,
            isLoading: purchaseOrderQuery.isFetching,
            filter: FilterPurchaseOrder,
          },
          {
            eventKey: 'second',
            label: f({ id: 'purchaseItem.list.title' }),
            tableInstance: tableInstance2,
            isLoading: purchaseItemQuery.isFetching,
            filter: FilterPurchaseItem,
          },
          {
            eventKey: 'third',
            label: f({ id: 'purchaseOrder.list.title3' }),
            tableInstance: tableInstance3,
            isLoading: purchaseOrderQueryExpress.isFetching,
            filter: FilterPurchaseOrder,
          },
        ]}
      />
      <ConfirmModal
        show={isConfirmModal}
        setModal={setIsConfirmModal}
        // loading={supplier}
        titleText={f({ id: 'common.confirm' })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={saveExpressPO}
        onCancel={handleCancel}
      />
    </>
  );
};

export default PurchaseOrder;
