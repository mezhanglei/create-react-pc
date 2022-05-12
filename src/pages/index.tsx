import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./app";
import store from "@/store/index";
import { ConfigProvider } from 'antd';
import antdConfigs from "@/core/antd-configs";
import objectFitImages from 'object-fit-images';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// 引入全局样式
import "less/index.less";
import "core-js/stable";
import "regenerator-runtime/runtime";

// 只在开发环境下引入
// if (process.env.NODE_ENV === 'development') {
//     import("vconsole").then(module => {
//         const VConsole = module.default;
//         new VConsole();
//     });
// }

import ClickListen from "@/utils/listen-click";
import { getUrlQuery } from "@/utils/url";
import { clearUserInfo, initUserInfo, setToken } from "@/core/session";
// 实例化一个节流类，在标签上有自定属性name的标签的click事件将被进行节流操作
const event = new ClickListen({
  name: "event-name=throttle",
  callback: function (e) {
    if (!this.timer) {
      this.timer = setTimeout(() => {
        e.cancelBubble = false;
        this.timer = null;
      }, 5000);
    } else {
      e.cancelBubble = true;
    }
  }
});
event.addEvent();

setTimeout(() => {
  objectFitImages();
}, 100);

// 支持传token参数时直接登录进系统
const token = getUrlQuery('token');
if (token) {
  clearUserInfo();
  const tokenString = decodeURIComponent(token);
  setToken(tokenString);
  initUserInfo().then(() => {
    ReactDOM.render(
      <Provider store={store} >
        <ConfigProvider {...antdConfigs} >
          <App />
        </ConfigProvider>
      </Provider>,
      document.getElementById("root")
    );
  })
} else {
  ReactDOM.render(
    <Provider store={store} >
      <ConfigProvider {...antdConfigs} >
        <App />
      </ConfigProvider>
    </Provider>,
    document.getElementById("root")
  );
}


