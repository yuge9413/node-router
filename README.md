# node-router
a simple node route

本项目主要用于学习实践，使用订阅/发布模式开发一套简单的node端路由插件！

## api
```js
    Router.init         // 初始化
    Router.add          // 注册单个路由
    Router.routes       // 批量注册路由
    Router.get          // 批量注册get路由
    Router.post         // 批量注册post路由
    Router.all          // 批量注册全局路由
    Router.notFound     // 批量注册404路由
```

## 命令

```bash
    yarn install    # 安装依赖
    npm run build   # 编译成es5
    node app.js     # 启动node服务
```

## 例子
```js
const http = require('http');
const router = require('./dist');

// 注册单个路由
router.add('/home', (req, res, param) => {
    res.end(`hello, id=${param.id}`);
}, 'get');

// 批量注册get路由
router.get({
    '/': (req, res, param) => {
        res.end(`hello, id=${param.id}`);
    },
    '/index': (req, res, param) => {
        res.end(`hello index, id=${param.id}`);
    }
});

// 批量注册post路由
router.post({
    '/': (req, res, param) => {
        res.end(`hello, id=${param.id}`);
    },
    '/index': (req, res, param) => {
        res.end(`hello index, id=${param.id}`);
    }
});

// 批量注册路由
router.routes({
    '/': (req, res, param) => {
        res.end(`hello, id=${param.id}`);
    },
    '/index': (req, res, param) => {
        res.end(`hello index, id=${param.id}`);
    }
}, 'put');

// 批量注册路由
router.routes({
    '/': {
        callback: (req, res, param) => {
            res.end(`hello, id=${param.id}`);
        },
        method: 'get'
    },
    '/index': {
        callback: (req, res, param) => {
            res.end(`hello index, id=${param.id}`);
        },
        method: 'post'
    },
});

// 注册404
router.notFound((req, res, param) => {
    res.end('hello 404');
});

// 注册全局路由
router.all((req, res, param) => {
    res.end(`hello all, id=${param.id}`);
});

http.createServer(router.init).listen(3001);

```
