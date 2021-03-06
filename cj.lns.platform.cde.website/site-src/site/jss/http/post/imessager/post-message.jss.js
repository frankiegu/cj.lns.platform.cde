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
var HashMap = Java.type('java.util.HashMap');
var System = Java.type('java.lang.System');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
var TupleDocument = Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine=imports.head.services.cdeEngine;
	var subject=ISubject.subject(frame);
	var home=engine.disk('$data.disk').home();
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var thread=params.thread;
	var text=params.text;
	
	var map=new HashMap();
	map.ctime=System.currentTimeMillis();
	map.thread=thread;
	map.text=text;
	map.sender=subject.principal();
	var docid=home.saveDoc('cde.imessager.messages',new TupleDocument(map));
	map.id=docid;
	
	var rssite=engine.sosrssite();
	var cjtoken=frame.session().id();
	rssite.pushMessage(cjtoken,'imessager',subject.principal(),thread,map);
	
	//返回发送消息视图
	var doc = ctx.html("/users/i/thread.html", "utf-8");
	var table=doc.select('.message-table').first();
	var rowmeli=table.select('.message-row-me').first();
	rowmeli.select('.title').html(map.text);
	rowmeli.select('.timestamp').html(TimeUtil.time(map.ctime));
	circuit.content().writeBytes(rowmeli.toString().getBytes());
}
