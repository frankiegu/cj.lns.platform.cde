/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：
 * <![jss:{
		scope:'runtime',
		extends:'',
		filter:{
	 	}
 	},
 	services:{
 		menu:"menuService",
 		cdeEngine:"cdeEngine"
 	}
 ]>
 */

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil = Java.type('cj.studio.ecm.net.web.WebUtil');
var Document = Java.type('org.jsoup.nodes.Document');
var File = Java.type('java.io.File');
var RuntimeException = Java.type('java.lang.RuntimeException');
var ArrayList = Java.type('java.util.ArrayList');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/module.html", "utf-8");
	var module = frame.parameter('module');
	if (module == null) {
		throw new RuntimeException('未确定模块');
	}
	var menu = imports.head.services.menu.getItem(module);
	printMenu(frame, menu.items, doc);
	if (isAjax(frame)) {
		// 打印模块工具栏：当直接访问portal时并不知道模块，而当刷新模块时，portal知道了模块，故而才打印出来。
		// 而当在portal中ajax模块时，并不经过portal处理，故而不会打印工具栏，所以在此处理ajax时的工具栏
		var tools = menu.tools;
		if (typeof tools != 'undefined' && tools != '' && tools != null) {
			var json = new Gson().toJson(tools);
			json=json.replace('${user}',frame.parameter('user'));
			doc
					.append(String
							.format(
									"<tools id=\"tools-data\" module='%s' style='display:none;'>%s</tools>",
									module, json));
		}
	}
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printMenu(frame, menu, doc) {
	var engine = imports.head.services.cdeEngine;
	var portal = engine.portal();
	var subject = ISubject.subject(frame);
	var owner = portal.owner(frame.parameter('user'));
	var module = frame.parameter('module');

	var ul = doc.select('#ember1972').first();
	ul.attr('module', String.format('%s', module));
	var oli = ul.select('>li').last().clone();
	oli.select('>a').removeClass('active');
	ul.empty();
	var hasactive = false;
	for (var i = 0; i < menu.size(); i++) {
		var m = menu.get(i);
		if (m.hide) {
			continue;
		}
		if (m.allow != null) {
			var allow = m.allow;
			if (allow.contains('$ownerOnly')) {
				if (!owner.isOwner(subject)) {
					continue;
				}

			} else {
				var isAllow = false;
				for (var j = 0; j < allow.size(); j++) {
					var ace = allow.get(j);
					if (owner.hasRole(ace)) {
						isAllow = true;
						break;
					}
				}
				if (!isAllow) {
					continue;
				}
			}
		}
		var li = oli.clone();
		var a = li.select('>a').first();
		if (m.active) {
			a.addClass('active');
			hasactive = true;
		}
		li.attr('id', m.id);
		a.html(m.name);
		var src = String.format('/users/%s/%s/%s', frame.parameter('user'),
				frame.parameter('module'), m.id);
		a.attr('href', src);
		ul.append(li);
	}

	if (!hasactive && menu.size() > 0) {
		ul.select('li[id=' + menu.get(0).id + '] a').addClass('active');
	}

}
