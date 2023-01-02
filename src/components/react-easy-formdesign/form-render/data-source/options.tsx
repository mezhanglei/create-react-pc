import { isEmpty } from "@/utils/type";
import { Button, Col, Input, message, Row } from "antd";
import React, { ChangeEvent, LegacyRef, useEffect, useState } from "react";
import { OptionsProps } from ".";
import './options.less';

export interface OptionsSourceProps extends OptionsProps {
}

const prefixCls = 'options-source';
const classes = {
  item: `${prefixCls}-item`
}

/**
 * 单选或多选编辑组件
 */
const OptionsSource: React.FC<OptionsSourceProps> = React.forwardRef((props, ref: LegacyRef<HTMLElement>) => {

  const {
    value,
    onChange,
    ...rest
  } = props;

  const [dataSource, setDataSource] = useState<any[]>([{}]);

  useEffect(() => {
    setDataSource(value || [{}])
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
    setDataSource(cloneData)
    dataSourceChange(cloneData);
  }

  // 新增一行
  const addItem = () => {
    const isHaveEmpty = dataSource?.find((item) => isEmpty(item?.label) || isEmpty(item?.value));
    if (isHaveEmpty) {
      message.info('请填写完整')
      return;
    }
    const newData = dataSource?.concat({});
    setDataSource(newData);
    dataSourceChange(newData);
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
                <i className="iconfont icon-delete" onClick={() => deleteItem(index)} />
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

export default OptionsSource;
