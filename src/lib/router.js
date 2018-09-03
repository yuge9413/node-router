/**
 * 路由处理模块
 */
const url = require('url');
const querystring = require('querystring');
import EventManage from './eventManage';

const eventManage = new EventManage;

/**
 * @class Router
 * 路由类
 * 注册，触发 路由
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

            this.parseParam();
        };
    }

    /**
     * 处理请求参数，发布事件
     * 分别处理GET请求，POST请求
     * 将处理后的参数保存为参数对象
     * 发布对应的事件
     */
    parseParam() {
        const urlObject = url.parse(this.req.url, true);
        this.path = urlObject.pathname;

        // 处理url结尾的/
        if (this.path !== '/') {
            this.path = this.path.replace(/\/$/, '');
        }

        // 处理GET请求参数
        // 发布事件
        if (this.method === 'GET') {
            this.param = urlObject.query || {};

            return this.triggerRoute();
        }
        
        // 处理GET请求参数
        // 发布事件
        if (this.method === 'POST') {
            let data = '';

            this.req.on('data', (chunk) => {
                data += chunk;
            });

            this.req.on('end', () => {
                this.param = data ? querystring.parse(data) : {};
                this.triggerRoute();
            });

            return;
        }

        // 处理PUT, DELETE等其他类型请求
        this.triggerRoute();
    }

    /**
     * 路由分发
     */
    triggerRoute() {
        const events = [`${this.method}.${this.path}`, this.path];

        events.map(event => eventManage.trigger(event, this.req, this.res, this.param));
    }

    /**
     * 路由注册
     * @param {string} path 
     * @param {Function} callBack 
     * @param {string} method
     * 
     * 册路由不设定请求方法
     * 默认注册全局
     */
    add(path, callBack, method = '',) {
        path = /^\/.*$/.test(path) ? path : `/${path}`;
        const name = method ? `${method.toUpperCase()}.${path}` : path;
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
     * 		   method: 'GET',
     *         callback: (req, res, param) => {
     * 		   	   res.end('xxx')
     *         }
     * 	   }
     * })
     * 
     * or 
     * 
     * router.routes({
     *     '/index/getdata': (req, res, param) => {
     * 	       res.end('xxx')
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
     * 	       res.end('xxx')
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
     * 	       res.end('xxx')
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