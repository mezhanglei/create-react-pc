import React from 'react';
import { useFormRenderStore, useFormStore } from '../../react-easy-formrender';
import { ConfigComponents, ConfigSettings } from './configs';
import { useEventBus } from '../form-render/utils/hooks';
import { useSetContext } from './hooks';
import { FormEditorContext } from './context';

export interface ProviderProps {
  children: any;
}
function Provider(props: ProviderProps) {

  const formrender = useFormRenderStore();
  const editorForm = useFormStore();
  const eventBus = useEventBus();

  const context = useSetContext({
    editorForm: editorForm,
    editor: formrender,
    settingForm: null,
    eventBus: eventBus,
    selected: {},
    properties: {},
    settings: Object.assign({}, ConfigSettings),
    components: Object.assign({}, ConfigComponents),
    historyData: {
      index: -1,
      maxStep: 20,
      steps: []
    },
  });

  const {
    children
  } = props;

  return (
    <FormEditorContext.Provider value={context}>
      {children}
    </FormEditorContext.Provider>
  );
}

export default Provider;