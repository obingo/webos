/*
 *  应用模块
 *  作者: XiaoBing
 */
bingos.win = (function(bingos, $) {
	var winTemplate = '<div class="window">\
							<header class="winHead">\
								<div class="winTitle"></div>\
								<ul class="winCtrls">\
									<li><a class="winMin" href="javascript:;" title="最小化"></a></li>\
									<li><a class="winMax" href="javascript:;" title="最大化"></a></li>\
									<li><a class="winClose" href="javascript:;" title="关闭"></a></li>\
								</ul>\
							</header>\
							<div class="winBody">\
								<div class="appLoadOuter">\
									<div class="appLoadInner">\
										<div class="appLoadAnimation"></div>\
										<span class="appLoadTips">正在努力加载应用,请稍等...</span>\
									</div>\
								</div>\
								<div class="iframeMask"></div>\
								<iframe src="" frameborder="0" class="appIframe"></iframe>\
							</div>\
						</div>';

	var $win = $(winTemplate);
	var $winContainer = $('#desktop');
	//var winQueue = [];
	var config = bingos.config;
	//var topbar = bingos.topbar;
	var defaultOpt = {
		height: 400,
		width: 400,
		maximize: true,
		title: '不存在的应用',
		url: '/app/404',
		id: 'app_404'
	};
	var movingWin = null;
	var winXOffset = 0;
	var winYOffset = 0;

	var win = function(opt) {
		return new win.fn.init(opt);
	};

	/*function rm4WinQueue(win) {
		var idx = $.inArray(win, winQueue);
		if (idx != -1) {
			winQueue.splice(idx, 1);
		}
	}*/

	function onIframeLoad(e) {
		$(e.target).siblings('.appLoadOuter').hide();
	}

	function resizeWindow(win, opt) {
		opt = $.extend({}, {width: config.docWidth, height: config.docHeight}, opt);
		win.css(opt).find('.winBody').height(opt.height - config.winHeadHeight);
	}

	win.fn = win.prototype = {
		constructor: win,
		init: function(opt) {
			var self = this;

			opt = $.extend({}, defaultOpt, opt);

			this.win = $win.clone();

			this.win.attr('id', opt.id);

			this.win.find('.winTitle')
					.text(opt.title)
					.end()
					.find('.appIframe')
					.load(onIframeLoad)
					.attr('src', opt.url).end()
					.find('.winMin')
					.click(function() {
						self.minimize();
					}).end()
					.find('.winMax')
					.click(function() {
						self.maximize();
					}).end()
					.find('.winClose')
					.click(function() {
						self.close();
					});

			this.win.css({
				height: opt.height,
				width: opt.width
			}).find('.winBody').height(opt.height - config.winHeadHeight);

			$winContainer.append(this.win);

			this.center();
			this.show();
			//topbar.addWindow(this);

			return this;
		},
		show: function() {
			this.win.trigger('window.show').show();

			//rm4WinQueue(this._win);

			//winQueue.push(this._win);
		},
		close: function() {
			this.win.hide().remove();

			//rm4WinQueue(this._win);
		},
		center: function() {
			var winHeight = this.win.height();
			var winWidth = this.win.width();

			var left = (config.desktopWidth - winWidth) / 2;
			var top = Math.max(20, (config.desktopHeight - winHeight) / 2);
			
			this.win.css('left', left);
			this.win.css('top', top);
		},
		resize: function(opt) {
			resizeWindow(this.win, opt);
		},
		maximize: function() {
			this.offset = this.win.offset();
			this.resize();
			this.win.offset({left: 0, top: 0}).addClass('maximized');
		},
		minimize: function() {
			this.win.hide().addClass('minimized');
		},
		restore: function() {
			this.show();
			this.win.offset(this.offset).removeClass('minimized').removeClass('maximized');
		}
	};

	win.fn.init.prototype = win.fn;

	win.setup = function() {
		console.log('on window setup');
		$(document).mousemove(function(e) {
      		/*if(e.pageX < 15 && !systemMenu.isMenuOut()){
					systemMenu.triggerMenuOut();
      		}else if(e.pageX > 70 && systemMenu.getTimer() == null && systemMenu.isMenuOut()  && systemSettings.fullscreenCount()){
      				systemMenu.triggerMenuIn();
      		}*/
      		if(movingWin != null){
      			movingWin.css('left', e.pageX - winXOffset);
      			movingWin.css('top',Math.max(0, e.pageY - winYOffset));
      		}
     	}); 
     
		$('#desktop').delegate('.winHead', 'mousedown', function(e) {
			movingWin = $(this).parent();

			$('.iframeMask').show();

			winXOffset = e.pageX - movingWin.position().left;
			winYOffset = e.pageY - movingWin.position().top;
		});

		$(document).mouseup(function() {
			if (movingWin != null) {
				movingWin.find('.iframeMask').hide();
				movingWin = null;
			}
		});

		$('#desktop').delegate('.iframeMask', 'click', function(e) {
			console.log(this);
			var $iframeMask = $(this);

			$iframeMask.hide();
		});

		$(window).resize(function(e) {
			$('#desktop .maximized').each(function() {
				resizeWindow($(this));
			})
		});
	};

	return win;

})(bingos, jQuery);

/*
;(function(window, undefined) {
	var bingos = window.bingos;
	var winTemplate = '<div class="window">\
							<header class="winHead">\
								<div class="winTitle"></div>\
								<div class="winCtrls">\
									<div class="winMin"></div>\
									<div class="winMax"></div>\
									<div class="winClose"></div>\
								</div>\
							</header>\
							<div class="winBody">\
								<div class="appLoad"></div>\
								<div class="iframeMask"></div>\
								<iframe src="" frameborder="0" class="appIframe"></iframe>\
							</div>\
						</div>';
	var $win = $(winTemplate);
	var $winContainer = $('#desktop');

	var win = function(info) {
		return new win.fn.init(info);
	}

	win.fn = Window.prototype = {
		constructor: win,
		init: function(info) {
			this.appInfo = info;
			$win.attr('id', this.appInfo._id);

			this.center();
			this.open();

			return this;
		},
		open: function() {
			console.log('open');
			$win.show();
		},
		close: function() {
			$win.hide().remove();
		},
		center: function() {
			console.log('center');
			var windowHeight = 575;//$('#welcome #welcome-screen').outerWidth(true);
			var left = ($(document).width() / 2) - (windowHeight / 2);
			var top = Math.max(24,($(document).height() / 2) - (windowHeight / 2));
			$('#welcome #welcome-screen').css('left',left);
			$('#welcome #welcome-screen').css('top',top);
		},
		resize: function() {
			this.center();
		}
	}

	win.setup = function() {
		console.log('win setup');
	}

	win.fn.init.prototype = win.fn;
	bingos.win = win;
})(window);*/