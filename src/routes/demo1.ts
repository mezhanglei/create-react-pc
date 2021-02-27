import loadable from "@/components/lazy";

export const Demo1 = loadable({ loader: () => import(/* webpackChunkName: "demo1" */ '@/pages/demo1/index') });

// 首页
export const Demo1Route = [
    {
        path: "/",
        component: Demo1,
        exact: true
    },
    {
        path: "/demo1",
        component: Demo1,
        // 自定义字段，额外的组件信息
        meta: {
            title: "demo1",
        }
    }
];
