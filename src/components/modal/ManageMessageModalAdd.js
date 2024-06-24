/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SERVICE_URL } from 'config';
import { useIntl } from 'react-intl';
import { Button, Form, Modal, Spinner, Table, Col, Row } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import './style.css';
import langReducer from 'lang/langSlice';
import useProductPlanOptionsNoQC from 'hooks/useProductPlanOptionsNoQC';
import { useSelector } from 'react-redux';

const ManageMessageModalAdd = ({ show, hide, setShowModal, condition = '', setValueChange, cautionList }) => {
  const { formatMessage: f } = useIntl();
  const lang = useSelector((state) => state.lang);
  const [listData, setListData] = useState([]);
  const [listDataSearch, setListDataSearch] = useState([]);
  const [listItemDropdown, setListItemDropdown] = useState([]);
  const [listMessageDropdown, setListMessageDropdown] = useState([]);
  const [isManageAddModalShow, setManageAddModalShow] = useState(false);
  const [typeData, setTypeData] = useState();
  const [obj, setObj] = useState({ name: '' });
  const [isMessageTypeError, setMessageTypeError] = useState(false);
  const [isDefectTypeError, setDefectTypeError] = useState(false);
  const [isStepError, setStepError] = useState(false);
  const [isNameInvalid, setNameInvalid] = useState(false);
  const { planOptions } = useProductPlanOptionsNoQC();
  const [stepObj, setStepObj] = useState(planOptions());
  const [isFetch, setIsFetch] = useState(false);

  const initialObj = {
    name: '',
    mainLinkId: '', // Set to '' to display placeholder
    messageType: '',
    linkType: '',
    linkStep: '',
    linkId: '', // Set to  to display placeholder
    defectType: '',
    type: typeData,
  };

  // Define validateForm function here
  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      mainLinkId: '',
      linkId: '',
    };

    if (!obj.name) {
      errors.name = 'Name is required';
      isValid = false;
      setNameInvalid(true); // Set to true to indicate validation error
    } else {
      setNameInvalid(false); // Set to false to indicate validation success
    }

    if (!obj.mainLinkId) {
      errors.mainLinkId = 'Message Type is required';
      isValid = false;
      setMessageTypeError(true); // Set to true to indicate validation error
    } else {
      setMessageTypeError(false); // Set to false to indicate validation success
    }
    if (!obj.linkStep) {
      errors.linkStep = 'Message Type is required';
      isValid = false;
      setStepError(true); // Set to true to indicate validation error
    } else {
      setStepError(false); // Set to false to indicate validation success
    }
    if (!obj.linkId) {
      errors.linkId = 'Defect Type is required';
      isValid = false;
      setDefectTypeError(true); // Set to true to indicate validation error
    } else {
      setDefectTypeError(false); // Set to false to indicate validation success
    }

    // Handle other validations if needed

    return { isValid, errors };
  };

  const onFetchType = async (value) => {
    let ListType = {};
    const defectType = await axios.get(`${SERVICE_URL}/productionPlan/lov/defectType/list`).then((res) => res.data.data);
    const messageType = await axios.get(`${SERVICE_URL}/productionPlan/lov/messageType/list`).then((res) => res.data.data);
    const list = [];
    const messageList = [];
    defectType.forEach((element) => {
      const o = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(o);
    });
    messageType.forEach((element) => {
      const mo = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      messageList.push(mo);
    });
    setListItemDropdown(list);
    setListMessageDropdown(messageList);
    ListType = await axios.get(`${SERVICE_URL}/productionPlan/lov/defect/list`).then((res) => {
      res.data.data.forEach((data) => {
        defectType.forEach((v) => {
          if (data.linkId === v.id) {
            data.defectType = v.name;
          }
        });
        stepObj.forEach((v) => {
          if (Number(data.linkStep) === v.value) {
            data.stepName = v.label;
          }
        });
        messageType.forEach((v) => {
          if (data.mainLinkId === v.id) {
            data.messageType = v.name;
          }
        });
      });
      res.data.data = res.data.data.filter((el) => {
        const hasNoMatch = !cautionList?.some((itemValue) => {
          let code = false;
          if (itemValue.code === undefined) {
            code = el.code === itemValue;
          } else {
            code = el.code === itemValue.code;
          }
          return code;
        });
        return hasNoMatch;
      });
      return res.data;
    });
    setIsFetch(true);
    // ListType?.data?.sort((a, b) => a.code - b.code);
    return ListType.data;
  };

  const handleOnSaveManageMessageItem = async (value) => {
    const codeValues = value.map((element) => {
      let code = 0;
      code = element.code;
      if (element.code === undefined) {
        code = 0;
      }
      return parseInt(code, 10);
    });
    const maxValue = Math.max(...codeValues);
    let tempMax = maxValue;
    value.forEach((element) => {
      if (element.code === undefined) {
        tempMax += 1;
        element.code = tempMax;
      }
    });
    const data = {
      condition: 'defect',
      data: value,
    };
    toast(<ToastCreateSuccess />);
    setShowModal(false);
    await axios
      .post(`${SERVICE_URL}/productionPlan/lov/defect/save`, data, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        setValueChange(true);
      });
  };

  const getSelectedMessageType = () => {
    return listMessageDropdown.find((option) => option.detail.id === obj.mainLinkId) || null;
  };

  const getSelectedDefectType = () => {
    return listItemDropdown.find((option) => option.detail.id === obj.linkId) || null;
  };

  const getSelectedStep = () => {
    return planOptions().find((option) => option.value === obj.linkStep) || null;
  };

  useEffect(async () => {
    setIsFetch(false);
    setListData([]);
    if (show) {
      const onFetch = await onFetchType(condition);
      if (onFetch) {
        setListData(onFetch);
        setTypeData(onFetch[0]?.type);
      }
    }
  }, [show]);

  useEffect(async () => {
    setObj({ ...obj, type: typeData });
  }, [typeData]);

  const handleChangeType = (e) => {
    setObj({
      ...obj,
      mainLinkId: e.detail.id,
      messageType: e.detail.name,
      isDeleted: false,
    });
  };
  const handleChangeFactor = (e) => {
    setObj({
      ...obj,
      linkType: e.detail.type,
      linkId: e.detail.id,
      defectType: e.detail.name,
      isDeleted: false,
      type: typeData,
    });
  };
  const handleChangeStep = (e) => {
    setObj({
      ...obj,
      linkStep: e.value,
      stepName: e.label,
      // name: `${obj.name} - ${e.value} - ${e.label}`,
    });
  };

  const onAdd = () => {
    // Validate the form
    const { isValid, errors } = validateForm();
    if (!isValid) {
      // Handle form validation errors, e.g., display errors
      console.log(errors);
      console.error('Form validation errors:', errors);
      return;
    }

    // obj.forEach((v)=>{
    //   console.log(v);
    // })
    setListData([...listData, obj]);
    setObj(initialObj);
  };

  const removeItem = (index) => {
    listData.splice(index, 1);
    setListData([...listData]);
  };
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
  const handleSearchToolingList = async (e) => {
    const onFetch = await onFetchType(condition);
    if (onFetch) {
      setListData(onFetch);
      setTypeData(onFetch[0]?.type);
    }
    if (e.target.value !== '') {
      const foundProducts = listData?.filter(
        (item) => item.name.indexOf(e.target.value) !== -1 || item.defectType.indexOf(e.target.value) !== -1 || item.messageType.indexOf(e.target.value) !== -1
      );
      setListData(foundProducts);
    }
  };

  return (
    <Modal show={show} onHide={hide} size="lg">
      <Modal.Header closeButton>
        <Row>
          <Col sm="12" md="8" lg="8" className="mb-3">
            <Modal.Title>{f({ id: 'product.message' })}</Modal.Title>
          </Col>
          <Col sm="12" md="12" lg="12">
            <Form.Control type="text" onChange={handleSearchToolingList} placeholder={f({ id: 'common.placeholder.message' })} />
          </Col>
        </Row>
      </Modal.Header>
      <Modal.Body>
        <section className="scroll-section" id="hoverableRows">
          <Table>
            <thead className="table-header">
              <tr>
                <th className="w-20" scope="col">
                  {f({ id: 'product.messageType' })}
                </th>
                <th scope="col">{f({ id: 'product.field.detail' })}</th>
                <th scope="col">{f({ id: 'product.factor' })}</th>
                <th scope="col">{f({ id: 'product.step' })}</th>
              </tr>
              <tr>
                <td className="w-20">
                  <Select
                    name="messageType"
                    value={getSelectedMessageType()}
                    classNamePrefix="react-select"
                    options={listMessageDropdown}
                    onChange={handleChangeType}
                    className={isMessageTypeError ? 'is-invalid' : ''}
                  />
                  {isMessageTypeError ? (
                    <Form.Control.Feedback type="invalid">{f({ id: 'product.validation.message.type' })}</Form.Control.Feedback>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </td>
                <td className="w-30">
                  <Form.Control type="text" name="name" onChange={(e) => setObj({ ...obj, name: e.target.value })} value={obj.name} isInvalid={isNameInvalid} />
                  {isNameInvalid ? (
                    <Form.Control.Feedback type="invalid">{f({ id: 'product.validation.message.detail' })}</Form.Control.Feedback>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </td>
                <td className="w-20">
                  <Select
                    name="defectType"
                    value={getSelectedDefectType()}
                    classNamePrefix="react-select"
                    options={listItemDropdown}
                    onChange={handleChangeFactor}
                    className={isDefectTypeError ? 'is-invalid' : ''}
                  />
                  {isDefectTypeError ? (
                    <Form.Control.Feedback type="invalid">{f({ id: 'product.validation.message.factor' })}</Form.Control.Feedback>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </td>
                <td className="w-20">
                  <Select
                    name="step"
                    value={getSelectedStep()}
                    classNamePrefix="react-select"
                    options={planOptions()}
                    onChange={handleChangeStep}
                    className={isStepError ? 'is-invalid' : ''}
                  />
                  {isStepError ? (
                    <Form.Control.Feedback type="invalid">{f({ id: 'product.validation.message.step' })}</Form.Control.Feedback>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </td>
                <td className="w-10">
                  <Button className="w-100" variant="primary" type="submit" onClick={() => onAdd()}>
                    {f({ id: 'common.add' })}
                  </Button>
                  <span>&nbsp;</span>
                </td>
              </tr>
            </thead>
            <tbody className="table-scroll">
              {listData?.length > 0 ? (
                listData.map((item, index) => (
                  <tr key={index} style={index % 2 === 0 ? { background: 'rgb(249, 249, 249)' } : {}}>
                    <td className="w-20">{item.messageType}</td>
                    <td className="w-30">{item.name}</td>
                    <td className="w-20">{item.defectType}</td>
                    <td className="w-20">{item.stepName}</td>
                    <td className="w-10">
                      <Button className="btn-icon" variant="outline-danger" onClick={() => removeItem(index)}>
                        <CsLineIcons icon="bin" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {listData?.length === 0 && isFetch ? (
                    <span> No data found</span>
                  ) : (
                    <Spinner animation="border" variant="primary">
                      <span className="visually-hidden"> Loading...</span>
                    </Spinner>
                  )}
                </div>
              )}
            </tbody>
          </Table>
        </section>
      </Modal.Body>
      <Modal.Footer className="p-3 px-5">
        <Button variant="outline-primary" onClick={() => setShowModal(false)}>
          {f({ id: 'common.cancel' })}
        </Button>
        <Button variant="primary" onClick={() => handleOnSaveManageMessageItem(listData)}>
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageMessageModalAdd;
