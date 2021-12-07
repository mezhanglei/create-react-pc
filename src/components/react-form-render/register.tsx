import { Button, Input, Select } from 'antd';

// 注册组件

export const ComponentsMap: any = {
    input: Input,
    select: Select,
    button: Button
};

export const ComponentType = Object.keys(ComponentsMap);
