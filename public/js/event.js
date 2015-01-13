/*
 *  事件模块
 *  作者: XiaoBing
 *  参考: Callbacks vs Events[by Dean Edwards](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/)
 */
var bingos = bingos || {};
bingos.event = (function(window, document) {
  var eventMap = {};
  var addEvent = null;
  var removeEvent = null;
  var onEventProxy = null;
  var dispatchEvent = null;

  var listener = function(event) {
    var type = event.type || event.propertyName;

    if (eventMap.hasOwnProperty(type)) {
      onEventProxy();
    }
  };

  var setEventProxy = function(handler, data) {
    onEventProxy = function() {
      handler(data);
    };
  };

  if (document.addEventListener) {
    addEvent = function(type, fn) {
      if (!eventMap[type]) {
        document.addEventListener(type, listener, false);
        eventMap[type] = [fn];
      } else {
        eventMap[type].push(fn);
      }
    };

    removeEvent = function(type) {
      document.removeEventListener(type, listener, false);
    };

    dispatchEvent = function(type) {
      var customEvent = document.createEvent("UIEvents");
      customEvent.initEvent(type, false, false);
      document.dispatchEvent(customEvent);
    };

  } else if (document.attachEvent) { // MSIE
    addEvent = function(type, fn) {
      if (!eventMap[type]) {
        document.documentElement[type] = 0; // an expando property
        document.documentElement.attachEvent("onpropertychange", listener);
        eventMap[type] = [fn];
      } else {
        eventMap[type].push(fn);
      }
    };

    removeEvent = function(type) {
      delete document.documentElement[type];
    };

    dispatchEvent = function(type) {
      document.documentElement[type]++;
    };
  }

  var fireEvent = function(type, data) {
    var handlers = eventMap[type];
    if (!!handlers && typeof handlers === 'object') {
      var len = handlers.length;
      for (var i = 0; i < len; i++) {
        var handler = handlers[i];
        if (typeof handler === 'function') {
          setEventProxy(handler, data);
          dispatchEvent(type);
        }
      }
    }
  };

  var event = function(type) {
    return new event.fn.init(type);
  };

  event.fn = event.prototype = {
    constructor: event,
    init: function(type) {
      this.type = type || 'global.event';
      return this;
    },
    bind: function(fn) {
      addEvent(this.type, fn);
      return this;
    },
    trigger: function(data) {
      fireEvent(this.type, data);
      return this;
    },
    remove: function(fn, isRemoveAll) {
      if (fn === undefined) {
        removeEvent(this.type);
        delete eventMap[this.type];
      } else {
        var handlers = eventMap[this.type];
        if (typeof fn === 'function' && handlers instanceof Array) {
          for (var i = handlers.length - 1; i >= 0; i--) {
            if (fn === handlers[i]) {
              handlers.splice(i, 1);
              if (!isRemoveAll) break;
            }
          }
        }
      }
      return this;
    }
  };

  event.fn.init.prototype = event.fn;

  return event;
})(window, document);