import { Form } from 'antd';
import React, { useEffect, useState, useRef, useContext } from 'react';
import styles from './table-components.module.less';
import classnames from 'classnames';
import { isBoolean, isEmpty, isFunction } from '@/utils/type';
import { EditableContext } from './edit-table';
import { EditTableColProps, EditableRowProps, SaveCellFn } from './types';

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
export const EditTableCol: React.FC<EditTableColProps> = (props) => {
  const {
    children,
    title,
    dataIndex,
    renderFormItem,
    suffix,
    rules,
    editStyle,
    disabled,
    rowData,
    handleSave,
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
  const toggleEdit = () => {
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
      toggleEdit();
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
        {renderFormItem && renderFormItem({ ...props, save, toggleEdit, form }, inputRef)}
      </Form.Item>
    );
  };

  // 切换编辑后的组件
  const switchNode = () => {
    const prefix = 'editable-cell-value-wrap';
    const cls = classnames(styles[`${prefix}`], {
      [styles[`${prefix}-disabled`]]: isDisabled
    });

    const childs = children?.filter((child: unknown) => !isEmpty(child));
    
    return (
      <div className={cls} style={{ ...editStyle }} onClick={toggleEdit}>
        {childs?.length ? childs : <span className={styles['placeholder-txt']}>请选择</span>}
      </div>
    );
  };

  // 后缀组件
  const suffixNode = typeof suffix === 'function' ? suffix({ ...props, save, toggleEdit, form }, inputRef) : suffix;
  return (
    <td {...restProps}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {renderFormItem ? (editing ? editNode() : switchNode()) : children}
        {suffixNode}
      </div>
    </td>
  );
};