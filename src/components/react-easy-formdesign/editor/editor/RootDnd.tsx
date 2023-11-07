import React from 'react';
import './index.less';
import FormDnd, { ControlDndProps } from '../../render/components/FormDnd';
import { useFormEditor } from '../hooks';

// 根节点的拖放区域
function RootDnd(props: ControlDndProps) {
  const editorContext = useFormEditor();
  return <FormDnd {...props} field={{ context: editorContext }} />
};

export default RootDnd;
