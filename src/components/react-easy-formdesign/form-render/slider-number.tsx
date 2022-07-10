import { InputNumber, Slider } from 'antd';
import React, { useEffect, useState } from 'react';
import './slider-number.less';

export interface SliderNumberProps {
  value: number;
  onChange: (value: number) => void;
}
export const SliderNumber: React.FC<SliderNumberProps> = (props) => {
  const [inputValue, setInputValue] = useState<number>(0);

  const {
    value,
    onChange,
    ...rest
  } = props;

  useEffect(() => {
    setInputValue(value || 0)
  }, [value])

  const inputOnChange = (newValue: number) => {
    setInputValue(newValue);
    onChange && onChange(newValue);
  };

  return (
    <div className='slider-number'>
      <div className='slider-part'>
        <Slider
          onChange={inputOnChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          {...rest}
        />
      </div>
      <div className='inputnumber-part'>
        <InputNumber
          style={{ margin: '0 16px' }}
          value={inputValue}
          onChange={inputOnChange}
          {...rest}
        />
      </div>
    </div>
  );
};