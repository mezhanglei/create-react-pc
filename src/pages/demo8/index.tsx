import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import EditTable from './edit-table';
import styles from './index.module.less';
import { deepClone } from '@/utils/object';

const list = [
  {
    key: "1",
    name: 'John Brown',
    age: 1,
    tags: '1',
  },
  {
    key: "2",
    name: 'John Brown',
    age: 1,
    tags: '1',
  },
  {
    key: "3",
    name: 'John Brown',
    age: 1,
    tags: '1',
  },
];

export interface DataSource {
  key: string;
  name?: string;
  age?: number;
  tags?: string;
}
export default () => {
  const [data, setData] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);

  const handelSubmite = () => {
    const newData = deepClone(data);
    console.log(newData, '提交成功');
  };

  const fetchTableData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(list);
      setLoading(false);
    }, 1000);
  };

  const onChange = (va: DataSource[]) => {
    const newData = deepClone(va);
    setData(newData);
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  return (
    <>
      <EditTable value={data} loading={loading} onChange={onChange} />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={() => handelSubmite()}>
          提交
        </Button>
      </div>
    </>
  );
};