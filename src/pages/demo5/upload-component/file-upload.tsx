import { getToken } from '@/core/session';
import { UploadFileUrl } from '@/services/file';
import { isObjectEqual } from '@/utils/object';
import { Button, message, Upload, UploadProps } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import React from 'react';
import styles from './file-upload.module.less';
import { UploadFile } from 'antd/lib/upload/interface';

export interface UploadFileProps extends UploadProps {
  fileSizeLimit: number; // 每个文件的限制上传大小
  value?: Array<UploadFile>; // 反显的文件列表
  onChange?: (data: unknown) => void; // 重写控件变化的回调
  autoUpload?: boolean; // true直接上传到目标接口 false不会直接上传到接口，只会获取上传的临时文件
}

export interface UploadFileState {
  loading?: boolean;
  fileList: Array<UploadFile>;
  prevFileList?: Array<UploadFile>;
}

// 非图片文件上传组件
export default class UploadFiles extends React.Component<UploadFileProps, UploadFileState> {

  constructor(props: UploadFileProps) {
    super(props);
    this.state = {
      fileList: []
    };
  }

  static defaultProps = {
    fileSizeLimit: 5, // 每个文件的限制上传大小
    action: UploadFileUrl, //默认上传文件地址
    autoUpload: true,
    maxCount: 1,
    headers: { Authorization: getToken() },
    data: {}, // 额外参数
    name: 'file', // 参数名
  }

  componentDidMount() {
    this.setState({
      fileList: this.props?.value || []
    })
  }

  // 当state数据改变时触发更新
  componentDidUpdate(prevProps: UploadFileProps) {
    const valueChanged = this.props.value !== undefined && !isObjectEqual(this.props.value, prevProps.value);
    if (valueChanged) {
      this.setState({
        fileList: this.props.value || []
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
      return false;
    }
  }

  // 上传文件改变时(TODO：根据实际情况再处理这个函数)
  handleOnchange = (params: UploadChangeParam) => {
    const { file, fileList } = params;
    const { autoUpload, onChange } = this.props;
    // 上传开始
    if (file.status === 'uploading' && file.percent == 0) {
      this.setState({ loading: true });
      return;
    }
    // 本地上传完成或移除
    if (file.status === 'uploading' && file.percent == 100 || file.status === 'removed') {
      console.log(params, '上传到浏览器完成或删除上传元素时')
      onChange && onChange(fileList)
      this.setState({
        fileList: fileList
      })
    }
    // 上传结束
    if (file.status && ['success', 'done', 'error'].includes(file.status)) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { value, onChange, ...rest } = this.props;
    const { fileList, loading } = this.state;
    return (
      <Upload
        defaultFileList={fileList}
        className={styles['file-upload']}
        beforeUpload={this.beforeUpload}
        onChange={this.handleOnchange}
        {...rest}
      >
        <Button loading={loading}><i className="iconfont icon-upload"></i>上传文件</Button>
      </Upload>
    )
  }
}