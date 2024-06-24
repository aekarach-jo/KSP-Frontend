import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useQuery } from 'react-query';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { Spinner } from 'react-bootstrap';

const supResponseTranformer = (response) => {
  return response.data;
};

const searchSupFn = async (query) => {
  const resp = await request({ url: `/masterData/supplier/find`, params: { name: query, limit: 10 } });

  return supResponseTranformer(resp).data;
};

const useSupAutocomplete = ({ query, ...queryOptions }) =>
  useQuery([`supAutocompleteData`, query], () => searchSupFn(query), {
    enabled:true,
    refetchOnWindowFocus: false,
    cacheTime: 0,
    ...queryOptions,
  });

const AutoCompleteSupplier = ({
  searchUrl,
  as,
  onChange,
  onSuggestionSelected,
  onSearch,
  enabledSearch = true,
  isLoading = false,
  value
  //
}) => {
  const [valueState, setValueState] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  console.log(valueState);

  const { data, isLoading: internalIsLoading } = useSupAutocomplete({ searchUrl, query: valueState, enabled: enabledSearch });

  isLoading = isLoading || internalIsLoading;

  useEffect(() => {
    if (data) {
      setSuggestions(data);
    }
  }, [data]);

  const internalOnChange = (event, { newValue }) => {
    setValueState(newValue);
    onChange?.(newValue);
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(valueState);
    }
  };

  const renderSuggestion = (suggestion) => <div>{suggestion?.name}</div>;

  const getSuggestionValue = (suggestion) => suggestion?.name || '';

  const onSuggestionsFetchRequested = ({ value: val }) => {
    // console.debug('onSuggestionsFetchRequested', val);

    setValueState(val);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleSuggestionSelected = (event, { suggestion }) => {
    // onSelect(suggestion);
    // console.debug('handleSuggestionSelected', suggestion);
    onSuggestionSelected?.(suggestion);
  };

  return (
    <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        focusInputOnSuggestionClick={false}
        inputProps={{
          placeholder: '',
          value: valueState,
          onChange: internalOnChange,
          onKeyPress,
          className: 'form-control',
        }}
        renderInputComponent={as}
        onSuggestionSelected={handleSuggestionSelected}
      />
      <span className="search-magnifier-icon" onClick={() => onSearch?.(valueState)}>
        {isLoading ? <Spinner as="span" size="sm" animation="border" style={{ marginTop: 9 }} /> : <CsLineIcons icon="search" />}
      </span>
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

export default AutoCompleteSupplier;
