import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { Button, Card, Col, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Table from 'views/sales/components/table/Table';
import { request } from 'utils/axios-utils';
import useConvert from 'hooks/useConvert';
import useProductPlanOptions from 'hooks/useProductPlanOptions';

const searchProductionData =
  ({ filter, id, planOptionsList, f }) =>
  async () => {
    const productionFilterData = await request({ url: `/productionPlan/productionOrderList`, params: { ...filter } });
    const arr = [];
    productionFilterData.data.data.forEach((data) => {
      data.productSubType.forEach((dataSubType) => {
        dataSubType.itemList.forEach((dataItemlist) => {
          let currentStep;
          if (dataItemlist?.currentStep?.step?.toString().length === 3) {
            dataItemlist.currentStep = dataItemlist?.parentStep;
            currentStep = dataItemlist.currentStep;
          } else {
            currentStep = dataItemlist.currentStep;
          }
          const findStep = planOptionsList.find((itemF) => itemF?.value === (dataItemlist?.currentStep?.step || ''));
          arr.push({
            ...dataItemlist,
            currentStep: {
              ...findStep,
              ...currentStep,
              label: `${findStep?.label || `${f({ id: 'dailyPlan.field.notStart' })}`} ${currentStep?.status ? `( ${currentStep?.status} )` : ''}`,
            },
          });
        });
      });
    });
    const filterData = arr.filter((item) => item.id !== id);
    return filterData;
  };

const RelateWorkModal = ({ show, relatedId, onHide, onAdd, id, size, onRemove, handleChange }) => {
  console.log(size);
  const { formatMessage: f } = useIntl();
  const { useConvertCurrency } = useConvert();
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();

  const columns = useMemo(() => {
    return [
      {
        accessor: 'id',
      },
      {
        Header: f({ id: 'production.produce.relate.producedProductName' }),
        accessor: 'productName',
        sortable: true,
        headerClassName: 'text-uppercase w-30',
        Cell: ({ cell }) => {
          return <>{cell?.value || '-'}</>;
        },
      },
      {
        Header: f({ id: 'production.produce.relate.no' }),
        accessor: 'productionOrderNo',
        sortable: true,
        headerClassName: 'text-uppercase w-20 text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'production.produce.status' }),
        accessor: 'currentStep',
        sortable: true,
        headerClassName: 'text-uppercase w-20 text-center',
        Cell: ({ cell }) => {
          return <div className="text-center">{cell?.value?.label || '-'}</div>;
        },
      },
      {
        Header: f({ id: 'production.produce.relate.producedAmount' }),
        accessor: 'producedAmount',
        sortable: true,
        headerClassName: 'text-uppercase w-20 text-end',
        Cell: ({ cell }) => {
          return <div className="text-center">{useConvertCurrency(cell.value)}</div>;
        },
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty text-uppercase w-10 text-end',
        Cell: ({ row, addOrRemoveRm }) => {
          let isExisted = false;
          isExisted = relatedId === row.original.productionOrderId;

          return (
            <Button
              className="btn-icon btn-icon-only hover-outline active-scale-down"
              variant={isExisted ? 'outline-success' : 'outline-primary'}
              onClick={() => addOrRemoveRm(row.original)}
            >
              {isExisted ? <CsLineIcons icon="check" /> : <CsLineIcons icon="plus" />}
            </Button>
          );
        },
      },
    ];
  }, [f, relatedId]);

  const filter = { producedSize: size || '' };
  const [result, setResult] = useState([]);
  const [resultBase, setResultBase] = useState([]);
  const [pageSize, setPageSizeCn] = useState(10);

  const addOrRemoveRm = (value) => {
    let isExisted = false;
    isExisted = relatedId === value.productionOrderId;
    if (isExisted) {
      setPageSizeCn(10);
      onRemove(value.productionOrderId);
      setResult(resultBase);
    } else {
      setPageSizeCn(100);
      const selectedItem = resultBase.filter((item) => item.productionOrderId === value.productionOrderId);
      onAdd?.(value?.productionOrderId);
      handleChange({ target: { id: 'relatedProductionOrderValue', value: value?.productionOrderNo } });
      setResult(selectedItem);
    }
  };

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      // manualPagination: false,
      // manualFilters: false,
      // manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      addOrRemoveRm,
      initialState: { pageIndex: 0, hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const { setPageSize } = tableInstance;

  useEffect(() => {
    if (show) {
      setPageSize(pageSize);
      setPageSizeCn(10);
    }
  }, [show, setPageSize, pageSize]);

  const { isFetching } = useQuery(
    ['findProductionFilterData', filter, id],
    searchProductionData({ filter: { ...filter, statusMulti: 'INPROGRESS,SUBMITTED' }, id, planOptionsList, f }),
    {
      enabled: !!show,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const selectedItem = resp.filter((item) => item.productionOrderId === relatedId);
        setResultBase(resp);
        if (selectedItem.length > 0) {
          setResult(selectedItem || []);
        } else {
          setResult(resp || []);
        }
      },
      onError(err) {
        console.error('Search Error:', err);
      },
    }
  );

  const rowStyle = {
    height: '40px',
    border: '1px solid rgba(0, 0, 0, 0)',
    borderWidth: '1px 0',
    background: 'var(--foreground)',
  };

  const customStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
  };
  return (
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {f({ id: 'purchaseOrder.detail.purchaseItem.modal.add' })}
          {f({ id: 'production.produce.related-work' })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Row>
          <Col xs="12">
            <Card.Body className="half-padding">
              <Table tableInstance={tableInstance} isLoading={isFetching} customStyle={customStyle} rowStyle={rowStyle} />
            </Card.Body>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default RelateWorkModal;
