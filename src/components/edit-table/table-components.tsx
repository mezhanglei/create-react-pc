import { Form } from 'antd';
import React, { useEffect, useState, useRef, useContext } from 'react';
import styles from './table-components.module.less';
import classnames from 'classnames';
import { isBoolean, isFunction } from '@/utils/type';
import { deepGet } from '@/utils/object';
import { EditableContext } from './edit-table';
import { ColumnProps, EditableRowProps, SaveCellFn } from './types';

// 表格单元行
export const EditTableRow: React.FC<EditableRowProps> = ({ ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};


// 可编辑单元格
export const EditTableCol: React.FC<ColumnProps> = (props) => {
  const {
    title,
    children,
    dataIndex,
    rowData,
    editLabelPath,
    handleSave,
    renderEditCell,
    extra,
    rules,
    editStyle,
    disabled,
    ...restProps
  } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const inputRef = useRef<any>();
  const form = useContext(EditableContext);

  const isDisabled = isBoolean(disabled) ? disabled : (isFunction(disabled) && (disabled as any)(props));

  useEffect(() => {
    if (editing && !isDisabled) {
      inputRef.current && inputRef.current.focus();
    }
  }, [editing]);

  // 切换到编辑状态
  const switchEdit = () => {
    if (isDisabled) {
      return;
    }
    setEditing(!editing);
    // 切换到输入框将值设到表单里
    form.setFieldsValue({ [dataIndex]: rowData[dataIndex] });
  };

  // 保存当前cell结果(select控件需要处理数据)
  const save: SaveCellFn = async (value) => {
    try {
      rowData[dataIndex] = value;
      handleSave({ ...rowData }, props);
      switchEdit();
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  // 编辑时输入控件组件
  const editNode = () => {
    return (
      <Form.Item
        style={{ margin: 0, height: '32px', flexFlow: 'nowrap', ...editStyle }}
        name={dataIndex}
        rules={rules}
      >
        {renderEditCell && renderEditCell({ ...props, save, switchEdit, form }, inputRef)}
      </Form.Item>
    );
  };

  // 切换编辑后的组件
  const switchNode = () => {
    const prefix = 'editable-cell-value-wrap';
    const cls = classnames(styles[`${prefix}`], {
      [styles[`${prefix}-disabled`]]: isDisabled
    });

    const label = editLabelPath && deepGet(props, `rowData.${editLabelPath}`);
    return (
      <div className={cls} style={{ ...editStyle }} onClick={switchEdit} title={label}>
        {label ?? <span className={styles['placeholder-txt']}>请选择</span>}
      </div>
    );
  };

  // 额外的组件
  const extraNode = extra && extra({ ...props, save, switchEdit, form }, inputRef);
  return (
    <td {...restProps}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {renderEditCell ? (editing ? editNode() : switchNode()) : children}
        {extraNode}
      </div>
    </td >
  );
};