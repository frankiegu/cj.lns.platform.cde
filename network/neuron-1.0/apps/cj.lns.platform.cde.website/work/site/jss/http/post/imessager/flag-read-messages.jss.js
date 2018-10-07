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
 		cdeEngine:"cdeEngine",
 		printer:'$.cj.jss.http.users.i.msg-thread-printer'
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
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

exports.doPage = function(frame, circuit, plug, ctx) {
	var subject=ISubject.subject(frame);
	var engine=imports.head.services.cdeEngine;
	var thread=frame.parameter('thread');
	var msgid=frame.parameter('msgid');
	var home=engine.disk('$data.disk').home();
	
	var where=String.format("{'tuple.recipients':'%s','tuple.message.data.thread':'%s','tuple.message.data.id':'%s'}",subject.principal(),thread,msgid);
	home.deleteDocs('sns.cde.inbox',where);
}
