import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Row, Col, Form, Card, Button, InputGroup, FormControl, Badge } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import Select from 'react-select';
import LovSelect from 'components/lov-select/LovSelect';
import LovProductSelect from 'components/lov-select/LovProductSelect';
import LovProductGroup from 'components/lov-select/LovProductGroup';
import LovProductMultiSelect from 'components/lov-select/LovProductMultiSelect';
import LovProductCreasingSelect from 'components/lov-select/LovProductCreasingSelect';
import LovColorPrintSelect from 'components/lov-select/LovColorPrintSelect';
import LovColorCoatSelect from 'components/lov-select/LovColorCoatSelect';
import LovProductUnitSelect from 'components/lov-select/LovProductUnitSelect';
import LovProductSubtype from 'components/lov-select/LovProductSubtype';
import LovMachineSelect from 'components/lov-select/LovMachineSelect';
import LovCautionListSelect from 'components/lov-select/LovDefectSelect';
import LovPatchingSelect from 'components/lov-select/LovPatchingSelect';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import AddProductItemModal from 'components/modal/AddProductItemModal';
import ColorSelectModal from 'components/modal/ColorSelectModal';
import StepSelectModal from 'components/modal/StepSelectModal';
import ManageProductUnitModalAdd from 'components/modal/ManageProductUnitModalAdd';
import ManageSubTypeModalAdd from 'components/modal/ManageSubTypeModalAdd';
import ProductPatchingModalAdd from 'components/modal/ProductPatchingModalAdd';
import ProductMachineModal from 'components/modal/ProductMachineModal';
import ProductCreasingingModalAdd from 'components/modal/ProductCreasingingModalAdd';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import LovCustomerSelect from 'components/lov-select/LovCustomerSelect';
import useProductPlanOptionsNoQC from 'hooks/useProductPlanOptionsNoQC';
import StepInputDisplay from './components/StepInputDisplay';
import BOMDetailCard from './components/BOMDetailCard';
// import UnitConverter from '../../production/rm/components/UnitConverter';

const getDefaultValues = () => ({
  code: '',
  name: '',
  partNo: '',
  nameEn: '',
  abbr: '',
  piecePerPack: 0,
  detail: '',
  remark: '',
  materialGroup: '',
  width: 0,
  length: 0,
  height: 0,
  cavity: 0,
  cuttingWidth: 0,
  cuttingLength: 0,
  bomList: [],
  priceList: [],
  printColor: [],
  printColorBack: [],
  coatingColor: [],
  productType: '',
  coatingMethod: [],
  productionStepDetail: [],
  completeStatus: false,
  customerStatus: false,
});

const getProductFn = (productId, productPlanOptions) => () =>
  request({ url: `/masterData/product/${productId}` })
    .then((res) => res.data.data)
    .then((data) => {
      data.bomList = data?.bomList.map((item) => ({
        ...item,
        ...item.bomId,
        bomId: item?.bomId?.id,
      }));
      const tempPS = data?.productionStep;
      const objPS = [];
      tempPS?.forEach((i) => {
        const dt = productPlanOptions.find((j) => j.value === i);
        objPS.push(dt);
      });
      data.customerId?.forEach((element, index) => {
        data.customerId[index] = element.id;
      });
      data.productionStep = objPS;
      return {
        ...getDefaultValues(),
        ...data,
        cuttingWidth: data?.cuttingSize?.width,
        cuttingLength: data?.cuttingSize?.length,
        cuttingDimensionalUOM: data?.cuttingSize?.dimensionalUOM,
      };
    });

const useProductData = (productId, productPlanOptions) =>
  useQuery(`editProductData`, getProductFn(productId, productPlanOptions), {
    enabled: !!productId,
    initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
    onError(err) {
      console.error('Error:', err);
    },
  });

const createProductFn = (product) => request({ url: `/masterData/product/add`, method: 'post', data: product }).then((res) => res.data);

const updateProductFn = ({ id, product }) => request({ url: `/masterData/product/${id}/edit`, method: 'post', data: product }).then((res) => res.data);
const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'product.save.success' })}</span>
      </div>
    </>
  );
};

