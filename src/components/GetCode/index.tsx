import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import classnames from 'classnames';

export interface GetCodeProps extends ButtonProps {
  onSendPromise: () => Promise<any>; // 发送验证码的promise方法
}

const TOTAL_TIME = 60;
const GetCode = React.forwardRef<{ sendMsg: () => void }, GetCodeProps>((props, ref) => {
  const { onSendPromise, className, ...rest } = props;
  const [count, setCount] = useState<number>();
  const [suffix, setSuffix] = useState<string>('发送验证码');
  const [disabled, setDisabled] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>();
  const canSendRef = useRef<boolean>(true);
  const timerRef = useRef<any>();

  React.useImperativeHandle(ref, () => ({
    sendMsg,
  }));

  useEffect(() => {
    visiblityListen();
  }, []);

  const resetBtn = () => {
    setSuffix('重新发送');
    clearInterval(timerRef.current);
    timerRef.current = null;
    setDisabled(false);
    canSendRef.current = true;
  }

  const visiblityListen = () => {
    if (count === undefined) return;
    let start: number, end: number, vibs: number, newS: number;
    document.addEventListener('visibilitychange', () => {
      // hidden 为锁屏隐藏状态，visible为重新显示状态
      if (document.visibilityState === 'hidden') {
        start = new Date().getTime();
      } else if (document.visibilityState === 'visible') {
        end = new Date().getTime();
        vibs = Math.floor((end - start) / 1000);
        newS = (count || 0) - vibs;
        if (newS > 0) {
          setCount(newS);
        } else if (newS < 0) {
          resetBtn();
          setCount(undefined);
        }
      }
    });
  };

  const sendMsg = () => {
    const canSend = canSendRef.current;
    if (typeof onSendPromise !== 'function') return;
    if (canSend) {
      setLoading(true);
      onSendPromise()
        .then(() => {
          canSendRef.current = false;
          setLoading(false);
          setDisabled(true);
          if (!timerRef.current) {
            setCount(TOTAL_TIME);
            setSuffix('s后重发');
            timerRef.current = setInterval(() => {
              setCount(oldCount => {
                if (oldCount && oldCount <= TOTAL_TIME) {
                  return oldCount - 1;
                } else {
                  resetBtn();
                  return undefined;
                }
              });
            }, 1000);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Button
      type="default"
      className={classnames('send-message', className)}
      onClick={sendMsg}
      disabled={disabled}
      loading={loading}
      {...rest}
    >
      {count}
      {suffix}
    </Button>
  );
});

export default GetCode;
