$(document).on('ready turbolinks:load', function(){
	alertify.defaults.transition = "slide";
	alertify.defaults.theme.ok = "btn btn-primary";
	alertify.defaults.theme.cancel = "btn btn-danger";
	alertify.defaults.theme.input = "form-control";

	alertify.set('notifier','position', 'top-right');
	function stripNonAlpha(instr){
		return instr.replace(/[^A-Za-z0-9 _-]/g, '');
	}
	const escapeHTML = str => (str+'').replace(/[&<>"'`=\/]/g, s => ({'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#39;','/': '&#x2F;','`': '&#x60;','=': '&#x3D;'})[s]);

	function html_id(instr) {
		return instr.replace(/^[^a-z]+|[^\w:.-]+/gi,'');
	}
	function hide_loading() {
		setTimeout(function(){ $('#loading_modal').modal('hide') }, 500);
	}
	function setMoreResults() {
		var $this = $('#moreResults');
		var limit = parseInt($this.attr('data-limit'), 10);
		var count = parseInt($this.attr('data-count'), 10);
		if (count < limit) {
			$this.hide();
		}
		else {
			$this.show();
		}
	}
	setMoreResults();

	$('#moreResults').on('click',function(e){
		e.preventDefault();
		var $this = $(this);
		var offset = parseInt($this.attr('data-offset'), 10);
		var limit = parseInt($this.attr('data-limit'), 10);
		var count = parseInt($this.attr('data-count'), 10);
		var lookup_key = $this.attr('data-key');
		var lookup_val = $this.attr('data-val');
		var filter = $('#searchRecordValue').val();
		$('#loading_modal').modal('show');
		var baseurl = '/record/';

		var payload = '?offset='	+ encodeURIComponent(offset) + '&limit=' +  encodeURIComponent(limit)
			+ '&filter=' +  encodeURIComponent(filter) ;
		$.ajax({
				url: baseurl + payload,
				type:'get',
				beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
				success:function(result){
					populateRecords(result, lookup_key, lookup_val);
					hide_loading();
					$this.attr('data-offset', offset + limit);
					if (result.length < limit) {
						$this.hide();
					}
					else {
						$this.show();
					}

				},
				error: function(result){
					hide_loading();
					alertify.notify("Error: Error getting records." ,"error", 0);
				}
		});
		$('#loading_modal').modal('hide');
	});

	$('#searchRecordValue').on('keydown',function(e){
		if (e.keyCode === 13) {
			$('#searchRecords').trigger('click');
			e.preventDefault()
		}
	});

	$('#searchRecords').on('click',function(e){
		var $this = $(this);

		var offset = 0;
		var limit = parseInt($this.attr('data-limit'), 10);
		var count = 0;
		var lookup_key = $this.attr('data-key');
		var lookup_val = $this.attr('data-val');
		var filter = $('#searchRecordValue').val();

		$('#loading_modal').modal('show');

		e.preventDefault();
		var baseurl = '/record/';

		var payload = '?offset='	+ encodeURIComponent(offset) + '&limit=' +  encodeURIComponent(limit)
			+ '&filter=' +  encodeURIComponent(filter) ;
		$.ajax({
				url: baseurl + payload,
				type:'get',
				beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
				success:function(result){
					populateRecords(result, lookup_key, lookup_val, true);
					$('#moreResults').attr('data-offset', offset + limit);
					hide_loading();
					if (result.length < limit) {
						alertify.notify("results(" + result.length + ") found.","success", 1);
						$('#moreResults').hide();
					}
					else {
						alertify.notify("At least results(" + result.length + ") found.","success", 1);
						$('#moreResults').show();
					}
				},
				error: function(result){
					hide_loading();
					alertify.notify("Error: Error getting records." ,"error", 0);
				}
		});
		$('#loading_modal').modal('hide');
	});

	function populateRecords(records, lookup_key, lookup_val, clear = false) {
		var recordsList = $('#recordsList');
		if (clear) {
			recordsList.html('');
		}
		var html = '';
		$.each(records, function(k,v){
			html += '<div class="row col-12" id="'+ html_id(v[lookup_key])+
				'"><div class="record_key col-4 col-xl-2">' +
        escapeHTML(v[lookup_key]) +
      	'</div><div class="record_value col-6 col-xl-9">' +
				escapeHTML(v[lookup_val]) +
    		'</div> <div class="record_action col-2 col-xl-1">' +
       	'<img src="/assets/edit-24px.svg" class="edit" data-source="' +  html_id(v[lookup_key]) + '" />' +
       	'<img src="/assets/delete-24px.svg" class="delete" data-source="' +  html_id(v[lookup_key]) + '" />' +
    		'</div></div>'
		});
		recordsList.html(recordsList.html() + html);
		$('#loading_modal').modal('hide');
	}

	$('#newRecord').on('click', function(e){
		var row_id = $(this).attr('data-source');
		var row_key = $('#' + row_id + ' .record_key').text().trim();
		var row_value = $('#' + row_id + ' .record_value').text().trim();
		var newRecordModal = $('#newRecordModal');

		var newId = $('#newRecordModal #newId');
		var newValue = $('#newRecordModal #newValue');
		newId.val('');
		newValue.val('');
		newRecordModal.modal('show');
		e.preventDefault();
	});

	$('#newRecordForm').submit(function(e){
		$('#loading_modal').modal('show');
		var $this = $(this);
		e.preventDefault();
		var newId = $('#newRecordModal #newId');
		var newValue = $('#newRecordModal #newValue');

		var baseurl = '/record/';
		var payload = $this.serialize();
		$('#newRecordModal').modal('hide');
		$.ajax({
				url:baseurl,
				type:'post',
				data: payload,
				beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
				success:function(result){
					if (result['results'] == 'success') {
						alertify.notify("Record Created: " + newId.val(),"success", 1.75);
					}
					else {
						alertify.notify(result['results'] + "(" + result['message'] + ")","error", 0);
					}
					hide_loading();
				},
				error: function(result){
					hide_loading();
					alertify.notify("Error Creating Record: " + newId.val() ,"error", 0);
				}
		});
	});

	$('#clearTable').on('click', function(e){
		var clearTableModal = $('#clearTableModal');
 		$('#clearTableModal #clearTableConfim').val('');
		clearTableModal.modal('show');
		e.preventDefault();
	});

	$('#clearTableForm').submit(function(e){
		var $this = $(this);
		e.preventDefault();
		if ($('#clearTableModal #clearTableConfim').val().toLowerCase().trim() === $('#clearTableModal #deleteConfirm').val().toLowerCase().trim()) {
				$('#clearTableModal').modal('hide');
				$('#loading_modal').modal('show');
				var baseurl = '/record/all';
				var payload = $this.serialize();

				$.ajax({
						url:baseurl,
						type:'delete',
						data: payload,
						beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
						success:function(result){
							hide_loading();
							if (result['results'] == 'success') {
								alertify.notify("Table Cleared" ,"success", 1.75);
								recordsList.html('');
							}
							else {
								alertify.notify(result['results'] + "(" + result['message'] + ")","error", 0);
							}
						},
						error: function(result){
							hide_loading();
							alertify.notify("Error","error", 0);
						}
				});
		}
		else {
			alertify.notify("Error: Value does not match today's date","error", 0);
		}
	});

	$('body').on('click', '#recordsList img.edit', function(e){
		var row_id = $(this).attr('data-source');
		var row_key = $('#' + row_id + ' .record_key').text().trim();
		var row_value = $('#' + row_id + ' .record_value').text().trim();
		var editRecordModal = $('#editRecordModal');
		var editRecordID = $('#editRecordModal #editRecordID');
		var editId = $('#editRecordModal #editId');
		var editValue = $('#editRecordModal #editValue');
		editRecordID.val( row_key);
		editId.val( row_id);
		editValue.val(row_value);
		editRecordModal.modal('show');
		e.preventDefault();
	});

	$('#editRecordForm').submit(function(e){
		$('#loading_modal').modal('show');
		var $this = $(this);
		e.preventDefault();
		var editRecordID = $('#editRecordModal #editRecordID');
		var editId = $('#editRecordModal #editId');
		var editValue = $('#editRecordModal #editValue');

		var baseurl = '/record/';
		var payload = $this.serialize();
		$('#editRecordModal').modal('hide');
		$.ajax({
				url:baseurl,
				type:'put',
				data: payload,
				beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
				success:function(result){
					if (result['results'] == 'success') {
						alertify.notify("Record Updated: " + editId.val(),"success", 1.75);
						$('#' + editRecordID.val() + ' .record_value').html(escapeHTML(editValue.val()));
					}
					else {
						alertify.notify(result['results'] + "(" + result['message'] + "): " + editId.val(),"error", 0);
					}
					hide_loading();
				},
				error: function(result){
					hide_loading();
					alertify.notify("Error Updating Record: " + editId.val() ,"error", 0);
				}
		});
	});

	$('body').on('click', '#recordsList img.delete', function(e){
		var row_id = $(this).attr('data-source');
		var row_key = $('#' + row_id + ' .record_key').text().trim();
		var row_value = $('#' + row_id + ' .record_value').text().trim();
		var deleteRecordModal = $('#deleteRecordModal');
		var deleteRecordID = $('#deleteRecordModal #deleteRecordID');
		var deleteId = $('#deleteRecordModal #deleteId');
		var deleteValue = $('#deleteRecordModal #deleteValue');
		deleteRecordID.val( row_key);
		deleteId.val( row_id);
		deleteValue.val(row_value);
		deleteRecordModal.modal('show');
		e.preventDefault();
	});

	$('#deleteRecordForm').submit(function(e){
		$('#loading_modal').modal('show');
		var $this = $(this);
		e.preventDefault();
		var deleteRecordID = $('#deleteRecordModal #deleteRecordID');
		var deleteId = $('#deleteRecordModal #deleteId');
		var deleteValue = $('#deleteRecordModal #deleteValue');
		var deleteRow = $('#' + deleteRecordID.val());
		var baseurl = '/record/';
		var payload = $this.serialize();
		$('#deleteRecordModal').modal('hide');
		$.ajax({
				url:baseurl,
				type:'delete',
				data: payload,
				beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
				success:function(result){
					if (result['results'] == 'success') {
						deleteRow.remove();
						alertify.notify("Record Deleted: " + deleteId.val(),"success", 1.75);
					}
					else {
						alertify.notify(result['results'] + "(" + result['message'] + "): " + deleteId.val(),"error", 0);
					}
					hide_loading();
				},
				error: function(result){
					hide_loading();
					alertify.notify("Error Deleting Record: " + deleteId.val() ,"error", 0);
				}
		});
	});

	$('#downloadRecords').on('click', function(e){
		e.preventDefault();
		window.location = '/record/download';
	});

	// CSV uploader

	$("#uploadCSV").on('change',function(e){
		if (e && e.target && e.target.files.length) {
			// $('#salesforce_changes .sf_title').html('CSV Import Results');
			var file = e.target.files[0];
			var $this = $(this);
			var lookup_key = $this.attr('data-key');
			var lookup_val = $this.attr('data-val');
			Papa.parse(file,{
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				transformHeader: function(k) { return (k.toLowerCase())},
				complete: function(results) {
					var data = results.data;
					var header = results.meta.fields;
					var errors = results.errors;
					if ((header.indexOf(lookup_key) > -1) && (header.indexOf(lookup_val) > -1) ) {
						$('#uploadRecordModal').modal('show');
						csvUpload(data, errors, lookup_key, lookup_val);
					}
					else {
						alertify.notify('Missing Columns. Please make sure "' + lookup_key + '" and "' + lookup_val + '" are included.',"error", 0);
					}
					$("#uploadCSV").val('');
				}
			});
		}
	});

	function csvUpload(result, errors, lookup_key, lookup_val) {
		$('#uploadRecordModal #parsedJson').val(JSON.stringify(result));
		$('#uploadRecordModal #parsedResults').html('');
		$('#uploadRecordModal #parsedErrors').html('');
		var results_msg = '<div class="row"><div class="col-3">' + lookup_key + '</div><div class="col-9">' + lookup_val + '</div></div>';

		$.each(result, function(k,v) {
			if (v[lookup_val] === null) {
				v[lookup_val] = '';
			}
			results_msg += '<div class="row">' +
			'<div class="col-3">' + escapeHTML(v[lookup_key]) +
			'</div><div class="col-9">' + escapeHTML(v[lookup_val]) +'</div></div>';
		});
		$('#uploadRecordModal #parsedResults').html(results_msg);

		if (errors.length) {
			var error_msg = '<div class="row"><div class="col-1">Line</div><div class="col-2">Code</div><div class="col-9">Message</div></div>';
			$.each(errors, function(k,v) {
				error_msg += '<div class="row"><div class="col-1">' + v['row'] +
				'</div><div class="col-2">' + v['code'] +
				'</div><div class="col-9">' + v['message'] + '</div></div>';
			});
			$('#uploadRecordModal #parsedErrors').html(error_msg);
		}
		else {
			$('#uploadRecordModal #parsedErrors').html('No Errors Found.');
		}
	};

	$('#uploadRecordForm').submit(function(e){
		$('#loading_modal').modal('show');
		var $this = $(this);
		e.preventDefault();
		var baseurl = '/record/upload';
		var payload = $this.serialize();
		$('#uploadRecordModal').modal('hide');
		$.ajax({
				url:baseurl,
				type:'post',
				data: payload,
				beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
				success:function(result){
					if (result['results'] == 'success') {
						alertify.notify("Record Uploaded","success", 1.75);
					}
					else {
						alertify.notify(result['results'] + "(" + result['message'] + ")","error", 0);
					}
					hide_loading();
				},
				error: function(result){
					hide_loading();
					alertify.notify("Error Uploaded Records", "error", 0);
				}
		});
	});
});
