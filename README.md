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

## 开发

```bash
    git clone https://github.com/yuge9413/node-router.git
    cd node-router
    yarn install    # 安装依赖
    npm run build   # 编译成es5
    node app.js     # 启动node服务
```

## 带参数路由
1. 使用传统参数传递方式传递：
```html
http://www.xxx.com/xxx?id=xxx
```
2. 使用路由传递：
```html
// 需要定义时使用:name的方式预先定义
http://www.xxx.com/xxx/:id
// or
http://www.xxx.com/xxx/:id/xxx
// 这时访问如下路由时会触发
http://www.xxx.com/xxx/123
// or
http://www.xxx.com/xxx/222/xxx
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
    '/': (req, res, param) => {v
        res.end(`hello, id=${param.id}`);
    },

    '/index': (req, res, param) => {
        res.end(`hello index, id=${param.id}`);
    },

    '/index2/:id/page/:name': (req, res, param) => {
        res.end(`hello index2, id=${param.id}`);
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

目前本项目功能已经全部完成，还剩下example、测试用例等部分还没有来的及做，等不忙了会抽时间补上！欢迎各位大佬的pr!