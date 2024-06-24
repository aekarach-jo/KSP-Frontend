import React, { useEffect, useState, useRef } from 'react';
import { Badge, Button, Col, Form, Nav, Row, Tab, ToggleButton, Modal } from 'react-bootstrap';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowSelect, useRowState } from 'react-table';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import classNames from 'classnames';
import Select from 'react-select';
import { useIntl } from 'react-intl';
import moment from 'moment';

import GroupProductionPlanOperation from 'views/production/operator/components/manage-operation/GroupProductionPlan';
import ReactToPrint from 'react-to-print';
import GroupProductionPlan from 'views/production/daily-plan/components/manage-operation/GroupProductionPlan';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import LovMachineSelectSingle from 'components/lov-select/LovMachineSelectSingle';
import ControlsPageSize from './components/ControlsPageSize';
import ControlsAdd from './components/ControlsAdd';
import ControlsEdit from './components/ControlsEdit';
import ControlsDelete from './components/ControlsDelete';
import ModalAddEdit from './components/ModalAddEdit';
import TablePagination from './components/TablePagination';
import ResponsiveNav from './components/ResponsiveNav';
import TableDataNotFound from './components/TableDataNotFound';
import TableBody from './components/TableProductionPlan';
import './components/style.css';
import CardPrintingMachineList from './components/CardPrintingMachineList';

const dummyData = [
  { id: 1, name: 'Basler Brot', sales: 213, stock: 15, category: 'Sourdough', tag: 'New' },
  { id: 2, name: 'Bauernbrot', sales: 633, stock: 97, category: 'Multigrain', tag: 'Done' },
  { id: 3, name: 'Kommissbrot', sales: 2321, stock: 154, category: 'Whole Wheat', tag: '' },
  { id: 4, name: 'Lye Roll', sales: 973, stock: 39, category: 'Sourdough', tag: '' },
  { id: 5, name: 'Panettone', sales: 563, stock: 72, category: 'Sourdough', tag: 'Done' },
  { id: 6, name: 'Saffron Bun', sales: 98, stock: 7, category: 'Whole Wheat', tag: '' },
  { id: 7, name: 'Ruisreikäleipä', sales: 459, stock: 90, category: 'Whole Wheat', tag: '' },
  { id: 8, name: 'Rúgbrauð', sales: 802, stock: 234, category: 'Whole Wheat', tag: '' },
  { id: 9, name: 'Yeast Karavai', sales: 345, stock: 22, category: 'Multigrain', tag: '' },
  { id: 10, name: 'Brioche', sales: 334, stock: 45, category: 'Sourdough', tag: '' },
  { id: 11, name: 'Pullman Loaf', sales: 456, stock: 23, category: 'Multigrain', tag: '' },
  { id: 12, name: 'Soda Bread', sales: 1152, stock: 84, category: 'Whole Wheat', tag: '' },
  { id: 13, name: 'Barmbrack', sales: 854, stock: 13, category: 'Sourdough', tag: '' },
  { id: 14, name: 'Buccellato di Lucca', sales: 1298, stock: 212, category: 'Multigrain', tag: '' },
  { id: 15, name: 'Toast Bread', sales: 2156, stock: 732, category: 'Multigrain', tag: '' },
  { id: 16, name: 'Cheesymite Scroll', sales: 452, stock: 24, category: 'Sourdough', tag: '' },
  { id: 17, name: 'Baguette', sales: 456, stock: 33, category: 'Sourdough', tag: '' },
  { id: 18, name: 'Guernsey Gâche', sales: 1958, stock: 221, category: 'Multigrain', tag: '' },
  { id: 19, name: 'Bazlama', sales: 858, stock: 34, category: 'Whole Wheat', tag: '' },
  { id: 20, name: 'Bolillo', sales: 333, stock: 24, category: 'Whole Wheat', tag: '' },
];

