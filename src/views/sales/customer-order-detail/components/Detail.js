import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Card, Button, Tabs, Tab, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import classNames from 'classnames';

import DetailProduct from './DetailProduct';

// import DetailPurchaseOrder from './DetailPurchaseOrder';
const customStyle = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: '16px',
};

const Detail = ({ data, setUploadModal, isLoading, isEditMode, modalData, setModalData }) => {
  const { formatMessage: f } = useIntl();

  const [key, setKey] = useState('home');
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [custRequiredModal, setCustRequiredModal] = useState(false);

  const handleOnClickAddProduct = () => {
    if (!data?.customerId) {
      setCustRequiredModal(true);
      return;
    }
    setModal(true);
    setIsEdit(false);
    setEditData({});
  };
  return (
    <section className="scroll-section" id="stripedRows" style={customStyle}>
      <div className="mb-3 d-md-block" style={{ textAlign: 'right' }}>
        <Button
          variant="warning"
          hidden={!isEditMode || data?.status === 'SUBMITTED' || data?.status === 'CANCELLED'}
          className="mb-1 btn-icon btn-icon-start w-100 w-md-auto"
          onClick={() => setUploadModal(true)}
          disabled={isLoading}
        >
          <CsLineIcons icon="upload" /> <span>{f({ id: 'customerOrder.detail.upload' })}</span>
        </Button>{' '}
        <Button
          variant="primary"
          hidden={!isEditMode || data?.customerId === undefined || data?.customerId === '' || data?.status === 'SUBMITTED' || data?.status === 'CANCELLED'}
          className="mb-1 btn-icon btn-icon-start w-100 w-md-auto"
          onClick={handleOnClickAddProduct}
          disabled={isLoading}
        >
          <CsLineIcons icon="plus" /> <span>{f({ id: 'customerOrder.detail.addProduct' })}</span>
        </Button>
      </div>
      <h2 className="small-title">{f({ id: 'customerOrder.detail.order-information' })}</h2>
      <Card body className="mb-5">
        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab
            eventKey="home"
            title={f({ id: 'customerOrder.detail.product-list' })}
            className={classNames({
              'overlay-spinner': isLoading,
            })}
          >
            <DetailProduct
              data={data}
              modal={modal}
              setModal={setModal}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              editData={editData}
              setEditData={setEditData}
              modalData={modalData}
              setModalData={setModalData}
              isEditMode={isEditMode}
            />
          </Tab>
          {/* <Tab eventKey="profile" title="ใบสั่งซื้อ">
            <DetailPurchaseOrder />
          </Tab> */}
        </Tabs>
      </Card>
      <Modal show={custRequiredModal} onHide={() => setCustRequiredModal(false)}>
        {/* <Modal.Header closeButton>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header> */}
        <Modal.Body>{f({ id: 'customerOrder.detail.customer.required' })}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setCustRequiredModal(false)}>
            {f({ id: 'common.ok' })}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Detail;