const ProductDetail = (props) => {
  // console.debug('customer add props :', props);
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;

  const [isEditMode, setEditMode] = useState(!id);
  const [showProductTypeModal, setProductTypeMethodModal] = useState(false);
  const [showColorSelect, setColorSelectModal] = useState(false);
  const [showStepSelect, setStepSelectModal] = useState(false);
  const [showColorBackSelect, setColorBackSelectModal] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [chooseCondition, setChooseCondition] = useState();
  const { push } = useHistory();
  const [isShowUnitManage, setShowUnitManage] = useState(false);
  const [isSubTypeManage, setSubTypeManage] = useState(false);
  // const [isShowUnitConverter, setShowUnitConverter] = useState(false);
  const [isShowMessage, setShowMessage] = useState(false);
  const [isShowPatching, setShowPatching] = useState(false);
  const [isShowMachine, setShowMachine] = useState(false);
  const [isShowCreasing, setShowCreasing] = useState(false);
  const [valueChangeType, setValueChangeType] = useState(false);
  const [valueChangeCCoat, setValueChangeCCoat] = useState(false);
  const [valueChangeCreasing, setValueChangeCreasing] = useState(false);
  const [valueChangeCoat, setValueChangeCoat] = useState(false);
  const [colorData, setColorData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [valueChangeUnitM, setValueChangeUnitM] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [valueChangePatching, setValueChangePatching] = useState(false);
  const [valueChangeMachine, setValueChangeMachine] = useState(false);
  const [errorTextCoat, setErrorTextCoat] = useState(false);
  const scrollTargetRef = useRef(null);
  const queryClient = useQueryClient();
  const { planOptions } = useProductPlanOptionsNoQC();

  // const decimal = Number(localStorage.getItem('ConfigDecimal'));

  if (!id) {
    queryClient.resetQueries('editProductData');
  }

  const { data: initialValues, isFetching, error } = useProductData(id, planOptions());

  if (error) {
    console.error('error :', error);
  }
  // console.debug('customer Data :', initialValues);

  const { mutate: createProduct } = useMutation(createProductFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('create product success :', data);
      push('./');
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      const errorText = `This code is already exits. Please input another one`;
      setErrorCode(errorText);
      // console.log(err.text());
      console.error('create product error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editProductData');
    },
  });

  const { mutate: updateProduct } = useMutation(updateProductFn, {
    onSuccess(data) {
      setEditMode(false);
      console.debug('update product success :', data);
      toast(<ToastCreateSuccess />);
    },
    onError(err) {
      const errorText = `This code is already exits. Please input another one`;
      setErrorCode(errorText);
      // console.log(err.text());
      console.error('create product error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editProductData');
    },
  });

  const { formatMessage: f } = useIntl();

  const title = id ? f({ id: `product.detail.title` }, { productName: initialValues?.name }) : f({ id: `product.list.add` });
  const description = f(
    { id: `production.${!id ? 'add' : 'edit'}.subTitle` },
    {
      updatedBy: initialValues?.updatedBy,
      updatedAt: new Date(initialValues?.updatedAt || null),
    }
  );

  // Form stuff
  const bomValidationSchema = Yup.object().shape({
    bomId: Yup.string().required('product.detail.validation.code.required'),
    isDefault: Yup.boolean().required('customer.detail.validation.isDefault.required'),
  });

  const validationSchema = Yup.object().shape({
    code: Yup.string().required('product.detail.validation.code.required'),
    name: Yup.string().required('product.detail.validation.name.required'),
    partNo: Yup.string().required('product.detail.validation.partNo.required'),
    piecePerPack: Yup.number().min(0, 'product.detail.validation.piecePerPack.required').required('product.detail.validation.piecePerPack.required'),
    nameEn: Yup.string().required('product.detail.validation.nameEn.required'),
    abbr: Yup.string().required('product.detail.validation.abbr.required'),
    width: Yup.number().min(1, 'product.detail.validation.width.required').required('product.detail.validation.width.required'),
    length: Yup.number().min(1, 'product.detail.validation.length.required').required('product.detail.validation.length.required'),
    height: Yup.number().min(1, 'product.detail.validation.height.required').required('product.detail.validation.height.required'),
    cavity: Yup.number().min(1, 'product.detail.validation.cavity.required').required('product.detail.validation.cavity.required'),
    cuttingWidth: Yup.number().min(1, 'product.detail.validation.width.required').required('product.detail.validation.width.required'),
    cuttingLength: Yup.number().min(1, 'product.detail.validation.length.required').required('product.detail.validation.length.required'),
    dimensionalUOM: Yup.string().required('product.detail.validation.uom.required'),
    cuttingDimensionalUOM: Yup.string().required('product.detail.validation.uom.required'),
    materialGroup: Yup.string().required('product.detail.validation.materialGroup.required'),
    // coatingMethod: Yup.object().nullable().required('product.detail.validation.coatingMethod.required'),
    // density: Yup.string().required('product.detail.validation.density.required'),
    // list: Yup.array().of(priceListValidationSchema),
  });
  const onSubmit = (formData) => {
    const coatingColorList = [];
    // const coatingMethodList = [];
    const cautionList = [];
    const productionStep = [];
    const creasingLine = [];
    const customerList = [];
    const chkPriceError = formData.priceList.find((item) => item.error === true);
    // const chkPrintError = formData.printColor.find((item) => item.error === true);
    if (formData.customerId?.length > 0) {
      if (formData.customerId[0]?.value !== undefined) {
        formData.customerId?.forEach((element) => {
          customerList.push(element.value);
        });
        formData.customerId = customerList;
      } else {
        formData.customerId?.forEach((element) => element);
      }
    }
    if (formData.coatingColor?.length > 0) {
      if (formData.coatingColor[0]?.value !== undefined) {
        formData.coatingColor?.forEach((element) => {
          coatingColorList.push(element.value);
        });
        formData.coatingColor = coatingColorList;
      } else {
        formData.coatingColor?.forEach((element) => element);
      }
    }
    if (formData.creasingLine?.length > 0) {
      if (formData.creasingLine[0]?.value !== undefined) {
        formData.creasingLine?.forEach((element) => {
          creasingLine.push(element.value);
        });
        formData.creasingLine = creasingLine;
      } else {
        formData.creasingLine?.forEach((element) => element);
      }
    }
    if (formData.printColor?.length > 0) {
      formData.printColor?.forEach((element) => {
        if (element.color.value !== undefined) {
          element.color = element?.value;
          // element.color?.forEach((elementI) => {
          //   printColorList.push(elementI?.value);
          // });
        }
        delete element.error;
      });
    }
    if (formData.printColorBack?.length > 0) {
      formData.printColorBack?.forEach((element) => {
        if (element.color?.value !== undefined) {
          element.color = element?.value;
          // element.color?.forEach((elementI) => {
          //   printColorBackList.push(elementI?.value);
          // });
        }
        delete element.error;
      });
    }
    if (formData.coatingMethod?.length > 0) {
      formData.coatingMethod?.forEach((element) => {
        if (element.text?.value !== undefined) {
          element.text = element.text?.value;
          // element.text?.forEach((elementI) => {
          //   printtextList.push(elementI?.value);
          // });
          element.errorText = false;
        } else {
          element.errorText = true;
        }
        delete element.errorText;
      });
    }
    if (formData.cautionList?.length > 0) {
      if (formData.cautionList[0]?.value !== undefined) {
        formData.cautionList?.forEach((element) => {
          cautionList.push(element.detail.code);
        });
        formData.cautionList = cautionList;
      } else {
        formData.cautionList?.forEach((element) => element);
      }
    }
    if (formData.productionStepDetail?.length > 0) {
      if (formData.productionStepDetail[0]?.step !== undefined) {
        formData.productionStepDetail?.forEach((element) => {
          if (element !== undefined) {
            productionStep.push(element.step);
            productionStep.push(parseInt(`${element.step}1`, 10));
          }
        });
        formData.productionStep = productionStep;
      } else {
        formData.productionStep?.forEach((element) => element);
      }
    }
    formData.patching = formData.patching?.value;
    const newFormData = {
      ...formData,
      cuttingSize: {
        width: formData.cuttingWidth,
        length: formData.cuttingLength,
        dimensionalUOM: formData.cuttingDimensionalUOM,
      },
    };
    if (chkPriceError === undefined) {
      if (id) {
        // save
        updateProduct({ id, product: newFormData });
      } else {
        // create
        createProduct(newFormData);
      }
    }
    // console.log('submit form', newFormData);
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, setFieldValue, resetForm, values, touched, errors } = formik;

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    resetForm();
  };

  const handleCustomerRefSelected = useCallback(
    ({ id: cusId }) => {
      setFieldValue('customerId', cusId);
    },
    [setFieldValue]
  );

  const handleCustomerSearchChange = useCallback(
    (_e, { newValue }) => {
      if (newValue === '') {
        setFieldValue('customerId', undefined);
      }
    },
    [setFieldValue]
  );

  const handleSelectCustomer = (value) => {
    const customerList = value || [];
    const customerId = customerList.map((data) => data.value);
    setFieldValue('customerId', customerId);
  };

  const handleBOMSave =
    ({ arrayHelpers, list, index, isReplace }) =>
    (v) => {
      if (isReplace) {
        arrayHelpers.replace(index, v);
      } else {
        arrayHelpers.push(v);
      }

      // update isDefault
      if (v.isDefault) {
        list.forEach((item, idx) => {
          if (idx !== index) {
            item.isDefault = false;
            arrayHelpers.replace(idx, item);
          }
        });
      }
    };

  const handleBOMDelete =
    ({ arrayHelpers, list, index }) =>
    (item) => {
      if (item.isDefault) {
        // Find new default and set flag before remove.
        const newDefaultIdx = list.findIndex((i, idx) => idx !== index && !i.isDefault);
        if (newDefaultIdx >= 0) {
          arrayHelpers.replace(newDefaultIdx, { ...list[newDefaultIdx], isDefault: true });
        }
      }
      arrayHelpers.remove(index);
    };

  const handleChangeDimension = useCallback(
    (value) => {
      if (value === undefined) {
        value = '';
      }
      setFieldValue('dimensionalUOM', value);
    },
    [setFieldValue]
  );

  const handleChangeCuttingDimension = useCallback(
    (value) => {
      if (value === undefined) {
        value = '';
      }
      setFieldValue('cuttingDimensionalUOM', value);
    },
    [setFieldValue]
  );

  const handleChangeCoatingColor = (value) => {
    if (value !== null) {
      handleChange({ target: { id: 'coatingColor', value } });
    } else {
      handleChange({ target: { id: 'coatingColor', value: '' } });
    }
  };
  const handleChangeProductUnit = (value) => {
    if (value !== null) {
      handleChange({ target: { id: 'baseUOM', value: value.value } });
    } else {
      handleChange({ target: { id: 'baseUOM', value: '' } });
    }
  };
  const handleChangeSubtype = (value) => {
    if (value !== null) {
      handleChange({ target: { id: 'productSubType', value: value.value } });
    } else {
      handleChange({ target: { id: 'productSubType', value: '' } });
    }
  };
  const handleChangeProductType = (value) => {
    if (value !== null) {
      const productType = value.value;
      handleChange({ target: { id: 'productType', value: productType } });
    } else {
      const productType = '';
      handleChange({ target: { id: 'productType', value: productType } });
    }
  };
  const handleChangeProductGroup = (value) => {
    if (value !== null) {
      const materialGroup = value.value;
      handleChange({ target: { id: 'materialGroup', value: materialGroup } });
    } else {
      const materialGroup = '';
      handleChange({ target: { id: 'materialGroup', value: materialGroup } });
    }
  };
  const handleChangeCoatingMethod = (value) => {
    if (value !== null) {
      handleChange({ target: { id: 'coatingMethod', value } });
    } else {
      handleChange({ target: { id: 'coatingMethod', value: '' } });
    }
  };

  const handleChangeCreasingMethod = (value) => {
    if (value !== null) {
      handleChange({ target: { id: 'creasingLine', value } });
    } else {
      handleChange({ target: { id: 'creasingLine', value: '' } });
    }
  };

  const handleChangeMachine = (value) => {
    const machineList = value || [];
    const machineId = machineList.map((data) => data.value);
    setFieldValue('machineId', machineId);
  };
  const handleChangeCautionList = (value) => {
    if (value !== null) {
      const cautionList = value.value;
      handleChange({ target: { id: 'cautionList', value } });
    } else {
      const cautionList = '';
      handleChange({ target: { id: 'cautionList', value: cautionList } });
    }
  };
  const handleChangePatchingList = (value) => {
    if (value !== null) {
      const patching = value.value;
      handleChange({ target: { id: 'patching', value } });
    } else {
      const patching = '';
      handleChange({ target: { id: 'patching', value: patching } });
    }
  };
  const toggleProductTypeModal = useCallback((value) => {
    setChooseCondition(value);
    setProductTypeMethodModal((prev) => !prev);
  }, []);
  const toggleColorSelectModal = useCallback((value) => {
    setColorSelectModal((prev) => !prev);
  }, []);
  const toggleStepSelectModal = useCallback((value) => {
    setStepSelectModal((prev) => !prev);
  }, []);
  const toggleColorBackSelectModal = useCallback((value) => {
    setColorBackSelectModal((prev) => !prev);
  }, []);
  const toggleUnitManageModal = useCallback(() => {
    setShowUnitManage((prev) => !prev);
  }, []);
  const toggleSubtypeManageModal = useCallback(() => {
    setSubTypeManage((prev) => !prev);
  }, []);
  const togglePatching = useCallback(() => {
    setShowPatching((prev) => !prev);
  }, []);
  const toggleMachine = useCallback(() => {
    setShowMachine((prev) => !prev);
  }, []);
  const toggleCreasing = useCallback(() => {
    setShowCreasing((prev) => !prev);
  }, []);
  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  const handleSave = () => {
    values.priceList.forEach((v, i) => {
      if (
        v.min !== '' &&
        v.min !== null &&
        v.min > 0 &&
        v.max !== '' &&
        v.max !== null &&
        v.max > 0 &&
        v.price !== '' &&
        v.price !== null &&
        v.price > 0 &&
        v.max >= v.min
      ) {
        handleChange({ target: { id: `priceList.${i}.error`, value: false } });
        if (i > 0) {
          if (values.priceList[i - 1].max >= v.min || v.min !== parseInt(values.priceList[i - 1].max, 10) + 1) {
            scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
            handleChange({ target: { id: `priceList.${i}.error`, value: true } });
          }
        }
      } else {
        scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
        handleChange({ target: { id: `priceList.${i}.error`, value: true } });
      }
    });
    // values.printColor.forEach((v, i) => {
    //   if (v.density !== '' && v.density !== null && v.density > 0) {
    //     handleChange({ target: { id: `printColor.${i}.error`, value: false } });
    //   } else {
    //     scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
    //     handleChange({ target: { id: `printColor.${i}.error`, value: true } });
    //   }
    // });
    if (values.coatingMethod?.length > 0) {
      values.coatingMethod?.forEach((element, index) => {
        if (element?.text?.value !== undefined) {
          setErrorTextCoat(false);
        } else {
          setErrorTextCoat(true);
        }
      });
    }

    handleSubmit();
  };
  const handleChangeManual = useCallback((name) => (v) => setFieldValue(name, v), [setFieldValue]);
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        bgColor="#1EA8E7"
        title={title}
        description={description}
        isLoading={isFetching}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
          cancel: { label: f({ id: 'common.cancel' }), onCancel: handleCancelClick, isHide: !isEditMode || !id },
          edit: { label: f({ id: 'common.edit' }), onEdit: handleEditClick, isHide: isEditMode },
          save: { label: f({ id: 'common.save' }), onSubmit: handleSave, isHide: !isEditMode || (!isEditMode && !id) },
        }}
      />
      <Col className="mb-1">
        <h2 className="small-title">{f({ id: 'product.detail.information' })}</h2>
        <Form onSubmit={handleSubmit}>
          <Card
            className={classNames('mb-1', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="mb-1">
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.code' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>
                <Col lg="5" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.partNo' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>
                <Col lg="4" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.field.materialGroup' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>
                <Col lg="3" md="12" sm="12">
                  <Form.Control
                    type="text"
                    name="code"
                    onChange={handleChange}
                    readOnly={!isEditMode}
                    value={values.code}
                    isInvalid={errors.code && touched.code}
                  />
                  {errorCode !== '' ? (
                    <div className="d-block invalid-feedback">{errorCode}</div>
                  ) : (
                    errors.code && touched.code && <div className="d-block invalid-feedback">{f({ id: errors.code })}</div>
                  )}
                </Col>
                <Col lg="5" md="12" sm="12">
                  <Form.Control
                    type="text"
                    name="partNo"
                    onChange={handleChange}
                    value={values.partNo || ''}
                    readOnly={!isEditMode}
                    required
                    isInvalid={errors.partNo && touched.partNo}
                  />
                  {errors.partNo && touched.partNo && <div className="d-block invalid-feedback">{f({ id: errors.partNo })}</div>}
                </Col>
                <Col lg="4" md="12" sm="12">
                  <LovSelect
                    name="materialGroup"
                    lov="MATERIAL_GROUP"
                    onChange={handleChangeManual('materialGroup')}
                    value={values.materialGroup || ''}
                    isDisabled={!isEditMode}
                  />
                  {errors.materialGroup && touched.materialGroup && <div className="d-block invalid-feedback">{f({ id: errors.materialGroup })}</div>}
                </Col>
              </Row>
              <Row className="mb-1">
                <Col lg="5" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.name' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>
                <Col lg="5" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.nameEn' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>
                <Col lg="2" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.abbr' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>
                <Col lg="5" md="12" sm="12">
                  <Form.Control
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={values.name || ''}
                    isInvalid={errors.name && touched.name}
                    readOnly={!isEditMode}
                    required
                  />
                  {errors.name && touched.name && <div className="d-block invalid-feedback">{f({ id: errors.name })}</div>}
                </Col>
                <Col lg="5" md="12" sm="12">
                  <Form.Control
                    type="text"
                    name="nameEn"
                    onChange={handleChange}
                    value={values.nameEn || ''}
                    isInvalid={errors.nameEn && touched.nameEn}
                    readOnly={!isEditMode}
                    required
                  />
                  {errors.nameEn && touched.nameEn && <div className="d-block invalid-feedback">{f({ id: errors.nameEn })}</div>}
                </Col>
                <Col lg="2" md="12" sm="12">
                  <Form.Control
                    type="text"
                    name="abbr"
                    onChange={handleChange}
                    value={values.abbr || ''}
                    isInvalid={errors.abbr && touched.abbr}
                    readOnly={!isEditMode}
                    required
                  />
                  {errors.abbr && touched.abbr && <div className="d-block invalid-feedback">{f({ id: errors.abbr })}</div>}
                </Col>
              </Row>
              <Row className="mb-1">
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.type' })}</Form.Label>
                </Col>
                <Col lg="3" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.field.subType' })}</Form.Label>
                </Col>
                <Col lg="2" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.productUnit' })}</Form.Label>
                </Col>
                <Col lg="2" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.printCategory' })}</Form.Label>
                </Col>
                <Col lg="2" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.cavity' })}</Form.Label>
                  <span className="text-danger"> *</span>
                </Col>

                <Col sm="12" md="12" lg="3">
                  <Row>
                    <Col xs className="pe-0">
                      <LovProductSelect
                        name="productType"
                        lov="PRODUCT_TYPE"
                        onChange={handleChangeProductType}
                        value={values.productType || ''}
                        isDisabled={!isEditMode}
                        valueChange={valueChangeType}
                        setValueChange={setValueChangeType}
                      />
                      {errors.baseUOM && touched.baseUOM && <div className="d-block invalid-feedback">{f({ id: errors.baseUOM })}</div>}
                    </Col>
                    <Col xs="auto">
                      <Button
                        className="btn-icon btn-icon-start"
                        variant="primary"
                        onClick={() => toggleProductTypeModal('PRODUCT_GROUP')}
                        disabled={!isEditMode}
                      >
                        <CsLineIcons icon="edit" />
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col sm="12" md="12" lg="3">
                  <Row>
                    <Col xs className="pe-0">
                      <LovProductSubtype
                        name="subType"
                        onChange={handleChangeSubtype}
                        value={values.productSubType || ''}
                        isDisabled={!isEditMode}
                        valueChange={valueChangeUnitM}
                        setSubTypeManage={setSubTypeManage}
                        setValueChange={setValueChangeUnitM}
                      />
                      {/* {errors.subType && touched.subType && <div className="d-block invalid-feedback">{f({ id: errors.subType })}</div>} */}
                    </Col>
                    <Col xs="auto">
                      <Button className="btn-icon btn-icon-start" variant="primary" onClick={() => toggleSubtypeManageModal()} disabled={!isEditMode}>
                        <CsLineIcons icon="edit" />
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col sm="12" md="12" lg="2">
                  <Row>
                    <Col xs className="pe-0">
                      <LovProductUnitSelect
                        isClearable
                        onChange={handleChangeProductUnit}
                        value={values.baseUOM || ''}
                        isDisabled={!isEditMode}
                        valueChange={valueChangeUnitM}
                        setValueChange={setValueChangeUnitM}
                      />
                      {errors.baseUOM && touched.baseUOM && <div className="d-block invalid-feedback">{f({ id: errors.baseUOM })}</div>}
                    </Col>
                    <Col xs="auto">
                      <Button className="btn-icon btn-icon-start" variant="primary" onClick={() => toggleUnitManageModal()} disabled={!isEditMode}>
                        <CsLineIcons icon="edit" />
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col sm="12" md="12" lg="2">
                  <Form.Control
                    type="text"
                    name="printCategory"
                    onChange={handleChange}
                    value={values.printCategory || ''}
                    isInvalid={errors.printCategory && touched.printCategory}
                    readOnly={!isEditMode}
                  />
                  {errors.printCategory && touched.printCategory && <div className="d-block invalid-feedback">{f({ id: errors.printCategory })}</div>}
                </Col>
                <Col sm="12" md="12" lg="2">
                  <Form.Control
                    type="number"
                    name="cavity"
                    onChange={handleChange}
                    value={values.cavity || ''}
                    isInvalid={errors.cavity && touched.cavity}
                    readOnly={!isEditMode}
                  />
                  {errors.cavity && touched.cavity && <div className="d-block invalid-feedback">{f({ id: errors.cavity })}</div>}
                </Col>
              </Row>
              <Row className="mb-1">
                <Form.Label
                  style={{ font: '14px/1.4 sans-serif', margin: '0 auto', backgroundColor: '#778899', textAlign: 'center', color: '#eee' }}
                  className="col-form-label"
                >
                  {f({ id: 'product.dimension' })}
                </Form.Label>
                <Row>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.width' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Form.Control
                      type="number"
                      name="width"
                      onChange={handleChange}
                      value={values.width || ''}
                      isInvalid={errors.width && touched.width}
                      readOnly={!isEditMode}
                    />
                    {errors.width && touched.width && <div className="d-block invalid-feedback">{f({ id: errors.width })}</div>}
                  </Col>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.length' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Form.Control
                      type="number"
                      name="length"
                      onChange={handleChange}
                      value={values.length || ''}
                      isInvalid={errors.length && touched.length}
                      readOnly={!isEditMode}
                    />
                    {errors.length && touched.length && <div className="d-block invalid-feedback">{f({ id: errors.length })}</div>}
                  </Col>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.height' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Form.Control
                      type="number"
                      name="height"
                      onChange={handleChange}
                      value={values.height || ''}
                      isInvalid={errors.height && touched.height}
                      readOnly={!isEditMode}
                    />
                    {errors.height && touched.height && <div className="d-block invalid-feedback">{f({ id: errors.height })}</div>}
                  </Col>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.unit' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <LovSelect
                      name="dimensionalUOM"
                      isClearable
                      lov="MATERIAL_DIMENSIONALUOM"
                      onChange={handleChangeDimension}
                      value={values.dimensionalUOM || ''}
                      isDisabled={!isEditMode}
                    />
                    {errors.dimensionalUOM && <div className="d-block invalid-feedback">{f({ id: errors.dimensionalUOM })}</div>}
                  </Col>
                </Row>
              </Row>
              <Row className="mb-1">
                <Form.Label
                  style={{
                    font: '14px/1.4 sans-serif',

                    margin: '0 auto',
                    backgroundColor: '#778899',
                    alignContent: 'center',
                    textAlign: 'center',
                    color: '#eee',
                  }}
                  className="col-form-label"
                >
                  {f({ id: 'product.cuttingSize' })}
                </Form.Label>
                <Row>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.width' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Form.Control
                      type="number"
                      name="cuttingWidth"
                      onChange={handleChange}
                      value={values.cuttingWidth || ''}
                      isInvalid={errors.cuttingWidth && touched.cuttingWidth}
                      readOnly={!isEditMode}
                    />
                    {errors.cuttingWidth && touched.cuttingWidth && <div className="d-block invalid-feedback">{f({ id: errors.cuttingWidth })}</div>}
                  </Col>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.length' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Form.Control
                      type="number"
                      name="cuttingLength"
                      onChange={handleChange}
                      value={values.cuttingLength || ''}
                      isInvalid={errors.cuttingLength && touched.cuttingLength}
                      readOnly={!isEditMode}
                    />
                    {errors.cuttingLength && touched.cuttingLength && <div className="d-block invalid-feedback">{f({ id: errors.cuttingLength })}</div>}
                  </Col>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.unit' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Row>
                      <LovSelect
                        name="cuttingDimensionalUOM"
                        isClearable
                        lov="MATERIAL_DIMENSIONALUOM"
                        onChange={handleChangeCuttingDimension}
                        value={values.cuttingDimensionalUOM || ''}
                        isDisabled={!isEditMode}
                      />
                      {errors.cuttingDimensionalUOM && <div className="d-block invalid-feedback">{f({ id: errors.cuttingDimensionalUOM })}</div>}
                    </Row>
                  </Col>
                  <Col sm="6" md="3">
                    <Form.Label className="col-form-label">{f({ id: 'product.perPack' })}</Form.Label>
                    <span className="text-danger"> *</span>
                    <Form.Control
                      type="number"
                      name="piecePerPack"
                      onChange={handleChange}
                      value={values.piecePerPack || ''}
                      isInvalid={errors.piecePerPack && touched.piecePerPack}
                      readOnly={!isEditMode}
                    />
                    {errors.piecePerPack && touched.piecePerPack && <div className="d-block invalid-feedback">{f({ id: errors.piecePerPack })}</div>}
                  </Col>
                </Row>
              </Row>
              <Row className="mb-1">
                <Col sm="12" md="12" lg="12">
                  <Form.Group className="tooltip-end-top mb-1">
                    <Row>
                      <Col lg="10" md="10" sm="10">
                        <Form.Label className="col-form-label">{f({ id: 'product.field.stepPlan' })}</Form.Label>
                      </Col>
                      <Col lg="2" md="2" sm="2" style={{ textAlign: 'right' }} disabled={!isEditMode}>
                        <Button className="btn-icon btn-icon-start" variant="primary" onClick={() => toggleStepSelectModal('step')} disabled={!isEditMode}>
                          <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                <Col sm="12" md="12" lg="12">
                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                    style={
                      // values.tooling.length > 0
                      // ? { maxHeight: '250px', minHeight: '200px', position: 'relative', zIndex: '0' } :
                      { maxHeight: '250px', position: 'relative', zIndex: '0' }
                    }
                  >
                    <Card className="p-2" style={{ position: 'relative', zIndex: '1' }}>
                      <FormikProvider value={formik}>
                        <FieldArray
                          name="productionStepDetail"
                          render={(arrayHelpers) => {
                            return [
                              values.productionStepDetail?.map((detail, index) => {
                                return (
                                  <Row key={index}>
                                    <Col lg="11" md="11" sm="11">
                                      <Form.Group className="tooltip-end-top mb-1">
                                        <Row>
                                          <Col sm="12" md="" lg="10">
                                            {/* <LovColorPrintSelect
                                              name={`productionStepDetail.${index}.color`}
                                              isClearable
                                              lov="PRODUCT_COLOR"
                                              onChange={(i) => {
                                                if (i !== null) {
                                                  handleChange({ target: { id: `productionStepDetail.${index}.color`, value: i } });
                                                } else {
                                                  handleChange({ target: { id: `productionStepDetail.${index}.color`, value: '' } });
                                                }
                                              }}
                                              value={detail.color || ''}
                                              isDisabled={!isEditMode}
                                              valueChange={valueChangeCCoat}
                                              setValueChange={setValueChangeCCoat}
                                            /> */}
                                            <StepInputDisplay disabled name={`productionStepDetail.${index}.step`} value={detail.step || ''} />
                                          </Col>
                                          <Col sm="12" md="" lg="2">
                                            <div className="text-end">
                                              <Form.Check
                                                type="checkbox"
                                                className="form-check float-end mt-1"
                                                name={`productionStepDetail.${index}.flagQC`}
                                                onChange={handleChange}
                                                checked={detail.flagQC || false}
                                                // isInvalid={detail.error}
                                                disabled={!isEditMode}
                                                label={`${f({ id: 'product.field.skip' })} QC`}
                                              />
                                            </div>
                                          </Col>
                                        </Row>
                                        <Form.Control.Feedback type="invalid">Please provide Print color</Form.Control.Feedback>
                                      </Form.Group>
                                    </Col>
                                    <Col style={{ paddingLeft: '1.2rem' }} lg="1" md="1" sm="1">
                                      {isEditMode && ( // TODO: Change this before finish
                                        <Button
                                          className="btn-icon btn-icon-only"
                                          variant="outline-danger"
                                          onClick={() => {
                                            arrayHelpers.remove(index);
                                          }}
                                        >
                                          <CsLineIcons icon="bin" />
                                        </Button>
                                      )}
                                    </Col>
                                  </Row>
                                );
                              }),
                              // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                            ];
                          }}
                        />
                      </FormikProvider>
                    </Card>
                  </OverlayScrollbarsComponent>
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="productionStepDetail"
                      render={(arrayHelpers) => {
                        return [
                          isEditMode && ( // TODO: Change this before finish
                            <div key="addPrintingList" className="d-grid gap-2 mb-1">
                              {/* <Button
                                variant="outline-primary"
                                className="btn-icon btn-icon-start mb-1"
                                onClick={() => arrayHelpers.insert(values.printColor?.length, '')}
                              >
                                <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                              </Button> */}
                              <StepSelectModal
                                show={showStepSelect}
                                hide={toggleStepSelectModal}
                                setShowModal={setStepSelectModal}
                                setStepData={setStepData}
                                onRemove={(index) => arrayHelpers.remove(index)}
                                stepValue={values?.productionStepDetail}
                                onSave={(index, item) => {
                                  handleChange({
                                    target: { id: `productionStepDetail.${values?.productionStepDetail?.length}.step`, value: item.value },
                                  });
                                  handleChange({
                                    target: { id: `productionStepDetail.${values?.productionStepDetail?.length}.flagQC`, value: false },
                                  });
                                  return true;
                                }}
                              />
                            </div>
                          ),
                        ];
                      }}
                    />
                  </FormikProvider>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col sm="12" md="12" lg="12">
                  <Row>
                    <Col sm="12" md="12" lg="12">
                      <Form.Group className="tooltip-end-top">
                        <Row>
                          <Col lg="10" md="10" sm="10">
                            <Form.Label className="col-form-label">{f({ id: 'product.printColor' })}</Form.Label>
                          </Col>
                          <Col lg="2" md="2" sm="2" style={{ textAlign: 'right' }} disabled={!isEditMode}>
                            <Button
                              className="btn-icon btn-icon-start text-right"
                              variant="primary"
                              onClick={() => toggleColorSelectModal('color')}
                              disabled={!isEditMode}
                            >
                              <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                            </Button>
                          </Col>
                          {/* <Col sm="12" md="12" lg="10">
                            <Form.Label className="col-form-label">{f({ id: 'product.printColor' })}</Form.Label>
                          </Col>

                          <Col sm="12" md="12" lg="2" className="justify-content-end">
                            <Button
                              className="btn-icon btn-icon-start text-right"
                              variant="primary"
                              onClick={() => toggleProductTypeModal('color')}
                              disabled={!isEditMode}
                            >
                              <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                            </Button>
                          </Col> */}
                          {/* {isEditMode && ( */}

                          {/* <Col sm="12" md="12" lg="4">
                            <Form.Control
                              type="text"
                              onChange={(e) => {
                                const foundProducts = values?.tooling.filter((item) => {
                                  // ใช้ฟังก์ชัน some() เพื่อตรวจสอบว่า keyword ตรงกับ label ใน mapProduct ของแต่ละ object
                                  return item.mapProduct.some((product) => product.label.includes(e.target.value));
                                });
                                if (e.target.value === '') {
                                  handleChange({ target: { id: `tooling`, value: '' } });
                                } else {
                                  handleChange({ target: { id: `tooling`, value: foundProducts } });
                                }
                              }}
                              placeholder="search product.."
                              // value={values.maintenancePeriod}
                              // isInvalid={errors.maintenancePeriod && touched.maintenancePeriod}
                              // readOnly={!isEditMode}
                            />
                          </Col> */}
                          {/* )} */}
                        </Row>
                      </Form.Group>
                    </Col>
                  </Row>

                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                    style={
                      // values.tooling.length > 0
                      // ? { maxHeight: '250px', minHeight: '200px', position: 'relative', zIndex: '0' } :
                      { maxHeight: '250px', position: 'relative', zIndex: '0' }
                    }
                  >
                    <Card className="p-2" style={{ position: 'relative', zIndex: '1' }}>
                      <FormikProvider value={formik}>
                        <FieldArray
                          name="printColor"
                          render={(arrayHelpers) => {
                            return [
                              values.printColor?.map((detail, index) => {
                                return (
                                  <Row key={index}>
                                    <Col lg="11" md="11" sm="11">
                                      <Form.Group className="tooltip-end-top mb-1">
                                        <Row>
                                          <Col sm="12" md="" lg="8">
                                            {/* <LovColorPrintSelect
                                              name={`printColor.${index}.color`}
                                              isClearable
                                              lov="PRODUCT_COLOR"
                                              onChange={(i) => {
                                                if (i !== null) {
                                                  handleChange({ target: { id: `printColor.${index}.color`, value: i } });
                                                } else {
                                                  handleChange({ target: { id: `printColor.${index}.color`, value: '' } });
                                                }
                                              }}
                                              value={detail.color || ''}
                                              isDisabled={!isEditMode}
                                              valueChange={valueChangeCCoat}
                                              setValueChange={setValueChangeCCoat}
                                            /> */}
                                            <Form.Control
                                              type="text"
                                              name={`printColor.${index}.color`}
                                              // onChange={handleChange}
                                              value={detail.color || ''}
                                              readOnly
                                            />
                                          </Col>
                                          <Col sm="12" md="" lg="4">
                                            <Form.Control
                                              as={NumberFormat}
                                              type="text"
                                              name={`printColor.${index}.density`}
                                              onChange={handleChange}
                                              onKeyDown={(e) => {
                                                if (e.key === '-') {
                                                  e.preventDefault();
                                                } else {
                                                  handleChange(e);
                                                }
                                              }}
                                              value={detail.density || ''}
                                              // isInvalid={detail.error}
                                              readOnly={!isEditMode}
                                            />
                                          </Col>
                                        </Row>
                                        <Form.Control.Feedback type="invalid">Please provide Print color</Form.Control.Feedback>
                                      </Form.Group>
                                    </Col>
                                    <Col style={{ paddingLeft: '1.2rem' }} lg="1" md="1" sm="1">
                                      {isEditMode && ( // TODO: Change this before finish
                                        <Button
                                          className="btn-icon btn-icon-only"
                                          variant="outline-danger"
                                          onClick={() => {
                                            arrayHelpers.remove(index);
                                          }}
                                        >
                                          <CsLineIcons icon="bin" />
                                        </Button>
                                      )}
                                    </Col>
                                  </Row>
                                );
                              }),
                              // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                            ];
                          }}
                        />
                      </FormikProvider>
                    </Card>
                  </OverlayScrollbarsComponent>
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="printColor"
                      render={(arrayHelpers) => {
                        return [
                          isEditMode && ( // TODO: Change this before finish
                            <div key="addPrintingList" className="d-grid gap-2 mb-1">
                              {/* <Button
                                variant="outline-primary"
                                className="btn-icon btn-icon-start mb-1"
                                onClick={() => arrayHelpers.insert(values.printColor?.length, '')}
                              >
                                <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                              </Button> */}
                              <ColorSelectModal
                                show={showColorSelect}
                                hide={toggleColorSelectModal}
                                setShowModal={setColorSelectModal}
                                setColorData={setColorData}
                                onRemove={(index) => arrayHelpers.remove(index)}
                                printColor={values?.printColor}
                                onSave={(index, item) => {
                                  handleChange({
                                    target: { id: `printColor.${values?.printColor?.length}.color`, value: item.colorName },
                                  });
                                  return true;
                                }}
                              />
                            </div>
                          ),
                        ];
                      }}
                    />
                  </FormikProvider>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col sm="12" md="12" lg="12">
                  <Row>
                    <Col sm="12" md="12" lg="12">
                      <Form.Group className="tooltip-end-top mb-1">
                        <Row>
                          <Col lg="10" md="10" sm="10">
                            <Form.Label className="col-form-label">{f({ id: 'product.printColorBack' })}</Form.Label>
                          </Col>
                          <Col lg="2" md="2" sm="2" style={{ textAlign: 'right' }} disabled={!isEditMode}>
                            <Button
                              className="btn-icon btn-icon-start text-right"
                              variant="primary"
                              onClick={() => toggleColorBackSelectModal('color')}
                              disabled={!isEditMode}
                            >
                              <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                            </Button>
                          </Col>
                          {/* <Col sm="12" md="12" lg="10">
                            <Form.Label className="col-form-label">{f({ id: 'product.printColor' })}</Form.Label>
                          </Col>

                          <Col sm="12" md="12" lg="2" className="justify-content-end">
                            <Button
                              className="btn-icon btn-icon-start text-right"
                              variant="primary"
                              onClick={() => toggleProductTypeModal('color')}
                              disabled={!isEditMode}
                            >
                              <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                            </Button>
                          </Col> */}
                          {/* {isEditMode && ( */}

                          {/* <Col sm="12" md="12" lg="4">
                            <Form.Control
                              type="text"
                              onChange={(e) => {
                                const foundProducts = values?.tooling.filter((item) => {
                                  // ใช้ฟังก์ชัน some() เพื่อตรวจสอบว่า keyword ตรงกับ label ใน mapProduct ของแต่ละ object
                                  return item.mapProduct.some((product) => product.label.includes(e.target.value));
                                });
                                if (e.target.value === '') {
                                  handleChange({ target: { id: `tooling`, value: '' } });
                                } else {
                                  handleChange({ target: { id: `tooling`, value: foundProducts } });
                                }
                              }}
                              placeholder="search product.."
                              // value={values.maintenancePeriod}
                              // isInvalid={errors.maintenancePeriod && touched.maintenancePeriod}
                              // readOnly={!isEditMode}
                            />
                          </Col> */}
                          {/* )} */}
                        </Row>
                      </Form.Group>
                    </Col>
                  </Row>

                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                    style={
                      // values.tooling.length > 0
                      // ? { maxHeight: '250px', minHeight: '200px', position: 'relative', zIndex: '0' } :
                      { maxHeight: '250px', position: 'relative', zIndex: '0' }
                    }
                  >
                    <Card className="p-2" style={{ position: 'relative', zIndex: '1' }}>
                      <FormikProvider value={formik}>
                        <FieldArray
                          name="printColorBack"
                          render={(arrayHelpers) => {
                            return [
                              values.printColorBack?.map((detail, index) => {
                                return (
                                  <Row key={index}>
                                    <Col lg="11" md="11" sm="11">
                                      <Form.Group className="tooltip-end-top mb-1">
                                        <Row>
                                          <Col sm="12" md="" lg="8">
                                            {/* <LovColorPrintSelect
                                              name={`printColorBack.${index}.color`}
                                              isClearable
                                              lov="PRODUCT_COLOR"
                                              onChange={(i) => {
                                                if (i !== null) {
                                                  handleChange({ target: { id: `printColorBack.${index}.color`, value: i } });
                                                } else {
                                                  handleChange({ target: { id: `printColorBack.${index}.color`, value: '' } });
                                                }
                                              }}
                                              value={detail.color || ''}
                                              isDisabled={!isEditMode}
                                              valueChange={valueChangeCCoat}
                                              setValueChange={setValueChangeCCoat}
                                            /> */}
                                            <Form.Control
                                              type="text"
                                              name={`printColorBack.${index}.color`}
                                              // onChange={handleChange}
                                              value={detail.color || ''}
                                              readOnly
                                            />
                                          </Col>
                                          <Col sm="12" md="" lg="4">
                                            <Form.Control
                                              as={NumberFormat}
                                              type="text"
                                              name={`printColorBack.${index}.density`}
                                              onChange={handleChange}
                                              onKeyDown={(e) => {
                                                if (e.key === '-') {
                                                  e.preventDefault();
                                                } else {
                                                  handleChange(e);
                                                }
                                              }}
                                              value={detail.density || ''}
                                              // isInvalid={detail.error}
                                              readOnly={!isEditMode}
                                            />
                                          </Col>
                                        </Row>
                                        <Form.Control.Feedback type="invalid">Please provide black print color</Form.Control.Feedback>
                                      </Form.Group>
                                    </Col>
                                    <Col style={{ paddingLeft: '1.2rem' }} lg="1" md="1" sm="1">
                                      {isEditMode && ( // TODO: Change this before finish
                                        <Button
                                          className="btn-icon btn-icon-only"
                                          variant="outline-danger"
                                          onClick={() => {
                                            arrayHelpers.remove(index);
                                          }}
                                        >
                                          <CsLineIcons icon="bin" />
                                        </Button>
                                      )}
                                    </Col>
                                  </Row>
                                );
                              }),
                              // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                            ];
                          }}
                        />
                      </FormikProvider>
                    </Card>
                  </OverlayScrollbarsComponent>
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="printColorBack"
                      render={(arrayHelpers) => {
                        return [
                          isEditMode && ( // TODO: Change this before finish
                            <div key="addPrintingList" className="d-grid gap-2 mb-1">
                              <ColorSelectModal
                                show={showColorBackSelect}
                                hide={toggleColorBackSelectModal}
                                setShowModal={setColorBackSelectModal}
                                setColorData={setColorData}
                                onRemove={(index) => arrayHelpers.remove(index)}
                                printColor={values?.printColorBack}
                                onSave={(index, item) => {
                                  handleChange({
                                    target: { id: `printColorBack.${values?.printColorBack?.length}.color`, value: item.colorName },
                                  });
                                  return true;
                                }}
                              />
                            </div>
                          ),
                        ];
                      }}
                    />
                  </FormikProvider>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col sm="12" md="12" lg="12">
                  <Row>
                    <Col sm="12" md="12" lg="12">
                      <Form.Group className="tooltip-end-top mb-1">
                        <Row>
                          <Col lg="10" md="10" sm="10">
                            <Form.Label className="col-form-label">{f({ id: 'product.coatColor' })}</Form.Label>
                          </Col>
                          <Col lg="2" md="2" sm="2" style={{ textAlign: 'right' }} disabled={!isEditMode}>
                            <Button
                              className="btn-icon btn-icon-start"
                              variant="primary"
                              onClick={() => toggleProductTypeModal('PRODUCT_COATING')}
                              disabled={!isEditMode}
                            >
                              <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                            </Button>
                          </Col>
                        </Row>
                      </Form.Group>
                    </Col>
                  </Row>

                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                    style={
                      // values.tooling.length > 0
                      { maxHeight: '250px', position: 'relative', zIndex: '0' }
                      // { maxHeight: '400px', minHeight: '200px', position: 'relative', zIndex: '0' }
                    }
                  >
                    <Card className="p-2" style={{ position: 'relative', zIndex: '1' }}>
                      <FormikProvider value={formik}>
                        <FieldArray
                          name="coatingMethod"
                          render={(arrayHelpers) => {
                            return [
                              values.coatingMethod?.map((detail, index) => {
                                return (
                                  <Row key={index}>
                                    <Col lg="11" md="11" sm="11">
                                      <Form.Group className="tooltip-end-top mb-1">
                                        <Row>
                                          <Col sm="12" md="" lg="8">
                                            <Form.Control
                                              type="text"
                                              name={`coatingMethod.${index}.text`}
                                              // onChange={handleChange}
                                              value={detail.text || ''}
                                              readOnly
                                            />
                                          </Col>
                                          <Col sm="12" md="" lg="4">
                                            <Form.Control
                                              as={NumberFormat}
                                              type="text"
                                              name={`coatingMethod.${index}.value`}
                                              onChange={handleChange}
                                              onKeyDown={(e) => {
                                                if (e.key === '-') {
                                                  e.preventDefault();
                                                } else {
                                                  handleChange(e);
                                                }
                                              }}
                                              value={detail.value || ''}
                                              // isInvalid={detail.error}
                                              readOnly={!isEditMode}
                                            />
                                          </Col>
                                        </Row>
                                        {/* <Form.Control.Feedback type="invalid">Please provide Print color</Form.Control.Feedback> */}
                                      </Form.Group>
                                    </Col>
                                    <Col style={{ paddingLeft: '1.2rem' }} lg="1" md="1" sm="1">
                                      {isEditMode && ( // TODO: Change this before finish
                                        <Button
                                          className="btn-icon btn-icon-only"
                                          variant="outline-danger"
                                          onClick={() => {
                                            arrayHelpers.remove(index);
                                          }}
                                        >
                                          <CsLineIcons icon="bin" />
                                        </Button>
                                      )}
                                    </Col>
                                  </Row>
                                );
                              }),
                              // !isEditMode && values?.tooling?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                            ];
                          }}
                        />
                        {/* {errorTextCoat && <div className="d-block invalid-feedback">{f({ id: 'product.validation.coatColor' })}</div>} */}
                      </FormikProvider>
                      <FormikProvider value={formik}>
                        <FieldArray
                          name="coatingMethod"
                          render={(arrayHelpers) => {
                            return [
                              isEditMode && ( // TODO: Change this before finish
                                <div key="addPrintingList" className="d-grid gap-2 mb-1">
                                  {/* <Button
                                variant="outline-primary"
                                className="btn-icon btn-icon-start mb-1"
                                onClick={() => arrayHelpers.insert(values.coatingMethod?.length, '')}
                              >
                                <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                              </Button> */}

                                  <AddProductItemModal
                                    setValueChangeCoat={setValueChangeCoat}
                                    setValueChangeCCoat={setValueChangeCCoat}
                                    setValueChangeType={setValueChangeType}
                                    show={showProductTypeModal}
                                    productType={values?.productType}
                                    hide={toggleProductTypeModal}
                                    setShowModal={setProductTypeMethodModal}
                                    condition={chooseCondition}
                                    onRemove={(index) => arrayHelpers.remove(index)}
                                    coatingMethod={values?.coatingMethod}
                                    onSave={(index, item) => {
                                      handleChange({
                                        target: { id: `coatingMethod.${values?.coatingMethod?.length}.text`, value: item.name },
                                      });
                                      return true;
                                    }}
                                  />
                                </div>
                              ),
                            ];
                          }}
                        />
                      </FormikProvider>
                    </Card>
                  </OverlayScrollbarsComponent>
                </Col>
              </Row>

              <Row className="mb-1">
                <Col lg="2" md="3" sm="4">
                  <Form.Label className="col-form-label">{f({ id: 'product.creasing' })}</Form.Label>
                </Col>
                <Col sm="8" md="8" lg="12">
                  <Row>
                    <Col xs className="pe-0">
                      <LovProductCreasingSelect
                        name="creasingLine"
                        isClearable
                        lov="PRODUCT_CREASING"
                        onChange={handleChangeCreasingMethod}
                        value={values.creasingLine || ''}
                        isDisabled={!isEditMode}
                        valueChange={valueChangeCreasing}
                        setValueChange={setValueChangeCreasing}
                        isMulti
                      />
                      {errors.creasingLine && touched.creasingLine && <div className="d-block invalid-feedback">{f({ id: errors.creasingLine })}</div>}
                    </Col>
                    <Col xs="auto">
                      <Button className="btn-icon btn-icon-start" variant="primary" onClick={() => toggleCreasing()} disabled={!isEditMode}>
                        <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col lg="2" md="3" sm="4">
                  <Form.Label className="col-form-label">{f({ id: 'product.patching' })}</Form.Label>
                </Col>
                <Col sm="8" md="8" lg="12">
                  <Row>
                    <Col xs className="pe-0">
                      <LovPatchingSelect
                        name="patching"
                        onChange={handleChangePatchingList}
                        value={values.patching || ''}
                        isDisabled={!isEditMode}
                        valueChange={valueChangePatching}
                        setValueChange={setValueChangePatching}
                      />
                      {errors.patching && touched.patching && <div className="d-block invalid-feedback">{f({ id: errors.patching })}</div>}
                    </Col>
                    <Col xs="auto">
                      <Button className="btn-icon btn-icon-start" variant="primary" onClick={() => togglePatching()} disabled={!isEditMode}>
                        <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col lg="3" md="3" sm="4">
                  <Form.Label className="col-form-label">{f({ id: 'product.customer' })}</Form.Label>
                </Col>
                <Col sm="8" md="8" lg="12">
                  {/* <Form.Control
                    type="text"
                    name="customerId"
                    onChange={handleChange}
                    value={values.customerId || ''}
                    isInvalid={errors.customerId && touched.customerId}
                    readOnly={!isEditMode}
                  /> */}
                  {/* <CustomerSearchAutocomplete
                    as={(p) => <input {...p} type="text" style={{ outline: 'none' }} />}
                    useFormControl
                    useSearchIcon={false}
                    onChange={handleCustomerSearchChange}
                    onSuggestionSelected={handleCustomerRefSelected}
                    value={values.customerName}
                    readOnly={!isEditMode}
                    placeholder={f({ id: 'common.search.type' })}
                  /> */}
                  <LovCustomerSelect
                    isClearable
                    isMulti
                    name="customerId"
                    value={values.customerId || ''}
                    isDisabled={!isEditMode}
                    inputProps={{ required: true, isInvalid: !!errors.customerId }}
                    onChange={handleSelectCustomer}
                  />
                  {/* {errors.customerId && touched.customerId && <div className="d-block invalid-feedback">{f({ id: errors.customerId })}</div>} */}
                </Col>
              </Row>
              <Row className="mb-1">
                <Col lg="3" md="3" sm="4">
                  <Form.Label className="col-form-label">{f({ id: 'product.machine' })}</Form.Label>
                </Col>
                <Col sm="8" md="8" lg="12">
                  <Row>
                    <Col xs className="pe-0">
                      <LovMachineSelect
                        name="machineId"
                        isClearable
                        onChange={handleChangeMachine}
                        value={values.machineId || ''}
                        valueChange={valueChangeMachine}
                        setValueChange={setValueChangeMachine}
                        isDisabled={!isEditMode}
                        isMulti
                      />
                    </Col>
                    <Col xs="auto">
                      <Button className="btn-icon btn-icon-start" variant="primary" onClick={() => toggleMachine()} disabled={!isEditMode}>
                        <CsLineIcons icon="edit" /> {f({ id: 'product.coatingMethod.manage' })}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="mb-1">
                <Form.Label
                  style={{ font: '14px/1.4 sans-serif', margin: '0 auto', backgroundColor: '#778899', textAlign: 'center', color: '#eee' }}
                  className="col-form-label mb-1"
                >
                  {f({ id: 'product.bom' })}
                </Form.Label>
                <Col sm="12" md="12" lg="12">
                  {/* <Form.Control
                    type="text"
                    name="bom"
                    onChange={handleChange}
                    value={values.bom || ''}
                    isInvalid={errors.bom && touched.bom}
                    readOnly={!isEditMode}
                  />
                  {errors.bom && touched.bom && <div className="d-block invalid-feedback">{f({ id: errors.bom })}</div>} */}
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="bomList"
                      render={(arrayHelpers) => {
                        return [
                          <Row key="bomList">
                            <Col xs="12" style={{ maxHeight: 465, overflow: 'auto' }}>
                              {values.bomList?.map((detail, index) => (
                                // eslint-disable-next-line no-underscore-dangle
                                <Col key={detail._id || index}>
                                  <BOMDetailCard
                                    formValues={detail}
                                    onChange={handleBOMSave({ arrayHelpers, list: values.bomList, index, isReplace: true })}
                                    onDelete={handleBOMDelete({ arrayHelpers, list: values.bomList, index })}
                                    validationSchema={bomValidationSchema}
                                    bomList={values.bomList}
                                    disabled={!isEditMode}
                                  />
                                </Col>
                              ))}
                            </Col>
                          </Row>,
                          isEditMode && (
                            <Col key="addBomList">
                              <BOMDetailCard
                                onChange={handleBOMSave({
                                  arrayHelpers,
                                  list: values.bomList,
                                })}
                                bomList={values.bomList}
                                validationSchema={bomValidationSchema}
                              />
                            </Col>
                          ),
                          !isEditMode && values?.bomList?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                        ];
                      }}
                    />
                  </FormikProvider>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col lg="10" md="10" sm="10">
                  <Form.Label className="col-form-label">{f({ id: 'product.field.warning' })}</Form.Label>
                </Col>
                <Col lg="2" md="2" sm="2" style={{ textAlign: 'right' }} hidden={!isEditMode}>
                  <CsLineIcons className="text-primary" icon="plus" />
                  <a href="#" onClick={toggleManageAddModal}>
                    {f({ id: 'product.message' })}
                  </a>
                  {/* <Button className="w-100" variant="outline-primary" disabled={!isEditMode} onClick={toggleManageAddModal}>
                    จัดการข้อความ
                  </Button> */}
                </Col>
                <Col sm="12" md="12" lg="12">
                  <LovCautionListSelect
                    name="cautionList"
                    isClearable
                    onChange={handleChangeCautionList}
                    value={values.cautionList || ''}
                    isDisabled={!isEditMode}
                    isMulti
                    valueChange={valueChangeCaution}
                    setValueChange={setValueChangeCaution}
                  />
                  {errors.cautionList && touched.cautionList && <div className="d-block invalid-feedback">{f({ id: errors.cautionList })}</div>}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col lg="8" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.field.detail' })}</Form.Label>
                </Col>
                <Col lg="4" md="12" sm="12">
                  <Form.Label className="col-form-label">{f({ id: 'product.status' })}</Form.Label>
                </Col>
                <Col sm="12" md="12" lg="8">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="remark"
                    onChange={handleChange}
                    value={values.remark}
                    isInvalid={errors.remark && touched.remark}
                    readOnly={!isEditMode}
                  />
                  {errors.remark && touched.remark && <div className="d-block invalid-feedback">{f({ id: errors.remark })}</div>}
                </Col>
                <Col sm="12" md="12" lg="4">
                  <Form.Check
                    type="switch"
                    label={f({ id: values.status ? 'common.active' : 'common.inactive' })}
                    className="mt-2"
                    id="status"
                    name="status"
                    checked={values.status || false}
                    onChange={(e) => handleChange({ target: { id: 'status', value: e.target.checked } })}
                    isInvalid={errors.status && touched.status}
                    disabled={!isEditMode}
                  />
                </Col>
              </Row>
              <Row className="mb-1" ref={scrollTargetRef} id="priceList">
                <Form.Label
                  style={{ font: '14px/1.4 sans-serif', margin: '0 auto', backgroundColor: '#778899', textAlign: 'center', color: '#eee' }}
                  className="col-form-label mb-2"
                >
                  {f({ id: 'product.field.priceRange' })}
                </Form.Label>
                <Col sm="12" md="12" lg="12">
                  {/* <InputGroup className="mb-2">
                    <InputGroup.Text>ช่วงที่ 0</InputGroup.Text>
                    <FormControl aria-label="price" placeholder="ราคาต่อหน่วย" />
                    <FormControl aria-label="min" placeholder="ต่ำสุด" />
                    <FormControl aria-label="max" placeholder="สูงสุด" />
                    <Button className="btn-icon btn-icon-only" variant="outline-danger">
                      <CsLineIcons icon="bin" />
                    </Button>
                  </InputGroup> */}
                  <FormikProvider value={formik}>
                    <FieldArray
                      name="priceList"
                      render={(arrayHelpers) => {
                        return [
                          values.priceList?.map((detail, index) => (
                            // eslint-disable-next-line no-underscore-dangle
                            <Row key={detail?._id || index}>
                              <Col xs="12" sm="12" md="auto" className="pe-0">
                                <h3>
                                  <Badge bg="primary">
                                    {f({ id: 'product.field.range' })} {index + 1}
                                  </Badge>
                                </h3>
                              </Col>
                              <Col>
                                <InputGroup className="mb-2" style={detail.error ? { border: '1px solid #ff0000', borderRadius: '10px' } : {}}>
                                  <InputGroup.Text>{f({ id: 'product.field.pricePerUnit' })}</InputGroup.Text>
                                  <FormControl
                                    as={NumberFormat}
                                    allowNegative={false}
                                    placeholder={f({ id: 'product.field.pricePerUnit' })}
                                    name={`priceList.${index}.price`}
                                    value={detail.price}
                                    // decimalScale={2}
                                    onChange={handleChange}
                                    readOnly={!isEditMode}
                                  />
                                  <span className="input-group-text">{f({ id: 'product.field.baht' })}</span>
                                  <InputGroup.Text>{f({ id: 'product.field.min' })}</InputGroup.Text>
                                  <FormControl
                                    min={0}
                                    type="number"
                                    placeholder={f({ id: 'product.field.min' })}
                                    name={`priceList.${index}.min`}
                                    value={detail.min || ''}
                                    onChange={(e) => {
                                      if (parseInt(e.target.value, 10) >= values?.priceList[index].max) {
                                        handleChange({ target: { id: `priceList.${index}.max`, value: parseInt(e.target.value, 10) + 1 } });
                                      }
                                      handleChange({ target: { id: `priceList.${index}.min`, value: parseInt(e.target.value, 10) } });
                                    }}
                                    readOnly={!isEditMode || index === 0}
                                  />
                                  <InputGroup.Text>{f({ id: 'product.field.max' })}</InputGroup.Text>
                                  <FormControl
                                    min={0}
                                    type="number"
                                    placeholder={f({ id: 'product.field.max' })}
                                    name={`priceList.${index}.max`}
                                    value={detail.max || ''}
                                    onChange={(e) => {
                                      if (values?.priceList?.length !== index + 1) {
                                        handleChange({ target: { id: `priceList.${index + 1}.min`, value: parseInt(e.target.value, 10) + 1 } });
                                      }
                                      handleChange({ target: { id: `priceList.${index}.max`, value: parseInt(e.target.value, 10) } });
                                    }}
                                    readOnly={!isEditMode}
                                  />
                                  {isEditMode && ( // TODO: Change this before finish
                                    <Button
                                      disabled={!isEditMode || index === 0}
                                      className="btn-icon btn-icon-only"
                                      variant="outline-danger"
                                      onClick={() => arrayHelpers.remove(index)}
                                    >
                                      <CsLineIcons icon="bin" />
                                    </Button>
                                  )}
                                </InputGroup>
                              </Col>
                            </Row>
                          )),
                          isEditMode && ( // TODO: Change this before finish
                            <div key="addPriceList" className="d-grid gap-2 mb-1">
                              <Button
                                variant="outline-primary"
                                className="btn-icon btn-icon-start mb-1"
                                onClick={() => {
                                  const arr = values.priceList[values.priceList.length - 1];
                                  arrayHelpers.insert(values.priceList.length, { max: '', min: arr === undefined ? 1 : arr?.max + 1 || '', price: 0 });
                                }}
                              >
                                <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                              </Button>
                            </div>
                          ),
                          !isEditMode && values?.priceList?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                        ];
                      }}
                    />
                  </FormikProvider>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Form>
        <ManageMessageModalAdd
          setValueChange={setValueChangeCaution}
          cautionList={values.cautionList}
          show={isShowMessage}
          setShowModal={setShowMessage}
          hide={toggleManageAddModal}
        />
        <ManageProductUnitModalAdd
          setValueChange={setValueChangeUnitM}
          baseUOM={values?.baseUOM}
          show={isShowUnitManage}
          hide={toggleUnitManageModal}
          setShowModal={setShowUnitManage}
        />
        <ManageSubTypeModalAdd
          setValueChange={setValueChangeUnitM}
          productSubType={values?.productSubType}
          show={isSubTypeManage}
          hide={toggleSubtypeManageModal}
          setShowModal={setSubTypeManage}
        />
        <ProductPatchingModalAdd
          setValueChange={setValueChangePatching}
          patching={values?.patching}
          show={isShowPatching}
          hide={togglePatching}
          setShowModal={setShowPatching}
        />
        <ProductMachineModal
          setValueChange={setValueChangeMachine}
          machine={values?.machineId}
          show={isShowMachine}
          hide={toggleMachine}
          setShowModal={setShowMachine}
          productId={id}
          dataValues={values}
        />
        <ProductCreasingingModalAdd
          setValueChange={setValueChangeCreasing}
          creasingLine={values?.creasingLine}
          show={isShowCreasing}
          hide={toggleCreasing}
          setShowModal={setShowCreasing}
        />
      </Col>
    </>
  );
};

export default ProductDetail;
