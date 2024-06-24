/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Glide from 'components/carousel/Glide';
import { useIntl } from 'react-intl';
import { Row, Col, Button, Form, Card, FormControl, FormLabel, Badge } from 'react-bootstrap';
import { useFormik } from 'formik';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import classNames from 'classnames';
import { request } from 'utils/axios-utils';
import { SERVICE_URL } from 'config';

import HtmlHead from 'components/html-head/HtmlHead';
import useSaleOrderCustomerData from 'hooks/api/sale-order/customer/useSaleOrderCustomerData';
import LovCompanySelect from 'components/lov-select/LovCompanySelect';
import BoxItem from 'views/test/konva/BoxItem';
import { toast } from 'react-toastify';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import useProductionData from 'hooks/api/production/useProductionData';
import useProductData from 'hooks/api/master/product/useProductData';
import LovSelectPriority from './components/LovSelectPriority';
import RelateWorkModal from './components/RelateWorkModal';

const generateId = () => new Date().getTime();

const useProducedItemData = ({ id, type, productionState, startX, startY, setFormCalculateAmount }) => {
  const { useProductionGetQuery } = useProductionData();
  const { useGetProducedItem } = useSaleOrderCustomerData();

  /** @type {import('react-query').UseQueryResult} */
  let queryResult;

  if (productionState !== 'PRE') {
    queryResult = useProductionGetQuery(id);
  } else {
    queryResult = useGetProducedItem({ type, producedItemId: id, startX, startY });
  }

  return queryResult;
};

const ToastCreateSuccess = () => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <div className="mb-2">
        <CsLineIcons icon="check-circle" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
        <span className="align-middle text-primary heading font-heading">{f({ id: 'production.produce.noti.save.success' })}</span>
      </div>
    </>
  );
};

const ToastUpdateError = () => {
  return (
    <div className="mb-2">
      <CsLineIcons icon="error-hexagon" width="20" height="20" className="cs-icon icon text-primary me-3 align-middle" />
      <span className="align-middle text-primary heading font-heading">Cannot revert because there are selected purchase items in some PO</span>
    </div>
  );
};

/**
 * Produce Box page
 * @param {{match: { params: {id: string, type: string, productionState: 'PRE' | 'MID' | 'POST'} }}} param0
 * @returns {JSX.Element}
 */
