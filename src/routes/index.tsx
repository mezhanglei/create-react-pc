import React, { ReactNode } from "react";
import { HashRouter as Router, Route, Switch, Prompt, Redirect, RouteProps } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch, Prompt, Redirect } from "react-router-dom";
import { Demo1Route } from "./demo1";
import { Demo2Route } from "./demo2";
import { DefaultRoutes } from "./default";
import NotFound from "@/components/default/not-found";
import { initWX } from "@/core/wx";
import { isLogin } from "@/core/common";
import { LOGIN_ROUTE } from "@/constants/account/index";
import TransitionRoute from "./transitionRoute";
import { HashHistory, BrowserHistory } from "./history";
import CustomPrompt from "@/components/prompt";

export interface MyRouteProps extends RouteProps {
    auth?: boolean; // 是否需要权限验证
    component: any; // 组件
}

// 路由配置
const routes = [
    ...Demo1Route,
    ...Demo2Route,
    ...DefaultRoutes,
    // {
    //     path: '*',
    //     component: NotFound,
    //     auth: true
    // }
];

// 进入路由页面之前触发的方法
function beforeRouter(props, item: MyRouteProps) {
    // 微信授权
    // initWX();
}

// 路由组件
export default function RouteComponent() {
    // BrowserRouter时需要设置basename
    const basename = Router.name == "BrowserRouter" ? process.env.PUBLIC_PATH : "";

    return (
        <Router basename={basename}>
            <Switch>
                {routes.map((item: MyRouteProps, index) => {
                    return <Route
                        key={index}
                        exact={item.exact}
                        path={item.path}
                        render={(props) => {
                            beforeRouter(props, item);
                            if (!isLogin() && item.auth) {
                                return <Redirect to={{ pathname: LOGIN_ROUTE, state: { from: props.location } }} />;
                            } else {
                                return (
                                    <React.Fragment>
                                        <CustomPrompt isPrompt={true} />
                                        <item.component key={item.path} {...props}></item.component>
                                    </React.Fragment>
                                );
                            }
                        }}
                    />;
                })}
            </Switch>
            <TransitionRoute />
        </Router>
    );
}
