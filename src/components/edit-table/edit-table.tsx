import { Form, Table } from 'antd';
import React, { useEffect, useState, useRef, useContext, ReactNode } from 'react';
import styles from './edit-table.module.less';
import classnames from 'classnames';
import { isBoolean, isFunction, isObject } from '@/utils/type';
import { getGUID } from '@/utils/common';

/**
 * 可编辑表格组件：支持表格嵌入外来输入控件，只需要将props.save方法暴露给输入控件使用.输入控件需要遵循antd的form控件标准（onChange输出，value引入）
 * 使用方式：继承antd的table的一切方法，同时支持了拓展参数和方法
 */

// table组件的props
export interface EditTableProps {
  form?: any; // 外部表单容器，如果需要则传（目前不需要）
  onChange?: (dataSource: any[], record: any, col?: any) => any; // 表格的onChange事件
  onSave?: (dataSource: any[], record: any, col?: any) => any; // 表格的保存事件
  onDelete?: (dataSource: any[], record: any, col?: any) => any; // 表格的删除事件
  value?: any[]; // value，用来给组件赋值
  columns: any[]; // columns渲染列
  className?: string; // 类名
  [propName: string]: any;
}

// table实例方法
export interface EditTableRef {
  updateCell: (record: any, col?: any) => any; // 更新
  deleteTableRow: (record: any) => any; // 删除
  addTableRow: () => any; // 新增
}

// column渲染可传的参数
export interface ColumnProps {
  title: React.ReactNode; // 列的名
  editable: boolean; // 控制表格列是否为可输入控件
  children?: any;
  dataIndex: string; // 列的渲染字段
  record: RecordInterface; // 行的数据
  handleSave: (record: RecordInterface) => void; // 更新保存
  renderEditCell: (props: any, inputRef: any) => any; // 渲染编辑框组件
  rules: any[]; // 校验规则, 格式为antd的form的rules校验格式
  editStyle: object; // 编辑区域容器的样式
  disabled: boolean | ((props: any) => boolean); // 是否禁止点击
  extra: (props: any) => any; // 单元格内额外的组件
  [propName: string]: any;
}

const EditTable = React.forwardRef<EditTableRef, EditTableProps>((props, ref) => {
  const { onChange, onSave, onDelete, value, columns, className, ...restProps } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // ref转发实例方法
  React.useImperativeHandle(ref, () => ({
    updateCell: updateCell,
    deleteTableRow: handleDelete,
    addTableRow: addTableRow
  }));

  useEffect(() => {
    setDataSource(value || [{}]);
  }, [JSON.stringify(value)]);

  // 触发保存事件， record表示当前操作的行
  const handleSave = (record: any, col: any) => {
    updateCell(record, col);
    onSave && onSave(record, col);
  };

  // 点击添加
  const addTableRow = () => {
    const newData = {
      key: getGUID(),
      cityName: '',
      address: ''
    };
    const newDataSource = [...dataSource, newData];
    setDataSource(newDataSource);
  };

  // 删除行
  const handleDelete = (record: any) => {
    // 本地删除
    const newDataSource = [...dataSource]?.filter((item) => item.key !== record.key);
    setDataSource(newDataSource);
    onChange && onChange(newDataSource, record);
    onDelete && onDelete(newDataSource, record);
  };

  // 修改表格
  const updateCell = (record: any, col?: any): any => {
    const newDataSource = [...dataSource];
    const index = newDataSource.findIndex((item) => record.key === item.key);
    const item = newDataSource[index];
    newDataSource.splice(index, 1, {
      ...item,
      ...record
    });
    setDataSource(newDataSource);
    onChange && onChange(newDataSource, record, col);
    return newDataSource;
  };

  // 覆盖默认的table元素
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };

  // 包装渲染列数组
  const editColumns = columns?.map((col) => {
    // editable为true的column可以编辑， false的不可编辑
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      // 传递给cell组件的参数
      onCell: (record: any) => ({
        record,
        handleSave: (row: any) => handleSave(row, col),
        ...col
      })
    };
  });

  return (
    <Table
      tableLayout="fixed"
      className={classnames('small-cell fixed-table', className)}
      rowKey="key"
      components={components}
      columns={editColumns}
      dataSource={dataSource || []}
      {...restProps}
    />
  );
});

export default EditTable;


const EditableContext = React.createContext<any>(null);

export interface RecordInterface {
  key: string;
  fullData: object; // 完整的数据
  [propName: string]: any;
}

// 自定义行
export interface EditableRowProps {
  index: number;
}
const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
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
const EditableCell: React.FC<ColumnProps> = (props) => {
  const {
    title, // 当前列的名字
    editable, // 编辑状态
    children, // 当前单元格的children
    dataIndex, // 当前字段
    record, // 当前行的数据
    handleSave, // 触发保存
    renderEditCell, // 可编辑的单元格渲染
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
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  // 保存当前cell结果(select控件需要处理数据)
  const save = async (value: string | { label: string }) => {
    try {
      // 将完整数据存储起来
      const { fullData = {} } = record;
      (fullData as any)[dataIndex] = value;
      // 仅仅用来表格显示的数据(传给handleSave修改dataSource)
      record[dataIndex] = isObject(value) ? (value as { label: string })?.label : value;
      handleSave({ ...record, fullData });
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

    // 默认的render选项
    const childrenList = children?.filter((child: ReactNode) => !!child);
    return (
      <div className={cls} style={{ ...editStyle }} onClick={switchEdit} title={childrenList}>
        {childrenList?.length ? childrenList : <span className={styles['placeholder-txt']}>请选择</span>}
      </div>
    );
  };

  // 额外的组件
  const extraNode = extra && extra({ ...props });

  return (
    <td {...restProps}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {editable ? (editing ? editNode() : switchNode()) : children}
        {extraNode}
      </div>
    </td >
  );
};
