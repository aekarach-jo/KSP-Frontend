/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import * as Yup from 'yup';
import clx from 'classnames';
import Select from 'react-select';
import { SERVICE_URL } from 'config';
import axios from 'axios';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { TableBoxed } from 'components/react-table-custom';
import { useFormik } from 'formik';

const validationSchema = Yup.object().shape({
  code: Yup.string().required('test'),
});
const AddWarningModal = ({ show, onHide, list, onAdd, onRemove, codeResult, abbrResult, nameResult, templateResult, onSave }) => {
  const { formatMessage: f } = useIntl();
  const [abbr, setAbbr] = useState(abbrResult);
  const [code, setCode] = useState(codeResult);
  const [name, setName] = useState(nameResult);
  const [templateName, setTemplateName] = useState('');
  const [templateOption, setTemplateOption] = useState('');
  const [checkStatus, setCheckStatus] = useState(false);
  const [checkTemplate, setCheckTemplate] = useState(false);

  const callGetMasterTemplate = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/outsource/lov/template/list`);
    return data;
  };
  useEffect(async () => {
    const resultTemplate = await callGetMasterTemplate();
    resultTemplate.forEach((dataJ, index) => {
      dataJ.value = dataJ.id;
      dataJ.label = dataJ.name;
      list.forEach((e) => {
        if (e.linkId === dataJ.id) {
          e.template = dataJ.name;
        }
      });
    });
    setTemplateOption(resultTemplate);
  }, [list]);
  const columns = useMemo(() => {
    return [
      {
        Header: () => f({ id: 'tooling.table.code' }),
        accessor: 'code',
        headerClassName: 'text-muted text-uppercase w-20',
      },
      {
        Header: () => f({ id: 'tooling.table.abbr' }),
        accessor: 'abbr',
        headerClassName: 'text-muted text-uppercase w-20',
      },
      {
        Header: () => f({ id: 'tooling.table.type' }),
        accessor: 'name',
        headerClassName: 'text-muted text-uppercase w-20',
      },
      {
        Header: () => f({ id: 'outsource.field.template' }),
        accessor: 'template',
        colClassName: 'text-end',
        headerClassName: 'text-muted text-end text-uppercase w-20',
      },
      {
        id: 'action',
        colClassName: 'text-end',
        Cell: ({ row, removeTypeTooling }) => {
          // const isExisted = result?.some((item) => item?.id === row.values.id);
          return (
            // eslint-disable-next-line prettier/prettier
            <Button className="btn-icon btn-icon-only hover-outline active-scale-down" onClick={() => removeTypeTooling(row)}>
              <CsLineIcons icon="minus" />
            </Button>
          );
        },
      },
    ];
  }, [f, list, templateOption]);

  const formik = useFormik({ initialValues: { abbr: '', code: '', name: '', template: '' }, validationSchema, onSubmit: null });

  const { handleSubmit, handleChange, handleReset, values, errors, touched } = formik;

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
    setCheckStatus(false);
    setCode(e.target.value);
  };

  const handleChangeAbbr = (e) => {
    setAbbr(e.target.value);
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
  };
  const handleChangeTemplate = (e) => {
    setCheckTemplate(false);
    setTemplateName(e);
  };

  return (
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide}>
      <Modal.Header>
        <Modal.Title>การจัดการข้อควรระวัง</Modal.Title>
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
                  <Col sm="3" md="4" lg="4">
                    <Form.Label className="col-form-label">{f({ id: 'tooling.table.type' })}</Form.Label>
                  </Col>
                  <Col sm="2" md="2" lg="4">
                    <Form.Label className="col-form-label">{f({ id: 'outsource.field.template' })}</Form.Label>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg="2" md="2" sm="3">
                    <Form.Control isInvalid={checkStatus} type="text" name="code" value={code} onChange={handleChangeCode} />
                    {errors.description && touched.description && <div className="d-block invalid-feedback">{f({ id: errors.description })}</div>}
                  </Col>
                  <Col lg="2" md="2" sm="3">
                    <Form.Control type="text" value={abbr} onChange={handleChangeAbbr} />
                  </Col>
                  <Col sm="3" md="4" lg="4">
                    <Form.Control type="text" value={name} onChange={handleChangeName} />
                  </Col>
                  <Col lg="2" md="2" sm="3">
                    <Select classNamePrefix="react-select" options={templateOption} value={templateName} onChange={handleChangeTemplate} placeholder="..." />
                  </Col>
                  <Col sm="1" md="1" lg="1">
                    <Button
                      variant="primary"
                      className="btn-icon btn-icon-start w-20"
                      onClick={() => {
                        let checkCode = false;
                        let checkTemp = false;
                        for (let i = 0; i < list.length; i += 1) {
                          if (list[i].code === code) {
                            checkCode = true;
                            setCheckStatus(true);
                          }
                        }
                        if (code === '') {
                          checkCode = true;
                          setCheckStatus(true);
                        }
                        if (templateName === '') {
                          checkTemp = true;
                          setCheckTemplate(true);
                        }
                        if (!checkCode && !checkTemp) {
                          onAdd?.({ code, abbr, name, templateName: templateName?.label, linkId: templateName?.value });
                          setCode('');
                          setAbbr('');
                          setName('');
                          setTemplateName(templateName);
                        }
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
        <Button type="submit" onClick={onSave}>
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddWarningModal;
