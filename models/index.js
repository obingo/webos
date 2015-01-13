var mongoose = require('mongoose'),
	config= require('../config').config;
	
mongoose.connect(config.db, function(err){
	if (err) {
		console.log('connect to db error: ' + err.message);
		process.exit(1);
	}
});

// Jscex
var Jscex = require("jscex");
require("jscex-jit").init(Jscex);
require("jscex-async").init(Jscex);
require("jscex-async-powerpack").init(Jscex);

var Jscexify = Jscex.Async.Jscexify;

var mp = mongoose.Model.prototype;
mp.saveAsync = Jscexify.fromStandard(mp.save);
mp.removeAsync = Jscexify.fromStandard(mp.remove);

var m = mongoose.Model;
m.findByIdAsync = Jscexify.fromStandard(m.findById);
m.findOneAsync = Jscexify.fromStandard(m.findOne);
m.findAsync = Jscexify.fromStandard(m.find);
m.countAsync = Jscexify.fromStandard(m.count);

// models
require('./app');
require('./user');
//require('./app_collect')

exports.App = mongoose.model('App');
exports.User = mongoose.model('User');
//exports.AppCollect = mongoose.model('AppCollect');
