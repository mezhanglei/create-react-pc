import { message, Modal, Upload, UploadProps } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useEffect, useState } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { objectToFormData } from '@/utils/object';
import { getBase64 } from './util';
import { IMAGE_MIME_KEYS, isImageFile } from '@/utils/mime';
import request from '@/request/index';

// 扩展后的文件类型
export type FileItem = UploadFile & RcFile & Record<string, any>;
export interface ImageUploadProps extends Omit<UploadProps, 'onChange'> {
  formdataKey: string; // FormData的key
  maxSize?: number; // 每张图片的限制上传大小
  value?: Array<FileItem>;
  onChange?: (data: Array<FileItem>) => void; // 手动上传时的回调
}
const ImageUpload = React.forwardRef<any, ImageUploadProps>((props, ref) => {

  const {
    maxSize = 5,
    // 组件原生props
    value,
    onChange,
    action,
    headers,
    data, // 额外参数
    accept = 'image/gif,image/jpeg,image/jpg,image/png,image/webp,image/bmp',
    listType = 'picture-card',
    maxCount = 5,
    multiple = true,
    children,
    formdataKey = 'file',
    ...rest
  } = props;

  const [fileList, setFileList] = useState<Array<FileItem>>([]);
  const [imageVisible, setImageVisible] = useState<boolean>();
  const [imageTitle, setImageTitle] = useState<string>();
  const [imageSrc, setImageSrc] = useState<string>();
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
    const isDoc = isImageFile(file);
    if (!isDoc) {
      message.error(`请上传正确的图片格式: ${IMAGE_MIME_KEYS?.join('，')}`);
      return Upload.LIST_IGNORE;
    }
  };

  // 更新fileList
  const updateFileList = (file: RcFile, params: Partial<FileItem>) => {
    setFileList((old) => {
      const cloneData = old?.length ? [...old] : [];
      const oldIndex = cloneData.findIndex((item) => item.uid === file.uid);
      const index = oldIndex > -1 ? oldIndex : cloneData?.length;
      if (file) {
        cloneData[index] = { ...file, ...params };
      }
      return cloneData;
    });
  };

  // 远程上传
  const UploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file as RcFile);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      return rest?.onRemove && rest?.onRemove(file);
    },
    beforeUpload: async (data) => {
      const file = data as RcFile;
      if (checkFile(file) == Upload.LIST_IGNORE) {
        return Upload.LIST_IGNORE;
      }
    },
    customRequest: async (option) => {
      const file = option?.file as RcFile;
      const formdata = objectToFormData(data);
      formdata.append(formdataKey, file);
      setLoading(true);
      request(action, {
        method: 'post',
        data: formdata,
        headers: headers,
        onUploadProgress: (event: any) => {
          const complete = (event.loaded / event.total * 100 | 0);
          updateFileList(file, { percent: complete });
        }
      }).then((res) => {
        // TODO: 获取fileId
        const data = res.data;
        // @ts-ignore
        updateFileList(file, { status: 'success' });
      }).catch(() => {
        updateFileList(file, { status: 'error' });
        message.error(`${file.name}上传失败`);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

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
  };

  const handleCancel = () => {
    setImageVisible(false);
  };

  // 获取文件名
  const getFileName = (file?: FileItem) => {
    const defaultFileName = file?.url && (file.url.substring(file.url.lastIndexOf('/') + 1));
    return file?.name || defaultFileName;
  };

  const uploadButton = children || (
    <div>
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Upload
        ref={ref}
        multiple={multiple}
        fileList={fileList}
        accept={accept}
        listType={listType}
        onPreview={handlePreview}
        maxCount={maxCount}
        {...UploadProps}
        {...rest}
      >
        {fileList?.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal
        visible={imageVisible}
        title={imageTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={imageSrc} />
      </Modal>
    </>
  );
});

export default ImageUpload;
