import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  type: Yup.object().required('Required'),
  supplierId: Yup.string().required('Required'),
});

export const usePurchaseOrderFormik = ({ data, onSubmit }) => {
  return useFormik({ initialValues: data, onSubmit, validationSchema, enableReinitialize: true });
};
