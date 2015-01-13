var models = require('../models');
var App = models.App;
var User = models.User;

var check = require('validator').check;
var	sanitize = require('validator').sanitize;

var i18n = require('i18n');
var lang = i18n.__;

var Jscex = require("jscex");

/**
 * 添加应用.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.add = function(req, res, next) {
	var title = sanitize(req.body.title || '').trim();
	var url = sanitize(req.body.url || '').trim();
	var result = { type: 'app.add', success: false };

	try {
		check(title, lang('error.title.required')).notNull();
		check(title, lang('error.title.len')).len(2, 20);
		check(url, lang('error.url.required')).notNull();
		check(url, lang('error.url.invalid')).isUrl();
	} catch (e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	title = sanitize(title).xss();
	url = sanitize(url).xss();

	var addAppAsync = eval(Jscex.compile("async", function (uid, title, url) {
		try {
			var app = $await(App.findOneAsync({ title: title }));

			// 检查应用是否被占用
			if (app) {
				result.error = lang('error.app.exist');
			} else {
				var newApp = new App();
				newApp.title = title;
				newApp.url = url;
				newApp.author = uid;
				newApp = $await(newApp.saveAsync());
				
				var user = $await(User.findByIdAsync(uid));
				user.apps.push(newApp);
				$await(user.saveAsync());

				result.success = true;
				result.app = newApp.format();
			}
		} catch (e) {
			result.error = e.message;
		}

		// 返回结果
		res.json(result);
	}));

	addAppAsync(req.session.uid, title, url).start();
};

/**
 * 删除应用.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.remove = function(req, res, next) {
	var appid = sanitize(req.body.appid || '').trim();
	var result = { type: 'app.remove', success: false };

	try {
		check(appid, lang('error.appid.required')).notNull();
	} catch (e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	var removeAppAsync = eval(Jscex.compile("async", function(uid, appid) {
		try {
			var app = $await(App.findOneAsync({ _id: appid, available: true }));
			if (!app) {
				result.error = lang('error.app.notexist');
			} else {
				// 从当前用户中删除
				var user = $await(User.findByIdAsync(uid));
				user.apps.remove(appid);
				user.save();

				// 如果没有发布且为当前用户创建的，则设置该应用为不可用
				if (!app.has_public && app.author.toString() == user._id.toString()) {
					app.available = false;
					app.save();
				}

				result.success = true;
				result.appid = appid;
			}
		} catch (e) {
			result.error = e.message;
		}
		res.json(result);
	}));

	removeAppAsync(req.session.uid, appid).start();

	/*
	AppCollect.remove({_id: appid}, function(err, appCollect) {
		if (!err && appCollect) {
			result.success = true;
			result.appid = appid;
		}
		res.json(result);
	});*/
};

