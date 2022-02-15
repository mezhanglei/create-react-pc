import loadable from "@/components/lazy";

// 首页
export const DemoRoute = [
  {
    path: "/",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo1" */ '@/pages/demo1/index') }),
    exact: true
  },
  {
    path: "/demo1",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo1" */ '@/pages/demo1/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "demo1",
    }
  },
  {
    path: "/demo2",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo2" */ '@/pages/demo2/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "列表",
    }
  },
  {
    path: "/demo3",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo3" */ '@/pages/demo3/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽布局",
    }
  },
  {
    path: "/demo4",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo4" */ '@/pages/demo4/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽排序",
    }
  },
  {
    path: "/demo5",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo5" */ '@/pages/demo5/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "表单",
    }
  },
  {
    path: "/demo6",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo6" */ '@/pages/demo6/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽",
    }
  },
  {
    path: "/demo7",
    component: loadable({ loader: () => import(/* webpackChunkName: "demo6" */ '@/pages/demo7/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽",
    }
  }
];
