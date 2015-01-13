$(document).ready(function() {
  var config = bingos.config;

  bingos.app.setup();
  bingos.appManager.setup();
  bingos.topbar.setup();
  bingos.search.setup();
  bingos.appstore.setup();

  var onResize = (function(e) {
    var $win = $(window),
      winHeight = $win.height(),
      winWidth = $win.width(),
      desktopHeight = winHeight - config.topbarHeight;

    $('#desktop').height(desktopHeight);

    config.docHeight = winHeight;
    config.docWidth = winWidth;
    config.desktopHeight = desktopHeight;
    config.desktopWidth = winWidth;

    return arguments.callee;
  })();

  $(window).resize(onResize);

  //bingos.app({id: 'app1', title: 'bbs', url: 'http://bbs.gzhu.edu.cn'});
  //bingos.app({id: 'app2', title: 'gzhu', url: 'http://www.gzhu.edu.cn'});
  //bingos.app({id: 'app3', title: 'xsh', url: 'http://xsh.gzhu.edu.cn'});
});
