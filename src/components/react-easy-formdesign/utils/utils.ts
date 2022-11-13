import { FieldProps, FormStore } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { nanoid } from 'nanoid';
import { ELementProps } from '../components';

export const defaultGetId = (name?: string) => {
  return name ? `${name}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

export interface Designer {
  store: FormRenderStore
  form: FormStore
}

// 获取节点的值和属性
export const getSelectedValues = ({ store, form }: Designer, selected: string, initialForm?: ELementProps['settings']) => {
  const oldValues = store.getItemByPath(selected) || {};
  if (!endIsListItem(selected)) {
    oldValues['name'] = getPathEnd(selected);
  }
  const initialValues = getInitialValues(initialForm);
  const lastValues = { ...initialValues, ...oldValues };
  return lastValues;
}

// 更新节点的值和属性
export const updateSelectedValues = ({ store, form }: Designer, selected: string, settingValues: FieldProps) => {
  if (isNoSelected(selected)) return;
  const { name, ...field } = settingValues || {};
  // 更新控件的值
  form?.setInitialValues(selected, field?.initialValue);
  // 更新控件的属性
  store?.updateItemByPath(selected, field);
  // 更新控件的字段名
  if (name) {
    store?.updateNameByPath(selected, name);
  }
}

// 覆盖设置节点的值和属性
export const setSelectedValues = ({ store, form }: Designer, selected: string, settingValues: FieldProps) => {
  if (isNoSelected(selected)) return;
  const { name, ...field } = settingValues || {};
  // 更新控件的值
  form?.setInitialValues(selected, field?.initialValue);
  // 覆盖设置控件的属性
  store?.setItemByPath(selected, field);
  // 更新控件的字段名
  if (name) {
    store?.updateNameByPath(selected, name);
  }
}

// 根据路径获取节点的配置表单
export const getSelectedSettings = ({ store, form }: Designer, selected: string, settingsForm?: ELementProps['settings']) => {
  const selectedItem = store.getItemByPath(selected);
  const originSettings = selectedItem?.['settings']; // 节点的setting初始设置
  let baseSettings = { ...originSettings, ...settingsForm };
  // 非列表节点设置字段名
  if (!endIsListItem(selected)) {
    baseSettings = {
      name: {
        label: '字段名',
        type: 'Input'
      },
      ...baseSettings
    };
  }
  return baseSettings;
}