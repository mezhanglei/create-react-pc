import React, { Component, useState, useEffect } from 'react';
import "./index.less";
import InfiniteScroll from "@/components/infinite-scroll";

class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: Array.from({ length: 100 }),
            hasMore: true
        };
    }

    componentDidMount() {
        // 生成dataSource数据
        this.setState({
            dataSource: [...new Array(100).keys()]
        });
    }

    fetchMoreData = () => {
        if (this.state.items.length >= 10000) {
            this.setState({ hasMore: false });
            return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        setTimeout(() => {
            this.setState({
                items: this.state.items.concat(Array.from({ length: 20 })),
            });
        }, 0);
    };

    render() {
        return (
            <div className="cart-index">
                <InfiniteScroll
                    next={this.fetchMoreData}
                    hasMore={this.state.hasMore}
                    loader={<h4>Loading...</h4>}
                    scrollableTarget={document.querySelector(".cart-index")}
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
        );
    }
};

export default Cart;