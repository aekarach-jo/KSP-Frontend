/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useCallback, useMemo } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import clx from 'classnames';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import LovCustomerSelect from 'components/lov-select/LovCustomerSelect';
import LovProductMultiSelect from 'components/lov-select/LovProductMultiSelectRM';

const initialData = {
  customerId: '',
  mapProduct: [],
};

const ReferenceListBrowser = ({ show, onHide, referenceList, onChange }) => {
  const { formatMessage: f } = useIntl();

  const translate = useMemo(
    () => ({
      title: f({ id: 'rm.referenceList.title' }),
      subTitle: f({ id: 'rm.referenceList.subTitle' }),
      common: {
        add: f({ id: 'common.add' }),
        delete: f({ id: 'common.delete' }),
        save: f({ id: 'common.save' }),
        cancel: f({ id: 'common.cancel' }),
        success: f({ id: 'common.save.success' }),
      },
      field: {
        code: f({ id: 'rm.field.code' }),
        abbr: f({ id: 'rm.field.abbr' }),
        name: f({ id: 'rm.field.name' }),
        typeOrGroup: f({ id: 'rm.field.typeOrGroup' }),
      },
    }),
    [f]
  );

  var init = '';
  if (referenceList.length > 0) {
    init = { reference: referenceList };
  } else {
    init = initialData;
  }

  console.log(init);
  const validationSchema = Yup.object().shape({
    customerId: Yup.object().required('Please provide CustomerId Required'),
    mapProduct: Yup.object().required('Please provide MapProduct Required'),
  });

  const handleSaveSuccess = useCallback(() => {
    toast(translate.common.success, { className: 'success' });
  }, [translate.common.success]);

  const onSubmit = (form) => {
    const data = form.reference.map((item) => {
      return {
        customerId: item.customerId?.value ? item.customerId?.value : item.customerId,
        mapProduct: item.mapProduct.map((item2) => item2.value),
      };
    });
    onChange(data);
    onHide();
    // handleSaveSuccess();
  };

  const formik = useFormik({ initialValues: init, onSubmit, enableReinitialize: true });
  const { handleSubmit, handleChange, setFieldValue, resetForm, values, touched, errors } = formik;

  const handleChangeList = (e, index, name) => {
    if (name === 'customerId') {
      handleChange({ target: { id: `reference.${index}.customerId`, value: e.value } });
    } else {
      handleChange({ target: { id: `reference.${index}.mapProduct`, value: e } });
    }
  };

  const handleSave = () => {
    handleSubmit();
  };

  return (
    <Modal show={show} className={clx('fade')} size="xl" onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{translate.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-0">
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
          style={{ maxHeight: '500px', minHeight: '500px', position: 'relative', zIndex: '0' }}
        >
          <Card className="p-2" style={{ position: 'relative', zIndex: '1' }}>
            <FormikProvider value={formik}>
              <FieldArray
                name="reference"
                render={(arrayHelpers) => {
                  return [
                    values.reference?.map((detail, index) => (
                      <Row>
                        <Col md="6" xs="12">
                          <Form.Group className="position-relative tooltip-end-top" controlId="customerId">
                            <Form.Label className="required">{f({ id: 'rm.field.customerList' })}</Form.Label>
                            <LovCustomerSelect
                              name="customerId"
                              // isDisabled={!isEditMode}
                              onChange={(e) => handleChangeList(e, index, 'customerId')}
                              value={detail.customerId}
                            />
                            {errors.customerList && touched.customerList && <div className="d-block invalid-feedback">{f({ id: errors.customerList })}</div>}
                          </Form.Group>
                        </Col>
                        <Col md="5" xs="9">
                          <Form.Group className="position-relative tooltip-end-top" controlId="mapProduct">
                            <Form.Label>{f({ id: 'rm.field.referenceList' })}</Form.Label>
                            <LovProductMultiSelect
                              name="mapProduct"
                              // isDisabled={!isEditMode}
                              onChange={(e) => handleChangeList(e, index)}
                              value={detail.mapProduct}
                              isMulti
                            />
                          </Form.Group>
                        </Col>
                        <Col style={{ padding: '1.8rem 2rem' }} md="1" xs="1">
                          <Button className="btn-icon btn-icon-only" variant="outline-danger" onClick={() => arrayHelpers.remove(index)}>
                            <CsLineIcons icon="bin" />
                          </Button>
                        </Col>
                      </Row>
                    )),
                    values?.reference?.length === 0 && <span key="notFound">ไม่พบข้อมูล</span>,
                  ];
                }}
              />
            </FormikProvider>
          </Card>
        </OverlayScrollbarsComponent>
        <FormikProvider value={formik}>
          <FieldArray
            name="reference"
            render={(arrayHelpers) => {
              return [
                <div key="addToolingList" className="d-grid gap-2 mb-3">
                  <Button
                    variant="outline-primary"
                    className="btn-icon btn-icon-start mb-1"
                    onClick={() => arrayHelpers.insert(values?.reference?.length, initialData)}
                  >
                    <CsLineIcons icon="plus" /> <span>{f({ id: 'common.add' })}</span>
                  </Button>
                </div>,
              ];
            }}
          />
        </FormikProvider>
      </Modal.Body>
      <Modal.Footer className="p-2">
        <Button variant="outline-secondary" className="btn-icon btn-icon-start ms-1" onClick={onHide}>
          <CsLineIcons icon="close" /> {translate.common.cancel}
        </Button>
        <Button
          variant="primary"
          className={
            ''
            //   clx('btn-icon btn-icon-start ms-1 shadow', {
            //   'overlay-spinner': isSaving,
            // })
          }
          onClick={handleSave}
          // disabled={isSaving}
        >
          <CsLineIcons icon="save" /> {translate.common.save}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReferenceListBrowser;
