import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import { Button } from "antd";
import http from "@/http/request.js";
import { urlDelQuery, getUrlQuery } from "@/utils/url";
import { connect } from "react-redux";
import Tree from "@/components/tree/tree";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
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

    render() {
        return (
            <div>
                <div className="home">首页
                    <Tree inline={false} />
                </div>
            </div>
        );
    }
};

export default Home;
