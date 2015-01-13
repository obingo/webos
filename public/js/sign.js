/*
 *  登录模块
 *  作者: XiaoBing
 */
bingos.sign = (function(bingos, $) {
  function setupControl() {
    $('input:not(:checkbox)').val('');

    $('#changeReg').click(function(e) {
      $('#loginPane').hide();
      $('#regPane').show();
    });

    $('#changeLogin').click(function(e) {
      $('#regPane').hide();
      $('#loginPane').show();
    });

    $('#signContainer').delegate('input[type=text], input[type=password]', 'focus blur', function(e) {
      var $this = $(this);
      if (e.type == 'focusin') {
        $this.prev('label').hide();
      } else {
        if ($this.val() === '') $this.prev('label').show();
      }
    });

    /*$('#loginBtn').click(function(e) {
      post('login');
    });*/

    /*$('#regBtn').click(function(e) {
      post('reg');
    });*/
    var $L = bingos.$L;
    $.validator.addMethod("alphanumeric", function(value, element) {
      return this.optional(element) || /^[a-zA-Z][a-zA-Z0-9]*$/i.test(value);
    });
    $.validator.setDefaults({
      rules: {
        username: {
          required: true,
          alphanumeric: true,
          rangelength: [4, 12]
        },
        password: {
          required: true,
          rangelength: [6, 20]
        },
        repassword: {
          required: true,
          equalTo: '#regPwd'
        }
      },
      messages: {
        username: {
          required: $L('error.username.required'),
          alphanumeric: $L('error.username.invalid'),
          rangelength: $L('error.username.len')
        },
        password: {
          required: $L('error.password.required'),
          rangelength: $L('error.password.len')
        },
        repassword: {
          required: $L('error.repassword.required'),
          equalTo: $L('error.repassword.notmatch')
        }
      }
    });

    function onError(type) {
      return function() {
        if (this.errorList.length > 0) {
          error = this.errorList[0];
          $('#' + type + 'Notice').text(error.message);
        } else {
          $('#' + type + 'Notice').text('');
        }
      };
    }

    $('#loginForm').validate({
      submitHandler: function() {
        post('login');
      },
      showErrors: onError('login')
    });

    $('#regForm').validate({
      submitHandler: function() {
        post('reg');
      },
      showErrors: onError('reg')
    });
  }

  function post(type) {
    var fields = $('#' + type + 'Form').serializeArray();
    var postData = {};
    $.each(fields, function(i, field) {
      postData[field.name] = field.value;
    });

    var nid = '#' + type + 'Notice';
    var url = ({
      login: '/signin',
      reg: '/signup'
    })[type];

    $.post(
      url,
      postData,
      function(result) {
        if (result.success) {
          window.location.href = '/';
        } else {
          $(nid).text(result.error);
        }
      },
      'json'
    );
  }

  return {
    setup: function() {
      setupControl();
    }
  };
})(bingos, jQuery);

$(function() {
  bingos.sign.setup();
});