import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./app";
import store from "@/store/index";
import { ConfigProvider } from 'antd';
import antdConfigs from "@/core/antd-configs";
import objectFitImages from 'object-fit-images';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// 引入全局样式
import "less/index.less";

// 只在开发环境下引入
// if (process.env.NODE_ENV === 'development') {
//     import("vconsole").then(module => {
//         const VConsole = module.default;
//         new VConsole();
//     });
// }

import DefineEvent from "@/utils/event";
// 实例化一个节流类，自定义属性event-name="throttle"的标签上的click事件将被进行节流操作
const event = new DefineEvent({
    eventName: "throttle",
    eventFn: function (e) {
        if (!this.timer) {
            this.timer = setTimeout(() => {
                e.cancelBubble = false;
                this.timer = null;
            }, 500);
        } else {
            e.cancelBubble = true;
        }
    }
});
event.addEvent();

setTimeout(() => {
    objectFitImages();
}, 100);

// 处理点击移动端事件
import FastClick from "fastclick";
FastClick.attach(document.body);
ReactDOM.render(
    <Provider store={store}>
        <ConfigProvider {...antdConfigs}>
            <App />
        </ConfigProvider>
    </Provider>,
    document.getElementById("root")
);
