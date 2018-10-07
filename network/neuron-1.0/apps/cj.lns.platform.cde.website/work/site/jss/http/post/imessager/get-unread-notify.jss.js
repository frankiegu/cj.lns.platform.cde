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
	var doc = ctx.html("/global/header.html", "utf-8");
	var subject=ISubject.subject(frame);
	
	printUnreadNotify(doc,subject);
	
	circuit.content().writeBytes(doc.select('.notify-header').html().getBytes());
}
function printUnreadNotify(doc,subject){
	var engine=imports.head.services.cdeEngine;
	var portal=engine.portal();
	var home=engine.disk('$data.disk').home();
	var where=String.format("{'tuple.reciever':'%s','tuple.state':'unread'}",subject.principal());
	var unreadcount=home.tupleCount('cde.dynamics.recievers',where);
	
	var ul=doc.select('.notify-header .notify-ul').first();
	var activitiesli=ul.select('>.activites').first();
	var likesli=ul.select('>.likes').first();
	if(unreadcount<1){
		activitiesli.attr('style','display:none;');
	}else{
		activitiesli.select('.notify-info').html(String.format('他们更新了动态(%s)',unreadcount));
		var usersul=activitiesli.select('.notify-users').first();
		var userli=usersul.select('>li').first().clone();
		usersul.empty();
		var cjql=String.format("select {'tuple.sender':1}.sort({'tuple.ptime':-1}).distinct() from tuple cde.dynamics.recievers java.lang.String where {'tuple.reciever':'%s','tuple.state':'unread'}",subject.principal());
		var q=home.createQuery(cjql);
		var resultList=q.getResultList();
		for(var i=0;i<resultList.size();i++){
			var item=resultList.get(i);
			var tuple=item.tuple();
			var li=userli.clone();
			var href=String.format("/users/%s/notifications/dynamic",tuple);
			li.attr('href',href)
			var owner=portal.owner(tuple);
			li.attr('title',owner.face().getMemoName());
			var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),tuple);
			li.select('>img').attr('src',src);
			li.select('.name').html(tuple);
			
			usersul.append(li);
		}
	}
}
