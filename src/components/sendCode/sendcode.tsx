import React, { Component } from 'react';
import Button from '@/components/button/index';

export interface SendVerifyCodeProps {
  launch: boolean; // 用来控制是否启动倒计时
  count: number; // 用来控制每轮倒计时的总数，单位秒
  handle: () => void; // 点击按钮时执行的方法
}
export interface SendVerifyCodeState {
  count: number;
  counting: boolean;
  prevLaunch?: boolean;
}
class SendVerifyCode extends Component<SendVerifyCodeProps, SendVerifyCodeState> {
  timer: any;
  constructor(props: SendVerifyCodeProps) {
    super(props);
    this.state = {
      counting: false,
      count: props?.count
    };
  }

  static defaultProps = {
    isSend: false,
    count: 5
  }

  componentWillUnmount() {
    this.clear();
  }

  componentDidMount() {
    this.send();
  }

  componentDidUpdate(preProps: SendVerifyCodeProps) {
    const launchChanged = this.props.launch !== undefined && this.props?.launch !== preProps?.launch
    if (launchChanged) {
      this.send();
    }
  }

  static getDerivedStateFromProps(nextProps: SendVerifyCodeProps, prevState: SendVerifyCodeState) {
    const launchChanged = nextProps?.launch !== prevState?.prevLaunch;
    if (launchChanged) {
      return {
        ...prevState,
        prevLaunch: nextProps?.launch
      }
    }
    return null;
  }

  // 设置定时器
  setTime = () => {
    this.timer = setInterval(this.countDown, 1000);
  }

  // 计数
  countDown = () => {
    const { count } = this.state;
    if (count <= 1) {
      this.clear();
      this.setState({ counting: false });
    } else {
      this.setState({ counting: true, count: count - 1 });
    }
  }

  // 定时器
  clear = () => {
    clearInterval(this.timer);
  }

  // 发送验证码，并启动倒计时
  send = () => {
    const { launch } = this.props;
    if (launch) {
      this.setState({ counting: true, count: this.props.count });
      this.setTime();
    }
  }

  // 点击按钮时的执行方法
  sendCode = () => {
    this.send();
    this.props.handle && this.props.handle();
  }

  render() {
    let { count, counting } = this.state;
    return (
      <Button
        disabled={counting}
        onClick={this.sendCode}
      >{counting ? `${count}秒后重发` : '获取验证码'}</Button>
    );
  }
}

export default SendVerifyCode;
