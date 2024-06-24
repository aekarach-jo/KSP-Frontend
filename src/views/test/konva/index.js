import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, FormControl, FormLabel, Row } from 'react-bootstrap';
import useSaleOrderCustomerData from 'hooks/api/sale-order/customer/useSaleOrderCustomerData';
import BoxItem from './BoxItem';

const generateId = () => new Date().getTime();

const KonvaTestPage = () => {
  const { useGetToProduceList } = useSaleOrderCustomerData();
  const { data: toProducedList } = useGetToProduceList();
  const [boxList, setBoxList] = useState();
  const [amount, setAmount] = useState(0);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [paperWidth, setPaperWidth] = useState(43);
  const [paperHeight, setPaperHeight] = useState(35);
  const productId = '62664bd3aee7976716ec5c17';
  const [boxProps, setBoxProps] = useState({
    width,
    height,
    paperHeight,
    paperWidth,
  });

  // Add one box as default
  useEffect(() => {
    if (toProducedList) {
      // Search grouped first
      if (toProducedList.groupItem?.length) {
        const item = toProducedList.groupItem.find((i) => {
          const { detail } = i;
          return detail?.some((d) => d.productId === productId);
        });

        if (item) {
          setBoxList([{ boxId: generateId(), amount: item.amount, defaultAmount: item.amount }]);
          return; // THEN STOP !!
        }
      }

      // Search ungrouped
      if (toProducedList.item?.length) {
        const item = toProducedList.item.find((i) => i.productId === productId);

        if (item) {
          setBoxList([{ boxId: generateId(), amount: item.amount, defaultAmount: item.amount }]);
        }
      }
    }
  }, [productId, toProducedList]);

  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleBoxPropsChange = () => {
    setBoxProps({
      width,
      height,
      paperHeight,
      paperWidth,
    });
  };

  const handleAddBoxClick = () => {
    // TODO: Manage amounts
    setBoxList((prev) => [
      ...prev,
      {
        boxId: generateId(),
      },
    ]);
  };

  const handleBoxUpdate = (data) => {
    console.debug('Box update', data);
  };

  const handleBoxDelete = (data) => {
    console.debug('Box delete:', data);

    setBoxList((prev) => prev.filter((box) => typeof box.defaultAmount === 'number' || box.boxId !== data.boxId));
  };

  console.debug('boxList', boxList);

  return (
    <Row>
      <Col xs={12}>
        <Card className="mb-3">
          <Card.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <div className="top-label">
                    <FormControl type="text" value={width} onChange={({ target }) => setWidth(target.value)} />
                    <FormLabel>Width</FormLabel>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="top-label">
                    <FormControl type="text" value={height} onChange={({ target }) => setHeight(target.value)} />
                    <FormLabel>Height</FormLabel>
                  </div>
                </Col>
                {/* <Col md={6}>
                  <div className="top-label">
                    <FormControl type="text" value={cuttingWidth} onChange={({ target }) => setCuttingWidth(target.value)} />
                    <FormLabel>Cutting width</FormLabel>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="top-label">
                    <FormControl type="text" value={cuttingHeight} onChange={({ target }) => setCuttingHeight(target.value)} />
                    <FormLabel>Cutting height</FormLabel>
                  </div>
                </Col> */}
                <Col md={6}>
                  <div className="top-label">
                    <FormControl type="text" value={paperWidth} onChange={({ target }) => setPaperWidth(target.value)} />
                    <FormLabel>Paper width</FormLabel>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="top-label">
                    <FormControl type="text" value={paperHeight} onChange={({ target }) => setPaperHeight(target.value)} />
                    <FormLabel>Paper height</FormLabel>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Button onClick={handleBoxPropsChange}>Calculate</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12}>
        <Row>
          <Col xs={6}>
            <FormControl type="number" value={amount} onChange={handleAmountChange} />
          </Col>
          <Col xs={6}>
            <Button variant="outline-primary" onClick={handleAddBoxClick}>
              Add
            </Button>
          </Col>
        </Row>
        {boxList?.map((box) => (
          <BoxItem
            key={box.boxId}
            boxId={box.boxId}
            amount={box.amount}
            productId={productId}
            boxProps={boxProps}
            onUpdate={handleBoxUpdate}
            onDelete={handleBoxDelete}
          />
        ))}
      </Col>
    </Row>
  );
};

export default KonvaTestPage;
