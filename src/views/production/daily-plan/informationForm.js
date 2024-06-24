/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient } from 'react-query';
import { Accordion, Button, Card, Col, Form, Modal, ProgressBar, Row, Spinner, useAccordionButton } from 'react-bootstrap';
import './components/style.css';
import clx from 'classnames';
import { request } from 'utils/axios-utils';
import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { Wizard, Steps, Step, WithWizard } from 'react-albus';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SERVICE_URL } from 'config';
import DatepickerThaiYear from 'components/forms/controls/datepicker/DatepickerThaiYear';
import Select from 'react-select';
import useProductPlanOptionsNoQC from 'hooks/useProductPlanOptionsNoQC';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import PageChooseMachine from './components/sub-component/PageChooseMachine';
import { API } from './constants';

let initialData = {
  product: '',
  machine: '',
  machineName: '',
  machineOption: [],
  materialSize: '',
  customer: '',
  producedAmount: '',
  printAmount: '',
  productionProducedAmount: '',
  planDate: '',
  productionOrderNo: '',
  tooling: '',
  cuttingStatus: false,
  toolingStatus: false,
  outsourceStatus: false,
  status: '',
  step: '',
  planList: [],
};

const createProductioPlanFn = (plan) => axios.post(`${SERVICE_URL}/productionPlan/addList`, { ...plan }).then((res) => res.data);

const createOutsourceFn = (data) => axios.post(`${SERVICE_URL}/outsource/save`, data).then((res) => res.data);

const updateProductioPlanFn = (plan) =>
  axios
    .post(
      `${SERVICE_URL}/productionPlan/editList`,
      { ...plan },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    )
    .then((res) => res.data);

