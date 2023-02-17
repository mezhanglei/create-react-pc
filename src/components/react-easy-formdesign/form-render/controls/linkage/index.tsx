import { isEmpty } from "@/utils/type";
import { Button, Col, Select, Input, message, Modal, Row } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useRef, useState } from "react";
import './index.less';
import Icon from "@/components/svg-icon";
import { useFormExpandControl, useTableData } from "@/components/react-easy-formdesign/utils/hooks";

export interface LinkageRulesProps {
  value?: string;
  onChange?: (val?: string) => void
}

// 集合类型
type AssembleType = '&&' | '||'
// 条件表达式
export interface RuleCondition {
  name?: string;
  condition?: string;
  value?: any;
}
// 条件表达式集合
type RuleConditionWithAssemble = [AssembleType | undefined, RuleCondition];

const prefixCls = 'linkage-rules';
const classes = {
  item: `${prefixCls}-item`
}

const assembleOptions = [{
  label: '或',
  value: '||'
}, {
  label: '且',
  value: '&&'
}];

const conditionOptions = [{
  label: '等于',
  value: "equal",
}, {
  label: "大于",
  value: "more",
}, {
  label: "小于",
  value: "less",
}, {
  label: "包含",
  value: "includes",
}, {
  label: "包含",
  value: "excludes",
}];

/**
 * 联动校验规则
 */
export const LinkageRules: React.FC<LinkageRulesProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  const initialValue: RuleConditionWithAssemble = [[, {}]]

  const {
    dataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<RuleConditionWithAssemble>(initialValue, () => {

  });

  const controls = useFormExpandControl()
  const controlOptions = Object.entries(controls || {})?.map(([path, field]) => ({ label: field?.label, value: path }));

  const labelChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'label');
  }

  const valueChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'value');
  }

  const renderItem = (item: RuleConditionWithAssemble, index: number) => {
    const [assemble, condition] = item || [];
    return (
      <div key={index}>
        {
          assemble ?
            <Col>
              <Select options={assembleOptions} />
            </Col>
            : null
        }
        <Row className={classes.item} gutter={12} align="middle">
          <Col>
            <Select options={controlOptions} />
          </Col>
          <Col>
            <Select options={conditionOptions} />
          </Col>
          <Col>
            组件
          </Col>
          {
            index === 0 &&
            <Col span={4}>
              <Icon name="add" className="icon-delete" onClick={addNewItem} />
            </Col>
          }
        </Row>
      </div>
    )
  }

  const addNewItem = () => {
    addItem([['||', {}]])
  }

  return (
    <div>
      {
        dataSource?.map((item, index) => renderItem(item, index))
      }
    </div>
  );
});

// 代码编辑器弹窗
export const LinkageListModal = (
  props: LinkageRulesProps & {
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
        <LinkageRules
          value={value}
          onChange={handleOnChange}
        />
      </Modal>
    </>
  );
};
