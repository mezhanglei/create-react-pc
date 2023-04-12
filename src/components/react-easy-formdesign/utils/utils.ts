import { FormStore, isValidNumber, joinFormPath } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { getInitialValues } from '@/components/react-easy-formrender/utils/utils';
import { deepMergeObject, deepClone } from '@/utils/object';
import { evalString, uneval } from '@/utils/string';
import { isEmpty } from '@/utils/type';
import { nanoid } from 'nanoid';
import { ConfigElementsMap, ELementProps } from '../form-designer/components/configs';
import ConfigSettings, { ConfigSettingsItem } from '../form-designer/components/settings';
import { SelectedType } from '../form-designer/designer-context';

export const defaultGetId = (name?: string) => {
  return name ? `${name}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

// 从selected中解构
export const getFromSelected = (selected: SelectedType) => {
  if (typeof selected !== 'object') return;
  const selectedName = selected?.name;
  const selectedField = selected?.field;
  const selectedParent = selected?.parent;
  const selectedFormParent = selected?.formparent;
  const selectedPath = isEmpty(selectedName) ? undefined : joinFormPath(selectedParent, selectedName) as string;
  const selectedFormPath = isEmpty(selectedName) ? undefined : joinFormPath(selectedFormParent, selectedField?.ignore ? undefined : selectedName) as string;
  return { selected, selectedPath, selectedFormPath };
}

// name的setting
export const getNameSettings = (selected?: SelectedType) => {
  if (isNoSelected(selected?.name)) return;
  // 非数组节点以及非属性节点可以设置name
  if (!isValidNumber(selected?.name) && !selected?.attributeName) {
    return {
      name: {
        label: '字段名',
        type: 'Input'
      }
    };
  }
}

// 获取当前选中位置序号
export const getSelectedIndex = (designer: FormRenderStore, selected?: SelectedType) => {
  const parent = designer.getItemByPath(selected?.parent);
  const childProperties = selected?.parent ? parent?.properties : parent;
  const keys = Object.keys(childProperties || {});
  const index = selected?.name ? keys?.indexOf(selected?.name) : -1;
  return index;
}

// 根据id获取对应的配置的field
export const getConfigField = (id?: string) => {
  if (!id) return;
  const item = ConfigElementsMap[id];
  const configSettings = getConfigSettings(item?.id);
  const field = deepMergeObject(item, getInitialValues(configSettings));
  return field;
}

// 获取节点的值和属性
export const getDesignerItem = (designer: FormRenderStore, path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
  let curValues = designer.getItemByPath(path, attributeName) || {};
  const configSettings = getConfigSettings(curValues?.id);
  // 从配置表单中获取初始属性
  const initialValues = getInitialValues(configSettings);
  const result = deepMergeObject(initialValues, curValues);
  return result;
}

// 插入新节点
export const insertDesignItem = (designer: FormRenderStore, path: string | undefined, index?: number, data?: ELementProps) => {
  const parentField = designer && designer.getItemByPath(path);
  const isInArray = parentField?.properties instanceof Array || parentField instanceof Array;
  if (isInArray) {
    designer?.addItemByIndex(data, index, path);
  } else {
    if (data?.id) {
      const dataKey = defaultGetId(data?.id);
      const newData = { [dataKey]: data };
      designer?.addItemByIndex(newData, index, path);
    }
  }
}

// 更新节点的属性(不包括值)
export const updateDesignerItem = (designer: FormRenderStore, data: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
  if (attributeName) {
    // 设置attribute节点
    designer?.updateItemByPath(data, path, attributeName);
  } else {
    const { name, ...rest } = data || {};
    if (rest) {
      designer?.updateItemByPath(rest, path);
    }
    if (name) {
      designer?.updateNameByPath(path, name);
    }
  }
}

// 覆盖设置节点的属性(不包括值)
export const setDesignerItem = (designer: FormRenderStore, data: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
  if (attributeName) {
    // 设置attribute节点
    designer?.setItemByPath(data, path, attributeName);
  } else {
    const { name, ...rest } = data || {};
    // 覆盖设置控件的属性
    if (rest) {
      designer?.setItemByPath(rest, path);
    }
    // 更新控件的字段名
    if (name) {
      designer?.updateNameByPath(path, name);
    }
  }
}

// 设置设计器区域的表单值
export const setDesignerFormValue = (designerForm: FormStore, formPath?: string, initialValue?: any) => {
  if (isNoSelected(formPath) || !formPath) return;
  if (initialValue !== undefined) {
    designerForm?.setFieldValue(formPath, initialValue);
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
  const cloneModule = deepClone(settingsModule);
  if (!cloneModule?.length) return;
  let totalSettings = {};
  for (let i = 0; i < cloneModule?.length; i++) {
    // 遍历获取当前的配置项
    const item = cloneModule[i][1];
    totalSettings = deepMergeObject(totalSettings, item);
  }
  return totalSettings;
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