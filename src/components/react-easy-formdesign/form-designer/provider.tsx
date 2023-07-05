import React from 'react';
import { useFormRenderStore, useFormStore } from '../../react-easy-formrender';
import defaultComponents, { convertComponents } from '../form-render/configs/components';
import defaultSettingsMap from '../form-render/configs/settings';
import { useEventBus } from '../utils/hooks';
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
    eventBus: eventBus,
    settingsMap: Object.assign({}, defaultSettingsMap),
    components: convertComponents(defaultComponents),
    properties: {},
    selected: {},
    historyData: {
      index: -1,
      maxStep: 20,
      steps: []
    },
    settingsForm: null,
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