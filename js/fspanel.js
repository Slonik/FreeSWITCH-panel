// For sort table
var aAsc = [];
function sortTable(nr) {
	aAsc[nr] = aAsc[nr]=='asc'?'desc':'asc';
	$('#table_ext>tbody>tr').tsort('td:eq('+nr+')', {order:aAsc[nr]});
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

	initialize: function() {
		var x = getCookie('data');
		if (x == '') {
			settings.data = new Array('opt_ext', 'opt_call', 'opt_conf');
		} else {
			settings.data = x.split(',');
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
			settings.save();
			$('#settings').fadeOut('fast');
			init_windows();
		});
	},
	save: function() {
		setCookie('data', settings.data);
	}
}
//-----------------------------------

var extsdata = {
	show_fields : Array('Auth-User', 'Contact', 'IP'),
					// all available fields:
					// Call-ID, User, Contact, Agent, Status, Host, IP, Port, Auth-User, Auth-Realm, MWI-Account
	header_fields : Array('#', 'Name', 'IP'),
	link_field : 'IP',
	data : false,

	initialize: function() {
		extsdata.data = new Object();
		var s = '<thead><tr>';
		var n = 0;
		for (var x in extsdata.header_fields) {
			s = s + '<th class="sort_header" abbr="'+n+'" title="Click for sort column">' +extsdata.header_fields[x]+ '</th>';
			n = n + 1;
		}
		s = s + '</tr></thead>';
		$('#table_ext').html(s);
		$('.sort_header').click(function (e) {
			var x = $(e.target).attr('abbr');
			sortTable(x);
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
								extsdata.data[key] = d[key];
								extsdata.add(d[key], key);
								break;
				case 'field_upd':
								delete d[key]['fsoperation'];
								for (var i in d[key]) {
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
			if (key == extsdata.link_field) {
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
	}
}

var calldata = {
	show_fields : Array('direction','cid_name','cid_num','dest','callee_name','callee_num','callstate'),
	// all available fields:
	// 'created','created_epoch','name','state','cid_name','cid_num','ip_addr','dest','application','application_data','dialplan','context','read_codec','read_rate','read_bit_rate','write_codec','write_rate','write_bit_rate','secure','hostname','presence_id','presence_data','callstate','callee_name','callee_num','callee_direction','call_uuid'
	data	: false,

	initialize: function() {
		calldata.data = new Object();
		var s = '<tr>';
		for (var x in calldata.show_fields) {
			var v = calldata.show_fields[x];
			if (v == 'direction') v = '&nbsp;';
			s = s + '<th>' + v + '</th>';
		}
		s = s + '</tr>';
		$('#table_calls').html(s);
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
		$('#table_calls tr:last').after(s);
	},
	del: function(id) {
		$('#call_'+id).remove();
	},
	update: function(id, fld, v) {
		if (v == '') v = '&nbsp;';
		$('#call_'+id+fld).html('<div>'+v+'</div>');
	}
}
var confdata = {
	data	: false,

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
					// all available fields:
					// span_id, chan_id, physical_span_id, physical_chan_id, physical_status, physical_status_red,
					// physical_status_yellow, physical_status_rai, physical_status_blue, physical_status_ais,
					// physical_status_general, signaling_status, type, state, last_state, txgain, rxgain, cid_date
					// cid_name, cid_num, ani, aniII, dnis, rdnis, cause, session

	header_fields : Array('span', 'chan', 'phys', 'sign', 'state', 'cid_name', 'cid_num', 'dnis'),
	data : false,

	initialize: function() {
		ftdmdata.data = new Object();
		var s = '<tr>';
		for (var x in ftdmdata.header_fields) {
			s = s + '<th>' + ftdmdata.header_fields[x] + '</th>';
		}
		s = s + '</tr>';
		$('#table_ftdm').html(s);
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
	}
}
//-------------------------------- COMET (to server-side transport instead of Ajax)
var comet = {
	server		: './fspanel.php',
	connection	: false, // ActiveX for IE, iframe for other
	iframediv	: false, // internal for IE
	form		: false, // Form for POST data

restart: function() {
	$(comet.connection).remove();
	comet.connection = false;
	comet.start();
},
toj: function(d) {
	var j = '';
	for (var k in d) {
		if (j.length == 0) {
			j = '{';
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
	if (jQuery.inArray('opt_call', settings.data) >= 0) j = '"channels": ' + comet.toj(calldata.data);
	if (jQuery.inArray('opt_ext', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"exts": ' + comet.toj(extsdata.data);
	}
	if (jQuery.inArray('opt_conf', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"confs": ' + comet.toj(confdata.data);
	}
	if (jQuery.inArray('opt_ftdm', settings.data) >= 0) {
		if (j.length > 0) j += ', ';
		j += '"ftdms": ' + comet.toj(ftdmdata.data);
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
	if (obj == null) return;
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
		}
	}
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

$('#extensions').resizable();
$('#calls').resizable();
$('#conferences').resizable();
$('#freetdms').resizable();
$('#cmdresult').resizable();
$('#cmdresult').draggable();

settings.initialize();

$('#table_calls').click(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'DIV') {
		t = $(e.target).parent().parent();
	}
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	if ($(t).hasClass('row_selected')) {
		$(t).removeClass('row_selected');
	} else {
		$(t).addClass('row_selected');
	}
});
$('#table_conf, #table_ftdm').click(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	if ($(t).hasClass('row_selected')) {
		$(t).removeClass('row_selected');
	} else {
		$(t).addClass('row_selected');
	}
});
$('#table_ftdm').dblclick(function(e) {
	var t = $(e.target);
	if (t.context.nodeName == 'TD') {
		t = $(e.target).parent();
	}
	var s = $(t).attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ftdm_') < 0) return;
	var x = s.split('_');
	$.ajax({url: './fspanel.php?cmdapi=cmd_ftdm_dump&param='+x[1]+'&param2='+x[2],
		success: function(data) {
			$('#cmd_result').html('<div id="cmd_result">'+data+'</div>');
			$('#cmdresult').fadeIn('fast');
		}
	});
});
$('.cmd_item').click(function(e) {
	var t = $(e.target);
	var s = $(t).attr('id');
	$.ajax({url: './fspanel.php?cmdapi='+s,
		success: function(data) {
			$('#cmd_result').html('<div id="cmd_result">'+data+'</div>');
			$('#cmdresult').fadeIn('fast');
		}
	});
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
// Kill channel button
$('#cmd_kill_channel').click(function () {
	var s = $('#table_calls .row_selected').first().attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('call_') < 0) return;
	s = s.replace('call_', '');
	$.ajax({url: './fspanel.php?cmdapi=cmd_uuid_kill&param='+s});
	$('#table_ftdm .row_selected').removeClass('row_selected');
});
// Session kill in FreeTDM
$('#cmd_ftdm_kill').click(function () {
	var s = $('#table_ftdm .row_selected').first().attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ftdm_') < 0) return;
	var x = s.split('_');
	s = ftdmdata.data[x[1]][x[2]]['session'];
	$.ajax({url: './fspanel.php?cmdapi=cmd_uuid_kill&param='+s});
	$('#table_ftdm .row_selected').removeClass('row_selected');
});
//FreeTDM: start
$('#cmd_ftdm_start').click(function () {
	var s = $('#table_ftdm .row_selected').first().attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ftdm_') < 0) return;
	var x = s.split('_');
	$.ajax({url: './fspanel.php?cmdapi=cmd_ftdm_start_span&param='+x[1]});
	$('#table_ftdm .row_selected').removeClass('row_selected');
});
//FreeTDM: stop
$('#cmd_ftdm_stop').click(function () {
	var s = $('#table_ftdm .row_selected').first().attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('ftdm_') < 0) return;
	var x = s.split('_');
	$.ajax({url: './fspanel.php?cmdapi=cmd_ftdm_stop_span&param='+x[1]});
	$('#table_ftdm .row_selected').removeClass('row_selected');
});
//Conference commands
$('#cmd_conf_kick, #cmd_conf_deaf, #cmd_conf_mute, #cmd_conf_undeaf, #cmd_conf_unmute').click(function () {
	var c = $(this).attr('id');
	if (c.indexOf('cmd_conf_') < 0) return;
	var x = c.split('_');
	var cmd = x[2];
	var s = $('#table_conf .row_selected').first().attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('conference_') == 0) return;
	if (s.indexOf('conf') < 0) return;
	var id = s.substr(4);
	s = $('#table_conf .row_selected').first().parent().attr('id');
	if (typeof s == 'undefined') return;
	if (s.indexOf('conference_') < 0) return;
	x = s.split('_');
	$.ajax({url: './fspanel.php?cmdapi=cmd_conf_'+cmd+'&param='+x[1]+'&param2='+id});
	$('#table_conf .row_selected').removeClass('row_selected');
});

$(".sliders").slider();

calldata.initialize();
extsdata.initialize();
confdata.initialize();
ftdmdata.initialize();
init_windows();
if (jQuery.inArray('opt_ext', settings.data) >= 0) $('#opt_ext').prop('checked', true);
if (jQuery.inArray('opt_call', settings.data) >= 0) $('#opt_call').prop('checked', true);
if (jQuery.inArray('opt_conf', settings.data) >= 0) $('#opt_conf').prop('checked', true);
if (jQuery.inArray('opt_ftdm', settings.data) >= 0) $('#opt_ftdm').prop('checked', true);
comet.start();
});
