import { FieldProps, FormStore, joinFormPath } from '@/components/react-easy-formcore';
import { FormRenderStore } from '@/components/react-easy-formrender';
import { endIsListItem, getInitialValues, getPathEnd } from '@/components/react-easy-formrender/utils/utils';
import { deepMergeObject, deepClone } from '@/utils/object';
import { evalString, uneval } from '@/utils/string';
import { isEmpty } from '@/utils/type';
import { nanoid } from 'nanoid';
import { ELementProps } from '../form-designer/components/configs';
import ConfigSettings, { ConfigSettingsItem } from '../form-designer/components/settings';
import { SelectedType } from '../form-designer/designer-context';

export const defaultGetId = (name?: string) => {
  return name ? `${name}_${nanoid(6)}` : '';
};

// 失去选中
export const isNoSelected = (path?: string) => {
  if (!path || path === '#') return true;
}

// 获取节点的值和属性
export const getDesignerItem = (designer: FormRenderStore, path?: string) => {
  if (isNoSelected(path)) return;
  const curValues = designer.getItemByPath(path) || {};
  if (!isIgnoreName(path)) {
    curValues['name'] = getPathEnd(path);
  }
  const configSettings = getConfigSettings(curValues?.id);
  // 从配置表单中获取初始属性
  const initialValues = getInitialValues(configSettings);
  const result = deepMergeObject(initialValues, curValues);
  return result;
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

// 插入新节点
export const insertDesignItem = (designer: FormRenderStore, field: ELementProps, dropIndex: number, parent?: string, isIgnoreItem?: boolean) => {
  const newField = (!isIgnoreItem && field?.id) ? { ...field, name: defaultGetId(field?.id) } : field;
  designer?.addItemByIndex(newField, dropIndex, parent);
}

// 更新节点的属性(不包括值)
export const updateDesignerItem = (designer: FormRenderStore, path?: string, settingValues?: FieldProps) => {
  if (isNoSelected(path)) return;
  const { name, ...field } = settingValues || {};
  if (field) {
    // 更新控件的属性
    designer?.updateItemByPath(path, field);
  }
  // 更新控件的字段名
  if (name) {
    designer?.updateNameByPath(path, name);
  }
}

// 设置设计器区域的表单值
export const setDesignerFormValue = (designerForm: FormStore, formPath?: string, initialValue?: any) => {
  if (isNoSelected(formPath) || !formPath) return;
  if (initialValue !== undefined) {
    designerForm?.setFieldValue(formPath, initialValue);
  }
}

// 覆盖设置节点的属性(不包括值)
export const setDesignerItem = (designer: FormRenderStore, path?: string, settingValues?: FieldProps) => {
  if (isNoSelected(path)) return;
  const { name, ...field } = settingValues || {};
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

// 是否设置忽略name设置
export const isIgnoreName = (path?: string) => {
  if (isNoSelected(path)) return;
  // 数组节点
  return endIsListItem(path)
}

// name的setting
export const getNameSettings = (path?: string, attributeName?: string) => {
  if (isNoSelected(path)) return;
  // 非列表节点设置字段名
  if (!isIgnoreName(path)) {
    if (attributeName) {
      return {
        [attributeName]: {
          label: '字段名',
          type: 'Input'
        }
      };
    }
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