import { Button, message, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useEffect, useState } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import './index.less';
import { objectToFormData } from '@/utils/object';
import { DOC_MIME_KEYS, DOC_MIME_VALUES, isDocFile } from '@/utils/mime';
import request from '@/request/index';

// 扩展后的文件类型
export type FileItem = UploadFile & RcFile & Record<string, any>;
export interface FileUploadProps extends Omit<UploadProps, 'onChange'> {
  formdataKey: string; // FormData的key
  maxSize?: number; // 每个文件的限制上传大小
  value?: Array<FileItem>; // 赋值给defaultFileList
  onChange?: (data: Array<FileItem>) => void; // 手动上传时的回调
  uploadCallback?: (data: any) => any; // 上传请求函数回调
}
const FileUpload = React.forwardRef<any, FileUploadProps>((props, ref) => {

  const {
    maxSize = 5,
    // 组件原生props
    value,
    onChange,
    action,
    headers,
    data, // 额外参数
    showUploadList,
    accept = DOC_MIME_VALUES.join(','),
    multiple = true,
    children,
    formdataKey = 'file',
    uploadCallback,
    ...rest
  } = props;

  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    setFileList(JSON.parse(JSON.stringify(value || [])));
  }, [value]);

  const checkFile = (file: RcFile) => {
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > maxSize) {
      message.error(`附件大小应小于${maxSize}M`);
      return Upload.LIST_IGNORE;
    }
    if (fileSize === 0) {
      message.error(`文件不能为空`);
      return Upload.LIST_IGNORE;
    }
    const isDoc = isDocFile(file);
    if (!isDoc) {
      message.error(`请上传正确的文件格式: ${DOC_MIME_KEYS?.join('，')}`);
      return Upload.LIST_IGNORE;
    }
  };

  // 自定义上传
  const UploadProps: UploadProps = {
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
      const file = data as FileItem;
      if (checkFile(file) == Upload.LIST_IGNORE) {
        return Upload.LIST_IGNORE;
      }
    },
    customRequest: async (option) => {
      const file = option?.file as RcFile;
      if (!file) return;
      const cloneData = [...fileList];
      const insertIndex = cloneData?.length;
      const formdata = objectToFormData(data);
      formdata.append(formdataKey, file);
      setLoading(true);
      request(action, {
        method: 'post',
        data: formdata,
        headers: headers,
        onUploadProgress: (event: any) => {
          const complete = (event.loaded / event.total * 100 | 0);
          cloneData[insertIndex] = { ...file, percent: complete };
          setFileList(cloneData);
        }
      }).then((res) => {
        const data = res.data;
        const params = uploadCallback ? uploadCallback(data) : {};
        cloneData[insertIndex] = { ...file, status: 'success', ...params };
        onChange && onChange(cloneData);
        setFileList(cloneData);
      }).catch(() => {
        cloneData[insertIndex] = { ...file, status: 'error' };
        setFileList(cloneData);
        message.error(`${file.name}上传失败`);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <Upload
      ref={ref}
      multiple={multiple}
      accept={accept}
      fileList={fileList}
      {...UploadProps}
      {...rest}
    >
      {children || <Button loading={loading}>上传文件</Button>}
    </Upload>
  );
});

export default FileUpload;
