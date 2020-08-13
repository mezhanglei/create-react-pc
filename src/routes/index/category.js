import loadable from "@/components/lazy";

const Category = loadable({ loader: () => import(/* webpackChunkName: "category" */ '@/pages/index/category/index.js') });

export const CategoryRoutes = [
    {
        path: "/category",
        component: Category,
        // 自定义字段，额外的组件信息
        meta: {
            title: "分类",
        }
    }
];
