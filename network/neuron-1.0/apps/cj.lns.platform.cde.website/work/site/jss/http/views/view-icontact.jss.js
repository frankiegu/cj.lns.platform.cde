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
var FollowType=Java.type('cj.lns.platform.cde.embed.contact.FollowType');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/i/icontact.html", "utf-8");
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var user=params.user;
	if(user==null){
		throw new CircuitException('404','未指定用户');
	}
	var portaluser=params.portaluser;
	if(portaluser==null){
		throw new CircuitException('404','不确定的个人门户归属');
	}
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var owner=portal.owner(user);
	var contacts=engine.contacts();
	var store=engine.store();
	var subject =ISubject.subject(frame);
	
	var panel=doc.select('.icontact-panel').first();
	
	printPanel(owner,subject,portaluser,contacts,store,panel);

	circuit.content().writeBytes(panel.html().getBytes());
}
function printPanel(owner,subject,portaluser,contacts,store,panel){
	var facea=panel.select('.face-img a');
	var href=String.format('/users/%s/',owner.user());
	facea.attr('href',href);
	facea.attr('title',owner.user());
	
	var fimg=facea.select('img');
	fimg.attr('src',String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),owner.user()));
	panel.select('.face-img .sex').html(owner.face().isMale()?'男':'女');
	
	var ship=panel.select('.icontact-face .face-img .relationship');
	
	if(subject==null){
		ship.select('img[following]').remove();
		ship.select('img[follower]').remove();
		panel.select('.button-send').remove();
	}else{
		panel.select('.button-send').attr('href',String.format('/users/%s/messages/create-message?toChat=%s',subject.principal(),owner.user()));
		if(portaluser.equals(subject.principal())){
			var type=contacts.relationship(owner.user(),subject.principal());
			if(type=='none'){
				type=contacts.relationship(subject.principal(),owner.user());
				if(type=='none'){
					ship.select('img[following]').remove();
					ship.select('img[follower]').remove();
					ship.attr('ship','none');
				}else if(type=='followingOnly'){
					ship.select('img[follower]').remove();
					ship.attr('ship','following');//你关注了他
				}else if (type=='both'){
					ship.attr('ship','both');
				}
			}else if(type=='followingOnly'){
				ship.select('img[following]').remove();
				ship.attr('ship','follower');//他是你的粉丝
			}else if (type=='both'){
				ship.attr('ship','both');
			}
		}else{
			ship.select('img[following]').remove();
			ship.select('img[follower]').remove();
		}
		
	}
	
	panel.select('.icontact-face').attr('user',owner.user());
	
	var names=panel.select('.face-names');
	var a=names.select('a[username]');
	a.attr('href',href);
	a.html(owner.user());
	names.select('span[nickname]').html(owner.face().getMemoName());
	names.select('.face-sign').html(String.format('%s',owner.face().getSignText()==null?'':owner.face().getSignText()));
	
	var text=String.format('%s',owner.face().getBriefing()==null?'':owner.face().getBriefing());
	panel.select('.icontact-brief p').html(text);
	
	var activityul=panel.select('.his-activities');
	
	var followers=contacts.followerCount(owner.user());
	var followera=activityul.select('li[followers] a');
	followera.html(followers);
	followera.attr('href',String.format('/users/%s/contacts/followers',owner.user()));
	
	var followings=contacts.followingCount(owner.user());
	var followinga=activityul.select('li[followings] a');
	followinga.html(followings);
	followinga.attr('href',String.format('/users/%s/contacts/ifollow',owner.user()));
	
	var doccount=store.ownerDocuments(owner.user());
	var topicsa=activityul.select('li[topics] a ');
	topicsa.attr('href',String.format('/users/%s/',owner.user()));
	topicsa.html(doccount);
	
	var getlikecount=store.getLikesCount(owner.user());
	var likeda=activityul.select('li[liked] a ');
	likeda.removeAttr('href');
	likeda.html(getlikecount);
	
	var givelikecount=store.giveLikesCount(owner.user());
	var likes=activityul.select('li[likes] a ');
	likes.removeAttr('href');
	likes.html(givelikecount);
	
	var repliescount=store.giveCommentCount(owner.user());
	var replies=activityul.select('li[replies] a ');
	replies.removeAttr('href');
	replies.html(repliescount);
	
	var viewscount=store.giveVisitorsCount(owner.user());
	var views=activityul.select('li[views] a ');
	views.removeAttr('href');
	views.html(viewscount);
	
	var connectscount=store.giveConnectCount(owner.user());
	var connects=activityul.select('li[connects] a ');
	connects.removeAttr('href');
	connects.html(connectscount);
}


