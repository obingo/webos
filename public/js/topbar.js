/*
 *  顶部栏模块
 *  作者: XiaoBing
 */
bingos.topbar = (function(bingos, $) {
  var $L = bingos.$L;
  var myApps = bingos.appManager.myApps;
  // 设置App相关的事件绑定
  function setupTopbar() {
    // 绑定正在运行菜单的鼠标事件
    $('#runningAppMenu').hover(
      function() {
        if (!bingos.appManager.hasAppMove) {
          $(this).addClass('ahover');
          $('#runningApp').show();
        }
      },
      function() {
        $(this).removeClass('ahover');
        $('#runningApp').hide();
      }
    );
    // 绑定我的应用菜单的鼠标事件
    $('#myAppMenu').hover(
      function() {
        if (!bingos.appManager.hasAppMove) {
          $(this).addClass('ahover');
          $('#myAppOuter').show();
        }
      },
      function() {
        $(this).removeClass('ahover');
        $('#myAppOuter').hide();
      }
    );
    // 绑定帐号菜单的鼠标事件
    $('#accountMenu').hover(
      function() {
        if (!bingos.appManager.hasAppMove) {
          $(this).addClass('ahover');
          $('#accountPane').show();
        }
      },
      function() {
        $(this).removeClass('ahover');
        $('#accountPane').hide();
      }
    );
    // 获取用户信息
    $.get('/user/info', function(rs) {
      if (rs.success) {
        var $pane = $('#accountPane');
        var user = rs.user;
        $pane.find('span[name=username]').text(user.name);
        $pane.find('span[name=appnum]').text(user.appnum);
        $pane.find('span[name=create_at]').text(bingos.utils.formatDate(user.create_at));
        $pane.find('span[name=login_at]').text(bingos.utils.formatDate(user.login_at));
      } else {
        $('#accountPane').text(rs.error);
      }
    });
    // 绑定我的应用AppItem列表的点击事件
    $('#myApp').delegate('li', 'hover', function(e) { // AppItem鼠标滑过
      if (e.type === 'mouseenter') {
        $(this).find('.appControls').show();
      } else {
        $(this).find('.appControls').hide();
      }
    }).delegate('li', 'click', function() { // AppItem被点击
      var $this = $(this);
      var app = $this.data('app');
      bingos.app(app);
      $('#myAppMenu').removeClass('ahover');
      $('#myAppOuter').hide();
    }).delegate('a', 'click', function() { // AppItem中的按钮被点击
      var $this = $(this);
      var $appItem = $this.parent().parent();
      var app = $appItem.data('app');
      if ($this.hasClass('shareBtn')) { // 分享按钮
        $.post('/app/share', {appid: app.id}, function(rs) {
          var tips = $L('success.app.share');
          if (rs.success) {
            $appItem.find('.shareBtn,.modifyBtn').remove();
          } else {
            tips = rs.error;
          }
          alert(tips);
        });
      } else if ($this.hasClass('removeBtn')) { // 删除按钮
        $.post('/app/remove', {appid: app.id}, function(rs) {
          var tips = $L('success.app.remove');
          if (rs.success) {
            myApps.remove($appItem);
            $('#accountPane').find('span[name=appnum]').text(myApps.size());
          } else {
            tips = rs.error;
          }
          alert(tips);
        });
      } else if ($this.hasClass('modifyBtn')) { // 修改按钮
        createDlg('modify', app, function() {
          var $dlg = $(this);
          modifyApp(function(rs) {
            var tips = $L('success.app.modify');
            if (rs.success) {
              myApps.modify($appItem, rs.app);
              $dlg.dialog('close');
            } else {
              tips = rs.error;
              $('#appDlg>.validateTips').text(tips);
            }
          });
        });
      }
      return false; // 禁止默认行为
    });
    // 绑定添加应用
    $('#addApp').click(function() {
      createDlg('add', function() {
        var $dlg = $(this);
        addApp(function(rs) {
          var tips = $L('success.app.add');
          if (rs.success) {
            myApps.add(rs.app);
            $('#accountPane').find('span[name=appnum]').text(myApps.size());
            $dlg.dialog('close');
          } else {
            tips = rs.error;
            $('#appDlg>.validateTips').text(tips);
          }
        });
      });
    });
  }
  function serializeAppForm() {
    var fields = $('#appForm').serializeArray();
    var postData = {};
    $.each(fields, function(i, field) {
      postData[field.name] = field.value;
    });
    return postData;
  }
  function addApp(cb) {
    var postData = serializeAppForm();
    $.post(
      '/app/add',
      postData,
      cb,
      'json'
    );
  }
  function modifyApp(cb) {
    var postData = serializeAppForm();
    $.post(
      '/app/modify',
      postData,
      cb,
      'json'
    );
  }
  function createDlg(type, app, cb) {
    if (typeof cb === 'undefined') {
      cb = app;
    }
    var op = {
      add: {
        text: $L('app.add'),
        click: cb
      },
      modify: {
        text: $L('app.modify'),
        click: cb
      }
    }[type];
    var btns = [];
    btns.push(op);
    btns.push({
      text: $L('sys.cancel'),
      click: function() {
        $(this).dialog('close');
      }
    });
    var $dlg = $('#appDlg');
    if (type === 'modify') {
      $('input:hidden', $dlg).val(app.id);
      $('input[name=title]', $dlg).val(app.title);
      $('input[name=url]', $dlg).val(app.url);
      $('textarea[name=desc]', $dlg).val(app.desc);
    } else {
      $('input[name=url]', $dlg).val('http://');
    }
    $('#appDlg').dialog({
      title: op.text,
      resizable: false,
      height: 464,
      width: 350,
      modal: true,
      zIndex: 9999,
      buttons: btns,
      close: function() {
        $('.validateTips', this).text('');
        $('.text', this).val('');
        $('input[name=url]', this).val('http://');
      }
    });
  }
  return {
    setup: setupTopbar
  };
})(bingos, jQuery);