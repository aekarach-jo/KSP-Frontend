import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import cls from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import useCustomerData from 'hooks/api/customer/useCustomerData';

const CustomerSearchAutocomplete = ({
  as,
  useSearchIcon = true,
  useShadow = false,
  useFormControl = false,
  inlineBlock = false,
  className = '',
  onChange,
  onSuggestionSelected,
  onSearch,
  value,
  placeholder,
  disabled = false,
  readOnly = false,
}) => {
  const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const { useSearchCustomerQuery, getCustomerReq } = useCustomerData();

  const { data, isLoading } = useSearchCustomerQuery({ filter: { name: valueState } });

  useEffect(() => {
    if (data) {
      setSuggestions(data);
    }
  }, [data]);

  /* useEffect(() => {
    if (value) {
      (async () => {
        const cus = await getCustomerReq(value);

        setValueState(cus.name);
      })().then();
    }
  }, [getCustomerReq, value]); */

  useEffect(() => {
    setValueState(value || '');
  }, [value]);

  const handleOnChange = useCallback(
    (_event, { newValue }) => {
      setValueState(newValue);
      onChange?.(_event, { newValue });
    },
    [onChange]
  );

  const onKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onSearch?.(valueState);
      }
    },
    [onSearch, valueState]
  );

  const renderSuggestion = useCallback((suggestion) => <div>{suggestion.name}</div>, []);

  const getSuggestionValue = useCallback((suggestion) => suggestion.name, []);

  // const getSuggestions = (value) => {
  //   /* const escapedValue = escapeRegexCharacters(value.trim());
  //   if (escapedValue === '') {
  //     return [];
  //   }
  //   const regex = new RegExp(`^${escapedValue}`, 'i');
  //   return data.filter((product) => regex.test(product.name)); */

  //   console.debug('getSuggestions', value);
  //   return [];
  // };

  const onSuggestionsFetchRequested = useCallback(({ value: val }) => {
    // console.debug('onSuggestionsFetchRequested', val);

    setValueState(val);
  }, []);

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const handleSuggestionSelected = useCallback(
    (_event, { suggestion }) => {
      // console.debug('handleSuggestionSelected', suggestion);
      onSuggestionSelected?.(suggestion);
    },
    [onSuggestionSelected]
  );

  const handleSearchIconClick = useCallback(() => onSearch?.(valueState), [onSearch, valueState]);

  const autosuggestInputProps = useMemo(
    () => ({
      value: valueState,
      onChange: handleOnChange,
      onKeyPress,
      disabled,
      readOnly,
      placeholder: readOnly || disabled ? '' : placeholder,
    }),
    [disabled, handleOnChange, onKeyPress, placeholder, readOnly, valueState]
  );

  const autosuggesContainerProps = useMemo(
    () => ({ className: cls({ 'form-control': useFormControl }), readOnly, disabled }),
    [disabled, readOnly, useFormControl]
  );

  return (
    <div
      className={cls(
        'search-input-container bg-foreground',
        {
          'd-inline-block': inlineBlock,
          shadow: useShadow,
        },
        className
      )}
    >
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        focusInputOnSuggestionClick={false}
        inputProps={autosuggestInputProps}
        containerProps={autosuggesContainerProps}
        renderInputComponent={as}
        onSuggestionSelected={handleSuggestionSelected}
      />
      {useSearchIcon && (
        <span className="search-magnifier-icon" onClick={handleSearchIconClick}>
          <CsLineIcons icon="search" />
        </span>
      )}
      {/* <span
        className={classNames('search-delete-icon', {
          'd-none': !valueState,
        })}
      >
        <CsLineIcons icon="close" />
      </span> */}
    </div>
  );
};

export default CustomerSearchAutocomplete;
