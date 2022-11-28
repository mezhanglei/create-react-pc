import React from 'react';
import { useFormRenderStore, useFormStore } from '../../react-easy-formrender';
import { FormDesignContext, FormEditContext } from './designer-context';
import { useSet } from './use-hooks';

export interface ProviderProps {
  children: any;
}

function Provider(props: ProviderProps) {

  const designerStore = useFormRenderStore();
  const designerForm = useFormStore();

  const [state, setEdit] = useSet({
    designerForm: designerForm,
    designer: designerStore,
    selected: {},
    historyData: {
      index: -1,
      maxStep: 20,
      steps: []
    },
    mode: 'edit',
    settingsForm: null,
    properties: {}
  });

  const {
    children
  } = props;

  return (
    <FormEditContext.Provider value={{ setEdit }}>
      <FormDesignContext.Provider value={state}>
        {children}
      </FormDesignContext.Provider>
    </FormEditContext.Provider>
  );
}

export default Provider;