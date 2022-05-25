import { getToken } from '@/core/session';
import { UploadFileUrl } from '@/services/file';
import { isObjectEqual } from '@/utils/object';
import { Button, message, Modal, Upload, UploadProps } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
// import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

export interface UploadImageProps extends UploadProps {
  fileSizeLimit: number; // 每个文件的限制上传大小
  value?: Array<UploadFile>; // 反显的文件列表
  onChange?: (data: unknown) => void; // 重写控件变化的回调
  autoUpload?: boolean; // true直接上传到目标接口 false不会直接上传到接口，只会获取上传的临时文件
}

export interface UploadImageState {
  previewTitle?: string;
  previewImage?: string;
  previewVisible?: boolean;
  loading?: boolean;
  fileList: Array<UploadFile>;
  prevFileList?: Array<UploadFile>;
}

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// 非图片文件上传组件
export default class UploadImage extends React.Component<UploadImageProps, UploadImageState> {

  constructor(props: UploadImageProps) {
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
    accept: 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp',
    headers: { Authorization: getToken() },
    data: {}, // 额外参数
    name: 'file', // 参数名
    listType: "picture-card"
  }

  componentDidMount() {
    this.setState({
      fileList: this.props?.value || []
    })
  }

  // 当state数据改变时触发更新
  componentDidUpdate(prevProps: UploadImageProps) {
    const valueChanged = this.props.value !== undefined && !isObjectEqual(this.props.value, prevProps.value);
    if (valueChanged) {
      this.setState({
        fileList: this.props.value || []
      })
    }
  }

  // 获取外部props更新时去更新state
  static getDerivedStateFromProps(nextProps: UploadImageProps, prevState: UploadImageState) {
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
      message.error(`图片大小应小于${fileSizeLimit}M`)
      return false;
    }
    if (fileSize === 0) {
      return false;
    }
  }

  // 上传文件改变时(TODO：根据实际使用情况再进行处理)
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

  // 预览
  handlePreview: UploadProps['onPreview'] = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  render() {
    const { value, onChange, ...rest } = this.props;
    const { maxCount } = rest;
    const { fileList, previewVisible, previewImage, previewTitle } = this.state;
    const uploadButton = (
      <div>
        {/* <PlusOutlined /> */}
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <>
        <Upload
          defaultFileList={fileList}
          beforeUpload={this.beforeUpload}
          onChange={this.handleOnchange}
          onPreview={this.handlePreview}
          {...rest}
        >
          {fileList?.length >= maxCount ? null : uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </>
    )
  }
}