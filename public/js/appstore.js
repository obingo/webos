/*
 *  应用管理模块
 *  作者: XiaoBing
 */
bingos.appstore = (function(bingos, $) {
  var $L = bingos.$L;
  var myApps = bingos.appManager.myApps;

  function setupApp(appid, cb) {
    $.post(
      '/app/setup',
      {appid: appid},
      cb,
      'json'
    );
  }

  function setupAppStore() {
    $('#appStoreMenu').click(function() {
      $('#appStoreDlg').load('/app/store', function() {
        $(this).dialog({
          title: $L('app.store'),
          width: 1000,
          height: 500,
          zIndex: 10000
        });
      });
    });

    $('#appStoreDlg').delegate('a', 'click', function() {
      var $this = $(this);
      if ($this.hasClass('setup')) {
        var appid = $this.attr('appid');
        setupApp(appid, function(rs) {
          if (rs.success) {
            var appInfo = rs.app;
            $this.data('app', appInfo).attr('class', 'run').text($L('app.run'));
            myApps.add(appInfo);
          } else {
            alert(rs.error);
          }
        });
      } else if ($this.hasClass('run')) {
        var appInfo = $this.data('app') ||
          {
            id: $this.attr('appid'),
            title: $this.attr('title'),
            url: $this.attr('url'),
            desc: $this.attr('desc')
          };
        bingos.app(appInfo);
      }
    });
  }

  return {
    setup: setupAppStore
  };
})(bingos, jQuery);