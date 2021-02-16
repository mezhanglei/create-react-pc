import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import InfiniteScroll from "@/components/react-awesome-infinite-scroll";
import { findPath, findLeaves } from "@/utils/array";

class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMore: true,
            inverse: true,
            total: 600,
            exampleTree: [{
                _id: 1,
                children: [{
                    _id: 2,
                    children: [{
                        _id: 4,
                        children: [{
                            _id: 7,
                            children: []
                        }]
                    }, {
                        _id: 5,
                        children: []
                    }]
                }, {
                    _id: 3,
                    children: [{
                        _id: 6,
                        children: [{
                            _id: 8,
                            children: [{
                                _id: 10,
                                children: []
                            }]
                        }, {
                            _id: 9,
                            children: []
                        }]
                    }]
                }]
            }]
        };
    }

    componentDidMount() {
        // first loading
        setTimeout(() => {
            const res = Array.from({ length: 50 });
            this.setState({
                list: res,
                hasMore: res?.length < this.state.total
            });
        }, 100);

        console.log(findPath("_id", "10", this.state.exampleTree[0]));
    }

    // loading more
    fetchMoreData = () => {
        const { maxLength, list = [], total } = this.state;

        if (list.length >= maxLength) {
            this.setState({ hasMore: false });
            return;
        }

        if (list.length >= total) {
            this.setState({ hasMore: false });
            return;
        }

        // simulate request
        new Promise((resolve, reject) => {
            setTimeout(() => {
                // creat a fake 'error' ,so not Use this in real life ;
                if (list.length >= 100 && !this.state.isError) {
                    reject();
                };

                if (this.state.inverse) {
                    resolve([44331 * Math.random(), 233334, 44443, 55554, 5555].concat(list));
                } else {
                    resolve(list.concat([123 * Math.random(), 2444, 3555, 466555, 5545]));
                }

            }, 500);
        }).then(res => {
            const result =
                this.setState({
                    list: res
                });
        }).catch(err => {
            this.setState({
                isError: true
            });
        });
    };

    reload = (e) => {
        new Promise((resolve, reject) => {
            setTimeout(() => {
                const { list = [] } = this.state;
                resolve([11324234 * Math.random(), 22324234, 33242343, 43242344].concat(list));
            }, 500);
        }).then(res => {
            this.setState({
                list: res
            });
        }).catch(err => {
            this.setState({
                isError: true
            });
        });
    }

    renderItem = (_, index) => {
        return (
            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                div - #{index}{_}
            </div>
        );
    }

    render() {
        const { hasMore, isError, inverse, list = [], maxLength } = this.state;

        return (
            <>
                <div style={{ height: "100px" }}>
                    标题组件
                </div>
                <div style={{ height: "500px", overflow: "auto" }}>
                    <InfiniteScroll
                        inverse={inverse}
                        dataSource={list}
                        limit={55}
                        renderItem={this.renderItem}
                        height={200}
                        ref={node => this.node = node}
                        next={this.fetchMoreData}
                        // scrollableParent={document.querySelector(".cart-index")}
                        hasMore={hasMore}
                        pullDownToRefresh
                        refreshFunction={this.fetchMoreData}
                        pullDownComponent={<div style={{ height: "50px", background: "green" }}>下拉</div>}
                        releaseComponent={<div style={{ height: "50px", background: "red" }}>释放</div>}
                        refreshingComponent={<div style={{ height: "50px", background: "green" }}>加载中</div>}
                        refreshEndComponent={<div style={{ height: "50px", background: "red" }}>加载完成</div>}
                        isError={isError}
                        loadingComponent={<div style={{ textAlign: 'center' }}><h4>Loading...</h4></div>}
                        errorComponent={<div style={{ textAlign: "center" }}><span>加载失败？点击<a onClick={() => this.reload()}>重新加载</a></span></div>}
                        endComponent={
                            (list?.length && !maxLength) ?
                                <div style={{ textAlign: 'center', fontWeight: 'normal', color: '#999' }}>
                                    <span>没有更多内容了</span>
                                </div> : null
                        }
                    >
                    </InfiniteScroll>
                </div>
            </>
        );
    }
};

export default Cart;
