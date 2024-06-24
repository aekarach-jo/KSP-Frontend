import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useOutsourceData from 'hooks/api/master/lov/useOutsource';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, bomList) {
  const optionFilter = lovList.filter((item) => !bomList.some((item2) => item.id === item2.bomId));
  return (optionFilter || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovBOMSelect = ({
  name,
  value,
  lov,
  lovLabel = 'name',
  lovValue = 'id',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  bomList,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState(value);
  const { useBOMData } = useOutsourceData();
  const { data, isFetching } = useBOMData({ bomlist: bomList, isGroup: true });
  const [dataList, setDataList] = useState([]);
  const [arr, setArr] = useState([]);

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = () => {
    if (!isFetching) {
      const filter = mapOptions(data || [], lovLabel, lovValue, bomList);
      setDataList(filter);
      const findOption = data?.find((item) => item.id === value);
      if (findOption !== undefined) {
        setInternalValue({ value: findOption.id, label: findOption.name });
      }
      console.log(findOption);
    }
  };
  // const options = useMemo(() => {
  // return mapOptions(data || [], lovLabel, lovValue, bomList);
  // }, [data, lov, lovLabel, lovValue, bomList]);

  useEffect(() => {
    options();
  }, [data, lov, lovValue, value]);

  const internalOnChange = useCallback(
    (e) => {
      onChange?.(e);
    },
    [onChange]
  );
  return (
    <Select
      name={name} //
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={dataList}
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

export default LovBOMSelect;
