/*!
 * bingos - routes.js
 * Copyright(c) 2012 XiaoBing
 */

/**
 * Module dependencies.
 */

var app = require('./controllers/app');
//var site = require('./controllers/site');
var sign = require('./controllers/sign');
var user = require('./controllers/user');
//var upload = require('./controllers/upload');

exports = module.exports = function(server) {
  // 主页
  server.get('/', sign.checkLogin, function(req, res, next) {
    res.render('index', {username: req.session.username, uid: req.session.uid});
  });

  // 注册、登录、注销
  server.get('/sign', sign.getUser, function(req, res, next) {
    res.render('login');
  });

  server.post('/signup', sign.signup);
  server.post('/signin', sign.login);
  server.get('/signout', sign.signout);

  // 应用管理:增\删\改\查\分享
  server.post('/app/:operation', sign.checkLogin, function(req, res, next) {
    var handler = app[req.params.operation];
    if (!handler) {
      res.send('Error 404.Page Not Found!');
    } else if (typeof handler === 'function') {
      handler(req, res, next);
    }
  });

  server.get('/app/win', sign.checkLogin, function(req, res, next) {
    res.render('newapp');
  });

  server.get('/app/404', function(req, res, next) {
    res.send('该应用不存在！');
  });

  server.get('/app/store', sign.checkLogin, app.store);

  /*
  server.post('/app/add', app.add);
  server.post('/app/remove', app.remove);
  server.post('/app/modify', app.modify);
  server.post('/app/search', app.search);
  server.post('/app/share', app.share);*/

  // 用户相关
  //server.get('/user/:name', user.index);
  server.get('/user/apps', sign.checkLogin, app.myApps);
  server.get('/user/info', sign.checkLogin, user.getInfo);

  // 上传
  //server.post('/upload/image', upload.upload_image);
};