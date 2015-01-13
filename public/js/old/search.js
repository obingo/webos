function SearchSystem() {
	this.init = function() {
		this.setupControl();
	}

	this.setupControl = function() {
		$(document).delegate('#searchKey', 'focus blur', function(e) {
			var $this = $(this);
			if (e.type == 'focusin') {
				if ($this.val() == '') {
					$this.prev('label').hide();
				} else {
					$('#searchSuggest').show();
				}
			} else {
				if ($this.val() == '') $this.prev('label').show();
			}
		});
	}
}