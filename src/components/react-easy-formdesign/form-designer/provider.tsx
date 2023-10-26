import React from 'react';
import { useFormRenderStore, useFormStore } from '../../react-easy-formrender';
import { ConfigComponents, ConfigSettings } from './configs';
import { useEventBus } from '../form-render/utils/hooks';
import { useSet } from './hooks';
import { FormDesignContext } from './context';

export interface ProviderProps {
  children: any;
}
export const DesignprefixCls = 'easy-form-design';
function Provider(props: ProviderProps) {

  const designerStore = useFormRenderStore();
  const designerForm = useFormStore();
  const eventBus = useEventBus();

  const [state, setDesignState] = useSet({
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
    <FormDesignContext.Provider value={Object.assign(state, { setDesignState: setDesignState })}>
      {children}
    </FormDesignContext.Provider>
  );
}

export default Provider;