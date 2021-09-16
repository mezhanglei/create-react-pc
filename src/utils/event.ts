import { isEmpty } from './type';
/**
 * 全局事件拦截操作
 * 
 * 1. 先实例化一个实例 const event = new DefineEvent(props);
 * 2. 调用方法生效： event.addEvent()
 * 3. 自定义属性 event-name={eventName}的目标将会触发操作函数
 */

export interface EventConfigs {
    eventName: string; // 触发的操作名称
    eventFn: (e: any) => any; // 触发的操作函数
    eventType?: string; // 要拦截的事件类型
    step?: number; // 递归查找目标标签所递归的层数，默认3
    [propsName: string]: any;
}

export default class DefineEvent {
    eventType: string;
    eventKey: string;
    eventName: string;
    step: number;
    eventFn: (e: any) => any;
    constructor(configs: EventConfigs) {
        // 自定义属性名
        this.eventKey = 'event-name';
        // 拦截的事件类型
        this.eventType = configs?.eventType || 'click';
        // 会触发的操作名称
        this.eventName = configs?.eventName;
        // 触发的操作函数
        this.eventFn = configs?.eventFn;
        // 递归查询触发事件的的递归层数
        this.step = configs?.step || 3;
    }

    // 给body添加绑定事件，监听，如果触发了，则查询附近的父元素是否含有标记属性，如果含有，则执行发送代码
    addEvent(): void {
        if (isEmpty(this.eventName)) {
            return;
        }
        const body = document.getElementsByTagName('body')[0];
        if (body) {
            body.addEventListener(this.eventType, this.eventFunc, false);
        }
    }

    // 解绑对应事件
    removeEvent(eventType: string): void {
        const body = document.getElementsByTagName('body')[0];
        if (body) {
            body.removeEventListener(eventType, this.eventFunc, false);
        }
    }

    // 触发事件
    eventFunc = (e: any): void => {
        e = e || window.event;
        const target = e.target || e.srcElement;
        const name = this.findSource(target);
        // 执行拦截操作
        if (name == this.eventName) {
            this.eventFn && this.eventFn(e);
        }
    };

    // 根据事件触发点，查询附近的有自定义属性的标签，如果有将其存储的数据返回
    findSource(dom: any): boolean | string {
        let flag = false;
        // 标签名
        let tagName = dom.tagName.toLowerCase();
        // 触发事件的目标
        let target = dom;
        // 递归查询的层数
        let num = this.step;
        while (tagName !== 'body' && num > 0) {
            flag = target.getAttribute(this.eventKey) != null;
            if (flag) {
                // 自定义属性只能是字符串
                return target.getAttribute(this.eventKey);
            }
            target = target.parentNode;
            tagName = target.tagName.toLowerCase();
            num--;
        }
        return flag;
    }
}
