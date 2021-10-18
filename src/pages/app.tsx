import React from "react";
import "./app.less";
// 引入路由组件
import RouteComponent from "@/routes/index";
import NotFound from "@/components/default/not-found";
import ReactDOM from "react-dom";

// 路由组件
function MyRoutes() {
    return (
        <React.Suspense fallback={null}>
            <RouteComponent />
        </React.Suspense>
    );
}

// 根组件
const App: React.FC<any> = (props) => {
    return (
        <div className="app">
            <div>
            <MyRoutes />
            </div>
        </div>
    );
}

export default App;
