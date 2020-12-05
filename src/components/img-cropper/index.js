import React, { useEffect, useState } from 'react';
import { dataURLtoFile } from '@/utils/file';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // 目前是将该组件的css样式手动拷贝出来
import Modal from "@/components/modal";
import Button from "@/components/button";
import "./index.less";

const ImageCropper = (props) => {
    const {
        accept = "image/png, image/jpeg, image/jpg",
        src,
        maxSize = 5,
        onSubmit
    } = props;

    const [visible, setVisible] = useState(false);
    const [originalFile, setOriginalFile] = useState(null);
    const [originalSrc, setOriginalSrc] = useState("");
    const [croppedImageUrl, setCroppedImageUrl] = useState("");
    const [transformRotate, setTransformRotate] = useState(0);
    const [imageEle, setImageEle] = useState();
    const inputBtn = React.createRef();

    const config = {
        maxWidth: 400,
        maxHeight: 200
    }

    const defaultCrop = {
        unit: '%', // 单位百分比
        width: 50, // 裁剪宽度百分之90
        aspect: 16 / 9, // 宽高比
        x: 25, // 区域的x轴位置
        y: 25, // 区域的y轴位置
    }
    const [crop, setCrop] = useState(defaultCrop);

    // 上传图片
    const uploading = (e) => {
        const files = e.target.files;
        if (files?.length) {
            const file = files[0];
            if (maxSize < parseInt(file.size) / 1024 / 1024) {
                console.error(`图片上传尺寸不能超过${maxSize}M`);
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setOriginalSrc(reader.result);
                setOriginalFile(file)
                setVisible(true);
            });
            reader.readAsDataURL(file);
        }
    }

    const handleOk = () => {
        const file = dataURLtoFile(croppedImageUrl, originalFile.fileName);
        onSubmit && onSubmit(file);
        close();
    }

    const handleCancel = () => {
        close();
        setCroppedImageUrl("");
        setOriginalSrc("");
    }

    const close = () => {
        setVisible(false);
        setCrop(defaultCrop);
        if (inputBtn) {
            inputBtn.current.value = "";
        }
    }

    // 图片加载
    const onImageLoaded = (image) => {
        initImage(image);
    };

    // 初始化图片(设置裁剪区域)
    const initImage = (image) => {
        const { width, height } = image;
        let aspectRatio = width / height;
        const { maxWidth, maxHeight } = config;
        // 哪个边长就以哪个边为参考进行缩放
        if (width > height) {
            image.width = Math.min(maxWidth, width);
        } else {
            image.height = Math.min(maxHeight, height);
        }
        setImageEle(image);
        setCrop(defaultCrop);
    };

    // 初始化裁剪效果
    useEffect(() => {
        if (imageEle) {
            onCropComplete(crop)
        }
    }, [imageEle, transformRotate])

    // crop发生改变的时候
    const onCropChange = (newCrop, percentCrop) => {
        // You could also use percentCrop:
        // setCrop(percentCrop);
        setCrop(newCrop);
    };

    // crop结束改变的时候
    const onCropComplete = async (crop) => {
        if (imageEle && crop.width && crop.height) {
            const croppedImageUrl = await getCroppedImg(imageEle, crop);
            setCroppedImageUrl(croppedImageUrl);
        }
    }

    // 裁剪图片
    const getCroppedImg = (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        console.log(crop.width)
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        // ctx.translate(canvas.width / 2, canvas.height / 2);
        // ctx.rotate(transformRotate * Math.PI / 180);
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return new Promise((resolve, reject) => {
            // 异步转换成blob
            // canvas.toBlob(blob => {
            //     blob.name = originalFile.fileName;
            //     resolve(blob);
            //   }, 'image/jpeg', 1);
            // 同步转换成dataUrl
            resolve(canvas.toDataURL('image/png'));
        });
    }

    // 根据旋转角度获取crop相对于原图的坐标
    const getPosition = (deg) => {

    }

    // 旋转裁剪图像
    const changeRotate = () => {
        let rotate = transformRotate + 90;
        rotate = rotate > 360 ? 90 : rotate;
        setTransformRotate(rotate);
        if (imageEle) {
            imageEle.style.transform = `rotate(${rotate}deg)`;
        }
    };

    const renderModal = (originalSrc) => {
        return (
            <Modal
                title="上传图片"
                visible={visible}
                centered
                maskClosable
                destroyOnClose
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button type="primary" key="cancel" onClick={handleCancel}>取消</Button>,
                    <Button type="primary" key="confirm" onClick={handleOk}>确认</Button>
                ]}
            >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <ReactCrop
                        src={originalSrc}
                        crop={crop || defaultCrop}
                        ruleOfThirds // 显示线
                        onImageLoaded={onImageLoaded}
                        onComplete={onCropComplete}
                        onChange={onCropChange}
                    />
                    <div onClick={changeRotate}>
                        旋转
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <div className="img-crop">
            <img src={croppedImageUrl || src} className="my-img" alt="" />
            <div className="btn-text">
                上传头像
            </div>
            <input ref={inputBtn} onChange={uploading} type="file" name="file" className="upload-btn" accept={accept} multiple={false}></input>
            {originalSrc && renderModal(originalSrc)}
        </div>
    )
}

export default ImageCropper;