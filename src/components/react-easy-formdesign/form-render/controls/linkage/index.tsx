import { Button, Col, Select, Input, Modal, Row } from "antd";
import React, { LegacyRef, useEffect, useState } from "react";
import './index.less';
import Icon from "@/components/svg-icon";
import { useTableData } from "@/components/react-easy-formdesign/utils/hooks";
import RenderForm, { FieldChangedParams, FormFieldProps } from "../..";
import { evalString } from "@/utils/string";


export interface LinkageRulesProps {
  value?: string;
  onChange?: (codeStr?: string) => void;
  currentControl: FormFieldProps;
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
    setDataSource,
    addItem,
    updateItem,
    deleteItem
  } = useTableData<RuleData>(initialValue, (newData) => {
    let codeStr = newData?.reduce((preStr, current) => {
      const assembleStr = current?.[0] || "";
      const conditionStr = current?.[1]?.condition || "";
      const controlValue = current?.[1]?.currentControlValue;
      const currentStr = conditionStr ? `(${conditionStr} ? ${controlValue ?? "null"} : null)` : ""
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
        const condition = matchStr.match(/(\S*.*?\s*)\?/)?.[1]; // 匹配问号前面的字符串, 即条件
        const currentControlValueStr = matchStr.match(/\?(\S*.*?\s*)\:/)?.[1]; // 匹配问号后面的
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
            <Input.TextArea value={condition} onChange={(e) => conditionOnchange(e?.target?.value, index)} />
          </Col>
          <Col span={5}>
            <span className={classes.itemSuffix}>时，设置为</span>
          </Col>
          <Col flex={1} style={{ width: '0' }}>
            <RenderForm
              tagName="div"
              values={{ currentControlValue: ruleItem?.['currentControlValue'] }}
              properties={{ currentControlValue: { compact: true, ...currentControl } }}
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

// 代码编辑器弹窗
export const LinkageListModal = (
  props: LinkageRulesProps & {
    onClose?: () => void;
    disabled?: boolean;
    visible?: boolean;
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

  useEffect(() => {
    setCodeStr(value)
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
        currentControl={currentControl}
      />
    </Modal>
  );
};

// 代码编辑器弹窗
export const LinkageBtn = (
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

  useEffect(() => {
    setCodeStr(value)
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
      <div>
        <span>{codeStr}</span>
        <Button type="link" className={classes.modalButton} disabled={disabled} onClick={showModal}>{codeStr ? "修改联动" : "添加联动"}</Button>
      </div>
      <LinkageListModal
        visible={visible}
        value={value}
        currentControl={currentControl}
        onClose={closeModal}
        onChange={handleOnChange}
      />
    </>
  );
};
