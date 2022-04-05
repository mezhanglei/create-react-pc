import loadable from "@/components/lazy";

// 首页
export const DemoRoute = [
  {
    path: "/",
    component: loadable({ loader: () => import('@/pages/demo1/index') }),
    exact: true
  },
  {
    path: "/demo1",
    component: loadable({ loader: () => import('@/pages/demo1/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "demo1",
    }
  },
  {
    path: "/demo2",
    component: loadable({ loader: () => import('@/pages/demo2/index') }),
  },
  {
    path: "/demo3",
    component: loadable({ loader: () => import('@/pages/demo3/index') }),
    animationConfig: {
      enter: 'from-right',
      exit: 'to-right'
    }
  },
  {
    path: "/demo4",
    component: loadable({ loader: () => import('@/pages/demo4/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽排序",
    }
  },
  {
    path: "/demo5",
    component: loadable({ loader: () => import('@/pages/demo5/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "表单",
    }
  },
  {
    path: "/demo6",
    component: loadable({ loader: () => import('@/pages/demo6/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽",
    }
  },
  {
    path: "/demo7",
    component: loadable({ loader: () => import('@/pages/demo7/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽",
    }
  },
  {
    path: "/demo8",
    component: loadable({ loader: () => import('@/pages/demo8/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽",
    }
  },
  {
    path: "/demo9",
    component: loadable({ loader: () => import('@/pages/demo9/index') }),
    // 自定义字段，额外的组件信息
    meta: {
      title: "拖拽",
    }
  }
];
