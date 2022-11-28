import { FieldProps, FormStore } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { nanoid } from 'nanoid';
import { ELementProps } from '../components/configs';
import CommonSettings from '../components/settings';

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
export const getSelectedValues = (designer: FormRenderStore, selectedPath: string, initialForm?: ELementProps['settings']) => {
  const oldValues = designer.getItemByPath(selectedPath) || {};
  if (!endIsListItem(selectedPath)) {
    oldValues['name'] = getPathEnd(selectedPath);
  }
  const initialValues = getInitialValues(initialForm);
  const lastValues = { ...initialValues, ...oldValues };
  return lastValues;
}

// 更新节点的值和属性
export const updateSelectedValues = (designer: FormRenderStore, designerForm: FormStore, selectedPath: string, settingValues: FieldProps) => {
  if (isNoSelected(selectedPath)) return;
  const { name, ...field } = settingValues || {};
  // 更新控件的值
  designerForm?.setFieldValue(selectedPath, field?.initialValue);
  // 更新控件的属性
  designer?.updateItemByPath(selectedPath, field);
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(selectedPath, name);
  }
}

// 覆盖设置节点的值和属性
export const setSelectedValues = (designer: FormRenderStore, designerForm: FormStore, selectedPath: string, settingValues: FieldProps) => {
  if (isNoSelected(selectedPath)) return;
  const { name, ...field } = settingValues || {};
  // 更新控件的值
  designerForm?.setFieldValue(selectedPath, field?.initialValue);
  // 覆盖设置控件的属性
  designer?.setItemByPath(selectedPath, field);
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(selectedPath, name);
  }
}

// 根据路径获取节点的配置表单
export const getSelectedSettings = (designer: FormRenderStore, selectedPath: string, settingsForm?: ELementProps['settings']) => {
  const selectedItem = designer.getItemByPath(selectedPath);
  const originSettings = selectedItem?.['settings']; // 节点的setting初始设置
  const commonSettings = CommonSettings[selectedItem?.source]; // 配置节点类型对应的公共设置
  let baseSettings = { ...originSettings, ...commonSettings, ...settingsForm };
  // 非列表节点设置字段名
  if (!endIsListItem(selectedPath)) {
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