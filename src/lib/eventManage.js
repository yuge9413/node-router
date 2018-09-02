/**
 * 事件订阅 / 发布
 * @author yuge9413.com
 */

/**
 * 事件管理
 */
class EventManage {
    constructor() {
        this.eventList = {};
    }

    /**
     * 事件订阅
     * @param {string} name 事件名称
     * @param {Function} handler 回调函数
     */
    on(name, handler) {
        if (!handler || typeof handler !== 'function') {
            return new Error('Event err: event publish callback is not a function!');
        }
        this.eventList[name] = this.eventList[name] || [];
        this.eventList[name].push(handler);
    }

    /**
     * 订阅单次事件
     * @param {string} name 事件名称
     * @param {Function} handler 回调函数
     */
    once(name, handler) {
        if (!handler || typeof handler !== 'function') {
            return new Error('Event err: event publish callback is not a function!');
        }
        const onceList = this.eventList['once'] || {};
        onceList[name] = onceList[name] || [];
        onceList[name].push(handler);
        this.eventList['once'] = onceList;
    }

    /**
     * 删除事件
     * @param {string} name 事件名称
     * @param {Function} handler 回调函数
     */
    remove(name, handler) {
        const list = this.eventList[name];
        const onceList = this.eventList['once'][name];

        // 该事件不存在时
        if (!list && !onceList) {
            return;
        }

        // 没有回调函数，删除所有名称为{name}的事件
        if (!handler) {
            delete this.eventList[name];
            delete this.eventList['once'][name];
            return;
        }

        const handlerStr = handler.toString();

        // 删除列表中的回调函数
        if (list && list.length > 0) {
            this.eventList[name] = list.filter(item => item.toString() !== handlerStr);
        }

        // 删除单次列表中的回调函数
        if (onceList && onceList.length > 0) {
            this.eventList['once'][name] = onceList.filter(item => item.toString() !== handlerStr);
        }
    }

    /**
     * 删除所有事件
     */
    removeAll() {
        this.eventList = {};
    }

    /**
     * 事件发布
     * @param {string} name 事件名称
     * @param  {...any} args 回调函数参数
     */
    trigger(name, ...args) {
        const list = this.eventList[name];
        const onceList = this.eventList['once'][name];

        // 依次调用回调
        if (list && list.length > 0) {
            list.map(item => item(...args));
        }

        // 依次调用只执行一次的回调
        // 执行一次后 删除事件
        if (onceList && onceList.length > 0) {
            onceList.map(item => item(...args));
            delete this.eventList['once'][name];
        }
    }
}

export default EventManage;