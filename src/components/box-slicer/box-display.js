import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rect as kRect } from 'konva/lib/shapes/Rect';
import { Group, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import ColoredRect from './ColoredRect';

const BoxDisplay = ({
  width,
  height,
  paperX,
  paperY,
  paperWidth,
  paperHeight,
  cuttingWidth,
  cuttingHeight,
  layout,
  textXList,
  textYList,
  storeData,
  onSelectingAreaChange,
  enableSelectingArea,
  producedItemData,
  onEnableSelectAreaChange,
  onDisableDefault = false,
  fontSize: font = 1.4,
  boxItem,
}) => {
  const groupRef = useRef();
  const groupTextRef = useRef();
  const stagePointerPosTextRef = useRef();
  const transformerRef = useRef();
  const dummyRectRef = useRef();
  const backPlateRef = useRef();

  const [dpi, setDpi] = useState(66);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isScaled, setIsScaled] = useState(false);
  const [fontSize, setFontSize] = useState(font);
  const [currPosition, setCurrPostition] = useState({ y: 0, x: 0 });
  const cuttingInchSize = {
    width: cuttingWidth * dpi,
    height: cuttingHeight * dpi,
  };

  const paperSize = useMemo(
    () => ({
      width: paperWidth * dpi,
      height: paperHeight * dpi,
    }),
    [dpi, paperWidth, paperHeight]
  );

  const paperSizeLastLayer = useMemo(
    () => ({
      width: 50 * dpi,
      height: 50 * dpi,
    }),
    [dpi]
  );

  const paperLocation = useMemo(
    () => ({
      x: paperX,
      y: paperY,
    }),
    [paperX, paperY]
  );

  const resetDummySize = useCallback(() => {
    const backPlate = backPlateRef.current;
    // const backPlateClientRect = backPlate.getClientRect();
    /* dummyRectRef.current
      .setAttrs({
        x: backPlateClientRect.x,
        y: backPlateClientRect.y,
        width: backPlateClientRect.width,
        height: backPlateClientRect.height,
      })
      .scale({ x: 1, y: 1 }); */
    dummyRectRef.current.position(backPlate.position()).size(backPlate.size()).scale({ x: 1, y: 1 });
  }, []);

  const getTransformSelectedArea = useCallback(
    (transformer) => {
      const { width: _w = 0, height: _h = 0 } = transformer.attrs; // transformer.size();
      const { x, y } = transformer.scale();
      const cutWidth = +((_h * y) / dpi).toFixed(1);
      const cutLength = +((_w * x) / dpi).toFixed(1);

      return { cutWidth, cutLength };
    },
    [dpi]
  );

  useEffect(() => {
    onEnableSelectAreaChange?.(false);
  }, [layout, onEnableSelectAreaChange]);

  useEffect(() => {
    resetDummySize();
    console.debug('Store data :', storeData);
    // console.log(storeData);
    if (storeData) {
      const { cutWidth, cutLength } = storeData;

      const w = cutLength * dpi;
      const h = cutWidth * dpi;

      const { width: rW, height: rH } = dummyRectRef.current.size();

      dummyRectRef.current.scale({
        x: w / rW,
        y: h / rH,
      });
    }
  }, [dpi, storeData, dummyRectRef]);

  useEffect(() => {
    // resetDummySize();
    if (enableSelectingArea) {
      transformerRef.current.nodes([dummyRectRef.current]);
      transformerRef.current.size(dummyRectRef.current.size());
    } else {
      transformerRef.current.detach();
    }

    const sd = getTransformSelectedArea(transformerRef.current);
    onSelectingAreaChange?.(
      enableSelectingArea
        ? {
            ...sd,
          }
        : null
    );
  }, [enableSelectingArea, getTransformSelectedArea, onSelectingAreaChange, resetDummySize]);

  useEffect(() => {
    setScaleFactor(1);
    setIsScaled(false);
    // console.log('reset scale');

    setTimeout(() => {
      if (!groupRef.current) {
        return;
      }

      const clientRect = groupRef.current.getClientRect();
      const { x, y, width: _width, height: _height } = clientRect;
      const scale = Math.min(width / (_width + paperLocation.x * dpi), height / (_height + paperLocation.y * dpi));
      setScaleFactor(scale);
      setIsScaled(true);

      // resetDummySize();
      // console.debug('Client rect', clientRect);
      // console.debug('paper Size :', paperSize);
      // console.debug('scale ', scale);
    }, 10);
  }, [dpi, width, height, paperLocation, paperLocation.x, paperLocation.y, paperSize, resetDummySize]);

  useEffect(() => {
    if (boxItem?.storeData) {
      const { cutLength, cutWidth } = boxItem.storeData;
      onSelectingAreaChange?.({ cutLength, cutWidth });
    }
  }, [boxItem]);

  return (
    <Stage
      width={width}
      height={height}
      onMouseMove={(e) => {
        // console.debug('event:', e);

        const kGroup = groupRef.current;

        const pointerPosition = kGroup.getRelativePointerPosition();
        const { x, y } = pointerPosition;
        setCurrPostition({
          y: Math.max(0, (y / dpi - paperLocation.y).toFixed(1)),
          x: Math.max(0, (x / dpi - paperLocation.x).toFixed(1)),
        });
        // console.debug('Move on rect x, y :', (x / dpi - paperLocation.x).toFixed(1), (y / dpi - paperLocation.y).toFixed(1));
        const position = e.target?.getStage()?.getPointerPosition();
        // console.debug(stagePointerPosTextRef.current);
        stagePointerPosTextRef.current.position({
          x: position?.x + 10,
          y: position?.y + 10,
        });
        // setStagePointerPosition(stagePointerPos);
        // console.debug('Get stage pointer pos :', stagePointerPos);
      }}
      onMouseLeave={() => {
        stagePointerPosTextRef.current.position({ x: 0, y: 0 });
        setCurrPostition({ y: 0, x: 0 });
      }}
    >
      <Layer>
        <Group ref={groupRef} scale={{ x: scaleFactor, y: scaleFactor }}>
          <ColoredRect
            ref={backPlateRef}
            x={(paperLocation.x || 0) * dpi}
            y={(paperLocation.y || 0) * dpi}
            width={paperSizeLastLayer.width}
            height={paperSizeLastLayer.height}
            color="white"
            strokeWidth={0}
          />
          <ColoredRect
            ref={backPlateRef}
            x={(paperLocation.x || 0) * dpi}
            y={(paperLocation.y || 0) * dpi}
            width={paperSize.width}
            height={paperSize.height}
            color="lightgray"
          />
          {typeof layout === 'function'
            ? layout({ cuttingInchSize })
            : layout.map((item, idx) => (
                <ColoredRect
                  key={idx}
                  x={(item.locationx || 0) * dpi}
                  y={(item.locationy || 0) * dpi}
                  width={(item.width || 0) * dpi}
                  height={(item.height || 0) * dpi}
                  color="gray"
                />
              ))}
        </Group>
        <Group ref={groupTextRef} scale={{ x: scaleFactor, y: scaleFactor }}>
          {textXList.map((item, idx) => (
            <Text
              key={`${idx}-${item.locationx}-${item.locationy}`}
              x={(item.locationx || 0) * dpi}
              y={(item.locationy || 0) * dpi - 100}
              text={item.text}
              fontSize={fontSize * dpi}
              align="center"
              verticalAlign="middle"
              style={{ zIndex: '9999' }}
            />
          ))}

          {textYList.map((item, idx) => (
            <Text
              key={`${idx}-${item.locationx}-${item.locationy}`}
              x={(item.locationx || 0) * dpi - 150}
              y={(item.locationy || 0) * dpi + 200}
              text={item.text}
              fontSize={fontSize * dpi}
              align="center"
              verticalAlign="middle"
            />
          ))}
        </Group>
        <Group scale={{ x: scaleFactor, y: scaleFactor }}>
          <Rect
            ref={dummyRectRef}
            fill="yellow"
            opacity={enableSelectingArea ? 0.3 : 0}
            // x={paperLocation.x || 0}
            // y={paperLocation.y || 0}
            // width={width}
            // height={height}
          />
        </Group>
      </Layer>
      <Layer name="transformerLr">
        <Transformer
          ref={transformerRef}
          enabledAnchors={['middle-right', 'bottom-center']}
          rotateEnabled={false}
          borderDash={[4]}
          borderStrokeWidth={3}
          onTransformEnd={(e) => {
            // console.debug('transform end: ', e.currentTarget.size());
            console.debug('transform end:', e.target);
            const { cutWidth, cutLength } = getTransformSelectedArea(e.target);

            onSelectingAreaChange?.({ cutLength, cutWidth });
          }}
          boundBoxFunc={(oldBox, newBox) => {
            const { x: gX, y: gY, width: gWidth, height: gHeight } = backPlateRef.current.getClientRect({ skipStroke: true });

            if (producedItemData.status === 'SUBMITTED') {
              return oldBox;
            }
            if (
              Math.floor(newBox.width) > Math.floor(gWidth) ||
              Math.floor(newBox.width) < 0 ||
              Math.floor(newBox.height) < 0 ||
              Math.floor(newBox.height) > Math.floor(gHeight) ||
              Math.floor(newBox.x) < Math.floor(gX) ||
              Math.floor(newBox.y) < Math.floor(gY)
            ) {
              return oldBox;
            }

            // Find direction and set max to opposite.
            if (Math.floor(newBox.width) !== Math.floor(oldBox.width) || Math.floor(newBox.x) !== Math.floor(oldBox.x)) {
              newBox.y = gY;
              newBox.height = gHeight;
            }

            if (Math.floor(newBox.height) !== Math.floor(oldBox.height) || Math.floor(newBox.y) !== Math.floor(oldBox.y)) {
              newBox.x = gX;
              newBox.width = gWidth;
            }

            return newBox;
          }}
        />
      </Layer>
      <Layer name="tooltip">
        <Text
          ref={stagePointerPosTextRef}
          // x={stagePointerPosition.x + 10}
          // y={stagePointerPosition.y + 10}
          text={onDisableDefault ? '' : `${currPosition.y} , ${currPosition.x}`}
          fontSize={14}
          fill="black"
          stroke="white"
          strokeWidth={3}
          fillAfterStrokeEnabled
        />
      </Layer>
    </Stage>
  );
};

export default BoxDisplay;
