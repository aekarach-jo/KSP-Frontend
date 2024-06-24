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


const CompanyDetail = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;
  // const [employeeOptions, setEmployee] = useState();
  // const [supplierOptions, setSupplier] = useState();


  return (
    <>
        <InformationForm id={id}  />
    </>
  );
};

export default CompanyDetail;
