/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Select from 'react-select';

const listItemDropdown = [
  { label: 'งานตัด', value: 'งานตัด' },
  { label: 'งานพิมพ์', value: 'งานพิมพ์' },
  { label: 'งานเคลือบ', value: 'งานเคลือบ' },
  { label: 'งานปั๊ม', value: 'งานปั๊ม' },
  { label: 'งานแกะ', value: 'งานแกะ' },
  { label: 'งานควบคุมคุณภาพ', value: 'งานควบคุมคุณภาพ' },
  { label: 'งานปะ', value: 'งานปะ' },
];

const ItemModal = ({ show, onHide, setShowModal, list, onSave }) => {
  const { formatMessage: f } = useIntl();
  const [listData, setListData] = useState(list);
  const [typeData, setTypeData] = useState(list[0].type);
  const [obj, setObj] = useState({ abbr: '', code: '', name: '', type: '', id: '', isDeleted: false });

  console.log(listData);
  useEffect(() => {
    setObj({ ...obj, type: typeData });
  }, [typeData]);

  const onAdd = () => {
    console.log(obj);
    setListData([...listData, obj]);
    console.log(listData);
  };

  const removeItem = (index) => {
    listData.splice(index, 1);
    setListData([...listData]);
  };

  const handleChangeCategory = (e) => {
    console.log(e);
  };
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Process Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="scroll-section" id="hoverableRows">
          <Table>
            <thead>
              <tr>
                <th className="w-10" scope="col">
                  Code
                </th>
                <th className="w-10" scope="col">
                  Abbr
                </th>
                <th className="w-50" scope="col">
                  Name
                </th>
                <th className="w-30" scope="col">
                  Job Catedory
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
                    // disabled={values.id}
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
                    // disabled={values.id}
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
                    // disabled={values.id}
                    // isInvalid={errors.code && touched.code}
                    // readOnly={!isEditMode}
                  />
                </td>
                <td>
                  <Select
                    name="department"
                    classNamePrefix="react-select"
                    options={listItemDropdown}
                    // isDisabled={!isEditMode}
                    // value={obj.department}
                    onChange={handleChangeCategory}
                    // isInvalid={errors.type && touched.type}
                    // required
                  />
                </td>
                <td>
                  <Button className="w-100" variant="primary" type="submit" onClick={() => onAdd()}>
                    {f({ id: 'common.add' })}
                  </Button>
                </td>
              </tr>
              {listData.length > 0 && (
                <>
                  {listData?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.code}</td>
                      <td>{item.abbr}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <div className="" style={{ width: '20px' }}>
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
        </section>
      </Modal.Body>
      <Modal.Footer className="p-3 px-5">
        <Button variant="outline-primary" onClick={onHide}>
          {f({ id: 'common.cancel' })}
        </Button>
        <Button variant="primary" onClick={() => onSave(listData)}>
          {f({ id: 'common.save' })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ItemModal;
