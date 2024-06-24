/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import axios from 'axios';
import { request } from 'utils/axios-utils';
import { SERVICE_URL } from 'config';
import InformationForm from './components/InformationForm';

const UserDetail = (props) => {
  const id = props?.match?.params?.id;
  const [roleOptions, setRoleOptions] = useState();
  const [permissionList, setPermissionList] = useState();
  const [permissionListForModal, setPermissionListForModal] = useState();

  const callGetRole = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/role/list`);
    return data;
  };
  const callGetPermissionList = async () => {
    const {
      data: { data },
    } = await axios.get(`${SERVICE_URL}/permission/list`);
    return data;
  };
  useEffect(async () => {
    const resultRole = await callGetRole();
    const resultPermissionList = await callGetPermissionList();
    var permission = [];
    var role = [];
    for (const elementPermission of resultPermissionList) {
      if (!elementPermission.isDeleted) {
        var objP = {
          id: elementPermission.id,
          code: elementPermission.code,
          value: elementPermission.name,
          label: elementPermission.name,
          name: elementPermission.name,
          status: false,
        };
        permission.push(objP);
      }
    }
    setPermissionList(permission);
    for (const elementRole of resultRole) {
      // eslint-disable-next-line no-var
      if (!elementRole.isDeleted) {
        var objR = {
          id: elementRole.id,
          code: elementRole.code,
          value: elementRole.name,
          label: elementRole.name,
          abbr: elementRole.abbr,
          name: elementRole.name,
          permissionList: elementRole.permissionList,
        };
        role.push(objR);
      }
    }
    setRoleOptions(role);
  }, []);

  return (
    <>
      {roleOptions ? (
        <InformationForm id={id} roleOptions={roleOptions} permission={permissionList} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </>
  );
};

export default UserDetail;
