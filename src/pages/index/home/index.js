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
import Draggable from "@/components/react-draggable/Draggable";
import raf from "@/utils/requestAnimationFrame";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
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
        // this.setState({ visible: true });
        Modal.confirm({
            title: '1111',
            content: 11111,
            onCancel: function(){},
        })
    }

    handleOk = () => {

    }

    handleCancel = () => {

    }

    render() {
        return (
            <div>
                <div className="home" style={{ height: '2000px' }}>首页
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
                    <Button className="handle" type="primary">
                        时间
                    </Button>
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
            </div>
        );
    }
};

export default Home;
