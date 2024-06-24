import React from 'react';
import { Card } from 'react-bootstrap';
import { useIntl } from 'react-intl';

const TableDataNotFound = ({ tableInstance, tableInstanceProduct }) => {
  const { formatMessage: f } = useIntl();
  const { data } = tableInstance;
  const { data: dataProduct } = tableInstanceProduct;

  if (data.length !== 0 || dataProduct.length !== 0) {
    return <></>;
  }

  return (
    <Card>
      <Card.Body style={{ textAlign: 'center' }}>{f({ id: 'common.no-data' })}</Card.Body>
    </Card>
  );
};

export default TableDataNotFound;
