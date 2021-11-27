import loadable from "@/components/lazy";

const Demo1 = loadable({ loader: () => import(/* webpackChunkName: "demo1" */ '@/pages/demo1/index') });
const Demo2 = loadable({ loader: () => import(/* webpackChunkName: "demo2" */ '@/pages/demo2/index') });
const Demo3 = loadable({ loader: () => import(/* webpackChunkName: "demo3" */ '@/pages/demo3/index') });
const Demo4 = loadable({ loader: () => import(/* webpackChunkName: "demo4" */ '@/pages/demo4/index') });
const Demo5 = loadable({ loader: () => import(/* webpackChunkName: "demo5" */ '@/pages/demo5/index') });
const Demo6 = loadable({ loader: () => import(/* webpackChunkName: "demo6" */ '@/pages/demo6/index') });

// 首页
export const DemoRoute = [
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
    },
    {
        path: "/demo2",
        component: Demo2,
        // 自定义字段，额外的组件信息
        meta: {
            title: "列表",
        }
    },
    {
        path: "/demo3",
        component: Demo3,
        // 自定义字段，额外的组件信息
        meta: {
            title: "拖拽布局",
        }
    },
    {
        path: "/demo4",
        component: Demo4,
        // 自定义字段，额外的组件信息
        meta: {
            title: "拖拽排序",
        }
    },
    {
        path: "/demo5",
        component: Demo5,
        // 自定义字段，额外的组件信息
        meta: {
            title: "表单",
        }
    },
    {
        path: "/demo6",
        component: Demo6,
        // 自定义字段，额外的组件信息
        meta: {
            title: "拖拽",
        }
    }
];
