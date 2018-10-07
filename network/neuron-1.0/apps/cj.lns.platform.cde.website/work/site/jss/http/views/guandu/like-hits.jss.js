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
var Like=Java.type('cj.studio.cde.site.activity.Like');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

exports.doPage = function(frame, circuit, plug, ctx) {
	var topic = ctx.html("/topics/topic.html", "utf-8");
	var subject = ISubject.subject(frame);
	var engine=imports.head.services.cdeEngine;
	if(subject==null){
		throw new CircuitException('500','您没有登录.');
	}
	var docid=frame.parameter('docid');
	var store=engine.store();
	var schema=engine.schema();
	
	if(store.likesCount(docid,subject.principal())>0){
		throw new CircuitException('503','您已赞过了.'+subject.principal());
	}
	var like=new Like();
	like.docid=docid;
	like.user=subject.principal();
	store.likeit(docid,like);
	
	var likeE=topic.select('.timeline-container .topic-timeline .timeline-footer-likes .trigger-user-card').first();
	likeE.attr('data-user-card',like.user);
	likeE.attr('href',String.format('/views/view-user.html?user=%s',like.user));
	likeE.attr('title',like.user)	;
	var portal=engine.portal();
	var owner=portal.owner(like.user);
	var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),like.user);
	likeE.select('img').attr('src',src);
	circuit.content().writeBytes(likeE.toString().getBytes());
}
