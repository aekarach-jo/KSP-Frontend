import React, { forwardRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Rect } from 'react-konva';

const ColoredRect = ({ x, y, color = 'white', width, height, ...rest }, ref, strokeWidth = 7) => {
  const [_color, setColor] = useState('white');

  useEffect(() => {
    setColor(color);
  }, [color]);

  const handleClick = () => {
    setColor(Konva.Util.getRandomColor());
  };

  return <Rect ref={ref} x={x} y={y} width={width} height={height} fill={_color} stroke="black" strokeWidth={strokeWidth} {...rest} />;
};

export default forwardRef(ColoredRect);
