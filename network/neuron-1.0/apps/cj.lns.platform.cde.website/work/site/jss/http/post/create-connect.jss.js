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
var Connect=Java.type('cj.studio.cde.site.activity.Connect');
var ConnectType=Java.type('cj.studio.cde.site.activity.ConnectType');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var subject = ISubject.subject(frame);
	var store=engine.store();
	var topic = ctx.html("/topics/topic.html", "utf-8");
	var li=topic.select('.timeline-container .topic-timeline .timeline-padding > ul>li').first();
	createConnect(params,subject.principal(),store,li);
	circuit.content().writeBytes(li.toString().getBytes());
}

function createConnect(params,user,store,li){
	var connect=new Connect();
	connect.html=params.html;
	connect.source=params.source;
	connect.title=params.title;
	connect.docid=params.docid;
	connect.user=user;
	store.connectit(params.docid,ConnectType.connect,connect);
	
	var c=connect;
	li.attr('connectid',c.id);
	var a=li.select('a');
	a.html(c.title);
	a.attr('href',String.format('%s',c.source));
	a.attr('target','_blank');
	li.attr('title',String.format('接入者：%s 来源：%s',c.user,c.source))
	
}
