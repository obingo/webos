var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: { type: String, required: true, index: true },				// 用户名
	nickname: { type: String, required: true },							// 昵称
	password: { type: String, required: true },							// 密码
	email: { type: String },							// 邮箱
	url: { type: String },								// 个人主页
	signature: { type: String },						// 个人签名
	weibo: { type: String },							// 个人微博
	avatar: { type: String, required: true },							// 用户头像
	score: { type: Number, default: 0 },				// 积分
	create_at: { type: Date, default: Date.now },		// 注册时间
	login_at: { type: Date, default: Date.now },		// 上次登陆时间
	available: { type: Boolean, default: true },		// 是否可用
	settings: {											// 个人设置
		themeid: {type: String, default: "default"},	// 个人设置:主题名
		tips: {											// 个人设置:用户提示设置
			guide: { type: Boolean, default: true },	// 个人设置:用户提示设置:用户指引
			tools: { type: Boolean, default: true }		// 个人设置:用户提示设置:工具指引
		}
	},
	apps: [{ type: Schema.ObjectId, ref: 'App' }]
});

UserSchema.methods.login = function login() {
	this.login_at = new Date();
	this.save();
};

UserSchema.methods.format = function format() {
	var userObject = {};
	
	userObject.id = this._id.toString();
	userObject.name = this.name.toString();
	userObject.nickname = this.nickname.toString();
	userObject.avatar = this.avatar.toString();
	userObject.appnum = this.apps.length;

	userObject.email = this.email || '';
	userObject.url = this.url || '';
	userObject.signature = this.signature || '';
	userObject.weibo = this.weibo || '';
	userObject.create_at = this.create_at;
	userObject.login_at = this.login_at;

	return userObject;
};

mongoose.model('User', UserSchema);
