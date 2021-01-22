import React from "react";
import { HashRouter as Router, Route, Switch, Prompt, Redirect } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch, Prompt, Redirect } from "react-router-dom";
import { HomeRoutes, Home } from "./home";
import { CategoryRoutes } from "./category";
import { CartRoutes } from "./cart";
import { PersonalRoutes } from "./personal";
import NotFound from "@/components/default/not-found";
import { DefaultRoutes } from "./default";
import { initWX } from "@/core/wx";
import { isLogin } from "@/core/common";
import { LOGIN_ROUTE } from "@/constants/account/index";
import TransitionRoute from "./transitionRoute";
import Modal from "@/components/modal/index";
import { HashHistory, BrowserHistory } from "./history";
import CustomPrompt from "@/components/prompt";

/**
 * 页面路由配置
 * 必填参数说明：
 *  1.path: 路由
 *  2.component: 组件
 * 非必填参数说明：
 *  exact: 默认false， 为true时表示严格匹配，只有访问的路由和目标完全相等时才会被渲染
 */
const routes = [
    {
        path: "/",
        component: Home,
        // 路由为/时必须设置exact为true
        exact: true
    },
    ...HomeRoutes,
    ...CategoryRoutes,
    ...CartRoutes,
    ...PersonalRoutes,
    ...DefaultRoutes,
    // {
    //     path: '*',
    //     component: NotFound,
    //     auth: true
    // }
];

// 进入路由页面之前触发的方法
function beforeRouter(props, item) {
    // 微信授权
    // initWX();
}

/**
 * 渲染路由组件(根据需要修改)
 * Router是所有路由组件共用的底层接口组件，它是路由规则制定的最外层的容器。
   Route路由规则匹配，并显示当前的规则对应的组件。
   Link路由跳转的组件
 * history路由模式Router的参数
 * 1.basename  类型string, 路由访问基准
 * 2.forceRefresh:bool true则表示导航时刷新页面.
 * 4.children:node 要渲染的子元素。
 * Route的参数(可传函数或组件, 值为函数时都会接受所有由route传入的所有参数):
 * 1.component: 使用React.createElement创建组件, 每次更新和渲染都会重新创建新组件, 卸载旧组件, 挂载新组件
 * 2.render: 当路由的路径匹配时调用(推荐).
 * 3.children: 当children的值是一个函数时，无论当前地址和path路径匹不匹配，都将会执行children对应的函数
 */
export default function RouteComponent() {
    // BrowserRouter时需要设置basename
    const basename = Router.name == "BrowserRouter" ? process.env.PUBLIC_PATH : "";

    return (
        <Router basename={basename} history={history}>
            <Switch>
                {routes.map((item, index) => {
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
