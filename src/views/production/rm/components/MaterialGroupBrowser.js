import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, CloseButton, Col, Form, Modal, Row } from 'react-bootstrap';
import { useAsyncDebounce, useGlobalFilter, usePagination, useRowSelect, useRowState, useSortBy, useTable } from 'react-table';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import clx from 'classnames';
import useMaterialLovData from 'hooks/api/master/lov/useMaterialLov';
import { TableBoxed } from 'components/react-table-custom';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import AddModal from './MaterialGroupBrowserAdd';
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
    state: { globalFilter },
  } = tableInstance;

  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || undefined);
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
  if (row.original?.isFixed) {
    return '';
  }

  const { checked, onChange } = row.getToggleRowSelectedProps();
  return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
};

const MaterialGroupBrowser = ({ show, onHide }) => {
  const { formatMessage: f } = useIntl();

  const [isAddModalShow, setAddModalShow] = useState(false);
  const [result, setResult] = useState([]);

  const translate = useMemo(
    () => ({
      title: f({ id: 'rm.materialGroup.title' }),
      subTitle: f({ id: 'rm.materialGroup.subTitle' }),
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
        name: f({ id: 'rm.field.name' }),
        typeOrGroup: f({ id: 'rm.field.typeOrGroup' }),
      },
    }),
    [f]
  );

  const { useMaterialLovTypeGroupList, useMaterialTypeGroupSelectFixed, useMaterialLovTypeGroupSaveMutation } = useMaterialLovData();
  const materialTypeGroup = useMaterialTypeGroupSelectFixed();
  const { data, isLoading } = useMaterialLovTypeGroupList();

  const handleSaveSuccess = useCallback(() => {
    toast(translate.common.success, { className: 'success' });
  }, [translate.common.success]);

  const { mutateAsync: save, isLoading: isSaving } = useMaterialLovTypeGroupSaveMutation({ onSuccess: handleSaveSuccess });

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
        sortable: true,
        headerClassName: 'text-uppercase col-2',
      },
      {
        Header: () => translate.field.abbr,
        accessor: 'abbr',
        sortable: true,
        headerClassName: 'text-uppercase col-2',
      },
      {
        Header: () => translate.field.name,
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-uppercase col-4',
      },
      {
        Header: () => translate.field.typeOrGroup,
        accessor: 'type',
        sortable: true,
        headerClassName: 'text-uppercase col-3',
        Cell: ({ cell }) => {
          return materialTypeGroup.find((mtg) => mtg.id === cell.value).name || cell.value;
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
            const rowValue = materialTypeGroup.find((mtg) => mtg.id === row.values.type).name;
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
      // manualPagination: false,
      // manualFilters: false,
      // manualSortBy: false,
      autoResetPage: false,
      autoResetSortBy: false,
      initialState: { sortBy: [{ id: 'code', desc: false }], hiddenColumns: ['id'] },
      filterTypes,
      globalFilter: 'custom',
      isSelectable: ({ row }) => !row.original?.isFixed,
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
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{translate.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
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
            <TableBoxed useEmptyRow tableInstance={tableInstance} customStyle={customStyle} rowStyle={rowStyle} />
            <TablePagination tableInstance={tableInstance} />
          </Col>
        </Row>
        <AddModal show={isAddModalShow} translate={translate} tableInstance={tableInstance} onHide={toggleAddModal} />
      </Modal.Body>
      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  );
};

export default MaterialGroupBrowser;
