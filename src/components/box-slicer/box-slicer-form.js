/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, FormControl, FormLabel, InputGroup, Row } from 'react-bootstrap';
import Select from 'react-select';
import NumberFormat from 'react-number-format';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import LovCautionListSelect from 'components/lov-select/LovDefectSelectMulti';
import ManageMessageModalAdd from 'components/modal/ManageMessageModalAdd';
import useConvertUOM from 'hooks/useConvertUOM';

const checkNumber = (value = '') => {
  return !Number.isNaN(Number(value));
};

const BoxSlicerForm = ({
  selectedCuttingLayout,
  selectedMaterial,
  cuttingLayoutOptions = [],
  materialListOptions = [],
  onMaterialChange,
  onCuttingLayoutChange,
  producedAmount,
  onProducedAmountChange,
  onAdditionalCautionChange,
  OnDeviationPercentageChange,
  enableSelectingArea,
  onSelectingAreaChange,
  onConfirmSelectedArea,
  producedItemData,
  boxItem,
  boxList,
  formCalculateAmount,
  boxLength,
  storeData,
  InitialAmount,
  isLoadingCuttingLayout,
  materialListInv,
  materialListInvSup,
  isLoadingMaterialInv,
  isLoadingMaterialInvSup,
  errorMaterialUseAmount,
  setErrorMaterialUseAmount,
}) => {
  const { formatMessage: f, formatNumber } = useIntl();
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const [isShowMessage, setShowMessage] = useState(false);
  const [valueChangeCaution, setValueChangeCaution] = useState(false);
  const [internalStoreData, setInternalStoreData] = useState({});
  const [maxRmSize, setMaxRmSize] = useState({ cutWidth: 0, cutLength: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [producedAmountBegin, setProducedAmount] = useState();
  const { useConvertReamToSheet, useConvertSheetToReam } = useConvertUOM();

  const initialValues = {
    rawMaterialId: selectedMaterial || '',
    cuttingLayoutId: selectedCuttingLayout?.item,
    producedProductName: producedItemData?.producedProductName,
    lotNo: producedItemData?.no,
    deviationPercentage: boxItem?.deviationPercentage || '',
    additionalCaution: boxItem?.additionalCaution || '',
    materialUsedAmount: useConvertSheetToReam({ value: boxItem?.cuttingLayout?.materialUsedAmount }) || { ream: '', sheet: '' },
    paperHead: { label: 'หัวกระดาษ', value: 'หัวกระดาษ' } || '',
    status: producedItemData?.status,
    matInv: (!isLoadingMaterialInv && materialListInv.find((data) => data.materialId === selectedMaterial)) || 0,
    matInvSup: (!isLoadingMaterialInvSup && materialListInvSup.find((data) => data.materialId === selectedMaterial)) || 0,
  };

  const validationSchema = Yup.object();
  const onSubmit = (values) => {
    console.log(values);
    //
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, resetForm, setFieldValue, values, touched, errors } = formik;

  // useEffect(() => {
  //   if (!isLoadingMaterialInv && !isLoadingMaterialInvSup) {
  //     const matInv = materialListInv.find((data) => data.materialId === values.rawMaterialId);
  //     const matInvSup = materialListInvSup.find((data) => data.materialId === values.rawMaterialId);
  //     handleChange({ target: { id: 'matInv', value: matInv?.amount || 0 } });
  //     handleChange({ target: { id: 'matInvSup', value: matInvSup?.amount || 0 } });
  //   }
  // }, [materialListInv, materialListInvSup, values.rawMaterialId]);

  useEffect(() => {
    if (!selectedCuttingLayout) return;
    const { grainSize } = selectedCuttingLayout;

    if (!grainSize) return;
    // console.log(selectedCuttingLayout.materialPurchaseAmount);

    const useConvertToSheet = useConvertReamToSheet({ value: selectedCuttingLayout.materialPurchaseAmount });

    selectedCuttingLayout.materialPurchaseAmountValue = useConvertToSheet;

    const [cutWidth, cutLength] = grainSize.split('x').map((a) => Number(a.trim()));
    setMaxRmSize({ cutLength, cutWidth });
  }, [selectedCuttingLayout]);

  const handleMaterialChange = useCallback(
    ({ value }) => {
      setFieldValue('rawMaterialId', value);
      setFieldValue('cuttingLayoutId', null);
      onMaterialChange?.(value);
    },
    [onMaterialChange, setFieldValue]
  );

  const handleCuttingLayoutChange = useCallback(
    ({ value }) => {
      setFieldValue('cuttingLayoutId', value);
      onCuttingLayoutChange?.(value);
    },
    [onCuttingLayoutChange, setFieldValue]
  );

  const handleMaterialUseChange = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks

    // const useConvertValueToReam = useConvertSheetToReam({ value: values?.materialUsedAmount.sheet });
    // const useConvertToSheet = useConvertReamToSheet({ value: values?.materialUsedAmount.ream });
    setIsEditing(false);
    const useConvertToReam = useConvertSheetToReam({ value: values?.materialUsedAmount.sheet });
    const totalReam = Number(values?.materialUsedAmount?.ream) + Number(useConvertToReam?.ream);
    const toTotalSheet = totalReam * 500 + useConvertToReam?.sheet;

    if (boxItem?.cuttingLayout.materialUsedAmount !== undefined) {
      const mua = Number(toTotalSheet * selectedCuttingLayout?.cavity * selectedCuttingLayout?.cuttingPieces);
      onProducedAmountChange(mua);
    } else {
      console.log('');
      if (values?.materialUsedAmount === 0) {
        const materialUsedAmount = Number(selectedCuttingLayout?.materialUsedAmount);
      } else {
        const materialUsedAmount = values?.materialUsedAmount || 0;
        const materialUse = Number(selectedCuttingLayout?.materialUsedAmount) + Number(materialUsedAmount);
      }
    }
  };

  const handleMaterialUse = (e) => {
    if (/^[0-9]*$/.test(e.target.value)) {
      setIsEditing(true);
      handleChange({ target: { id: 'materialUsedAmount.sheet', value: Number(e.target.value) } });
    }
  };

  const handleMaterialReamUse = (e) => {
    if (/^[0-9]*$/.test(e.target.value)) {
      setIsEditing(true);
      handleChange({ target: { id: 'materialUsedAmount.ream', value: Number(e.target.value) } });
    }
  };

  const handleDeviationChange = (e) => {
    if (/^[0-9]*$/.test(e.target.value)) {
      handleChange({ target: { id: 'deviationPercentage', value: e.target.value } });
    }
  };

  const handleChangeCautionList = (e) => {
    const aditionalCautionList = e;
    handleChange({ target: { id: 'aditionalCaution', aditionalCautionList } });
    onAdditionalCautionChange(aditionalCautionList);
  };

  const toggleManageAddModal = useCallback(() => {
    setShowMessage((prev) => !prev);
  }, []);

  const handleSelectingAreaChange = useCallback(
    (e) => {
      if (!e.target.checked) {
        return onSelectingAreaChange?.(null);
      }

      return onSelectingAreaChange?.({ ...(storeData || {}) });
    },
    [onSelectingAreaChange, storeData]
  );

  const createHandleSelectAreaChange = useCallback(
    (field) => (e) => {
      setInternalStoreData((prev) => {
        let newValue = +e.target.value;

        if (e.target.value === '' || Number.isNaN(newValue)) return prev;

        if (newValue > maxRmSize[field]) {
          newValue = maxRmSize[field];
        }
        return {
          ...maxRmSize,
          [field]: newValue,
        };
      });
    },
    [maxRmSize]
  );

  const handleCutWidthChange = useMemo(() => createHandleSelectAreaChange('cutWidth'), [createHandleSelectAreaChange]);
  const handleCutLengthChange = useMemo(() => createHandleSelectAreaChange('cutLength'), [createHandleSelectAreaChange]);

  const handleSelectAreaBlur = useCallback(
    (e) => {
      if ((e.type === 'keypress' && e.key !== 'Enter') || e.type === 'blur') {
        return;
      }

      setInternalStoreData((prev) => {
        const { cutWidth, cutLength } = prev;
        if (checkNumber(cutWidth) && checkNumber(cutLength)) {
          setTimeout(() => {
            onSelectingAreaChange?.({
              cutWidth: Number(cutWidth),
              cutLength: Number(cutLength),
            });
          }, 1);
        }
        return prev;
      });
    },
    [onSelectingAreaChange]
  );

  const handleClickConfirmStoreData = () => {
    setInternalStoreData((prev) => {
      const { cutWidth, cutLength } = prev;
      if (checkNumber(cutWidth) && checkNumber(cutLength)) {
        setTimeout(() => {
          onSelectingAreaChange?.({
            cutWidth: Number(cutWidth),
            cutLength: Number(cutLength),
          });
        }, 1);
      }
      return prev;
    });

    onConfirmSelectedArea();
  };

  const rawMaterialValue = useMemo(() => materialListOptions.filter((mat) => mat.value === values.rawMaterialId), [materialListOptions, values.rawMaterialId]);
  const cuttingLayoutValue = useMemo(
    () => cuttingLayoutOptions.filter((cl) => cl.value === values.cuttingLayoutId) || null,
    [cuttingLayoutOptions, values.cuttingLayoutId]
  );

  useEffect(() => {
    const cuttingLayout = cuttingLayoutValue;
    if (cuttingLayout.length > 0 && !isLoadingCuttingLayout) {
      handleCuttingLayoutChange({ value: producedItemData?.productDefaultLayout || cuttingLayout[0].value });
    }
    if (cuttingLayout.length === 0 && cuttingLayoutOptions.length > 0 && !isLoadingCuttingLayout) {
      handleCuttingLayoutChange(cuttingLayoutOptions[0]);
    }
  }, [isLoadingCuttingLayout]);

  useEffect(() => {
    if (boxLength > 1) {
      const difference = (producedItemData.producedAmount || producedItemData?.amount) - (selectedCuttingLayout?.producedAmount || InitialAmount || 0);
      setProducedAmount((producedItemData.producedAmount || producedItemData?.amount) - (difference || 0));
    } else {
      setProducedAmount(producedItemData?.producedAmount || producedItemData?.amount);
    }
  }, [producedItemData, boxLength]);

  useEffect(() => {
    const useConvertToReam = useConvertSheetToReam({ value: values?.materialUsedAmount.sheet });
    const totalReam = Number(values?.materialUsedAmount?.ream) + Number(useConvertToReam?.ream);

    if ((totalReam || 0) + useConvertToReam.sheet / 500 > selectedCuttingLayout?.materialAvailableAmount && rawMaterialValue[0]?.type === 'RE') {
      setErrorMaterialUseAmount(true);
    } else {
      setErrorMaterialUseAmount(false);
    }
  }, [values.materialUsedAmount]);

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col sm="12" md="12" lg="3">
          <FormLabel>{f({ id: 'production.produce.lot' })}</FormLabel>
        </Col>
        <Col sm="12" md="12" lg="9">
          {values?.lotNo !== undefined ? <div>{values?.lotNo}</div> : <div style={{ background: '#aeaeae' }}> </div>}
        </Col>
      </Row>
      <Row>
        <Col sm="12" md="12" lg="12">
          <FormLabel>{f({ id: 'production.produce.raw-material' })}</FormLabel>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col sm="12" md="12" lg="12">
          <Select
            classNamePrefix="react-select"
            options={materialListOptions}
            name="rawMaterialId"
            onChange={handleMaterialChange}
            value={rawMaterialValue}
            isDisabled={values.status === 'SUBMITTED'}
            isInvalid={errors.rawMaterialId && touched.rawMaterialId}
          />
        </Col>
      </Row>
      <Row>
        <Col sm="12" md="12" lg="6">
          <Row>
            <Col sm="12" md="6" lg="6">
              <FormLabel>{f({ id: 'production.produce.supplier-inv' })} : </FormLabel>
            </Col>
            <Col sm="12" md="6" lg="6">
              {values?.matInvSup?.availableAmount || 0}
            </Col>
          </Row>
        </Col>
        <Col sm="12" md="12" lg="6">
          <Row>
            <Col sm="12" md="6" lg="6">
              <FormLabel>{f({ id: 'production.produce.KSP-inv' })} : </FormLabel>
            </Col>
            <Col sm="12" md="6" lg="6">
              {rawMaterialValue[0]?.type === 'RE' ? <> {selectedCuttingLayout?.materialAvailableAmount || 0}</> : <> {values?.matInv?.availableAmount || 0}</>}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col sm="12" md="12" lg="12">
          <FormLabel className="required">{f({ id: 'production.produce.cutting-layout' })}</FormLabel>
          <Select
            classNamePrefix="react-select"
            options={cuttingLayoutOptions}
            name="cuttingLayoutId"
            onChange={handleCuttingLayoutChange}
            value={cuttingLayoutValue}
            isDisabled={values.status === 'SUBMITTED'}
          />
        </Col>
      </Row>
      <Row className="mb-3 style-to-print">
        <Col sm="12" md="12" lg="12">
          <FormLabel>{f({ id: 'production.produce.material-use-amount' })}</FormLabel>
          <Row>
            <Col sm="5" md="5" lg="5">
              <InputGroup>
                <Form.Control
                  type="text"
                  name="materialUsedAmount"
                  className="text-center"
                  onChange={handleMaterialReamUse}
                  value={values?.materialUsedAmount?.ream}
                  disabled={values.status === 'SUBMITTED'}
                />
                <InputGroup.Text id="inputGroup-sizing-sm">{f({ id: 'production.produce.material-unit-ream' })}</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col sm="5" md="5" lg="5">
              <InputGroup>
                <Form.Control
                  type="text"
                  name="materialUsedAmount"
                  className="text-center"
                  onChange={handleMaterialUse}
                  value={values?.materialUsedAmount?.sheet}
                  disabled={values.status === 'SUBMITTED'}
                />
                <InputGroup.Text id="inputGroup-sizing-sm">{f({ id: 'production.produce.material-unit-sheets' })}</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col sm="1" md="1" lg="1">
              <Button
                variant="outline-info"
                size="sm"
                disabled={values.status === 'SUBMITTED' || !isEditing || errorMaterialUseAmount}
                className="btn-icon mt-1"
                onClick={handleMaterialUseChange}
              >
                <CsLineIcons icon="edit" />
              </Button>
            </Col>
            {errorMaterialUseAmount && (
              <Col sm="12" md="12" lg="12">
                <div className="d-block invalid-feedback">{f({ id: 'production.produce.add-dialog.error.not-enough' })}</div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      <Row className="mt-2 style-to-print">
        <Col md={6}>
          <div className=" text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel>{f({ id: 'production.produce.material-pi' })}</FormLabel>:{' '}
              <>
                <b>{Number(selectedCuttingLayout?.materialPurchaseAmountValue?.ream) || 0}</b>
                <> {f({ id: 'production.produce.amount-unit' })}</> <b>{Number(selectedCuttingLayout?.materialPurchaseAmountValue?.sheet) || 0}</b>
                <> {f({ id: 'production.produce.print-amount-unit' })}</>
              </>
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className=" text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel>{f({ id: 'production.produce.print-amount' })}</FormLabel>:{' '}
              <b>{selectedCuttingLayout?.printedAmount.toFixed(0) || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
              {/* {selectedCuttingLayout?.printedAmount.toFixed(0)} */}
            </span>
          </div>
        </Col>
      </Row>
      <Row className='style-to-print'>
        <Col md={6}>
          <div className="mb-1 text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel>{f({ id: 'production.produce.availableAmount' })}</FormLabel>: <b>{selectedCuttingLayout?.materialAvailableAmount}</b>
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-1 text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel>{f({ id: 'production.produce.cavity' })}</FormLabel>:{' '}
              <b>{selectedCuttingLayout?.cavity || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
            </span>
          </div>
        </Col>
      </Row>
      <Row className="mb-1 style-to-print">
        <Col md={6}>
          <div className="mb-1 text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel>{f({ id: 'production.produce.size' })}</FormLabel>:{' '}
              <b>{selectedCuttingLayout?.grainSize || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-1 text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel>{f({ id: 'production.produce.produce-amount-detail' })}</FormLabel>:{' '}
              <b>{selectedCuttingLayout?.producedAmount || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
              {/* <NumberFormat className="form-control" thousandSeparator="," value={selectedCuttingLayout?.producedAmount} decimalSeparator="." prefix="" /> */}
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-1 text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel> {f({ id: 'production.produce.cutting-pieces' })}</FormLabel>:{' '}
              <b>{selectedCuttingLayout?.cuttingPieces || <CsLineIcons icon="question-hexagon" className=" me-2" size="18" />}</b>
              {f({ id: 'production.produce.cutting-pieces-unit' })}
            </span>
          </div>
        </Col>

        <Col md={6}>
          <div className="mb-0 text-hover-body">
            <CsLineIcons icon="circle" className="mb-2 me-2" size="18" />
            <span className="align-middle ">
              <FormLabel> {f({ id: 'production.produce.efficiency' })}</FormLabel>: <b>{(selectedCuttingLayout?.efficiency || 0).toFixed(2)} %</b>
            </span>
          </div>
        </Col>
      </Row>
      <>
        <Row className="mb-1">
          <Col lg="9" md="9" sm="9">
            <div>{f({ id: 'production.produce.warning' })}</div>
          </Col>
          <Col lg="3" md="3" sm="3" style={{ textAlign: 'right' }} hidden={values.status === 'SUBMITTED'}>
            <CsLineIcons className="text-primary" icon="plus" />
            <a href="#" onClick={toggleManageAddModal}>
              {f({ id: 'product.field.warning' })}
            </a>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <Form.Group className="position-relative tooltip-end-top" controlId="warning">
              <LovCautionListSelect
                classNamePrefix="react-select"
                name="cautionList"
                isClearable
                lov="W"
                onChange={handleChangeCautionList}
                value={values.additionalCaution || ''}
                isDisabled={values.status === 'SUBMITTED'}
                isMulti
                required
              />
            </Form.Group>
          </Col>
        </Row>
      </>

      <Col className="m-2" xs={12} />
      {values.status !== 'SUBMITTED' ? (
        <Row md={6} className=" d-flex flex-row justify-content-between">
          <Form.Check
            type="switch"
            label="ตัดบางส่วน"
            className="ms-2 pt-3 w-50"
            id="enableSelectingArea"
            name="enableSelectingArea"
            checked={enableSelectingArea || false}
            onChange={handleSelectingAreaChange}
          />
          {storeData && (
            <>
              <Select
                classNamePrefix="react-select"
                className="pt-2 w-25"
                options={[
                  { label: 'หัวกระดาษ', value: 'หัวกระดาษ' },
                  { label: 'เศษ', value: 'เศษ' },
                ]}
                name="paperHead"
                onChange={(e) => handleChange({ target: { id: 'paperHead', value: e } })}
                value={values.paperHead}
                isDisabled={values.status === 'SUBMITTED'}
              />
              <InputGroup className="my-2 w-50">
                <Form.Control
                  type="number"
                  className="text-field"
                  value={internalStoreData?.cutWidth || storeData?.cutWidth || ''}
                  style={{
                    textAlign: 'center',
                  }}
                  min={0}
                  max={maxRmSize.cutWidth}
                  step="0.1"
                  onChange={handleCutWidthChange}
                  onBlur={handleSelectAreaBlur}
                  onKeyPress={handleSelectAreaBlur}
                />
                <InputGroup.Text>x</InputGroup.Text>
                <Form.Control
                  type="number"
                  className="text-field"
                  value={internalStoreData?.cutLength || storeData?.cutLength || ''}
                  style={{
                    textAlign: 'center',
                  }}
                  min={0}
                  max={maxRmSize.cutLength}
                  step="0.1"
                  onChange={handleCutLengthChange}
                  onBlur={handleSelectAreaBlur}
                  onKeyPress={handleSelectAreaBlur}
                />
              </InputGroup>

              {enableSelectingArea && (
                <Button className="h-50 " style={{ margin: '8px 14px', width: '21%' }} onClick={handleClickConfirmStoreData}>
                  Confirm
                </Button>
              )}
            </>
          )}
        </Row>
      ) : (
        <Row md={6} className=" d-flex flex-row justify-content-between">
          {storeData && (
            <>
              <Form.Check
                type="switch"
                label="ตัดบางส่วน"
                className="ms-2 pt-3 w-20"
                id="enableSelectingArea"
                name="enableSelectingArea"
                checked={enableSelectingArea || false}
                onChange={handleSelectingAreaChange}
                disabled={values.status === 'SUBMITTED'}
              />

              <InputGroup className="my-2 w-50">
                <Form.Control
                  disabled={values.status === 'SUBMITTED'}
                  type="number"
                  className="text-field"
                  value={internalStoreData?.cutWidth || storeData?.cutWidth || ''}
                  style={{
                    textAlign: 'center',
                  }}
                  min={0}
                  max={maxRmSize.cutWidth}
                  step="0.1"
                  onChange={handleCutWidthChange}
                  onBlur={handleSelectAreaBlur}
                  onKeyPress={handleSelectAreaBlur}
                />
                <InputGroup.Text>x</InputGroup.Text>
                <Form.Control
                  disabled={values.status === 'SUBMITTED'}
                  type="number"
                  className="text-field"
                  value={internalStoreData?.cutLength || storeData?.cutLength || ''}
                  style={{
                    textAlign: 'center',
                  }}
                  min={0}
                  max={maxRmSize.cutLength}
                  step="0.1"
                  onChange={handleCutLengthChange}
                  onBlur={handleSelectAreaBlur}
                  onKeyPress={handleSelectAreaBlur}
                />
              </InputGroup>
              <Select
                classNamePrefix="react-select"
                className="pt-2 w-25"
                options={[
                  { label: 'หัวกระดาษ', value: 'หัวกระดาษ' },
                  { label: 'เศษ', value: 'เศษ' },
                ]}
                name="paperHead"
                onChange={(e) => handleChange({ target: { id: 'paperHead', value: e } })}
                value={values.paperHead}
                isDisabled
              />
            </>
          )}
        </Row>
      )}
      <ManageMessageModalAdd setValueChange={setValueChangeCaution} show={isShowMessage} setShowModal={setShowMessage} hide={toggleManageAddModal} />
    </Form>
  );
};

export default BoxSlicerForm;
