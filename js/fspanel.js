// For sort table
var aAsc = [];
function sortTable(nr) {
	aAsc[nr] = aAsc[nr]=='asc'?'desc':'asc';
	$('#table_ext>tbody>tr').tsort('td:eq('+nr+')', {order:aAsc[nr]});
}
// Form with fields list
function createForm(flds, showflds) {
	var s = '<table class="header_select">';
	var c = '';
	var n = true;
	for (i=0;i<flds.length;i++) {
		if (n) s = s + '<tr>';
		c = '';
		if (jQuery.inArray(flds[i], showflds) >= 0) c = ' checked';
		s = s + '<td><input type="checkbox" id="'+flds[i]+'" name="'+flds[i]+'" value="1"'+c+'> '+flds[i]+'</td>';
		if (!n) s = s + '</tr>';
		n = !n;
	}
	if (!n) s = s + '<td>&nbsp;</td></tr>';
	return s + '</table><br />';
}
function init_windows() {
	if (jQuery.inArray('opt_ext', settings.data) < 0)
			$('#extensions').hide();
		else
			$('#extensions').show();
	if (jQuery.inArray('opt_call', settings.data) < 0)
			$('#calls').hide();
		else
			$('#calls').show();
	if (jQuery.inArray('opt_conf', settings.data) < 0)
			$('#conferences').hide();
		else
			$('#conferences').show();
	if (jQuery.inArray('opt_ftdm', settings.data) < 0)
			$('#freetdms').hide();
		else
			$('#freetdms').show();
	if (jQuery.inArray('opt_ss', settings.data) < 0)
			$('#sofiastatuses').hide();
		else
			$('#sofiastatuses').show();
}
function cmdClose(cmd, table) {
	$('#cmd_'+cmd).fadeOut('fast');
	$('#table_'+table+' .row_selected').removeClass('row_selected');
}
function showSettings(allfld, shfld, prefix) {
	var s = '<form id="'+prefix+'_form_set">'+
			createForm(allfld, shfld)+
			'<input type="button" value="Ok" onClick="'+prefix+'data.saveSettings();"> <input type="button" value="Cancel" onClick="$(\'#'+prefix+'_settings\').fadeOut(\'fast\');"></form>';
	$('#'+prefix+'_form_set').html(s);
	var h = $(window).height();
	var ww = $(window).width();
	var w = $('#'+prefix+'_settings').width();
	$('#'+prefix+'_settings').css('left', Math.round(ww/2 - w/2));
	$('#'+prefix+'_settings').fadeIn('fast');
}
//-------------------------------- COOKIE
function setCookie(name, value, exp_y, exp_m, exp_d, path, domain, secure) {
	var cookie_string = name + "=" + escape (value);
	if (exp_y) {
		var expires = new Date (exp_y, exp_m, exp_d);
		cookie_string += "; expires=" + expires.toGMTString();
	}
	if (path) cookie_string += "; path=" + escape (path);
	if (domain) cookie_string += "; domain=" + escape (domain);
	if (secure) cookie_string += "; secure";
	document.cookie = cookie_string;
}
function getCookie(cookie_name) {
	var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
	if (results)
		return (unescape(results[2]));
	else
		return '';
}
function delete_cookie(name) {
	var cookie_date = new Date();
	cookie_date.setTime(cookie_date.getTime() - 1);
	document.cookie = name += "=; expires=" + cookie_date.toGMTString();
}

