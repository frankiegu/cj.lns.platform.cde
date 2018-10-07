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
 		cdeEngine:'cdeEngine'
 	}
 ]>
 */

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil = Java.type('cj.studio.ecm.net.web.WebUtil');
var Document = Java.type('org.jsoup.nodes.Document');
var File = Java.type('java.io.File');
var ArrayList = Java.type('java.util.ArrayList');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var CdeSubject = Java.type('cj.lns.platform.cde.embed.auth.CdeSubject');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
var HashMap=Java.type('java.util.HashMap');
var System=Java.type('java.lang.System');
var TupleDocument=Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');
var StringUtil=Java.type('cj.ultimate.util.StringUtil');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var subject = ISubject.subject(frame);
	var disk = engine.disk(subject.principal());
	
	var id=params.id;
	
	var home = disk.home();
	var map = new HashMap();
	map.put('title', params.title);
	map.put('coverimg', params.coverimg);
	map.put('coverstyle', params.coverstyle);
	map.put('html', params.html);
	map.put('creator',subject.principal());
	map.put('ctime', System.currentTimeMillis());
	if (params.containsKey('id')&&!StringUtil.isEmpty(id)) {// 有则更新
		home.updateDoc('activity.drafts',id,new TupleDocument(map));
	}else{
		id = home.saveDoc('activity.drafts',new TupleDocument(map));
	}
	
	circuit.content().writeBytes(String.format("{\"id\":\"%s\"}",id).getBytes());
	
}
