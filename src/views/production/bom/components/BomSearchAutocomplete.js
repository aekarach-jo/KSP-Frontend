import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useQuery } from 'react-query';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { DebounceInput } from 'react-debounce-input';

const bomResponseTransformer = (response) => {
  return response.data;
};

const searchBomFn = async (query) => {
  const resp = await request({
    url: `/bom/find`,
    params: { name: query, limit: 10 },
  });

  return bomResponseTransformer(resp).data;
};

const useBomAutocomplete = ({ query, enabled = true }) =>
  useQuery([`rmAutocompleteData`, query], () => searchBomFn(query), {
    enabled: enabled && !!query,
    refetchOnWindowFocus: false,
    cacheTime: 0,
  });

const BomSearchAutocomplete = ({ as, onSuggestionSelected, onSearch }) => {
  // const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // const { data, isLoading } = useBomAutocomplete({ query: valueState, enabled: false });

  /* useEffect(() => {
    if (data) {
      setSuggestions(data);
    }
  }, [data]); */

  const onChange = (event) => {
    // console.debug('onChange : ', event);
    // setValueState(event.target.value);
    onSearch?.(event.target.value);
  };

  /* const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(valueState);
    }
  }; */

  const renderSuggestion = (suggestion) => <div>{suggestion?.name}</div>;

  const getSuggestionValue = (suggestion) => suggestion?.name || '';

  const onSuggestionsFetchRequested = ({ value: val }) => {
    // setValueState(val);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleSuggestionSelected = (event, { suggestion }) => {
    onSuggestionSelected?.(suggestion);
  };

  return (
    <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
      {/* <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        focusInputOnSuggestionClick={false}
        inputProps={{
          placeholder: '',
          value: valueState,
          onChange,
          onKeyPress,
        }}
        renderInputComponent={as}
        onSuggestionSelected={handleSuggestionSelected}
      /> */}
      <DebounceInput element={as} onChange={onChange} debounceTimeout={400} />
      <span className="search-magnifier-icon">
        <CsLineIcons icon="search" />
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

export default BomSearchAutocomplete;
