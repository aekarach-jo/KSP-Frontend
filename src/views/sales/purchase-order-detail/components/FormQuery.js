import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import { API, QUERY } from '../constants';

const initialData = {
  supplierId: '',
  type: '',
  detail: [],
  weightCondition: 0,
};

const getPurchaseOrder = async ({ id, typeOptions, getAddress }) => {
  const {
    data: { data },
  } = await request({ url: `${API.GET_PURCHASE_DETAIL}/${id}` });
  const {
    type,
    detail,
    supplierId: { id: supplierId, name: supplierName, list: addresses, priceCondition, weightCondition },
  } = data;

  data.type = typeOptions.find((item) => item.value === type);
  data.detail = detail.map((item) => {
    if (item?.purchaseItem) {
      item.id = item.purchaseItem;
    } else if (item?.material) {
      item.id = item.material;
    }
    return item;
  });

  return { ...data, supplierId, supplierName, supplierAddress: getAddress(addresses), priceCondition, weightCondition };
};

const getInvenStockSupplier = async () => {
  const inventory = await request({ url: `/inventory/material/find?isSupplier=true` });
  return inventory?.data?.data;
};

const getInvenStockMat = async () => {
  const inventory = await request({ url: `/inventory/material/find` });
  return inventory?.data?.data;
};

export const usePurchaseOrderQuery = ({ id, typeOptions, setIsLoading, getAddress }) => {
  return useQuery(
    QUERY.PURCHASE_ORDER,
    async () => {
      setIsLoading(true);
      const resultPO = await getPurchaseOrder({ id, typeOptions, getAddress });
      const resultInvSupplier = await getInvenStockSupplier();
      const resultInvMat = await getInvenStockMat();

      resultPO.detail.forEach((data) => {
        if (data.type === 'PI_SUPPLIER') {
          resultInvSupplier.forEach((dataInv) => {
            if (dataInv.materialId === data.materialId) {
              data.inventoryAmount = dataInv?.amount;
            }
          });
        } else {
          resultInvMat.forEach((dataInv) => {
            if (dataInv.materialId === data.materialId) {
              data.inventoryAmount = dataInv?.amount;
            }
          });
        }
      });

      setIsLoading(false);
      return resultPO;
    },
    {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
    }
  );
};
