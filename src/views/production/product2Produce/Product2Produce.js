import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ReactSortable } from 'react-sortablejs';
import { useIntl } from 'react-intl';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion, ToggleButton, Tabs, Tab, Nav } from 'react-bootstrap';

import HtmlHead from 'components/html-head/HtmlHead';
import ResponsiveNav from 'components/responsive-tab/ResponsiveTab';
import useProductionData from 'hooks/api/production/useProductionData';
import Premanufacture from './Premanufacture';
import Manufacturing from './Manufacturing';
import ManufacturingSubmit from './ManufacturingSubmit';
import './Product2Produce.style.scss';

const Product2Produce = (props) => {
  const { formatMessage: f, formatNumber } = useIntl();
  const tabLocal = localStorage.getItem('GroupingTab') || 'premanufacture';
  const title = f({ id: 'production.group.title' });
  const description = f({ id: 'production.group.description' });

  const renderColumns = useCallback(
    () => (
      <Row className="g-0 h-100 align-content-center d-none d-md-flex ps-5 pe-5 mb-2 custom-sort">
        <Col md="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
          <div className="text-muted text-small cursor-pointer sort">{f({ id: 'production.group.field.po-no' })}</div>
        </Col>
        <Col md="3" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">{f({ id: 'production.group.field.productCode' })}</div>
        </Col>
        <Col md="3" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">{f({ id: 'production.group.field.productName' })}</div>
        </Col>
        <Col md="2" className="d-flex flex-column pe-1 justify-content-end text-end">
          <div className="text-muted text-small cursor-pointer sort">{f({ id: 'production.group.field.quantity' })}</div>
        </Col>
      </Row>
    ),
    [f]
  );

  const handleSaveTab = (tab) => {
    localStorage.setItem('GroupingTab', tab);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        {/* Title Start */}
        <div className="page-title-container mb-3">
          <Row>
            <Col className="mb-2">
              <h1 className="mb-2 pb-0 display-4">{title}</h1>
              <div className="text-muted font-heading text-small">{description}</div>
            </Col>
          </Row>
        </div>
        {/* Title End */}
        <Tab.Container defaultActiveKey={`${tabLocal}`}>
          <Nav as={ResponsiveNav} className="nav-tabs-title nav-tabs-line-title" variant="tabs" activeKey="premanufacture">
            <Nav.Item style={{ width: '10rem' }}>
              <Nav.Link onClick={() => handleSaveTab('premanufacture')} eventKey="premanufacture">
                {f({ id: 'production.group.tab.premanufacture' })}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item style={{ width: '10rem' }}>
              <Nav.Link onClick={() => handleSaveTab('manufacturing')} eventKey="manufacturing">
                {f({ id: 'production.group.tab.manufacturing-list' })}
              </Nav.Link>
            </Nav.Item>
            {/* <Nav.Item>
              <Nav.Link onClick={() => handleSaveTab('postmanufacture')} eventKey="postmanufacture">
                {f({ id: 'production.group.tab.manufacturing-submit-list' })}
              </Nav.Link>
            </Nav.Item> */}
          </Nav>
          <Tab.Content className="mt-2">
            <Tab.Pane eventKey="premanufacture" title="สินค้ารอการผลิต" style={{ position: 'relative' }}>
              <Premanufacture />
            </Tab.Pane>
            <Tab.Pane eventKey="manufacturing">
              <Manufacturing />
            </Tab.Pane>
            {/* <Tab.Pane eventKey="postmanufacture">
              <ManufacturingSubmit />
            </Tab.Pane> */}
          </Tab.Content>
        </Tab.Container>
      </Col>
    </>
  );
};

export default Product2Produce;
