var models = require('../models');
var User = models.User;

var check = require('validator').check;
var	sanitize = require('validator').sanitize;

var crypto = require('crypto');
var config = require('../config').config;
var i18n = require('i18n');
var lang = i18n.__;

/**
 * 用户注册.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.signup = function(req, res, next) {
	var username = sanitize(req.body.username || '').trim();
	var password = sanitize(req.body.password || '').trim();
	var repassword = sanitize(req.body.repassword || '').trim();
	var result = { type: 'user.signup', success: false };

	/*// 检查用户名是否为空
	if (!username) {
		result.error = lang('error.username.required');
		res.send(result);
		return;
	}

	// 检查用户名长度是否不小于4
	if (username.length < 4) {
		result.error = lang('error.username.min');
		res.send(result);
		return;
	}

	// 检查用户名长度是否不小于4
	if (username.length > 12) {
		result.error = lang('error.username.max');
		res.send(result);
		return;
	}*/

	// 检查用户名是否有合法
	try {
		check(username, lang('error.username.required')).notNull();
		check(username, lang('error.username.len')).len(4, 12);
		check(username, lang('error.username.invalid')).isAlphanumeric();

		check(password, lang('error.password.required')).notNull();
		check(password, lang('error.password.len')).len(6, 20);

		check(repassword, lang('error.repassword.required')).notNull();
		check(repassword, lang('error.password.notmatch')).equals(password);
	} catch(e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	/*// 检查密码是否为空
	if (!password) {
		result.error = lang('error.password.required');
		res.send(result);
		return;
	}

	// 检查确认密码是否为空
	if (!repassword) {
		result.error = lang('error.repassword.required');
		res.send(result);
		return;
	}

	// 检查两次密码是否一致
	if (password != repassword) {
		result.error = lang('error.password.notmatch');
		res.send(result);
		return;
	}*/

	username = sanitize(username).xss();
	password = sanitize(password).xss();
	repassword = sanitize(repassword).xss();

	User.findOne({ 'name': username }, function(err, user) {
		if (err) return next(err);

		// 检查用户名是否被占用
		if (user) {
			result.error = lang('error.username.exist');
			res.json(result);
			return;
		}
			
		// md5加密用户名
		password = md5(password);

		// 生成头像地址
		var avatar = 'http://www.gravatar.com/avatar/' + md5(username) + '?size=48';

		// 构建用户实例
		var newUser = new User();
		newUser.name = username;
		newUser.nickname = username;
		newUser.password = password;
		newUser.avatar = avatar;

		// 保存用户实例到数据库
		newUser.save(function(err, user) {
			if (err) return next(err);

			result.success = true;

			// 保存当前用户到Sesion
			saveSession(user, req);

			res.json(result);
		});
	});
};

/**
 * 用户登录.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.login = function(req, res, next) {
	var username = sanitize(req.body.username).trim();
	var password = sanitize(req.body.password).trim();
	var remeber = sanitize(req.body.remeber).toBoolean();
	var result = { type: 'user.login', success: false };
	
	/*// 检查用户名是否为空
	if (!username) {
		result.error = lang('error.username.required');
		res.send(result);
		return;
	}

	// 检查用户名是否为空
	if (!password) {
		result.error = lang('error.password.required');
		res.send(result);
		return;
	}*/
	try {
		check(username, lang('error.username.required')).notNull();
		check(password, lang('error.password.required')).notNull();
	} catch(e) {
		result.error = e.message;
		res.json(result);
		return;
	}

	User.findOne({ 'name': username }, function(err, user) {
		if (err) return next(err);

		if (!user || !user.available) {
			result.error = lang('error.user.notexist');
			res.json(result);
			return;
		}

		password = md5(password);

		if (password !== user.password) {
			result.error = lang('error.password.notmatch');
			res.json(result);
			return;
		}

		if (remeber) {
			// 保存Sesion到Cookie中
			saveCookie(user, res);
		}
		
		// 更新登录时间
		user.login();

		// 保存当前用户到Sesion
		saveSession(user, req);


		result.success = true;
		res.json(result);
	});
};

/**
 * 用户注销.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.signout = function(req, res, next) {
	req.session.destroy();
	res.clearCookie(config.cookieName, { path: '/' });
	res.redirect('/sign');
};

/**
 * 中间件: 检查用户是否已经登录.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.checkLogin = function(req, res, next) {
	//console.log('CheckLogin:{uid=' +  req.session.uid + '}');
	if (req.session.uid) {
		return next();
	} else {
		res.redirect('/sign?from=' + req.url);
	}
};

/**
 * 中间件: 读取cookie中保存的用户信息.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.getUser = function(req, res, next) {
	if (req.session.uid) {
		return next();
	}

	var cookie = req.cookies[config.cookieName];
	if (!cookie) {
		return next();
	}

	var authToken = decrypt(cookie, config.sessionSecret);
	var auth = authToken.split('\t');
	var uid = auth[0];

	User.findOne({_id: uid}, function(err, user) {
		if (user) {
			// 更新登录时间
			user.login();

			// 保存当前用户到Sesion
			saveSession(user, req);

			res.redirect(req.query['from'] || '/');
		} else {
			return next(err);
		}
	});
};

// 保存session
function saveSession(user, req) {
	req.session.uid = user._id;
	req.session.username = user.name;
}

// 保存cookie
function saveCookie(user, res) {
	var authToken = encrypt(user._id + '\t' + new Date().getTime(), config.sessionSecret);
	res.cookie(config.cookieName, authToken, {path: '/', maxAge: 1000*60*60*24*7}); //cookie 有效期1周
}

// aes192加密
function encrypt(str, secret) {
   var cipher = crypto.createCipher('aes192', secret);
   var enc = cipher.update(str,'utf8','hex');
   enc += cipher.final('hex');
   return enc;
}

// aes192解密
function decrypt(str, secret) {
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}

// md5加密
function md5(str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	str = md5sum.digest('hex');
	return str;
}