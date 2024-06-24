/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import clx from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { TableBoxed } from 'components/react-table-custom';
import { useFormik } from 'formik';

const AddAdditionalItemModal = ({ show, onHide, list, onAdd, onRemove , codeResult , abbrResult , nameResult , onSave}) => {
  const { formatMessage: f } = useIntl();
  const [abbr, setAbbr] = useState(abbrResult);
  const [code, setCode] = useState(codeResult);
  const [name, setName] = useState(nameResult);

  const columns = useMemo(() => {
    return [
      {
        Header: () => f({ id: 'tooling.table.code' }),
        accessor: 'code',
        headerClassName: 'text-muted text-uppercase',
      },
      {
        Header: () => f({ id: 'tooling.table.abbr' }),
        accessor: 'abbr',
        headerClassName: 'text-muted text-uppercase',
      },
      {
        Header: () => f({ id: 'tooling.table.type' }),
        accessor: 'name',
        headerClassName: 'text-muted text-uppercase',
      },
      {
        Header: 'Action',
        id: 'action',
        headerClassName: 'text-muted text-uppercase',
        Cell: ({ row, removeTypeTooling }) => {
          // const isExisted = result?.some((item) => item?.id === row.values.id);
          return (
            // eslint-disable-next-line prettier/prettier
            <Button
              className="btn-icon btn-icon-only hover-outline active-scale-down"
              onClick={() => removeTypeTooling(row)}
            >
              <CsLineIcons icon="minus" />
            </Button>
          );
        },
      },
    ];
  }, [f, list]);

  const formik = useFormik({ initialValues: { abbr : '', code: '', name: '' }, onSubmit: null });

  const { handleSubmit, handleChange, handleReset , values } = formik;

  const removeTypeTooling = (rm) => {
    onRemove?.(rm.index);
  };

  const tableInstance = useTable(
    {
      columns,
      data: list,
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      removeTypeTooling,
      initialState: { pageIndex: 0, sortBy: [{ id: 'name', desc: false }], hiddenColumns: ['id'] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  // const onReset = (e) => {
  //   handleReset(e);
  //   // onReset?.();
  // };

  const handleChangeCode = (e) => {
    setCode(e.target.value)

  }

  const handleChangeAbbr = (e) => {
    setAbbr(e.target.value)
  }

  const handleChangeName = (e) => {
    setName(e.target.value)
  }

  return (
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide}>
      <Modal.Header>
        <Modal.Title>{f({ id: 'tooling.manage.type' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col>
            <Card body>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-1">
                  <Col lg="2" md="2" sm="4">
                    <Form.Label className="col-form-label">{f({ id: 'tooling.table.code' })}</Form.Label>
                  </Col>
                  <Col lg="2" md="2" sm="4">
                    <Form.Label className="col-form-label">{f({ id: 'tooling.table.abbr' })}</Form.Label>
                  </Col>
                  <Col sm="4" md="8" lg="8">
                    <Form.Label className="col-form-label">{f({ id: 'tooling.table.type' })}</Form.Label>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg="2" md="2" sm="3">
                    <Form.Control type="text" value={code} onChange={handleChangeCode} />
                  </Col>
                  <Col lg="2" md="2" sm="3">
                    <Form.Control type="text"  value={abbr} onChange={handleChangeAbbr} />
                  </Col>
                  <Col sm="5" md="7" lg="7">
                    <Form.Control type="text" value={name} onChange={handleChangeName} />
                  </Col>
                  <Col sm="1" md="1" lg="1">
                    <Button
                      variant="primary"
                      className="btn-icon btn-icon-start w-22"
                      onClick={() => {
                        console.log('code : ' , code)
                        onAdd?.({ code, abbr, name });
                        setCode('')
                        setAbbr('')
                        setName('')
                      }}
                    >
                      <CsLineIcons icon="plus" />
                    </Button>
                  </Col>
                </Row>

                {/* <RmFilterForm formik={formik} onReset={handlefilterFormReset} /> */}
              </Form>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs="12">
            <Card>
              <Card.Body className="half-padding">
                <TableBoxed className="react-table boxed" tableInstance={tableInstance} />
              </Card.Body>
            </Card>
          </Col>
          <Col xs="12">{/* <TablePagination tableInstance={tableInstance} /> */}</Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-dark" onClick={onHide}>
          {f({ id: 'common.cancel' })}
        </Button>
        <Button type="submit" onClick={onSave}>{f({ id: 'common.save' })}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAdditionalItemModal;
