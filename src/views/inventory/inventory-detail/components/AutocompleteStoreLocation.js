import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import createTrie from 'autosuggest-trie';
import { DebounceInput } from 'react-debounce-input';
import { request } from 'utils/axios-utils';
import { API } from '../constants';

const AutocompleteStoreLocation = ({ onSelect, inputProps }) => {
  const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState([]);

  const searchItem = async (e, keyword) => {
    if (keyword?.length < 2 || e.type === 'click') {
      return;
    }
    const res = await request({ url: API.FIND_STORE_LOCATION, params: { limit: 10, code: keyword } });
    setData(res?.data?.data);
  };

  const escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const getSuggestions = (value) => {
    const escapedValue = escapeRegexCharacters(value.trim());
    if (escapedValue === '') {
      return [];
    }
    // Small plugin to search both at the start of the first and last name
    const trie = createTrie(data, 'code');
    return trie.getMatches(escapedValue);
  };

  const changeInput = (event, { newValue }) => {
    if (!newValue) {
      onSelect(null);
    }
    setValueState(newValue);
    searchItem(event, newValue);
  };

  const onSuggestionsFetchRequested = async ({ value: val }) => {
    setSuggestions(getSuggestions(val));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    onSelect(suggestion);
  };

  const getSuggestionValue = (suggestion) => suggestion.code;

  const renderSuggestion = (suggestion) => {
    const { code = '' } = suggestion;
    return (
      <Row className="g-0 position-relative">
        {/* <Col xs="auto">
          <img src={thumb} alt={name} className="sw-3 me-2 rounded-xl" />
        </Col> */}
        <Col className="d-flex align-items-center">
          <div className="stretched-link body-link">{code}</div>
        </Col>
      </Row>
    );
  };

  const renderInputComponent = (props) => <Form.Control as={DebounceInput} debounceTimeout={400} {...props} />;

  if (!data) {
    return <></>;
  }

  return (
    <>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSuggestionSelected}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        focusInputOnSuggestionClick={false}
        inputProps={{
          type: 'text',
          placeholder: '',
          value: valueState,
          onChange: changeInput,
          className: 'form-control',
          ...inputProps,
        }}
        renderInputComponent={renderInputComponent}
      />
    </>
  );
};
export default AutocompleteStoreLocation;
