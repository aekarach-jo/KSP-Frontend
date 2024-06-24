import React from 'react';
import clx from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import './moveHandle.style.scss';

const MoveHandle = (props) => {
  const { className } = props;

  return <CsLineIcons className={clx('move-handle', className)} icon="more-vertical" />;
};

export default MoveHandle;
