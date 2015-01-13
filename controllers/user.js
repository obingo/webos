var models = require('../models');
var User = models.User;

/**
 * 获取用户信息.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.getInfo = function(req, res, next) {
	var result = { type: 'user.info', success: false };

	User.findById(req.session.uid, function (err, user) {
		if (err) {
			result.error = err.message;
		} else if (user) {
			result.success = true;
			result.user = user.format();
		}
		res.json(result);
	});
};
