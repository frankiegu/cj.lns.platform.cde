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
	
	var ul=printUnreadMessage(doc,subject);
	
	circuit.content().writeBytes(doc.select('.message-header').html().getBytes());
}
function printUnreadMessage(doc,subject){
	var engine=imports.head.services.cdeEngine;
	var portal=engine.portal();
	var home=engine.disk('$data.disk').home();
	var where=String.format("{'tuple.recipients':'%s'}",subject.principal());
	var unreadcount=home.tupleCount('sns.cde.inbox',where);
	doc.select('.message-header > .header-title .unread-count').html(unreadcount);
	var writemsg=String.format("/users/%s/messages/create-message",subject.principal());
	doc.select('.message-header > .header-title .header-bar .write-message').attr('href',writemsg);
	
	var ul=doc.select('.message-header .message-ul').first();
	if(unreadcount<1){
		ul.empty();
	}else{
		var cli=ul.select('>li').first().clone();
		ul.empty();
		var cjql=String.format("select {'tuple':'*'}.sort({'tuple.message.data.ctime':-1}).limit(10) from tuple sns.cde.inbox java.util.HashMap where {'tuple.recipients':'%s'}",subject.principal());
		var q=home.createQuery(cjql);
		var list=q.getResultList();
		for(var i=0;i<list.size();i++){
			var item=list.get(i);
			var tuple =item.tuple();
			var li=cli.clone();
			var msg=tuple.message;
			var faceimg=li.select('img');
			var owner=portal.owner(msg.sender);
			li.attr('title',String.format("发送者：%s %s",msg.sender,owner.face().getMemoName()));
			li.attr('thread',msg.data.thread);
			li.attr('msgid',msg.data.id);
			li.attr('recipients',tuple.recipients);
			faceimg.attr('src',String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),msg.sender));
			var name=li.select('.message-tips .user-name');
			name.html(msg.sender);
			var cnt=msg.data.text;
			if(cnt!=null&&cnt!='undefined'){
				li.select('.message-cnt > p').html(cnt);
			}else{
				li.select('.message-cnt > p').html('');
			}
			li.select('.message-tips .timestamp').html(TimeUtil.friendlyTime(msg.data.ctime));
			ul.append(li);
		}
	}
}
