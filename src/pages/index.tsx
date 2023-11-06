import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app";
import store from "@/store/index";
import { ConfigProvider } from 'antd';
import antdConfigs from "@/components/configs";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// 引入全局样式
import "../less/index.less";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { getUrlQuery } from "@/utils/url";
import { clearUserInfo, initUserInfo, setToken } from "@/utils/auth";

// 只在开发环境下引入
// if (process.env.NODE_ENV === 'development') {
//     import("vconsole").then(module => {
//         const VConsole = module.default;
//         new VConsole();
//     });
// }

// 支持传token参数时直接登录进系统
const token = getUrlQuery('token');
const rootDiv = document.getElementById("root")
const root = rootDiv && createRoot(rootDiv);
if (token) {
  clearUserInfo();
  const tokenString = decodeURIComponent(token);
  setToken(tokenString);
  initUserInfo().then(() => {
    root && root.render(
      <Provider store={store} >
        <ConfigProvider {...antdConfigs} >
          <App />
        </ConfigProvider>
      </Provider>
    );
  })
} else {
  root && root.render(
    <Provider store={store} >
      <ConfigProvider {...antdConfigs} >
        <App />
      </ConfigProvider>
    </Provider>
  );
}
