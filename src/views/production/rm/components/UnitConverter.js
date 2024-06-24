import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, CloseButton, Col, Form, Modal, Row } from 'react-bootstrap';
import { useAsyncDebounce, useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import clx from 'classnames';
import useMaterialLovData from 'hooks/api/master/lov/useMaterialLov';
import { TableBoxed } from 'components/react-table-custom';
import LovSelect from 'components/lov-select/LovSelect';
import NumberSpinner2 from 'components/number-spinner/NumberSpinner2';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import AddModal from './UnitConverterAdd';
import TablePagination from './TablePagination';

const globalTextFilter = (rows, ids, filterValue) =>
  rows.filter((row) => {
    return ids.some((id) => {
      const rowValue = row.values[id];
      return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
    });
  });

const ControlSearch = ({ tableInstance }) => {
  const {
    setGlobalFilter,
    gotoPage,
    state: { globalFilter },
  } = tableInstance;

  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || undefined);
    gotoPage(0);
  }, 200);

  return (
    <>
      <input
        className="form-control datatable-search"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Search"
      />
      {value && value.length > 0 ? (
        <span
          className="search-delete-icon"
          onClick={() => {
            setValue('');
            onChange('');
          }}
        >
          <CsLineIcons icon="close" />
        </span>
      ) : (
        <span className="search-magnifier-icon pe-none">
          <CsLineIcons icon="search" />
        </span>
      )}
    </>
  );
};

const ControlsDelete = ({ tableInstance }) => {
  const {
    selectedFlatRows,
    data,
    setData,
    state: { selectedRowIds },
  } = tableInstance;
  const onClick = () => {
    setData(data.filter((x, index) => selectedRowIds[index] !== true));
  };

  return (
    <Button variant="outline-danger" className="btn-icon btn-icon-only ms-1" onClick={onClick} disabled={selectedFlatRows.length === 0}>
      <CsLineIcons icon="bin" />
    </Button>
  );
};

const CheckCell = ({ row }) => {
  const { checked, onChange } = row.getToggleRowSelectedProps();
  return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
};

