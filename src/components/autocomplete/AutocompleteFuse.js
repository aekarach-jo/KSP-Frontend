import React, { useState } from 'react';
import Fuse from 'fuse.js';
import Autosuggest from 'react-autosuggest';

const AutocompleteFuse = (props) => {
  const { data } = props;

  const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  // const [data, setData] = useState(props.data);

  const escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const getSuggestions = (value) => {
    const escapedValue = escapeRegexCharacters(value.trim());
    const fuse = new Fuse(data, {
      keys: ['name'],
    });
    const results = fuse.search(escapedValue).map((result) => {
      return result.item;
    });
    return results;
  };

  const changeInput = (event, { newValue }) => {
    setValueState(newValue);
  };

  const onSuggestionsFetchRequested = ({ value: val }) => {
    setSuggestions(getSuggestions(val));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => <div>{suggestion.name}</div>;

  const renderInputComponent = (props2) => <input {...props2} className="form-control" />;

  if (!data) {
    return <></>;
  }

  return (
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
        onChange: changeInput,
      }}
      renderInputComponent={renderInputComponent}
    />
  );
};

export default AutocompleteFuse;
