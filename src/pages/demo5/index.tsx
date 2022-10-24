// export default demo5;
// import { Button } from 'antd';
import React, { useState } from 'react';
import RenderForm, { GeneratePrams,Form, RenderFormChildren, RenderFormProps, useFormRenderStore } from '@/components/react-easy-formdesign/form-render';
// import {Form, useFormStore} from '@/components/react-easy-formcore';
import './index.less'
import Button from '@/components/button';
export default function Demo5(props) {

  const store = useFormRenderStore();

  const [properties1, setProperties1] = useState({
    name1: {
      label: "label1",
      required: true,
      initialValue: 1111,
      // outside: { type: 'col', props: { span: 6 } },
      type: 'Input',
      props: {}
    },
    name2: {
      label: "label2",
      required: true,
      // outside: { type: 'col', props: { span: 6 } },
      rules: [{ required: true, message: 'name2空了' }],
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  })
  const [properties2, setProperties2] = useState({
    name3: {
      label: "label3",
      required: true,
      initialValue: 1111,
      // outside: { type: 'col', props: { span: 6 } },
      type: 'Input',
      props: {}
    },
    name4: {
      label: "label4",
      required: true,
      // outside: { type: 'col', props: { span: 6 } },
      rules: [{ required: true, message: 'name4空了' }],
      initialValue: 1,
      type: 'Input',
      props: {}
    },
  })

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const result = await store.validate();
    console.log(result, 'result');
  };

  return (
    <div>
      <Form store={store}>
        <div>
          <p>first</p>
          <RenderFormChildren properties={properties1} />
        </div>
        <div>
          <p>second</p>
          <RenderFormChildren properties={properties2} />
        </div>
      </Form>
      <div style={{ marginLeft: '120px' }}>
        <Button onClick={onSubmit}>submit</Button>
      </div>
    </div>
  );
}
