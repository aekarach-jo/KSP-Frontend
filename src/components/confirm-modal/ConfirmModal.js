import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import clx from 'classnames';

const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, ...rest }) => {
  const { formatMessage: f } = useIntl();

  return (
    <Modal
      className={clx('large fade', className)}
      show={show}
      onHide={onCancel}
      contentClassName={clx({ 'overlay-spinner': loading })}
      backdrop={loading ? 'static' : true}
      {...rest}
    >
      <Modal.Header>
        <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{confirmText}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
          {cancelText || f({ id: 'common.cancel' })}
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {okText || f({ id: 'common.ok' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
