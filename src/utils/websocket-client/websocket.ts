import DataPacket, { SendMsg } from "./DataPacket";

// 事件类型
export enum IMEvent {
    USER_REG = "user_reg", // 用户注册事件
    CONNECTED = "connected", // 链接时触发的事件名
    DISCONNECTED = "disconnected", // 断开事件名
    HEARTBEAT = "heartbeat", // 心跳检测事件
}

export interface WebSocketProxyProps {
    url: string; // 接口地址
    autoConnect?: boolean; // 是否自动连接
}

export const defaultConfig = {

}

//WebSocket 协议本质上是一个基于 TCP 的协议。为了建立一个 WebSocket 连接，客户端浏览器首先要向服务器发起一个 HTTP请求
//这个请求和通常的 HTTP 请求不同，包含了一些附加头信息，其中附加头信息"Upgrade: WebSocket"表明这是一个申请协议升级的 HTTP请求
//Websocket 使用和 HTTP 相同的 TCP 端口，可以绕过大多数防火墙的限制。默认情况下，Websocket 协议使用 80 端口；如果运行在 TLS 之上时，默认使用 443 端口。
class WebSocketProxy {
    url: string;
    autoConnect?: boolean;
    constructor(config: WebSocketProxyProps) {
        this.url = config?.url;
        this.autoConnect = config?.autoConnect;
        // 绑定服务器链接事件
        this.addEventListener(IMEvent.CONNECTED, () => {
            this.isOpened = true;
        });
        //绑定服务器断开链接事件
        this.addEventListener(IMEvent.DISCONNECTED, () => {
            this.isOpened = false;
        });
    }

    handlers = {} // 存储事件的对象
    DataPacketQueue: Set<DataPacket> = new Set() // 发送的消息队列
    isOpened = false // 服务器是断开还是链接
    socket?: WebSocket = undefined // webscoket实例
    timer?: number = undefined;

    // 监听事件
    addEventListener(type: `${IMEvent}`, handler: Function) {
        //如果某类事件处理函数数组不存在则声明个空数组
        if (!this.handlers[type]) {
            this.handlers[type] = [];
        }
        //将事件处理函数添加进数组
        this.handlers[type].push(handler);
    };

    // 移除事件
    removeEventListener(type: `${IMEvent}`, handler: Function) {
        if (this.handlers[type] && this.handlers[type].length > 0) {
            //某个类型事件的函数数组
            let handlers = this.handlers[type];
            //遍历该类型事件处理函数数组,如果为该事件处理函数名则在数组中删除
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handler === handlers[i]) {
                    handlers.splice(i, 1);
                }
            }
        }
    };

    // 清空消息队列
    clearMsgQueue() {
        if (this.DataPacketQueue.size > 0) {
            //将消息队列的里的消息发送给后端
            this.DataPacketQueue.forEach(dataPacket => {
                this.sendDataPacket(dataPacket);
            });
            //清空消息队列
            this.DataPacketQueue.clear();
        }
    };

    // 向服务器发送数据包
    sendDataPacket(dataPacket: DataPacket) {
        // 如果服务器链接状态则可以发送,如果服务器是断开状态,则将发送数据添加到消息队列
        if (this.isOpened) {
            //执行发送消息事件
            this.socket?.send(dataPacket.jsonData);
        } else {
            this.DataPacketQueue.add(dataPacket);
        }
    };

    // 触发对应的监听事件
    emitEvent(type: `${IMEvent}`, ...args: unknown[]) {
        if (this.handlers[type] && this.handlers[type].length > 0) {
            // 某个类型的函数数组
            let fnList = this.handlers[type];
            //遍历事件处理函数数组
            for (var i = 0; i < fnList?.length; i++) {
                // 调用事件队列中的函数
                fnList[i].call(this, ...args);
            }
        }
    };

    // 发送心跳包
    sendHeartBeat() {
        const heartbeatMessage = JSON.stringify({
            type: IMEvent.HEARTBEAT,
            payload: {
                time: (new Date()).getTime()
            }
        })
        this.socket?.send(heartbeatMessage)
    }

    // 创建websocket实例
    createWebSocket() {
        this.socket = new WebSocket(this.url);
        // 接收消息
        this.socket.onmessage = (evt) => {
            // message就是服务器返回的消息 
            let message = evt.data;
            // 根据消息类型触发对应的监听事件
            if (message) {
                let dataPacket = new DataPacket(message);
                if (dataPacket.data) {
                    this.emitEvent(dataPacket.type, dataPacket);
                }
            }
        };



        //打开通讯
        this.socket.onopen = () => {
            // 连接上后开始发送心跳
            window.clearInterval(this.timer)
            this.timer = window.setInterval(this.sendHeartBeat, 10000);
            //触发链接事件 isOpened变为true
            this.emitEvent(IMEvent.CONNECTED);
        };

        //关闭通讯
        this.socket.onclose = () => {
            // 清除websocket实例
            this.socket = undefined;
            // 触发断开事件 isOpened变为false
            this.emitEvent(IMEvent.DISCONNECTED);
            //如果设置了自动连接则开始自动链接
            if (this.autoReconnect) {
                setTimeout(() => {
                    this.connect();
                    this.autoReconnect = false;
                }, 5000);
            }
        };

        //通讯出错
        this.socket.onerror = () => {
            //清除websocket实例
            this.socket = undefined;
            //如果设置了自动连接则开始自动链接
            if (this.autoReconnect) {
                setTimeout(() => {
                    this.connect();
                    this.autoReconnect = false;
                }, 5000);
            }
        };
    };
}