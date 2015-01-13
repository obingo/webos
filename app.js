
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var i18n = require('i18n');
var config = require('./config').config;
//var expressValidator = require('express-validator');
var app = express.createServer();

// 配置i18n
i18n.configure({
    locales: config.langs,
    defaultLocale: config.langs[0],
    directory: config.langPath
});

// 配置服务器
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.set('view options', {layout: false});
    app.register('.html', require('ejs'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        key: 'sid',
        secret: config.sessionSecret,
        cookie: { maxAge: null }
    }));
    
    // 中间件:检查登陆状态
    //app.use(require('./controllers/sign').checkLogin);

    // 中间件:CSS框架stylus
    app.use(require("stylus").middleware({
        src: __dirname + "/public",
        compress: true
    }));

    // 中间件:检查并设置语言
    app.use(function (req, res, next) {
        var lang = req.session.lang;
        if (lang) {
            i18n.setLocale(req, lang);
            next();
        } else {
            i18n.init(req, res, next);
        }
    });

    //app.use(expressValidator);
});

// 配置helper
app.helpers({
    config: config,
    lang: i18n.__
});

// 配置开发环境
app.configure('development', function() {
    app.use(express.static(__dirname + '/public'));
    app.use(express.logger('dev'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// 配置正式环境
app.configure('production', function() {
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
});


// 路由用户请求
routes(app);

// 监听并启动服务器
app.listen(config.port);

// 打印启动消息
console.log('BingOS 正运行于 %s 模式下,监听的端口为 %d.', app.settings.env, app.address().port);
console.log('您可以通过地址 http://localhost:%d 进行访问.', app.address().port);
