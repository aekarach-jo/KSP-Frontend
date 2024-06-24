import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, isCode, value, materialProductType) {
  if (isCode) {
    lovLabel = 'code';
    lovList = lovList?.filter((data) => data.id !== value);
  }
  let filterSupplier = lovList.filter((data) => !data.isSale);
  if (materialProductType === 'productSelect') {
    filterSupplier = lovList.filter((data) => !data.isSupplier);
  }
  return (filterSupplier || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovStoreLocationMatSelect = ({
  name,
  value,
  lov,
  lovLabel = 'storeLocationName',
  lovValue = 'storeLocationId',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  isCode = false,
  menuPlacement,
  materialProductType,
  productId,
  productPiecePerPack,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useStoreLocationLovMat } = useProductLovData();
  const { data, isFetching } = useStoreLocationLovMat({ productId, productPiecePerPack, isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue, isCode, value, materialProductType);
  }, [data, lov, lovLabel, lovValue, materialProductType]);

  // useEffect(() => {
  //   let findOption = options?.find((item) => item.value === value);
  //   console.log(options, value);
  //   if (findOption === undefined) {
  //     findOption = '';
  //   }
  //   setInternalValue(findOption);
  // }, [lov, lovValue, options, value, data]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
      setInternalValue(e);
    },
    [onChange]
  );
  return (
    <Select
      name={name} //
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={options}
      isLoading={isFetching}
      {...props}
      isClearable={isClearable}
      placeholder={selectPlaceholder}
      menuPlacement={menuPlacement}
      value={internalValue}
      isMulti={props.isMulti}
      onChange={internalOnChange}
    />
  );
};

export default LovStoreLocationMatSelect;
