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

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/views/view-user.html", "utf-8");
	var subject = ISubject.subject(frame);
	var user=frame.parameter('user');
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var docid=frame.parameter('docid');
	var store=engine.store();
	var schema=engine.schema();
	var owner=portal.owner(user);
	var contacts=engine.contacts();
	
	var facea=doc.select('#user-card .card-content a.card-huge-avatar');
	var ulink=String.format('/users/%s/',user);
	facea.attr('href',ulink);
	var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),user);
	facea.select('img').attr('src',src);
	var uname=doc.select('#user-card .username a');
	uname.html(user);
	uname.attr('href',ulink);
	var sign=owner.face().getSignText();
	if(sign==null)sign='';
	doc.select('#user-card h2').html(String.format('%s',sign));
	
	var count=store.ownerDocuments(user);
	doc.select('#user-card .metadata h3 span[docs]').html(count+'');
	
	var lvisit=store.userLastVisit(user);
	if(lvisit==null){
		doc.select('#user-card .metadata h3 span[lastvisitor]').html('僵尸啊，连一点活动都没');
	}else{
		var ctime=lvisit.ctime;
		var span=doc.select('#user-card .metadata h3 span[lastvisitor]');
		span.html(TimeUtil.friendlyTime(ctime));
		span.attr('title','最后活动时间：'+TimeUtil.time(ctime));
	}
	
	var ercount=contacts.followerCount(user);
	var ingcount=contacts.followingCount(user);
	var section=doc.select('.badge-section');
	section.select('.followings a').attr('href','/users/'+user+'/contacts/ifollow');
	section.select('.followers a').attr('href','/users/'+user+'/contacts/followers');
	section.select('.followings a span[label]').html(String.format('[%s]',ingcount));
	section.select('.followers a span[label]').html(String.format('[%s]',ercount));
	
	var writemsg=doc.select('#user-card .usercard-controls a[data-ember-action=message]');
	var connectbut=doc.select('.usercard-controls a[data-ember-action=connect]');
	if(subject==null){
		connectbut.remove();
		writemsg.remove();
	}else{
		
		var writehref=String.format('/users/%s/messages/create-message?toChat=%s',subject.principal(),user);
		writemsg.attr('href',writehref);
		if(!subject.principal().equals(user)){
			var type=contacts.relationship(subject.principal(),user);
			connectbut.attr('type',type);
			var ie=connectbut.select('i').first().clone();
			if(type==FollowType.followingOnly){
				connectbut.html('已关注');
				connectbut.attr('title','点击撤消关注');
				connectbut.prepend(ie);
			}else if(type==FollowType.both){
				connectbut.html('已互粉');
				connectbut.attr('title','点击撤消关注');
				connectbut.prepend(ie);
			}
		}else{
			connectbut.remove();
		}
	}
	
	
	circuit.content().writeBytes(doc.toString().getBytes());
}