const ProduceBoxPage = ({ match }) => {
  const { formatMessage: f } = useIntl();
  const { replace } = useHistory();
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  const [InitialAmount, setInitialAmount] = useState();
  const [isDefaultCompany, setIsDefaultCompany] = useState();
  const [boxList, setBoxList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAfterChangeAmount, setIsAfterChangeAmount] = useState(false);
  const [confirmSaveShow, setConfirmSaveShow] = useState(false);
  const [amountIsChanged, setAmountIsChanged] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(true);
  const [isClearActual, setIsClearActual] = useState(true);
  const [isSubmitConfirmShow, setSubmitConfirmShow] = useState(false);
  const [onUpdateAdditionalPrintedAmount, setOnUpdateAdditionalPrintedAmount] = useState();
  const [cavityCN, setCavityCN] = useState(0);
  const [boxItemIndex, setBoxItemIndex] = useState(0);
  const [selectCuttingLayout, setSelectCuttingLayout] = useState();
  const [addModal, setAddModal] = useState(false);
  const [doingFirstTime, setDoingFirstTime] = useState(true);
  const [isRefetch, setIsRefetch] = useState(false);
  const [isConfirmRevers, setIsConfirmRevers] = useState(false);
  const [errorMaterialUseAmount, setErrorMaterialUseAmount] = useState(false);

  const [formCalculateAmount, setFormCalculateAmount] = useState({
    producedAmount: 0,
    additionalPrintedAmount: 0,
    totalPrintedAmount: 0,
    producedCuttingSheet: 0,
    actualAdjust: 0,
    totalProducedAmount: 0,
    remainingProduced: 0,
  });

  const initialValue = {
    producedAmount: 0,
    additionalPrintedAmount: 0,
    totalPrintedAmount: 0,
    producedCuttingSheet: 0,
    actualAdjust: 0,
    totalProducedAmount: 0,
    remainingProduced: 0,
  };

  const [initialData, setInitialData] = useState([{ ...initialValue, InvCutoff: 0 }, initialValue, initialValue]);

  const boxProps = useMemo(() => ({ width, height }), [width, height]);
  let type;
  const { params: { type: paramType, id, productionState } = {} } = match;

  const { useProductionAddMutation, useProductionEditMutation } = useProductionData();
  const { mutateAsync: productionAddAsync } = useProductionAddMutation();
  const { mutateAsync: productionEditAsync } = useProductionEditMutation();

  type = `${paramType}`.toLowerCase();

  const {
    data: producedItemData,
    isLoading,
    isFetching,
    refetch,
  } = useProducedItemData({
    id,
    type,
    productionState,
    setFormCalculateAmount,
  });

  type = `${paramType || producedItemData?.type}`.toLowerCase();

  const title = useMemo(
    () =>
      f(
        { id: isFetching ? `production.produce.title` : `production.produce.title.${type}` },
        { productName: producedItemData?.productName || producedItemData?.producedProductName, groupName: producedItemData?.saleOrderGroupName }
      ),
    [f, isFetching, producedItemData?.producedProductName, producedItemData?.productName, producedItemData?.saleOrderGroupName, type]
  );
  const description = f({ id: 'production.produce.description' });

  // console.debug('producedItemData :', producedItemData);

  const formik = useFormik({
    initialValues: {
      ...producedItemData,
    },
    enableReinitialize: true,
  });
  const { handleChange, values, resetForm } = formik;

  const totalObject = useMemo(() => {
    return (boxList || []).reduce(
      (prev, box) => {
        return {
          producedAmount: prev.producedAmount + (box.producedAmount || box.cuttingLayout?.producedAmount || 0),
          printedAmount: prev.printedAmount + (box.printedAmount || box.cuttingLayout?.printedAmount || 0),
          materialUsedAmount: prev.materialUsedAmount + (box.cuttingLayout?.materialUsedAmount || 0),
        };
      },
      { producedAmount: 0, printedAmount: 0, materialUsedAmount: 0 }
    );
  }, [boxList]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (producedItemData) {
      const productionFilterData = await request({ url: `/production/find`, params: { producedSize: producedItemData?.producedProductSize } });
      const filterData = productionFilterData.data.data[0]?.itemList?.find((item) => item.id === producedItemData?.relatedProductionOrder);
      producedItemData.relatedProductionOrderValue = filterData;
      const productInventory = await request({ url: `/inventory/product/find`, params: { productId: producedItemData?.productId } });
      // eslint-disable-next-line prefer-destructuring
      producedItemData.productInventory = productInventory.data.data[0];
      if (productionState !== 'PRE') {
        setBoxList(
          producedItemData.detail.map((d) => {
            const layout = d.layoutDetail?.find((ld) => ld.item === d.selectedLayout);
            return {
              boxId: d.id,
              item: d.item,
              materialId: d.materialId,
              productId: producedItemData.productId || producedItemData.producedProductId,
              producedAmount: layout?.producedAmount,
              selectedLayout: d.selectedLayout,
              layoutDetail: d.layoutDetail,
              cuttingLayout: d.layoutDetail[0],
              additionalCaution: d.additionalCaution,
              storeData: d.storeData,
            };
          })
        );
      } else {
        setBoxList([
          {
            boxId: generateId(),
            productId: producedItemData.productId || producedItemData.producedProductId,
            producedAmount: producedItemData.amount - (producedItemData?.productInventory?.availableAmount || initialData[0].InvCutoff || 0),
            defaultProducedAmount: producedItemData.amount,
          },
        ]);
      }
    }
  }, [producedItemData]);

  const defaultMaterialId = useMemo(() => {
    return producedItemData?.bomList?.[0]?.materialList?.[0].id;
    // return producedItemData?.bomList?.[0]?.isDefault && producedItemData?.bomList?.[0]?.materialList?.[0].id;
  }, [producedItemData?.bomList]);

  const handleCalculateAmount = useCallback(
    (value) => {
      const cavity = value?.cavity || 0;
      setCavityCN(value?.cavity);

      let addPrintedAmount = 0;
      let produceAmountCn = 0;
      let produceAmountConvertCN = 0;
      let totalSheetsCN = 0;
      let produceCuttingSheetsCN = 0;
      let actualAdjCN = 0;
      let produceAmountRealCN = 0;
      let noneProduceAmountCN = 0;

      const InvCutoffCN =
        producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'
          ? values?.producedAmount + values?.additionalPrintedAmount * cavity - (values?.totalProducedAmount || 0)
          : producedItemData?.productInventory?.availableAmount || 0;
      setInitialData((prevData) =>
        prevData.map((item, index) =>
          index === 0
            ? {
                ...item,
                producedAmount: producedItemData?.producedAmount || producedItemData?.amount,
                InvCutoff: InvCutoffCN,
                totalPrintedAmount: (producedItemData?.producedAmount || producedItemData?.amount) / value?.cavity,
              }
            : item
        )
      );

      if (!amountIsChanged) {
        console.log('A-1 เมื่อมีการเปลี่ยนค่า amount ใน box');

        if (!isAfterChangeAmount && doingFirstTime) {
          console.log('A-1-1');
          if (producedItemData?.status === undefined) {
            setInitialData((prevData) => {
              addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
              produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
              produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
              totalSheetsCN = produceAmountConvertCN; // จำนวนใบพิมพ์ที่ต้องการ
              produceCuttingSheetsCN = totalSheetsCN; // จำนวนใบพิมพ์ผลิต
              actualAdjCN = totalObject.producedAmount - produceAmountCn; // จำนวนเผื่อเสียจริง
              produceAmountRealCN =
                producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'
                  ? produceCuttingSheetsCN * cavity || 0
                  : produceCuttingSheetsCN * cavity || 0;
              noneProduceAmountCN =
                producedItemData?.status !== undefined
                  ? produceAmountRealCN - totalObject.producedAmount - (InvCutoffCN || 0)
                  : produceAmountRealCN - totalObject.producedAmount - (InvCutoffCN || 0); // จำนวนชิ้นงานที่ยังไม่ได้ผลิต

              return prevData.map((item, index) =>
                index === 1
                  ? {
                      ...item,
                      producedAmount: produceAmountConvertCN,
                      additionalPrintedAmount: addPrintedAmount,
                      totalPrintedAmount: totalSheetsCN,
                      producedCuttingSheet: produceCuttingSheetsCN,
                      actualAdjust: addPrintedAmount,
                      totalProducedAmount: produceAmountRealCN,
                      remainingProduced: noneProduceAmountCN,
                    }
                  : item
              );
            });

            setInitialData((prevData) => {
              addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
              produceAmountCn = values?.producedAmount || values?.amount || 0; // จำนวนชิ้นงานที่ลูกค้าสั่ง
              produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
              totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
              produceCuttingSheetsCN = (totalObject.producedAmount - produceAmountCn) / cavity; // จำนวนใบพิมพ์ผลิต
              actualAdjCN = (totalObject.producedAmount - (produceAmountCn - (InvCutoffCN || 0))) / cavity; // จำนวนเผื่อเสียจริง
              produceAmountRealCN = ((totalObject.producedAmount - produceAmountCn) / cavity) * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)

              return prevData.map((item, index) =>
                index === 2
                  ? {
                      ...item,
                      producedAmount: produceAmountConvertCN,
                      additionalPrintedAmount: addPrintedAmount,
                      totalPrintedAmount: totalSheetsCN,
                      producedCuttingSheet: produceCuttingSheetsCN,
                      actualAdjust:
                        producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'
                          ? actualAdjCN - addPrintedAmount
                          : produceCuttingSheetsCN - addPrintedAmount === addPrintedAmount
                          ? 0
                          : actualAdjCN - addPrintedAmount,
                      totalProducedAmount: produceAmountRealCN,
                    }
                  : item
              );
            });
          } else {
            setInitialData((prevData) => {
              addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
              produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
              produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
              totalSheetsCN = produceAmountConvertCN; // จำนวนใบพิมพ์ที่ต้องการ
              produceCuttingSheetsCN = totalSheetsCN + addPrintedAmount; // จำนวนใบพิมพ์ผลิต
              actualAdjCN = totalObject.producedAmount - (InvCutoffCN - addPrintedAmount * cavity); // จำนวนเผื่อเสียจริง
              produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
              noneProduceAmountCN = produceAmountRealCN - totalObject.producedAmount - (InvCutoffCN || 0); // จำนวนชิ้นงานที่ยังไม่ได้ผลิต
              return prevData.map((item, index) =>
                index === 1
                  ? {
                      ...item,
                      producedAmount: produceAmountConvertCN,
                      additionalPrintedAmount: addPrintedAmount,
                      totalPrintedAmount: totalSheetsCN,
                      producedCuttingSheet: produceCuttingSheetsCN,
                      actualAdjust:
                        producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'
                          ? actualAdjCN - addPrintedAmount
                          : addPrintedAmount,
                      totalProducedAmount: produceAmountRealCN,
                      remainingProduced: noneProduceAmountCN,
                    }
                  : item
              );
            });

            setInitialData((prevData) => {
              addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
              produceAmountCn = values?.producedAmount || values?.amount || 0; // จำนวนชิ้นงานที่ลูกค้าสั่ง
              produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
              totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
              produceCuttingSheetsCN = totalObject.producedAmount / cavity - totalSheetsCN; // จำนวนใบพิมพ์ผลิต
              actualAdjCN = (totalObject.producedAmount - (produceAmountCn - (InvCutoffCN || 0))) / cavity; // จำนวนเผื่อเสียจริง
              produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
              return prevData.map((item, index) =>
                index === 2
                  ? {
                      ...item,
                      producedAmount: produceAmountConvertCN,
                      additionalPrintedAmount: addPrintedAmount,
                      totalPrintedAmount: totalSheetsCN,
                      producedCuttingSheet: produceCuttingSheetsCN,
                      actualAdjust:
                        producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'
                          ? Math.abs(actualAdjCN - addPrintedAmount)
                          : produceCuttingSheetsCN - addPrintedAmount === addPrintedAmount
                          ? 0
                          : actualAdjCN - addPrintedAmount,
                      totalProducedAmount: produceAmountRealCN,
                    }
                  : item
              );
            });
          }

          // setDoingFirstTime(false);
        } else if (isAfterChangeAmount) {
          console.log('A-1-2');
          setInitialData((prevData) => {
            const remain = boxList.pop();
            addPrintedAmount = 0;
            produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
            produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
            totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
            produceCuttingSheetsCN = totalSheetsCN; // จำนวนใบพิมพ์ผลิต
            actualAdjCN = totalObject.producedAmount - produceAmountCn; // จำนวนเผื่อเสียจริง
            produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
            noneProduceAmountCN =
              producedItemData?.status !== undefined
                ? produceAmountRealCN - totalObject.producedAmount
                : produceAmountRealCN - totalObject.producedAmount - (InvCutoffCN || 0); // จำนวนชิ้นงานที่ยังไม่ได้ผลิต
            return prevData.map((item, index) =>
              index === 1
                ? {
                    ...item,
                    producedAmount: produceAmountConvertCN,
                    additionalPrintedAmount: item.additionalPrintedAmount - remain?.producedAmount / cavity,
                    totalPrintedAmount: totalSheetsCN,
                    producedCuttingSheet: produceCuttingSheetsCN,
                    actualAdjust: addPrintedAmount,
                    totalProducedAmount: produceAmountRealCN,
                    // remainingProduced: noneProduceAmountCN,
                  }
                : item
            );
          });

          setInitialData((prevData) => {
            addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
            produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
            produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
            totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
            produceCuttingSheetsCN = (totalObject.producedAmount - produceAmountCn) / cavity; // จำนวนใบพิมพ์ผลิต
            actualAdjCN = (totalObject.producedAmount - produceAmountCn) / cavity; // จำนวนเผื่อเสียจริง
            produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
            return prevData.map((item, index) =>
              index === 2
                ? {
                    ...item,
                    producedAmount: produceAmountConvertCN,
                    additionalPrintedAmount: addPrintedAmount,
                    totalPrintedAmount: totalSheetsCN,
                    producedCuttingSheet: produceCuttingSheetsCN,
                    actualAdjust: actualAdjCN,
                    totalProducedAmount: produceAmountRealCN,
                  }
                : item
            );
          });
        }
        if (!isAfterChangeAmount && !doingFirstTime) {
          addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
          produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
          produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
          totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ

          produceCuttingSheetsCN = (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity; // จำนวนใบพิมพ์ผลิต
          actualAdjCN =
            producedItemData?.status !== undefined
              ? (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity
              : (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity; // จำนวนเผื่อเสียจริง
          produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
          noneProduceAmountCN = produceAmountRealCN - totalObject.producedAmount; // จำนวนชิ้นงานที่ยังไม่ได้ผลิต
          console.log('A-1-3 เมื่อไม่มีการเปลี่ยนค่าใบพิมพ์เผื่อเสีย');

          setInitialData((prevData) =>
            prevData.map((item, index) =>
              index === 1
                ? {
                    ...item,
                    actualAdjust: addPrintedAmount,
                    remainingProduced:
                      producedItemData?.status !== undefined
                        ? item.totalProducedAmount - totalObject.producedAmount
                        : item.totalProducedAmount - totalObject.producedAmount - (InvCutoffCN || 0),
                  }
                : item
            )
          );

          setInitialData((prevData) =>
            prevData.map((item, index) =>
              index === 2
                ? {
                    ...item,
                    producedAmount: produceAmountConvertCN,
                    additionalPrintedAmount: addPrintedAmount,
                    totalPrintedAmount: totalSheetsCN,
                    producedCuttingSheet: produceCuttingSheetsCN,
                    actualAdjust: actualAdjCN,
                    totalProducedAmount: produceAmountRealCN,
                  }
                : item
            )
          );
        }
      } else {
        console.log('A-2 เมื่อไม่มีมีการเปลี่ยนค่า amount ใน box');
        if (!isAfterChangeAmount) {
          if (producedItemData?.status === undefined) {
            console.log('A-2-A');
            addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
            produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
            produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
            totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
            produceCuttingSheetsCN = (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity; // จำนวนใบพิมพ์ผลิต
            actualAdjCN = (totalObject.producedAmount - (initialData[1].totalProducedAmount - (InvCutoffCN || 0))) / cavity; // จำนวนเผื่อเสียจริง
            produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
            noneProduceAmountCN = initialData[1].totalProducedAmount - (InvCutoffCN || 0) - totalObject.producedAmount; // จำนวนชิ้นงานที่ยังไม่ได้ผลิต
            console.log(totalObject.producedAmount);
            console.log(initialData[1].totalProducedAmount);
            console.log((totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity);
            setInitialData((prevData) =>
              prevData.map((item, index) =>
                index === 1
                  ? {
                      ...item,
                      remainingProduced: noneProduceAmountCN,
                    }
                  : item
              )
            );
            setInitialData((prevData) =>
              prevData.map((item, index) =>
                index === 2
                  ? {
                      ...item,
                      producedAmount: produceAmountConvertCN,
                      additionalPrintedAmount: addPrintedAmount,
                      totalPrintedAmount: totalSheetsCN,
                      producedCuttingSheet: produceCuttingSheetsCN,
                      actualAdjust: actualAdjCN,
                      totalProducedAmount: produceAmountRealCN,
                    }
                  : item
              )
            );
          } else {
            console.log('A-2-B');
            addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
            produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
            produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
            totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
            produceCuttingSheetsCN = (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity; // จำนวนใบพิมพ์ผลิต
            actualAdjCN = (totalObject.producedAmount - (initialData[1].totalProducedAmount - (InvCutoffCN || 0))) / cavity;
            // initialData[1].remainingProduced !== 0
            //   ? (totalObject.producedAmount - (initialData[1].totalProducedAmount + initialData[2].totalProducedAmount - (InvCutoffCN || 0))) / cavity // จำนวนเผื่อเสียจริง
            //   : 0;
            produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
            noneProduceAmountCN = initialData[1].totalProducedAmount - (InvCutoffCN || 0) - totalObject.producedAmount;
            console.log(totalObject.producedAmount);
            console.log(initialData[1].totalProducedAmount);
            console.log((totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity);
            setInitialData((prevData) =>
              prevData.map((item, index) =>
                index === 1
                  ? {
                      ...item,
                      remainingProduced: noneProduceAmountCN,
                    }
                  : item
              )
            );
            setInitialData((prevData) =>
              prevData.map((item, index) =>
                index === 2
                  ? {
                      ...item,
                      producedAmount: produceAmountConvertCN,
                      additionalPrintedAmount: addPrintedAmount,
                      totalPrintedAmount: totalSheetsCN,
                      producedCuttingSheet: produceCuttingSheetsCN,
                      actualAdjust: actualAdjCN,
                      totalProducedAmount: produceAmountRealCN,
                    }
                  : item
              )
            );
          }
        } else {
          console.log('A-2-2');

          produceCuttingSheetsCN = (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity; // จำนวนใบพิมพ์ผลิต
          produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
          noneProduceAmountCN = produceAmountRealCN - totalObject.producedAmount; // จำนวนชิ้นงานที่ยังไม่ได้ผลิต

          setInitialData((prevData) =>
            prevData.map((item, index) =>
              index === 1
                ? {
                    ...item,
                    remainingProduced:
                      producedItemData?.status !== undefined
                        ? item.remainingProduced > 0
                          ? (Math.abs((totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity) + item.additionalPrintedAmount) * cavity
                          : 0
                        : item.remainingProduced > 0
                        ? (Math.abs((totalObject.producedAmount - (initialData[1].totalProducedAmount - (InvCutoffCN || 0))) / cavity) +
                            item.additionalPrintedAmount) *
                          cavity
                        : 0,
                  }
                : item
            )
          );

          setInitialData((prevData) => {
            addPrintedAmount = Number(values?.additionalPrintedAmount || 0) || 0;
            produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานที่ลูกค้าสั่ง
            produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
            totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
            produceCuttingSheetsCN = (totalObject.producedAmount - initialData[1].totalProducedAmount) / cavity; // จำนวนใบพิมพ์ผลิต
            actualAdjCN =
              producedItemData?.status !== undefined
                ? (totalObject.producedAmount - (initialData[1].totalProducedAmount - (InvCutoffCN || 0))) / cavity
                : (totalObject.producedAmount - (initialData[1].totalProducedAmount - (InvCutoffCN || 0))) / cavity; // จำนวนเผื่อเสียจริง
            produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)

            return prevData.map((item, index) =>
              index === 2
                ? {
                    ...item,
                    producedAmount: produceAmountConvertCN,
                    additionalPrintedAmount: addPrintedAmount,
                    totalPrintedAmount: totalSheetsCN,
                    producedCuttingSheet: produceCuttingSheetsCN,
                    actualAdjust: actualAdjCN,
                    totalProducedAmount: produceAmountRealCN,
                  }
                : item
            );
          });

          setAmountIsChanged(false);
          setIsAfterChangeAmount(false);
        }
      }
    },
    [isAfterChangeAmount, producedItemData, totalObject, values?.additionalPrintedAmount]
  );

  const handleAddBoxConfirmClick = useCallback(() => {
    // Check first item amount > 0
    const totalProducedAm = boxList.reduce((acc, obj) => acc + obj.producedAmount, 0);
    setInitialAmount(initialData[1]?.remainingProduced - totalProducedAm);

    if (!boxList?.length) {
      console.error('Box list must contain at least 1 item');
      toast.error(f({ id: 'production.produce.add-dialog.error.more-than-one' }));
      return;
    }

    if (initialData[1]?.remainingProduced <= 0) {
      console.error(`Amount is not enough to add`);
      toast.error(f({ id: 'production.produce.add-dialog.error.not-enough' }));
      return;
    }

    const newList = [
      ...boxList,
      {
        boxId: generateId(),
        productId: producedItemData?.productId || producedItemData?.producedProductId,
        materialId: boxList[0].materialId,
        producedAmount: initialData[1]?.remainingProduced,
      },
    ];

    setBoxList(newList);

    // setIsAfterChangeAmount(true);
    setIsAdding(true);
    setInitialData((prevData) =>
      prevData.map((item, index) =>
        index === 1
          ? {
              ...item,
              remainingProduced: 0,
            }
          : item
      )
    );
  }, [boxList, initialData, producedItemData?.productId, producedItemData?.producedProductId, f]);

  // const handleAddBoxCancelClick = useCallback(() => setAddConfirmShow(false), []);

  const handleBoxUpdate = useCallback((data) => {
    const { boxId, cuttingLayout, materialId, layoutDetail, producedAmount, storeData, additionalCaution } = data;

    setBoxList((prev) => {
      const boxIdx = prev.findIndex((box) => box.boxId === boxId && boxId !== undefined);
      if (boxIdx < 0) {
        return prev;
      }
      if (boxIdx >= 0) {
        prev[boxIdx] = {
          ...prev[boxIdx],
          cuttingLayout,
          materialId,
          additionalCaution,
          printedAmount: cuttingLayout?.printedAmount,
          layoutDetail,
          producedAmount: typeof producedAmount !== 'undefined' ? producedAmount : prev[boxIdx].producedAmount,
          storeData: storeData || prev[boxIdx].storeData,
        };
      }
      const arr = prev.filter((item) => Object.keys(item).length !== 0);
      return arr;
    });
  }, []);

  const createHandleBoxDelete = useCallback(
    (data) => () => {
      console.debug('Box delete:', data);

      const indexToDelete = boxList.findIndex((box) => box.boxId === data.boxId);

      if (indexToDelete < 0) {
        toast.error(`Not found box to delete`);
        return;
      }
      if (indexToDelete === 0) {
        console.debug(`Fist item can't be deleted`);
        return;
      }

      const boxToDelete = boxList[indexToDelete];

      // newList[0].producedAmount += boxToDelete.producedAmount;

      console.log(initialData[1].remainingProduced);
      console.log(boxToDelete);
      const newList = boxList.filter((box) => typeof box.defaultProducedAmount === 'number' || box.boxId !== data.boxId);
      setBoxList(newList);
      setInitialData((prevData) =>
        prevData.map((item, index) =>
          index === 1
            ? {
                ...item,
                remainingProduced: item.remainingProduced + boxToDelete.producedAmount,
              }
            : item
        )
      );

      setInitialData((prevData) =>
        prevData.map((item, index) =>
          index === 2
            ? {
                ...item,
                producedCuttingSheet: item.producedCuttingSheet - boxToDelete.producedAmount / cavityCN,
                actualAdjust: item.actualAdjust - boxToDelete.producedAmount / cavityCN,
                totalProducedAmount: item.totalProducedAmount - boxToDelete.producedAmount,
              }
            : item
        )
      );
      // setBoxItemIndex(1);
    },
    [boxList]
  );

  const handleConfirmSubmitClick = useCallback(async () => {
    setSubmitConfirmShow(true);
  }, []);

  const handleDeleteClick = useCallback(async () => {
    console.log('cancel');
  }, []);

  const handleSaveClick = useCallback(
    async ({ isSubmit = false }) => {
      setConfirmSaveShow(false);
      // console.debug('Form submit', type, producedItemData, boxList);
      console.log(boxList);
      const mapBox = boxList.map((box, idx) => {
        const additional = box?.additionalCaution?.map((dataAdd) => dataAdd?.value);
        let a;
        if (box?.boxId !== 'add') {
          a = {
            item: idx + 1,
            materialId: box.materialId,
            selectedLayout: box.cuttingLayout?.item,
            layoutDetail: [box.cuttingLayout],
            additionalCaution: additional?.[0] !== undefined ? additional : box?.additionalCaution,
            product: producedItemData?.productId || '',
            productReserveAmount: producedItemData?.productInventory?.availableAmount || initialData[0].InvCutoff || 0,
            ...(box.storeData ? { storeData: box.storeData, isStore: true } : {}),
          };
        } else {
          a = {
            item: 'add',
          };
        }

        return a;
      });

      console.log(mapBox);

      const filterBox = mapBox.filter((item) => item?.item !== 'add');
      console.log(filterBox);
      console.log(initialData);
      const saveData = {
        type: `${type}`.toUpperCase(),
        priority: values?.priority || 'NORMAL',
        companyId: values?.companyId || isDefaultCompany?.detail?.id,
        companyAbbr: values?.companyAbbr || isDefaultCompany?.detail?.abbr,
        producedItemId: producedItemData?.producedItemId || id,
        relatedProductionOrder: values?.relatedProductionOrder,
        additionalPrintedAmount: initialData[1]?.additionalPrintedAmount,
        totalPrintedAmount: initialData[0].totalPrintedAmount,
        totalProducedAmount:
          initialData[0].InvCutoff !== 0
            ? initialData[0].producedAmount - (producedItemData?.productInventory?.availableAmount || initialData[0].InvCutoff || 0)
            : initialData[0].producedAmount,
        detail: filterBox,
      };

      if (isSubmit) {
        saveData.product = values.productId;
        saveData.productReserveAmount = initialData[1].totalProducedAmount - initialData[1].producedAmount;
      }

      console.log('Save data :', saveData);

      let resp;

      try {
        setIsLoadingSubmit(false);
        if (productionState === 'PRE') {
          resp = await productionAddAsync(saveData);
          replace(`/production/produce/view/${resp.id}`);
        } else {
          resp = await productionEditAsync({ id, data: { ...saveData, isSubmit } });
        }
        if (resp) {
          console.log(resp);
          toast(<ToastCreateSuccess />);
          resetForm();
          refetch();
          setIsRefetch(true);
          setIsLoadingSubmit(true);

          console.log(isSubmit);
          if (isSubmit) {
            axios
              .post(
                `${SERVICE_URL}/masterData/product/${resp?.productId}/edit`,
                { defaultLayout: saveData?.detail[0].selectedLayout },
                {
                  headers: {
                    'content-type': 'application/json',
                  },
                }
              )
              .then((res) => res.data);
          }
        }
      } catch (err) {
        toast.error(f({ id: 'production.produce.noti.save.fail' }));
      }
      console.debug(' save result :', resp);

      setSubmitConfirmShow(false);
    },
    [
      type,
      values,
      isDefaultCompany,
      producedItemData?.producedItemId,
      id,
      boxList,
      productionState,
      refetch,
      productionAddAsync,
      replace,
      productionEditAsync,
      f,
    ]
  );

  const handleSubmit = useCallback(async () => {
    setSubmitConfirmShow(false);
    await handleSaveClick({ isSubmit: true });
  }, [handleSaveClick]);

  const handlePriorityChange = (priority) => {
    handleChange({ target: { id: 'priority', value: priority } });
  };
  const handleCompanyChange = (company) => {
    handleChange({ target: { id: 'companyId', value: company?.detail?.id } });
    handleChange({ target: { id: 'companyAbbr', value: company?.detail?.abbr } });
  };

  const searchDefaultCompany = async () => {
    const res = await request({ url: `/masterData/company/find?isDefault=true` });
    const list = [];
    res.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        id: element.id,
        nameTh: { label: element.name, value: element.name },
        nameEn: element.nameEn,
        address: element.address,
        addressEn: element.addressEn,
        detail: element,
      };
      list.push(obj);
    });
    setIsDefaultCompany(list[0]);
    return res.data.data[0];
  };

  useEffect(async () => {
    await searchDefaultCompany();
  }, []);

  const handleOnAddRelateProduct = (item) => {
    handleChange({ target: { id: 'relatedProductionOrder', value: item } });
  };

  const handleOnARemoveRelateProduct = (item) => {
    handleChange({ target: { id: 'relatedProductionOrder', value: '' } });
  };

  const handleOnDeviationPercentageChange = (e) => {
    const addPrintedAmount = Number(e.target.value || 0);
    const cavity = selectCuttingLayout?.cavity || 0;

    let produceAmountCn = 0;
    let produceAmountConvertCN = 0;
    let totalSheetsCN = 0;
    let produceCuttingSheetsCN = 0;
    let actualAdjCN = 0;
    let produceAmountRealCN = 0;
    let noneProduceAmountCN = 0;

    handleChange({ target: { id: 'remainingProduced', value: noneProduceAmountCN } });

    if (addPrintedAmount === 0) {
      setIsAfterChangeAmount(false);
    }

    if (/^[0-9]*$/.test(e.target.value)) {
      handleChange({ target: { id: 'additionalPrintedAmount', value: e.target.value } });
      setIsEditing(true);

      if (addPrintedAmount === 0) {
        setIsAfterChangeAmount(false);
      }

      if (isAfterChangeAmount) {
        console.log('P-1');
        produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานผลิตจริง
        produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
        totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
        produceCuttingSheetsCN = totalSheetsCN; // จำนวนใบพิมพ์ผลิต
        actualAdjCN = addPrintedAmount; // จำนวนเผื่อเสียจริง
        produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
        noneProduceAmountCN = produceAmountRealCN - totalObject.producedAmount; // จำนวนชิ้นงานที่ยังไม่ได้ผลิต

        setInitialData((prevData) =>
          prevData.map((item, index) =>
            index === 1
              ? {
                  ...item,
                  producedAmount: produceAmountConvertCN,
                  additionalPrintedAmount: addPrintedAmount,
                  totalPrintedAmount: totalSheetsCN,
                  producedCuttingSheet: produceCuttingSheetsCN,
                  actualAdjust: actualAdjCN,
                  totalProducedAmount: produceAmountRealCN,
                  remainingProduced: noneProduceAmountCN,
                }
              : item
          )
        );
        // setIsAfterChangeAmount(false);
      } else {
        console.log('P-2');
        produceAmountCn = values?.producedAmount || values?.amount; // จำนวนชิ้นงานผลิตจริง
        produceAmountConvertCN = produceAmountCn / cavity; // จำนวนชิ้นงานผลิตจริง
        totalSheetsCN = produceAmountConvertCN + addPrintedAmount; // จำนวนใบพิมพ์ที่ต้องการ
        produceCuttingSheetsCN = totalSheetsCN; // จำนวนใบพิมพ์ผลิต
        actualAdjCN = addPrintedAmount; // จำนวนเผื่อเสียจริง
        produceAmountRealCN = produceCuttingSheetsCN * cavity; // จำนวนชิ้นงานผลิตจริง (แปลงเป็นใบพิมพ์)
        noneProduceAmountCN = produceAmountRealCN - totalObject.producedAmount; // จำนวนชิ้นงานที่ยังไม่ได้ผลิต

        if (addPrintedAmount === 0) {
          setInitialData((prevData) =>
            prevData.map((item, index) =>
              index === 1
                ? {
                    ...item,
                    additionalPrintedAmount: 0,
                    actualAdjust: 0,
                    totalPrintedAmount: totalSheetsCN - addPrintedAmount,
                    totalProducedAmount: produceAmountRealCN,
                    producedCuttingSheet: produceCuttingSheetsCN,
                    remainingProduced: 0,
                  }
                : item
            )
          );
          setInitialData((prevData) =>
            prevData.map((item, index) =>
              index === 2
                ? {
                    ...item,
                    actualAdjust: 0,
                    totalProducedAmount: 0,
                  }
                : item
            )
          );
        } else {
          setInitialData((prevData) =>
            prevData.map((item, index) =>
              index === 1
                ? {
                    ...item,
                    producedAmount: produceAmountConvertCN,
                    additionalPrintedAmount: addPrintedAmount,
                    totalPrintedAmount: totalSheetsCN - addPrintedAmount,
                    producedCuttingSheet: produceCuttingSheetsCN,
                    actualAdjust: actualAdjCN,
                    totalProducedAmount: produceAmountRealCN,
                    // remainingProduced: item.remainingProduced > 0 ? item.remainingProduced + addPrintedAmount * cavity : 0,
                  }
                : item
            )
          );
        }
      }
    }
  };

  const reversProduce = async () => {
    try {
      await axios({
        url: `${SERVICE_URL}/production/${id}/revert`,
        method: 'post',
      });
    } catch (err) {
      toast(<ToastUpdateError />);
    }
    setIsConfirmRevers(false);
  };

  useEffect(() => {
    if (selectCuttingLayout && isClearActual && producedItemData?.status === undefined) {
      handleChange({ target: { id: 'additionalPrintedAmount', value: 0 } });
      setInitialData((prevData) =>
        prevData.map((item, index) =>
          index === 1
            ? {
                ...item,
                additionalPrintedAmount: 0,
                actualAdjust: 0,
              }
            : item
        )
      );
      setInitialData((prevData) =>
        prevData.map((item, index) =>
          index === 2
            ? {
                ...item,
                actualAdjust: 0,
              }
            : item
        )
      );
    }
  }, [selectCuttingLayout]);

  useEffect(() => {
    if (initialData) {
      console.log(initialData);
    }
  }, [initialData]);
  return (
    <>
      <HtmlHead title={title} description={description} />
      <Col>
        {/* Title Start */}
        {/* <Affix top={15}> */}
        <div className="page-title-container mb-3">
          <Row>
            <Col xs="auto" className="mb-2 align-self-md-center">
              <NavLink to="/production/produce" className="btn-link btn-icon-start w-100 w-md-auto">
                <CsLineIcons icon="arrow-left" /> {/* <span>{f({ id: 'common.back' })}</span> */}
              </NavLink>
            </Col>
            <Col className="mb-2">
              <h1 className="mb-2 pb-0 display-4">{title}</h1>
              <div className="text-muted font-heading text-medium">{description}</div>
            </Col>
            <Col xs="auto" className="align-self-md-center">
              <Row>
                {/* <Col>
                  {producedItemData?.status !== 'SUBMITTED' && (
                    <Button variant="info" className="btn-icon" onClick={handleAddBoxConfirmClick}>
                      <CsLineIcons icon="plus" />
                      Add
                    </Button>
                  )}
                </Col> */}
                <Col>
                  {producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED' ? (
                    <div style={{ textAlign: 'right' }}>
                      <Button variant="success" className="btn-icon btn-icon-start w-100 w-md-auto mb-1 ms-1" disabled onClick={() => setIsConfirmRevers(true)}>
                        <CsLineIcons icon="revert" /> <span>{f({ id: 'common.revert' })}</span>
                      </Button>{' '}
                      <Button variant="outline-danger" className="btn-icon" onClick={handleDeleteClick}>
                        <CsLineIcons icon="delete" /> {f({ id: 'common.cancel' })}
                      </Button>
                    </div>
                  ) : (
                    <>
                      {initialData[1]?.remainingProduced > 0 ? (
                        <Button variant="info" className="btn-icon" onClick={handleAddBoxConfirmClick}>
                          <CsLineIcons icon="plus" /> Add Layout
                        </Button>
                      ) : (
                        <Button variant="info" className="btn-icon" disabled>
                          <CsLineIcons icon="plus" /> Add Layout
                        </Button>
                      )}{' '}
                      <Button
                        variant={productionState === 'PRE' ? 'success' : 'outline-success'}
                        className="btn-icon"
                        disabled={errorMaterialUseAmount}
                        onClick={() => setConfirmSaveShow(true)}
                      >
                        <CsLineIcons icon="save" /> {f({ id: 'common.save' })}
                      </Button>{' '}
                      {productionState !== 'PRE' && (
                        <Button variant="primary" className="btn-icon" onClick={handleConfirmSubmitClick} disabled={errorMaterialUseAmount}>
                          <CsLineIcons icon="next" /> {f({ id: 'production.produce.submit' })}
                        </Button>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        {/* </Affix> */}
      </Col>
      <Row
        className={classNames({
          'overlay-spinner': isLoading,
        })}
      >
        <Col>
          <Card className="mb-3">
            <Card className="p-3">
              <Row>
                <Col md="3" sm="12">
                  <h2 className="text-md" style={{ fontWeight: '500', color: '#1b9ad4' }}>
                    {f({ id: 'production.produce.total' })}
                  </h2>
                </Col>
                <Col md="3" sm="12">
                  {' '}
                </Col>
                <Col md="3" sm="12">
                  <Button
                    variant="outline-info"
                    size="sm"
                    disabled={producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'}
                    className="btn-icon mt-1"
                    onClick={() => setAddModal(true)}
                  >
                    {values?.relatedProductionOrder ? (
                      <> {values?.relatedProductionOrderValue?.lotNo || values?.relatedProductionOrderValue || f({ id: 'production.produce.related-work' })}</>
                    ) : (
                      f({ id: 'production.produce.related-work' })
                    )}
                  </Button>
                </Col>
                <Col md="3" sm="12">
                  <Row className="mb-2 text-hover-body">
                    <div className="my-1">
                      <FormLabel className=" text-info" style={{ fontSize: '17px', fontWeight: '600' }}>
                        {f({ id: 'production.produce.none-produce-amount' })} :
                      </FormLabel>
                      <b className="ms-1 mt-3  text-info" style={{ fontSize: '17px', fontWeight: '600' }}>
                        {initialData[1]?.remainingProduced <= 0 ? 0 : initialData[1]?.remainingProduced.toFixed(0)}{' '}
                        {f({ id: 'production.produce.produce-amount-unit' })}
                      </b>
                    </div>
                  </Row>
                </Col>
              </Row>
              <Row className="mb-0">
                <Col md="3" sm="12">
                  <Row className="mb-0 text-hover-body">
                    <div className="my-1">
                      <FormLabel>{f({ id: 'production.produce.orderedBy' })} :</FormLabel>
                      <b className="ms-1 mt-3">
                        {initialData[0]?.producedAmount} {f({ id: 'production.produce.produce-amount-unit' })}
                      </b>
                    </div>
                  </Row>
                </Col>
                <Col md="3" sm="12">
                  <Row>
                    <Col md="6">
                      <FormLabel className="mt-1">{f({ id: 'production.produce.deviationPercentage' })} :</FormLabel>
                    </Col>
                    <Col md="6">
                      <Row>
                        <Col sm="8" md="8" lg="8">
                          <Form.Control
                            type="text"
                            name="additionalPrintedAmount"
                            onChange={handleOnDeviationPercentageChange}
                            value={initialData[1]?.additionalPrintedAmount}
                            disabled={producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED' || boxList.length > 1}
                            // placeholder={additionalPrintedAmountA || ''}
                          />
                        </Col>
                        <Col sm="2" md="2" lg="2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            disabled={!isEditing || boxList.length > 1 || producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'}
                            className="btn-icon mt-1"
                            onClick={() => {
                              setIsAfterChangeAmount(true);
                              setIsClearActual(false);
                              setOnUpdateAdditionalPrintedAmount({
                                additionalPrintedAmount: initialData[1]?.additionalPrintedAmount,
                                cuttingPieces: selectCuttingLayout?.cuttingPieces,
                                cavity: selectCuttingLayout?.cavity,
                                produceAmount: initialData[0].producedAmount - (initialData[0].InvCutoff || 0),
                              });
                            }}
                          >
                            <CsLineIcons icon="edit" />
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                    {/* <b className="ms-1">{values?.producedAmount || values?.amount}</b> */}
                  </Row>
                </Col>
                <Col md="3" sm="12">
                  <Row className="mb-2 text-hover-body">
                    <div className="my-1">
                      <FormLabel> {f({ id: 'production.produce.sheet' })} :</FormLabel>
                      <b className="ms-1 mt-3">
                        {Math.round(initialData[1]?.totalPrintedAmount) || 0} {f({ id: 'production.produce.cutting-pieces-unit' })}
                      </b>
                    </div>
                  </Row>
                </Col>
                <Col md="3" sm="12">
                  <Row className="mb-2 text-hover-body">
                    <Col md="3">
                      <FormLabel className="mt-1">{f({ id: 'production.produce.company' })}</FormLabel>
                    </Col>
                    <Col md="9">
                      <LovCompanySelect
                        className="w-100"
                        classNamePrefix="react-select"
                        isDisabled={producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'}
                        onChange={handleCompanyChange}
                        value={values?.companyId || isDefaultCompany?.id}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Row>
                <Col md="3" sm="12">
                  <Row className="mb-2 text-hover-body">
                    <div>
                      <FormLabel>
                        {/* {producedItemData?.status !== undefined ? (
                          <> {f({ id: 'production.produce.produce-amount' })} :</>
                        ) : (
                          <> */}
                        {f({ id: 'production.produce.produce-amount' })}({f({ id: 'production.produce.break' })} {initialData[0].InvCutoff}) :
                        {/* </>
                        )} */}
                      </FormLabel>
                      <b className="ms-1 mt-3">
                        {/* {initialData[1]?.totalProducedAmount || 0}
                        {' + '}
                        {initialData[2]?.totalProducedAmount || 0} {f({ id: 'production.produce.produce-amount-unit' })} */}
                        {/* {producedItemData?.status === undefined ? ( */}
                        <>{Math.round(initialData[1]?.totalProducedAmount + initialData[2]?.totalProducedAmount)} </>
                        {/* ) : (
                          <>{Math.round(initialData[1]?.totalProducedAmount)} </>
                        )} */}
                        {f({ id: 'production.produce.produce-amount-unit' })}
                      </b>
                    </div>
                  </Row>
                </Col>
                <Col md="3" sm="12">
                  <Row className="mb-2 text-hover-body">
                    <div>
                      <FormLabel> {f({ id: 'production.produce.actual' })} :</FormLabel>
                      <b className="ms-1 mt-3">
                        {
                          producedItemData?.status === undefined ? (
                            <>
                              {''}
                              {Math.round(initialData[1]?.actualAdjust + initialData[2]?.actualAdjust)} {f({ id: 'production.produce.cutting-pieces-unit' })}
                            </>
                          ) : (
                            <>
                              {Math.round(initialData[1]?.actualAdjust + initialData[2]?.actualAdjust)} {f({ id: 'production.produce.cutting-pieces-unit' })}
                            </>
                          )
                          /* {initialData[1]?.actualAdjust || 0}
                        {' + '}
                        {initialData[2]?.actualAdjust || 0} {f({ id: 'production.produce.cutting-pieces-unit' })} */
                        }
                      </b>
                    </div>
                  </Row>
                </Col>
                <Col md="3" sm="12">
                  <Row className="mb-2 text-hover-body">
                    <div>
                      <FormLabel>{f({ id: 'production.produce.produced-cutting' })} :</FormLabel>
                      <b className="ms-1 mt-3">
                        {Math.round(initialData[1]?.producedCuttingSheet + initialData[2]?.producedCuttingSheet)}{' '}
                        {f({ id: 'production.produce.cutting-pieces-unit' })}
                        {/* {initialData[1]?.producedCuttingSheet || 0}
                        {' + '}
                        {initialData[2]?.producedCuttingSheet || 0} {f({ id: 'production.produce.cutting-pieces-unit' })} */}
                      </b>
                    </div>
                  </Row>
                </Col>
                <Col md="3" sm="12">
                  <Row className="text-hover-body align-middle ">
                    <Col md="3">
                      <FormLabel className="mt-1">{f({ id: 'production.produce.type' })}</FormLabel>
                    </Col>
                    <Col md="9">
                      <b>
                        <LovSelectPriority
                          className="w-100"
                          classNamePrefix="react-select"
                          isDisabled={producedItemData?.status === 'SUBMITTED' || producedItemData?.status === 'COMPLETED'}
                          onChange={handlePriorityChange}
                          value={values?.priority}
                        />
                      </b>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col
          xs={12}
          className={classNames({
            'overlay-spinner': isLoading || !isLoadingSubmit || boxList.length === 0,
          })}
          style={{ minHeight: 200 }}
        >
          {boxList.length > 0 && (
            <>
              <Glide
                noKeyboard
                noDestroy
                setBoxItemIndex={setBoxItemIndex}
                boxItemIndex={boxItemIndex}
                options={{
                  gap: 1,
                  perView: 1,
                  dragThreshold: 0,
                }}
              >
                {boxList?.map((box, idx) => (
                  <Card
                    key={`${idx}`}
                    className={classNames('mb-3 w-100', {
                      'overlay-spinner': isLoading,
                    })}
                  >
                    {idx !== 0 ? (
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="foreground"
                          className="mb-1 btn-icon btn-icon-only"
                          disabled={isAdding}
                          onClick={createHandleBoxDelete({
                            boxId: box.boxId,
                          })}
                        >
                          <CsLineIcons icon="bin" className="text-danger" />
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-end m-4"> </div>
                    )}
                    <Glide.Item>
                      <Card className="p-2 w-100">
                        <BoxItem
                          boxId={box.boxId}
                          isRefetch={isRefetch}
                          producedAmount={box.producedAmount}
                          producedItemData={producedItemData}
                          boxItem={box}
                          boxLength={boxList.length}
                          boxList={boxList}
                          setAmountIsChanged={setAmountIsChanged}
                          setSelectCuttingLayout={setSelectCuttingLayout}
                          productId={box.productId}
                          defaultCuttingLayout={box.cuttingLayout}
                          boxProps={boxProps}
                          defaultMaterial={productionState !== 'PRE' ? box.materialId : defaultMaterialId}
                          selectedArea={box.storeData}
                          onUpdate={handleBoxUpdate}
                          InitialAmount={InitialAmount}
                          onUpdateAdditionalPrintedAmount={onUpdateAdditionalPrintedAmount}
                          setOnUpdateAdditionalPrintedAmount={setOnUpdateAdditionalPrintedAmount}
                          setIsEditing={setIsEditing}
                          handleCalculateAmount={handleCalculateAmount}
                          setIsAdding={setIsAdding}
                          formCalculateAmount={formCalculateAmount}
                          idx={idx}
                          errorMaterialUseAmount={errorMaterialUseAmount}
                          setErrorMaterialUseAmount={setErrorMaterialUseAmount}
                        />
                      </Card>
                    </Glide.Item>
                  </Card>
                ))}
              </Glide>
            </>
          )}
        </Col>
      </Row>

      <RelateWorkModal
        show={addModal}
        onHide={setAddModal}
        id={producedItemData?.id || ''}
        size={producedItemData?.producedProductSize}
        relatedId={values?.relatedProductionOrder}
        onAdd={handleOnAddRelateProduct}
        onRemove={handleOnARemoveRelateProduct}
        handleChange={handleChange}
      />

      <ConfirmModal
        show={confirmSaveShow}
        confirmText={
          <Row>
            <Col>
              {initialData[1].remainingProduced > 0 ? (
                <div style={{ color: 'red', fontSize: '16px', fontWeight: '600' }}>
                  {f({ id: 'production.produce.alert-dialog.message' })} {initialData[1].remainingProduced}{' '}
                  {f({ id: 'production.produce.produce-amount-unit' })}
                </div>
              ) : (
                <div>{f({ id: 'production.produce.confirm-dialog.message' })}</div>
              )}
              {/* <FormControl type="number" value={amount || ''} style={{ display: 'inline-block', width: 'auto' }} min="0" onChange={handleAmountChange} /> */}
            </Col>
          </Row>
        }
        onConfirm={handleSaveClick}
        onCancel={() => setConfirmSaveShow(false)}
      />
      <ConfirmModal
        show={isSubmitConfirmShow}
        onConfirm={handleSubmit}
        onCancel={useCallback(() => setSubmitConfirmShow(false), [])}
        confirmText={
          <Row>
            <Col>
              <div>{f({ id: 'production.produce.confirm-submit.message' })}</div>
            </Col>
          </Row>
        }
      />

      <ConfirmModal
        show={isConfirmRevers}
        onConfirm={reversProduce}
        onCancel={useCallback(() => setIsConfirmRevers(false), [])}
        confirmText={
          <Row>
            <Col>
              <div>{f({ id: 'production.produce.confirm-revers.message' })}</div>
            </Col>
          </Row>
        }
      />

      {/* <ConfirmModal
        show={isAlertShow}
        onConfirm={handleSubmit}
        onCancel={useCallback(() => setSubmitConfirmShow(false), [])}
        confirmText={
          <Row>
            <Col>
              <div>{f({ id: 'production.produce.confirm-submit.message' })}</div>
            </Col>
          </Row>
        }
      /> */}
    </>
  );
};

export default ProduceBoxPage;
