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
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/views/guandu/view-connect.html", "utf-8");
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var store=engine.store();
	var schema=engine.schema();
	var subject =ISubject.subject(frame);
	var docid=frame.parameter('docid');
	var connectid=frame.parameter('connectid');
	var connect=store.connect(docid,connectid);
	if(connect==null){
		throw new CircuitException('404','不存在文档的链接');
	}
	if(subject==null){
		doc.select('.view-connect >span[del]').remove();
	}else{
		if(subject.principal()!=connect.user){
			doc.select('.view-connect >span[del]').remove();
		}
	}
	doc.select('.view-connect').attr('connectid',connect.id);
	var title=doc.select('.view-connect .title a');
	title.attr('href',String.format('%s',connect.source));
	title.attr('target','_blank');
	title.select('h1').html(String.format('%s',connect.title));
	doc.select('.view-connect .publish span[creator]').html(String.format('%s',connect.user));
	doc.select('.view-connect .publish span[date]').html(TimeUtil.time(connect.ctime));
	doc.select('.view-connect>.body').html(connect.html);
	circuit.content().writeBytes(doc.toString().getBytes());
}
