import { Button, Col, Select, Input, Modal, Row, Checkbox, CheckboxProps, ButtonProps } from "antd";
import React, { useEffect, useState } from "react";
import './index.less';
import Icon from "@/components/svg-icon";
import { useTableData } from "@/components/react-easy-formdesign/utils/hooks";
import RenderForm, { FieldChangedParams } from "../..";
import { evalString } from "@/utils/string";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { handleStringify } from "@/components/react-easy-formdesign/utils/utils";

export interface ControlFieldProps {
  controlField?: any;
}
export interface LinkageRulesProps extends ControlFieldProps {
  value?: string;
  onChange?: (codeStr?: string) => void;
}

// 集合类型
type AssembleType = '&&' | '||'
// 规则条件的渲染数据类型
type RuleData = [AssembleType | undefined, {
  condition?: string;
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
  icon: `${prefixCls}-item-icon`,
  checkbox: `${prefixCls}-item-checkbox`,
  addIcon: `${prefixCls}-item-add`,
  clearIcon: `${prefixCls}-item-clear`,
}

const assembleOptions = [{
  label: '或',
  value: '||'
}, {
  label: '且',
  value: '&&'
}];

/**
 * 联动规则设置
 */
export const LinkageRules = React.forwardRef<HTMLElement, LinkageRulesProps>((props, ref) => {

  const {
    value,
    onChange,
    controlField,
    ...rest
  } = props;

  const initialValue: RuleData[] = [[, {}]]

  const {
    dataSource,
    setDataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<RuleData>(initialValue, (newData) => {
    let codeStr = newData?.reduce((preStr, current) => {
      const assembleStr = current?.[0] || "";
      const conditionStr = current?.[1]?.condition || "";
      const controlValue = current?.[1]?.currentControlValue;
      const currentStr = conditionStr ? `(${conditionStr} && ${handleStringify(controlValue)})` : ""
      return preStr + assembleStr + currentStr;
    }, "");
    codeStr = codeStr ? `{{${codeStr}}}` : "";
    onChange && onChange(codeStr);
  });

  useEffect(() => {
    if (typeof value === 'string') {
      const data = getRulesDataFromValue(value);
      setDataSource(data);
    }
  }, [value])

  const getRulesDataFromValue = (value?: string) => {
    if (typeof value !== 'string' || !value) return [];
    let result: RuleData[] = [];
    // 将字符串转换为RuleData
    const handleStr = (str: string) => {
      if (typeof str !== 'string') return;
      const matchAssemble = str.match(/^\|\||^\&\&/)?.[0] as AssembleType; // 匹配集合符号
      const matchStrWithBracket = str.match(/\((\S*.*?\s*)\)/)?.[0]; // 匹配带括号的目标
      const matchStr = str.match(/\((\S*.*?\s*)\)/)?.[1]; // 匹配无括号的目标
      if (matchStr && matchStrWithBracket) {
        const splitList = matchStr?.split('&&');
        const condition = splitList?.[0]; // 匹配问号前面的字符串, 即条件
        const currentControlValueStr = splitList?.[1]; // 匹配问号后面的
        const currentControlValue = currentControlValueStr && evalString(currentControlValueStr);
        result.push([matchAssemble, { condition, currentControlValue }]);
        const restStr = str?.replace(matchStrWithBracket, '')
        if (restStr) {
          handleStr(restStr);
        }
      }
    }
    const removedBracket = value?.replace(/\{\{|\}\}/g, '');
    handleStr(removedBracket);
    return result;
  }

  const assembleChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "[0]");
  }

  const conditionOnchange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "[1].condition");
  }

  const currentControlChange = ({ value }: FieldChangedParams, index: number) => {
    updateItem(value, index, "[1].currentControlValue");
  }

  const renderItem = (item: RuleData, index: number) => {
    const [assemble, ruleItem] = item || [];
    const condition = ruleItem?.condition;
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
          <Col span={8}>
            <Input.TextArea placeholder="formvalues['表单字段'] == 值" value={condition} onChange={(e) => conditionOnchange(e?.target?.value, index)} />
          </Col>
          <Col span={5}>
            <span className={classes.itemSuffix}>时，设置为</span>
          </Col>
          <Col flex={1} style={{ width: '0' }}>
            <RenderForm
              tagName="div"
              values={{ currentControlValue: ruleItem?.['currentControlValue'] }}
              properties={{ currentControlValue: { compact: true, ...(controlField || {}) } }}
              onFieldsChange={(params) => currentControlChange(params, index)}
            />
          </Col>
          <Col span={2}>
            {
              index === 0 ?
                <Icon name="add" className={classes.icon} onClick={addNewItem} />
                :
                <Icon name="delete" className={classes.icon} onClick={() => deleteItem(index)} />
            }
          </Col>
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

// 联动弹窗
export interface LinkageModalProps extends LinkageRulesProps {
  onClose?: () => void;
  visible?: boolean;
}
export const LinkageModal = (props: LinkageModalProps) => {

  const {
    value,
    onChange,
    onClose,
    controlField,
  } = props;

  const [visible, setVisible] = useState<boolean>()
  const [codeStr, setCodeStr] = useState<string>();

  useEffect(() => {
    if (typeof value === 'string') {
      setCodeStr(value)
    } else {
      setCodeStr(undefined)
    }
  }, [value]);

  useEffect(() => {
    setVisible(props?.visible)
  }, [props?.visible]);

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
        controlField={controlField}
      />
    </Modal>
  );
};

