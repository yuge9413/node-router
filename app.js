/**
 * 测试路由
 */
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
router.notFound((req, res) => {
    res.end('hello 404');
});

// 注册全局路由
router.all((req, res, param) => {
    res.end(`hello all, id=${param.id}`);
});

http.createServer(router.init).listen(3001);