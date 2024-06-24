import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { request } from 'utils/axios-utils';
import { toast } from 'react-toastify';
import { SERVICE_URL, supplierStoreId } from 'config';
import moment from 'moment';
import axios from 'axios';
import { QUERY, NAVIGATION } from '../constants';

const callSaveReceiving = (itemData = {}) => {
  return request({ method: 'post', url: `${SERVICE_URL}/receiving/addItem`, data: itemData });
};

const callSavePurchaseOrder = (itemData = {}, typePo = '') => {
  if (typePo === '01') {
    itemData.detail?.forEach((item) => {
      item.type = 'MAT';
    });
  }
  if (typePo === '02') {
    itemData.detail?.forEach((item) => {
      item.type = 'PI_SUPPLIER';
    });
  }
  if (itemData?.type) {
    itemData.type = itemData.type.value;
  }
  console.log(itemData);
  const formData = {
    type: itemData.type,
    supplierId: itemData.supplierId,
    status: itemData.status,
    detail: itemData.detail?.map((item) => {
      return {
        discountPercentage: item.discountPercentage || 0,
        purchaseItem: item.purchaseItem,
        material: item.materialId || item?.material || item?.id,
        type: item.type,
        price: item.price,
        weight: item.weight,
        amount: item.amount,
      };
    }),
  };
  console.log(formData);

  return request({ method: 'post', url: `${SERVICE_URL}/purchaseOrder/${itemData?.id ? `${itemData.id}/edit` : 'add'}`, data: formData });
};

export const useSavePurchaseOrder = ({ setIsLoading, typeOptions, refetch, itemPIList, typePo }) => {
  const queryClient = useQueryClient();
  const history = useHistory();

  return useMutation((currentData) => callSavePurchaseOrder(currentData, typePo), {
    async onSuccess({ data: { message, error, data: savedData } }) {
      refetch();

      if (error) {
        console.error('save purchase order error :', message);
      }
      const { id, type, no, supplierId, detail, status } = savedData;
      queryClient.setQueryData(QUERY.PURCHASE_ORDER, (currentData) => {
        return {
          ...currentData,
          removedList: [],
          no,
          type: typeOptions.find((item) => item.value === type),
          id,
        };
      });

      const {
        data: { data: dataValue },
      } = await axios.get(`${SERVICE_URL}/inventory/material/find?isSupplier=true`);

      let supStoreId = '';
      if (dataValue) {
        supStoreId = dataValue[0]?.storeLocationId;
      }

      const callGetReceiving = async () => {
        detail?.forEach((iemPI, index) => {
          const dataReceiving = {
            supplier: supplierId,
            POType: type,
            purchaseOrderDetail: iemPI,
            amount: itemPIList[index].amount,
            deliveryBillNo: 'TEMP_SUPPLIER',
            storeLocation: supStoreId,
            batchNo: 'TEMP_SUPPLIER',
            mfgDt: moment(new Date()).format('YYYY/MM/DD'),
            expDt: moment(new Date()).format('YYYY/MM/DD'),
            invoiceDate: moment(new Date()).format('YYYY/MM/DD'),
          };
          console.log(dataReceiving);
          callSaveReceiving(dataReceiving);
          setIsLoading(false);
        });
      };

      if (type === '01' && supStoreId && status === 'SUBMITTED') {
        callGetReceiving(no);
      }

      queryClient.resetQueries(QUERY.FIND_PURCHASE_ITEM);
      history.replace({ pathname: `${NAVIGATION.PURCHASE_ORDER}/${id}` });
      toast('บันทึกสำเร็จ');
    },
    onError(err) {
      setIsLoading(false);
      console.error('save order error :', err);
    },
  });
};
