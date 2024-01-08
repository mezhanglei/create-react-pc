import { message } from "antd";
import zhCN from 'antd/lib/locale/zh_CN';

// 消息管理
message.config({
  maxCount: 1,
});

// 日期配置
const ZhCNLocale: typeof zhCN = zhCN;
ZhCNLocale.DatePicker!.lang = {
  ...zhCN.DatePicker!.lang,
  monthFormat: 'M月',
  shortWeekDays: ['日', '一', '二', '三', '四', '五', '六']
};

export default {
  locale: ZhCNLocale,
  getPopupContainer: (node) => {
    if (node) {
      return node.parentNode;
    }
    return document.body;
  }
};
