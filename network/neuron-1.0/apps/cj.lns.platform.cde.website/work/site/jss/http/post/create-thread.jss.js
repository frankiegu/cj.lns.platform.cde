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
var Comment=Java.type('cj.studio.cde.site.activity.Comment');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var subject = ISubject.subject(frame);
	var disk = engine.disk('$data.disk');
	var home = disk.home();
	var store=engine.store();
	var portal=engine.portal();
	
	var docid=params.docid;
	
	
	var comment=new Comment();
	comment.docid=docid;
	comment.content=params.html.getBytes();
	comment.user=subject.principal();
	store.commentit(docid,'-1',comment);
	
	var doc = ctx.html("/topics/topic.html", "utf-8");
	var follows=doc.select('#ember3538>.post-stream>.topic-follow');
	var follow=follows.first().clone();
	follow.select('.topic-body .contents').html(params.html);
	follow.attr('commentid',comment.id)	;
	
	var name=follow.select('.names span a');
	var path=String.format('/views/view-user.html?user=%s',comment.user);
	name.attr('href',path);
	name.html(subject.principal());
	var card=follow.select('.trigger-user-card');
	card.attr('href',path);
	var img=card.select('img');
	img.attr('title',subject.principal());
	var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',subject.face().getHead(),subject.principal());
	img.attr('src',src);
	circuit.content().writeBytes(follow.toString().getBytes());
}
