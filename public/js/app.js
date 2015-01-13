/*
 *  应用模块
 *  作者: XiaoBing
 */
bingos.app = (function(bingos, $) {
  var $win = $('<div class="window">\
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
            </div>');

  var config = bingos.config;
  var $E = bingos.event;

  var movingApp = null;
  var winYOffset = 0;
  var winXOffset = 0;
  var appCount = 0;
  var zIndex = 1;
  
  var defaultOpt = {
    height: 580,
    width: 800,
    maximize: true,
    title: '不存在的应用',
    url: '/app/404',
    id: 'app_404'
  };

  var app = function(opt) {
    return new app.fn.init(opt);
  };

  /*
  function rmFromAppQueue(app) {
    var idx = $.inArray(app, appQueue);
    if (idx != -1) {
      appQueue.splice(idx, 1);
    }
  }
  */

  function onIframeLoad(e) {
    $(e.target).siblings('.appLoadOuter').hide();
  }

  function resizeWindow(win, opt) {
    opt = $.extend({}, {width: config.docWidth, height: config.docHeight}, opt);
    win.css(opt).find('.winBody').height(opt.height - config.winHeadHeight);
  }

  function setAppTop(app) {
    $('.iframeMask').show();
    app.win.css('z-index', zIndex++).show();
  }

  function storeAppSize(app) {
    var winHeight = app.win.height();
    var winWidth = app.win.width();

    app.offset = app.win.offset();
    app.size = {height: winHeight, width: winWidth};
  }

  function toggleWindowMaximize(btn, self) {
    var $btn = $(btn);
    if ($btn.hasClass('winMax')) {
      self.maximize();
      $btn.removeClass('winMax').addClass('winRestore');
    } else {
      self.restore();
      $btn.removeClass('winRestore').addClass('winMax');
    }
  }

  app.fn = app.prototype = {
    constructor: app,
    init: function(opt) {
      var self = this;

      opt = $.extend({}, defaultOpt, opt);

      this.win = $win.clone();

      this.win.attr('id', opt.id);
      this.index = ++appCount;
      this.id = opt.id;
      this.title = opt.title;
      this.maximized = false;

      this.win.find('.winTitle')
          .text(opt.title)
          .end()
          .find('.appIframe')
          .load(onIframeLoad)
          .attr('src', opt.url).end()
          .find('.iframeMask').click(function() {
            self.show();
            $(this).hide();
          }).end()
          .find('.winHead').mousedown(function(e) {
            if (!self.maximized) {
              movingApp = self;
              self.show();
              self.win.find('.iframeMask').show();
              var position = self.win.position();
              winXOffset = e.pageX - position.left;
              winYOffset = e.pageY - position.top;
            }
            e.stopPropagation();
            e.preventDefault();
          }).dblclick(function() {
            var btn = $(this).find('.winMax, .winRestore');
            toggleWindowMaximize(btn, self);
          }).end()
          .find('.winMin')
          .click(function(e) {
            self.minimize();
            e.stopPropagation();
          }).end()
          .find('.winMax')
          .click(function(e) {
            toggleWindowMaximize(this, self);
            e.stopPropagation();
          }).end()
          .find('.winClose')
          .click(function(e) {
            self.close();
            e.stopPropagation();
          });

      // 设置resizable
      this.win.resizable({
        minHeight: 300,
        minWidth: 300,
        handles: 'all',
        start: function() {
          self.win.find('.iframeMask').show();
        },
        resize: function(e, ui) {
          self.resize(ui.size);
        },
        stop: function() {
          self.win.find('.iframeMask').hide();
        }
      });

      this.resize({
        height: opt.height,
        width: opt.width
      });

      $('#desktop').after(this.win);

      $E('app.create').trigger(this);

      this.center();
      this.show();

      return this;
    },
    show: function() {
      $('.iframeMask').show();
      this.win.css('z-index', zIndex++).show()
              .find('.iframeMask').hide();

      $E('app.show').trigger(this);
    },
    close: function() {
      this.win.hide().remove();

      $E('app.close').trigger(this);
    },
    center: function() {
      var winHeight = this.win.height();
      var winWidth = this.win.width();

      var left = (config.docWidth - winWidth) / 2;
      var top = Math.max(50, (config.desktopHeight - winHeight) / 2);
      
      this.win.css('left', left);
      this.win.css('top', top);
    },
    resize: function(opt) {
      resizeWindow(this.win, opt);

      $E('app.resize').trigger(this);
    },
    maximize: function() {
      storeAppSize(this);
      resizeWindow(this.win);

      this.win.offset({left: 0, top: 0});
      this.maximized = true;

      $E('app.max').trigger(this);
    },
    minimize: function() {
      storeAppSize(this);
      this.win.hide();

      $E('app.min').trigger(this);
    },
    restore: function() {
      resizeWindow(this.win, this.size);
      this.win.offset(this.offset);
      this.maximized = false;
      this.show();

      $E('app.restore').trigger(this);
    }
  };

  app.fn.init.prototype = app.fn;

  app.setup = function() {
    $(document).mousemove(function(e) {
          /*if(e.pageX < 15 && !systemMenu.isMenuOut()){
          systemMenu.triggerMenuOut();
          }else if(e.pageX > 70 && systemMenu.getTimer() == null && systemMenu.isMenuOut()  && systemSettings.fullscreenCount()){
              systemMenu.triggerMenuIn();
          }*/
          if (movingApp !== null && !movingApp.maximized) {
            movingApp.win.css({
              'left': e.pageX - winXOffset,
              'top': Math.max(config.topbarHeight, e.pageY - winYOffset)
            });

            $E('app.move').trigger(movingApp);
          }
      });

    $(document).mouseup(function() {
      if (movingApp !== null) {
        movingApp.win.find('.iframeMask').hide();
        movingApp = null;

        $E('app.stop').trigger(movingApp);
      }
    });
     
    /*$('#desktop').delegate('.winHead', 'mousedown', function(e) {
      movingWin = $(this).parent();

      $('.iframeMask').show();
      setWindowTop(self);

      winXOffset = e.pageX - movingWin.position().left;
      winYOffset = e.pageY - movingWin.position().top;
    });*/

    /*$('#desktop').delegate('.iframeMask', 'click', function(e) {
      console.log('on iframe click');

      $('.iframeMask').show();
      var $iframeMask = $(this);

      setWindowTop({win: $iframeMask.parents('.window'));

      $iframeMask.hide();
    });*/
  };

  return app;

})(bingos, jQuery);