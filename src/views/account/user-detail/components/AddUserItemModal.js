/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Button, Card, Form, Modal, Table, useAccordionButton } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import axios from 'axios';
import { SERVICE_URL } from 'config';

const AddUserItemModal = ({ show, setShowModal, onSave, roleOptions }) => {
  const { formatMessage: f } = useIntl();
  const [listData, setListData] = useState(roleOptions);
  const [permission, setPermission] = useState([]);
  const [list, setList] = useState([]);
  const [errCodeItemModal, setErrorCodeItemModal] = useState();

  // const [onClickCollapse, setOnClickCollapse] = useState(false);

  const [obj, setObj] = useState({ abbr: '', code: '', id: '', name: '', permissionList: [] });

  // console.log(roleOptions);

  const callGetPermissionList = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/permission/list`);
    return data;
  };

  useEffect(async () => {
    const resultPermissionList = await callGetPermissionList();
    const p = [];
    resultPermissionList.forEach((elementPermission) => {
      if (!elementPermission.isDeleted) {
        const objP = {
          id: elementPermission.id,
          code: elementPermission.code,
          value: elementPermission.name,
          label: elementPermission.name,
          name: elementPermission.name,
          status: false,
        };
        p.push(objP);
      }
    });
    setList(p);
  }, []);

  const onAddPermissionList = (value, e) => {
    // e is boolean when you checked
    if (e.target.checked) {
      setPermission([...permission, value.id]);
    } else {
      const arr = permission?.filter((data) => (data !== value.id ? data : ''));
      setPermission(arr);
    }
  };

  useEffect(() => {
    setObj({ ...obj, permissionList: permission });
  }, [permission]);

  const onAdd = (code) => {
    const checkCode = listData.find((data) => data.code === code);
    console.log(checkCode);

    if (checkCode) {
      console.log(checkCode);
      const message = `This code (${checkCode.code}) already exists. Please input another one`;
      setErrorCodeItemModal(message);
    } else {
      setObj({ abbr: '', code: '', id: '', name: '', permissionList: [] });
      setPermission({ ...permission, status: false });
      setListData([...listData, obj]);
      setErrorCodeItemModal('');
    }
  };

  const removeItem = (index) => {
    listData.splice(index, 1);
    setListData([...listData]);
  };

  function onCollapse(value) {
    list.forEach((key) => {
      key.status = false;
      value.forEach((subkey) => {
        if (key.id === subkey) {
          key.status = true;
        }
      });
    });
    setList([...list]);
  }

  function CustomToggleButton({ children, eventKey, value }) {
    const decoratedOnClick = useAccordionButton(eventKey, () => {
      onCollapse(value);
    });
    return (
      <Button variant="outline-secondary border-0" className="btn-icon btn-icon-end" onClick={decoratedOnClick}>
        <span>{children}</span>
        <CsLineIcons className="ms-2" icon="arrow-double-bottom" />
      </Button>
    );
  }
  console.log(list);

  return (
    <Modal show={show} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: `user.name` })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="scroll-section" id="hoverableRows">
          <Accordion>
            <Table>
              <thead>
                <tr>
                  <th className="w-10" scope="col">
                    {f({ id: 'user.table.code' })}
                  </th>
                  <th className="w-10" scope="col">
                    {f({ id: 'user.table.abbr' })}
                  </th>
                  <th className="w-60" scope="col">
                    {f({ id: 'user.table.role' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-1">
                    <Form.Control
                      type="text"
                      name="code"
                      onChange={(e) => setObj({ ...obj, code: e.target.value })}
                      value={obj.code}
                      // isInvalid={errors.code && touched.code}
                      // readOnly={!isEditMode}
                    />
                  </td>
                  <td className="px-1">
                    <Form.Control
                      type="text"
                      name="abbr"
                      onChange={(e) => setObj({ ...obj, abbr: e.target.value })}
                      value={obj.abbr}
                      // isInvalid={errors.code && touched.code}
                      // readOnly={!isEditMode}
                    />
                  </td>
                  <td className="px-1">
                    <Form.Control
                      type="text"
                      name="name"
                      onChange={(e) => setObj({ ...obj, name: e.target.value })}
                      value={obj.name}
                      // isInvalid={errors.code && touched.code}
                      // readOnly={!isEditMode}
                    />
                  </td>
                  <td>
                    <Button className="w-100" variant="primary" type="submit" onClick={() => onAdd(obj.code)}>
                      {f({ id: 'common.add' })}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0'}} colSpan={4}>
                    {errCodeItemModal !== undefined && <div colSpan={4} className="d-block invalid-feedback">{errCodeItemModal}</div>}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <Card body className="no-shadow border w-90">
                      {list?.map((item, index) => (
                        <div className="mb-1" key={index}>
                          <label className="form-check w-100 mb-0">
                            <input type="checkbox" value={item.status} className="form-check-input" onChange={(e) => onAddPermissionList(item, e)} />
                            <span className="form-check-label d-block">
                              <span className="mb-1 lh-1-25">{item.label}</span>
                              {/* <span className="text-muted d-block text-small mt-0">03.05.2021 - 12:00</span> */}
                            </span>
                          </label>
                        </div>
                      ))}
                    </Card>
                  </td>
                </tr>

                {listData.length > 0 && (
                  <>
                    {listData?.map((item, index) => (
                      <tr className="" key={index}>
                        <td>{item.code}</td>
                        <td>{item.abbr}</td>
                        <td>
                          <section className="scroll-section" id="multipleTargets">
                            <CustomToggleButton className="mb-1" eventKey={index} value={item.permissionList}>
                              {item.name}
                            </CustomToggleButton>

                            <Accordion.Collapse eventKey={index}>
                              <Card body className=" border mt-2">
                                {list?.map((data, i) => (
                                  <div className="mb-1" key={i}>
                                    <label className="form-check w-100 mb-0">
                                      <input
                                        type="checkbox"
                                        checked={data.status}
                                        disabled
                                        onChange={(e) => onAddPermissionList(data, e)}
                                        className="form-check-input"
                                      />
                                      <span className="form-check-label d-block">
                                        <span className="mb-1 lh-1-25">{data.label}</span>
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </Card>
                            </Accordion.Collapse>
                          </section>
                        </td>
                        <div style={{ width: '20px' }}>
                          <Button className="btn-icon" variant="outline-danger" onClick={() => removeItem(index)}>
                            <CsLineIcons icon="bin" />
                          </Button>
                        </div>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </Table>
          </Accordion>
        </section>
      </Modal.Body>
      <Modal.Footer className="p-3 px-5">
        <Button variant="outline-primary" onClick={() => setShowModal(false)}>
          {f({ id: 'common.cancel' })}
        </Button>
        <Button variant="primary" onClick={() => onSave(listData)}>
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserItemModal;
