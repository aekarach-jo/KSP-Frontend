import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Row, Col, Form, Card, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowState } from 'react-table';
import { useFormik } from 'formik';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import TableCard from 'views/sales/components/table/TableCardInventory';

import { API, QUERY } from './constants';

const getDefaultValues = () => ({
  materialId: '',
  materialCode: '',
  materialName: '',
});

const getStockDetail = (id, isProduct) => () =>
  request({ url: `${API.FIND_STORE_LOCATION_LIST}?${isProduct ? 'productId' : 'materialId'}=${id}` })
    .then((res) => res.data.data)
    .then((data) => ({
      ...getDefaultValues(),
      ...data,
    }));

const MovementDetail = (props) => {
  // console.debug('customer add props :', props);
  // eslint-disable-next-line react/destructuring-assignment
  const id = props?.match?.params?.id;
  const isProduct = props?.match?.params?.product === 'product';
  const [data, setData] = useState({});
  const [list, setList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState({ page: 0 });
  const queryClient = useQueryClient();

  const { formatMessage: f, formatDate: fd } = useIntl();
  const {
    data: initialValues,
    isFetching,
    error,
    refetch,
  } = useQuery([API.FIND_STORE_LOCATION_LIST], getStockDetail(id, isProduct), {
    enabled: !!id,
    initialData: getDefaultValues(),
    refetchOnWindowFocus: false,
    onSuccess(res) {
      res.amount = 0;
      res.detailList.forEach((detail) => {
        res.amount += detail.amount;
        res.materialName = detail.materialName;
        res.materialCode = detail.materialCode;

        res.materialStoreUnit = detail.materialStoreUnit;
        if (isProduct) {
          res.materialName = detail.productName;
          res.materialCode = detail.productCode;
          res.materialStoreUnit = f({ id: `inventory.unit` });
        }
      });

      setData(res);
      setList(res?.detailList);
    },
    onError(err) {
      console.error('Error:', err);
    },
  });

  const title = f({ id: `inventory.detail.title` }, { materialName: initialValues?.materialName });
  const formik = useFormik({ initialValues, enableReinitialize: true });
  const { values, errors } = formik;

  useEffect(() => {
    queryClient.resetQueries(QUERY.INVENTORY_DETAIL);
  }, [queryClient]);
  return (
    <>
      <HtmlHead title={title} />
      <PageTitle
        title={title}
        isLoading={isFetching}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
        }}
      />
      <Col>
        <h2 className="small-title">{f({ id: 'inventory.detail.information' })}</h2>
        <Form>
          <Card
            className={classNames('mb-3', {
              'overlay-spinner': isFetching,
            })}
          >
            <Card.Body>
              <Row className="mb-3 g-3">
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialCode">
                    <Form.Label>{f({ id: 'inventory.materialCode' })}</Form.Label>
                    <Form.Control readOnly type="text" value={values.materialCode} isInvalid={!!errors.materialCode} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.materialCode.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialName">
                    <Form.Label>{f({ id: 'inventory.materialName' })}</Form.Label>
                    <Form.Control readOnly type="text" value={values.materialName} isInvalid={!!errors.materialName} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.materialName.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="amount">
                    <Form.Label>{f({ id: 'inventory.onHand' })}</Form.Label>
                    <Form.Control readOnly type="text" value={values.amount} isInvalid={!!errors.amount} />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.onHand.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="position-relative tooltip-end-top" controlId="materialUnit">
                    <Form.Label>{f({ id: 'inventory.unit' })}</Form.Label>
                    <Form.Control type="text" value={values.materialStoreUnit} isInvalid={!!errors.materialStoreUnit} readOnly />
                    {/* <Form.Control.Feedback type="invalid">{f({ id: 'inventory.unit.required' })}</Form.Control.Feedback> */}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {values.detailList !== undefined ? (
            values.detailList.map((detail, detailIndex) => {
              let type;
              if (detail.no.includes('IN')) {
                type = '(In)';
              } else if (detail.no.includes('OUT')) {
                type = '(Out)';
              } else {
                type = '';
              }
              return (
                <Card key={detailIndex} className="mb-5">
                  <Card.Body>
                    <Row className="mb-3 g-3">
                      <div className="mb-5">
                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }} className="mb-3">
                            <h5 style={{ margin: 0, fontSize: '1rem' }}>
                              Latest Updated{' '}
                              {fd(values.updatedAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                                .replace('/', '-')
                                .replace('/', '-') || ''}
                            </h5>
                          </div>
                          <div>
                            <Row className="mb-3 g-3">
                              <Col md={3}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="materialCode">
                                  <Form.Label>{f({ id: 'movement.movementCode' })}</Form.Label>
                                  <Form.Control readOnly type="text" value={detail.no || ''} isInvalid={!!errors.materialCode} />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.materialCode.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="materialName">
                                  <Form.Label>{f({ id: 'movement.movementType' })}</Form.Label>
                                  <Form.Control readOnly type="text" value={`${detail.status} ${type}`} isInvalid={!!errors.materialName} />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.materialName.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="amount">
                                  <Form.Label>{f({ id: 'movement.date' })}</Form.Label>
                                  <Form.Control
                                    readOnly
                                    type="text"
                                    value={
                                      values.createdAt === ''
                                        ? ''
                                        : fd(values.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' })
                                            .replace('/', '-')
                                            .replace('/', '-') || ''
                                    }
                                    isInvalid={!!errors.amount}
                                  />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.onHand.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="updatedBy">
                                  <Form.Label>{f({ id: 'movement.operator' })}</Form.Label>
                                  <Form.Control type="text" value={detail.updatedBy || ''} isInvalid={!!errors.materialBaseUOM} readOnly />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.unit.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="availableAmount">
                                  <Form.Label>{f({ id: 'movement.source' })}</Form.Label>
                                  <Form.Control readOnly type="text" value={detail.fromStoreLocationCode || ''} isInvalid={!!errors.availableAmount} />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.available.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={2}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="batchNo">
                                  <Form.Label>{f({ id: 'movement.lot' })}</Form.Label>
                                  <Form.Control type="text" value={detail.batchNo || ''} isInvalid={!!errors.materialStoreUnit} readOnly />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.unit.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={2}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="availableAmount">
                                  <Form.Label>{f({ id: 'movement.amount' })}</Form.Label>
                                  <Form.Control readOnly type="number" value={detail.amount} />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.available.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={2}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="materialUnit">
                                  <Form.Label>{f({ id: 'movement.unit' })}</Form.Label>
                                  <Form.Control type="text" value={detail.materialStoreUnit || ''} isInvalid={!!errors.materialStoreUnit} readOnly />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.unit.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="storeLocationCode">
                                  <Form.Label>{f({ id: 'movement.storeLocationCode' })}</Form.Label>
                                  <Form.Control type="text" value={detail.storeLocationCode || ''} isInvalid={!!errors.materialStoreUnit} readOnly />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.unit.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="position-relative tooltip-end-top" controlId="location">
                                  <Form.Label>{f({ id: 'movement.location' })}</Form.Label>
                                  <Form.Control readOnly type="text" value={detail.storeLocationName || ''} isInvalid={!!errors.availableAmount} />
                                  {/* <Form.Control.Feedback type="invalid">{f({ id: 'movement.available.required' })}</Form.Control.Feedback> */}
                                </Form.Group>
                              </Col>

                            </Row>
                          </div>
                        </div>
                      </div>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            // If detailList is undefined, display a loading spinner
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Spinner animation="border" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </Form>
      </Col>
    </>
  );
};

export default MovementDetail;
