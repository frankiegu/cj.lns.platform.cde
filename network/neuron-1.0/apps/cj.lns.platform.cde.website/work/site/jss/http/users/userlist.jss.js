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
 		header:'$.cj.jss.site.header',
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
var FollowType=Java.type('cj.lns.platform.cde.embed.contact.FollowType');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');


exports.doPage = function(frame,circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var header = ctx.html("/global/header.html",'/', "utf-8");
	var headerPrinter=imports.head.services.header;
	var subject=ISubject.subject(frame);
	headerPrinter.printHeader(header,subject);
	var userlist = ctx.html("/users/userlist.html", "utf-8");
	
	var doc = ctx.html("/template/second-template.html", "utf-8");
	doc.head().append(header.head().html());
	doc.head().append(userlist.head().html());
	doc.body().select(">.main>.header").html(header.body().html());
	doc.body().select(">.main>.center").html(userlist.body().html());
	
	var sos=engine.sosrssite();
	var limit='10';
	var skip='0';
	var skipparam = frame.parameter("skip");
	if(!StringUtil.isEmpty(skipparam)){
		skip=skipparam;
	}
	var users=sos.getUsers(limit,skip);
	printUsers(users,engine.store(),doc);
	if(skip=='0'){
		circuit.content().writeBytes(doc.toString().getBytes());
	}else{
		circuit.content().writeBytes(doc.select('.directory table tbody').html().getBytes());
	}
	
}
function printUsers(users,store,doc){
	var table=doc.select('.directory table tbody').first();
	table.attr('count',users.size());
	var atr=table.select('>tr').first().clone();
	table.empty();
	for(var i=0;i<users.size();i++){
		var user=users.get(i);
		var tr=atr.clone();
		var info=tr.select('.user-info');
		var imga=info.select('.user-image a');
		var href=String.format('/users/%s/',user.userCode);
		imga.attr('href',href);
		var img=imga.select('img');
		img.attr('src',String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',user.head,user.userCode));
		img.attr('title',String.format('%s',user.nickName));
		
		var detail=info.select('.user-detail');
		var namea=detail.select('.username a');
		namea.attr('href',href);
		namea.html(user.userCode);
		detail.select('.name').html(String.format('%s',user.nickName));
		detail.select('.title').html(String.format('%s',user.signatureText!=null?user.signatureText:''));
		
		var doccount=store.ownerDocuments(user.userCode);
		var topicsa=tr.select('td[topics] span ');
		topicsa.html(doccount);
		
		var getlikecount=store.getLikesCount(user.userCode);
		var likeda=tr.select('td[getlikes] span ');
		likeda.html(getlikecount);
		
		var givelikecount=store.giveLikesCount(user.userCode);
		var likes=tr.select('td[givelikes] span');
		likes.html(givelikecount);
		
		var repliescount=store.giveCommentCount(user.userCode);
		var replies=tr.select('td[replies] span ');
		replies.html(repliescount);
		
		var viewscount=store.giveVisitorsCount(user.userCode);
		var views=tr.select('td[views] span');
		views.html(viewscount);
		
		var connectscount=store.giveConnectCount(user.userCode);
		var connects=tr.select('td[connects] span');
		connects.html(connectscount);
		
		tr.attr('user',user.userCode);
		
		table.append(tr);
	}
	
}