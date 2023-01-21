import { FieldProps, FormStore } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { deepMergeObject } from '@/utils/object';
import { evalString, uneval } from '@/utils/string';
import { nanoid } from 'nanoid';
import ConfigSettings, { ConfigSettingsItem } from '../form-designer/components/settings';

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
  if (!isIgnoreName(designer, path)) {
    curValues['name'] = getPathEnd(path);
  }
  const configSettings = getConfigSettings(curValues?.id);
  // 从配置表单中获取初始属性
  const initialValues = getInitialValues(configSettings);
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

// 根据id获取控件配置模块(components/settings配置其他属性)
export const getSettingsModule = (id?: string): ConfigSettingsItem | undefined => {
  if (!id) return;
  const settingsModule = id ? ConfigSettings[id] : []
  return settingsModule;
}

// 根据id获取控件的配置(components/settings配置其他属性)
export const getConfigSettings = (id?: string) => {
  if (!id) return;
  const settingsModule = getSettingsModule(id);
  if (!settingsModule?.length) return;
  let totalSettings = {};
  for (let i = 0; i < settingsModule?.length; i++) {
    // 遍历获取当前的配置项
    const item = settingsModule[i][1];
    totalSettings = { ...totalSettings, ...item };
  }
  return totalSettings;
}

// 是否设置忽略name设置
export const isIgnoreName = (designer: FormRenderStore, path: string) => {
  if (isNoSelected(path)) return;
  const selectedItem = designer.getItemByPath(path);
  // 数组节点或标记ignore的忽略name设置
  return endIsListItem(path) || selectedItem?.dataType == 'ignore'
}

// 动态设置name
export const getNameSettings = (designer: FormRenderStore, path: string) => {
  if (isNoSelected(path)) return;
  // 非列表节点设置字段名
  if (!isIgnoreName(designer, path)) {
    return {
      name: {
        label: '字段名',
        type: 'Input'
      }
    };
  }
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