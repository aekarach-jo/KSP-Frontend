import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import clx from 'classnames';
import { NavLink, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { SERVICE_URL } from 'config';
import { useFormik } from 'formik';
import Select from 'react-select';
import { useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { Row, Col, Dropdown, Button, OverlayTrigger, Form, Tooltip, Card, Badge, Pagination, Accordion } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import useCuttingData from 'hooks/api/cutting/useCuttingData';
import ButtonFilterToggle from 'components/buttonFilterToggle/ButtonFilterToggle';
import DropdownPageSize from 'components/dropdown-page-size';
import TableCard from 'views/sales/components/table/TableCardInventory';
import Table from './components/Table';
import TablePagination from './components/TablePagination';
import CuttingSearch from './components/CuttingSearch';
import FilterForm from './components/FilterForm';
import PageTitle from '../../sales/components/page-title/PageTitle';
import './style.css';

const LayoutButton = ({ row, cell, value, onClick, text }) => {
  // console.log({ row, cell, value });
  return (
    <Button variant="primary" className="btn-icon btn-icon-start mb-1 position-md-absolute" style={{ minWidth: 140 }} onClick={onClick}>
      <span>{text}</span>
    </Button>
  );
};
const initialValues = { materialThickness: '', status: 1 };

const CuttingGroupList = ({ location }) => {
  const [isEdit, setIsEdit] = useState(false);
  const { formatMessage: f, formatDate: fd, formatTime: ft } = useIntl();
  const { push } = useHistory();
  const statusOptions = [
    { value: 'PASSED', label: 'PASSED' },
    { value: 'REJECTED', label: 'FAILED' },
  ];

  const lang = useMemo(
    () => ({
      title: f({ id: 'cutting.group.list.title' }),
      description: f({ id: 'cutting.group.list.description' }),
    }),
    [f]
  );

  // console.debug('params :', location);
  const searchParams = new URLSearchParams(location.search);
  const productionOrder = searchParams.get('productionOrder');
  // const priority = searchParams.get('priority');
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState({});
  const [isShowFilter, setShowFilter] = useState(false);
  const [result, setResult] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [validateStatus, setValidateStatus] = useState({});
  const [matchStatus, setMatchStatus] = useState(false);
  const ToastCreateSuccess = () => {
    return (
      <>
        <div className="mb-2">
          <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
          <span className="align-middle text-primary heading font-heading">{f({ id: 'company.save.success' })}</span>
        </div>
      </>
    );
  };
  const onSubmit = async (formData) => {
    // setFilter({ ...values, page: 0 });
    await axios.post(`${SERVICE_URL}/cuttingList/saveCuttingValidation`, formData, {
      headers: {
        'content-type': 'application/json',
      },
    });
    const tempData = {
      productionOrder: formData.productionOrder,
      cuttingStatus: formData.cuttingStatus,
    };
    await axios.post(`${SERVICE_URL}/cuttingList/saveCutting`, tempData, {
      headers: {
        'content-type': 'application/json',
      },
    });
    toast(<ToastCreateSuccess />);
  };
  const initialState = {
    status: result[0]?.status || '',
  };

  const formik = useFormik({ initialValues: initialState, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, values, handleReset, errors, touched } = formik;
  const toggleFilter = () => {
    setShowFilter(!isShowFilter);
  };

  const layoutButtonCell = useCallback(
    ({ row }) => {
      let contentButton;
      if (row.original.matchSelect || matchStatus) {
        contentButton = (
          <LayoutButton row={row} text={f({ id: 'cutting.group.layoutBtn' })} onClick={() => push(`/production/cutting/detail/${productionOrder}`)} />
        );
      } else {
        contentButton = <></>;
      }
      return contentButton;
    },
    [f, push, matchStatus]
  );

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
              {f({ id: 'cutting.group.field.name' })}
            </div>
          );
        },
        accessor: 'productName',
        sortable: true,
        headerClassName: 'text-uppercase',
        colClassName: 'd-flex flex-column justify-content-center mb-md-0 mt-4 ',
        headerProps: { xs: 12, md: 10 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                padding: '5px',
              }}
            >
              {f({ id: 'cutting.group.field.dueDate' })}
            </div>
          );
        },
        accessor: 'dueDate',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-md-0 mt-4 ',
        headerProps: { xs: 12, md: 2 },
        // Cell: BadgeCell,
        Cell: ({ cell }) => fd(cell.value) || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
              {f({ id: 'cutting.group.field.lotNo' })}
            </div>
          );
        },
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-2 mt-4 position-relative',
        headerProps: { xs: 12, md: 6 },
        Cell: ({ cell }) => cell.value,
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'dailyPlan.field.startMachine' })}</div>;
        },
        accessor: 'cuttingStartAt',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-md-0 mt-4 ',
        headerProps: { xs: 12, md: 3 },
        // Cell: BadgeCell,
        Cell: ({ cell }) => fd(cell.value) || '-',
      },
      {
        Header: () => {
          return (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.08)',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                padding: '5px',
              }}
            >
              {f({ id: 'dailyPlan.field.endMachine' })}
            </div>
          );
        },
        accessor: 'cuttingAt',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-md-0 mt-4 ',
        headerProps: { xs: 12, md: 3 },
        // Cell: BadgeCell,
        Cell: ({ cell }) => fd(cell.value) || '-',
      },
      {
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}>
              {f({ id: 'cutting.group.field.qtyPerItem' })}
            </div>
          );
        },
        accessor: 'materialUsedAmount',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-2 mt-4 position-relative',
        headerProps: { xs: 4, md: 3 },
        // Cell: BadgeCell,
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        Header: () => {
          return <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }}>{f({ id: 'cutting.group.field.unit' })}</div>;
        },
        accessor: 'materialStoreUnit',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-2 mt-4 position-relative',
        headerProps: { xs: 4, md: 3 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        //
        Header: () => {
          return (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '5px', width: '85%' }}>
              {f({ id: 'cutting.group.field.priority' })}
            </div>
          );
        },
        accessor: 'priority',
        sortable: true,
        headerClassName: 'text-uppercase text-bold',
        colClassName: 'd-flex flex-column mb-2 mt-4 position-relative',
        headerProps: { xs: 4, md: 4 },
        Cell: ({ cell }) => cell.value || '-',
      },
      {
        //
        Header: (cell) => {
          return (
            <>
              <div style={cell?.data[0]?.matchStatus ? { background: '#DEB887', height: '100%' } : { height: '100%' }}>
                {f({ id: 'cutting.group.field.match' })}
              </div>
            </>
          );
        },
        accessor: 'matchPerItem',
        sortable: true,
        headerClassName: `text-uppercase text-bold text-center`,
        colClassName: 'd-flex flex-column mb-0 mt-4 mb-md-4 position-relative text-center',
        headerProps: { xs: 6, md: 2 },
        Cell: ({ cell }) => {
          return (
            <>
              <div style={cell?.row?.original?.matchStatus ? { background: '#DEB887', height: '30px' } : { height: '100%' }}>
                {cell?.row?.original?.matchPerItem}
              </div>
            </>
          );
        },
      },
      {
        Header: () => {
          return (
            <>
              <div className="d-flex flex-row justify-content-start  mb-md-3">
                <div
                  style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', padding: '5px' }}
                  className="w-30 text-bold text-uppercase text-bold "
                >
                  {f({ id: 'cutting.group.field.material' })}
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }} className="w-20 text-bold text-uppercase text-bold">
                  {f({ id: 'cutting.group.field.batchNo' })}
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }} className="w-20 text-bold text-uppercase text-bold">
                  {f({ id: 'cutting.group.field.amount' })}
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }} className="w-20 text-bold text-uppercase text-bold">
                  {f({ id: 'cutting.group.field.remaining' })}
                </div>
                {/* <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }} className="w-10 text-bold text-uppercase text-bold">
                  {f({ id: 'cutting.group.field.dueDate' })}
                </div> */}
                <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }} className="w-10 text-bold text-uppercase text-bold">
                  {f({ id: 'cutting.group.field.thick' })}
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '5px' }} className="w-10 text-bold text-uppercase text-bold md-2">
                  {f({ id: 'cutting.group.field.status' })}
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    padding: '5px',
                    marginRight: '1rem',
                  }}
                  className="w-0"
                >
                  {' '}
                </div>
              </div>
            </>
          );
        },

        accessor: 'productionOrder',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 mb-md-4 card-bg',
        headerClassName: 'text-uppercase text-bold',
        headerProps: { xs: 12, md: 12 },
        Cell: ({ cell }) => {
          return (
            <>
              {cell?.row?.original?.productionOrderList.map((v, index) => (
                <div className="card-inner" key={index}>
                  <div>
                    {v?.materialList.map((e, subIndex) => (
                      <div key={subIndex}>
                        <div key={index} className="card-inner">
                          {e?.itemList.map((vS, sIndex) => (
                            <Form onSubmit={handleSubmit} key={sIndex}>
                              <div className="d-flex">
                                <div className="w-30 mb-2">{e.materialCode}</div>
                                <div className="w-20 mb-2">{vS.materialBatchNo}</div>
                                <div className="w-20 mb-2">{vS.convertAmount}</div>
                                <div className="w-20 mb-2">
                                  {vS.remaining} {e.materialStoreUnit}
                                </div>
                                {/* <div className="w-10 mb-2">{fd(vS.dueDate)}</div> */}
                                <div className="w-10 mb-2 custom-input-container" style={{ marginRight: '0.5rem' }}>
                                  <Form.Control
                                    type="text"
                                    name="materialThickness"
                                    className="custom-placeholder-input"
                                    disabled
                                    // onChange={handleChange}
                                    value={e.materialThickness}
                                  />
                                  {e.materialThicknessUOM !== null ? <div className="placeholder-text">{e.materialThicknessUOM}</div> : ''}
                                </div>
                                <div className="w-10 mb-2" style={{ marginRight: '0.5rem' }}>
                                  <Select
                                    // isDisabled={!isEdit}
                                    classNamePrefix="react-select"
                                    options={statusOptions}
                                    value={values?.status[sIndex] || ''}
                                    onChange={(value) => {
                                      if (value !== null) {
                                        handleChange({ target: { id: `status[${sIndex}]`, value } });
                                      } else {
                                        handleChange({ target: { id: `status[${sIndex}].status`, value: '' } });
                                      }
                                    }}
                                  />
                                </div>
                                <div className="w-0">
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    className="btn-icon btn-icon-only mb-1"
                                    // disabled={!isEdit}
                                    onClick={async () => {
                                      const formData = {
                                        batchNo: vS.materialBatchNo,
                                        status: values.status[sIndex]?.value,
                                        material: e.materialId,
                                        productionOrder: v.productionOrderId,
                                      };
                                      if (values.status[sIndex]?.value !== undefined) {
                                        if (values.status[sIndex]?.value === 'NEW') {
                                          formData.cuttingStatus = 'PARTIAL';
                                        } else {
                                          formData.cuttingStatus = 'MATCHED';
                                        }
                                        setMatchStatus(true);
                                        onSubmit(formData);
                                        setValidateStatus({ id: sIndex, value: false });
                                      } else {
                                        setMatchStatus(false);
                                        setValidateStatus({ id: sIndex, value: true });
                                      }
                                    }}
                                  >
                                    <CsLineIcons icon="edit" />
                                  </Button>
                                </div>
                              </div>
                              {sIndex === validateStatus.id && validateStatus.value && (
                                <div className="d-block invalid-feedback">{f({ id: 'cutting.detail.validation.status' })}</div>
                              )}
                              {/* {errors?.status[sIndex] && touched?.status[sIndex] && <div className="d-block invalid-feedback">{f({ id: errors.status })}</div>} */}
                            </Form>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          );
        },
      },
      // {
      //   accessor: 'matchPerItem',
      //   sortable: true,
      //   colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-4 card-bg',
      //   headerClassName: 'text-uppercase text-bold',
      //   headerProps: { xs: 12, md: 12 },
      //   Cell: ({ cell }) => {
      //     const conditionBg = cell?.row?.original?.matchStatus;
      //     return (
      //       <>
      //         <div className="d-flex flex-row justify-content-start">
      //           <div
      //             className="w-20 text-bold text-uppercase text-bold"
      //             style={cell?.row?.original?.matchStatus ? { background: '#DEB887', height: '100%' } : { height: '100%' }}
      //           >
      //             {f({ id: 'cutting.group.field.match' })}
      //           </div>
      //         </div>
      //         <div>
      //           <div className="w-20" style={cell?.row?.original?.matchStatus ? { background: '#DEB887', height: '100%' } : { height: '100%' }}>
      //             {cell?.row?.original?.matchPerItem}
      //           </div>
      //         </div>
      //       </>
      //     );
      //   },
      // },
      {
        id: 'action',
        colClassName: 'd-flex flex-column justify-content-center mb-2 mb-md-4 card-bg',
        headerProps: { xs: 12, md: 1 },
        Cell: layoutButtonCell,
      },
    ];
  }, [f, fd, ft, layoutButtonCell, isEdit, handleSubmit, values, handleChange, validateStatus, setValidateStatus]);
  const tableInstance = useTable(
    {
      columns,
      data: result,
      setResult,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      hideSearch: true,
      hidePageSize: true,
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    // useRowSelect,
    useRowState
  );

  const {
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = tableInstance;

  const { useItemListToCuttingQuery } = useCuttingData();
  const { data, isLoading, refetch } = useItemListToCuttingQuery({
    filter: {
      ...filter,
      productionOrderId: productionOrder,
    },
    pageIndex,
    limit: pageSize,
    sortBy,
  });

  useEffect(() => setResult(data || []), [data]);

  const handleCuttingSearch = useCallback(
    (keyword) => {
      gotoPage(0);
      setFilter({ materialName: keyword });
    },
    [gotoPage]
  );

  const handleFilterFormSearch = useCallback(
    (_filter) => {
      // console.log('filter :', _filter);
      gotoPage(0);
      setFilter(_filter);
    },
    [gotoPage]
  );
  const handlefilterFormReset = useCallback(() => {
    gotoPage(0);
    setFilter({});
  }, [gotoPage]);
  const handleEditClick = () => {
    setIsEdit(true);
  };
  const handleSubmitClick = () => {
    // if (id !== undefined) {
    //   handleChange({ target: { id: 'instanceSubmit', value: true } });
    // }
    // handleChange({ target: { id: 'isSubmit', value: true } });
    // handleSubmit();
    setIsEdit(true);
  };
  const cancelClick = () => {
    setIsEdit(false);
    // resetForm();
  };
  return (
    <>
      {/* Title Start */}
      <PageTitle
        title={`${lang.title}: ${result[0]?.productionOrderNo}`}
        description={lang.description}
        isLoading={isLoading}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: cancelClick, isHide: !isEdit },
          // save: {
          // label: f({ id: 'common.save' }),
          // onSubmit: handleSubmitClick,
          //  isHide: !isEdit
          // },
          // delete: { label: ' ', onDelete: handleCancelClick, isHide: data?.status === 'CANCELLED' || isEditMode || !id },
          // submit: {
          //   label: f({ id: 'common.submit' }),
          //   onSubmit: handleSubmitClick,
          //   isHide: data?.status === 'SUBMITTED' || data?.status === 'CANCELLED' || !isEditMode,
          // },
        }}
      />

      {/* <Row className="mb-3">
        <Col md="6" lg="4" xxl="3" className="mb-1">
          <CuttingSearch onSearch={handleCuttingSearch} />
        </Col>
        <Col md="6" lg xxl className="mb-1 text-end">
          <ButtonFilterToggle onClick={toggleFilter} open={isShowFilter} />
          <DropdownPageSize currentPageSize={pageSize} setPageSize={setPageSize} />
        </Col>
      </Row> */}

      {/* Table Start */}
      <Row className={clx({ 'overlay-spinner': isLoading })}>
        <Col xs="12">
          <TableCard tableInstance={tableInstance} />
        </Col>
        <Col xs="12">
          <TablePagination tableInstance={tableInstance} />
        </Col>
      </Row>
      {/* Table End */}
    </>
  );
};

export default CuttingGroupList;