const UnitConverter = ({
  show,
  onHide,
  baseUOM,
  storeUnit,
  storeConversion,
  onChangeBaseUOM,
  onChangeStoreUnit,
  onChangeStoreConversion,
  touched = {},
  errors = {},
  bomHide = false,
}) => {
  const { formatMessage: f } = useIntl();

  const [isAddModalShow, setAddModalShow] = useState(false);
  const [result, setResult] = useState([]);

  const [internalBaseUOM, setInternalBaseUOM] = useState(baseUOM);
  const [internalStoreUnit, setInternalStoreUnit] = useState(storeUnit);
  const [internalStoreConversion, setInternalStoreConversion] = useState(storeConversion);

  useEffect(() => {
    if (show) {
      setInternalBaseUOM(baseUOM);
      setInternalStoreUnit(storeUnit);
      setInternalStoreConversion(storeConversion);
    }
  }, [show, baseUOM, storeConversion, storeUnit]);

  const translate = useMemo(
    () => ({
      title: f({ id: 'rm.unitConverter.title' }),
      subTitle: f({ id: 'rm.unitConverter.subTitle' }),
      common: {
        add: f({ id: 'common.add' }),
        delete: f({ id: 'common.delete' }),
        save: f({ id: 'common.save' }),
        cancel: f({ id: 'common.cancel' }),
        success: f({ id: 'common.save.success' }),
      },
      field: {
        code: f({ id: 'rm.field.code' }),
        abbr: f({ id: 'rm.field.abbr' }),
        name: f({ id: 'rm.unitConverter.field.name' }),
        typeOrGroup: f({ id: 'rm.field.typeOrGroup' }),
      },
    }),
    [f]
  );

  const { useUnitOfMaterialList, useUnitOfMaterialSelectFixed, useUnitOfMaterialGroupSaveMutation } = useMaterialLovData();
  const materialTypeGroup = useUnitOfMaterialSelectFixed();
  const { data, isLoading } = useUnitOfMaterialList();

  const handleSaveSuccess = useCallback(() => {
    // toast(translate.common.success, { className: 'success' });
    onChangeBaseUOM?.(internalBaseUOM);
    onChangeStoreUnit?.(internalStoreUnit || internalBaseUOM);
    onChangeStoreConversion?.(internalStoreConversion);
  }, [internalBaseUOM, internalStoreConversion, internalStoreUnit, onChangeBaseUOM, onChangeStoreConversion, onChangeStoreUnit, translate.common.success]);

  const { mutateAsync: save, isLoading: isSaving } = useUnitOfMaterialGroupSaveMutation({ onSuccess: handleSaveSuccess });

  useEffect(() => {
    if (show) setResult(data || []);
  }, [data, show]);

  const toggleAddModal = useCallback(() => {
    setAddModalShow((prev) => !prev);
  }, []);

  const columns = useMemo(
    () => [
      { accessor: 'id', hide: true },
      {
        Header: () => translate.field.code,
        accessor: 'code',
        headerClassName: 'text-alternate text-uppercase col-2',
      },
      {
        Header: () => translate.field.abbr,
        accessor: 'abbr',
        headerClassName: 'text-alternate text-uppercase col-2',
      },
      {
        Header: () => translate.field.name,
        accessor: 'name',
        headerClassName: 'text-alternate text-uppercase col-4',
      },
      {
        Header: () => translate.field.typeOrGroup,
        accessor: 'type',
        headerClassName: 'text-alternate text-uppercase col-3',
        Cell: ({ cell }) => {
          return materialTypeGroup.find((mtg) => mtg.id === cell.value)?.name || cell?.value;
        },
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: CheckCell,
      },
    ],
    [materialTypeGroup, translate.field]
  );

  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      // fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      custom: (rows, ids, filterValue) => {
        return [
          ...globalTextFilter(rows, ids, filterValue),
          ...rows.filter((row) => {
            const rowValue = materialTypeGroup.find((mtg) => mtg.id === row.values.type)?.name;
            return rowValue !== undefined ? String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase()) : true;
          }),
        ];
      },
    }),
    [materialTypeGroup]
  );

  const tableInstance = useTable(
    {
      columns,
      data: result,
      setData: setResult,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      // pageCount,
      // addOrRemove,
      initialState: { hiddenColumns: ['id'] },
      filterTypes,
      globalFilter: 'custom',
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  const handleSaveClick = useCallback(async () => {
    // TODO: Call Save result.
    console.debug('Saving :', result);

    await save(result);

    onHide?.();
  }, [onHide, result, save]);

  return (
    <Modal scrollable show={show} className={clx('fade')} size="xl" onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{translate.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3 w-100">
          <Col md="6" lg="5" xxl="5" className="mb-1">
            <div className="d-inline-block float-md-start me-1 mb-1 mb-md-0 search-input-container w-100 shadow bg-foreground">
              <ControlSearch tableInstance={tableInstance} />
            </div>
          </Col>
          <Col md className="text-end mb-1">
            <Button variant="success" className="btn-icon btn-icon-start ms-1 shadow" onClick={toggleAddModal}>
              <CsLineIcons icon="plus" /> {translate.common.add}
            </Button>
            <ControlsDelete tableInstance={tableInstance} />
          </Col>
        </Row>
          <Row className="mb-3">
            <Col xs="12">
              <TableBoxed useEmptyRow tableInstance={tableInstance} />
              <TablePagination tableInstance={tableInstance}/>
            </Col>
          </Row>
        <AddModal show={isAddModalShow} translate={translate} tableInstance={tableInstance} onHide={toggleAddModal} />
      </Modal.Body>
      <Modal.Footer>
        <Row className="mb-3 w-100">
          <Col xs="3" className="ps-0">
            <Form.Group className={!bomHide ? 'position-relative tooltip-end-top' : 'd-none'} controlId="baseUOM">
              <Form.Label>{f({ id: 'rm.field.baseUOM' })}</Form.Label>
              <LovSelect name="baseUOM" isClearable lov="MATERIAL_BASEUOM" menuPlacement="top" onChange={setInternalBaseUOM} value={internalBaseUOM || ''} />
              {errors.baseUOM && touched.baseUOM && <div className="d-block invalid-feedback">{f({ id: errors.baseUOM })}</div>}
            </Form.Group>
          </Col>
          <Col xs="2">
            <Form.Group className={!bomHide ? 'position-relative tooltip-end-top' : 'd-none'}>
              <Form.Label>&nbsp;</Form.Label>
              <NumberSpinner2 name="storeConversion" min="0" value={internalStoreConversion} onChange={setInternalStoreConversion} />
              {errors.storeConversion && touched.storeConversion && <div className="d-block invalid-feedback">{f({ id: errors.storeConversion })}</div>}
            </Form.Group>
          </Col>
          <Col xs="3">
            <Form.Group className={!bomHide ? 'position-relative tooltip-end-top' : 'd-none'} controlId="storeUnit">
              <Form.Label>{f({ id: 'rm.field.storeUnit' })}</Form.Label>
              <LovSelect
                name="storeUnit"
                isClearable
                lov="MATERIAL_STOREUNIT"
                menuPlacement="top"
                value={internalStoreUnit || ''}
                onChange={setInternalStoreUnit}
              />
              {errors.storeUnit && touched.storeUnit && <div className="d-block invalid-feedback">{f({ id: errors.storeUnit })}</div>}
            </Form.Group>
          </Col>
          <Col xs className="text-end align-self-end pe-0">
            <Button variant="outline-secondary" className="btn-icon btn-icon-start ms-1" onClick={onHide}>
              <CsLineIcons icon="close" /> {translate.common.cancel}
            </Button>
            <Button
              variant="primary"
              className={clx('btn-icon btn-icon-start ms-1 shadow', {
                'overlay-spinner': isSaving,
              })}
              onClick={handleSaveClick}
              disabled={isSaving}
            >
              <CsLineIcons icon="save" /> {translate.common.save}
            </Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
};

export default UnitConverter;
