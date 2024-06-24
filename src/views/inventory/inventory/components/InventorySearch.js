import React, { useCallback, useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useQuery } from 'react-query';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { Form, Spinner } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { useAsyncDebounce } from 'react-table';

const rmResponseTranformer = (response) => {
  return response.data;
};

const searchRmFn = async (query) => {
  const data1 = await request({ url: '/inventory/material/find', params: { name: query, limit: 10 } });
  const data2 = await request({ url: '/inventory/product/find', params: { name: query, limit: 10 } });

  // Combine data1 and data2
  const combinedData = {
    data: [...data1.data.data, ...data2.data.data],
    // pagination: {
    //   totalPage: data1.data.pagination.totalPage + data2.data.pagination.totalPage,
    // },
  };
  combinedData.data.forEach((element) => {
    if (element.materialId === undefined) {
      element.materialCode = element.productCode;
      element.materialName = element.productName;
    }
  });
  console.log(combinedData);
  return combinedData;
};

const useRmAutocomplete = ({ query, ...queryOptions }) =>
  useQuery([`rmAutocompleteData`, query], () => searchRmFn(query), {
    enabled: !!query,
    refetchOnWindowFocus: false,
    cacheTime: 0,
    ...queryOptions,
  });

const InventorySearch = ({
  searchUrl,
  as,
  onChange,
  onSuggestionSelected,
  onSearch,
  enabledSearch = true,
  isLoading = false,
  placeholder,
  setFilter,
  //
}) => {
  const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { formatMessage: f } = useIntl();

  // const { data, isLoading: internalIsLoading } = useRmAutocomplete({ searchUrl, query: valueState, enabled: enabledSearch });

  // isLoading = isLoading || internalIsLoading;

  /* useEffect(() => {
    if (data) {
      setSuggestions(data);
    }
  }, [data]); */
  const onChangeValue = useAsyncDebounce((val) => {
    setFilter({ productName: valueState, materialName: valueState });
  }, 500);
  const internalOnChange = (event, { newValue }) => {
    setValueState(newValue);
    onChange?.(newValue);
    onChangeValue();
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(valueState);
    }
  };

  const renderSuggestion = useCallback((suggestion) => <div>{suggestion?.name}</div>, []);

  const getSuggestionValue = useCallback((suggestion) => suggestion?.name || '', []);

  const onSuggestionsFetchRequested = useCallback(({ value: val }) => {
    // console.debug('onSuggestionsFetchRequested', val);

    setValueState(val);
  }, []);

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const handleSuggestionSelected = useCallback(
    (event, { suggestion }) => {
      // console.debug('handleSuggestionSelected', suggestion);
      onSuggestionSelected?.(suggestion);
    },
    [onSuggestionSelected]
  );

  const renderInputComponent = useCallback(
    (p) => <DebounceInput element={Form.Control} debounceTimeout={400} placeholder={placeholder} {...p} />,
    [placeholder]
  );

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
          placeholder: f({ id: 'common.search.inventory' }),
          value: valueState,
          onChange: internalOnChange,
          onKeyPress,
        }}
        renderInputComponent={renderInputComponent}
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

export default InventorySearch;
