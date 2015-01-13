/*
 *  工具模块
 *  作者: XiaoBing
 */
bingos.utils = (function(bingos, $) {
  function ellipsis(str, len) {
    if (str.length > len) {
      str = str.substr(0, len);
      str += '...';
    }
    return str;
  }

  function formatDate(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    return [
      date.getFullYear(), '年',
      date.getMonth() + 1, '月',
      date.getDate(), '日 ',
      hours < 10 ? '0' + hours : hours, ':',
      minutes < 10 ? '0' + minutes : minutes, ':',
      seconds < 10 ? '0' + seconds : seconds
    ].join('');
  }

  return {
    ellipsis: ellipsis,
    formatDate: formatDate
  };
})(bingos, jQuery);