import {
  DemoModal
} from "./demo";
import { create } from "./createPromise";

// 展示弹窗
export const showDemoSwitch = () => {
  const Props = {
    open: true
  }
  return create(DemoModal, { ...Props })
};
