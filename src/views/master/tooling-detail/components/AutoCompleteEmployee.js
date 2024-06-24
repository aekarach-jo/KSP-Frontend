// import React, { useEffect, useState } from 'react';
// import { Col, Row } from 'react-bootstrap';
// import Autosuggest from 'react-autosuggest';
// import createTrie from 'autosuggest-trie';
// import { DebounceInput } from 'react-debounce-input';
// import { request } from 'utils/axios-utils';

// const AutoCompleteEmployee = ({ onSelect, inputProps, value: inputValue }) => {
//   const [valueState, setValueState] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   // const [description, setDescription] = useState('');
//   const [data, setData] = useState([]);

//   // useEffect(() => {
//   //   axios.get(`${SERVICE_URL}/masterData/product/list`).then((res) => {
//   //     setData(res?.data?.data);
//   //     if (res?.data?.data && editData?.productId) {
//   //       setValueState(editData?.product?.name);
//   //       onSelect(res.data.data.find((item) => item.id === editData.productId));
//   //     }
//   //   });
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);

//   useEffect(() => {
//     if (inputValue) {
//       setValueState(inputValue);
//       // setDescription(editData?.material?.name);
//     }
//   }, [inputValue]);

//   const searchEmployee = async (e, keyword) => {
//     if (keyword?.length < 2 || e.type === 'click') {
//       return;
//     }
//     e.target.blur();
//     const res = await request({ url: `/employee/find`, params: { limit: 10, name: keyword } });
//     setData(res?.data?.data);
//     e.target.focus();
//   };

//   const escapeRegexCharacters = (str) => {
//     return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   };

//   const getSuggestions = (value) => {
//     const escapedValue = escapeRegexCharacters(value.trim());
//     if (escapedValue === '') {
//       return [];
//     }
//     // Small plugin to search both at the start of the first and last name
//     const trie = createTrie(data, 'name');
//     return trie.getMatches(escapedValue);
//   };

//   const changeInput = (event, { newValue }) => {
//     if (!newValue) {
//       onSelect(null);
//       // setDescription('');
//     }
//     setValueState(newValue);
//     searchEmployee(event, newValue);
//   };

//   const onSuggestionsFetchRequested = async ({ value: val }) => {
//     setSuggestions(getSuggestions(val));
//   };

//   const onSuggestionsClearRequested = () => {
//     setSuggestions([]);
//   };

//   const onSuggestionSelected = (event, { suggestion }) => {
//     onSelect(suggestion);
//     // setDescription(suggestion?.name);
//   };

//   const getSuggestionValue = (suggestion) => suggestion.name;

//   const renderSuggestion = (suggestion) => {
//     const { name = '' } = suggestion;
//     return (
//       <Row className="g-0 position-relative">
//         {/* <Col xs="auto">
//           <img src={thumb} alt={name} className="sw-3 me-2 rounded-xl" />
//         </Col> */}
//         <Col className="d-flex align-items-center">
//           <div className="stretched-link body-link">{name}</div>
//         </Col>
//       </Row>
//     );
//   };

//   // const renderInputComponent = (props) => <Form.Control {...props} />;

//   const renderInputComponent = (props) => <DebounceInput debounceTimeout={400} {...props} />;

//   if (!data) {
//     return <></>;
//   }

//   return (
//     <>
//       <Autosuggest
//         suggestions={suggestions}
//         onSuggestionsFetchRequested={onSuggestionsFetchRequested}
//         onSuggestionsClearRequested={onSuggestionsClearRequested}
//         onSuggestionSelected={onSuggestionSelected}
//         getSuggestionValue={getSuggestionValue}
//         renderSuggestion={renderSuggestion}
//         focusInputOnSuggestionClick={false}
//         inputProps={{
//           type: 'text',
//           placeholder: '',
//           value: valueState,
//           onChange: changeInput,
//           className: 'form-control',
//           ...inputProps,
//         }}
//         renderInputComponent={renderInputComponent}
//       />
//              <Autosuggest
//         suggestions={suggestions}
//         onSuggestionsFetchRequested={onSuggestionsFetchRequested}
//         onSuggestionsClearRequested={onSuggestionsClearRequested}
//         getSuggestionValue={getSuggestionValue}
//         renderSuggestion={renderSuggestion}
//         focusInputOnSuggestionClick={false}
//         inputProps={{
//           placeholder: '',
//           value: valueState,
//           onChange: internalOnChange,
//           onKeyPress,
//         }}
//         renderInputComponent={as}
//         style={{ height: '36px' }}
//         onSuggestionSelected={handleSuggestionSelected}
//       />
//       {/* {description && (
//         <Form.Group controlId="description" className="mt-2">
//           <Form.Control readOnly type="text" value={description} onChange={() => {}} />
//         </Form.Group>
//       )} */}
//     </>
//   );
// };
// export default AutoCompleteEmployee;

import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useQuery } from 'react-query';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { Spinner } from 'react-bootstrap';

const empResponseTranformer = (response) => {
  return response.data;
};

const searchEmpFn = async (query) => {
  const resp = await request({ url: `/employee/find`, params: { name: query, limit: 10 } });

  return empResponseTranformer(resp).data;
};

const useEmpAutocomplete = ({ query, ...queryOptions }) =>
  useQuery([`empAutocompleteData`, query], () => searchEmpFn(query), {
    enabled: !!query,
    refetchOnWindowFocus: false,
    cacheTime: 0,
    ...queryOptions,
  });

const AutoCompleteEmployee = ({
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

  const { data, isLoading: internalIsLoading } = useEmpAutocomplete({ searchUrl, query: valueState, enabled: enabledSearch });

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

export default AutoCompleteEmployee;
