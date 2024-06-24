import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import { Accordion, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import Glide from 'components/carousel/Glide';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import LovStatusTypeSelect from 'views/master/tooling-detail/components/LovStatusTypeSelect';

const initialValues = { code: '', name: '', type: '', status: false, statusTypeMulti: [], maintenanceObjectiveMulti: [] };
const statusOptions = [
  { value: false, label: 'INVALID' },
  { value: true, label: 'VALID' },
];
const objectiveOptions = [
  { label: 'สั่งทำใหม่', value: 'สั่งทำใหม่' },
  { label: 'แก้ไข', value: 'แก้ไข' },
  { label: 'ซ่อมแซม', value: 'ซ่อมแซม' },
  { label: 'ปรับเปลี่ยน', value: 'ปรับเปลี่ยน' },
  { label: 'ทำลาย', value: 'ทำลาย' },
];

const FilterForm = ({ show, tableInstance }) => {
  const [onRefetchLov, setOnRefetchLov] = useState(false);
  const [typeToolingOptions, setTypeTooling] = useState();
  const { formatMessage: f } = useIntl();

  const { filterList, gotoPage, setFilter } = tableInstance;

  const countTypeVariables = Object.keys(filterList)
    .filter((key) => key.startsWith('count_type_'))
    .map((key) => ({ name: key, value: filterList[key] }));
  countTypeVariables.sort((a, b) => {
    const numberA = parseInt(a.name.replace('count_type_', ''), 10);
    const numberB = parseInt(b.name.replace('count_type_', ''), 10);
    return numberA - numberB;
  });

  // if (tableInstance.data.length > 0) {
  //   const result = tableInstance.data.reduce((acc, obj) => {
  //     const existing = acc.find((item) => item.type === obj.type);
  //     if (existing) {
  //       existing.valueList.push(obj);
  //     } else {
  //       acc.push({ type: obj.type, valueList: [obj] });
  //     }
  //     toolingType.current = acc;
  //     return acc;
  //   }, []);
  //   console.log(result);
  // }

  const onSubmit = (values) => {
    console.log(values);

    console.log(values);
    const objTive = values.maintenanceObjectiveMulti.map((data) => data?.value).join(',');
    console.log(objTive);
    let dataResult = {};
    if (values.status.value === undefined) {
      dataResult = {
        code: values.code,
        name: values.name,
        type: values.type.value !== undefined ? values.type.value : values.type,
        statusTypeMulti: values.statusTypeMulti || undefined,
        maintenanceObjectiveMulti: objTive || undefined,
      };
    } else {
      dataResult = {
        code: values.code,
        name: values.name,
        status: values.status.value,
        type: values.type.value !== undefined ? values.type.value : values.type,
        statusTypeMulti: values.statusTypeMulti || undefined,
        maintenanceObjectiveMulti: objTive || undefined,
      };
    }

    setFilter({ ...dataResult, page: 0 });
    gotoPage(0);
  };

  const formik = useFormik({ initialValues, onSubmit });
  const { handleSubmit, handleChange, values, handleReset } = formik;

  const onReset = (e) => {
    handleReset(e);
    setFilter({ page: 0 });
    gotoPage(0);
  };

  const handleChangeStatus = (value) => {
    handleChange({ target: { id: 'status', value } });
  };
  const handleChangeStatusType = (value) => {
    const statusType = value.map((data) => data?.detail.code).join(',');
    console.log(statusType);
    handleChange({ target: { id: 'statusTypeMulti', value: statusType } });
  };

  const handleChangeType = (value) => {
    handleChange({ target: { id: 'type', value } });
    handleSubmit();
  };

  const handleChangeTypeFilter = (value) => {
    handleChange({ target: { id: 'type', value } });
  };
  const handleChangeObjective = (value) => {
    handleChange({ target: { id: 'maintenanceObjectiveMulti', value } });
  };

  const callGetMasterType = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_TYPE`);
    return data;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    // eslint-disable-next-line no-use-before-define
    const resultType = await callGetMasterType();

    const type = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const elementType of resultType) {
      // eslint-disable-next-line no-var
      if (!elementType.isDeleted) {
        const objType = {
          detail: elementType,
          value: elementType.code,
          label: elementType.name,
        };
        type.push(objType);
      }
    }
    setTypeTooling(type);
  }, []);

  console.log(values);

  return (
    <Row className="mb-5">
      <Row className="gx-2">
        <Col className="p-0">
          <Glide
            // noControls

            options={{
              gap: 0,
              rewind: false,
              bound: true,
              perView: 6,

              breakpoints: {
                400: { perView: 1 },
                600: { perView: 2 },
                1400: { perView: 3 },
                1600: { perView: 4 },
                1900: { perView: 5 },
                3840: { perView: 6 },
              },
            }}
          >
            {/* {countTypeVariables && resultData(countTypeVariables)} */}
            <Glide.Item>
              <Card className="hover-border-primary mb-5" onClick={() => handleChangeType('01')}>
                <Card.Body className="p-4 text-center align-items-center d-flex flex-column justify-content-between">
                  <Row className="w-100">
                    <Col md="8" lg="8" className="d-flex align-items-center justify-content-center flex-column">
                      <div className="sh-5 sw-5 bg-gradient-light mb-3 rounded-xl">
                        <CsLineIcons icon="print" className="text-white mt-2" />
                      </div>
                      <p className="mb-0 lh-1">เพลทแม่พิมพ์</p>
                    </Col>
                    <Col md="4" lg="4" className="m-auto">
                      <p className="cta-3 mb-0 text-primary">{filterList?.count_type_01 || 0}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card className="hover-border-primary mb-5" onClick={() => handleChangeType('02')}>
                <Card.Body className="p-4 text-center align-items-center d-flex flex-column justify-content-between">
                  <Row className="w-100">
                    <Col md="8" lg="8" className="d-flex align-items-center justify-content-center flex-column">
                      <div className="sh-5 sw-5 bg-gradient-light mb-3 rounded-xl">
                        <CsLineIcons icon="print" className="text-white mt-2" />
                      </div>
                      <p className="mb-0 lh-1">เพลทแม่ปั๊ม</p>
                    </Col>
                    <Col md="4" lg="4" className="m-auto">
                      <p className="cta-3 mb-0 text-primary">{filterList?.count_type_02 || 0}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card className="hover-border-primary mb-5" onClick={() => handleChangeType('03')}>
                <Card.Body className="p-4 text-center align-items-center d-flex flex-column justify-content-between">
                  <Row className="w-100">
                    <Col md="8" lg="8" className="d-flex align-items-center justify-content-center flex-column">
                      <div className="sh-5 sw-5 bg-gradient-light mb-3 rounded-xl">
                        <CsLineIcons icon="print" className="text-white mt-2" />
                      </div>
                      <p className="mb-0 lh-1">แผ่นหน้าโม</p>
                    </Col>
                    <Col md="4" lg="4" className="m-auto">
                      <p className="cta-3 mb-0 text-primary">{filterList?.count_type_03 || 0}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card className="hover-border-primary mb-5" onClick={() => handleChangeType('04')}>
                <Card.Body className="p-4 text-center align-items-center d-flex flex-column justify-content-between">
                  <Row className="w-100">
                    <Col md="8" lg="8" className="d-flex align-items-center justify-content-center flex-column">
                      <div className="sh-5 sw-5 bg-gradient-light mb-3 rounded-xl">
                        <CsLineIcons icon="print" className="text-white mt-2" />
                      </div>
                      <p className="mb-0 lh-1">เพลทงานเคลือบ</p>
                    </Col>
                    <Col md="4" lg="4" className="m-auto">
                      <p className="cta-3 mb-0 text-primary">{filterList?.count_type_04 || 0}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card className="hover-border-primary mb-5" onClick={() => handleChangeType('05')}>
                <Card.Body className="p-4 text-center align-items-center d-flex flex-column justify-content-between">
                  <Row className="w-100">
                    <Col md="8" lg="8" className="d-flex align-items-center justify-content-center flex-column">
                      <div className="sh-5 sw-5 bg-gradient-light mb-3 rounded-xl">
                        <CsLineIcons icon="print" className="text-white mt-2" />
                      </div>
                      <p className="mb-0 lh-1">แผ่นยางรอง</p>
                    </Col>
                    <Col md="4" lg="4" className="m-auto">
                      <p className="cta-3 mb-0 text-primary">{filterList?.count_type_05 || 0}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
            <Glide.Item>
              <Card className="hover-border-primary mb-5" onClick={() => handleChangeType('05')}>
                <Card.Body className="p-4 text-center align-items-center d-flex flex-column justify-content-between">
                  <Row className="w-100">
                    <Col md="8" lg="8" className="d-flex align-items-center justify-content-center flex-column">
                      <div className="sh-5 sw-5 bg-gradient-light mb-3 rounded-xl">
                        <CsLineIcons icon="print" className="text-white mt-2" />
                      </div>
                      <p className="mb-0 lh-1">อุปกรณ์รีดลา่ย</p>
                    </Col>
                    <Col md="4" lg="4" className="m-auto">
                      <p className="cta-3 mb-0 text-primary">{filterList?.count_type_06 || 0}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Glide.Item>
          </Glide>
        </Col>
      </Row>
      <Col>
        <Accordion>
          <Accordion.Collapse in={show} eventKey="standardCollapse">
            <Card body className="mt-2">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={4} className="mb-3">
                    <Form.Label>{f({ id: 'tooling.type' })}</Form.Label>
                    <Select classNamePrefix="react-select" options={typeToolingOptions} value={values.type} onChange={handleChangeTypeFilter} />
                  </Col>
                  <Col xs={12} md={5} className="mb-3">
                    <Form.Label>{f({ id: 'tooling.name' })}</Form.Label>
                    <Form.Control type="text" name="name" onChange={handleChange} value={values.name} />
                  </Col>
                  <Col xs={12} md={3} className="mb-3">
                    <Form.Label>{f({ id: 'company.status' })}</Form.Label>
                    <Select classNamePrefix="react-select" options={statusOptions} value={values.status} onChange={handleChangeStatus} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'tooling.statusType' })}</Form.Label>
                    <LovStatusTypeSelect
                      classNamePrefix="react-select"
                      // options={statusOptions}
                      // isDisabled={!isEditMode}
                      value={values.statusTypeMulti}
                      // required
                      onRefetchLov={onRefetchLov}
                      setOnRefetchLov={setOnRefetchLov}
                      onChange={handleChangeStatusType}
                      isMulti
                    />
                    {/* <Select classNamePrefix="react-select" options={statusOptions} value={values.status} onChange={handleChangeStatus} /> */}
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Label>{f({ id: 'tooling.objective' })}</Form.Label>
                    <Select
                      classNamePrefix="react-select"
                      options={objectiveOptions}
                      value={values.maintenanceObjectiveMulti}
                      onChange={handleChangeObjective}
                      isMulti
                    />
                  </Col>
                </Row>
                <div className="mt-3" style={{ textAlign: 'center' }}>
                  <Button type="submit" variant="primary">
                    {f({ id: 'common.search' })}
                  </Button>{' '}
                  <Button variant="light" onClick={onReset}>
                    {f({ id: 'common.reset' })}
                  </Button>
                </div>
              </Form>
            </Card>
          </Accordion.Collapse>
        </Accordion>
      </Col>
    </Row>
  );
};

export default FilterForm;
