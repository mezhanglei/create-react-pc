import { Button, Col, Select, Input, Row, Checkbox, CheckboxProps, ButtonProps } from "antd";
import React, { useEffect, useState } from "react";
import './index.less';
import Icon from "@/components/SvgIcon";
import { useTableData } from "@/components/react-easy-formdesign/form-render/utils/hooks";
import FormRender, { FieldChangedParams } from "../../../";
import { evalString } from "@/utils/string";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { handleStringify } from "@/components/react-easy-formdesign/form-render/utils/utils";
import CustomModal from "@/components/AntdModal";

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
type RuleData = {
  assemble?: AssembleType;
  code?: string;
  value?: unknown;
}

const prefixCls = 'linkage-rules';
const classes = {
  cls: `${prefixCls}`,
  modal: `${prefixCls}-modal`,
  modalButton: `${prefixCls}-modal-button`,
  item: `${prefixCls}-item`,
  row: `${prefixCls}-item-row`,
  assemble: `${prefixCls}-item-assemble`,
  component: `${prefixCls}-item-component`,
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

  const initialValue: RuleData[] = [{}]

  const {
    dataSource,
    setDataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<RuleData>(initialValue, (newData) => {
    let codeStr = newData?.reduce((preStr, current) => {
      const assembleStr = current?.assemble || "";
      const conditionStr = current?.code || "";
      const controlValue = current?.value;
      const currentStr = conditionStr ? `(${conditionStr} && ${handleStringify(controlValue)})` : ""
      return preStr + assembleStr + currentStr;
    }, "");
    codeStr = codeStr ? `{{${codeStr}}}` : "";
    onChange && onChange(codeStr);
  });

  useEffect(() => {
    if (typeof value === 'string') {
      const data = transformToRule(value);
      setDataSource(data);
    }
  }, [value])

  const transformToRule = (value?: string) => {
    if (typeof value !== 'string' || !value) return [];
    let result: RuleData[] = [];
    // 将字符串转换为RuleData
    const handleStr = (str: string) => {
      if (typeof str !== 'string') return;
      const matchStrWithBracket = str.match(/\((\S*.*?\s*)\)/)?.[0]; // 匹配目标
      const matchStr = str.match(/\((\S*.*?\s*)\)/)?.[1]; // 匹配目标(不带括号)
      if (matchStr) {
        const item = matchStr?.split('&&');
        const code = item[0];
        const value = evalString[item[1]];
        const matchAssemble = str.match(/^\|\||^\&\&/)?.[0] as AssembleType; // 匹配assemble符号
        result.push({ assemble: matchAssemble, code, value });
        // 剩余的字符串继续处理
        if (matchStrWithBracket) {
          const restStr = str?.replace(matchStrWithBracket, '');
          handleStr(restStr);
        }
      }
    }
    const removedBracket = value?.replace(/\{\{|\}\}/g, '');
    handleStr(removedBracket);
    return result;
  }

  const assembleChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "assemble");
  }

  const codeChange = (val: any, rowIndex: number) => {
    updateItem(val, rowIndex, "code");
  }

  const valueChange = ({ value }: FieldChangedParams, index: number) => {
    updateItem(value, index, "value");
  }

  const addNewItem = () => {
    addItem([{ assemble: '||' }])
  }

  const renderItem = (item: RuleData, index: number) => {
    const { assemble, code, value } = item || {};
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
            <Input.TextArea placeholder="formvalues['表单字段'] == 值" value={code} onChange={(e) => codeChange(e?.target?.value, index)} />
          </Col>
          <Col span={5}>
            <span className={classes.itemSuffix}>时，设置为</span>
          </Col>
          <Col flex={1} style={{ width: '0' }}>
            <FormRender
              tagName="div"
              initialValues={{ controlValue: value }}
              properties={{ controlValue: { compact: true, ...(controlField || {}) } }}
              onFieldsChange={(params) => valueChange(params, index)}
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

  return (
    <div className={classes.cls}>
      {
        dataSource?.map((item, index) => renderItem(item, index))
      }
    </div>
  );
});

// 按钮点击联动弹窗
export const LinkageBtn = (props: LinkageRulesProps & ButtonProps) => {

  const {
    value,
    onChange,
    controlField,
  } = props;

  const [codeStr, setCodeStr] = useState<string>();

  useEffect(() => {
    if (typeof value === 'string') {
      setCodeStr(value)
    } else {
      setCodeStr(undefined)
    }
  }, [value]);

  const handleOk = (closeModal: () => void) => {
    closeModal();
    onChange && onChange(codeStr)
  }

  const rulesOnchange = (val?: string) => {
    setCodeStr(val)
  }

  const ruleValue = typeof value === 'string' ? value : undefined;

  return (
    <CustomModal className={classes.modal} title="添加联动" onOk={handleOk} displayElement={
      (showModal) => (
        <div>
          <span>{codeStr}</span>
          <Button type="link" className={classes.modalButton} onClick={showModal}>{codeStr ? "修改联动" : "添加联动"}</Button>
        </div>
      )
    }>
      <LinkageRules
        value={ruleValue}
        onChange={rulesOnchange}
        controlField={controlField}
      />
    </CustomModal>
  );
};

// checkbox点击联动弹窗
export const LinkageCheckbox = (props: LinkageRulesProps & CheckboxProps & { value?: boolean | string, onChange?: (val?: boolean | string) => void }) => {

  const {
    value,
    checked,
    onChange,
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
    // 有值时切换选中状态
    if (codeStr) {
      if (checked) {
        setCheckboxValue(true);
        onChange && onChange(codeStr);
      } else {
        setCheckboxValue(false);
        onChange && onChange(false);
      }
      // 没有值时切换选中状态
    } else {
      setCheckboxValue(checked);
      onChange && onChange(checked);
    }
  }

  // 确认
  const handleOk = (closeModal: () => void) => {
    closeModal();
    // 选中状态则直接更改值
    if (checkboxValue) {
      setCheckboxValue(true);
      onChange && onChange(codeStr);
    }
  }

  // 联动值的变化
  const rulesOnchange = (codeStr?: string) => {
    setCodeStr(codeStr);
  }

  const clearCodeStr = () => {
    // 选中状态则更改值
    if (checkboxValue) {
      onChange && onChange(false);
    }
    setCodeStr(undefined);
  }

  const ruleValue = typeof value === 'string' ? value : undefined;

  return (
    <CustomModal className={classes.modal} title="添加联动" onOk={handleOk} displayElement={
      (showModal) => (
        <span className={classes.checkbox}>
          <Checkbox checked={checkboxValue} onChange={checkboxChange} {...rest}>
            {children}
          </Checkbox>
          <Icon className={classes.addIcon} onClick={showModal} name="edit" title="编辑" />
          {codeStr && <Icon className={classes.clearIcon} onClick={clearCodeStr} title="清除" name="qingchu" />}
        </span>
      )
    }>
      <LinkageRules
        value={ruleValue}
        onChange={rulesOnchange}
        controlField={{ type: 'Switch', valueProp: 'checked' }}
      />
    </CustomModal>
  );
};
