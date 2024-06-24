import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useOutsourceData from 'hooks/api/master/lov/useOutsource';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, lovDetail = 'detail') {
  const newList = [];
  const productIdSet = new Set();
  lovList.forEach((val) => {
    val.productSubType.forEach((val0) => {
      val0?.itemList?.forEach((val1) => {
        if (!productIdSet.has(val1.productId)) {
          productIdSet.add(val1.productId);
          newList.push({ productId: val1.productId, productName: val1.productName, detail: val1 });
        }
      });
    });
  });
  return (newList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov[lovDetail],
  }));
}

const LovOutsourceSelect = ({
  name,
  value,
  lov,
  lovLabel = 'productName',
  lovValue = 'productId',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);
  const { useProductPlan } = useOutsourceData();
  const { data, isFetching } = useProductPlan({ isGroup: true });
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);
  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    setInternalValue(findOption);
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
    },
    [onChange]
  );

  return (
    <Select
      name={name}
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={options}
      isLoading={isFetching}
      {...props}
      isClearable={isClearable}
      placeholder={selectPlaceholder}
      menuPlacement={menuPlacement}
      value={internalValue}
      onChange={internalOnChange}
    />
  );
};

export default LovOutsourceSelect;
