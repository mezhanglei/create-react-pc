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
import DragResize from "@/components/drag-layout";
import CaptchaImg from "@/components/captcha-img/index";
import VirtualList from '@/components/virtual-list/index';
import { DraggableArea, DraggableAreasGroup } from "@/components/draggable";
import DotLoading from "@/components/loading-animation/dot-loading";
import InfiniteScroll from "@/components/infinite-scroll";

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
            items: Array.from({ length: 10 }),
            hasMore: true,
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

        // 生成dataSource数据
        this.setState({
            dataSource: [...new Array(100).keys()]
        });
    }

    handler = (time) => {
        const timeCount = 3000;
        const distance = 1500;
        let divEle = document.getElementById("div");
        if (time > timeCount) {
            time = timeCount;
        }
        divEle.style.left = time * distance / timeCount + 'px';
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

    renderItem = ({ item, index }) => {
        return (
            <div className="Row" key={index}>
                Row #{item}
            </div>
        );
    };

    renderOn = ({ startIndex, stopIndex }) => {
        // console.log(startIndex, stopIndex);
    }

    fetchMoreData = () => {
        if (this.state.items.length >= 500) {
            this.setState({ hasMore: false });
            return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        setTimeout(() => {
            this.setState({
                items: this.state.items.concat(Array.from({ length: 20 })),
            });
        }, 500);
    };

    render() {
        return (
            <div>
                <div className="home">首页
                    <Tree inline={true} />
                    <SendCode isSend={true} handle={this.handle} />
                    <TreeTransfer />
                </div>
                <div style={{ width: '500px' }}>
                    <InfiniteScroll
                        next={this.fetchMoreData}
                        hasMore={this.state.hasMore}
                        loader={<h4>Loading...</h4>}
                        pullDownToRefresh
                        pullDownToRefreshContent={
                            <h3 style={{ textAlign: 'center' }}>
                                &#8595; Pull down to refresh
                            </h3>
                        }
                        releaseToRefreshContent={
                            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                        }
                        refreshFunction={this.fetchMoreData}
                        // inverse
                        minPullDown={100}
                        maxPullDown={200}
                        height={200}
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>Yay! You have seen it all</b>
                            </p>
                        }
                    >
                        {this.state.items.map((_, index) => (
                            <div style={{ height: 30, border: '1px solid green', margin: 6, padding: 8 }} key={index} >
                                div - #{index}
                            </div>
                        ))}
                    </InfiniteScroll>
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
                    <div style={{ display: 'inline-block' }}>
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
                    destroyOnClose
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
                    // scrollToAlignment="start"
                    // scrollToIndex={30}
                    scrollOffset={500}
                    height={400}
                    limit={200}
                    dataSource={this.state.dataSource}
                    renderItem={this.renderItem}
                    onItemsRendered={this.renderOn}
                    itemSize={50}
                    className="VirtualList"
                />
                <DotLoading />
            </div>
        );
    }
};

export default Home;
