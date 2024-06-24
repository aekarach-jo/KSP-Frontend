import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue, typeList, typeMessage = 'W') {
  const typeFilter = typeList.filter((item) => item.code === typeMessage);
  const optionFilter = lovList.filter((item) => typeFilter.some((item2) => item2.id === item.mainLinkId));
  return (optionFilter || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovDefectSelect = ({ name, value, lov, lovLabel = 'name', lovValue = 'id', isClearable, isDisabled, onChange, placeholder, menuPlacement, typeMessage, ...props }) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useDefectLov, useDefectType } = useProductLovData();
  const { data, isFetching, refetch } = useDefectLov({ isGroup: true });
  const { data: typeList } = useDefectType({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue, typeList || [], typeMessage);
  }, [data, lov, lovLabel, lovValue, typeList]);

  useEffect(() => {
    refetch();
    if (!isFetching) {
      props.setValueChange(false);
    }
  }, [props.valueChange]);

  useEffect(() => {
    const findOption = [];
    if (value !== '') {
      console.log(value);
      options.forEach((dataI) => {
        value.forEach((dataJ) => {
          if (dataJ === dataI.detail.code) {
            findOption.push(dataI);
          }
        });
      });
    }
    if (findOption.length) {
      setInternalValue(findOption);
    }

    refetch();
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      setInternalValue(e);
      onChange?.(e);
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
      onChange={internalOnChange}
    />
  );
};

export default LovDefectSelect;
