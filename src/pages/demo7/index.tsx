import React, { Component, useState, useEffect, useRef } from 'react';
import EasyDesign from '@/components/react-easy-formdesign/form-designer';
import './index.less'

const demo7: React.FC<any> = (props) => {

  return (
    <div className='design-box'>
      <EasyDesign />
    </div>
  );
};

export default demo7;
