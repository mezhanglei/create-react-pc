import { FieldProps } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { nanoid } from 'nanoid';
import { ELementProps } from '../config';

export const defaultGetId = (name?: string) => {
  return name ? `${name}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

// 获取节点的值和属性
export const getSelectedValues = (designer: FormRenderStore, selected: string, initialForm?: ELementProps['settings']) => {
  const oldValues = designer.getItemByPath(selected) || {};
  if (!endIsListItem(selected)) {
    oldValues['name'] = getPathEnd(selected);
  }
  const initialValues = getInitialValues(initialForm);
  const lastValues = { ...initialValues, ...oldValues };
  return lastValues;
}

// 更新节点的值和属性
export const updateSelectedValues = (designer: FormRenderStore, selected: string, settingValues: FieldProps) => {
  if (isNoSelected(selected)) return;
  const { name, ...field } = settingValues || {};
  // 更新控件的值
  designer?.setInitialValues(selected, field?.initialValue);
  // 更新控件的属性
  designer?.updateItemByPath(selected, field);
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(selected, name);
  }
}

// 覆盖设置节点的值和属性
export const setSelectedValues = (designer: FormRenderStore, selected: string, settingValues: FieldProps) => {
  if (isNoSelected(selected)) return;
  const { name, ...field } = settingValues || {};
  // 更新控件的值
  designer?.setInitialValues(selected, field?.initialValue);
  // 覆盖设置控件的属性
  designer?.setItemByPath(selected, field);
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(selected, name);
  }
}

// 根据路径获取节点的配置表单
export const getSelectedSettings = (designer: FormRenderStore, selected: string, ) => {
  const selectedItem = designer.getItemByPath(selected);
  const originSettings = selectedItem?.['settings'];
  let baseSettings = { ...originSettings };
  // TODO：是否所有的表单节点都设置此属性
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