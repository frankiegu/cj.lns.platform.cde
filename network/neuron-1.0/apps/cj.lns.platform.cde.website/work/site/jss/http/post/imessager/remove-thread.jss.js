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

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine=imports.head.services.cdeEngine;
	var subject=ISubject.subject(frame);
	var home=engine.disk('$data.disk').home();
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	//如果当前主体是thread的创建者，则删除thread,收件人集合及其消息，否则只从thread的收件人集合中删除当前主体。
	var threaddoc=home.document('cde.imessager.threads',params.thread,HashMap.class);
	var thread=threaddoc.tuple();
	if(thread.creator==subject.principal()){
		var where=String.format("{'tuple.thread':'%s'}",params.thread);
		home.deleteDocs('cde.imessager.messages',where);
		home.deleteDocs('cde.imessager.recipients',where);
		var where=String.format("{'_id':ObjectId('%s')}",params.thread);
		home.deleteDocs('cde.imessager.threads',where);
	}else{
		var where=String.format("{'tuple.recipient':'%s','tuple.thread':'%s'}",subject.principal(),params.thread);
		home.deleteDocs('cde.imessager.recipients',where);
	}

}
