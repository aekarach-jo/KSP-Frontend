import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import Dropzone, { defaultClassNames } from 'react-dropzone-uploader';
import DropzonePreview from 'components/dropzone/DropzonePreview';

const DropzoneTextFiles = ({ onAddFile }) => {
  const { formatMessage: f } = useIntl();
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
      inputContent={f({ id: 'customerOrder.detail.uploadModal.uploadDescription' })}
    />
  );
};

const AddProductModal = ({ modal, setModal, onUpload }) => {
  const { formatMessage: f } = useIntl();

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
        <Modal.Title>{f({ id: 'customerOrder.detail.uploadModal.title' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DropzoneTextFiles onAddFile={handleOnAddFile} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-dark" onClick={onHide}>
          {f({ id: 'common.cancel' })}
        </Button>
        <Button onClick={handleOnUpload}>{f({ id: 'common.upload' })}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductModal;
