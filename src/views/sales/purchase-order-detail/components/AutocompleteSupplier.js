import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import createTrie from 'autosuggest-trie';
import { SERVICE_URL } from 'config.js';
import { request } from 'utils/axios-utils';

const AutocompleteSupplier = ({ onSelect, inputProps, initialValue }) => {
  const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    request({ url: `${SERVICE_URL}/masterData/supplier/list` }).then((res) => {
      setData(res?.data?.data);
    });
  }, []);

  useEffect(() => {
    if (initialValue) {
      setValueState(initialValue);
    }
  }, [initialValue]);

  const escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const getSuggestions = (value) => {
    const escapedValue = escapeRegexCharacters(value.trim());
    if (escapedValue === '') {
      return [];
    }
    // Small plugin to search both at the start of the first and last name
    const trie = createTrie(data, 'name');
    return trie.getMatches(escapedValue);
  };

  const changeInput = (event, { newValue }) => {
    if (!newValue) {
      onSelect(null);
    }
    setValueState(newValue);
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

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => {
    const { name = '' } = suggestion;
    return (
      <Row className="g-0 position-relative">
        {/* <Col xs="auto">
          <img src={thumb} alt={name} className="sw-3 me-2 rounded-xl" />
        </Col> */}
        <Col className="d-flex align-items-center">
          <div className="stretched-link body-link">{name}</div>
        </Col>
      </Row>
    );
  };

  const renderInputComponent = (props) => <Form.Control {...props} />;

  if (!data) {
    return <></>;
  }

  return (
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
  );
};

export default AutocompleteSupplier;