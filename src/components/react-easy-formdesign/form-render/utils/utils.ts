import { FormStore, isValidNumber } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { deepGet, deepMergeObject } from '@/utils/object';
import { evalString, uneval } from '@/utils/string';
import { nanoid } from 'nanoid';
import { ConfigSetting, ConfigSettingsType } from '../../form-designer/configs';
import { SelectedType } from '../../form-designer/designer-context';
import { ELementProps } from '../components';

export const defaultGetId = (key?: string) => {
  return typeof key == 'string' ? `${key.replace(/\./g, '')}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

// name的setting
export const getNameSetting = (selected?: SelectedType) => {
  const selectedPath = selected?.path;
  // const selectedField = selected?.field;
  const attributeName = selected?.attributeName;
  if (attributeName) return;
  // 获取选中的字段值
  const endName = getPathEnd(selectedPath);
  if (isNoSelected(endName)) return;
  // 非数组节点可以设置name
  if (!isValidNumber(endName)) {
    return {
      name: {
        label: '字段名',
        type: 'Input'
      }
    };
  }
}

// 获取当前选中位置序号
export const getSelectedIndex = (selected?: SelectedType) => {
  if (isNoSelected(selected?.path)) return -1;
  const index = selected?.field?.index as number;
  return typeof index === 'number' ? index : -1;
}

// 根据节点的配置返回节点的初始值
const getSettingInitial = (setting?: ConfigSetting) => {
  // 从配置表单中获取初始属性
  const expandSetting = Object.values(setting || {}).reduce((pre, cur) => {
    const result = deepMergeObject(pre, cur);
    return result;
  }, {});
  const initialValues = getInitialValues(expandSetting);
  return initialValues;
}

// 根据配置键名获取配置
export const getConfigItem = (key: string | undefined, components?: { [key: string]: ELementProps }, settings?: ConfigSettingsType) => {
  if (!key || !components) return;
  const item = components[key];
  const itemSetting = settings?.[key];
  const initialValues = getSettingInitial(itemSetting);
  const field = deepMergeObject(initialValues, item);
  return field;
}

// 根据路径获取节点的值和属性
export const getDesignerItem = (designer?: FormRenderStore, path?: string, attributeName?: string) => {
  if (isNoSelected(path) || !designer) return;
  const item = designer.getItemByPath(path, attributeName) || {};
  return item;
}

// 插入新节点
export const insertDesignItem = (designer?: FormRenderStore, data?: ELementProps, index?: number, parent?: { path?: string, attributeName?: string }) => {
  if (!designer) return;
  const { path, attributeName } = parent || {};
  const parentItem = designer && designer.getItemByPath(path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const isInArray = childs instanceof Array;
  if (isInArray) {
    designer?.insertItemByIndex(data, index, parent);
  } else {
    if (data?.type) {
      const newName = defaultGetId(data?.type);
      const newData = { [newName]: data };
      designer?.insertItemByIndex(newData, index, parent);
    }
  }
}

// 更新节点的属性(不包括值)
export const updateDesignerItem = (designer: FormRenderStore | undefined, data: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path) || !designer) return;
  if (attributeName) {
    // 设置属性节点
    designer?.updateItemByPath(data, path, attributeName);
  } else {
    // 更新表单节点
    const { name, ...rest } = data || {};
    if (rest) {
      designer?.updateItemByPath(rest, path);
    }
    if (name) {
      designer?.updateNameByPath(name, path);
    }
  }
}

// 覆盖设置节点的属性(不包括值)
export const setDesignerItem = (designer: FormRenderStore | undefined, data: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path) || !designer) return;
  if (attributeName) {
    // 设置属性节点
    designer?.setItemByPath(data, path, attributeName);
  } else {
    // 设置表单节点
    const { name, ...rest } = data || {};
    if (rest) {
      designer?.setItemByPath(rest, path);
    }
    if (name) {
      designer?.updateNameByPath(name, path);
    }
  }
}

// 设置设计器区域的表单值
export const setDesignerFormValue = (designerForm?: FormStore, formPath?: string, initialValue?: any) => {
  if (isNoSelected(formPath) || !formPath || !designerForm) return;
  if (initialValue !== undefined) {
    designerForm?.setFieldValue(formPath, initialValue);
  }
}

// 同步目标的编辑区域值到属性面板回显
export const asyncSettingForm = (settingForm?: FormStore, selected?: SelectedType) => {
  if (isNoSelected(selected?.path) || !settingForm) return;
  const field = selected?.field;
  const attributeName = selected?.attributeName;
  const currentField = attributeName ? deepGet(field, attributeName) : field;
  const endName = getPathEnd(selected?.path);
  const settingValues = attributeName ? currentField : { ...currentField, name: endName }
  settingForm.setFieldsValue({ ...settingValues, initialValue: currentField?.initialValue });
}

// 代码编辑器执行解析字符串
export const handleEvalString = (codeStr?: string) => {
  if (typeof codeStr !== 'string') return;
  return evalString(codeStr);
}

// 代码编辑器序列化目标为字符串
export const handleStringify = (val: any) => {
  if (typeof val === 'string') {
    return val
  } else {
    return uneval(val)
  }
}