import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

/*
 You can adjust delayResponse value to test slow networks :
 const api = new MockAdapter(axios, { delayResponse: 1000 });
 */
const api = new MockAdapter(axios, { delayResponse: 100 });
export default api;
