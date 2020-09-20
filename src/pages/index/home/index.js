import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import { Button } from "antd";
import http from "@/http/request.js";
import { connect } from "react-redux";
import Tree from "@/components/tree/tree";
import SendCode from "@/components/sendCode/sendcode";
import TreeTransfer from "@/components/transfer/treeTransfer";
import Checkbox from "@/components/checkbox/index";
import CheckBox from '@/components/checkbox/index';

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
            </div>
        );
    }
};

export default Home;
