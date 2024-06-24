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

const AddProductItemModal = ({
  show,
  hide,
  setShowModal,
  condition,
  setValueChangeCoat,
  setValueChangeCCoat,
  setValueChangeType,
  onSave,
  coatingMethod,
  productType: productTypeValue,
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
    let ListType = {};
    if (value === 'PRODUCT_GROUP') {
      const category = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_GROUP`).then((res) => res.data.data);
      const list = [];
      category.forEach((element) => {
        const o = {
          value: element.id,
          label: element.name,
          detail: element,
        };
        list.push(o);
      });
      setListItemDropdown(list);

      ListType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_TYPE`).then((res) => {
        res.data.data.forEach((data) => {
          category.forEach((v) => {
            if (data.linkId === v.id) {
              data.category = v.name;
            }
          });
        });
        res.data.data = res?.data?.data.filter((el) => productTypeValue !== el.code);
        return res.data;
      });
    }
    // if (value === 'color') {
    //   const productType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_COLOR_GROUP`).then((res) => res.data.data);
    //   const list = [];
    //   productType.forEach((element) => {
    //     const o = {
    //       value: element.name,
    //       label: element.name,
    //       detail: element,
    //     };
    //     list.push(o);
    //   });
    //   setListItemDropdown(list);

    //   ListType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_COLOR`).then((res) => {
    //     res.data.data.forEach((data) => {
    //       productType.forEach((v) => {
    //         if (data.linkId === v.id) {
    //           data.category = v.name;
    //         }
    //       });
    //     });
    //     console.log(printColor);
    //     res.data.data = res?.data?.data.filter((el) => {
    //       console.log(printColor);
    //       const hasNoMatch = !printColor?.some((itemValue) => {
    //         return el.code === itemValue.value;
    //       });
    //       return hasNoMatch;
    //     });
    //     if (show) {
    //       setIsFetch(true);
    //     } else {
    //       setIsFetch(false);
    //     }
    //     // ListType?.data?.filter((el) => {
    //     //   console.log(el);
    //     //   return productTypeValue === el.code;
    //     // });

    //     return res.data;
    //   });
    // }
    if (value === 'PRODUCT_COATING') {
      const productType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_COATING`).then((res) => res.data.data);
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

      ListType = await axios.get(`${SERVICE_URL}/masterData/lov/product/list?type=PRODUCT_COATING`).then((res) => {
        res.data.data.forEach((data) => {
          productType.forEach((v) => {
            if (data.linkId === v.id) {
              data.category = v.name;
            }
          });
        });
        return res.data;
      });
      ListType?.data?.filter((el) => {
        const hasNoMatch = !coatingMethod?.some((itemValue) => el.name === itemValue.text);
        if (hasNoMatch && coatingMethod.length < 4) {
          el.isSelect = true;
        }
        return el.isSelect;
      });
    }
    ListType?.data?.sort((a, b) => a.code - b.code);
    if (show) {
      setIsFetch(true);
    } else {
      setIsFetch(false);
    }
    return ListType.data;
  };
  const addItem = (index, item) => {
    // Update the isSelect property for the item
    const updatedListData = listData.map((v, i) => (i === index ? { ...v, isSelect: false } : v));
    setListData(updatedListData);
    // Call onSave with the updated listData
    onSave(index, item);
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
    console.log(data);

    await axios
      .post(`${SERVICE_URL}/masterData/lov/product/save`, data, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then(() => {
        switch (condition) {
          case 'PRODUCT_GROUP':
            setValueChangeType(true);
            break;
          case 'color':
            setValueChangeCCoat(true);
            break;
          case 'PRODUCT_COATING':
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
  }, [show, coatingMethod]);

  useEffect(async () => {
    setObj({ ...obj, type: condition });
  }, [typeData]);

  const handleChangeDepartment = (e) => {
    setObj({
      ...obj,
      linkType: e.detail.type,
      linkId: e.detail.id,
      category: e.detail.name,
      isDeleted: false,
    });
  };
  // useEffect(async () => {
  //   if (productTypeValue === v2.code) {
  //     v2.removeOn = true;
  //   }
  //   setListData(listData);
  // }, [productTypeValue]);
  const onAdd = () => {
    let checkCode = false;

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
      <ManageProductTypeModalAdd setShowModal={setManageAddModalShow} show={isManageAddModalShow} hide={toggleManageAddModal} />
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: `product.${condition === 'PRODUCT_COATING' ? 'coating' : condition === 'PRODUCT_GROUP' && 'productType'}` })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="scroll-section" id="hoverableRows">
          <Table>
            <thead className="table-header">
              <>
                <tr>
                  <th className="w-10" scope="col">
                    {f({ id: 'product.field.code' })}
                  </th>
                  <th className="w-10" scope="col">
                    {f({ id: 'product.field.abbr' })}
                  </th>
                  <th className={`${condition === 'PRODUCT_COATING' ? 'w-70' : 'w-50'}`} scope="col">
                    {condition === 'PRODUCT_GROUP' ? f({ id: 'product.productType' }) : ''}
                    {condition === 'color' ? f({ id: 'product.field.colorName' }) : ''}
                    {condition === 'PRODUCT_COATING' ? f({ id: 'product.field.coatingMethod' }) : ''}
                  </th>
                  {(condition === 'PRODUCT_GROUP' || condition === 'color') && (
                    <th className="w-20" scope="col">
                      {condition === 'PRODUCT_GROUP' ? f({ id: 'product.field.productType' }) : ''}
                      {condition === 'color' ? f({ id: 'product.field.colorType' }) : ''}
                    </th>
                  )}
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
                    {condition !== 'PRODUCT_COATING' && (
                      <Select name="productType" classNamePrefix="react-select" options={listItemDropdown} onChange={handleChangeDepartment} />
                    )}
                  </td>
                  <td className="px-1">
                    <Button variant="primary" type="submit" onClick={() => onAdd()}>
                      {f({ id: 'common.add' })}
                    </Button>
                  </td>
                </tr>
              </>
            </thead>
            <tbody className="table-scroll">
              {listData?.length > 0 ? (
                <>
                  {listData?.map((item, index) => (
                    <tr key={index} style={index % 2 === 0 ? { background: 'rgb(249, 249, 249)' } : {}}>
                      <td className="w-10">{item.code}</td>
                      <td className="w-10">{item.abbr}</td>
                      <td className={`${condition === 'PRODUCT_COATING' ? 'w-60' : 'w-50'}`}>{item.name}</td>
                      {condition === 'PRODUCT_GROUP' || condition === 'color' ? (
                        <td className="w-20">{lang.currentLang.code === 'Eng' ? item.category : item.category}</td>
                      ) : (
                        <td> </td>
                      )}
                      <td className="w-20">
                        <div className="justify-content-end" style={{ display: 'flex', gap: '5px', alignItems: 'right' }}>
                          {item.isSelect && (
                            <Button className="btn-icon" variant="outline-success" onClick={() => addItem(index, item)}>
                              <CsLineIcons icon="plus" />
                            </Button>
                          )}
                          <Button className="btn-icon" variant="outline-danger" onClick={() => removeItem(index)}>
                            <CsLineIcons icon="bin" />
                          </Button>
                        </div>
                      </td>
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
        {condition === 'PRODUCT_GROUP' && (
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
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductItemModal;
