/*
 *  添加窗口
 *  作者: XiaoBing
 */
$(function() {
  var $L = top.bingos.$L;
  $('input').val('');
  $('#addPane').delegate('input[type=text]', 'focus blur', function(e) {
    var $this = $(this);
    if (e.type == 'focusin') {
      $this.prev('label').hide();
    } else {
      if ($this.val() === '') $this.prev('label').show();
    }
  });

  $('#addForm').validate({
    rules: {
      title: {
        required: true,
        minlength: 2,
        maxlength: 20
      },
      url: {
        required: true,
        url: true
      }
    },
    messages: {
      title: {
        required: $L('error.title.required'),
        minlength: $L('error.title.min'),
        maxlength: $L('error.title.max')
      },
      url: {
        required: $L('error.url.required'),
        url: $L('error.url.invalid')
      }
    },
    submitHandler: function() {
      var fields = $('#addForm').serializeArray();
      var postData = {};
      $.each(fields, function(i, field) {
        postData[field.name] = field.value;
      });
      $.post(
        '/app/add',
        postData,
        function(result) {
          if (result.success) {
            var app = result.app;
            top.bingos.topbar.addApp(app);

            var $addNotice = $('#addNotice');
            $addNotice.text($L('success.app.add'));
            $('<a href="javascript:;">打开应用【' + app.title + '】</a>').click(function() {
              top.bingos.app(app);
            }).appendTo($addNotice);

            $('input').val('');
            $('label').show();
          } else {
            $('#addNotice').text(result.error);
          }
        },
        'json'
      );
    },
    showErrors: function() {
      if (this.errorList.length > 0) {
        error = this.errorList[0];
        $('#addNotice').text(error.message);
      } else {
        $('#addNotice').text('');
      }
    }
  });
});