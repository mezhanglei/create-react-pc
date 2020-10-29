import loadable from "@/components/lazy";

const Cart = loadable({ loader: () => import(/* webpackChunkName: "cart" */ '@/pages/cart/index.js') });

export const CartRoutes = [
    {
        path: "/cart",
        component: Cart,
        // 自定义字段，额外的组件信息
        meta: {
            title: "购物车",
        }
    }
];
