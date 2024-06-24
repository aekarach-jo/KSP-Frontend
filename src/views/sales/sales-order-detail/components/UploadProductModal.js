import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Dropzone, { defaultClassNames } from 'react-dropzone-uploader';
import DropzonePreview from 'components/dropzone/DropzonePreview';

const DropzoneTextFiles = ({ onAddFile }) => {
  // const getUploadParams = () => ({ url: 'https://httpbin.org/post' });

  const onChangeStatus = (fileWithMeta, status) => {
    if (status === 'done') {
      onAddFile(fileWithMeta);
    }
  };

  return (
    <Dropzone
      // getUploadParams={getUploadParams}
      PreviewComponent={DropzonePreview}
      submitButtonContent={null}
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      submitButtonDisabled
      SubmitButtonComponent={null}
      inputWithFilesContent={null}
      onChangeStatus={onChangeStatus}
      classNames={{ inputLabelWithFiles: defaultClassNames.inputLabel }}
      inputContent="ลากไฟล์มาที่นี่หรือคลิกเพื่ออัปโหลด"
    />
  );
};

const AddProductModal = ({ modal, setModal, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleOnAddFile = (value) => {
    setFile(value?.file);
  };

  const handleOnUpload = () => {
    onUpload(file);
  };

  const onHide = () => {
    setModal(false);
  };

  return (
    <Modal className="modal-right large" show={modal} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>อัปโหลดรายการสินค้า</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DropzoneTextFiles onAddFile={handleOnAddFile} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-dark" onClick={onHide}>
          ยกเลิก
        </Button>
        <Button onClick={handleOnUpload}>อัปโหลด</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductModal;
