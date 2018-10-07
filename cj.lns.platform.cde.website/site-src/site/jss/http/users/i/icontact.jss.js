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
 		cdeEngine:"cdeEngine"
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
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/i/icontact.html", "utf-8");
	var module = frame.parameter('module');
	if (module == null) {
		throw new CircuitException('500','未确定模块');
	}
	var engine = imports.head.services.cdeEngine;
//	var subject = ISubject.subject(frame);
	var icontact = engine.contacts();
	var user = frame.parameter('user');
	if(user==null){
		throw new CircuitException('404','不确定用户');
	}
	var view = frame.parameter('view');
	var follows;
	switch (view) {
	case 'allcontact':
		follows = icontact.followAll(user);
		break;
	case 'ifollow':
		follows = icontact.following(user);
		break;
	case 'followers':
		follows = icontact.follower(user);
		break;
	case 'followboths':
		follows = icontact.followBoth(user);
		break;
	}
	printFollows(user, follows,engine.portal(), doc);

	circuit.content().writeBytes(doc.toString().getBytes());
}
function printFollows(user, follows,portal, doc) {
	// var users=new ArrayList();
	// for(var i=0;i<follows.size();i++){
	// var f=follows.get(i);
	// if(f.follower.equals(user)&&!f.following.equals(user)){
	// users.add(f.following);
	// }else if(f.following.equals(user)&&!f.follower.equals(user)){
	// users.add(f.follower);
	// }
	//		
	// }
	// print(users);
	// 由于portal工具类能缓存用户的查询，因此使用此类，不再采用in语法查询，上面代码注释掉
	doc.select('.icontact-panel').empty();
	
	var contactul=doc.select('.icontact-list').first();
	var contactli=contactul.select('.icontact-user').first().clone();
	contactul.empty();
	for (var i = 0; i < follows.size(); i++) {
		var f = follows.get(i);
		var fuser='';
		if (f.follower.equals(user) && !f.following.equals(user)) {
			fuser=f.following;
		} else if (f.following.equals(user) && !f.follower.equals(user)) {
			fuser=f.follower;
		}else{
			continue;
		}
		var owner=portal.owner(fuser);
		var li=contactli.clone();
		li.attr('user',fuser);
		
		var a=li.select('.user-image a');
		var href=String.format("/users/%s/",fuser);
		a.attr('href',href);
		var img=a.select('img');
		img.attr('title',fuser);
		img.attr('src',String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),fuser));
		
		var detail=li.select('.user-detail');
		var a2=detail.select('.username a');
		a2.attr('href',href);
		a2.html(fuser);
		a2.attr('data-user-card',fuser);
		var name=owner.face().getMemoName()+'';
		detail.select('.name').html(name);
		detail.select('.title').html(String.format('%s',owner.face().getSignText()==null?'':owner.face().getSignText()));
		
		var ship=detail.select('.relationship');
		if(f.isBoth){
			ship.attr('title','互粉');
			ship.attr('src','/img/followhx.svg');
		}else{
			if(f.following.equals(user)){
				ship.attr('title','粉丝');
				ship.attr('src','/img/follower.svg');
			}else{
				ship.attr('title','关注');
				ship.attr('src','/img/followother.svg');
			}
			
		}
		
		contactul.append(li);
	}
}
