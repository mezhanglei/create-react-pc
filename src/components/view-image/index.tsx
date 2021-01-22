import React, { useEffect, useState } from 'react';
import Carousel, { ModalProps, CarouselProps, Modal, ModalGateway, ViewType } from 'react-images';

// 组件的props
export interface ViewImagesProps extends CarouselProps {
    currentIndex: number; // 当前显示的currentIndex
    visible: boolean; // 是否显示弹窗
    views: ViewType[]; // 预览数组
    ModalProps: ModalProps; // modal的props
    CarouselProps: CarouselProps; // 轮播图的props
}

// 图片预览组件
const ViewImages: React.FC<ViewImagesProps> = (props) => {

    const {
        views,
        ...restProps
    } = props;

    const [visible, setVisible] = useState<boolean>();
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        setVisible(props.visible);
    }, [props.visible]);

    useEffect(() => {
        setCurrentIndex(props.currentIndex);
    }, [props.currentIndex]);

    const toggleVisible = (event: React.SyntheticEvent<HTMLButtonElement>) => {
        setVisible(!visible);
    };

    return (
        <ModalGateway>
            {visible ? (
                <Modal onClose={toggleVisible}>
                    <Carousel
                        {...restProps}
                        currentIndex={currentIndex}
                        views={views}
                    />
                </Modal>
            ) : null}
        </ModalGateway>
    );
};

export default ViewImages;
