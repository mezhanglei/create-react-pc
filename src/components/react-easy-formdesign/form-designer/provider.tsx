import React from 'react';
import { useFormRenderStore, useFormStore } from '../../react-easy-formrender';
import { ConfigComponents, ConfigSettings } from './configs';
import { useEventBus } from '../form-render/utils/hooks';
import { FormDesignContext, FormEditContext } from './designer-context';
import { useSet } from './use-hooks';

export interface ProviderProps {
  children: any;
}
export const DesignprefixCls = 'easy-form-design';
function Provider(props: ProviderProps) {

  const designerStore = useFormRenderStore();
  const designerForm = useFormStore();
  const eventBus = useEventBus();

  const [state, setEdit] = useSet({
    designerForm: designerForm,
    designer: designerStore,
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
    <FormEditContext.Provider value={{ setEdit }}>
      <FormDesignContext.Provider value={state}>
        {children}
      </FormDesignContext.Provider>
    </FormEditContext.Provider>
  );
}

export default Provider;