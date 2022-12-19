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

// 获取节点的值和属性
export const getSelectedValues = (designer: FormRenderStore, selectedPath: string) => {
  if (isNoSelected(selectedPath)) return;
  const curValues = designer.getItemByPath(selectedPath) || {};
  if (!endIsListItem(selectedPath)) {
    curValues['name'] = getPathEnd(selectedPath);
  }
  const expandSettings = getExpandSettings(designer, selectedPath); // 选中节点已存在的配置表单
  const lastValues = getInitialValues(expandSettings);
  console.log(lastValues, 222)
  const result = { ...lastValues, ...curValues };
  return result;
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

// 获取路径节点获取当前的属性配置(components/configs中控件的settings属性)
export const getCurSettings = (designer: FormRenderStore, selectedPath: string) => {
  if (isNoSelected(selectedPath)) return;
  const selectedItem = designer.getItemByPath(selectedPath);
  const originSettings = selectedItem?.['settings'];
  let baseSettings = originSettings;
  // 非列表节点设置字段名
  if (!endIsListItem(selectedPath)) {
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

// 根据路径节点获取其他配置(components/settings配置其他属性)
export const getOtherSettingsList = (designer: FormRenderStore, selectedPath: string) => {
  if (isNoSelected(selectedPath)) return;
  const selectedItem = designer.getItemByPath(selectedPath) as ELementProps;
  const otherSettingsList = selectedItem?.source ? CommonSettings[selectedItem?.source] : []
  return otherSettingsList;
}

// 根据路径节点获取展平的配置
export const getExpandSettings = (designer: FormRenderStore, selectedPath: string) => {
  if (isNoSelected(selectedPath)) return;
  const curSettings = getCurSettings(designer, selectedPath);
  const otherSettingsList = getOtherSettingsList(designer, selectedPath);
  let expandSettings = {};
  for (let i = 0; i < otherSettingsList?.length; i++) {
    // 遍历获取当前的配置项
    const item = otherSettingsList[i][1];
    expandSettings = { ...expandSettings, ...item };
  }
  return { ...curSettings, ...expandSettings }
}
