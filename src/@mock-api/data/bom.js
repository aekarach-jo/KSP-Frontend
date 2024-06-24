import { SERVICE_URL } from 'config';
import api from '../api';
import { getRmData } from './rm';

const bomData = [
  {
    id: '96bb85ad-b3f3-4173-9c58-13fb16511f4e',
    code: 'BM-1344123',
    name: 'BOM 1',
    status: true,
    rmList: ['920a7cf1-7acb-432d-8736-b79e6b565312', 'f7414e86-ce21-42a3-afe1-337a227229c6'],
    createdAt: '2022-04-06T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-04-06T07:10:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: '8f6e6c63-f03b-4767-bf06-8a036a768313',
    code: 'BM-3494503',
    name: 'BOM 2',
    status: true,
    rmList: ['cfb1bd60-15a0-4082-9bfc-0df5395b9664', 'c23da77e-14a7-4a32-ab7d-f9d5e298f0f3'],
    createdAt: '2022-04-06T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-04-06T07:10:00.000Z',
    updatedBy: 'User1',
  },
];

export const getBomData = () => bomData;

api.onGet(`${SERVICE_URL}/bom/find`).reply((config) => {
  const { query } = config;
  // console.debug('bomData', bomData);
  if (!query || Object.keys(query).length === 0) {
    return [200, bomData];
  }

  return [
    200,
    bomData.filter((bom) => {
      const { code, name, status } = query;
      return (
        (!code || bom.code.toLowerCase().includes(code.toLowerCase())) &&
        (!name || bom.name.toLowerCase().includes(name.toLowerCase())) &&
        (!status || bom.status === status)
      );
    }),
  ];
});
api.onGet(new RegExp(`${SERVICE_URL}/bom/*`)).reply((config) => {
  const { url } = config;
  const id = url.split('/').pop();
  const bom = bomData.find((item) => item.id === id);

  const rmDataList = getRmData();

  bom.rmList = bom.rmList
    .map((rmId) => {
      return rmDataList.find((item) => item.id === rmId);
    })
    .filter((rm) => !!rm);

  if (bom) {
    return [200, bom];
  }

  return [404, null];
});
api.onPost(`${SERVICE_URL}/bom/add`).reply((config) => {
  const id = `${Date.now()}`;
  const { data } = config;
  const dataJs = JSON.parse(data);

  dataJs.rmList = dataJs.rmList?.map((rm) => rm.id) ?? [];

  const newData = {
    ...dataJs,
    id,
    createdAt: new Date().toISOString(),
    createdBy: 'User1',
    updatedAt: new Date().toISOString(),
    updatedBy: 'User1',
  };

  bomData.push(newData);

  return [
    200,
    {
      success: true,
      data: newData,
    },
  ];
});
api.onPost(new RegExp(`${SERVICE_URL}/bom/*`)).reply((config) => {
  const { url } = config;
  const id = url.split('/').pop();
  const bom = bomData.find((item) => item.id === id);

  if (!bom) {
    return [404, null];
  }

  const { data } = config;

  const bomEdit = JSON.parse(data);
  bomEdit.rmList = bomEdit.rmList?.map((rm) => rm.id) ?? [];

  const newData = {
    updatedAt: new Date().toISOString(),
    updatedBy: 'User1',
  };

  Object.assign(bom, bomEdit, newData);

  return [200, { success: true, data: bom }];
});
