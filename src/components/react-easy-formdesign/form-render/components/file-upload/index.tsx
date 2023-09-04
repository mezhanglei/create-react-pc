import { Button, message, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useState } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import './index.less';
import request from '@/http/request';
import { objectToFormData } from '@/utils/object';
import { DOC_MIME_KEYS, DOC_MIME_VALUES } from '@/utils/mime';
import Icon from '@/components/SvgIcon';

export interface FileUploadProps extends Omit<UploadProps, 'onChange'> {
  fileSizeLimit: number; // 每个文件的限制上传大小
  autoUpload?: boolean; // 是否在选取文件后立即上传
  value?: Array<UploadFile>; // 赋值给defaultFileList
  onChange?: (data: Array<FileItem>) => void; // 手动上传时的回调
}
// 扩展后的文件类型
export type FileItem = UploadFile & RcFile;
const FileUpload = React.forwardRef<any, FileUploadProps>((props, ref) => {

  const {
    fileSizeLimit = 5,
    autoUpload = true,
    // 组件原生props
    value,
    onChange,
    action,
    headers,
    name = 'file', // 文件参数名
    data, // 额外参数
    showUploadList,
    accept = DOC_MIME_VALUES.join(','),
    multiple = true,
    children,
    ...rest
  } = props;

  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const [loading, setLoading] = useState<boolean>();

  // 获取文件名
  const getFileName = (file?: FileItem) => {
    const defaultFileName = file?.url && (file.url.substring(file.url.lastIndexOf('/') + 1));
    return file?.name || defaultFileName;
  }

  const checkFile = (file: RcFile) => {
    const fileSize = file.size / 1024 / 1024
    if (fileSize > fileSizeLimit) {
      message.error(`附件大小应小于${fileSizeLimit}M`)
      return Upload.LIST_IGNORE;
    }
    if (fileSize === 0) {
      message.error(`文件不能为空`)
      return Upload.LIST_IGNORE;
    }
    const filename = getFileName(file);
    const suffix = filename?.split('.')?.pop?.()
    if (!suffix) {
      message.error(`请上传正确的文件格式`)
      return Upload.LIST_IGNORE;
    }
    if (!accept?.includes(suffix.toLowerCase())) {
      message.error(`请上传正确的文件格式: ${DOC_MIME_KEYS?.join('，')}`)
      return Upload.LIST_IGNORE;
    }
  }

  // 更新fileList
  const updateFileList = (file: FileItem) => {
    setFileList((old) => {
      const cloneData = old?.length ? [...old] : [];
      const index = old.indexOf(file) > -1 ? old?.indexOf(file) : cloneData?.length;
      if (file) {
        cloneData[index] = file;
      }
      return cloneData;
    });
  }

  // 手动上传
  const handleUploadProps: UploadProps = {
    showUploadList: showUploadList,
    onRemove: (file) => {
      const index = fileList.indexOf(file as RcFile);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      onChange && onChange(newFileList);
      return rest?.onRemove && rest?.onRemove(file);
    },
    beforeUpload: (data) => {
      const file = data as FileItem
      if (checkFile(data) == Upload.LIST_IGNORE) {
        // 改变上传状态为报错
        file.status = 'error'
        return Upload.LIST_IGNORE;
      }
      file.status = 'done'
      const newFileList = [...fileList, file];
      setFileList(newFileList);
      onChange && onChange(newFileList);
      return Upload.LIST_IGNORE;
    },
  };

  // 远程上传
  const autoUploadProps: UploadProps = {
    // 默认关闭已上传列表
    showUploadList: showUploadList !== undefined ? showUploadList : false,
    onRemove: (file) => {
      const index = fileList.indexOf(file as RcFile);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      return rest?.onRemove && rest?.onRemove(file);
    },
    beforeUpload: (data) => {
      const file = data as FileItem
      if (checkFile(file) == Upload.LIST_IGNORE) {
        return Upload.LIST_IGNORE;
      }
    },
    customRequest: async (option) => {
      const file = option?.file as FileItem;
      const formdata = objectToFormData(data);
      formdata.append(name, file);
      setLoading(true)
      request.post(action as string, {
        data: formdata,
        headers: headers,
        onUploadProgress: (event) => {
          const complete = (event.loaded / event.total * 100 | 0);
          file.percent = complete;
          updateFileList(file);
        }
      }).then((res) => {
        file.status = 'success';
        updateFileList(file);
      }).catch((err) => {
        file.status = 'error';
        updateFileList(file);
        message.error(`${file.name}上传失败`);
      }).finally(() => {
        setLoading(false);
      });
    }
  }

  return (
    <Upload
      ref={ref}
      multiple={multiple}
      accept={accept}
      fileList={fileList}
      defaultFileList={value}
      {...(!autoUpload ? handleUploadProps : autoUploadProps)}
      {...rest}
    >
      {children || <Button loading={loading}><Icon name="upload" className="icon-upload"></Icon>上传文件</Button>}
    </Upload>
  )
});

export default FileUpload;
