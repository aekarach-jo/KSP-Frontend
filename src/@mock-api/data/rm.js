import { SERVICE_URL } from 'config';
import api from '../api';

const rmData = [
  {
    id: '920a7cf1-7acb-432d-8736-b79e6b565312',
    code: 'RM1',
    name: 'RM1',
    type: 'RM',
    status: true,
    createdAt: '2022-03-05T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-05T07:10:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: 'f7414e86-ce21-42a3-afe1-337a227229c6',
    code: 'RM2',
    name: 'RM2',
    type: 'RM',
    status: true,
    createdAt: '2022-03-05T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-05T07:10:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: 'cfb1bd60-15a0-4082-9bfc-0df5395b9664',
    code: 'UT1',
    name: 'UT1',
    type: 'UTILITY',
    status: true,
    createdAt: '2022-03-05T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-05T07:10:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: 'c23da77e-14a7-4a32-ab7d-f9d5e298f0f3',
    code: 'UT2',
    name: 'UT2',
    type: 'UTILITY',
    status: true,
    createdAt: '2022-03-05T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-05T07:10:00.000Z',
    updatedBy: 'User1',
  },
];

export const getRmData = () => rmData;

api.onGet(`${SERVICE_URL}/rm/find`).reply((config) => {
  const { query } = config;
  // console.debug('rmData', rmData);
  if (!query || Object.keys(query).length === 0) {
    return [200, rmData];
  }

  return [
    200,
    rmData.filter((rm) => {
      const { code, name, type, status } = query;
      return (
        (!code || rm.code.toLowerCase().includes(code.toLowerCase())) &&
        (!name || rm.name.toLowerCase().includes(name.toLowerCase())) &&
        (!type || rm.type === type) &&
        (!status || rm.status === status)
      );
    }),
  ];
});
api.onGet(new RegExp(`${SERVICE_URL}/rm/*`)).reply((config) => {
  const { url } = config;
  const id = url.split('/').pop();
  const rm = rmData.find((item) => item.id === id);

  if (rm) {
    return [200, rm];
  }
  return [404, null];
});
api.onPost(`${SERVICE_URL}/rm/add`).reply((config) => {
  const id = `${Date.now()}`;
  const { data } = config;
  const newData = {
    ...JSON.parse(data),
    id,
    createdAt: new Date().toISOString(),
    createdBy: 'User1',
    updatedAt: new Date().toISOString(),
    updatedBy: 'User1',
  };

  rmData.push(newData);

  return [
    200,
    {
      success: true,
      data: newData,
    },
  ];
});
api.onPost(new RegExp(`${SERVICE_URL}/rm/*`)).reply((config) => {
  const { url } = config;
  const id = url.split('/').pop();

  const rm = rmData.find((c) => c.id === id);

  if (!rm) {
    return [404, null];
  }

  const { data } = config;
  const rmEdit = JSON.parse(data);
  const newData = {
    updatedAt: new Date().toISOString(),
    updatedBy: 'User1',
  };

  Object.assign(rm, rmEdit, newData);

  return [
    200,
    {
      success: true,
      data: rm,
    },
  ];
});
