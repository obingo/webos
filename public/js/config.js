/*
 *  系统配置模板
 *  作者: XiaoBing
 */
(function(window, $, undefined) {
	var bingos = window.bingos = window.bingos || {};

	bingos.config = {
		docHeight: 0,
		docWidth: 0,
		desktopHeight: 0,
		desktopWidth: 0,
		topbarHeight: 30,
		winHeadHeight: 30
	};

	bingos.langs = {};

	$.ajax({
		url: '/langs/zh.js',
		async: false,
		dataType: 'json',
		success: function(lang) {
			bingos.langs = lang;
		}
	});

	bingos.$L = function(key) {
		var lang = bingos.langs[key];
		return lang ? lang : key;
	};

	// 调试
	window.console = window.console || {};
	window.console.log = window.console.log || function() {};

	/*bingos.fn = (function() {
		var fns = [];

		function add(fn) {
			if (typeof fn === 'object') {
				fns.push(fn);
			}
		}

		function setup() {
			for (var i = 0, len = fns.length; i < len; i++) {
				var fn = fns[i];
				if (fn.setup && typeof fn.setup === 'function') {
					fn.setup();
				}
			}
		}

		return {
			add: add,
			setup: setup
		};
	})();*/
})(window, jQuery);
