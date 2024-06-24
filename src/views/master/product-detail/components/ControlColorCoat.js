import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';


const ControlColorCoat = ({
  name,
  value,
  lov,
  lovLabel = 'name',
  lovValue = 'code',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useProductColorCoat } = useProductLovData();
  const { data, isFetching, refetch } = useProductColorCoat({ isGroup: true });
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  useEffect(() => {
    refetch();
    if (!isFetching) {
      props.setValueChange(false);
    }
  }, [props.valueChange]);

  useEffect(() => {
    const findOption = [];
    options.forEach((dataI) => {
      value.forEach((dataJ) => {
        if (dataJ === dataI.value) {
          findOption.push(dataI);
        }
      });
    });
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
    <Form.Control
      type="text"
      name={name} //
      value={internalValue}
      readOnly
    />
  );
};

export default ControlColorCoat;