/**
 * 修改应用.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.modify = function(req, res, next) {
	var appid = sanitize(req.body.appid || '').trim();
	var title = sanitize(req.body.title || '').trim();
	var url = sanitize(req.body.url || '').trim();
	var desc = sanitize(req.body.desc || '').trim();
	var result = { type: 'app.modify', success: false };

	try {
		check(appid, lang('error.appid.required')).notNull();
		check(title, lang('error.title.required')).notNull();
		check(title, lang('error.title.len')).len(2, 20);
		check(url, lang('error.url.required')).notNull();
		check(url, lang('error.url.invalid')).isUrl();
		//check(desc, lang('error.desc.required')).notNull();
	} catch (e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	appid = sanitize(appid).xss();
	title = sanitize(title).xss();
	url = sanitize(url).xss();
	desc = sanitize(desc).xss();

	var modifyAppAsync = eval(Jscex.compile("async", function (appid, title, url, desc) {
		try {
			var app = $await(App.findOneAsync({ _id: appid, available: true }));
			if (!app) {
				result.error = lang('error.app.notexist');
			} else if (app.has_public) {
				result.error = lang('error.app.haspublic');
			} else {
				app.title = title;
				app.url = url;
				app.desc = desc;
				$await(app.saveAsync());
				
				result.success = true;
				result.app = app.format();
			}
		} catch (e) {
			result.error = e.message;
		}
		res.json(result);
	}));

	modifyAppAsync(appid, title, url, desc).start();
};

/**
 * 搜索应用.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.search = function(req, res, next) {
	var key = sanitize(req.body.key || '').trim();
	var result = { type: 'app.search', success: false };

	try {
		check(key, lang('error.key.required')).notNull();
	} catch (e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	key = sanitize(key).xss();
	var keyRegExp = new RegExp(key);

	var searchAppAsync = eval(Jscex.compile("async", function(titleKey) {
		try {
			var apps = $await(App.findAsync({ title: titleKey, available: true, has_public: true }));

			result.success = true;
			result.apps = [];
			apps.forEach(function(app) {
				result.apps.push(app.format());
			});
		} catch (e) {
			result.error = e.message;
		}
		res.json(result);
	}));
	searchAppAsync(keyRegExp).start();
};

/**
 * 应用分享.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.share = function(req, res, next) {
	var appid = sanitize(req.body.appid || '').trim();
	var result = { type: 'app.share', success: false };

	try {
		check(appid, lang('error.appid.required')).notNull();
	} catch (e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	appid = sanitize(appid).xss();

	var shareAppAsync = eval(Jscex.compile("async", function (appid) {
		try {
			var app = $await(App.findOneAsync({ _id: appid, available: true }));
			if (!app) {
				result.error = lang('error.app.notexist');
			} else {
				app.has_public = true;
				$await(app.saveAsync());
				
				result.success = true;
				result.appid = appid;
			}
		} catch (e) {
			result.error = e.message;
		}
		res.json(result);
	}));

	shareAppAsync(appid).start();
};

/**
 * 我的应用.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.myApps = function(req, res, next) {
	var result = { type: 'app.my', success: false };

	var getMyAppsAsync = eval(Jscex.compile("async", function(uid) {
		try {
			var user = $await(User.findByIdAsync(uid, [], { populate: ['apps'] }));
			result.success = true;
			result.apps = [];
			user.apps.forEach(function(app) {
				result.apps.push(app.format());
			});
		} catch (e) {
			result.error = e.message;
		}
		res.json(result);
	}));
	getMyAppsAsync(req.session.uid).start();
};

/**
 * 应用市场.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.store = function(req, res, next) {
	var getStoreAppsAsync = eval(Jscex.compile("async", function(uid) {
		try {
			var apps = $await(App.findAsync({ available: true, has_public: true }, [], { populate: ['author'] }));
			var user = $await(User.findByIdAsync(uid));
			var userApps = user.apps.join('|');
			res.render('appstore', {apps: apps, userApps: userApps});
		} catch (e) {
			res.send(e.message);
		}
	}));
	getStoreAppsAsync(req.session.uid).start();
 };

 /**
 * 安装应用.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.setup = function(req, res, next) {
	var appid = sanitize(req.body.appid || '').trim();
	var result = { type: 'app.setup', success: false };

	try {
		check(appid, lang('error.appid.required')).notNull();
	} catch (e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	appid = sanitize(appid).xss();

	var setupAppAsync = eval(Jscex.compile("async", function (uid, appid) {
		try {
			var user = $await(User.findByIdAsync(uid));

			if (user.apps.join('|').indexOf(appid.toString()) >= 0) {
				result.error = lang('error.app.setuped');
			} else {
				var app = $await(App.findByIdAsync(appid));
				user.apps.push(app);
				$await(user.saveAsync());

				result.success = true;
				result.app = app.format();
			}
		} catch (e) {
			result.error = e.message;
		}
		res.json(result);
	}));

	setupAppAsync(req.session.uid, appid).start();
};