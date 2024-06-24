import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import createTrie from 'autosuggest-trie';
import { SERVICE_URL } from 'config.js';
import { DebounceInput } from 'react-debounce-input';
import { request } from 'utils/axios-utils';

const AutocompletePurchaseItem = ({ onSelect, inputProps, editData }) => {
  const [valueState, setValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [description, setDescription] = useState('');
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   axios.get(`${SERVICE_URL}/masterData/product/list`).then((res) => {
  //     setData(res?.data?.data);
  //     if (res?.data?.data && editData?.productId) {
  //       setValueState(editData?.product?.name);
  //       onSelect(res.data.data.find((item) => item.id === editData.productId));
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  useEffect(() => {
    if (editData?.purchaseItem?.id) {
      setValueState(editData?.purchaseItem?.code);
      setDescription(editData?.purchaseItem?.description);
    }
  }, [editData]);

  const searchPurchaseItem = async (e, keyword) => {
    if (keyword?.length < 2 || e.type === 'click') {
      return;
    }
    e.target.blur();
    const res = await request({ url: `${SERVICE_URL}/purchaseItem/find`, params: { limit: 10, no: keyword } });
    setData(res?.data?.data);
    e.target.focus();
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
      setDescription('');
    }
    setValueState(newValue);
    searchPurchaseItem(event, newValue);
  };

  const onSuggestionsFetchRequested = async ({ value: val }) => {
    setSuggestions(getSuggestions(val));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    onSelect(suggestion);
    setDescription(suggestion?.description);
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

  // const renderInputComponent = (props) => <Form.Control {...props} />;

  const renderInputComponent = (props) => <DebounceInput debounceTimeout={400} {...props} />;

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
      {description && (
        <Form.Group controlId="description" className="mt-2">
          <Form.Control readOnly type="text" value={description} onChange={() => {}} />
        </Form.Group>
      )}
    </>
  );
};
export default AutocompletePurchaseItem;
