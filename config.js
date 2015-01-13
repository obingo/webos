/**
 * 系统配置文件
 */
exports.config = {
	name: 'BingOS',
	description: '一个用Node.js开发的WebOS',
	version: '0.0.1',
	author: 'XiaoBing',
	langs: ['zh', 'en'],
	langPath: './public/langs',
	host: 'http://127.0.0.1', // host 结尾不要添加'/'
	db: 'mongodb://AybWUtdyAxTX:o7ljSvUrnK@127.0.0.1:20088/27XVgARhfqNi',
	sessionSecret: 'bing_webos',
	cookieName: 'bingos',
	port: 80,
	// [ [ plugin_name, options ], ... ]
	plugins: []
};