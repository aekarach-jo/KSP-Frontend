import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import { API } from '../constants';

const callAddReceivingItem = (data = {}) => {
  return request({ url: API.ADD_RECEIVING_ITEM, data, method: 'post' });
};
const callReceivingUpdateStatus = (data = {}) => {
  return request({ url: `/productionPlan/editList`, data, method: 'post' });
};
const callAddReceivingItemInventory = async (data = {}) => {
  return request({ url: `/receiving/addItemManual`, data, method: 'post' });
};

let toastShown = false;
export const useAddReceivingItem = ({ afterAddItem }) => {
  return useMutation((currentData) => callAddReceivingItem(currentData), {
    onSuccess() {
      afterAddItem();
      if (!toastShown) {
        toastShown = true;
        toast('รับสินค้าสำเร็จ');
      }
    },
    onError(err) {
      afterAddItem();
      if (!toastShown) {
        toastShown = true;
        toast.error('รับสินค้าล้มเหลว');
      }
    },
  });
};
export const useUpdateStatusReceiving = () => {
  return useMutation((currentData) => callReceivingUpdateStatus(currentData), {
    onSuccess() {
      if (!toastShown) {
        toastShown = true;
        toast('รับสินค้าสำเร็จ');
      }
    },
    onError(err) {
      if (!toastShown) {
        toastShown = true;
        toast.error('รับสินค้าล้มเหลว');
      }
    },
  });
};
export const useAddReceivingItemInventory = ({ afterAddItem }) => {
  return useMutation((currentData) => callAddReceivingItemInventory(currentData), {
    onSuccess() {
      afterAddItem();
      if (!toastShown) {
        toastShown = true;
        toast('รับสินค้าสำเร็จ');
      }
    },
    onError(err) {
      afterAddItem();
      if (!toastShown) {
        toastShown = true;
        toast.error('รับสินค้าล้มเหลว');
        console.error('save order error :', err);
      }
    },
  });
};