var settings = {
	data : false,

	loadCookie: function(cook, datas, id) {
		x = getCookie(cook+'_show');
		if (x != '') datas.show_fields = x.split(",");
		x = getCookie(cook+'_width');
		if (x != '') { 
			datas.width = x.split(",");
			$(id).width(datas.width);
		}
	},
	initialize: function() {
		var x = getCookie('data');
		if (x == '') {
			settings.data = new Array('opt_ss', 'opt_call', 'opt_conf');
		} else {
			settings.data = x.split(',');
		}
		settings.loadCookie('exts', extsdata, '#extensions');
		settings.loadCookie('call', calldata, '#calls');
		settings.loadCookie('conf', confdata, '#conferences');
		settings.loadCookie('ftdm', ftdmdata, '#freetdms');
		settings.loadCookie('ss', ssdata, '#sofiastatuses');
		x = getCookie('call_func');
		if (x != '') {
			calldata.call_func = x;
		} else {
			calldata.call_func = 'channels';
		}
		$('#top_settings').click(function () {
			var p = $('#top_settings').position();
			var h = $('#top_settings').height();
			var w = $('#settings').width();
			$('#settings').css('left', p.left - w);
			$('#settings').css('top', p.top + h + 4);
			$('#settings').fadeIn('fast');
		});
		$('#set_cancel').click(function () {
			$('#settings').fadeOut('fast');
		});
		$('#set_save').click(function () {
			delete settings.data;
			settings.data = new Array();
			var x = $('#settings input[type=checkbox]:checked').map(function() {
				settings.data[settings.data.length] = $(this).val();
			});
			calldata.call_func = $('#opt_call_func').val();
			settings.save();
			$('#settings').fadeOut('fast');
			//init_windows();
			location.reload(true);
		});
	},
	save: function() {
		setCookie('exts_show', extsdata.show_fields);
		setCookie('call_show', calldata.show_fields);
		setCookie('call_func', calldata.call_func);
		setCookie('ss_show', ssdata.show_fields);
		setCookie('ftdm_show', ftdmdata.show_fields);
		setCookie('data', settings.data);
	}
}
//-----------------------------------
var extsdata = {
	show_fields : Array('Contact', 'IP', 'Auth-User'),
					// all available fields:
	all_fields : Array('Call-ID', 'User', 'Contact', 'Agent', 'Status', 'Host', 'IP', 'Port', 'Auth-User', 'Auth-Realm', 'MWI-Account'),
	// prev version - header fields translate table
	//header_fields : {'Call-ID': 'Call-ID', 'User': 'User', 'Contact': 'Contact', 'Agent': 'Agent', 'Status': 'Status', 'Host': 'Host',
	//				'IP': 'IP', 'Port': 'Port', 'Auth-User': '#', 'Auth-Realm': 'Auth-Realm', 'MWI-Account': 'MWI'},
	link_field : Array('ip', 'network-ip'),
	data : false,
	width	: 200,

	initialize: function() {
		extsdata.data = new Object();
		extsdata.fill();
	},
	fill: function() {
		var s = '<thead><tr>';
		var n = 0;
		for (i=0;i<extsdata.show_fields.length;i++) {
			//s = s + '<th abbr="'+n+'">' +extsdata.header_fields[extsdata.show_fields[i]]+ ' <span class="sort_sign" title="Click for sort column">&darr;</span></th>';
			s = s + '<th abbr="'+n+'">' +extsdata.all_fields[jQuery.inArray(extsdata.show_fields[i], extsdata.all_fields)]+ ' <span class="sort_sign" title="Click for sort column">&darr;</span></th>';
			n = n + 1;
		}
		s = s + '</tr></thead>';
		$('#table_ext').html(s);
		for (var key in extsdata.data) {
			extsdata.add(extsdata.data[key], key);
		}
		$('.sort_sign').click(function(e) {
			var x = $(e.target).parent().attr('abbr');
			sortTable(x);
		});
		$('#table_ext th').click(function(e) {
			if ($(e.target).hasClass('sort_sign')) return;
			showSettings(extsdata.all_fields, extsdata.show_fields, 'exts');
		});
	},
	// Data from server: d[user_id][fields from sofia status]
	load: function(d) {
		for (var key in d) {
			switch (d[key]['fsoperation']) {
				case 'part_del':
								delete extsdata.data[key];
								extsdata.del(key);
								break;
				case 'part_add':
								delete d[key]['fsoperation'];
								if (key == 'fields') {
									extsdata.resetFields(d[key]);
									extsdata.fill();
									break;
								}
								extsdata.data[key] = d[key];
								extsdata.add(d[key], key);
								break;
				case 'field_upd':
								delete d[key]['fsoperation'];
								for (var i in d[key]) {
									i = i.toLowerCase();
									extsdata.data[key][i] = d[key][i];
									extsdata.update(key, i, d[key][i]);
								}
								break;
				// now ignore field_del
			}
		}
		$('#table_ext').trigger("update");
	},
	add: function(r, id) {
		var n = ' id="exts_' + id;
		var x = $('#table_ext tbody').length;
		var shb = '';
		var she = '';
		var sf = 'tbody tr:last';
		if (x == 0) {
			shb = '<tbody>';
			she = '</tbody>';
			sf = 'thead';
		}
		var s = shb+'<tr'+n+'">';
		for (var x in extsdata.show_fields) {
			var key = extsdata.show_fields[x];
			if (jQuery.inArray(key, extsdata.link_field) > -1) {
				s = s + '<td'+n+key+'"><a href="http://'+r[key]+'/" target="_blank">'+r[key]+'</a></td>';
			} else {
				s = s + '<td'+n+key+'">'+r[key]+'</td>';
			}
		}
		s = s + '</tr>'+she;
		$('#table_ext '+sf).after(s);
		//$('#table_ext').trigger("update");
	},
	del: function(id) {
		$('#exts_'+id).remove();
	},
	update: function(id, fld, v) {
		$('#exts_'+id+fld).html('<td id="exts_'+id+fld+'">'+v+'</td>');
	},
	resetFields: function(r) {
		extsdata.all_fields = Array();
		var i = 0;
		for (var x in r) {
			extsdata.all_fields[i] = r[x];
			i++;
		}
	},
	saveSettings: function() {
		extsdata.show_fields = new Array();
		$('#exts_form_set input:checked').each(function() {extsdata.show_fields[extsdata.show_fields.length] = $(this).attr('id');});
		extsdata.fill();
		settings.save();
		$('#exts_settings').fadeOut('fast');
	}
}

