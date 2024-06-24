import { SERVICE_URL } from 'config';
import api from '../api';

const customerData = [
  {
    id: 'd07c5bbc-f7b5-4009-8d12-1b174f0294de',
    code: 'AMNXX',
    name: 'บริษัท แอมXX จำกัด',
    list: [
      {
        taxId: '01234567890123',
        phone: ['0812345678', '021234567'],
        fax: ['02467xxxx'],
        address: '123/456 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: true,
      },
      {
        taxId: '12386703485678',
        phone: ['0612345678', '020478693'],
        fax: ['02467xxxx'],
        address: '444/555 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: false,
      },
    ],
    completeStatus: true,
    customerStatus: true,
    createdAt: '2022-03-05T07:10:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-05T07:10:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: '359b493e-2913-49c6-a50f-c1675e732dcd',
    code: 'AWTX',
    name: 'บริษัท ออโต้XX จำกัด',
    list: [
      {
        taxId: '17459573940346',
        phone: ['0823456789', '0834567890'],
        fax: ['02467xxxx'],
        address: '222/111 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: true,
      },
      {
        taxId: '48937295038920',
        phone: ['0834567891', '0234566789'],
        fax: ['02467xxxx'],
        address: '122/523 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: false,
      },
    ],
    completeStatus: true,
    customerStatus: true,
    createdAt: '2022-03-05T08:20:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-05T08:20:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: '5874498c-00ea-42e2-8d30-7d4e6420e4c4',
    code: 'BIOPXX',
    name: 'บริษัท ไบโXX จำกัด',
    list: [
      {
        taxId: '67859670378374',
        phone: ['0888837590', '029898576'],
        fax: ['02467xxxx'],
        address: '1/2 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: true,
      },
      {
        taxId: '78560382685674',
        phone: ['0889983752', '0268465689'],
        fax: ['02467xxxx'],
        address: '23/17 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: false,
      },
    ],
    completeStatus: false,
    customerStatus: false,
    createdAt: '2022-03-06T08:32:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-06T08:32:00.000Z',
    updatedBy: 'User1',
  },
  {
    id: '778bf896-d18f-4b14-afa0-890417d40069',
    code: 'BPXX',
    name: 'หจก. บี.พี.XX',
    list: [
      {
        taxId: '5945690834578',
        phone: ['0888828934', '0271905673'],
        fax: ['02467xxxx'],
        address: '77/66 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: true,
      },
      {
        taxId: '6936239459072',
        phone: ['0895729793', '0246185947'],
        fax: ['02467xxxx'],
        address: '555/555 ถนนสุขุมวิท แขวงบางกะปิ เขตบางกะปิ กรุงเทพมหานคร 10900',
        isDefault: false,
      },
    ],
    completeStatus: true,
    customerStatus: true,
    createdAt: '2022-03-06T09:22:00.000Z',
    createdBy: 'User1',
    updatedAt: '2022-03-06T09:22:00.000Z',
    updatedBy: 'User1',
  },
];

const findFn = (config) => {
  const query = config.query || config.params;
  console.debug('customerData', customerData);
  if (!query) {
    return [200, { error: false, data: customerData }];
  }

  if (typeof query === 'string') {
    // console.debug('Query params', query.query);
    return [
      200,
      {
        error: false,
        data: customerData.filter(
          (customer) =>
            `${customer.name || ''}`.includes(query) || //
            `${customer.code || ''}`.includes(query) || //
            customer.list?.some((item) => item.phone?.some((p) => `${p}`.includes(query)))
        ),
      },
    ];
  }

  return [
    200,
    {
      error: false,
      data: customerData.filter((customer) => {
        const match = [];
        if (query.code) {
          match.push(`${customer.code || ''}`.includes(query.code));
        }

        if (query.name) {
          match.push(`${customer.name || ''}`.includes(query.name));
        }

        if (query.phone) {
          match.push(customer.list?.some((item) => item.phone?.some((p) => `${p}`.includes(query))));
        }

        match.push(customer.completeStatus === query.completeStatus);

        return match.length && match.every((v) => v);
      }),
    },
  ];
};

api.onGet(`${SERVICE_URL}/customer/list`).reply(findFn);
api.onGet(`${SERVICE_URL}/customer/find`).reply(findFn);
api.onGet(new RegExp(`${SERVICE_URL}/customer/*`)).reply((config) => {
  const { url } = config;
  const id = url.split('/').pop();

  const customer = customerData.find((c) => c.id === id);

  if (customer) {
    return [200, { error: false, data: customer }];
  }

  return [404, null];
});

api.onPost(`${SERVICE_URL}/customer/add`).reply((config) => {
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

  customerData.push(newData);

  return [
    200,
    {
      success: true,
      data: newData,
    },
  ];
});

api.onPost(new RegExp(`${SERVICE_URL}/customer/*`)).reply((config) => {
  console.debug('update .....', config);
  const { url } = config;
  const id = url.replace('/edit', '').split('/').pop();

  const customer = customerData.find((c) => c.id === id);

  const { data } = config;
  const customerEdit = JSON.parse(data);
  const newData = {
    updatedAt: new Date().toISOString(),
    updatedBy: 'User1',
  };

  Object.assign(customer, customerEdit, newData);

  if (customer) {
    return [
      200,
      {
        success: true,
        data: customer,
      },
    ];
  }

  return [404, null];
});
