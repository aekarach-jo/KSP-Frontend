/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import { useIntl } from 'react-intl';
import { Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';
import langReducer from 'lang/langSlice';
import { useSelector } from 'react-redux';
import './styles.css';

const mock = [
  { property1: 'aaa', property2: 'aaa' },
  { property1: 'bbb', property2: 'bbb' },
];

console.log(mock);

const AddCompanyItemModal = ({ show, hide, setShowModal, condition, onSave, categoryOptions }) => {
  const { formatMessage: f } = useIntl();
  const lang = useSelector((state) => state.lang);
  const [listData, setListData] = useState([]);
  const [listItemDropdown, setListItemDropdown] = useState([]);
  const [typeData, setTypeData] = useState();
  const [obj, setObj] = useState({ abbr: '', code: '', name: '', type: '', id: '' });

  const onFetchType = async (value) => {
    let ListType = {};
    if (value === 'department') {
      const category = await axios.get(`${SERVICE_URL}/masterData/lov/companyCategory`).then((res) => res.data.data);
      const list = [];
      category.forEach((element) => {
        const o = {
          value: lang.currentLang.code === 'Eng' ? element.nameEn : element.name,
          label: lang.currentLang.code === 'Eng' ? element.nameEn : element.name,
          detail: element,
        };
        list.push(o);
      });
      setListItemDropdown(list);

      ListType = await axios.get(`${SERVICE_URL}/masterData/lov/employeeDepartment`).then((res) => {
        res.data.data.forEach((data) => {
          category.forEach((v) => {
            if (data.linkId === v.id) {
              data.category = v.name;
              data.categoryEn = v.nameEn;
            }
          });
        });
        return res.data;
      });
    }
    if (value === 'position') {
      const department = await axios.get(`${SERVICE_URL}/masterData/lov/employeeDepartment`).then((res) => res.data.data);
      const list = [];
      department.forEach((element) => {
        const o = {
          value: element.name,
          label: element.name,
          detail: element,
        };
        list.push(o);
      });
      setListItemDropdown(list);

      ListType = await axios.get(`${SERVICE_URL}/masterData/lov/employeePosition`).then((res) => {
        res.data.data.forEach((data) => {
          department.forEach((v) => {
            if (data.linkId === v.id) {
              data.category = v.name;
            }
          });
        });
        return res.data;
      });
    }
    if (value === 'salesArea') {
      ListType = {};
      ListType = await axios.get(`${SERVICE_URL}/masterData/lov/employeeSalesArea`).then((res) => res.data);
    }
    return ListType.data;
  };

  useEffect(async () => {
    // eslint-disable-next-line no-use-before-define
    // const resultMachine = await callGetMasterDataMachine();
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

  const handleChangeDepartment = (e) => {
    console.log(e);
    setObj({
      ...obj,
      linkType: e.detail.type,
      linkId: e.detail.id,
      category: e.detail.name,
      isDeleted: false,
    });
  };

  const onAdd = () => {
    setListData([...listData, obj]);
  };

  const removeItem = (index) => {
    listData.splice(index, 1);
    setListData([...listData]);
  };

  useEffect(() => {
    console.log(obj);
  }, [obj]);

  return (
    <Modal show={show} onHide={hide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{f({ id: `company.${condition}` })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <table>
          <thead>
            <tr>
              <th className="w-10" scope="col">
                Code
              </th>
              <th className="w-10" scope="col">
                Abbr
              </th>
              <th className={`${condition === 'salesArea' ? 'w-60' : 'w-50'}`} scope="col">
                {condition === 'department' ? 'แผนก' : ''}
                {condition === 'position' ? 'ตำแหน่ง' : ''}
                {condition === 'salesArea' ? 'ชื่อเขต' : ''}
              </th>
              {(condition === 'department' || condition === 'position') && (
                <th style={{ width: '27.5%' }} scope="col">
                  {condition === 'department' ? 'หมวด' : ''}
                  {condition === 'position' ? 'แผนก' : ''}
                </th>
              )}
              <th>&nbsp;</th>
            </tr>
            <tr>
              <th className="pr-1">
                <Form.Control type="text" name="code" onChange={(e) => setObj({ ...obj, code: e.target.value })} value={obj.code} />
              </th>
              <th className="px-1">
                <Form.Control type="text" name="abbr" onChange={(e) => setObj({ ...obj, abbr: e.target.value })} value={obj.abbr} />
              </th>
              <th className="">
                <Form.Control type="text" name="name" onChange={(e) => setObj({ ...obj, name: e.target.value })} value={obj.name} />
              </th>
              <th>
                {(condition === 'department' || condition === 'position') && (
                  <Select name="department" classNamePrefix="react-select" options={listItemDropdown} onChange={handleChangeDepartment} />
                )}
              </th>
              <th>
                <Button className="btn-icon px-2 mx-2" variant="outline-info" type="submit" onClick={() => onAdd()}>
                  {f({ id: 'common.add' })}
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {listData ? (
              <>
                {listData?.map((item, index) => (
                  <tr key={index}>
                    <td className="w-10">{item.code}</td>
                    <td className="w-10">{item.abbr}</td>
                    <td className={`${condition === 'salesArea' ? 'w-60' : 'w-50'}`}>{item.name}</td>
                    {(condition === 'department' || condition === 'position') && (
                      <td className="w-20">{lang.currentLang.code === 'Eng' ? item.categoryEn : item.category}</td>
                    )}
                    <td style={listData.length > 5 ? { textAlign: 'end' } : { textAlign: 'center' }}>
                      <Button style={{ padding: '9px 13px', height: '100%' }} className="btn-icon" variant="outline-danger" onClick={() => removeItem(index)}>
                        <CsLineIcons icon="bin" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </tbody>
        </table>
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

export default AddCompanyItemModal;
