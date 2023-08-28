import { message, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useState } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import request from '@/http/request';
import { objectToFormData } from '@/utils/object';
import { getBase64 } from './util';
import CustomModal from '@/components/ant-modal';

export interface ImageUploadProps extends Omit<UploadProps, 'onChange'> {
  fileSizeLimit: number; // 每张图片的限制上传大小
  autoUpload?: boolean; // 是否在选取文件后立即上传
  value?: Array<UploadFile>; // 赋值给defaultFileList
  onChange?: (data: Array<FileItem>) => void; // 手动上传时的回调
}
// 扩展后的文件类型
export type FileItem = UploadFile & RcFile;
const ImageUpload = React.forwardRef<any, ImageUploadProps>((props, ref) => {

  const {
    fileSizeLimit = 5,
    autoUpload,
    // 组件原生props
    value,
    onChange,
    action,
    headers,
    name = 'file', // 文件参数名
    data, // 额外参数
    accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp',
    listType = 'picture-card',
    maxCount = 5,
    multiple = true,
    children,
    ...rest
  } = props;

  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const [imageVisible, setImageVisible] = useState<boolean>();
  const [imageTitle, setImageTitle] = useState<string>();
  const [imageSrc, setImageSrc] = useState<string>();
  const [loading, setLoading] = useState<boolean>();

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

  // 手动上传(只上传到本地)
  const handleUploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file as RcFile);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      onChange && onChange(newFileList);
      return rest?.onRemove && rest?.onRemove(file);
    },
    beforeUpload: async (data) => {
      const file = data as FileItem
      if (checkFile(data) == Upload.LIST_IGNORE) {
        // 改变上传状态为报错
        file.status = 'error'
        return Upload.LIST_IGNORE;
      }
      file.status = 'done'
      file.thumbUrl = await getBase64(file);
      const newFileList = [...fileList, file];
      setFileList(newFileList);
      onChange && onChange(newFileList);
      return Upload.LIST_IGNORE;
    },
  };

  // 远程上传
  const autoUploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file as RcFile);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      return rest?.onRemove && rest?.onRemove(file);
    },
    beforeUpload: async (data) => {
      const file = data as FileItem
      if (checkFile(file) == Upload.LIST_IGNORE) {
        return Upload.LIST_IGNORE;
      }
      file.thumbUrl = await getBase64(file);
      const newFileList = [...fileList, file];
      setFileList(newFileList);
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

  const handlePreview = async (data: UploadFile) => {
    const file = data as FileItem;
    if (!file.url && !file.preview) {
      const fileChoose = file.originFileObj || file; // 源文件或当前的文件
      file.preview = await getBase64(fileChoose);
    }
    setImageSrc(file.url || file.preview);
    setImageVisible(true);
    const filename = getFileName(file);
    setImageTitle(filename);
  }

  const handleCancel = () => {
    setImageVisible(false);
  }

  // 获取文件名
  const getFileName = (file?: FileItem) => {
    const defaultFileName = file?.url && (file.url.substring(file.url.lastIndexOf('/') + 1));
    return file?.name || defaultFileName;
  }

  const uploadButton = children || (
    <div>
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Upload
        ref={ref}
        multiple={multiple}
        fileList={fileList}
        defaultFileList={value}
        accept={accept}
        listType={listType}
        onPreview={handlePreview}
        maxCount={maxCount}
        {...(!autoUpload ? handleUploadProps : autoUploadProps)}
        {...rest}
      >
        {fileList?.length >= maxCount ? null : uploadButton}
      </Upload>
      <CustomModal visible={imageVisible} title={imageTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={imageSrc} />
      </CustomModal>
    </>
  )
});

export default ImageUpload;
