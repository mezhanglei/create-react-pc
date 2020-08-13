import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import { Button } from "antd";
import http from "@/http/request.js";
import { urlDelQuery, getUrlQuery } from "@/utils/url";
import { connect } from "react-redux";
import Tree from "@/components/tree/tree";
import SendCode from "@/components/sendCode/sendcode";
import TreeTransfer from "@/components/transfer/treeTransfer";

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
            </div>
        );
    }
};

export default Home;
