import { FormStore, isValidNumber } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { deepMergeObject } from '@/utils/object';
import { evalString, uneval } from '@/utils/string';
import { nanoid } from 'nanoid';
import { ConfigElementsMap, ELementProps } from '../form-designer/components/configs';
import getConfigSettings from '../form-designer/components/settings';
import { SelectedType } from '../form-designer/designer-context';

export const defaultGetId = (id?: string) => {
  return id ? `${id}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

// 从selected中解构
export const getFromSelected = (selected?: SelectedType) => {
  if (typeof selected !== 'object') return {};
  return { selected };
}

// name的setting
export const getNameSettings = (designer: FormRenderStore, selected?: SelectedType) => {
  const selectedPath = selected?.path;
  const attributeName = selected?.attributeName;
  const item = designer && getDesignerItem(designer, selectedPath, attributeName);
  // 获取选中的字段值
  const endName = attributeName ? item?.name : getPathEnd(selectedPath);
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
export const getSelectedIndex = (designer: FormRenderStore, selected?: SelectedType) => {
  const selectedParentPath = selected?.parent?.path;
  const endName = getPathEnd(selected?.path);
  const parent = designer.getItemByPath(selectedParentPath);
  const childProperties = selectedParentPath ? parent?.properties : parent;
  const keys = Object.keys(childProperties || {});
  const index = endName ? keys?.indexOf(endName) : -1;
  return index;
}

// 根据id获取对应的配置的field
export const getConfigField = (id?: string) => {
  if (!id) return;
  const item = ConfigElementsMap[id];
  const configSettings = getConfigSettings(item?.id, item?.subId);
  const expandSettings = Object.values(configSettings || {}).reduce((pre, cur) => {
    const result = { ...pre, ...cur };
    return result;
  }, {});
  const field = deepMergeObject(item, getInitialValues(expandSettings));
  return field;
}

// 获取节点的值和属性
export const getDesignerItem = (designer: FormRenderStore, path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
  let curValues = designer.getItemByPath(path, attributeName) || {};
  const configSettings = getConfigSettings(curValues?.id, curValues?.subId);
  // 从配置表单中获取初始属性
  const expandSettings = Object.values(configSettings || {}).reduce((pre, cur) => {
    const result = deepMergeObject(pre, cur);
    return result;
  }, {});
  const initialValues = getInitialValues(expandSettings);
  const result = deepMergeObject(initialValues, curValues);
  return result;
}

// 插入新节点
export const insertDesignItem = (designer: FormRenderStore, data?: ELementProps, index?: number, parent?: { path?: string, attributeName?: string }) => {
  const { path, attributeName } = parent || {};
  const parentItem = designer && designer.getItemByPath(path, attributeName);
  const childs = attributeName ? parentItem : (path ? parentItem?.properties : parentItem);
  const isInArray = childs instanceof Array;
  if (isInArray) {
    designer?.insertItemByIndex(data, index, parent);
  } else {
    if (data?.id) {
      const newName = defaultGetId(data?.id);
      const newData = { [newName]: data };
      designer?.insertItemByIndex(newData, index, parent);
    }
  }
}

// 更新节点的属性(不包括值)
export const updateDesignerItem = (designer: FormRenderStore, data: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
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
export const setDesignerItem = (designer: FormRenderStore, data: any, path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
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
export const setDesignerFormValue = (designerForm: FormStore, formPath?: string, initialValue?: any) => {
  if (isNoSelected(formPath) || !formPath) return;
  if (initialValue !== undefined) {
    designerForm?.setFieldValue(formPath, initialValue);
  }
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