import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import clx from 'classnames';
import BoxDisplay from 'components/box-slicer/box-display';
import BoxSlicerForm from 'components/box-slicer/box-slicer-form';
import useProductionData from 'hooks/api/production/useProductionData';
import useMaterialData from 'hooks/api/material/useMaterialData';

const BoxItem = ({
  //
  idx,
  boxId,
  boxItem,
  productId,
  producedItemData,
  producedAmount,
  defaultMaterial,
  defaultCuttingLayout,
  selectedArea,
  boxProps = {},
  isLoading,
  onUpdate,
  boxList,
  boxLength,
  onDisableDefault,
  fontSize,
  setAmountIsChanged,
  formCalculateAmount,
  setSelectCuttingLayout = () => {},
  setIsAdding = () => {},
  InitialAmount,
  onUpdateAdditionalPrintedAmount,
  setOnUpdateAdditionalPrintedAmount,
  handleCalculateAmount = () => {},
  setIsEditing,
  errorMaterialUseAmount,
  setErrorMaterialUseAmount,
  isRefetch,
  RightSide = BoxSlicerForm,
}) => {
  const [materialId, setMaterialId] = useState(defaultMaterial);
  const [width, setWidth] = useState(boxProps.width || 0);
  const [height, setHeight] = useState(boxProps.height || 0);
  const [startX, setStartX] = useState(5);
  const [startY, setStartY] = useState(5);
  const [startTextX, setStartTextX] = useState(10);
  const [startTextY, setStartTextY] = useState(10);
  const [paperWidth, setPaperWidth] = useState(0);
  const [paperHeight, setPaperHeight] = useState(0);
  const [materialUsedAmount, setMaterialUsedAmount] = useState(boxItem?.materialUsedAmount);
  const [additionalCaution, setAdditionalCaution] = useState(boxItem?.additionalCaution);
  const [storeData, setStoreData] = useState(selectedArea);
  const [materialListOptions, setMaterialListOptions] = useState();
  const [internalStoreData, setInternalStoreData] = useState(selectedArea);
  const [selectedCuttingLayout, setSelectedCuttingLayout] = useState(defaultCuttingLayout);
  const [enableSelectingArea, setEnableSelectingArea] = useState(!!selectedArea);
  const { useGenCuttingLayoutQuery } = useProductionData();
  const { data: cuttingLayout, isFetching: isLoadingCuttingLayout } = useGenCuttingLayoutQuery(
    {
      materialId,
      productId,
      producedAmount,
      startX,
      startY,
      // startTextX,
      // startTextY,
      storeData,
    },
    {
      enabled: !!materialId,
    }
  );

  const { useFindRawMaterialQuery, useFindRawMaterialInventory, useFindRawMaterialInventorySupplier } = useMaterialData();
  const { data: materialList, isFetching: isLoadingMaterial, refetch: refetchMaterial } = useFindRawMaterialQuery({ filter: { type: 'RM' } });
  const { data: materialListInv, isFetching: isLoadingMaterialInv, refetch: refetchMaterialInv } = useFindRawMaterialInventory();
  const { data: materialListInvSup, isFetching: isLoadingMaterialInvSup, refetch: refetchMaterialInvSup } = useFindRawMaterialInventorySupplier();

  const cuttingLayoutOptions = useMemo(
    () =>
      cuttingLayout?.map((cl) => ({
        value: cl.item,
        label: cl.name,
      })),
    [cuttingLayout]
  );

  useEffect(() => {
    if (isRefetch) {
      refetchMaterialInv();
      refetchMaterialInvSup();
    }
  }, [isRefetch]);

  useEffect(() => {
    if (!isLoadingMaterial) {
      const findMaterial = materialList?.find((item) => item?.id === (producedItemData?.detail?.[0]?.materialId || boxItem?.materialId));

      if (findMaterial) {
        const filterMaterial = materialList?.filter((item) => item?.grossWeight === findMaterial?.grossWeight && item?.group === findMaterial?.group);

        if (filterMaterial.length > 0) {
          const mt = filterMaterial?.map((mat) => ({ value: mat.id, label: mat.name, type: mat.subtype }));
          setMaterialListOptions(mt);
        } else {
          setMaterialListOptions([findMaterial]?.map((mat) => ({ value: mat.id, label: mat.name, type: mat.subtype })));
        }
      } else {
        const findMat = materialList.find((item) => item?.id === boxItem?.materialId);
        const filterMaterial = materialList?.filter(
          (item) => item?.grossWeight === findMat?.grossWeight && item?.group === (producedItemData?.producedProductMaterialGroupCode || findMaterial?.group)
        );
        const mt = filterMaterial?.map((mat) => ({ value: mat.id, label: mat.name, type: mat.subtype }));
        setMaterialListOptions(mt);
      }
    }
  }, [isLoadingMaterial, materialList, producedItemData]);

  const handleOnMaterialChange = useCallback((value) => {
    console.debug('Material change :', value);
    setMaterialId(value);
    setSelectedCuttingLayout(null);
  }, []);

  const handleOnAdditionalCautionChange = useCallback((value) => {
    console.log('AdditionalCaution change :', value);
    setAdditionalCaution(value);
  }, []);

  const handleOnMaterialUsedAmountChange = useCallback((value) => {
    console.log('materialUsedAmount change :', value);
    setMaterialUsedAmount(Number(value));
  }, []);

  const handleProducedAmountChange = useCallback(
    (value) => {
      setAmountIsChanged(true);
      console.debug('handleProducedAmountChange :', value);
      console.log(value);
      onUpdate?.({
        boxId,
        materialId,
        producedAmount: value,
        cuttingLayout: selectedCuttingLayout,
        layoutDetail: cuttingLayout,
        additionalCaution,
        storeData,
      });
    },
    [setAmountIsChanged, onUpdate, boxId, materialId, selectedCuttingLayout, cuttingLayout, additionalCaution, storeData]
  );

  const handleSelectingAreaChange = useCallback(
    (size) => {
      if (!size) {
        setInternalStoreData(undefined);
        setEnableSelectingArea(false);
        return;
      }
      setEnableSelectingArea(true);
      console.debug('handleSelectingAreaChange :', size);

      const { cutWidth, cutLength } = size;
      const materialName = materialListOptions?.find((item) => item.value === materialId);

      const spli = selectedCuttingLayout?.grainSize.split('x');

      let cutWidthCN = cutWidth;
      let cutLengthCN = cutLength;
      if (cutWidth !== Number(spli[0])) {
        cutWidthCN = Number(spli[0]) - cutWidth;
      }
      if (cutLength !== Number(spli[1])) {
        cutLengthCN = Number(spli[1]) - cutLength;
      }

      // console.log(cutWidthCN);
      // console.log(cutLengthCN);

      // console.log(`${materialName?.label} (หัว ${Number(cutWidthCN).toFixed(2)} x ${Number(cutLengthCN).toFixed(2)} )`);
      setInternalStoreData({
        cutWidth,
        cutLength,
        name: `${materialName?.label} (หัว ${Number(cutWidthCN).toFixed(2)} x ${Number(cutLengthCN).toFixed(2)} )`,
      });
    },
    [materialId, materialListOptions, selectedCuttingLayout]
  );

  const handleConfirmSelectedArea = useCallback(() => {
    setStoreData(internalStoreData);
  }, [internalStoreData]);

  const handleOnCuttingLayoutChange = useCallback(
    (value) => {
      // console.debug('Cutting layout change :', value);
      const needle = cuttingLayout?.find((cl) => cl.item === value);
      // Get papersize from "grainSize"
      // Display on screen as [h x w] //
      let [h, w] = needle?.grainSize?.split('x');

      w = parseFloat(w, 10);
      h = parseInt(h, 10);

      setPaperWidth(w);
      setPaperHeight(h);

      if (producedItemData?.status !== undefined && producedItemData?.status === 'SUBMITTED' && producedItemData && boxItem) {
        const itemBoxSelect = producedItemData?.detail?.find((itemPd) => itemPd?.item === boxItem?.item);
        const item = itemBoxSelect?.layoutDetail?.find((i) => i.item === boxItem?.cuttingLayout?.item);
        setIsAdding(false);
        setSelectedCuttingLayout(item);
        // console.log(item);
        handleCalculateAmount(item);
      } else {
        setIsAdding(false);
        handleCalculateAmount(needle);
        setSelectedCuttingLayout(needle);
      }
    },
    [boxItem, cuttingLayout, handleCalculateAmount, producedItemData, setIsAdding]
  );

  // When cutting layout is changed then update `selectedCuttingLayout`.
  useEffect(() => {
    if (!selectedCuttingLayout || !cuttingLayout?.length) {
      return;
    }

    // if (producedItemData?.status !== undefined && producedItemData?.status === 'SUBMITTED') {
    // const itemBoxSelect = producedItemData.detail.find((itemPd) => itemPd.item === boxItem.item);
    // itemBoxSelect?.layoutDetail.forEach((itemLayout) => {
    //   cuttingLayout.forEach((itemCutting) => {
    //     if (itemLayout.item === itemCutting.item) {
    //       itemLayout.textXList = itemCutting.textXList;
    //       itemLayout.textYList = itemCutting.textYList;
    //       itemLayout.layoutList = itemCutting.layoutList;
    //     }
    //   });
    // });
    // console.log(selectedCuttingLayout);
    // console.log(itemBoxSelect?.layoutDetail);
    //   const itemBoxSelect = cuttingLayout.find((e) => e.item === selectedCuttingLayout.item);
    //   setSelectedCuttingLayout(itemBoxSelect);
    // } else {
    const itemBoxSelect = cuttingLayout.find((e) => e.item === selectedCuttingLayout.item);
    setSelectedCuttingLayout(itemBoxSelect);

    setSelectCuttingLayout?.(selectedCuttingLayout);
  }, [materialId, productId, producedAmount, cuttingLayout, selectedCuttingLayout]);

  // onUpdate
  useEffect(() => {
    onUpdate?.({ boxId, materialId, cuttingLayout: selectedCuttingLayout, layoutDetail: cuttingLayout, additionalCaution, storeData });
  }, [boxId, onUpdate, materialId, selectedCuttingLayout, cuttingLayout, additionalCaution, storeData]);

  useEffect(() => {
    if (onUpdateAdditionalPrintedAmount !== undefined) {
      const producedAmountCN =
        Math.ceil(onUpdateAdditionalPrintedAmount.additionalPrintedAmount / onUpdateAdditionalPrintedAmount?.cuttingPieces) *
          onUpdateAdditionalPrintedAmount?.cuttingPieces *
          onUpdateAdditionalPrintedAmount?.cavity +
        onUpdateAdditionalPrintedAmount?.produceAmount;
      handleProducedAmountChange(producedAmountCN);
      setIsEditing(false);
      setOnUpdateAdditionalPrintedAmount(undefined);
    }
  }, [onUpdateAdditionalPrintedAmount]);

  return (
    <Row className="style-to-print">
      <Col sm={12} md={6} lg={6}>
        <BoxDisplay
          layout={selectedCuttingLayout?.layoutList || []}
          textXList={selectedCuttingLayout?.textXList || []}
          textYList={selectedCuttingLayout?.textYList || []}
          width={width}
          height={height}
          paperX={startX}
          paperY={startY}
          paperWidth={paperWidth}
          paperHeight={paperHeight}
          producedItemData={producedItemData}
          enableSelectingArea={enableSelectingArea}
          storeData={internalStoreData}
          boxItem={boxItem}
          onSelectingAreaChange={handleSelectingAreaChange}
          onDisableDefault={onDisableDefault}
          fontSize={fontSize}
        />
      </Col>
      <Col sm={12} md={6} lg={6}>
        <Card border="border-dark" className={clx({ 'overlay-spinner': isLoading || isLoadingCuttingLayout || isLoadingMaterial })}>
          <Card className="p-3">
            <RightSide
              selectedMaterial={materialId}
              producedItemData={producedItemData}
              selectedCuttingLayout={selectedCuttingLayout}
              cuttingLayoutOptions={cuttingLayoutOptions}
              materialListOptions={materialListOptions}
              onMaterialChange={handleOnMaterialChange}
              boxList={boxList}
              formCalculateAmount={formCalculateAmount}
              onAdditionalCautionChange={handleOnAdditionalCautionChange}
              OnMaterialUsedAmountChange={handleOnMaterialUsedAmountChange}
              onCuttingLayoutChange={handleOnCuttingLayoutChange}
              producedAmount={producedAmount}
              onProducedAmountChange={handleProducedAmountChange}
              enableSelectingArea={enableSelectingArea}
              onSelectingAreaChange={handleSelectingAreaChange}
              storeData={internalStoreData}
              onConfirmSelectedArea={handleConfirmSelectedArea}
              boxItem={boxItem}
              isLoadingCuttingLayout={isLoadingCuttingLayout}
              idx={idx}
              boxLength={boxLength}
              InitialAmount={InitialAmount}
              materialListInv={materialListInv}
              materialListInvSup={materialListInvSup}
              isLoadingMaterialInv={isLoadingMaterialInv}
              errorMaterialUseAmount={errorMaterialUseAmount}
              setErrorMaterialUseAmount={setErrorMaterialUseAmount}
              isLoadingMaterialInvSup={isLoadingMaterialInvSup}
            />
          </Card>
        </Card>
      </Col>
    </Row>
  );
};

export default BoxItem;
