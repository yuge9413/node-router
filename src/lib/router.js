/**
 * 路由处理模块
 * 
 * @description
 * 普通路由直接通过(type + ._!_. + path)为name直接注册事件
 * 没有type的路由直接注册path为name直接注册事件
 * 
 * 路由上带参数的如：
 * /index/:id or /index/:id/page or /index/:id/page/:name
 * 在通过(type + ._!_. + path)为name直接注册事件的同时在paramUrl属性里进行记录
 * 在路由被访问时对比当前的path是否能匹配paramUrl里登记的规则
 * 
 * @author yuge9413.com
 */
const url = require('url');
const querystring = require('querystring');
import EventManage from './eventManage';

const eventManage = new EventManage;

/**
 * @class Router
 * 路由类
 * 注册，分发 路由
 */
class RouterManage {
    /**
     * 定义属性默认
     */
    constructor() {
        // request对象
        this.req = null;
        // response对象
        this.res = null;
        // 请求方式 默认GET
        this.method = 'GET';
        // 请求的参数
        this.param = {};
        // 请求的路径
        this.path = '';
        // 记录路由中带参数的容器
        this.paramUrl = [];
        
        /**
         * 初始化路由 用于服务监听作为回调函数调用
         * @param {Object} req request对象
         * @param {Object} res response对象
         * @example 
         * const http = require('http');
         * const routes = require('./routes');
         * http.createServer(routes.init).listen(3000);
         */
        this.init = (req, res) => {
            this.req = req;
            this.res = res;
            this.method = req.method.toUpperCase();

            this._parseParam();
        };
    }

    /**
     * 处理请求参数，发布事件
     * 分别处理GET请求，POST请求
     * 将处理后的参数保存为参数对象
     * 发布对应的事件
     * @private
     */
    _parseParam() {
        const urlObject = url.parse(this.req.url, true);
        this.path = urlObject.pathname;

        // 处理请求链接上的参数
        this.param = urlObject.query || {};

        // 处理url结尾的/
        if (this.path !== '/') {
            this.path = this.path.replace(/\/$/, '');
        }
        
        // 处理GET请求参数
        // 发布事件
        if (this.method === 'POST') {
            let data = '';

            this.req.on('data', (chunk) => {
                data += chunk;
            });

            this.req.on('end', () => {
                const param = data ? querystring.parse(data) : {};
                Object.keys(param).map((key) => {
                    this.param[key] = param[key];
                });
                this._triggerRoute();
            });

            return;
        }

        // 触发GET,PUT, DELETE等其他类型请求
        this._triggerRoute();
    }

    /**
     * 路由分发
     * @private
     */
    _triggerRoute() {
        const events = [`${this.method}._!_.${this.path}`, this.path];

        // 处理路由中带参数如：/:id
        // 筛选带参数路由登记容器中规则符合当前请求path的
        const paramUrl = this.paramUrl.filter((event) => {
            // 先处理请求的类型：get\post\put...
            let method = '';
            if (event.indexOf('._!_.') !== -1) {
                method = event.split('._!_.')[0];

                if (this.method !== method) {
                    return false;
                }
            }

            // 将path以/进行切分
            // 循环对比每个切分后的元素是否匹配
            // 将匹配上的路由中的参数放入this.param中
            const url = event.replace(/.+\._!_\./, '').replace(/^\//, '');
            const pathArr = url.split('/');
            const curPath = this.path.replace(/^\//, '').split('/');
            let isCur = true;
            let param = {};

            // 循环对比每个切分后的元素是否匹配
            pathArr.map((item, index) => {
                if (/^:[^/]+$/.test(item)) {
                    return param[item.replace(':', '')] = curPath[index];
                }

                if (item !== curPath[index]) {
                    return isCur = false;
                }
            });
            
            // 将匹配上的路由中的参数放入this.param中
            if (isCur) {
                Object.keys(param).map((key) => {
                    this.param[key] = param[key];
                });
            }

            return isCur;
        });

        paramUrl.map((event) => eventManage.trigger(event, this.req, this.res, this.param));

        events.map((event) => eventManage.trigger(event, this.req, this.res, this.param));
    }

    /**
     * 路由注册
     * @param {string} path 
     * @param {Function} callBack 
     * @param {string} method
     * 
     * 册路由不设定请求方法
     * 默认注册全类型路由
     */
    add(path, callBack, method = '',) {
        path = /^\/.*$/.test(path) ? path : `/${path}`;
        const name = method ? `${method.toUpperCase()}._!_.${path}` : path;

        // 处理/:id方式传递参数
        if (/\/:[^/]+/.test(path)) {
            this.paramUrl.push(name);
        }

        eventManage.on(name, callBack);
    }

    /**
     * 使用路由对象注册路由
     * @param {Object} routes 路由对象
     * @param {string} method 请求类型
     * @example
     * const Router = require('node-router');
     * const router = new Router;
     * router.routes({
     *     '/index/getdata': {
     *         method: 'GET',
     *         callback: (req, res, param) => {
     *             res.end('xxx')
     *         }
     *     }
     * })
     * 
     * or 
     * 
     * router.routes({
     *     '/index/getdata': (req, res, param) => {
     *         res.end('xxx')
     *     }
     * }, 'GET')
     */
    routes(routes = {}, method = null) {
        if (typeof routes !== 'object') {
            return new Error('type is error: param is not a object');
        }

        Object.keys(routes).map((item) => {
            const type = (method || routes[item].method || '').toUpperCase();
            let path = item || '/';
            let fn = routes[item].callback;

            // 处理url结尾的/
            if (path !== '/') {
                path = path.replace(/\/$/, '');
            }

            if (method) {
                fn = routes[item];
            }
            
            if (typeof fn !== 'function') {
                return console.warn(`path: ${path}'s callback is not a function`);
            }

            // 处理404，/404
            if (path === '404' || path === '/404') {
                this.notFound(fn);
            }

            // 处理全局路由 *， /*
            if (path === '*' || path === '/*') {
                this.all(fn);
            }

            this.add(path, fn, type);
        });
    }

    /**
     * 使用路由对象注册GET路由
     * @param {Object} routes 路由对象
     * @example
     * const Router = require('node-router');
     * const router = new Router;
     * router.get({
     *     '/index/getdata': (req, res, param) => {
     *         res.end('xxx')
     *     }
     * })
     */
    get(routes = {}) {
        this.routes(routes, 'GET');
    }

    /**
     * 使用路由对象注册POST路由
     * @param {Object} routes 路由对象
     * @example
     * const Router = require('node-router');
     * const router = new Router;
     * router.post({
     *     '/index/getdata': (req, res, param) => {
     *         res.end('xxx')
     *     }
     * })
     */
    post(routes = {}) {
        this.routes(routes, 'POST');
    }

    /**
     * 注册404
     * @param {Function} fn 回调函数
     */
    notFound(fn = () => {}) {
        eventManage.on('router-not-event', fn);
    }

    /**
     * 注册全局路由
     * @param {Function} fn 回调函数
     */
    all(fn = () => { }) {
        eventManage.on('router-all-event', fn);
    }
}

/**
 * 对外暴露api
 * 保留私用方法
 */
const Router = (() => {
    const router = new RouterManage;

    return {
        init: (...args) => router.init(...args),
        add: (...args) => router.add(...args),
        all: (...args) => router.all(...args),
        get: (...args) => router.get(...args),
        post: (...args) => router.post(...args),
        routes: (...args) => router.routes(...args),
        notFound: (...args) => router.routes(...args)
    };
})();

export default Router;