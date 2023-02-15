import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Modal, Row } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useRef, useState } from "react";
import './list.less';
import Icon from "@/components/svg-icon";

export interface LinkageListProps {
  value?: string;
  onChange?: (val?: string) => void
}

const prefixCls = 'linkage-list';
const classes = {
  item: `${prefixCls}-item`
}

/**
 * 生成联动校验规则
 */
const LinkageList: React.FC<LinkageListProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  const [dataSource, setDataSource] = useState<any[]>();

  useEffect(() => {
    setDataSource(value || intialValue);
  }, [value]);

  const labelChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'label');
  }

  const valueChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'value');
  }

  // 更新目标数据
  const updateItem = (data: any, rowIndex: number, rowKey?: string) => {
    const cloneData = dataSource ? [...dataSource] : [];
    const item = cloneData?.[rowIndex] ?? {};
    if (rowKey) {
      item[rowKey] = data;
    } else {
      cloneData[rowIndex] = data;
    }
    setDataSource(cloneData);
    dataSourceChange(cloneData);
  }

  // 新增一行
  const addItem = () => {
    const isHaveEmpty = dataSource?.find((item) => isEmpty(item?.label) || isEmpty(item?.value));
    if (isHaveEmpty) {
      message.info('请填写完整')
      return;
    }
    const newData = dataSource?.concat(intialItem);
    setDataSource(newData);
  }

  // 删除一行
  const deleteItem = (rowIndex: number) => {
    if (!dataSource) return;
    const newData = [...dataSource]
    newData.splice(rowIndex, 1);
    setDataSource(newData);
    dataSourceChange(newData);
  }

  // dataSource变更
  const dataSourceChange = (data: any[]) => {
    onChange && onChange(data);
  }

  return (
    <div>
      {
        dataSource?.map((item, index) => {
          return (
            <Row key={index} className={classes.item} gutter={12}>
              <Col span={10}>
                <Input value={item?.label} onChange={(e) => labelChange(e, index)} placeholder="label" style={{ width: '100%' }} />
              </Col>
              <Col span={10}>
                <Input value={item?.value} onChange={(e) => valueChange(e, index)} placeholder="value" style={{ width: '100%' }} />
              </Col>
              <Col span={4}>
                <Icon name="delete" className="icon-delete" onClick={() => deleteItem(index)} />
              </Col>
            </Row>
          )
        })
      }
      <Button type="link" onClick={addItem}>
        添加选项
      </Button>
    </div>
  );
});

export default LinkageList;

// 代码编辑器弹窗
export const LinkageListModal = (
  props: LinkageListProps & {
    onClose?: () => void;
    disabled?: boolean;
  }) => {

  const {
    value,
    onChange,
    onClose,
    disabled,
  } = props;

  const [visible, setVisible] = useState<boolean>()
  const [codeStr, setCodeStr] = useState<string>();

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    onChange && onChange(codeStr)
    closeModal()
  }

  const closeModal = () => {
    setVisible(false);
    onClose && onClose();
  }

  const handleOnChange = (val?: string) => {
    setCodeStr(val)
  }

  return (
    <>
      <div>
        <span>{codeStr}</span>
        <Button type="link" disabled={disabled} onClick={showModal}>添加联动</Button>
      </div>
      <Modal
        destroyOnClose
        title="添加联动"
        visible={visible}
        onCancel={closeModal}
        onOk={handleOk}>
        <LinkageList
          value={value}
          onChange={handleOnChange}
        />
      </Modal>
    </>
  );
};
