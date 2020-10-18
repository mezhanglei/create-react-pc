import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import http from "@/http/request.js";
import { connect } from "react-redux";
import Tree from "@/components/tree/tree";
import SendCode from "@/components/sendCode/sendcode";
import TreeTransfer from "@/components/transfer/treeTransfer";
import CheckBox from '@/components/checkbox/index';
import Button from "@/components/button/index";
import Modal from "@/components/modal";
// import { Modal } from "antd";
import Draggable from "@/components/react-draggable/Draggable";
import raf from "@/utils/requestAnimationFrame";
import DragResize from "@/components/drag-layout";
import CaptchaImg from "@/components/captcha-img/index";
import VirtualList from '@/components/virtual-list/index';
import { DraggableArea, DraggableAreasGroup } from "@/components/draggable";

const group = new DraggableAreasGroup();
const DraggableArea1 = group.addArea(111);
const DraggableArea2 = group.addArea(222);

const initialTags = [
    { id: 1, content: 'apple' }, { id: 2, content: 'olive' }, { id: 3, content: 'banana' },
    { id: 4, content: 'lemon' }, { id: 5, content: 'orange' }, { id: 6, content: 'grape' },
    { id: 7, content: 'strawberry' }, { id: 8, content: 'cherry' }, { id: 9, content: 'peach' }];

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            leftTags: [
                { id: 11, content: 'apple', undraggable: true }, { id: 22, content: 'olive' }, { id: 33, content: 'banana' },
                { id: 14, content: 'apple' }, { id: 27652, content: 'olive' }, { id: 35673, content: 'banana' }
            ],
            rightTags: [
                { id: 13, content: 'apple' }, { id: 2753, content: 'olive' }, { id: 3764, content: 'banana' },
                { id: 14641, content: 'apple' }, { id: 56722, content: 'olive' }, { id: 37563, content: 'banana' }
            ]
        };
    }
    static defaultProps = {
        type: '首页'
    }

    componentDidMount() {
        http.post({
            url: "/list",
            data: {}
        });
        raf.setAnimation(this.handler);
    }

    handler = (time) => {
        const timeCount = 3000;
        const distance = 1500;
        let divEle = document.getElementById("div");
        if (time > timeCount) {
            time = timeCount;
        }
        divEle.style.left = time * distance / timeCount + 'px';
        raf.setAnimation(this.handler);
    }

    onSubmit = () => {

    }

    handle = () => {
        this.setState({
            isSend: true
        });
    }

    showModal = () => {
        this.setState({ visible: true });
        // Modal.confirm({
        //     title: '1111',
        //     content: 11111,
        //     maskClosable:true,
        //     onCancel: function () { },
        // })
    }

    handleOk = () => {

    }

    handleCancel = () => {
        this.setState({ visible: false });
    }

    renderItem = ({ style, index }) => {
        return (
            <div className="Row" style={style} key={index}>
                Row #{index}
            </div>
        );
    };

    renderOn = (start, stop) => {
        console.log(start, stop)
    }

    render() {
        return (
            <div>
                <div className="home">首页
                    <Tree inline={true} />
                    <SendCode isSend={true} handle={this.handle} />
                    <TreeTransfer />
                </div>
                <CheckBox disabled checked>
                    123131321312
                </CheckBox>
                <Draggable
                    axis="x"
                    handle=".handle"
                    defaultPosition={{ x: 10, y: 0 }}
                    position={null}
                    // grid={[100, 25]}
                    scale={1}
                >
                    <div style={{display: 'inline-block'}}>
                        <Button className="handle" type="primary">
                            拖拽元素
                        </Button>
                    </div>
                </Draggable>
                <Button onClick={this.showModal} type="primary">
                    打开1
                </Button>
                <Modal
                    title="Basic Modal"
                    visible={this.state.visible}
                    centered
                    maskClosable
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Modal>
                <div id="div" style={{ width: '100px', height: '100px', backgroundColor: '#000', position: "absolute", left: 0, top: 0 }}>
                </div>
                <div className="Simple">
                    <DraggableArea
                        tags={initialTags}
                        withHotspot={true}
                        render={({ tag, index }) => (
                            <DragResize>
                                <div className="tag">
                                    {tag.content}
                                </div>
                            </DragResize>
                        )}
                    // onChange={tags => console.log(tags)}
                    />
                </div>
                <div className="Simple">
                    <DraggableArea1
                        tags={this.state.leftTags}
                        render={({ tag }) => (
                            <div className="tag">
                                {tag.content}
                            </div>
                        )}
                        onChange={leftTags => this.setState({ leftTags })}
                    />
                </div>
                <div className="Simple">
                    <DraggableArea2
                        tags={this.state.rightTags}
                        render={({ tag }) => (
                            <div className="tag">
                                <img
                                    className="delete"
                                    onClick={() => this.handleClickDelete(tag)}
                                />
                                {tag.content}
                            </div>
                        )}
                        onChange={rightTags => this.setState({ rightTags })}
                    />
                </div>
                <CaptchaImg />
                <VirtualList
                    width="auto"
                    height={400}
                    itemCount={50}
                    renderItem={this.renderItem}
                    onItemsRendered={this.renderOn}
                    itemSize={50}
                    className="VirtualList"
                />
            </div>
        );
    }
};

export default Home;
