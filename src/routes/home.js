import loadable from "@/components/lazy";

export const Home = loadable({ loader: () => import(/* webpackChunkName: "home" */ '@/pages/home/index.js') });

// 首页
export const HomeRoutes = [
    {
        path: "/home",
        component: Home,
        // 自定义字段，额外的组件信息
        meta: {
            title: "首页",
        }
    }
];
