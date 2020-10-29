import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./app.js";
import store from "@/store/index.js";

// 引入全局样式
import "less/index.less";

// 只在开发环境下引入
// if (process.env.NODE_ENV === 'development') {
//     import("vconsole").then(module => {
//         const VConsole = module.default;
//         new VConsole();
//     });
// }

import DefineEvent from "@/utils/event.js";
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

// 处理点击移动端事件
import FastClick from "fastclick";
FastClick.attach(document.body);
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);
