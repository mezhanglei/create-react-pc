import React from 'react';
import './index.less';
import FormDnd, { ControlDndProps } from '../../form-render/components/FormDnd';
import { useFormDesign } from '../hooks';

// 根节点的拖放区域
function RootDnd(props: ControlDndProps) {
  const designContext = useFormDesign();
  return <FormDnd {...props} field={{ context: designContext }} />
};

export default RootDnd;