const callGetMasterDataStatusType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE`);
  return data;
};

// const submitPlanFn = (planId, planData) => axios.post(`${SERVICE_URL}/productionPlan/${planId}/edit`, planData);

const submitPlanFn = (plan) =>
  axios
    .post(
      `${SERVICE_URL}/productionPlan/editList`,
      { ...plan },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    )
    .then((res) => res.data);

const ToastDeleteSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.delete.success' })}</span>
      </div>
    </>
  );
};

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.save.success' })}</span>
      </div>
    </>
  );
};

const ToastSubmitSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'dailyPlan.submit.success' })}</span>
      </div>
    </>
  );
};

const InformationForm = (props) => {
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [planList, setPlanList] = useState([]);
  const [valiDatePlanData, setValiDatePlanData] = useState(false);
  const [toolingStatusType, setToolingStatusType] = useState([]);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [stepInProduct, setStepInProduct] = useState();
  const [planStepIdList, setPlanStepIdList] = useState([]);
  const [currentStep, setCurrentStep] = useState();
  const [isEmptyProduct, setIsEmptyProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [planId, setPlanId] = useState(undefined);
  const { planOptions } = useProductPlanOptionsNoQC();
  const planOptionsList = planOptions();
  const userLogin = JSON.parse(window.localStorage.getItem('token'));
  const { push } = useHistory();
  const configDecimal = localStorage.getItem('ConfigDecimal');

  useEffect(async () => {
    const resultDataStatusType = await callGetMasterDataStatusType();
    setToolingStatusType(resultDataStatusType);
  }, []);

  console.log(props?.productionData);
  useEffect(() => {
    if (props?.productionData) {
      // console.log(props?.productionData);
      props?.productNameOptions?.find(
        (data) => data?.value === props?.productionData?.producedProductId && data?.detail?.productionOrderNo === props?.productionData?.no
      );

      const lots = {
        label: props?.product?.productionOrderNo,
        value: props?.product?.productionOrderId,
        productionOrderId: props?.product?.productionOrderId,
      };
      // eslint-disable-next-line no-return-assign
      planOptionsList.forEach((item) => (item.created = true));
      const stepL = planOptionsList?.filter((el) => props?.product?.productProductionStep.some((e) => e === el?.value));
      setStepInProduct(stepL);
      const autoCreatePlan = [];
      stepL.forEach((data) => {
        autoCreatePlan.push({
          product: props?.productNameOptions?.find((data) => data?.value === props?.product?.productId) || '',
          assignedBy: '',
          productionOrder: lots || '',
          machine: '',
          productCoatingMethod: [],
          tooling: [],
          planDate: moment('01-01-1957').format('YYYY-MM-DD') || '',
          outsourceStatus: false,
          cuttingStatus: false,
          toolingStatus: false,
          toolingList: [],
          remark: [],
          step: data || '',
        });
      });
      const machineOption = props?.machineOptions?.filter((item1) => props?.product?.productMachineId?.some((item2) => item2 === item1.value));

      initialData = {
        id: '',
        product: props?.productNameOptions?.find((data) => data?.value === props?.product?.productId) || '',
        machineName: machineOption || [],
        machineOption: machineOption || [],
        materialSize: props?.product?.materialSize || '',
        customer: props?.product?.customerName || '',
        productionOrderNo: lots || '',
        materialUsedAmount: props?.product?.materialUsedAmount || 0,
        producedAmount: props?.productionData?.producedAmount || 0,
        printAmount: props?.productionData?.producedAmount / props?.productionData?.productCavity || 0,
        tooling: '',
        planDate: '',
        cuttingStatus: false,
        toolingStatus: false,
        outsourceStatus: false,
        status: '',
        planList: autoCreatePlan || [],
      };
      props.setProductionData(undefined);
    }
  }, [props?.productionData]);

  const productPlanDrafRespTransform = (value) => {
    const filterProductionOrderItemList = [];
    value?.data?.data?.forEach((res) => {
      res?.productSubType?.forEach((itemRes) => {
        itemRes?.machine?.forEach((itemMachine) => {
          itemMachine?.planDate?.forEach((itemDate) => {
            filterProductionOrderItemList.push({
              producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
              itemList: itemDate?.itemList,
            });
            // console.log(itemRes);
            // itemDate?.itemList?.forEach((listItem) => {
            //   listItem.step = planOptionsList.find((item) => item.value === listItem.step);
            //   listItem.currentStep.step = planOptionsList.find((item) => item.value === listItem.currentStep.step);
            // });
          });
        });
      });
    });
    // const filterProductionOrderItemList = [];
    // r.data.data?.forEach((res) => {
    //   res?.productSubType?.forEach((itemRes) => {
    //     itemRes?.planDate?.forEach((itemDate) => {
    //       filterProductionOrderItemList.push({
    //         producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
    //         itemList: itemDate.itemList,
    //       });
    //     });
    //   });
    // });

    const newArr = filterProductionOrderItemList.flatMap((obj) => obj.itemList);
    console.log(newArr);
    return newArr;
  };

  const getFilterProductPlanFn = async ({ orderNo = '' }) => {
    const res = await request({
      url: API.FIND_PRODPLAN_LIST,
      params: {
        // ...filter,
        // ...sortBy,
        productionOrderNo: orderNo,
        // status: 'NEW',
      },
    });
    return productPlanDrafRespTransform(res);
  };

  const getProductPlanFn = (productPlanId) => () =>
    axios
      .get(`${SERVICE_URL}/productionPlan/${productPlanId}`)
      .then((res) => res.data.data)
      .then((data) => {
        const machineOption = props?.productListOptions?.find((item) => item.value === data.productId);
        data.machineOption = props?.machineOptions?.filter((item1) => machineOption?.detail?.machineId?.some((item2) => item2 === item1.value));
        data.product = props?.productListOptions.find((item) => item.value === data.productId);
        data.productName = props?.productListOptions.find((item) => item.value === data.productId);
        data.machineName = props?.machineOptions.find((item) => item.value === data.machineId);
        data.machine = props?.machineOptions.find((item) => item.value === data.machineId) || [];
        data.customer = data?.customer?.[0]?.customerName || '';
        data.printAmount = data.productionPrintedAmount;
        data.productCoatingMethod = data?.productCoatingMethod?.map((item) => {
          return { label: item?.text, value: item?.value };
        });
        data.productionOrderNo = {
          value: data.productionOrderNo,
          label: data.productionOrderNo,
        };
        data.planList = planList;
        data.producedAmount = data?.productionProducedAmount;
        props?.toolingOptions?.forEach((item1) => {
          toolingStatusType?.forEach((item2) => {
            if (item1?.detail?.statusType?.code === item2?.code) {
              item1.detail.statusType = item2?.name || '';
            }
          });
        });
        const tooling = [];
        data?.tooling?.forEach((item) => {
          props?.toolingOptions?.forEach((v) => {
            if (item === v.detail.id) {
              tooling.push(v);
            }
          });
        });
        const toolingList = [];
        data?.machine?.detail?.tooling?.forEach((item) => {
          props?.toolingOptions?.forEach((v) => {
            if (item?.toolingId === v.value) {
              toolingList.push(v);
            }
          });
        });
        data.tooling = tooling;
        data.toolingList = toolingList;

        console.log(data);
        return {
          ...initialData,
          ...data,
        };
      });

  const useProductPlanData = (planId) =>
    useQuery(`editProductPlanData`, getProductPlanFn(planId), {
      enabled: !!planId,
      initialData,
      refetchOnWindowFocus: false,
      onSuccess(res) {
        console.log(res);
        setIsLoadingData(false);
      },
      onError(err) {
        console.log(err);
        console.error('Error:', err);
      },
    });

  const validationSchema = Yup.object().shape({
    // product: Yup.object().required('dailyPlan.detail.validation.product.required'),
    // productionOrderNo: Yup.object().required('dailyPlan.detail.validation.productionOrder.required'),
    // planDate: Yup.string().required('dailyPlan.detail.validation.planDate.required'),
  });

  const { data: initResult, isFetching, error, refetch } = useProductPlanData(planId);

  if (error) {
    console.error('error :', error);
  }

  const onSubmit = () => {
    // console.log('form Data : ', formData);
  };

  const { formatMessage: f } = useIntl();

  var init = '';
  if (props.id === undefined) {
    init = initialData;
  } else {
    init = !isFetching ? initResult : initialData;
  }

  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, values, touched, errors } = formik;

  const emptyForm = () => {
    console.log('resetForm');
    resetForm();
    setPlanList([]);
    setStepInProduct(undefined);
    setPlanStepIdList([]);
    setCurrentStep([]);
    handleChange({ target: { id: 'product', value: '' } });
    handleChange({ target: { id: 'productName', value: '' } });
    handleChange({ target: { id: 'machine', value: '' } });
    handleChange({ target: { id: 'machineName', value: '' } });
    handleChange({ target: { id: 'machineOption', value: [] } });
    handleChange({ target: { id: 'materialUsedAmount', value: '' } });
    handleChange({ target: { id: 'materialSize', value: '' } });
    handleChange({ target: { id: 'customer', value: '' } });
    handleChange({ target: { id: 'producedAmount', value: '' } });
    handleChange({ target: { id: 'productionProducedAmount', value: '' } });
    handleChange({ target: { id: 'planDate', value: '' } });
    handleChange({ target: { id: 'productionOrderNo', value: '' } });
    handleChange({ target: { id: 'tooling', value: '' } });
    handleChange({ target: { id: 'cuttingStatus', value: false } });
    handleChange({ target: { id: 'toolingStatus', value: false } });
    handleChange({ target: { id: 'outsourceStatus', value: false } });
    handleChange({ target: { id: 'status', value: '' } });
    handleChange({ target: { id: 'planList', value: [] } });
  };

  const { mutate: submitPlan } = useMutation(submitPlanFn, {
    onSuccess(data) {
      console.debug('create tooling success :', data);
      setIsSubmitting(false);
      setIsLoadingData(false);
      toast(<ToastSubmitSuccess />);
      push('./dailyplan');
      resetForm();
      props.afterAddItem();
      setStepInProduct(undefined);
      // if (props.isEmptyProduct) {
      onHideModal();
      props.refetch();
      // }
    },
  });

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    setIsLoadingData(true);
    const filterPlan = await getFilterProductPlanFn({ orderNo: props?.product?.productionOrderNo, stepPlan: '' });
    const filterPlanId = filterPlan.map((data) => {
      return { id: data.id, status: 'NEW' };
    });
    const data = {
      productionOrder: values?.productionOrderId || values?.productionOrderNo?.productionOrderId,
      status: 'SUBMITTED',
      planList: filterPlanId,
    };
    submitPlan(data);
  };

  const handleDeleteConfirm = () => {
    deleteProductionPlan(props.id);
  };

  const deleteProductionPlan = async (id) => {
    setIsDeletingLoading(true);
    await axios({
      url: `/productionPlan/${id}/delete`,
      method: 'post',
    });
    setIsDeletingLoading(false);
    push('./dailyplan');
    setShowModalConfirm(false);
    props.setShowModal(false);
    toast(<ToastDeleteSuccess />);
    props.refetch();
    // return responseTransformer(resp);
  };

  useEffect(async () => {
    if (props.show && props?.productionData === undefined) {
      setIsLoadingData(true);
      const arrRemain =
        props?.product?.productProductionRemainingStep.length > 0 ? props?.product?.productProductionRemainingStep : props?.product?.productProductionStep;
      const arrStep = props?.product?.productProductionStep;
      const arrFilter = arrStep?.filter((data1) => arrRemain?.some((data2) => data1 !== data2));

      if (arrFilter[0]) {
        const filterPlan = await getFilterProductPlanFn({ orderNo: props?.product?.productionOrderNo });
        setPlanStepIdList(filterPlan);
        const selectPlanObj = filterPlan.find((item) => item?.step === arrFilter[0]);
        setPlanId(selectPlanObj?.id);
      }

      const stepL = planOptionsList?.filter((el) => props?.product?.productProductionStep?.some((e) => e === el?.value || e?.step === el?.value));
      const stepFilter = stepL.map((el) => {
        const isNumExistInArr2 = props?.product?.productProductionRemainingStep?.some((e) => e === el?.value);
        return {
          ...el,
          created: !isNumExistInArr2,
        };
      });
      console.log(stepFilter);
      setStepInProduct(stepFilter);
    }
  }, [props.show]);

  const { mutate: createOutsource, isLoading: outsourceIsCreating } = useMutation(createOutsourceFn, {
    onSuccess(data) {
      console.debug('create tooling success :', data);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const { mutate: createProductPlan, isLoading: isAdding } = useMutation(createProductioPlanFn, {
    onSuccess(data) {
      emptyForm();
      console.log(props?.valueProduct);
      data.data.forEach(async (item) => {
        if (item.step === 15 || item.step === 24 || item.step === 28 || item.step === 29) {
          var dataOutsource2 = {
            productionPlanId: item?.id || '',
            status: 'NEW',
            product: item.product,
            productionOrder: item.productionOrder,
            company: props.defaultCompany.id,
            amount: values?.printAmount,
            verifiedList: [
              {
                date: moment(new Date()).format('YYYY-MM-DD'),
                amount: props?.valueProduct?.product?.detail?.producedAmount || 0,
                height: '',
                verifiedBy: userLogin.user.employee.id || '',
                result: 'NOTPASS',
                remark: '',
              },
            ],
          };
          await createOutsource(dataOutsource2);
        }
      });
      console.debug('create tooling success :', data);
      push('./dailyplan');
      toast(<ToastCreateSuccess />);
      resetForm();
      props.afterAddItem();
      setStepInProduct(undefined);
      onHideModal();
      props?.setIsAddPlan(true);
    },
    onSettled() {
      queryClient.invalidateQueries('addToolingData');
    },
  });

  const { mutate: updateProductPlan, isLoading: isSaving } = useMutation(updateProductioPlanFn, {
    onSuccess(data) {
      // data.data.planList.forEach(async (item) => {
      //   if (item.step === 15 || item.step === 24 || item.step === 28 || item.step === 29) {
      //     var dataOutsource2 = {
      //       productionPlanId: item?.id || '',
      //       status: 'NEW',
      //       product: item.product,
      //       productionOrder: item.productionOrder,
      //       company: props.defaultCompany.id,
      //       amount: values?.printAmount,
      //       verifiedList: [
      //         {
      //           date: moment(new Date()).format('YYYY-MM-DD'),
      //           amount: props?.valueProduct?.product?.detail?.producedAmount || 0,
      //           height: '',
      //           verifiedBy: userLogin.user.employee.id || '',
      //           result: 'NOTPASS',
      //           remark: '',
      //         },
      //       ],
      //     };
      //     await createOutsource(dataOutsource2);
      //   }
      // });
      push('./dailyplan');
      toast(<ToastCreateSuccess />);
      console.log('isEdited');
      setStepInProduct(undefined);
      resetForm();
      emptyForm();
      onHideModal();
      // props.afterAddItem();
      props?.setIsEditPlan(true);
    },
    onError(err) {
      console.error('update tooling error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const checkStepData = async (findStep) => {
    if (currentStep?.created && findStep === undefined) {
      setIsLoadingData(true);
      let filterPlan = [];
      if (planStepIdList.length > 0) {
        const selectPlanObj = planStepIdList.find((item) => item?.step === currentStep.value);
        setPlanId(selectPlanObj?.id);
      } else {
        filterPlan = await getFilterProductPlanFn({ orderNo: props?.product?.productionOrderNo, stepPlan: '' });
        setPlanStepIdList(filterPlan);
        setPlanId(filterPlan[0]?.id);
      }
    }
  };

  console.log(userLogin.user.employee.id);
  useEffect(async () => {
    const findStep = values?.planList?.find((data) => (data?.step?.value || data?.step) === currentStep?.value);
    setPlanId(undefined);
    setTimeout(() => {
      checkStepData(findStep);
    }, 10);
  }, [currentStep?.value]);

  const handleSave = async () => {
    // if (Object.keys(errors).length === 0) {
    values.planList.forEach((item) => {
      var tooling = [];
      if (item?.tooling?.length > 0) {
        for (const element of item.tooling) {
          if (element?.detail?.id) {
            tooling.push(element?.detail?.id);
          }
        }
        item.tooling = tooling;
      }
      item.machine = item?.machine?.value || item?.machine;
      item.step = item?.step?.value || item?.step;
    });
    const planAdd = values.planList.filter((data) => data?.id === undefined);
    const planEdit = values.planList.filter((data) => data?.id !== undefined);
    console.log('planAdd', planAdd);
    console.log('planEdit', planEdit);
    if (planAdd.length > 0) {
      const planAddQC = [];
      planAdd.forEach((item) => {
        if (item?.step?.value !== undefined) {
          item.step = item.step?.value;
        }
        item.status = 'NEW';
        item.assignedBy = userLogin.user.employee.id || '';
      });
      console.log(planAdd);
      const newArrPlanAdd = planAdd.map((item) =>
        item.machine === ''
          ? {
              planDate: item.planDate,
              product: item.product,
              productionOrder: item.productionOrder,
              step: item.step,
              cuttingStatus: item.cuttingStatus,
              toolingStatus: item.toolingStatus,
              outsourceStatus: item.outsourceStatus,
              statusApply: item.statusApply,
              remark: item.remark,
              assignedBy: userLogin.user.employee.id || '',
              status: 'NEW',
            }
          : item
      );
      newArrPlanAdd.forEach((item) => {
        item.product = item.product?.value || item.product;
        item.productionOrder = item.productionOrder?.value || item.productionOrder;
        planAddQC.push(item);
        planAddQC.push({ ...item, step: Number(`${item.step.toString()}1`) });
      });

      var formAddData = {
        productionOrder: values?.productionOrderId || values?.productionOrderNo?.productionOrderId,
        planList: planAddQC,
        submittedAt: moment(new Date()).format('YYYY-MM-DD'),
        status: 'SUBMITTED',
      };
      console.log('planAdd', planAdd);
      console.log('formAddData', formAddData);
      createProductPlan(formAddData);
    }

    if (planEdit.length > 0) {
      const planEditQC = [];
      planEdit.forEach((item) => {
        if (item?.step?.value !== undefined) {
          item.step = item?.step?.value;
        }
      });
      const newArrplanEdit = planEdit.map((item) =>
        item.machine === ''
          ? {
              planDate: item.planDate,
              product: item.product,
              productionOrder: item.productionOrder,
              step: item.step,
              cuttingStatus: item.cuttingStatus,
              toolingStatus: item.toolingStatus,
              outsourceStatus: item.outsourceStatus,
              statusApply: item.statusApply,
              remark: item.remark,
              assignedBy: userLogin.user.employee.id || '',
              status: item.status,
            }
          : item
      );
      newArrplanEdit.forEach((item) => {
        item.product = item.product?.value || item.product;
        item.productionOrder = item.productionOrder?.value || item.productionOrder;
        planEditQC.push(item);
        planEditQC.push({ ...item, step: Number(`${item.step.toString()}1`) });
      });
      var formEditData = {
        productionOrder: values?.productionOrderId || values?.productionOrderNo?.productionOrderId,
        planList: planEditQC,
      };
      console.log('formEditData', planEditQC);
      updateProductPlan(formEditData);
    }
  };

  const topNavClick = (stepItem, push, steps) => {
    push(stepItem.id);
    if (!stepItem.data.created) {
      handleChange({ target: { id: 'id', value: undefined } });
    }
    if (props.id && stepItem.data?.id) {
      props.setProductId(stepItem.data?.id);
      setIsEmptyProduct(false);
    } else {
      setIsEmptyProduct(true);
    }
  };

  const handleApplyForm = (form, indexKey) => {
    setStepInProduct((prev) => {
      return prev.map((item) =>
        item.value === form?.step.value
          ? {
              ...item,
              created: true,
            }
          : item
      );
    });
    // onChangeInPageMachine(form, indexKey);
    const planList = values.planList.findIndex((data) => (data?.step?.value || data?.step) === (form?.step?.value || form?.step));
    const newArr = values.planList || [];
    if (planList === -1) {
      newArr.push(form);
      handleChange({ target: { id: 'planList', value: newArr } });
      setPlanList(newArr);
    } else {
      newArr[planList] = form;
      handleChange({ target: { id: 'planList', value: newArr } });
      setPlanList(newArr);
    }
  };

  const getClassName = (steps, step, index, stepItem) => {
    const selectIndex = steps.findIndex((data) => data.id === step.id);
    if (selectIndex === index) {
      return 'step-doing';
    }
    if (stepItem.data.created) {
      stepItem.isDone = true;
      return 'step-done';
    }

    return 'step';
  };

  const onHideModal = () => {
    console.log('onHideModal');
    resetForm();
    handleChange({ target: { id: 'product', value: '' } });
    handleChange({ target: { id: 'productName', value: '' } });
    handleChange({ target: { id: 'machine', value: '' } });
    handleChange({ target: { id: 'machineName', value: '' } });
    handleChange({ target: { id: 'materialSize', value: '' } });
    handleChange({ target: { id: 'materialUsedAmount', value: '' } });
    handleChange({ target: { id: 'customer', value: '' } });
    handleChange({ target: { id: 'producedAmount', value: '' } });
    handleChange({ target: { id: 'productionProducedAmount', value: '' } });
    handleChange({ target: { id: 'productionOrderNo', value: '' } });
    handleChange({ target: { id: 'cuttingStatus', value: '' } });
    handleChange({ target: { id: 'toolingStatus', value: '' } });

    initialData = undefined;

    setPlanId(undefined);
    setPlanStepIdList([]);
    setStepInProduct(undefined);
    props?.setProductionData(undefined);
    props.onHide();
  };

  const onClickNext = (goToNext, steps, step) => {
    step.isDone = true;
    if (steps.length - 1 <= steps.indexOf(step)) {
      return;
    }
    goToNext();
  };

  const onClickPrev = (goToPrev, steps, step) => {
    if (steps.indexOf(step) <= 0) {
      return;
    }
    goToPrev();
  };

  return (
    <>
      <Modal show={props.show} onHide={onHideModal} size="xl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {props.id ? f({ id: `dailyPlan.field.edit` }) : f({ id: `dailyPlan.field.add` })} {f({ id: `dailyPlan.list.title` })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div
            className={clx(
              {
                'overlay-spinner': isLoadingData,
              },
              'd-flex flex-column justify-content-center align-items-center gap-1 position-relative'
            )}
          >
            <Form className="w-100 mt-1" onSubmit={handleSubmit}>
              <Row className="mb-1 g-3">
                <Col md="8">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.name' })}</Form.Label>
                    <Form.Group className="position-relative tooltip-end-top" controlId="product">
                      <Select
                        classNamePrefix="react-select"
                        options={props.productNameOptions}
                        isDisabled
                        value={values?.product || values?.productName}
                        // onChange={handleChangeProduct}
                        isInvalid={errors.product && touched.product}
                        required
                      />
                    </Form.Group>
                    {errors.product && touched.product && <div className="d-block invalid-feedback">{f({ id: errors.product })}</div>}
                  </Form.Group>
                </Col>
                <Col md="4">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.lot' })}</Form.Label>
                    <Select
                      classNamePrefix="react-select"
                      // options={lotNoOptions}
                      isDisabled
                      value={values?.productionOrderNo || ''}
                      isInvalid={errors.productionOrderNo && touched.productionOrderNo}
                      required
                    />
                    {errors.productionOrderNo && touched.productionOrderNo && (
                      <div className="d-block invalid-feedback">{f({ id: errors.productionOrderNo })}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-1 g-3">
                <Col md="4">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cuttingSheet' })}</Form.Label>
                    <Form.Control type="text" name="materialUsedAmount" value={Number(values?.printAmount).toFixed(configDecimal) || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md="4">
                  <Form.Group className="position-relative tooltip-end-top" controlId="producedAmount	">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.number' })}</Form.Label>
                    <Form.Control type="text" name="producedAmount" value={values?.producedAmount || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md="2">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialSize	">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cuttingSize' })}</Form.Label>
                    <Form.Control type="text" name="materialSize" value={values?.materialSize || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md="2">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialSize	">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cavity' })}</Form.Label>
                    <Form.Control type="text" name="materialSize" value={values?.materialCavity || ''} readOnly />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-0 g-3">
                <Col md="8">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.customer' })}</Form.Label>
                    <Form.Control type="text" name="customerName" onChange={handleChange} value={values?.customer} readOnly />
                  </Form.Group>
                </Col>
                <Col md="4">
                  <Form.Group className="position-relative tooltip-end-top" controlId="code">
                    <Form.Label className="col-form-label">{f({ id: 'dailyPlan.field.cutting_status' })}</Form.Label>
                    <Form.Control
                      type="text"
                      name="productionCuttingStatus"
                      value={`${
                        (values?.productionCuttingStatus === 'NEW' && f({ id: 'dailyPlan.field.cutting_status-new' })) ||
                        (values?.productionCuttingStatus === 'PARTIAL' && f({ id: 'dailyPlan.field.cutting_status-partial' })) ||
                        (values?.productionCuttingStatus === 'MATCHED' && f({ id: 'dailyPlan.field.cutting_status-matched' })) ||
                        (values?.productionCuttingStatus === 'COMPLETED' && f({ id: 'dailyPlan.field.cutting_status-completed' }))
                      } `}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            <div className="wizard wizard-default mt-1 w-100">
              {stepInProduct && (
                <Wizard defaultStep="1">
                  <WithWizard
                    render={({ step, steps, push }) => {
                      const convert = stepInProduct.map((item) => {
                        return { id: item.value.toString(), name: item.label.toString(), data: item };
                      });
                      steps = convert;
                      return (
                        <ul className="nav nav-tabs justify-content-center">
                          {steps.map((stepItem, index) => {
                            if (!stepItem.hideTopNav) {
                              return (
                                <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                                  <Button variant="link" disabled={isLoadingData} className="nav-link" onClick={() => topNavClick(stepItem, push, steps)}>
                                    <span className="text-alternate">{stepItem.name}</span>
                                  </Button>
                                </li>
                              );
                            }
                            return <span key={`topNavStep_${index}`} />;
                          })}
                        </ul>
                      );
                    }}
                  />
                  <Steps>
                    {stepInProduct?.map((item, index) => (
                      <Step id={item.value.toString()} name={item.label.toString()} data={item} key={index}>
                        <PageChooseMachine
                          indexKey={index}
                          machineOptions={values?.machineOption}
                          toolingOptions={props?.toolingOptions}
                          toolingStatusType={toolingStatusType}
                          valueProduct={!isFetching ? values : {}}
                          productPlanQuery={props?.productPlanQuery}
                          productPlanDraftQuery={props?.productPlanDraftQuery}
                          handleSubmit={handleSubmit}
                          errors={errors}
                          step={item}
                          created={item.created}
                          onClickPrev={onClickPrev}
                          onClickNext={onClickNext}
                          idProduct={props?.id}
                          isFetching={isFetching}
                          isEmptyProduct={isEmptyProduct}
                          setIsEmptyProduct={setIsEmptyProduct}
                          afterAddItem={props?.afterAddItem}
                          setProductId={props?.setProductId}
                          onHideModal={onHideModal}
                          planData={props?.productionData}
                          setStepInProduct={setStepInProduct}
                          handleApplyForm={handleApplyForm}
                          setCurrentStep={setCurrentStep}
                          onChangeId={handleChange}
                          isLoadingData={isLoadingData}
                          setValiDatePlanData={setValiDatePlanData}
                        />
                      </Step>
                    ))}
                  </Steps>
                </Wizard>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="p-1 px-4">
          <div className="d-flex flex-row justify-content-between align-items-start w-100">
            <div>
              <Form.Group className="position-relative tooltip-end-top">
                <Button variant="outline-danger" disabled>
                  <CsLineIcons icon="close-circle" /> {f({ id: 'common.cancel' })}
                </Button>
              </Form.Group>
            </div>
            <div>
              <Button onClick={handleSave} variant="primary">
                {f({ id: 'common.save' })}
              </Button>{' '}
              {/* {props?.product?.productProductionRemainingStep?.length === 0 && (
                <Button
                  className={clx({ 'overlay-spinner': isSubmitting })}
                  disabled={isLoadingData || props?.product?.status === 'SUBMITTED'}
                  // disabled={isLoadingData || props?.status === 'SUBMITTED'}
                  onClick={handleSubmitForm}
                  variant="success"
                >
                  {f({ id: 'common.submit' })}
                </Button>
              )}{' '} */}
              <Button variant="outline-primary" onClick={onHideModal}>
                {f({ id: 'common.close' })}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {showModalConfirm && (
        <Modal
          contentClassName={clx({ 'overlay-spinner': isDeletingLoading })}
          backdrop={isDeletingLoading ? 'static' : true}
          show={showModalConfirm}
          onHide={() => setShowModalConfirm(false)}
          size="xs"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {f({ id: `dailyPlan.field.remove` })} {f({ id: `dailyPlan.list.title` })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer className="p-3 px-5">
            <Button variant="outline-primary" onClick={() => setShowModalConfirm(false)}>
              {f({ id: 'common.cancel' })}
            </Button>
            <Button type="submit" variant="primary" onClick={handleDeleteConfirm}>
              {f({ id: 'common.submit' })}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default InformationForm;