// 联动组件
export interface LinkageModalWrapperProps extends LinkageModalProps {
  children?: (showModal: () => void, codeStr?: string) => void | any;
}
export const LinkageWrapper = (props: LinkageModalWrapperProps) => {

  const {
    value,
    onChange,
    onClose,
    controlField,
    children
  } = props;

  const [visible, setVisible] = useState<boolean>()
  const [codeStr, setCodeStr] = useState<string>();

  useEffect(() => {
    if (typeof value === 'string') {
      setCodeStr(value)
    } else {
      setCodeStr(undefined)
    }
  }, [value])

  const showModal = () => {
    setVisible(true)
  }

  const closeModal = () => {
    setVisible(false);
    onClose && onClose();
  }

  const handleOnChange = (val?: string) => {
    setCodeStr(val);
    onChange && onChange(val);
  }

  return (
    <>
      {
        typeof children === 'function' &&
        children(showModal, codeStr)
      }
      <LinkageModal
        visible={visible}
        value={value}
        controlField={controlField}
        onClose={closeModal}
        onChange={handleOnChange}
      />
    </>
  );
};

// 按钮点击联动弹窗
export const LinkageBtn = (props: LinkageRulesProps & ButtonProps) => {

  const {
    value,
    onChange,
    controlField,
  } = props;

  return (
    <LinkageWrapper value={value} onChange={onChange} controlField={controlField}>
      {
        (showModal: () => void, codeStr?: string) => (
          <div>
            <span>{codeStr}</span>
            <Button type="link" className={classes.modalButton} onClick={showModal}>{codeStr ? "修改联动" : "添加联动"}</Button>
          </div>
        )
      }
    </LinkageWrapper>
  );
};

// checkbox点击联动弹窗
export const LinkageCheckbox = (props: LinkageRulesProps & CheckboxProps & { value?: boolean | string, onChange?: (val?: boolean | string) => void }) => {

  const {
    value,
    checked,
    onChange,
    controlField,
    children,
    ...rest
  } = props;

  const [codeStr, setCodeStr] = useState<string>();
  const [checkboxValue, setCheckboxValue] = useState<boolean>();

  useEffect(() => {
    if (typeof value === 'boolean') {
      setCheckboxValue(value)
    } else if (typeof codeStr === 'string') {
      setCodeStr(value)
    }
  }, [value])

  // checkbox的变化
  const checkboxChange = (e: CheckboxChangeEvent) => {
    const checked = e?.target?.checked;
    if (codeStr) {
      if (checked) {
        setCheckboxValue(true);
        onChange && onChange(codeStr);
      } else {
        setCheckboxValue(false);
        onChange && onChange(false);
      }
    } else {
      setCheckboxValue(checked);
      onChange && onChange(checked);
    }
  }

  // 联动值的变化
  const linkageOnChange = (codeStr?: string) => {
    if (checkboxValue) {
      setCheckboxValue(true);
      onChange && onChange(codeStr);
    }
    setCodeStr(codeStr);
  }

  const clearCodeStr = () => {
    if (checkboxValue) {
      onChange && onChange(false);
    }
    setCodeStr(undefined);
  }

  return (
    <span className={classes.checkbox}>
      <Checkbox checked={checkboxValue} onChange={checkboxChange} {...rest}>
        {children}
      </Checkbox>
      <LinkageWrapper value={codeStr} onChange={linkageOnChange} controlField={{ type: 'Switch' }}>
        {
          (showModal: () => void, codeStr?: string) => (
            <>
              <Icon className={classes.addIcon} onClick={showModal} name="edit" title="编辑" />
              {codeStr && <Icon className={classes.clearIcon} onClick={clearCodeStr} title="清除" name="qingchu" />}
            </>
          )
        }
      </LinkageWrapper>
    </span>
  );
};
