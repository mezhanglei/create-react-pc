import { IMEvent } from "./websocket";


// 发送消息
export interface SendMsg {
    type: `${IMEvent}`;
    payload: unknown;
}
// 接收消息
export interface ReceiveMsg {
    type: `${IMEvent}`;
    payload: unknown;
}
// 信息包封装
class DataPacket {
    constructor(message: SendMsg | string) {
        //json类型的数据 是从后端接收消息时的格式
        if (typeof (message) === "string") {
            try {
                this.data = JSON.parse(message);
            } catch (error) {
                this.data = undefined;
            }
            //对象类型的数据 是发送信息到后端时的格式
        } else if (typeof (message) === "object") {
            this.data = message;
        }
    };

    // 对象类型的数据
    get data() {
        return this.data
    };

    // json字符串类型的数据
    get jsonData() {
        return JSON.stringify(this.data);
    };

    //获取后台发回的data数据中的消息内容
    get content() {
        return this.data["content"]
    };

    //获取事件类型
    get type() {
        return this.data["type"];
    };

    //后台返回的消息类型用来设置绑定事件的类型
    set type(type) {
        this.data["type"] = type;
    };
}

export default DataPacket