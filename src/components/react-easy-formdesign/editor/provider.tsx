import React from 'react';
import { useFormRenderStore, useFormStore } from '../render';
import { ConfigComponents, ConfigSettings } from './configs';
import { useEventBus } from '../render/utils/hooks';
import { useSetContext } from './hooks';
import { FormEditorContext } from './context';

export interface ProviderProps {
  children: any;
}
function Provider(props: ProviderProps) {

  const editor = useFormRenderStore();
  const editorForm = useFormStore();
  const eventBus = useEventBus();

  const context = useSetContext({
    editor: editor,
    editorForm: editorForm,
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