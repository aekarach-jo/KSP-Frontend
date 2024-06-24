import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { request } from 'utils/axios-utils';
import CommercialInvoice from './CommercialInvoice';
/**
 * @param {import('axios').AxiosResponse} res Response object
 */

const Commerce = () => {
  const componentRef = useRef(null);
  const [dataPo, setDataPo] = useState();

  const PoRespTransform = (res) => {
    setDataPo(res.data.data);
    // console.log(dataPo);
    //  return res.data;
  };

  const searchCompany = async () => {
    const res = await request({ url: '/purchaseOrder/635ba0b34e7431b1f2962e68' });
    return PoRespTransform(res);
  };

  useEffect(() => {
    searchCompany();
  }, []);

  return (
    <div>
      <div>
        <section className="w-100">
          {dataPo !== undefined ? (
            <CommercialInvoice
              ref={(el) => {
                componentRef.current = el;
              }}
              dataPo={dataPo}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Spinner animation="border" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </section>
        <div className="d-flex justify-content-center mt-4">
          <ReactToPrint
            trigger={() => (
              <Button variant="outline-dark" size="small" color="secondary">
                Export
              </Button>
            )}
            content={() => componentRef.current}
          />
        </div>
      </div>
    </div>
  );
};

export default Commerce;
