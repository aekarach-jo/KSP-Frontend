import React from 'react';
import ColoredRect from 'components/box-slicer/ColoredRect';

export const Layout1 = ({ cuttingInchSize }) => (
  <>
    <ColoredRect locationx={0} locationy={0} width={cuttingInchSize.width} height={cuttingInchSize.height} />
    <ColoredRect locationx={cuttingInchSize.width} locationy={0} width={cuttingInchSize.width} height={cuttingInchSize.height} />
    <ColoredRect locationx={cuttingInchSize.width * 2} locationy={0} width={cuttingInchSize.width} height={cuttingInchSize.height} />

    <ColoredRect locationx={0} locationy={cuttingInchSize.height} width={cuttingInchSize.width} height={cuttingInchSize.height} />
    <ColoredRect locationx={cuttingInchSize.width} locationy={cuttingInchSize.height} width={cuttingInchSize.width} height={cuttingInchSize.height} />
    <ColoredRect locationx={cuttingInchSize.width * 2} locationy={cuttingInchSize.height} width={cuttingInchSize.width} height={cuttingInchSize.height} />
  </>
);
