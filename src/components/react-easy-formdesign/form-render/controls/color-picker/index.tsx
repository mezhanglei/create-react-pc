import React, { LegacyRef, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { ChromePicker, ChromePickerProps, ColorResult } from 'react-color';

export interface ColorPickerProps extends ChromePickerProps {
  value?: string;
  onChange?: (val: any) => any;
  disabled?: boolean;
}
const ColorPicker = React.forwardRef((props: ColorPickerProps, ref: LegacyRef<ChromePicker>) => {
  const {
    value,
    onChange,
    disabled,
    ...rest
  } = props;

  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(value)
  }, [value]);

  const onColorChange = (color: ColorResult) => {
    if (disabled) return;
    const { hex } = color;
    setColor(hex);
    onChange && onChange(hex);
  }

  const renderTitle = () => {
    return <ChromePicker ref={ref} {...rest} color={color} onChangeComplete={onColorChange} />;
  }

  const style = {
    background: color,
    width: '200px',
    height: 32,
    border: '1px solid #cacaca'
  };

  return (
    <Tooltip title={renderTitle} trigger={disabled ? "" : "click"}>
      <div style={style} />
    </Tooltip>
  );
})

export default ColorPicker;
