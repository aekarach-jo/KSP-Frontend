/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SERVICE_URL } from 'config';
import { useIntl } from 'react-intl';
import { Button, Form, Modal, Spinner, Table, Col, Row } from 'react-bootstrap';
import { TableBoxed } from 'components/react-table-custom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import './style.css';
import langReducer from 'lang/langSlice';
import { useSelector } from 'react-redux';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

import ManageProductTypeModalAdd from 'components/modal/ManageProductTypeModalAdd';

const ColorSelectModal = ({
  show,
  hide,
  setShowModal,
  condition = 'color',
  setValueChangeCoat,
  setValueChangeCCoat,
  setValueChangeType,
  onSave,
  setColorData,
  onRemove,
  printColor,
}) => {
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
    const bomData = [];
    let colorList = [];
    const productType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_COLOR_GROUP`).then((res) => res.data.data);
    const list = [];
    productType.forEach((element) => {
      const o = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(o);
    });
    setListItemDropdown(list);
    // bomList?.forEach((element) => {
    //   element.materialList?.forEach((i) => {
    //     bomData.push(i);
    //   });
    // });
    colorList = await axios.get(`${SERVICE_URL}/masterData/material/find?type=RMU`).then((res) => {
      res.data.data.forEach((data, index) => {
        if (data.field1?.isEnable && data.field2?.isEnable && data.field3?.isEnable) {
          bomData.push(data);
        }
        data.code = data.field1?.value;
        data.colorName = data.field2?.value;
      });
      return res.data;
    });
    const filteredData = bomData.filter((el) => {
      const hasNoMatch = !printColor?.some((itemValue) => el.colorName === itemValue.color);
      return hasNoMatch;
    });
    if (show) {
      setIsFetch(true);
    } else {
      setIsFetch(false);
    }
    filteredData.sort((a, b) => a.code - b.code);
    return filteredData;
  };
  const toggleManageAddModal = useCallback(() => {
    setManageAddModalShow((prev) => !prev);
  }, []);
  const handleOnSaveProductTypeItem = async (value) => {
    // const conditionChoose = condition;
    const newArray = value.map(({ category, isDeleted, ...rest }) => rest);
    const data = {
      condition,
      data: newArray,
    };

    toast(<ToastCreateSuccess />);
    setShowModal(false);

    await axios
      .post(`${SERVICE_URL}/masterData/lov/product/save`, data, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then(() => {
        switch (condition) {
          case 'productType':
            setValueChangeType(true);
            break;
          case 'color':
            setValueChangeCCoat(true);
            break;
          case 'coating':
            setValueChangeCoat(true);
            break;
          default:
            console.log('Empty action received.');
        }
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
  useEffect(async () => {
    printColor?.forEach((v1) => {
      listData?.forEach((v2) => {
        if (v1.color === v2.field2.value) {
          v2.removeOn = true;
        }
      });
    });
    setListData(listData);
  }, [printColor]);
  const handleChangeDepartment = (e) => {
    setObj({
      ...obj,
      linkType: e.detail.type,
      linkId: e.detail.id,
      category: e.detail.name,
      isDeleted: false,
    });
  };

  const onAdd = () => {
    let checkCode = false;
    let type = '';
    if (condition === 'color') {
      type = 'PRODUCT_COLOR';
    } else if (condition === 'coating') {
      type = 'PRODUCT_COATING';
    } else if (condition === 'productType') {
      type = 'PRODUCT_TYPE';
    }
    obj.type = type;
    if (obj.code === '') {
      checkCode = true;
    }
    for (let i = 0; i < listData.length; i += 1) {
      if (listData[i].code === obj.code) {
        checkCode = true;
      }
    }
    if (checkCode) {
      setErrorCode(true);
    } else {
      setListData([...listData, obj]);
      setObj({ abbr: '', code: '', name: '' });
    }
  };

  const addItem = (index, item) => {
    setColorData(listData);
    listData?.forEach((v) => {
      listData[index].removeOn = true;
    });
    setListData(listData);
    onSave(index, item);
  };

  const removeItem = (index) => {
    setColorData(listData);
    onRemove(index);
    listData?.forEach((v) => {
      listData[index].removeOn = false;
    });
    setListData(listData);
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
        (item) => item.name.indexOf(e.target.value) !== -1 || item.code.indexOf(e.target.value) !== -1 || item.colorName.indexOf(e.target.value) !== -1
      );
      setListData(foundProducts);
    }
  };

  return (
    <Modal show={show} onHide={hide} size="lg">
      <ManageProductTypeModalAdd setShowModal={setManageAddModalShow} show={isManageAddModalShow} hide={toggleManageAddModal} />
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: `product.colorSelect` })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="scroll-section" id="hoverableRows">
          <Col sm="12" md="8" lg="4">
            <Form.Control type="text" onChange={handleSearchToolingList} placeholder="Search..." />
          </Col>
          <Table>
            <thead className="table-header">
              <>
                <tr>
                  <th className="w-10" scope="col">
                    {f({ id: 'product.field.index' })}
                  </th>
                  <th className="w-20" scope="col">
                    {f({ id: 'product.field.kspCode' })}
                  </th>
                  <th className="w-40" scope="col">
                    {f({ id: 'product.method.name' })}
                  </th>
                  <th className="w-20" scope="col">
                    {f({ id: 'product.field.colorCode' })}
                  </th>
                  <th className="w-10" scope="col">
                    {' '}
                  </th>
                </tr>
                {/* <tr>
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
                    {condition !== 'coating' && (
                      <Select name="productType" classNamePrefix="react-select" options={listItemDropdown} onChange={handleChangeDepartment} />
                    )}
                  </td>
                  <td className="px-1">
                    <Button variant="primary" type="submit" onClick={() => onAdd()}>
                      {f({ id: 'common.add' })}
                    </Button>
                  </td>
                </tr> */}
              </>
            </thead>
            <tbody className="table-scroll">
              {listData?.length > 0 ? (
                <>
                  {listData?.map((item, index) => {
                    return (
                      <tr key={index} style={index % 2 === 0 ? { background: 'rgb(249, 249, 249)' } : {}}>
                        <td className="w-10">{index + 1}</td>
                        <td className="w-20">{item.code}</td>
                        <td className="w-40">{item.name}</td>
                        <td className="w-20">{item.colorName}</td>
                        <td className="w-10">
                          {item.removeOn ? (
                            <Button className="btn-icon" variant="outline-danger" onClick={() => removeItem(index)}>
                              <CsLineIcons icon="bin" />
                            </Button>
                          ) : (
                            <Button className="btn-icon" variant="outline-success" onClick={() => addItem(index, item)}>
                              <CsLineIcons icon="plus" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
      {/* <Modal.Footer className="p-3 px-5">
        {condition === 'productType' && (
          <Col>
            <Button variant="success" className="btn-icon btn-icon-start ms-1 shadow" onClick={toggleManageAddModal}>
              <CsLineIcons icon="plus" /> {f({ id: 'product.addType' })}
            </Button>
          </Col>
        )}
        <Button variant="outline-primary" onClick={() => setShowModal(false)}>
          {f({ id: 'common.cancel' })}
        </Button>
        <Button variant="primary" onClick={() => handleOnSaveProductTypeItem(listData)}>
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default ColorSelectModal;
