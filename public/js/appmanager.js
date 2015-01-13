/*
 *  应用管理模块
 *  作者: XiaoBing
 */
bingos.appManager = (function(bingos, $) {
  var myApps = [];
  var runningApps = [];
  var $E = bingos.event;
  var $L = bingos.$L;
  var hasAppMove = false;

    // 创建appItem节点
  function buildAppItem(app, hasControls) {
    app.index = app.index ? app.index : 0;
    var $appItem = $('<li class="appItem" appidx="' + app.index + '"></li>');
    $appItem.data('app', app);

    if (app.index === 0) { // 非正在运行的应用，不添加序号
      $appItem.text(app.title);
    } else { // 非正在运行的应用，不添加序号
      $appItem.text(runningApps.length + '# ' + app.title);
    }

    if (hasControls) {
      var $temp = $('<div class="appControls clearfix"></div>');
      if (!app.has_public) {
        $temp.append('<a href="javascript:;" class="appBtn shareBtn"></a>')
             .append('<a href="javascript:;" class="appBtn modifyBtn"></a>');
      }
      $temp.append('<a href="javascript:;" class="appBtn removeBtn"></a>');
      $appItem.append($temp);
    }

    return $appItem;
  }

  function removeRunningAppItem($appItem) {
    var idx = $appItem.index();
    runningApps.splice(idx, 1);
    $('#runningAppNum').text(runningApps.length);
    $appItem.remove();
  }

  function addRunningAppItem(appWin) {
    runningApps.push(appWin);
    $('#runningAppNum').text(runningApps.length);
  }

  function addMyAppItem(appInfo) {
    var $tempList = $([]);
    if ($.isArray(appInfo)) {
      $.each(appInfo, function() {
        $tempList = $tempList.add(buildAppItem(this, true));
        myApps.push(this);
      });
    } else {
      $tempList = buildAppItem(appInfo, true);
      myApps.push(appInfo);
    }
    $('#myApp').append($tempList);
    $('#myAppNum').text(myApps.length);
  }

  function removeMyAppItem($appItem) {
    var idx = $appItem.index();
    myApps.splice(idx, 1);
    $('#myAppNum').text(myApps.length);
    $appItem.remove();
  }

  function modifyMyAppItem($appItem, appInfo) {
    var idx = $appItem.index();
    myApps[idx] = appInfo;
    $appItem.replaceWith(buildAppItem(appInfo, true));
  }

  function searchMyApps(key, cb) {
    $.each(myApps, function() {
      if (this.title.indexOf(key) > -1) {
        cb(this);
      }
    });
  }

  // 设置App相关的事件绑定
  function setupAppManager() {
    // 绑定app创建事件，把app对象添加到运行队列，添加AppItem节点，并修改正在运行应用的数量
    $E('app.create').bind(function(app) {
      addRunningAppItem(app);
      $('#runningApp').append(buildAppItem(app));
    });
    
    // 绑定app关闭事件，修改运行数量，并删除相关的AppItem节点
    $E('app.close').bind(function(app) {
      //restoreLastActiveApp(true);
      removeRunningAppItem($('#runningApp>li[appidx=' + app.index + ']'));
      $('#runningAppNum').text(runningApps.length);
    });

    // 绑定app拖动事件
    $E('app.move').bind(function(app) {
      hasAppMove = true;
    });

    // 绑定app拖动停止事件
    $E('app.stop').bind(function(app) {
      hasAppMove = false;
    });

    // 加载我的应用
    $.get('/user/apps', function(rs) {
      if (rs.success) {
        addMyAppItem(rs.apps);
      }
    });

    // 绑定正在运行AppItem列表的点击事件
    $('#runningApp').delegate('li', 'click', function() { // AppItem被点击
      var $this = $(this);
      var idx = $this.index();
      runningApps[idx].show();

      $('#runningAppMenu').removeClass('ahover');
      $('#runningApp').hide();
    });

    $(window).resize(function() {
      $.each(runningApps, function() {
        if (this.maximized) {
          this.resize();
        }
      });
    });
  }

  return {
    setup: setupAppManager,
    buildAppItem: buildAppItem,
    hasAppMove: hasAppMove,
    runningApps: {
      add: addRunningAppItem,
      remove: removeRunningAppItem
    },
    myApps: {
      add: addMyAppItem,
      remove: removeMyAppItem,
      modify: modifyMyAppItem,
      search: searchMyApps,
      size: function() {return myApps.length;}
    }
  };
})(bingos, jQuery);