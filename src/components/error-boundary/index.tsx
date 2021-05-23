import * as React from 'react';
import clz from 'classnames/bind';
import css from './index.module.less';
import Result from "@/components/result/result";

const styled = clz.bind(css);

interface IErrorBoundaryProps {
  state?: {
    error: any;
    errorInfo: any;
  }
}
/**
 * react错误边界处理
 */
class ErrorBoundary extends React.Component<IErrorBoundaryProps, any> {
  /**
   * 初始化参数
   * @param props 父级参数
   */
  constructor(props: any) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  /**
   * 捕获错误
   * @param error 错误类型
   * @param errorInfo 错误详细信息
   */
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  /**
   * 回首页
   */
  handleGoHome = () => {
    this.setState({
      error: null,
      errorInfo: null
    }, () => {
      window.location.replace('/');
    });
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div className="error-boundary-wrapper" onClick={this.handleGoHome}>
          <Result title="错误处理" />
        </div>
      );
    }
    return (this.props.children);
  }

}

export default (ErrorBoundary);