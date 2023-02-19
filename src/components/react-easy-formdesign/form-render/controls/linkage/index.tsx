import { isEmpty } from "@/utils/type";
import { Button, Col, Select, Input, message, Modal, Row, Card } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useRef, useState } from "react";
import './index.less';
import Icon from "@/components/svg-icon";
import { useFormExpandControl, useTableData } from "@/components/react-easy-formdesign/utils/hooks";
import RenderForm, { FieldChangedParams, Form, FormFieldProps, useFormStore } from "../..";

export interface LinkageRulesProps {
  value?: string;
  onChange?: (val?: string) => void;
  currentControl: FormFieldProps;
}

// 集合类型
type AssembleType = '&&' | '||'
// 规则条件的渲染数据类型
type RuleData = [AssembleType | undefined, {
  conditionName?: string;
  condition?: string;
  conditionValue?: any;
  currentControlValue?: any;
}];

const prefixCls = 'linkage-rules';
const classes = {
  cls: `${prefixCls}`,
  modal: `${prefixCls}-modal`,
  modalButton: `${prefixCls}-modal-button`,
  item: `${prefixCls}-item`,
  row: `${prefixCls}-item-row`,
  assemble: `${prefixCls}-item-assemble`,
  control: `${prefixCls}-item-control`,
  itemPrefix: `${prefixCls}-item-prefix`,
  itemSuffix: `${prefixCls}-item-suffix`,
  youjiantou: `${prefixCls}-item-youjiantou`,
  icon: `${prefixCls}-item-icon`,
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
    currentControl,
    ...rest
  } = props;

  const initialValue: RuleData[] = [[, {}]]

  const {
    dataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<RuleData>(initialValue, () => {

  });

  const controls = useFormExpandControl()
  const controlOptions = Object.entries(controls || {})?.map(([path, field]) => ({ label: field?.label, value: path }));

  const labelChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const val = e?.target?.value;
    updateItem(val, rowIndex, 'label');
  }

  const assembleChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "[0]");
  }

  const conditionChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "[1].condition");
  }

  const nameChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "[1].conditionName");
  }

  const currentControlChange = ({ value }: FieldChangedParams, index: number) => {
    updateItem(value, index, "[1].currentControlValue");
  }

  const conditionControlChange = ({ value }: FieldChangedParams, index: number) => {
    updateItem(value, index, "[1].conditionValue");
  }

  const getConditionControl = (path?: string) => {
    if (!path) return;
    const conditionControl = controls?.[path];
    const {
      label,
      layout,
      initialValue,
      labelWidth,
      ...restField
    } = conditionControl || {};
    return restField;
  }

  const renderItem = (item: RuleData, index: number) => {
    const [assemble, condition] = item || [];
    const conditionName = condition?.conditionName;
    const conditionControl = getConditionControl(conditionName);
    return (
      <div key={index} className={classes.item}>
        {
          assemble ?
            <Select className={classes.assemble} value={assemble} options={assembleOptions} onChange={(val) => assembleChange(val, index)} />
            : null
        }
        <Row gutter={8} className={classes.row} align="middle">
          <Col span={1}>
            <span className={classes.itemPrefix}>当</span>
          </Col>
          <Col span={6}>
            <Select style={{ width: '100%' }} value={condition?.conditionName} options={controlOptions} onChange={(val) => nameChange(val, index)} />
          </Col>
          <Col span={5}>
            <Select style={{ width: '100%' }} value={condition?.condition} options={conditionOptions} onChange={(val) => conditionChange(val, index)} />
          </Col>
          <Col span={9}>
            {
              conditionName && conditionControl ?
                <RenderForm
                  tagName="div"
                  values={{ conditionValue: condition?.['conditionValue'] }}
                  properties={{ conditionValue: { compact: true, ...conditionControl } }}
                  onFieldsChange={(params) => conditionControlChange(params, index)}
                />
                :
                <div className={classes.control}>--</div>
            }
          </Col>
          <Col span={3}>
            <span className={classes.itemSuffix}> 时，</span>
          </Col>
          <div className={classes.itemSuffix}>
            <Icon name="youjiantou" className={classes.youjiantou} onClick={addNewItem} />设置为
          </div>
          <RenderForm
            tagName="div"
            values={{ currentControlValue: condition?.['currentControlValue'] }}
            properties={{ currentControlValue: { compact: true, ...currentControl } }}
            onFieldsChange={(params) => currentControlChange(params, index)}
          />
          {
            index === 0 ?
              <Icon name="add" className={classes.icon} onClick={addNewItem} />
              :
              <Icon name="delete" className={classes.icon} onClick={() => deleteItem(index)} />
          }
        </Row>
      </div>
    )
  }

  const addNewItem = () => {
    addItem([['||', {}]])
  }

  return (
    <div className={classes.cls}>
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
    currentControl,
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
        {
          codeStr ?
            null
            :
            <Button type="link" className={classes.modalButton} disabled={disabled} onClick={showModal}>添加联动</Button>
        }
      </div>
      <Modal
        className={classes.modal}
        destroyOnClose
        title="添加联动"
        visible={visible}
        onCancel={closeModal}
        onOk={handleOk}>
        <LinkageRules
          value={value}
          onChange={handleOnChange}
          currentControl={currentControl}
        />
      </Modal>
    </>
  );
};
