import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const Title = ({ data, onSubmit, isLoading }) => {
  const { formatMessage: f } = useIntl();
  const history = useHistory();

  return (
    <div className="page-title-container mb-3">
      <Row>
        <Col xs="auto" className="mb-2 align-self-md-center">
          <Button variant="link" className="btn-icon-only" style={{ padding: 0 }} onClick={() => history.goBack()}>
            <CsLineIcons icon="arrow-left" />
          </Button>
        </Col>
        <Col className="mb-2">
          {data?.no ? (
            <>
              <h1 className="mb-2 pb-0 display-4">
                {f({ id: 'customerOrder.detail.title' })}: {data.no}
              </h1>
              <div className="text-muted font-heading text-medium">
                {f({ id: 'customerOrder.detail.lastUpdatedAt' })} {data.updatedAt}
              </div>
            </>
          ) : (
            <h1 className="mb-2 pb-0 display-4">{f({ id: 'customerOrder.detail.add' })}</h1>
          )}
        </Col>
        <Col xs="8" sm="auto" className="d-none d-md-block">
          {/* <Button variant="outline-dark" className="btn-icon btn-icon-start w-100 w-md-auto" onClick={() => history.goBack()}>
            <CsLineIcons icon="arrow-left" /> <span>{f({ id: 'common.back' })}</span>
          </Button>{' '} */}
          <Button variant="info" type="submit" className="btn-icon btn-icon-start w-100 w-md-auto" onClick={onSubmit} disabled={isLoading}>
            <CsLineIcons icon="save" /> <span>{f({ id: 'common.save' })}</span>
          </Button>{' '}
          <Button variant="primary" className="btn-icon btn-icon-start w-100 w-md-auto" disabled={isLoading}>
            <CsLineIcons icon="send" /> <span>{f({ id: 'common.submit' })}</span>
          </Button>
        </Col>
        <Col xs="auto" className="d-md-none">
          <Button variant="outline-dark" className="btn-icon btn-icon-only w-md-auto" onClick={() => history.goBack()}>
            <CsLineIcons icon="arrow-left" />
          </Button>{' '}
          <Button variant="info" type="submit" className="btn-icon btn-icon-only w-md-auto" onClick={onSubmit} disabled={isLoading}>
            <CsLineIcons icon="save" />
          </Button>{' '}
          <Button variant="primary" className="btn-icon btn-icon-only w-md-auto" disabled={isLoading}>
            <CsLineIcons icon="send" />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Title;
