/* eslint-disable operator-assignment */
/* eslint-disable import/no-duplicates */
/* eslint-disable no-shadow */
/* eslint-disable no-self-assign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, queryClient, ReactQueryConfigProvider } from 'react-query';
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import clx from 'classnames';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SERVICE_URL } from 'config';
import { Wizard, Steps, Step, WithWizard } from 'react-albus';
import axios from 'axios';
import { request } from 'utils/axios-utils';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import ConfirmModalStartInprocess from 'components/confirm-modal/ConfirmModal';
import ConfirmModalStart from 'components/confirm-modal/ConfirmModal';
import useActualProduction from 'hooks/useActualProduction';
import useProductPlanOptions from 'hooks/useProductPlanOptions';
import OperatorPack from './sub-component/OperatorPack';
import OperatorInform1 from './sub-component/OperatorInform1';
import OperatorInform2 from './sub-component/OperatorInform2';
import OperatorInform3 from './sub-component/OperatorInform3';
// import AttachFirst from './sub-component/AttachFirst';
// import AttachSecond from './sub-component/AttachSecond';
// import AttachLast from './sub-component/AttachLast';
import QualityCheckFirst from './sub-component/QualityCheckFirst';
import QualityCheckSecond from './sub-component/QualityCheckSecond';
import PagePrintingThird1 from './sub-component/PagePrintingThird1';
import PagePrintingThird2 from './sub-component/PagePrintingThird2';
import PageFirst from './sub-component/PagePrintingFirst';
import PagePrintingSecond from './sub-component/PagePrintingSecond';
import PagePrintingFourth from './sub-component/PagePrintingFourth';
import StickerToPrint from './StickerToPrint';
import './style.css';

const userLogin = JSON.parse(window.localStorage.getItem('token'));

const initialData = {
  product: '',
  machine: '',
  planDate: '',
  productionOrder: '',
  tooling: '',
  cuttingStatus: false,
  toolingStatus: false,
  configuration: [],
  status: '',
  correction: '',
  operationDoc: {
    qualityCheck: {
      startTime: '',
      endTime: '',
      printColor: [],
      coatingColor: [],
      printMeasuredList: [],
      coatingMeasuredList: [],
    },
    printing: [],
    coating: [],
    correction: '',
    currentStep: '',
    fountainSolution: {
      alcoholVolume: 0,
      conductivity: 0,
      filterStatus: false,
      ph: 0,
      temperature: 0,
      operatedBy: '',
      operationDate: '',
    },
    problem: [{ startTime: '', endTime: '', detail: [], correction: '' }],
    operationList: [
      {
        // id: 1,
        startTime: '',
        endTime: '',
        problemList: [],
        correctionList: [],
      },
    ],
    defectAmount: 0,
    actualProducedAmount: 0,
    materialDefectAmount: 0,
  },
};

const callGetMasterDataStatusType = async () => {
  const {
    data: { data },
  } = await axios.get(`${SERVICE_URL}/masterData/lov/tooling/list?type=TOOLING_STATUSTYPE`);
  return data;
};

const updateProductioPlanComplete = (plan) =>
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

const createProductioPlanFn = (plan) => axios.post(`${SERVICE_URL}/productionPlan/add`, plan).then((res) => res.data);

const updateProductioPlanFn = ({ id, plan }) =>
  axios
    .post(`${SERVICE_URL}/productionPlan/${id}/edit`, plan, {
      headers: {
        'content-type': 'application/json',
      },
    })
    .then((res) => res.data);

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

const InformationForm = (props) => {
  const [isEditMode, setEditMode] = useState(!props.id);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isEnableAdd, setEnableAdd] = useState(false);
  const [isEnableEdit, setEnableEdit] = useState(false);
  const [isBtnSave, setIsBtnSave] = useState();
  const [listProductData, setListProductData] = useState();
  const [validateButton, setValidateButton] = useState(true);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [isPNoFetching, setIsPNoFetching] = useState(false);
  const [toolingStatusType, setToolingStatusType] = useState([]);
  const [toolingOptions, setToolingOptions] = useState();
  const [productionOrderNo, setProductionOrderNo] = useState();
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [isConfirmModalStart, setIsConfirmModalStart] = useState(false);
  const [isConfirmModalStartInprocess, setIsConfirmModalStartInprocess] = useState(false);
  const [stickerAmount, setStickerAmount] = useState(0);
  const componentRef = useRef(null);
  const { push } = useHistory();
  const { planOptions } = useProductPlanOptions();
  const planOptionsList = planOptions();
  const [resetKey, setResetKey] = useState(0);
  const { useSumActualProduction } = useActualProduction();
  const [recordOption, setRecordOption] = useState([]);
  const [QCLOption, setQCLOption] = useState([]);
  const [QCLCoatingOption, setQCLCoatingOption] = useState([]);
  const [defaultStep, setDefaultStep] = useState('step1');
  const { useCalculateOperation } = useActualProduction();
  const [valueCal, setValueCal] = useState();

  const {
    data: initData,
    isFetching: isFetchingActual,
    refetch: refetchSumActual,
  } = useSumActualProduction({ lotNo: props?.operationData?.productionOrderNo, stepIn: props?.operationData?.step });

  const resetWizard = () => {
    setResetKey((prevKey) => prevKey + 1);
  };

  const callProductionOrderNo = async (value, step) => {
    setIsPNoFetching(true);
    const arrStep = [step, Number(`${step.toString()}1`)];
    const dataProduct = await request({ url: `${SERVICE_URL}/productionPlan/find?productionOrderNo=${value}` });
    const filterProductionOrderItemList = [];
    dataProduct.data.data.forEach((res) => {
      res?.productSubType?.forEach((itemRes) => {
        filterProductionOrderItemList.push({
          producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
          machine: itemRes.machine,
        });
      });
    });

    const dataGroup = filterProductionOrderItemList
      .flatMap((obj) => obj.machine)
      .flatMap((obj) => obj.planDate)
      .flatMap((obj) => obj.itemList);
    const filterDataGroup = dataGroup.filter((data) => arrStep.some((s) => s === data.step));
    const getIdFilterDataGroup = filterDataGroup
      .map((data) => {
        return { id: data.id, ...data };
      })
      .reverse();
    if (getIdFilterDataGroup) {
      setIsPNoFetching(false);
    }
    console.log(getIdFilterDataGroup);
    setProductionOrderNo(getIdFilterDataGroup);
  };
  const getProductPlanFn = (productPlanId) => () =>
    axios
      .get(`${SERVICE_URL}/productionPlan/${productPlanId}`)
      .then((res) => res.data.data)
      .then((data) => {
        data.productName = props.productNameOptions.find((item) => item.value === data.productId);
        data.machineName = props.machineOptions.find((item) => item.value === data.machineName);
        data.machine = props?.machineOptions.find((item) => item.value === data.machineId);
        data.stepName = planOptionsList.find((item) => item.value === data.step);
        const toolingList = [];
        data?.tooling?.forEach((item) => {
          toolingOptions?.forEach((v) => {
            if (item === v.detail.id) {
              toolingList.push(v);
            }
          });
        });
        const tooling = [];
        toolingOptions?.forEach((item1) => {
          toolingStatusType?.forEach((item2) => {
            if (item1?.detail?.statusType === item2?.code) {
              item1.detail.statusType = item2?.name || '';
              item1.detail.statusTypeValue = item2?.code || '';
            }
          });
        });
        data.tooling = tooling;
        if (data.operationDoc.problem.length === 0) {
          data.operationDoc.problem = initialData.operationDoc.problem;
        }
        // if (data.operationDoc.operationList?.length === 0) {
        data.operationDoc.operationList = initialData.operationDoc.operationList;
        // }
        data.tooling = toolingList;
        const filterStandardList = data.productMachineStandardList.filter((v) => v.machineId === data?.machineId);
        data.productMachineStandardList = filterStandardList;
        if (
          (data?.previousStepStatus === 'PENDING' ||
            data?.previousStepStatus === 'CONFIRMED' ||
            data?.previousStepStatus === 'COMPLETED' ||
            data?.previousStepStatus === null ||
            data?.step === 11) &&
          data?.productionCuttingStatus === 'COMPLETED'
        ) {
          setIsDisable(false);
        } else {
          setIsDisable(true);
        }
        if (data?.step === 15) {
          setIsDisable(true);
        }
        if (
          data?.step === 11 ||
          data?.step === 111 ||
          data?.step === 12 ||
          data?.step === 121 ||
          data?.step === 13 ||
          data?.step === 131 ||
          data?.step === 14 ||
          data?.step === 141 ||
          data?.step === 15 ||
          data?.step === 151 ||
          data?.step === 16 ||
          data?.step === 161 ||
          data?.step === 17 ||
          data?.step === 171 ||
          data?.step === 18 ||
          data?.step === 181 ||
          data?.step === 19 ||
          data?.step === 191 ||
          data?.step === 20 ||
          data?.step === 201 ||
          data?.step === 26 ||
          data?.step === 261
        ) {
          data.operationDoc.actualProducedAmount = data?.operationDoc?.actualProducedAmount / data?.productCavity;
          data.operationDoc.defectAmount = data?.operationDoc?.defectAmount / data?.productCavity;
        }
        callProductionOrderNo(data?.productionOrderNo, data?.step);
        console.log(data);
        refetchSumActual();
        return {
          ...initialData,
          ...data,
        };
      });

  const useProductPlanData = (productPlanId) =>
    useQuery(`editProductPlanData`, getProductPlanFn(productPlanId), {
      enabled: !!productPlanId && props.show,
      initialData,
      refetchOnWindowFocus: false,
      onError(err) {
        console.error('Error:', err);
      },
    });

  const validationSchema = Yup.object().shape({
    product: Yup.object().required('dailyPlan.detail.validation.product.required'),
    machine: Yup.object().required('dailyPlan.detail.validation.machine.required'),
    tooling: Yup.array().required('dailyPlan.detail.validation.tooling.required'),
    productionOrder: Yup.object().required('dailyPlan.detail.validation.productionOrder.required'),
    planDate: Yup.string().required('dailyPlan.detail.validation.planDate.required'),
  });
  // const validationSchemaQC2 = Yup.object().shape({
  //   startTime: Yup.string().required('dailyPlan.detail.validation.startTime.required'),
  //   endTime: Yup.string().required('dailyPlan.detail.validation.endTime.required'),
  //   defectiveAmount: Yup.number().required('dailyPlan.detail.validation.defectiveAmount.required'),
  //   result: Yup.object().required('dailyPlan.detail.validation.result.required'),
  // });

  const { data: initResult, isFetching, error, refetch } = useProductPlanData(props.id);

  if (error) {
    console.error('error :', error);
  }

  const onSubmit = (formData) => {
    console.log('form Data : ', formData);
  };

  const { formatMessage: f } = useIntl();

  var init = '';
  if (props.id === undefined) {
    init = initialData;
  } else {
    init = initResult;
  }

  const formik = useFormik({ initialValues: init, validationSchema, onSubmit, enableReinitialize: true });
  const { handleChange, handleSubmit, onChange, resetForm, values } = formik;

  useEffect(() => {
    if (!isFetchingActual) {
      const val = useCalculateOperation({
        lots: initData?.data,
        currentStep: values?.step,
        actual: initData?.actual,
        actualProducedAmount: values?.operationDoc?.actualProducedAmount,
        defect: values?.operationDoc?.defectAmount,
      });
      console.log(val);
      setValueCal(val);
    }
  }, [isFetchingActual]);

  const callTooling = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/tooling/find` });
    const list = [];
    dataProduct.data.data.dataList.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setToolingOptions(list);
  };

  const deleteProductionPlan = async (id) => {
    setIsDeletingLoading(true);
    const resp = await axios({
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

  const { mutate: createProductPlan, isLoading: isAdding } = useMutation(createProductioPlanFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableAdd(false);
      console.debug('create tooling success :', data);
      push('./dailyplan');
      toast(<ToastCreateSuccess />);
      props.refetch();
    },
    onError(err) {
      console.log(err);
      setEnableAdd(false);
      const message = `This code (${values.code}) already exists. Please input another one`;
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const { mutate: updateProductPlan, isLoading: isSaving } = useMutation(updateProductioPlanFn, {
    onSuccess(data) {
      setEditMode(false);
      setEnableEdit(false);
      console.debug('update tooling success :', data);
      toast(<ToastCreateSuccess />);
      refetch();
      props.refetch();
    },
    onError(err) {
      console.error('update tooling error :', err);
    },
    onSettled() {
      queryClient.invalidateQueries('editToolingData');
    },
  });

  const handleUpdateToolingType = (toolingList) => {
    toolingList.forEach((item) => {
      if (item?.detail?.statusTypeValue === '999') {
        request({ url: `/masterData/tooling/${item?.detail?.id}/edit`, method: 'post', data: { statusType: '888' } });
      }
    });
  };

  const onSubmitPlanToPending = () => {
    let formData = {};
    if (values?.step.toString().length === 3) {
      formData = {
        productionOrder: props?.operationData?.productionOrderId,
        step: props?.operationData?.step?.value,
        status: 'COMPLETED',
      };
    } else {
      formData = {
        productionOrder: props?.operationData?.productionOrderId,
        step: props?.operationData?.step?.value,
        status: 'PENDING',
      };
    }
    if (values?.step === 25) {
      formData = {
        productionOrder: values.productionOrderId,
        productPortionSentCustomer: values.productPortionSentCustomer,
        operationDoc: {
          actualProducedAmount: values.actualProducedAmount,
          defectAmount: values.defectAmount,
          currentStep: values?.step,
        },
      };
      updateProductioPlanComplete(formData);
    }

    handleUpdateToolingType(values?.tooling || []);
    updateProductioPlanFn({ id: props?.operationData?.id, plan: formData });

    toast(<ToastCreateSuccess />);
    setTimeout(() => {
      props?.refetch();
      props.onHide();
    }, 1000);
    clearTimeout();
  };

  const handleSaveAfterQCChangeAmount = ({ step, plan }) => {
    const filterProductionOrderItemList = [];
    props?.dataList.forEach((res) => {
      res?.productSubType?.forEach((itemRes) => {
        filterProductionOrderItemList.push({
          producedSize: `${res.producedSize} ${itemRes.productSubTypeName}`,
          machine: itemRes.machine,
        });
      });
    });
    const newArrMachine = filterProductionOrderItemList.flatMap((obj) => obj.machine);
    const newArrPlan = newArrMachine.flatMap((obj) => obj.planDate);
    const newArrItemList = newArrPlan.flatMap((obj) => obj.itemList);

    const findProductionStep = newArrItemList.find((data) => data.step.value === step)?.id;

    console.log(plan);
    const formData = {
      operationDoc: {
        defectAmount: plan.defectAmount,
        actualProducedAmount: plan.actualProducedAmount,
        currentStep: step,
      },
    };
    console.log({ id: findProductionStep, plan: formData });
    updateProductPlan({ id: findProductionStep, plan: formData });
  };

  const handleSave = () => {
    handleSubmit();
    var toolingList = [];
    if (values.tooling.length > 0) {
      for (const element of values.tooling) {
        if (element?.detail?.id) {
          toolingList.push(element.detail.id);
        }
      }
      values.tooling = toolingList;
    }

    // if (values.productionOrderNo) {
    //   values.productionOrder = values.productionOrderNo.productionOrderId;
    // }
    values.operatedBy = userLogin?.user.employee.id;
    const problemList = [];
    const reasonList = [];
    const remarkList = [];
    const correctionList = [];
    if (values.problemList?.length > 0) {
      if (values.problemList[0]?.value !== undefined) {
        values.problemList?.forEach((element) => {
          problemList.push(element.detail.code);
        });
        values.problemList = problemList;
      } else {
        values.problemList?.forEach((element) => element);
      }
    }
    if (values.reasonList?.length > 0) {
      if (values.reasonList[0]?.value !== undefined) {
        values.reasonList?.forEach((element) => {
          reasonList.push(element.detail.code);
        });
        values.reasonList = reasonList;
      } else {
        values.reasonList?.forEach((element) => element);
      }
    }
    if (values.remarkList?.length > 0) {
      if (values.remarkList[0]?.value !== undefined) {
        values.remarkList?.forEach((element) => {
          remarkList.push(element.detail.code);
        });
        values.remarkList = remarkList;
      } else {
        values.remarkList?.forEach((element) => element);
      }
    }
    if (values.correctionList?.length > 0) {
      if (values.correctionList[0]?.value !== undefined) {
        values.correctionList?.forEach((element) => {
          correctionList.push(element.detail.code);
        });
        values.correctionList = correctionList;
      } else {
        values.correctionList?.forEach((element) => element);
      }
    }
    var data = {};
    if (values?.step === 11 || values?.step === 12) {
      data = {
        operationDoc: {
          currentStep: values.step,
          operationDate: values.updatedAt,
          operatedBy: values.operatedBy,
          fountainSolution: {
            filterStatus: values?.operationDoc?.fountainSolution?.filterStatus?.value,
            alcoholVolume: values?.operationDoc?.fountainSolution?.alcoholVolume || 0,
            ph: values?.operationDoc?.fountainSolution?.ph || 0,
            temperature: values?.operationDoc?.fountainSolution?.temperature || 0,
            conductivity: values?.operationDoc?.fountainSolution?.conductivity || 0,
          },
          correction: values?.operationDoc?.fountainSolution?.correction || values?.operationDoc?.correction || '',
          qualityCheck: values?.operationDoc.qualityCheck,
          printing: values?.operationDoc?.printing || [],
          coating: values?.operationDoc?.coating || [],
          problem: values?.operationDoc?.problem || [],
          operationList: values?.operationDoc?.operationList || [],
          defectAmount: Number(values?.operationDoc?.defectAmount || 0),
          actualProducedAmount: Number(values?.operationDoc?.actualProducedAmount || 0),
          // status: values?.status,
        },
      };
    } else if (values?.step === 13 || values?.step === 14) {
      data = {
        operationDoc: {
          currentStep: values.step,
          operationDate: values.updatedAt,
          operatedBy: values.operatedBy,
          fountainSolution: {
            filterStatus: values?.operationDoc?.fountainSolution?.filterStatus?.value,
            alcoholVolume: values?.operationDoc?.fountainSolution?.alcoholVolume || 0,
            ph: values?.operationDoc?.fountainSolution?.ph || 0,
            temperature: values?.operationDoc?.fountainSolution?.temperature || 0,
            conductivity: values?.operationDoc?.fountainSolution?.conductivity || 0,
          },
          correction: values?.operationDoc?.fountainSolution?.correction || values?.operationDoc?.correction || '',
          qualityCheck: values?.operationDoc.qualityCheck,
          printing: values?.operationDoc?.printing || [],
          coating: values?.operationDoc?.coating || [],
          problem: values?.operationDoc?.problem || [],
          operationList: values?.operationDoc?.operationList || [],
          defectAmount: Number(values?.operationDoc?.defectAmount || 0),
          actualProducedAmount: Number(values?.operationDoc?.actualProducedAmount || 0),
          // status: values?.status,
        },
      };
    } else if (
      values?.step === 16 ||
      values?.step === 17 ||
      values?.step === 18 ||
      values?.step === 19 ||
      values?.step === 20 ||
      values?.step === 22 ||
      values?.step === 23 ||
      values?.step === 26
    ) {
      const dataList = values.operationDoc.problem?.map((box) => {
        // let correctionList = '';
        let problem = [];
        if (box.detail?.length > 0) {
          if (box.detail[0]?.value !== undefined) {
            box.detail?.forEach((element) => {
              problem.push(element.detail.code);
            });
          } else {
            problem = box.detail;
          }
        }
        if (box.reasonList?.length > 0) {
          if (box.reasonList[0]?.value !== undefined) {
            box.reasonList?.forEach((element) => {
              reasonList.push(element.detail.code);
            });
          } else {
            box.reasonList?.forEach((element) => element);
          }
        }
        if (box.remarkList?.length > 0) {
          if (box.remarkList[0]?.value !== undefined) {
            box.remarkList?.forEach((element) => {
              remarkList.push(element.detail.code);
            });
          } else {
            box.remarkList?.forEach((element) => element);
          }
        }
        return {
          startTime: box.startTime,
          endTime: box.endTime,
          detail: problem,
          correction: box.correction?.value === undefined ? box.correction : box.correction?.value,
        };
      });
      const settingMachine = values.operationDoc.settingMachine.filter((e) => e !== null);
      data = {
        operationDoc: {
          currentStep: values.step,
          operationDate: new Date(),
          operatedBy: values.operatedBy,
          problem: dataList,
          defectAmount: Number(values?.operationDoc?.defectAmount || 0),
          actualProducedAmount: Number(values?.operationDoc?.actualProducedAmount || 0),
          settingMachine,
        },
      };
    } else if (values?.step === 25) {
      data = {
        operationDoc: {
          currentStep: values.step,
          productionOrder: values.productionOrderId,
          operationDate: new Date(),
          defectAmount: values.defectiveAmount,
        },
      };
      onSubmitPlanToPending();
    } else if (values?.step === 21 || values?.step === 24 || values?.step === 27) {
      const dataList = values.operationList?.map((box) => {
        // let correctionList = '';
        if (box.problemList?.length > 0) {
          if (box.problemList[0]?.value !== undefined) {
            box.problemList?.forEach((element) => {
              problemList.push(element.detail.code);
            });
          } else {
            box.problemList?.forEach((element) => element);
          }
        }
        if (box.correctionList?.length > 0) {
          if (box.correctionList[0]?.value !== undefined) {
            box.correctionList?.forEach((element) => {
              correctionList.push(element.detail.code);
            });
          } else {
            box.correctionList?.forEach((element) => element);
          }
        }
        if (box.reasonList?.length > 0) {
          if (box.reasonList[0]?.value !== undefined) {
            box.reasonList?.forEach((element) => {
              reasonList.push(element.detail.code);
            });
          } else {
            box.reasonList?.forEach((element) => element);
          }
        }
        if (box.remarkList?.length > 0) {
          if (box.remarkList[0]?.value !== undefined) {
            box.remarkList?.forEach((element) => {
              remarkList.push(element.detail.code);
            });
          } else {
            box.remarkList?.forEach((element) => element);
          }
        }
        return {
          startTime: box.startTime,
          endTime: box.endTime,
          detail: problemList,
          correction: box.correctionList?.value,
        };
      });
      data = {
        operationDoc: {
          currentStep: values.step,
          operationDate: new Date(),
          operatedBy: values.operatedBy,
          problem: dataList,
          defectAmount: Number(values?.operationDoc?.defectAmount || 0),
          actualProducedAmount: Number(values?.operationDoc?.actualProducedAmount || 0),
        },
      };
    } else if (values?.step > 100) {
      if (values.problemList?.length > 0) {
        if (values.problemList[0]?.value !== undefined) {
          values.problemList?.forEach((element) => {
            problemList.push(element.detail.code);
          });
          values.problemList = problemList;
        } else {
          values.problemList?.forEach((element) => element);
        }
      }
      if (values.reasonList?.length > 0) {
        if (values.reasonList[0]?.value !== undefined) {
          values.reasonList?.forEach((element) => {
            reasonList.push(element.detail.code);
          });
          values.reasonList = reasonList;
        } else {
          values.reasonList?.forEach((element) => element);
        }
      }
      if (values.remarkList?.length > 0) {
        if (values.remarkList[0]?.value !== undefined) {
          values.remarkList?.forEach((element) => {
            remarkList.push(element.detail.code);
          });
          values.remarkList = remarkList;
        } else {
          values.remarkList?.forEach((element) => element);
        }
      }
      if (values.correctionList?.length > 0) {
        if (values.correctionList[0]?.value !== undefined) {
          values.correctionList?.forEach((element) => {
            correctionList.push(element.detail.code);
          });
          values.correctionList = correctionList;
        } else {
          values.correctionList?.forEach((element) => element);
        }
      }
      data = {
        operationDoc: {
          currentStep: values.step,
          operationDate: new Date(),
          operatedBy: values.operatedBy,
          qualityCheck: {
            startTime: values.startTime,
            endTime: values.endTime,
            problem: problemList,
            reason: reasonList,
            correction: correctionList,
            remark: remarkList,
            result: values.result?.value,
          },
          defectAmount: Number(values?.operationDoc?.defectAmount || 0),
          actualProducedAmount: Number(values?.operationDoc?.actualProducedAmount || 0),
        },
      };
    }
    if (isBtnSave === 'submit') {
      data.status = 'COMPLETED';
      data.productionOrder = props?.operationData?.productionOrderId;
      // data.step = props?.operationData?.step?.value;
    }
    if (
      values?.step === 11 ||
      values?.step === 111 ||
      values?.step === 12 ||
      values?.step === 121 ||
      values?.step === 13 ||
      values?.step === 131 ||
      values?.step === 14 ||
      values?.step === 141 ||
      values?.step === 15 ||
      values?.step === 151 ||
      values?.step === 16 ||
      values?.step === 161 ||
      values?.step === 17 ||
      values?.step === 171 ||
      values?.step === 18 ||
      values?.step === 181 ||
      values?.step === 19 ||
      values?.step === 191 ||
      values?.step === 20 ||
      values?.step === 201 ||
      values?.step === 26 ||
      values?.step === 261
    ) {
      data.operationDoc.actualProducedAmount = data?.operationDoc?.actualProducedAmount * values?.productCavity;
      data.operationDoc.defectAmount = data?.operationDoc?.defectAmount * values?.productCavity;
    }
    const { id } = props;
    if (id) {
      // save
      if (values?.stepDetail?.flagQC) {
        productionOrderNo?.forEach((dataNo) => {
          updateProductPlan({ id: dataNo.id, plan: data });
          if (dataNo?.isLastStep) { 
            // สำหรับ skip QC Pack
            const formData = {
              productionOrder: values?.productionOrderId,
              status: 'COMPLETED',
              completedAt: moment(new Date()).format('YYYY-MM-DD'),
              deliverAt: moment(values?.CODeliverDt).format('YYYY-MM-DD'),
              actualProducedAmount: data?.operationDoc?.actualProducedAmount - data?.operationDoc?.defectAmount,
              // actualMissingAmount
              // actualSentCustAmount
              planList: [],
            };
            console.log(formData);
            updateProductioPlanComplete(formData);
          }
        });
      }
      if (values?.isLastStep) {
        const formData = {
          productionOrder: values?.productionOrderId,
          status: 'COMPLETED',
          completedAt: moment(new Date()).format('YYYY-MM-DD'),
          deliverAt: moment(values?.CODeliverDt).format('YYYY-MM-DD'),
          actualProducedAmount: data?.operationDoc?.actualProducedAmount - data?.operationDoc?.defectAmount,
          planList: [],
        };
        console.log(formData);
        updateProductioPlanComplete(formData);
      }
      setEnableEdit(true);
      console.log(data);
      if (values.step !== 25) {
        updateProductPlan({ id, plan: data });
      }
      refetch();
      if (isBtnSave !== 'save') {
        props.setConfirm(false);
      }
      setIsConfirmModalStart(false);
    } else {
      // create
      console.log(data);
      data.status = 'NEW';
      createProductPlan(data);
      props.setConfirm(false);
    }
  };

  const topNavClick = (stepItem, push, steps) => {
    localStorage.setItem('currentStep', stepItem.id);
    push(stepItem.id);
    if (props.id && stepItem.data?.detail?.planId) {
      props.setProductId(stepItem.data.detail.planId);
      resetWizard();
    }
  };

  const onAddProblemList = (value) => {
    // console.log(value);
    const problemList = values?.operationDoc.problem;
    problemList.push(value);
    const addIndex = problemList.map((data, index) => {
      return { label: `Record ${index + 1}`, value: index };
    });
    setRecordOption(addIndex);
    handleChange({ target: { id: `operationDoc.problem`, value: problemList } });
  };

  const onAddPrintGroupItems = (value) => {
    // console.log(value);
    const printMeasured = values?.operationDoc.qualityCheck.printMeasuredList;
    printMeasured.push(value);
    const addIndex = printMeasured.map((data, index) => {
      return { label: `Printing ${index + 1}`, value: index };
    });
    setQCLOption(addIndex);
    handleChange({ target: { id: `operationDoc.qualityCheck.printMeasuredList`, value: printMeasured } });
  };

  const onAddCoatingGroupItems = (value) => {
    // console.log(value);
    const coatingMeasured = values?.operationDoc.qualityCheck.coatingMeasuredList;
    coatingMeasured.push(value);
    const addIndex = coatingMeasured.map((data, index) => {
      return { label: `Coating ${index + 1}`, value: index };
    });
    setQCLCoatingOption(addIndex);
    handleChange({ target: { id: `operationDoc.qualityCheck.coatingMeasuredList`, value: coatingMeasured } });
  };
  const getClassName = (steps, step, index, stepItem) => {
    const selectIndex = steps.findIndex((data) => data.id === step.id);

    if (props.id) {
      if (selectIndex === index) {
        return 'step-doing';
      }
    } else {
      if (selectIndex === index) {
        return 'step-doing';
      }
      if (selectIndex > index || stepItem.isDone) {
        stepItem.isDone = true;
        return 'step-dones';
      }
    }
    return 'step';
  };
  const stepPackNew = [{ id: 'step1', name: 'Form 1', desc: 'Form 1 description' }];
  const stepQCNew = [
    { id: 'step1', name: 'Form 1', desc: 'Form 1 description' },
    { id: 'step2', name: 'Form 2', desc: 'Form 2 description' },
  ];
  const stepOperationMachine = [
    { id: 'step1', name: 'Form 1', desc: 'Form 1 description' },
    { id: 'step2', name: 'Form 2', desc: 'Form 2 description' },
    { id: 'step3', name: 'Form 3', desc: 'Form 3 description' },
  ];
  const stepPrintNew = [
    { id: 'step1', name: 'Form 1', desc: '' },
    { id: 'step2', name: 'Form 2', desc: '' },
    { id: 'step3', name: 'Form 3.1', desc: '' },
    { id: 'step4', name: 'Form 3.2', desc: '' },
    { id: 'step5', name: 'Form 4', desc: '' },
  ];
  const stepCoatingNew = [
    { id: 'step1', name: 'Form 1', desc: '' },
    { id: 'step2', name: 'Form 2', desc: '' },
    { id: 'step3', name: 'Form 3', desc: '' },
    { id: 'step4', name: 'Form 4', desc: '' },
  ];

  let modalTitle = '';
  let modalBody;

  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    if (savedStep) {
      setDefaultStep(savedStep);
    }
  }, []);

  useEffect(async () => {
    if (props.show) {
      resetForm();
    }
    const resultDataStatusType = await callGetMasterDataStatusType();
    callTooling();
    setToolingStatusType(resultDataStatusType);
  }, [props.show]);

  const onHide = () => {
    props.onHide();
  };
  const handleCancel = () => {
    setIsConfirmModal(false);
    setIsConfirmModalStart(false);
    setIsConfirmModalStartInprocess(false);
  };
  const ConfirmModal = ({ titleText, confirmText, okText, cancelText, show, className, loading, onConfirm, onCancel, setModal, ...rest }) => {
    return (
      <>
        <Modal
          className={clx('large fade', className)}
          show={show}
          onHide={onCancel}
          contentClassName={clx({ 'overlay-spinner': loading })}
          backdrop={loading ? 'static' : true}
        >
          <Modal.Header>
            <Modal.Title>{titleText || 'Confirmation'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmText}</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={onCancel} disabled={loading}>
              {cancelText || f({ id: 'common.cancel' })}
            </Button>
            <ReactToPrint
              trigger={() => (
                <Button variant="info" size="small" onClick={() => setModal(false)} disabled={loading}>
                  {f({ id: 'common.ok' })}
                </Button>
              )}
              content={() => componentRef.current}
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  const handleClick = (value) => {
    if (value === 'submit') {
      setIsBtnSave(value);
      setIsConfirmModalStart(true);
    } else {
      setIsBtnSave(value);
      setIsConfirmModalStart(true);
    }
  };
  const handleClickStartInprocess = () => {
    setIsConfirmModalStartInprocess(true);
  };

  const onSubmitModal = () => {
    const formData = {
      productionOrder: values?.productionOrderId,
      step: values?.step,
      status: 'INPROGRESS',
    };
    updateProductPlan({ id: values?.id, plan: formData });
    setIsConfirmModalStartInprocess(false);
    // refetch();
  };
  const ModalFooter = () => {
    let colSize;
    if (values?.status === 'INPROGRESS') {
      colSize = '6';
      if (values?.step === 25) {
        colSize = '4';
      }
    } else {
      colSize = '12';
    }
    return (
      <Row className="mb-0 g-3 w-100">
        <Col md={colSize}>
          {(values?.previousStepStatus === 'PENDING' ||
            values?.previousStepStatus === 'CONFIRMED' ||
            values?.previousStepStatus === 'COMPLETED' ||
            values?.previousStepStatus === null) &&
          values?.status === 'NEW' &&
          values?.productionCuttingStatus === 'COMPLETED' ? (
            <Button className="w-100" variant="outline-success" onClick={handleClickStartInprocess} disabled={isDisable}>
              {f({ id: 'common.start' })}
            </Button>
          ) : (
            <Button className="w-100" variant="outline-success" onClick={() => handleClick('save')} disabled={isDisable}>
              {f({ id: 'common.save' })}
            </Button>
          )}
        </Col>
        <Col md={colSize} className={`${values?.status === 'INPROGRESS' ? '' : 'd-none'}`}>
          <Button className="w-100" variant="outline-info" disabled={isDisable} onClick={() => handleClick('submit')}>
            {f({ id: 'common.submit' })}
          </Button>
        </Col>
        {/* <Col md={colSize} className={`${values?.step === 25 ? '' : 'd-none'}`}>
          <Button className="w-100" variant="outline-warning" onClick={onSubmitPlanToPending}>
            {f({ id: 'common.saveCustomer' })}
          </Button>
        </Col> */}
      </Row>
    );
  };
  modalTitle = `${f({ id: 'operator.field.title' })} : ${values?.stepName?.label || ''}`;
  if (values?.step > 100) {
    modalBody = (
      <div key={resetKey} className="wizard wizard-default">
        <Wizard defaultStep="step1">
          <WithWizard
            render={({ next, previous, step, steps, go, push }) => {
              steps = stepQCNew;
              return (
                <ul className="nav nav-tabs justify-content-center">
                  {steps.map((stepItem, index) => {
                    if (!stepItem.hideTopNav) {
                      return (
                        <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                          <Button variant="link" className="nav-link" onClick={() => topNavClick(stepItem, push)}>
                            <span>{stepItem.name}</span>
                            <small>{stepItem.desc}</small>
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
            <Step id="step1" name="Form 1" desc="Form 1 description">
              <PageFirst
                isDisable={isDisable}
                id={props.id}
                data={values}
                productNameOptions={props.productNameOptions}
                machineOptions={props.machineOptions}
                productionStepOptions={props.productionStepOptions}
                toolingOptions={toolingOptions}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
              />
            </Step>
            <Step id="step2" name="Form 2" desc="Form 2 description">
              <QualityCheckSecond
                id={props.id}
                initialData={initialData}
                data={values}
                validationSchema={validationSchema}
                setValidateButton={setValidateButton}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
                onHandleChange={handleChange}
                formik={formik}
                onHide={props.onHide}
                calculateData={initData}
                isFetchingActualProduction={isFetchingActual}
              />
            </Step>
          </Steps>
        </Wizard>
      </div>
    );
  } else if (
    values?.step === 16 ||
    values?.step === 17 ||
    values?.step === 18 ||
    values?.step === 19 ||
    values?.step === 20 ||
    values?.step === 22 ||
    values?.step === 23 ||
    values?.step === 26
  ) {
    // modalTitle = `${f({ id: 'operator.field.title' })} : Pump`;
    const onAddProblemList = (value) => {
      const operationList = values?.operationDoc?.problem;
      operationList.push(value);
      const addIndex = operationList.map((data, index) => {
        return { label: `Record ${index + 1}`, value: index };
      });
      setRecordOption(addIndex);
      handleChange({ target: { id: `operationDoc.problem`, value: operationList } });
    };
    modalBody = (
      <div className="wizard wizard-default">
        <Wizard defaultStep="step1">
          <WithWizard
            render={({ next, previous, step, steps, go, push }) => {
              steps = stepOperationMachine;
              return (
                <ul className="nav nav-tabs justify-content-center">
                  {steps.map((stepItem, index) => {
                    if (!stepItem.hideTopNav) {
                      return (
                        <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                          <Button variant="link" className="nav-link" onClick={() => topNavClick(stepItem, push)}>
                            <span>{stepItem.name}</span>
                            <small>{stepItem.desc}</small>
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
            <Step id="step1" name="Form 1" desc="Form 1 description">
              <PageFirst
                isDisable={isDisable}
                id={props.id}
                data={values}
                productNameOptions={props.productNameOptions}
                machineOptions={props.machineOptions}
                productionStepOptions={props.productionStepOptions}
                toolingOptions={toolingOptions}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
              />
            </Step>
            <Step id="step2" name="Form 2" desc="Form 2 description">
              <OperatorInform2
                id={props.id}
                initialData={initialData}
                data={values}
                setShowModal={props.setShowModal}
                onHandleChange={handleChange}
                refetch={props.refetch}
                formik={formik}
              />
            </Step>
            <Step id="step3" name="Form 3" desc="Form 3 description">
              <OperatorInform3
                setStickerAmount={setStickerAmount}
                id={props.id}
                data={values}
                initialData={initialData}
                formik={formik}
                onHandleChange={handleChange}
                onHide={props.onHide}
                calculateData={initData}
                isFetchingActual={isFetchingActual}
                onAddProblemList={onAddProblemList}
                recordOption={recordOption}
                setRecordOption={setRecordOption}
              />
            </Step>
          </Steps>
        </Wizard>
      </div>
    );
  } else if (values?.step === 21 || values?.step === 24 || values?.step === 27) {
    // modalTitle = `${f({ id: 'operator.field.title' })} : Pump`;
    const onAddProblemList = (value) => {
      // console.log(value);
      const operationList = values?.operationDoc.operationList;
      operationList.push(value);
      const addIndex = operationList.map((data, index) => {
        return { label: `Record ${index + 1}`, value: index };
      });
      setRecordOption(addIndex);
      handleChange({ target: { id: `operationDoc.operationList`, value: operationList } });
    };
    modalBody = (
      <div className="wizard wizard-default">
        <Wizard key={resetKey} defaultStep="step1">
          <WithWizard
            render={({ next, previous, step, steps, go, push }) => {
              steps = stepQCNew;
              return (
                <ul className="nav nav-tabs justify-content-center">
                  {steps.map((stepItem, index) => {
                    if (!stepItem.hideTopNav) {
                      return (
                        <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                          <Button variant="link" className="nav-link" onClick={() => topNavClick(stepItem, push)}>
                            <span>{stepItem.name}</span>
                            <small>{stepItem.desc}</small>
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
            <Step id="step1" name="Form 1" desc="Form 1 description">
              <PageFirst
                isDisable={isDisable}
                id={props.id}
                data={values}
                productNameOptions={props.productNameOptions}
                machineOptions={props.machineOptions}
                productionStepOptions={props.productionStepOptions}
                toolingOptions={toolingOptions}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
              />
            </Step>
            <Step id="step2" name="Form 2" desc="Form 2 description">
              <OperatorInform3
                setStickerAmount={setStickerAmount}
                id={props.id}
                data={values}
                initialData={initialData}
                formik={formik}
                onHandleChange={handleChange}
                onHide={props.onHide}
                calculateData={initData}
                isFetchingActual={isFetchingActual}
                onAddProblemList={onAddProblemList}
                recordOption={recordOption}
                setRecordOption={setRecordOption}
              />
            </Step>
          </Steps>
        </Wizard>
      </div>
    );
  } else if (values?.step === 25) {
    // modalTitle = `${f({ id: 'operator.field.title' })} : Pump`;
    modalBody = (
      <div className="wizard wizard-default">
        <Wizard key={resetKey} defaultStep="step1">
          <WithWizard
            render={({ next, previous, step, steps, go, push }) => {
              steps = stepPackNew;
              return (
                <ul className="nav nav-tabs justify-content-center">
                  {steps.map((stepItem, index) => {
                    if (!stepItem.hideTopNav) {
                      return (
                        <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                          <Button variant="link" className="nav-link" onClick={() => topNavClick(stepItem, push)}>
                            <span>{stepItem.name}</span>
                            <small>{stepItem.desc}</small>
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
            <Step id="step1" name="Form 1" desc="Form 1 description">
              <OperatorPack
                setStickerAmount={setStickerAmount}
                id={props.id}
                data={values}
                initialData={initialData}
                formik={formik}
                onHandleChange={handleChange}
                onHide={props.onHide}
                calculateData={initData}
                isFetchingActual={isFetchingActual}
              />
            </Step>
          </Steps>
        </Wizard>
      </div>
    );
  } else if (values?.step === 11 || values?.step === 12) {
    modalBody = (
      <div className="wizard wizard-default">
        <Wizard key={resetKey} defaultStep={defaultStep}>
          <WithWizard
            render={({ next, previous, step, steps, go, push }) => {
              if (values?.machine?.detail?.subType === 'CD') {
                steps = stepPrintNew.filter((data) => data.id !== 'step4');
              } else {
                steps = stepPrintNew.filter((data) => data.id !== 'step3');
              }
              return (
                <ul className="nav nav-tabs justify-content-center">
                  {steps.map((stepItem, index) => {
                    if (!stepItem.hideTopNav) {
                      return (
                        <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                          <Button variant="link" className="nav-link" onClick={() => topNavClick(stepItem, push)}>
                            <span>{stepItem.name}</span>
                            <small>{stepItem.desc}</small>
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
            <Step id="step1" name="Form 1" desc="Form 1 description">
              <PageFirst
                id={props.id}
                data={values}
                productNameOptions={props.productNameOptions}
                machineOptions={props.machineOptions}
                productionStepOptions={props.productionStepOptions}
                toolingOptions={toolingOptions}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
              />
            </Step>
            <Step id="step2" name="Form 2" desc="Form 2 description">
              <PagePrintingSecond
                id={props.id}
                initialData={initialData}
                data={values}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
                formik={formik}
                onChange={handleChange}
              />
            </Step>
            <Step id="step3" name="Form 3.1" desc="Form 3.1 description">
              <PagePrintingThird1
                id={props.id}
                data={values}
                productPrintColorList={values?.productPrintColor}
                productCoatingMethodList={values?.productCoatingMethod}
                initialData={initialData}
                onChange={handleChange}
                onAddPrintGroupItems={onAddPrintGroupItems}
                onAddCoatingGroupItems={onAddCoatingGroupItems}
                QCLOption={QCLOption}
                setQCLOption={setQCLOption}
                QCLCoatingOption={QCLCoatingOption}
                setQCLCoatingOption={setQCLCoatingOption}
              />
            </Step>
            <Step id="step4" name="Form 3.2" desc="Form 3.2 description">
              <div className="d-flex flex-column justify-content-center align-items-center">
                <Form.Label className="form-label">{f({ id: 'dailyPlan.field.title3-4' })}</Form.Label>
              </div>
              <OverlayScrollbarsComponent
                options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
                style={{ minHeight: '400px', maxHeight: '400px' }}
              >
                {values?.productPrintColor.map((data, index) => (
                  <>
                    <PagePrintingThird2
                      idx={index}
                      id={props.id}
                      productPrintColorList={values?.productPrintColor}
                      printColor={data}
                      data={values?.operationDoc?.printing[index]}
                      // initialData={initialData}
                      onChange={handleChange}
                    />
                  </>
                ))}
              </OverlayScrollbarsComponent>
              {/* <Footer /> */}
            </Step>
            <Step id="step5" name="Form 4" desc="Form 4 description">
              <PagePrintingFourth
                id={props.id}
                valuesPlan={values}
                onAddProblemList={onAddProblemList}
                onChange={handleChange}
                dataList={values?.operationDoc?.problem || []}
                onSave={handleSave}
                calculateData={initData}
                isFetchingActualProduction={isFetchingActual}
                recordOption={recordOption}
                setRecordOption={setRecordOption}
              />
            </Step>
          </Steps>
        </Wizard>
      </div>
    );
  } else if (values?.step === 13 || values?.step === 14 || values?.step === 15 || values?.step === 28 || values?.step === 29) {
    // modalTitle = `${f({ id: 'operator.field.title' })} :`; // Set a default value or an empty string if needed

    // console.log(values);  // console.log(values);
    const onAddProblemList = (value) => {
      // console.log(value);
      const problemList = values?.operationDoc.problem;
      problemList.push(value);
      handleChange({ target: { id: `operationDoc.problem`, value: problemList } });
    };
    modalBody = (
      <div className="wizard wizard-default">
        <Wizard defaultStep="step1">
          <WithWizard
            render={({ next, previous, step, steps, go, push }) => {
              steps = stepCoatingNew;
              return (
                <ul className="nav nav-tabs justify-content-center">
                  {steps.map((stepItem, index) => {
                    if (!stepItem.hideTopNav) {
                      return (
                        <li key={`topNavStep_${index}`} className={`nav-item ${getClassName(steps, step, index, stepItem)}`}>
                          <Button variant="link" className="nav-link" onClick={() => topNavClick(stepItem, push)}>
                            <span>{stepItem.name}</span>
                            <small>{stepItem.desc}</small>
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
            <Step id="step1" name="Form 1" desc="Form 1 description">
              <PageFirst
                isDisable={isDisable}
                id={props.id}
                data={values}
                productNameOptions={props.productNameOptions}
                machineOptions={props.machineOptions}
                productionStepOptions={props.productionStepOptions}
                toolingOptions={toolingOptions}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
              />
            </Step>
            <Step id="step2" name="Form 2" desc="Form 2 description">
              <PagePrintingSecond
                isDisable={isDisable}
                id={props.id}
                initialData={initialData}
                data={values}
                setShowModal={props.setShowModal}
                refetch={props.refetch}
                formik={formik}
                onChange={handleChange}
                onSave={handleSave}
              />
            </Step>
            <Step id="step3" name="Form 3.1" desc="Form 3.1 description">
              <PagePrintingThird1
                id={props.id}
                data={values}
                productPrintColorList={values?.productPrintColor}
                productCoatingMethodList={values?.productCoatingMethod}
                initialData={initialData}
                onChange={handleChange}
                onAddPrintGroupItems={onAddPrintGroupItems}
                onAddCoatingGroupItems={onAddCoatingGroupItems}
                QCLOption={QCLOption}
                setQCLOption={setQCLOption}
                QCLCoatingOption={QCLCoatingOption}
                setQCLCoatingOption={setQCLCoatingOption}
              />
            </Step>
            <Step id="step4" name="Form 4" desc="Form 4 description">
              <PagePrintingFourth
                isDisable={isDisable}
                id={props.id}
                valuesPlan={values}
                onAddProblemList={onAddProblemList}
                onChange={handleChange}
                dataList={values?.operationDoc?.problem || []}
                onSave={handleSave}
                calculateData={initData}
                isFetchingActualProduction={isFetchingActual}
                setRecordOption={setRecordOption}
              />
            </Step>
          </Steps>
        </Wizard>
      </div>
    );
  }

  return (
    <>
      <Modal show={props.show} onHide={onHide} backdrop="static" size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        {!isFetching ? (
          <>
            <Modal.Body>{modalBody}</Modal.Body>
            <Modal.Footer className="p-2 m-2">
              <ModalFooter />
            </Modal.Footer>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh' }}>
            <Spinner animation="border" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {/* <Modal.Footer className="p-1 px-5">
          <div className="d-flex flex-row justify-content-end align-items-center w-100">
            <div className="d-flex flex-row gap-2">
              <Button variant="outline-primary" onClick={props.onHide}>
                {f({ id: 'common.cancel' })}
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {f({ id: 'common.save' })}
              </Button>
            </div>
          </div>
        </Modal.Footer> */}
      </Modal>
      <StickerToPrint
        // rowProps={rowProps}
        componentRef={(e) => {
          componentRef.current = e;
        }}
        className="react-table rows"
        tableInstance={values}
        stickerAmount={stickerAmount}
        isConfirmModal={isConfirmModal}
      />
      <ConfirmModal
        show={isConfirmModal}
        setModal={setIsConfirmModal}
        // loading={supplier}
        titleText={f({ id: 'common.warning' })}
        confirmText={f({ id: 'common.confirm' })}
        // onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ConfirmModalStart
        show={isConfirmModalStart}
        setModal={setIsConfirmModalStart}
        loading={isPNoFetching}
        titleText={f({ id: `common.${isBtnSave}` })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={handleSave}
        onCancel={handleCancel}
      />
      <ConfirmModalStartInprocess
        show={isConfirmModalStartInprocess}
        setModal={setIsConfirmModalStartInprocess}
        titleText={f({ id: 'common.submit' })}
        confirmText={f({ id: 'common.confirm' })}
        onConfirm={onSubmitModal}
        onCancel={handleCancel}
      />
    </>
  );
};

export default InformationForm;
