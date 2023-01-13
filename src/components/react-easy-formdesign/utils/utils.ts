import { FieldProps, FormStore } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { deepMergeObject } from '@/utils/object';
import { evalString, uneval } from '@/utils/string';
import { nanoid } from 'nanoid';
import { ELementProps, ElementsType } from '../form-designer/components/configs';
import CommonSettings, { CommonSettingsItem } from '../form-designer/components/settings';

export const defaultGetId = (name?: string) => {
  return name ? `${name}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

// 获取节点的值和属性
export const getDesignerItem = (designer: FormRenderStore, path: string) => {
  if (isNoSelected(path)) return;
  const curValues = designer.getItemByPath(path) || {};
  if (!endIsListItem(path)) {
    curValues['name'] = getPathEnd(path);
  }
  const expandSettings = getExpandSettings(designer, path);
  // 从配置表单中获取初始属性
  const initialValues = getInitialValues(expandSettings);
  const result = deepMergeObject(initialValues, curValues);
  return result;
}

// 更新节点的值和属性
export const updateDesignerItem = (designer: FormRenderStore, designerForm: FormStore, path: string, settingValues: FieldProps) => {
  if (isNoSelected(path)) return;
  const { name, ...field } = settingValues || {};
  // 同步控件的值
  if (field?.initialValue !== undefined) {
    designerForm?.setFieldValue(path, field?.initialValue);
  }
  if (field) {
    // 更新控件的属性
    designer?.updateItemByPath(path, field);
  }
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(path, name);
  }
}

// 覆盖设置节点的值和属性
export const setDesignerItem = (designer: FormRenderStore, designerForm: FormStore, path: string, settingValues: FieldProps) => {
  if (isNoSelected(path)) return;
  const { name, ...field } = settingValues || {};
  // 同步控件的值
  if (field?.initialValue !== undefined) {
    designerForm?.setFieldValue(path, field?.initialValue);
  }
  // 覆盖设置控件的属性
  if (field) {
    designer?.setItemByPath(path, field);
  }
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(path, name);
  }
}

// 获取路径节点获取当前的属性配置(components/configs中控件的settings属性)
export const getCurSettings = (designer: FormRenderStore, path: string): ElementsType | undefined => {
  if (isNoSelected(path)) return;
  const selectedItem = designer.getItemByPath(path);
  const originSettings = selectedItem?.['settings'];
  let baseSettings = originSettings;
  // 非列表节点设置字段名
  if (!endIsListItem(path)) {
    baseSettings = {
      name: {
        label: '字段名',
        type: 'Input'
      },
      ...originSettings
    };
  }
  return baseSettings;
}

// 根据路径节点获取公共配置(components/settings配置其他属性)
export const getCommonSettingsList = (designer: FormRenderStore, path: string): CommonSettingsItem | undefined => {
  if (isNoSelected(path)) return;
  const selectedItem = designer.getItemByPath(path) as ELementProps;
  const commonSettingsList = selectedItem?.id ? CommonSettings[selectedItem?.id] : []
  return commonSettingsList;
}

// 根据路径节点获取展平的配置
export const getExpandSettings = (designer: FormRenderStore, path: string) => {
  if (isNoSelected(path)) return;
  const curSettings = getCurSettings(designer, path);
  const commonSettingsList = getCommonSettingsList(designer, path);
  if (!commonSettingsList?.length) return curSettings;
  let expandSettings = {};
  for (let i = 0; i < commonSettingsList?.length; i++) {
    // 遍历获取当前的配置项
    const item = commonSettingsList[i][1];
    expandSettings = { ...expandSettings, ...item };
  }
  return { ...curSettings, ...expandSettings }
}

// 代码编辑器执行解析字符串
export const handleEvalString = (codeStr?: string) => {
  if (!codeStr) return;
  // 是否为纯字符串
  const isonlyStr = codeStr?.indexOf('[') == -1 && codeStr?.indexOf('{') == -1;
  if (!isonlyStr) {
    return evalString(codeStr)
  }
  return codeStr;
}

// 代码编辑器序列化目标为字符串
export const handleStringify = (val: any) => {
  if (typeof val === 'string') {
    return val
  } else {
    return uneval(val)
  }
}