import Result from "@/components/result/result";
import { useEffect } from "react";
import { message } from "antd";
import React from "react";
import FailImage from 'src/assets/fail.png';

// 非微信提示页面
export default function NotWechat(props) {
  const title = "请在微信客户端打开链接";

  useEffect(() => {
    document.title = title;
    message.info(title);
  });
  return <Result height="100vh" imgUrl={FailImage} title={title} />;
} 
