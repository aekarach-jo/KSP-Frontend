import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovType, lovLabel, lovValue, lov) {
  const type = lovType.find((data) => data?.code === lov);
  const list = lovList.filter((data) => data?.mainLinkId === type?.id);
  return (list || []).map((l) => ({
    label: l[lovLabel],
    value: l[lovValue],
    linkStep: Number(l.linkStep),
  }));
}

const LovDefectSelectMulti = ({
  name,
  value,
  lov = 'W',
  lovLabel = 'name',
  lovValue = 'id',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  step = undefined,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useDefectLov, useDefectType } = useProductLovData();
  const { data, isFetching } = useDefectLov({ isGroup: true });
  const { data: type } = useDefectType({ isGroup: true });

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    return mapOptions(data || [], type || [], lovLabel, lovValue, lov);
  }, [data, lov, lovLabel, lovValue, type]);

  useEffect(() => {
    const list = value;
    if (step === undefined) {
      if (Array.isArray(list)) {
        const newArr = [];
        options?.forEach((item) => {
          list.forEach((id) => {
            if (item?.value === (id?.value || id)) {
              newArr.push(item);
            }
          });
        });
        setInternalValue(newArr);
      } else {
        const findValue = options?.find((item) => item?.value === (value?.value || value));
        setInternalValue(findValue);
      }
    } else {
      const findValue = options?.filter((item) => item?.linkStep === step);
      setInternalValue(findValue);
    }
  }, [lov, lovValue, options, value]);

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
      options={options}
      {...props}
      isClearable={isClearable}
      placeholder={selectPlaceholder}
      menuPlacement={menuPlacement}
      value={internalValue}
      onChange={internalOnChange}
    />
  );
};
export default LovDefectSelectMulti;