const TableCard = ({
  setShowModal,
  setShowModaReceive,
  setProductId,
  setProductList,
  patchingOptions,
  productTypeOptions,
  setShowButtonAdd,
  filterData,
  setConfirm,
  setOperationData,
  setFilterData,
  tableTab,
  setProductionData,
  toolingOptions,
  machineOptions,
  setTableTab,
  tableInstanceGroup,
  onChangeDate,
  productList,
  isOperation = false,
  tabs = [],
  ...tableConfig
}) => {
  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-30',
        Cell: ({ cell }) => {
          return (
            <a
              className="list-item-heading body"
              href="#!"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              {cell.value}
            </a>
          );
        },
      },
      { Header: 'Sales', accessor: 'sales', sortable: true, headerClassName: 'text-muted text-small text-uppercase w-10' },
      { Header: 'Stock', accessor: 'stock', sortable: true, headerClassName: 'text-muted text-small text-uppercase w-10' },
      { Header: 'Category', accessor: 'category', sortable: true, headerClassName: 'text-muted text-small text-uppercase w-20' },
      {
        Header: 'Tag',
        accessor: 'tag',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-10',
        Cell: ({ cell }) => {
          return <Badge bg="outline-primary">{cell.value}</Badge>;
        },
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row }) => {
          const { checked, onChange } = row.getToggleRowSelectedProps();
          return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
        },
      },
    ];
  }, []);

  const [data, setData] = useState(dummyData);
  const [filterPrint, setFilterPrint] = useState({});
  const [showFilter, toggleFilter] = useState(false);
  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const componentRef = useRef(null);
  const { formatMessage: f } = useIntl();

  const defaultTableInstance = useTable(
    { columns, data, setData, isOpenAddEditModal, setIsOpenAddEditModal, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  const tableInstance = tableConfig?.tableInstance;
  const tableInstance2 = tableConfig?.tableInstance2;

  const renderHeader = ({ tableInstance: tableInstanceHeader, filter }) => {
    const { gotoPage, setFilter } = tableInstanceHeader;

    const onSetFilter = (dataResult) => {
      const result = dataResult.map((item) => item.value).join(',');
      setFilter({ sortMultiCondition: result, page: 0 });
      gotoPage(0);
    };

    const handleChangeDate = (date) => {
      setFilter({ planDate: moment(date).format('YYYY-MM-DD') });
      gotoPage(0);
    };
    const onReset = (date) => {
      setFilter({});
      gotoPage(0);
    };
    const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
      return (
        <>
          <Modal
            className={classNames('large fade', className)}
            show={show}
            onHide={onCancel}
            contentClassName={classNames({ 'overlay-spinner': loading })}
            backdrop={loading ? 'static' : true}
          >
            <Modal.Header>
              <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{confirmText}</Modal.Body>
            <Modal.Footer>
              <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
                {cancelText || f({ id: 'common.cancel' })}
              </Button>
              <ReactToPrint
                trigger={() => {
                  return (
                    <Button variant="info" size="small" onClick={() => setModal()} disabled={loading}>
                      {f({ id: 'common.ok' })}
                    </Button>
                  );
                }}
                content={() => componentRef.current}
              />
            </Modal.Footer>
          </Modal>
        </>
      );
    };
    return (
      <Row className="mb-3">
        <Col sm="12" md="5" lg="4" xxl="3">
          {!tableInstanceHeader?.hideSearch && (
            <>
              <div>{f({ id: 'quotation.field.dateRange' })}</div>
              <div className="d-flex flex-row justify-content-start align-items-center gap-2 w-100">
                <div className="d-inline-block float-md-start me-1 my-1 mb-md-0 search-input-container shadow bg-foreground" style={{ width: '55%' }}>
                  <DatepickerThaiYear inputClass="custom-input text-center" value=" " onChange={(e) => handleChangeDate(e, {})} />
                </div>
                <div style={{ width: '10%' }}>
                  <Button className="mt-1" variant="outline-light" onClick={() => onReset(true)}>
                    {f({ id: 'common.reset' })}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Col>
        <Col sm="12" md="7" lg="8" xxl="9" className="text-end">
          <div className="d-inline-block me-0 me-sm-3 float-start float-md-none">
            <ControlsAdd tableInstance={tableInstanceHeader} /> <ControlsEdit tableInstance={tableInstanceHeader} />{' '}
            <ControlsDelete tableInstance={tableInstanceHeader} />
          </div>
          <div className="d-flex justify-content-end align-items-end gap-1 text-start">
            {filter && (
              <>
                <Select
                  className="multiFilter"
                  classNamePrefix="react-select"
                  placeholder="select sorting..."
                  onChange={onSetFilter}
                  isMulti
                  isClearable
                  options={[
                    { label: 'ชื่อสินค้า', value: 'productName' },
                    { label: 'รหัสการผลิต', value: 'productionOrderNo' },
                    { label: 'จำนวนผลิต', value: '-producedAmount' },
                    { label: 'สถานะการตัด', value: 'cuttingStatus' },
                    { label: 'สถานะปัจจุบัน', value: 'status' },
                    { label: 'กำหนดส่ง', value: 'CODeliverDt' },
                    { label: 'step', value: 'step' },
                    { label: 'Printing Color', value: 'productPrintColor' },
                    { label: 'วันที่สร้าง', value: 'planDate' },
                  ]}
                />
                <div className="d-inline-block me-1 float-start float-md-none">
                  <ToggleButton
                    id="filterToggle"
                    type="checkbox"
                    variant="foreground"
                    className="btn-icon btn-icon-only shadow"
                    checked={showFilter}
                    onClick={() => toggleFilter(!showFilter)}
                  >
                    <CsLineIcons icon="filter" />
                  </ToggleButton>
                </div>
              </>
            )}
            {tableTab === 'fourt' && (
              <>
                <Select
                  className="multiFilter"
                  classNamePrefix="react-select"
                  isClearable
                  options={[
                    { value: 'printing', label: 'งานพิมพ์' },
                    { value: 'glueing', label: 'งานปะ' },
                    { value: 'rolling', label: 'งานรีดลาย' },
                    { value: 'pumping', label: 'งานปั๊ม' },
                  ]}
                  onChange={(v) => {
                    setFilterPrint({ ...filterPrint, type: v?.value, machineCode: '' });
                  }}
                  // onChange={(value) => {
                  //   handleChange({ target: { id: 'status', value } });
                  // }}
                />
                <div className="d-inline-block float-md-start me-1 my-1 mb-md-0 search-input-container shadow bg-foreground" style={{ width: '20%' }}>
                  <DatepickerThaiYear
                    inputClass="custom-input text-center"
                    value=" "
                    onChange={(date) => {
                      setFilterPrint({ ...filterPrint, planDate: moment(date).format('YYYY-MM-DD') });
                      gotoPage(0);
                    }}
                  />
                </div>
                <LovMachineSelectSingle
                  name="machineId"
                  className="multiFilter"
                  classNamePrefix="react-select"
                  isClearable
                  // isDisabled={!filterPrint.type}
                  filterPrint={filterPrint}
                  value={filterPrint}
                  onChange={(value) => {
                    setFilterPrint({ ...filterPrint, machineCode: value?.value });
                  }}
                  // value={values.machineId || ''}
                  // isDisabled={!isEditMode}
                />
                <Button
                  variant="warning"
                  className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1"
                  // disabled
                  // disabled={!filterPrint.type}
                  onClick={() => setIsConfirmModal(true)}
                >
                  <CsLineIcons icon="print" /> <span>Export</span>
                </Button>
                <ConfirmModal
                  show={isConfirmModal}
                  setModal={setIsConfirmModal}
                  // loading={supplier}
                  titleText={f({ id: 'common.warning' })}
                  confirmText={f({ id: 'common.confirm' })}
                  // onConfirm={handleConfirm}
                  onCancel={() => {
                    setIsConfirmModal(false);
                  }}
                />
              </>
            )}

            {!tableInstanceHeader?.hidePageSize && <ControlsPageSize tableInstance={tableInstanceHeader} />}
          </div>
        </Col>
      </Row>
    );
  };

  const renderContainer = ({ tableInstance: tableInstanceContainer, tableInstance2: tableInstanceContainerGroup, isLoading, isLoadingGroup }) => {
    return (
      <div
        className={classNames({
          'overlay-spinner': isLoading && tableTab !== 'fourt',
        })}
      >
        {tableTab === 'fourt' ? (
          <Row>
            <Col xs="12">
              {isOperation ? (
                <GroupProductionPlanOperation
                  setShowModaReceive={setShowModaReceive}
                  setShowModal={setShowModal}
                  setProductId={setProductId}
                  setProductionData={setProductionData}
                  setProductList={setProductList}
                  onChangeDate={onChangeDate}
                  className="react-table rows"
                  tableInstance={tableInstanceContainer}
                  tableInstanceGroup={tableInstanceContainerGroup}
                  tableTab={tableTab}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  show={showFilter}
                  toggleFilter={!showFilter}
                  isLoading={isLoading}
                  isLoadingGroup={isLoadingGroup}
                  toolingOptions={toolingOptions}
                  machineOptions={machineOptions}
                  setConfirm={setConfirm}
                  setOperationData={setOperationData}
                />
              ) : (
                <GroupProductionPlan
                  setShowModaReceive={setShowModaReceive}
                  operationQuery={tableConfig?.operationQuery}
                  operationQueryGroup={tableConfig?.operationQueryGroup}
                  setShowModal={setShowModal}
                  setProductId={setProductId}
                  setProductionData={setProductionData}
                  setProductList={setProductList}
                  onChangeDate={onChangeDate}
                  className="react-table rows"
                  tableInstance={tableInstanceContainer}
                  tableInstanceGroup={tableInstanceContainerGroup}
                  tableTab={tableTab}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  show={showFilter}
                  toggleFilter={!showFilter}
                  isLoading={isLoading}
                  isLoadingGroup={isLoadingGroup}
                  toolingOptions={toolingOptions}
                  machineOptions={machineOptions}
                  // setConfirm={setConfirm}
                />
              )}
              {/* <TableDataNotFound tableInstance={tableInstanceContainer} /> */}
            </Col>
            {/* <Col xs="12">
            <TablePagination tableInstance={tableInstanceContainer} />
          </Col> */}
          </Row>
        ) : (
          <Row>
            <Col xs="12">
              <TableBody
                setShowModal={setShowModal}
                className="react-table rows"
                setShowModaReceive={setShowModaReceive}
                setProductId={setProductId}
                setProductionData={setProductionData}
                setProductList={setProductList}
                tableInstance={tableInstanceContainer}
              />
              <TableDataNotFound tableInstance={tableInstanceContainer} />
            </Col>
            {/* <Col xs="12">
          <TablePagination tableInstance={tableInstanceContainer} />
        </Col> */}
          </Row>
        )}
        <CardPrintingMachineList
          filterPrint={filterPrint}
          setFilterPrint={setFilterPrint}
          componentRef={componentRef}
          className="react-table rows"
          tableInstance={tableInstanceContainerGroup}
          tableTab={tableTab}
          isConfirmModal={isConfirmModal}
          toolingOptions={toolingOptions}
          productList={productList}
          patchingOptions={patchingOptions}
          productTypeOptions={productTypeOptions}
        />
      </div>
    );
  };

  const renderFilter = ({ component, tableInstance: tableInstanceFilter, isLoading }) => {
    const FilterComponent = component;
    if (!component) return <></>;

    return (
      <Col className="mt-3">
        <FilterComponent
          filterData={filterData}
          setFilterData={setFilterData}
          tableInstance={tableInstanceFilter}
          show={showFilter}
          toggleFilter={!showFilter}
          isLoading={isLoading}
        />
      </Col>
    );
  };
  const handleClickTab = (key) => {
    setTableTab(key);
  };
  return (
    <>
      <Row>
        <Col>
          <div>
            {tabs.length > 0 ? (
              <Tab.Container defaultActiveKey={tabs[0].eventKey}>
                <Tab.Content>
                  {tabs.map(({ eventKey, tableInstance: tableInstanceTab, filter }) => (
                    <Tab.Pane key={eventKey} eventKey={eventKey}>
                      {tableInstanceTab && renderHeader({ tableInstance: tableInstanceTab, filter })}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
                <Tab.Content>
                  {tabs
                    .filter((tab) => tab.filter)
                    .map(({ eventKey, filter, isLoading, tableInstance: tableInstanceTab }) => (
                      <Tab.Pane key={eventKey} eventKey={eventKey}>
                        {renderFilter({ tableInstance: tableInstanceTab, component: filter, isLoading })}
                      </Tab.Pane>
                    ))}
                </Tab.Content>
                <Nav variant="tabs" className="nav-tabs-title nav-tabs-line-title mx-3" activeKey={tabs[0].eventKey} as={ResponsiveNav}>
                  {tabs.map(({ eventKey, label }) => {
                    return (
                      <Nav.Item key={eventKey} className="w-auto">
                        <Nav.Link eventKey={eventKey} onClick={() => handleClickTab(eventKey)}>
                          {label}
                        </Nav.Link>
                      </Nav.Item>
                    );
                  })}
                </Nav>
                <Tab.Content>
                  {tabs.map(({ eventKey, isLoading, isLoadingGroup, tableInstance: tableInstanceTab }) => (
                    <Tab.Pane key={eventKey} eventKey={eventKey}>
                      {tableInstanceTab && renderContainer({ tableInstance: tableInstanceTab, tableInstance2: tableInstanceGroup, isLoading, isLoadingGroup })}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Tab.Container>
            ) : (
              <>
                {renderHeader({ tableInstance, filter: tableConfig?.filter })}
                {renderFilter({ tableInstance, isLoading: tableConfig?.isLoading, component: tableConfig?.filter })}
                {renderContainer({ tableInstance, tableInstance2, isLoading: tableConfig?.isLoading, isLoadingGroup: tableConfig?.isLoadingGroup })}
              </>
            )}
          </div>
          {tableInstance?.selectedFlatRows && <ModalAddEdit tableInstance={tableInstance} />}
        </Col>
      </Row>
    </>
  );
};

export default TableCard;
