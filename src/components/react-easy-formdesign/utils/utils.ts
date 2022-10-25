import { FieldProps } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { nanoid } from 'nanoid';
import { ELementProps } from '../config';

export const defaultGetId = (name?: string) => {
  return name ? `${name}_${nanoid(6)}` : '';
};

// 获取节点的值和属性
export const getSelectedValues = (store: FormRenderStore, selected: string, initialForm?: ELementProps['settings']) => {
  const oldValues = store.getItemByPath(selected) || {};
  if (!endIsListItem(selected)) {
    oldValues['name'] = getPathEnd(selected);
  }
  const initialValues = getInitialValues(initialForm);
  const lastValues = { ...initialValues, ...oldValues };
  return lastValues;
}

// 更新节点的值和属性
export const updateSelectedValues = (store: FormRenderStore, selected: string, settingValues: FieldProps) => {
  if (!selected) return;
  const { name, ...field } = settingValues || {};
 // 更新控件的值
  store?.setInitialValues(selected, field?.initialValue);
   // 更新控件的属性
  store?.updateItemByPath(selected, field);
  // 更新控件的字段名
  if(name) {
    store?.updateNameByPath(selected, name);
  }
}

// 覆盖设置节点的值和属性
export const setSelectedValues = (store: FormRenderStore, selected: string, settingValues: FieldProps) => {
  if (!selected) return;
  const { name, ...field } = settingValues || {};
 // 更新控件的值
  store?.setInitialValues(selected, field?.initialValue);
   // 覆盖设置控件的属性
  store?.setItemByPath(selected, field);
  // 更新控件的字段名
  if(name) {
    store?.updateNameByPath(selected, name);
  }
}
