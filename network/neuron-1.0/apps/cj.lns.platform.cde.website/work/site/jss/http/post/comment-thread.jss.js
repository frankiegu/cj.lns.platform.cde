/*
 * 创建：2016.0829
 * 作者：
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
	var store=engine.store();
	var portal=engine.portal();
	
	var docid=params.docid;
	
	
	var comment=new Comment();
	comment.docid=docid;
	comment.content=params.text.getBytes();
	comment.user=subject.principal();
	comment.tosomeone=params.tosomeone;
	store.commentit(docid,params.thread,comment);
	
	var doc = ctx.html("/topics/topic.html", "utf-8");
	var li=doc.select('.thread-discuss-ul > li').first().clone();
	li.attr('commentid',comment.id);
	var master=li.select('a[master]');
	var path=String.format('/views/view-user.html?user=%s',comment.user);
	master.attr('master',comment.user);
	master.attr('href',path);
	master.html(comment.user);
	var follow=li.select('a[follow]');
	if(comment.tosomeone==null||typeof comment.tosomeone=='undefined'){
		follow.remove();
	}else{
		if(comment.tosomeone==comment.user){
			follow.remove();
		}else{
			follow.attr('follow',comment.tosomeone)	;
			var href=String.format('/views/view-user.html?user=%s',comment.tosomeone);
			follow.attr('href',href);
			follow.html(comment.tosomeone)	;
		}
	}
	li.select('span[content]').html(new String(comment.content));
	
	if(subject==null){
		li.select('span[reply]').remove();
	}
	
	circuit.content().writeBytes(li.toString().getBytes());
}