var calldata = {
	show_fields : Array('direction','cid_name','cid_num','dest','callee_num','callstate','write_codec'),
	all_fields	: Array('direction','created','created_epoch','name','state','cid_name','cid_num','ip_addr','dest','application','application_data','dialplan','context','read_codec','read_rate','read_bit_rate','write_codec','write_rate','write_bit_rate','secure','hostname','presence_id','presence_data','callstate','callee_name','callee_num','callee_direction','call_uuid'),
	data		: false,
	call_func	: false,
	width		: 200,

	initialize: function() {
		calldata.data = new Object();
		calldata.fill();
	},
	fill: function() {
		var s = '<tr>';
		for (var x in calldata.show_fields) {
			var v = calldata.show_fields[x];
			if (v == 'direction') v = '&nbsp;';
			s = s + '<th>' + v + '</th>';
		}
		s = s + '</tr>';
		$('#table_call').html(s);
		for (var key in calldata.data) {
			calldata.add(calldata.data[key], key);
		}
	},
	// Data from server: d[uuid][fields from channel status]
	load: function(d) {
		for (var key in d) {
			switch (d[key]['fsoperation']) {
				case 'part_del':
								delete calldata.data[key];
								calldata.del(key);
								break;
				case 'part_add':
								delete d[key]['fsoperation'];
								if (key == 'fields') {
									calldata.resetFields(d[key]);
									break;
								}
								calldata.data[key] = d[key];
								calldata.add(d[key], key);
								break;
				case 'field_upd':
								for (var i in d[key]) {
									calldata.data[key][i] = d[key][i];
									calldata.update(key, i, d[key][i]);
								}
								break;
			}
		}
	},
	add: function(r, id) {
		var n = ' id="call_'+id;
		var s = '<tr'+n+'">';
		for (x in calldata.show_fields) {
			var i = calldata.show_fields[x];
			if (i == 'direction') {
				var ss = '&rarr;';
				if (r[i] == 'outbound') ss = '&larr;';
			} else {
				var ss = r[i];
			}
			if (ss == '') ss = '&nbsp;';
			s = s + '<td'+n+i+'"><div>' + ss + '</div></td>';
		}
		s = s + '</tr>';
		$('#table_call tr:last').after(s);
	},
	del: function(id) {
		$('#call_'+id).remove();
	},
	update: function(id, fld, v) {
		if (v == '') v = '&nbsp;';
		$('#call_'+id+fld).html('<div>'+v+'</div>');
	},
	resetFields: function(r) {
		calldata.all_fields = Array();
		var i = 0;
		for (var x in r) {
			calldata.all_fields[i] = r[x];
			i++;
		}
	},
	saveSettings: function() {
		calldata.show_fields = new Array();
		$('#call_form_set input:checked').each(function() {calldata.show_fields[calldata.show_fields.length] = $(this).attr('id');});
		calldata.fill();
		settings.save();
		$('#call_settings').fadeOut('fast');
	}
}

