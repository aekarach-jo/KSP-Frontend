import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Card, Button, Tabs, Tab, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import classNames from 'classnames';

import DetailProduct from './DetailProduct';

// import DetailPurchaseOrder from './DetailPurchaseOrder';

const Detail = ({
  data,
  setUploadModal,
  isLoading,
  handleSave,
  setIsDeleteRow,
  isEditMode,
  customStyle,
  setDisableSubmit,
  form,
  discountState,
  setDiscountState,
  setSyncState,
  setFlagList,
  setSyncFlagState
}) => {
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
        {/* <Button
          variant="warning"
          hidden={!isEditMode || data?.status === 'SUBMITTED' || data?.status === 'CANCELLED'}
          className="mb-1 btn-icon btn-icon-start w-100 w-md-auto"
          onClick={() => setUploadModal(true)}
          disabled={isLoading}
        >
          <CsLineIcons icon="upload" /> <span>{f({ id: 'customerOrder.detail.upload' })}</span>
        </Button>{' '} */}
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
      <h2 className="small-title">{f({ id: 'salesOrder.detail.order-information' })}</h2>
      <Card body className="mb-5">
        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab
            eventKey="home"
            title="รายการสินค้า"
            className={classNames({
              'overlay-spinner': isLoading,
            })}
          >
            <DetailProduct
              form={form}
              data={data}
              modal={modal}
              setModal={setModal}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              editData={editData}
              setEditData={setEditData}
              handleSave={handleSave}
              setIsDeleteRow={setIsDeleteRow}
              isEditMode={isEditMode}
              setDisableSubmit={setDisableSubmit}
              discountState={discountState}
              setDiscountState={setDiscountState}
              setSyncState={setSyncState}
              setSyncFlagState={setSyncFlagState}
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
        <Modal.Body>กรุณาเลือกข้อมูลลูกค้า</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setCustRequiredModal(false)}>
            ตกลง
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Detail;
