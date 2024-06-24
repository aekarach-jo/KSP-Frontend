import { useMutation } from 'react-query';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { request } from 'utils/axios-utils';
import { API } from '../../constants';

const callMatchingItem = (data = {}) => {
  return request({ url: API.ADD_MATCHING_ITEM, data, method: 'post' });
};

export const useAddMatchingItem = ({ afterAddItem }) => {
  const { formatMessage: f } = useIntl();

  return useMutation((currentData) => callMatchingItem(currentData), {
    onSuccess() {
      afterAddItem();
      toast(f({ id: 'material-production.matching-success' }));
    },
    onError(err) {
      afterAddItem();
      toast.error(f({ id: 'material-production.matching-error' }));
      console.error('matching product error :', err);
    },
  });
};