var ssdata = {
	show_fields : Array('name', 'type', 'data', 'state', 'count'),
	all_fields : Array('name', 'type', 'data', 'state', 'count'),
	data	: false,
	width	: 200,

	initialize: function() {
		ssdata.data = new Object();
		ssdata.fill();
	},
	fill: function() {
		var s = '<tr>';
		for (var x in ssdata.show_fields) {
			s = s + '<th>' + ssdata.show_fields[x] + '</th>';
		}
		s = s + '</tr>';
		$('#table_ss').html(s);
		for (var key in ssdata.data) {
			ssdata.add(ssdata.data[key], key);
		}
	},
	// Data from server: d[name][fields from status]
	load: function(d) {
		for (var key in d) {
			keyx = key.replace('::', '__');
			switch (d[key]['fsoperation']) {
				case 'part_del':
								delete ssdata.data[keyx];
								ssdata.del(keyx);
								break;
				case 'part_add':
								ssdata.data[keyx] = d[key];
								ssdata.add(d[key], keyx);
								break;
				case 'field_upd':
								for (var i in d[key]) {
									ssdata.data[keyx][i] = d[key][i];
									ssdata.update(keyx, i, d[key][i]);
								}
								break;
			}
		}
	},
	add: function(r, id) {
		var n = ' id="ss_'+id;
		var s = '<tr'+n+'" class="type_'+r['type']+'">';
		var p = '';
		for (x in ssdata.show_fields) {
			var i = ssdata.show_fields[x];
			s = s + '<td'+n+i+'"><div>' + r[i] + '</div></td>';
		}
		s = s + '</tr>';
		var t = $('#table_ss tr:last').after(s);
	},
	del: function(id) {
		$('#ss_'+id).remove();
	},
	update: function(id, fld, v) {
		if (v == '') v = '&nbsp;';
		$('#ss_'+id+fld).html('<div>'+v+'</div>');
	},
	saveSettings: function() {
		ssdata.show_fields = new Array();
		$('#ss_form_set input:checked').each(function() {ssdata.show_fields[ssdata.show_fields.length] = $(this).attr('id');});
		ssdata.fill();
		settings.save();
		$('#ss_settings').fadeOut('fast');
	}
}

var confdata = {
	data	: false,
	width	: 200,

	initialize: function() {
		confdata.data = new Object();
	},
		// Data from server: d[conference id][confNNN][name, number, status]
	load: function(d) {
		for (var key in d) {
			switch (d[key]['fsoperation']) {
				case 'part_del':
							delete confdata.data[key];
							confdata.del(key);
							delete d[key]['fsoperation'];
							break;
				case 'part_add':
							confdata.data[key] = d[key];
							confdata.add(key);
							for (var i in d[key]) {
								if (i == 'fsoperation') {
									delete d[key][i];
									continue;
								}
								confdata.data[key][i] = d[key][i];
								confdata.addfld(key, i, d[key][i]);
							}
							delete d[key]['fsoperation'];
							break;
				default:	for (var i in d[key]) {
								switch (d[key][i]['fsoperation']) {
									case 'field_del':
													delete confdata.data[key][i];
													confdata.delfld(i);
													break;
									case 'field_add':
													delete d[key][i]['fsoperation'];
													confdata.data[key][i] = d[key][i];
													confdata.addfld(key, i, d[key][i]);
													break;
									case 'field_upd':
													delete d[key][i]['fsoperation'];
													confdata.data[key][i] = d[key][i];
													confdata.update(key, i, d[key][i]);
													break;
								}
							}
							break;
			}
		}
	},
	add: function(id) {
		var s = '<tbody id="conference_'+id+'"><tr id="'+id+'"><td class="yellow_border conf_header" colspan="3">'+id+'</td></tr></tbody>';
		$('#table_conf thead').after(s);
	},
	del: function(id) {
		$('#table_conf tbody[id="conference_'+id+'"]').remove();
	},
	addfld: function(id, fld, v) {
		var s = '<tr id="' + fld + '">' +
				'<td>' + v['name'] + '</td>' +
				'<td>' + v['number'] + '</td>' +
				'<td>' + v['status'] + '</td>' +
				'</tr>';
		$('#table_conf tbody tr[id="'+id+'"]').after(s);
	},
	delfld: function(id) {
		$('#table_conf tbody tr[id="'+id+'"]').remove();
	},
	update: function(id, fld, v) {
		var s = '<td>' + v['name'] + '</td>' +
				'<td>' + v['number'] + '</td>' +
				'<td>' + v['status'] + '</td>';
		$('#table_conf tbody tr[id="'+fld+'"]').html(s);
	}
}

