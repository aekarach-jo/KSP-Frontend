/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SERVICE_URL } from 'config';
import { useIntl } from 'react-intl';
import { Button, Form, Modal, Spinner, Table, Col, Row } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import './style.css';
import Select from 'react-select';
import langReducer from 'lang/langSlice';
import { useSelector } from 'react-redux';

const ProductPatchingModalAdd = ({ show, hide, setShowModal, condition = 'PRODUCT_PATCHING', setValueChange, patching }) => {
  const { formatMessage: f } = useIntl();
  const lang = useSelector((state) => state.lang);
  const [listData, setListData] = useState([]);
  const [listItemDropdown, setListItemDropdown] = useState([]);
  const [isManageAddModalShow, setManageAddModalShow] = useState(false);
  const [typeData, setTypeData] = useState();
  const [obj, setObj] = useState({ abbr: '', code: '', name: '' });
  const [errCode, setErrorCode] = useState(false);
  const [isFetch, setIsFetch] = useState(false);

  const onFetchType = async (value) => {
    let ListType = {};
    ListType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_PATCHING`).then((res) => {
      return res.data;
    });
    ListType.data = ListType?.data.filter((el) => {
      let code = false;
      if (patching?.value === undefined) {
        code = patching !== el.id;
      } else {
        code = patching.value !== el.id;
      }
      return code;
    });
    ListType?.data?.sort((a, b) => a.code - b.code);
    if (show) {
      setIsFetch(true);
    } else {
      setIsFetch(false);
    }
    return ListType.data;
  };
  const handleOnSaveUnitItem = async (value) => {
    // const conditionChoose = condition;
    const data = {
      condition: 'patching',
      data: value,
    };
    toast(<ToastCreateSuccess />);
    setShowModal(false);

    await axios
      .post(`${SERVICE_URL}/masterData/lov/product/save`, data, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        setValueChange(true);
      });
  };
  useEffect(async () => {
    // eslint-disable-next-line no-use-before-define
    // const resultMachine = await callGetMasterDataMachine();
    setIsFetch(false);
    setListData([]);
    const onFetch = await onFetchType(condition);
    if (onFetch) {
      setListData(onFetch);
      setTypeData(onFetch[0]?.type);
    }
  }, [show]);

  useEffect(async () => {
    setObj({ ...obj, type: typeData });
  }, [typeData]);

  const onAdd = () => {
    let checkCode = false;
    for (let i = 0; i < listData.length; i += 1) {
      if (listData[i].code === obj.code || obj.code === '') {
        checkCode = true;
      }
    }
    if (checkCode) {
      setErrorCode(true);
    } else {
      setListData([...listData, obj]);
      setObj({ abbr: '', code: '', name: '', type: typeData });
    }
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
  return (
    <Modal show={show} onHide={hide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: `product.patching` })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="scroll-section" id="hoverableRows">
          <Table>
            <thead className="table-header">
              <tr>
                <th className="w-10" scope="col">
                  {f({ id: 'product.field.code' })}
                </th>
                <th className="w-10" scope="col">
                  {f({ id: 'product.field.abbr' })}
                </th>
                <th className="w-70" scope="col">
                  {f({ id: 'product.patching' })}
                </th>
              </tr>
              <tr>
                <td className="px-1">
                  <Form.Control
                    type="text"
                    name="code"
                    onChange={(e) => {
                      setObj({ ...obj, code: e.target.value });
                      setErrorCode(false);
                    }}
                    value={obj.code}
                    isInvalid={errCode}
                  />
                </td>
                <td className="px-1">
                  <Form.Control type="text" name="abbr" onChange={(e) => setObj({ ...obj, abbr: e.target.value })} value={obj.abbr} />
                </td>
                <td className="px-1">
                  <Form.Control type="text" name="name" onChange={(e) => setObj({ ...obj, name: e.target.value })} value={obj.name} />
                </td>
                <td className="px-1">
                  <Button className="w-100" variant="primary" type="submit" onClick={() => onAdd()}>
                    {f({ id: 'common.add' })}
                  </Button>
                </td>
              </tr>
            </thead>
            <tbody className="table-scroll">
              {listData?.length > 0 ? (
                <>
                  {listData?.map((item, index) => (
                    <tr key={index} style={index % 2 === 0 ? { background: 'rgb(249, 249, 249)' } : {}}>
                      <td className="w-10">{item.code}</td>
                      <td className="w-10">{item.abbr}</td>
                      <td className="w-70">{item.name}</td>
                      <div className="" style={{ width: '20px' }}>
                        <Button className="btn-icon" variant="outline-danger" onClick={() => removeItem(index)}>
                          <CsLineIcons icon="bin" />
                        </Button>
                      </div>
                    </tr>
                  ))}
                </>
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
        <Button variant="primary" onClick={() => handleOnSaveUnitItem(listData)}>
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductPatchingModalAdd;
