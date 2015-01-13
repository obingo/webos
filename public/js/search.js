/*
 *  搜索模块
 *  作者: XiaoBing
 */
bingos.search = (function(bingos, $) {
  var $L = bingos.$L;
  var ellipsis = bingos.utils.ellipsis;
  var buildAppItem = bingos.appManager.buildAppItem;

  function searchApp(key) {
    var hasAppFound = false;
    var noAppFoundHtml = '<li class="noAppFound">' + $L('app.notfound') + '</li>';
    var $localApp = $('#localApp');
    var $storeApp = $('#storeApp');
    var $localAppList = $localApp.find('ul').empty(); // 清空我的应用结果列表
    var $storeAppList = $storeApp.find('ul').empty(); // 清空应用市场结果列表

    $localApp.find('.key').text(ellipsis(key, 7));
    $storeApp.find('.key').text(ellipsis(key, 7));

    // 搜索我的应用
    bingos.appManager.myApps.search(key, function(appInfo) {
      hasAppFound = true;
      buildAppItem(appInfo).appendTo($localAppList);
    });

    // 如果没有搜索到任何应用，插入提示
    if (!hasAppFound) {
      $(noAppFoundHtml).appendTo($localAppList);
    }

    // 提交服务器搜索应用市场
    $.post(
      '/app/search',
      {key: key},
      function(rs) {
        if (rs.success && rs.apps.length > 0) { // 成功返回
          $.each(rs.apps, function() {
            buildAppItem(this).appendTo($storeAppList);
          });
        } else {
          $(noAppFoundHtml).appendTo($storeAppList);
        }
      },
      'json'
    );
  }

  // 设置搜索相关功能
  function setupSearchControl() {
    // 绑定搜索框获得焦点事件
    $('#searchKey').focusin(function() {
      var defaultValue = this.defaultValue;
      var $this = $(this);
      var key = $.trim($this.val());

      // 如果搜索框内为默认值，则清空
      if (key === defaultValue) {
        $this.val('');
      } else {
        // 显示列表
        $('#searchSuggest').show();

        // 如果搜索框内非默认值，且搜索结果为空，则进行新的搜索
        if ($('#localApp li').length === 0 && $('#storeApp li').length === 0) {
          searchApp(key);
        }
      }
    }).keyup(function() { // 绑定键盘事件
      var $this = $(this);
      var key = $.trim($this.val());

      // 输入为空，隐藏结果
      if (key === '') {
        $('#searchSuggest').hide();
      } else { // 输入非空，搜索并显示结果
        $('#searchSuggest').show();
        searchApp(key);
      }
    });

    $(document).mouseup(function(e) { // 绑定搜索框推动焦点事件
      if (e.target.id !== 'searchKey') {
        var $searchKey = $('#searchKey');
        var defaultValue = $searchKey[0].defaultValue;
        var key = $.trim($searchKey.val());

        // 如果没有输入内容，则还原默认值
        if (key === '') {
          $searchKey.val(defaultValue);
        } else { // 否则，隐藏结果
          $('#searchSuggest').hide();
        }
      }
    });

    $('#searchSuggest').delegate('li.appItem', 'click', function() {
      var app = $(this).data('app');
      bingos.app(app);
    });
  }

  return {
    setup: setupSearchControl
  };
})(bingos, jQuery);