var ftdmdata = {
	show_fields : Array('span_id', 'chan_id', 'physical_status', 'signaling_status', 'state', 'cid_name', 'cid_num', 'dnis'),
	all_fields : Array('span_id', 'chan_id', 'physical_span_id', 'physical_chan_id', 'physical_status', 'physical_status_red',
						'physical_status_yellow', 'physical_status_rai', 'physical_status_blue', 'physical_status_ais',
						'physical_status_general', 'signaling_status', 'type', 'state', 'last_state', 'txgain', 'rxgain', 'cid_date',
						'cid_name', 'cid_num', 'ani', 'aniII', 'dnis', 'rdnis', 'cause', 'session'),
	header_fields : {'span_id': 'span', 'chan_id': 'chan', 'physical_span_id': 'ph_span', 'physical_chan_id': 'ph_chan', 'physical_status': 'status',
					'physical_status_red': 'red','physical_status_yellow': 'yellow', 'physical_status_rai': 'rai', 'physical_status_blue': 'blue',
					'physical_status_ais': 'ais','physical_status_general': 'general', 'signaling_status': 'sign', 'type': 'type', 'state': 'state',
					'last_state': 'last', 'txgain': 'txgain', 'rxgain': 'rxgain', 'cid_date': 'date','cid_name': 'name', 'cid_num': 'num',
					'ani': 'ani', 'aniII': 'aniII', 'dnis': 'dnis', 'rdnis': 'rdnis', 'cause': 'cause', 'session': 'session'},
	data : false,
	width	: 200,

	initialize: function() {
		ftdmdata.data = new Object();
		ftdmdata.fill();
	},
	fill: function() {
		var s = '<tr>';
		for (i=0;i<ftdmdata.show_fields.length;i++) {
			s = s + '<th>' + ftdmdata.header_fields[ftdmdata.show_fields[i]] + '</th>';
		}
		s = s + '</tr>';
		$('#table_ftdm').html(s);
		for (var key in ftdmdata.data) {//span
			for (var i in ftdmdata.data[key]) {//chan
				if (typeof ftdmdata.data[key][i]['span_id']=='undefined') continue;
				ftdmdata.add(ftdmdata.data, key, i);
			}
		}
	},
	// Data from server: d[span_id][chan_id][fields]
	load: function(d) {
		for (var key in d) {
			if (typeof ftdmdata.data[key]=='undefined') ftdmdata.data[key] = new Object();
			switch (d[key]['fsoperation']) {
				case 'part_add':
								for (var i in d[key]) {
									if (i == 'fsoperation') continue;
									ftdmdata.data[key][i] = d[key][i];
									ftdmdata.add(d, key, i);
								}
				default:
								for (var i in d[key]) {
									ftdmdata.data[key][i] = d[key][i];
									ftdmdata.update(d, key, i);
								}
			}
		}
	},
	add: function(r, span, chan) {
		var n = ' id="ftdm_' + span + '_' + chan;
		var s = '<tr'+n+'">';
		for (var x in ftdmdata.show_fields) {
			var key = ftdmdata.show_fields[x];
			s = s + '<td'+n+'_'+key+'">'+r[span][chan][key]+'</td>';
		}
		s = s + '</tr>';
		$('#table_ftdm tr:last').after(s);
	},
	update: function(r, span, chan) {
		var n = ' id="ftdm_' + span + '_' + chan;
		for (var x in ftdmdata.show_fields) {
			var key = ftdmdata.show_fields[x];
			$('#ftdm_'+span+'_'+chan+'_'+key).html(r[span][chan][key]);
		}
	},
	saveSettings: function() {
		ftdmdata.show_fields = new Array();
		$('#ftdm_form_set input:checked').each(function() {ftdmdata.show_fields[ftdmdata.show_fields.length] = $(this).attr('id');});
		ftdmdata.fill();
		settings.save();
		$('#ftdm_settings').fadeOut('fast');
	}
}
//-------------------------------- COMET (to server-side transport instead of Ajax)
var comet = {
	server		: './fscontrol.php',
	connection	: false, // ActiveX for IE, iframe for other
	iframediv	: false, // internal for IE
	form		: false, // Form for POST data

restart: function() {
	$(comet.connection).remove();
	comet.connection = false;
	comet.start();
},
toj: function(d, d2) {
	var j = '';
	if (d2.length > 0) j = '{' + d2;
	for (var k in d) {
		if (j.length == 0) {
			j = '{' + d2;
		} else {
			j += ',';
		}
		j += '"' + k + '":' + $.toJSON(d[k]);
	}
	if (j.length == 0) j = '{';
	j += '}';
	return j;
},
start: function() {
	var j = '';
	if (jQuery.inArray('opt_call', settings.data) >= 0) {
		j = '"channels": ' + comet.toj(calldata.data, '"chan_func" : "'+calldata.call_func+'"');
	}
	if (jQuery.inArray('opt_ext', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"exts": ' + comet.toj(extsdata.data, '');
	}
	if (jQuery.inArray('opt_conf', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"confs": ' + comet.toj(confdata.data, '');
	}
	if (jQuery.inArray('opt_ftdm', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"ftdms": ' + comet.toj(ftdmdata.data, '');
	}
	if (jQuery.inArray('opt_ss', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"ss": ' + comet.toj(ssdata.data, '');
	}
	j = '{' + j + '}';
	if (navigator.appVersion.indexOf("MSIE") != -1) {
		// For IE browsers
		comet.connection = new ActiveXObject("htmlfile");
		comet.connection.open();
		comet.connection.write("<html>");
		//comet.connection.write('<head>');
		//comet.connection.write("<script>document.domain = '"+document.domain+"';</s"+"cript>");
		//comet.connection.write("</head>");
		comet.connection.write("<body></body></html>");
		comet.connection.close();
		// Form elements
		ss = "<input type='hidden' name='data' value='"+j+"'>";
		//ss = '<input type="hidden" name="data" value="'+j+'">';
		comet.iframediv = comet.connection.createElement('div');
		comet.connection.body.appendChild(comet.iframediv);
		comet.connection.parentWindow.comet = comet;
		comet.iframediv.innerHTML = '<iframe id="comet_iframe" name="comet_iframe"></iframe><form id="comet_form" action="'+comet.server+'" method="POST" target="comet_iframe" enctype="application/x-www-form-urlencoded">'+ss+'</form>';
		//comet.iframe = comet.iframediv.lastChild;
		var doc = comet.connection;
		comet.form = doc.getElementById('comet_form');
		comet.form.submit();
	} else {
		$('#comet_form').remove();
		$('#comet_iframe').remove();
		$('body').append('<iframe id="comet_iframe" name="comet_iframe" style="display: none;" src="'+comet.server+'"></iframe><form style="display: none;" id="comet_form" action="'+comet.server+'" method="POST" target="comet_iframe" enctype="application/x-www-form-urlencoded"><input type="hidden" name="data" value=\''+j+'\'></form>');
		$('#comet_form').submit();
	}
},
handleResponse: function(d) {
	var obj = null;
	try {
		obj = jQuery.parseJSON(d);
	} catch(e) {
		obj = null;
	}
	if (obj == null) {
		alert(d);
		return;
	}
	if (obj['ERROR'] != null) {
		alert(obj['ERROR']);
		return;
	}
	for (var key in obj) {
		switch (key) {
			case 'exts': extsdata.load(obj[key]); break;
			case 'confs': confdata.load(obj[key]); break;
			case 'channels': calldata.load(obj[key]); break;
			case 'ftdms': ftdmdata.load(obj[key]); break;
			case 'ss': ssdata.load(obj[key]); break;
		}
	}
	delete obj['exts']['fields'];
	delete obj['channels']['fields'];
	delete obj['channels']['chan_func'];
},
stop: function() {
	if (comet.connection) {
		$(comet.connection).remove();
		comet.connection = false; // release the iframe to prevent problems with IE when reloading the page
	}
}
}
//-----------------------------------

$(function(){

	settings.initialize();

$('#extensions').resizable({resize: function(event, ui) {extsdata.width = $('#extensions').width(); settings.save();}});
$('#calls').resizable({resize: function(event, ui) {calldata.width = $('#calls').width(); settings.save();}});
$('#conferences').resizable({resize: function(event, ui) {confdata.width = $('#conferences').width(); settings.save();}});
$('#freetdms').resizable({resize: function(event, ui) {ftdmdata.width = $('#freetdms').width(); settings.save();}});
$('#sofiastatuses').resizable({resize: function(event, ui) {ssdata.width = $('#sofiastatuses').width(); settings.save();}});
$('#cmdresult').resizable();
$('#cmdresult').draggable();

// Sofia statuses
$('#table_ss').click(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'TH') {
		showSettings(ssdata.all_fields, ssdata.show_fields, 'ss');
		return;
	}
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	if (t.context.nodeName == 'DIV') {
		t = $(e.target).parent().parent();
	}
	var s = $(t).attr('id');
	var isgw = $(t).hasClass('type_gateway');
	var isprof = $(t).hasClass('type_profile');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ss_') < 0) return;
	var x = s.split('_');
	//var p = $(t).attr('id');
	if (isgw) {
		$(t).addClass('row_selected');
		$('#gateway_id').html(x[1]);
		$('#cmd_gateway').css('left', e.clientX);
		$('#cmd_gateway').css('top', e.clientY);
		$('#cmd_gateway').fadeIn('fast');
	}
	if (isprof) {
		$(t).addClass('row_selected');
		$('#profile_id').html(x[1]);
		$('#cmd_profile').css('left', e.clientX);
		$('#cmd_profile').css('top', e.clientY);
		$('#cmd_profile').fadeIn('fast');
	}
});
$('#cmd_profile .cmd_item').click(function(e) {
	var t = $(e.target);
	var cmd = $(t).attr('id');
	var s = $('#table_ss .row_selected').first().attr('id');
	cmdClose('profile', 'ss');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ss_') < 0) return;
	s = s.replace('ss_', '');
	$.ajax({url: './fscontrol.php?cmdapi='+cmd+'&param='+s});
});
$('#cmd_gateway .cmd_item').click(function(e) {
	var t = $(e.target);
	var cmd = $(t).attr('id');
	var s = $('#table_ss .row_selected').first().attr('id');
	cmdClose('gateway', 'ss');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ss_') < 0) return;
	s = s.replace('ss_', '');
	x = s.split('__');
	$.ajax({url: './fscontrol.php?cmdapi='+cmd+'&param='+x[0]+'&param2='+x[1]});
});
// Calls
$('#table_call').click(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'TH') {
		showSettings(calldata.all_fields, calldata.show_fields, 'call');
		return;
	}
	if (t.context.nodeName == 'DIV') {
		t = $(e.target).parent().parent();
	}
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	var s = $(t).attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('call_') < 0) return;
	s = s.replace('call_', '');
	$(t).addClass('row_selected');
	$('#call_id').html(s);
	$('#cmd_call').css('left', e.clientX);
	$('#cmd_call').css('top', e.clientY);
	$('#cmd_call').fadeIn('fast');
});
$('#cmd_call .cmd_item').click(function(e) {
	var t = $(e.target);
	var cmd = $(t).attr('id');
	var s = $('#table_call .row_selected').first().attr('id');
	cmdClose('call', 'call');
	if (typeof s == 'undefined') return;
	if (s.indexOf('call_') < 0) return;
	s = s.replace('call_', '');
	$.ajax({url: './fscontrol.php?cmdapi='+cmd+'&param='+s});
});
// Conferences
$('#table_conf').click(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	var s = $(t).attr('id');
	if (typeof s == 'undefined') return;
	$(t).addClass('row_selected');
	if (s.indexOf('conf') < 0) {
		$('#conf_conf_id').html(s);
		$('#cmd_conf_conf').css('left', e.clientX);
		$('#cmd_conf_conf').css('top', e.clientY);
		$('#cmd_conf_conf').fadeIn('fast');
	} else {
		s = s.replace('conf', '');
		$('#conf_member_id').html(s);
		$('#cmd_conf_member').css('left', e.clientX);
		$('#cmd_conf_member').css('top', e.clientY);
		$('#cmd_conf_member').fadeIn('fast');
	}
});
$('#cmd_conf_member .cmd_item').click(function(e) {
	var t = $(e.target);
	var cmd = $(t).attr('id');
	if (cmd == 'value_conf_transfer') return false;
	var s = $('#table_conf .row_selected').first().attr('id');
	var p = $('#table_conf .row_selected').first().parent().attr('id');
	cmdClose('conf_member', 'conf');
	if (typeof s == 'undefined') return;
	var id = s.replace('conf', '');
	if (typeof p == 'undefined') return;
	if (p.indexOf('conference_') < 0) return;
	var param3 = '';
	x = p.split('_');
	if (cmd == 'cmd_conf_transfer') param3 = $('#value_conf_transfer').attr('value');
	if (cmd == 'cmd_conf_vol_in') param3 = $('#slider_conf_vol_in').slider('option', 'value');
	if (cmd == 'cmd_conf_vol_out') param3 = $('#slider_conf_vol_out').slider('option', 'value');
	if (cmd == 'cmd_conf_energy') param3 = $('#slider_conf_energy').slider('option', 'value');
	$.ajax({url: './fscontrol.php?cmdapi='+cmd+'&param='+x[1]+'&param2='+id+'&param3='+param3});
});
$('#cmd_conf_conf .cmd_item').click(function(e) {
	var t = $(e.target);
	var cmd = $(t).attr('id');
	if ((cmd == 'value_conf_pin') || (cmd == 'value_conf_dial')) return false;
	var s = $('#table_conf .row_selected').first().attr('id');
	cmdClose('conf_conf', 'conf');
	if (typeof s == 'undefined') return;
	var param2 = '';
	if (cmd == 'cmd_conf_pin') param2 = $('#value_conf_pin').attr('value');
	if (cmd == 'cmd_conf_dial') param2 = $('#value_conf_dial').attr('value');
	$.ajax({url: './fscontrol.php?cmdapi='+cmd+'&param='+s+'&param2='+param2});
});
// FreeTDM
$('#table_ftdm').click(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'TH') {
		showSettings(ftdmdata.all_fields, ftdmdata.show_fields, 'ftdm');
		return;
	}
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	var s = $(t).attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ftdm_') < 0) return;
	var x = s.split('_');
	$(t).addClass('row_selected');
	var p = $(t).attr('id');
	$('#span_id').html(x[1]);
	$('#chan_id').html(x[2]);
	$('#cmd_ftdm').css('left', e.clientX);
	$('#cmd_ftdm').css('top', e.clientY);
	$('#cmd_ftdm').fadeIn('fast');
});
$('#cmd_ftdm .cmd_item').click(function(e) {
	var t = $(e.target);
	var cmd = $(t).attr('id');
	var s = $('#table_ftdm .row_selected').first().attr('id');
	cmdClose('ftdm', 'ftdm');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ftdm_') < 0) return;
	var x = s.split('_');
	if (cmd == 'cmd_ftdm_kill') {
		cmd = 'cmd_uuid_kill';
		x[1] = ftdmdata.data[x[1]][x[2]]['session'];
	}
	if (cmd == 'cmd_ftdm_dump') {
		$.ajax({url: './fscontrol.php?cmdapi=cmd_ftdm_dump&param='+x[1]+'&param2='+x[2],
			success: function(data) {
				$('#cmd_result').html(data);
				$('#cmdresult').fadeIn('fast');
			}
		});
	} else {
		$.ajax({url: './fscontrol.php?cmdapi='+cmd+'&param='+x[1]+'&param2='+x[2]});
	}
});
// About initialize
$('#about').click(function () {
	$('#about').fadeOut('fast');
});
$('#top_about').click(function () {
	//if ( $('#about').is(':visible')) {
		var p = $('#top_about').position();
		var h = $('#top_about').height();
		var w = $('#about').width();
		$('#about').css('left', p.left - w - 16);
		$('#about').css('top', p.top + h + 4);
		$('#about').fadeIn('fast');
});
//commands initialize
$('#commands').click(function () {
	$('#commands').fadeOut('fast');
});
$('#top_commands').click(function () {
	var p = $('#top_commands').position();
	var h = $('#top_commands').height();
	var w = $('#commands').width();
	$('#commands').css('left', p.left - w - 16);
	$('#commands').css('top', p.top + h + 4);
	$('#commands').fadeIn('fast');
});
$('#cmdresult').click(function () {
	$('#cmdresult').fadeOut('fast');
});
$('#commands .cmd_item').click(function(e) {
	var t = $(e.target);
	var s = $(t).attr('id');
	$.ajax({url: './fscontrol.php?cmdapi='+s,
		success: function(data) {
			$('#cmd_result').html(data);
			$('#cmdresult').fadeIn('fast');
		}
	});
});

$('.context_menu tr').on({
    mouseenter: function () {$(this).addClass('cmd_item_hover');},
    mouseleave: function () {$(this).removeClass('cmd_item_hover');}
});

$('.sliders').slider({
	max: 500,
	slide: function(event, ui) {
		var x = ui.value; //$(this).slider('option', 'value');
		var s = $(this).parent().attr('id');
		var id = s.replace('cmd_', 'value_');
		$('#'+id).html(x);
	}
});

calldata.initialize();
extsdata.initialize();
confdata.initialize();
ftdmdata.initialize();
ssdata.initialize();
init_windows();
if (jQuery.inArray('opt_ext', settings.data) >= 0) $('#opt_ext').prop('checked', true);
if (jQuery.inArray('opt_ss', settings.data) >= 0) $('#opt_ss').prop('checked', true);
if (jQuery.inArray('opt_call', settings.data) >= 0) $('#opt_call').prop('checked', true);
if (jQuery.inArray('opt_conf', settings.data) >= 0) $('#opt_conf').prop('checked', true);
if (jQuery.inArray('opt_ftdm', settings.data) >= 0) $('#opt_ftdm').prop('checked', true);
comet.start();
});
