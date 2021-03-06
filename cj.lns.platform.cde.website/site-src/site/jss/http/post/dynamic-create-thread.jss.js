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
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var subject = ISubject.subject(frame);
	var disk = engine.disk('$data.disk');
	var home = disk.home();
	var portal=engine.portal();
	var owner=portal.owner(subject.principal());
	
	var docid=params.docid;
	var text=params.text;
	
	var map=new HashMap();
	map.docid=docid;
	map.content=text;
	map.ctime=System.currentTimeMillis();
	map.user=subject.principal();
	var threadid=home.saveDoc('cde.dynamics.comments',new TupleDocument(map));
	
	var doc = ctx.html("/users/views/dynamic.html", "utf-8");
	var threadli=doc.select('.dynamic .comment-list .comment-thread').first();
	threadli.attr('user',subject.principal());
	threadli.attr('thread',threadid);
	threadli.select('.follow-ul').empty();
	threadli.select('.thread-cnt>p').html(text);
	var href=String.format("/views/view-user.html?user=%s",subject.principal())	;
	threadli.select('.user-face').attr('href',href);
	var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),subject.principal());
	threadli.select('.user-face img').attr('src',src);
	var usrname=threadli.select('.user-name');
	usrname.attr('href',href);
	usrname.html(subject.principal());
	threadli.select('.timestamp').html(TimeUtil.friendlyTime(map.ctime));
	circuit.content().writeBytes(threadli.toString().getBytes());
}
