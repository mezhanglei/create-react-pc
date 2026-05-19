import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
// 导入 user 模块的接口和工厂函数
import createUserSlice, { UserStore } from "./modules/user";

// 1. 定义全局 BoundState（未来有新模块就在这里用 & 交叉类型继续拼接）
type BoundState = UserStore;

// 2. 创建并导出最终的 Store
export const useBoundStore = create<BoundState>()(
  devtools(
    persist(
      (...a) => ({
        // 将各个模块的切片展开合并
        ...createUserSlice(...a),
        // ...createCartSlice(...a), // 未来新增模块直接在这里追加
      }),
      {
        name: "my-app-storage", // 本地持久化的 key
        // 按需选择需要持久化的字段
        partialize: (state) => ({
          userInfo: state.userInfo,
        }),
      }
    )
  )
);
