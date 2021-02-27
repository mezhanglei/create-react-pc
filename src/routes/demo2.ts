import loadable from "@/components/lazy";

const Demo2 = loadable({ loader: () => import(/* webpackChunkName: "demo2" */ '@/pages/demo2/index') });
const Demo3 = loadable({ loader: () => import(/* webpackChunkName: "demo2" */ '@/pages/demo3/index') });

export const Demo2Route = [
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
            title: "列表",
        }
    }
];
