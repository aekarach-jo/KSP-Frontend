import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Card, Button, Tabs, Tab } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import classNames from 'classnames';

import DetailPurchaseItem from './DetailPurchaseItem';

// import DetailPurchaseOrder from './DetailPurchaseOrder';

const Detail = ({ data, isLoading, isEditMode, typePo }) => {
  const { formatMessage: f } = useIntl();
  const [key, setKey] = useState('home');
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});

  const handleOnClickAddProduct = () => {
    setModal(true);
    setIsEdit(false);
    setEditData({});
  };

  return (
    <section className="scroll-section" id="stripedRows">
      {/* <div className="mb-3 d-none d-md-block" style={{ textAlign: 'right' }}>
        <Button variant="primary" className="btn-icon btn-icon-start w-100 w-md-auto" onClick={handleOnClickAddProduct} disabled={isLoading}>
          <CsLineIcons icon="plus" /> <span>{f({ id: 'purchaseOrder.detail.purchaseItem.add' })}</span>
        </Button>
      </div> */}
      {/* <div className="mb-3 d-md-none" style={{ textAlign: 'right' }}>
        <Button variant="primary" className="btn-icon btn-icon-start w-md-auto" onClick={handleOnClickAddProduct} disabled={isLoading}>
          <CsLineIcons icon="plus" /> <span>{f({ id: 'purchaseOrder.detail.purchaseItem.add' })}</span>
        </Button>
      </div> */}
      <h2 className="small-title">{f({ id: 'purchaseOrder.detail.purchaseItem.title' })}</h2>
      <Card body className="mb-5">
        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab
            eventKey="home"
            title={f({ id: 'purchaseOrder.detail.purchaseItem.list' })}
            className={classNames({
              'overlay-spinner': isLoading,
            })}
          >
            <DetailPurchaseItem
              isEditMode={isEditMode}
              data={data}
              typePo={typePo}
              modal={modal}
              setModal={setModal}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              editData={editData}
              setEditData={setEditData}
            />
          </Tab>
          {/* <Tab eventKey="profile" title="ใบสั่งซื้อ">
            <DetailPurchaseOrder />
          </Tab> */}
        </Tabs>
      </Card>
    </section>
  );
};

export default Detail;
