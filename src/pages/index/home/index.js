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
    }

    handleOk=() => {

    }

    handleCancel=() => {
        
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
            </div>
        );
    }
};

export default Home;
