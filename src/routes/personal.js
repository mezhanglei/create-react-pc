import loadable from "@/components/lazy";

const Personal = loadable({ loader: () => import(/* webpackChunkName: "personal" */ '@/pages/personal/index.js') });


// 个人中心模块
export const PersonalRoutes = [
    {
        path: "/personal",
        component: Personal,
        // 自定义字段，额外的组件信息
        meta: {
            title: "个人中心",
        }
    }
];
