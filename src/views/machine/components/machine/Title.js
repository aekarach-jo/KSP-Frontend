import React from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useHistory } from 'react-router-dom';

const Title = ({ title, description }) => {
  const { formatMessage: f } = useIntl();
  const history = useHistory();

  return (
    <div className="page-title-container mb-3">
      <Row>
        <Col className="mb-2">
          <h1 className="mb-2 pb-0 display-4">{title}</h1>
          <div className="text-muted font-heading text-small">{description}</div>
        </Col>
        <Col xs="8" sm="auto" className="d-none d-md-block">
          <Button variant="primary" className="btn-icon btn-icon-start w-100 w-md-auto" onClick={() => history.push('/master/machine/new')}>
            <CsLineIcons icon="plus" /> <span>{f({ id: 'machine.list.add' })}</span>
          </Button>
        </Col>
        <Col xs="auto" className="d-md-none">
          <Button variant="primary" className="btn-icon btn-icon-only w-md-auto">
            <CsLineIcons icon="plus" />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Title;
