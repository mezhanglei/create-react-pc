import { getToken } from '@/core/session';
import { UploadFileUrl } from '@/services/file';
import { isObjectEqual } from '@/utils/object';
import { Button, message, Upload, UploadProps } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import React from 'react';
import styles from './file-upload.module.less';

export interface UploadFileProps extends UploadProps {
  fileSizeLimit: number; // 每个文件的限制上传大小
  value?: UploadProps['fileList']; // 反显的文件列表
  onChange?: (data: UploadProps['fileList']) => void; // 重写控件变化的回调
  autoUpload?: boolean; // true直接上传到目标接口 false不会直接上传到接口，只会获取上传的临时文件
}

export interface UploadFileState {
  loading?: boolean;
  fileList?: UploadProps['fileList'];
  prevFileList?: UploadProps['fileList'];
}

// 非图片文件上传组件
export default class UploadFile extends React.Component<UploadFileProps, UploadFileState> {

  constructor(props: UploadFileProps) {
    super(props);
    this.state = {
      fileList: []
    };
  }

  static defaultProps = {
    fileSizeLimit: 5, // 每个文件的限制上传大小
    action: UploadFileUrl, //默认上传文件地址
    autoUpload: true
  }

  componentDidMount() {
    this.setState({
      fileList: this.props?.value
    })
  }

  // 当state数据改变时触发更新
  componentDidUpdate(prevProps: UploadFileProps) {
    const valueChanged = this.props.value !== undefined && !isObjectEqual(this.props.value, prevProps.value);
    if (valueChanged) {
      this.setState({
        fileList: this.props.value
      })
    }
  }

  // 获取外部props更新时去更新state
  static getDerivedStateFromProps(nextProps: UploadFileProps, prevState: UploadFileState) {
    const valueChanged = !isObjectEqual(nextProps.value, prevState.prevFileList);
    if (valueChanged) {
      return {
        ...prevState,
        prevFileList: nextProps.value
      };
    }
    return null;
  }

  // 上传前处理，返回false阻止上传
  beforeUpload = (file: RcFile) => {
    const { fileSizeLimit } = this.props;
    const fileSize = file.size / 1024 / 1024
    if (fileSize > fileSizeLimit) {
      message.error(`附件大小应小于${fileSizeLimit}M`)
      return false;
    }
    if (fileSize === 0) {
      message.error('附件不能为空')
      return false;
    }
  }

  // 上传文件改变时
  handleOnchange = (params: UploadChangeParam) => {
    const { file, fileList } = params;
    const { autoUpload, onChange } = this.props;
    // // 上传过程中
    // if (file.status === 'uploading') {
    //   this.setState({ loading: true });
    //   return;
    // }
    // // 上传完成
    // if (file.status === 'done') {
    //   this.setState({ loading: false });
    // }
    // // 上传成功
    // if (file.status === 'success') {
    //   this.setState({ loading: false });
    // }
    // // 上传移除
    // if (file.status === 'removed') {

    // }
    // // 上传出错
    // if (file.status === 'error') {
    //   this.setState({ loading: false })
    // }
    console.log(params, 2222)
  }

  // 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp'
  render() {
    const { data, action, onChange, ...rest } = this.props;
    const { loading } = this.state;
    return (
      <Upload
        className={styles['file-upload']}
        headers={{ Authorization: getToken() }}
        data={data}
        name="file"
        multiple
        action={action}
        maxCount={1}
        beforeUpload={this.beforeUpload}
        onChange={this.handleOnchange}
        {...rest}
      >
        <Button loading={loading}><i className="iconfont icon-upload"></i>上传文件</Button>
      </Upload>
    )
  }
}