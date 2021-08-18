import IMEvent from './IMEvent.js' //事件名称
import IMClient from './IMClient.js' //底层websocket封装
import DataPacket from './DataPacket.js' //数据包

/**
 * 一个返回客户端的处理函数
 * 
 * @param {*} currentUser //当前用户的id
 * @param {*} handleMsg //接收消息处理函数
 */
const handle = (currentUser, handleMsg) => {
  //实例化一个通讯客户端
  const client = new IMClient('ws://127.0.0.1:8087');

  //绑定用户注册事件 发送用户的id到后端
  client.addEventListener(IMEvent.CONNECTED, () => {
    //实例化一个类 设置事件类型和消息内容
    let dataPacket = new DataPacket({
      type: IMEvent.USER_REG,
      content: currentUser
    })
    if(!client.isOpened){
      console.log('连接中......');
    }
    //发送消息
    client.sendDataPacket(dataPacket);
  });

  // 绑定发送消息事件
  client.addEventListener(IMEvent.MSG_TEXT_SEND, data => {
    //实例化一个类 设置事件类型和消息内容
    let dataPacket = new DataPacket({
      type: IMEvent.MSG_TEXT_SEND,
      content: data
    })
    //发送消息
    client.sendDataPacket(dataPacket);
  });

  // 绑定接收消息事件
  client.addEventListener(IMEvent.MSG_TEXT_REC, data => {
    //执行触发接收消息的回调
    handleMsg(data);
  });

  //初始化通讯客户端
  client.connect();
  return client;
}
export default handle;
