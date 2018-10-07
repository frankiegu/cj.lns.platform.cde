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
var TimeUtil = Java.type('cj.studio.cde.site.util.TimeUtil');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
//参数：newgroup新消息编组，gview新消息列表视图
exports.printNewThread = function(newgroup, gview) {
	gview.attr('thread',newgroup.id);
//	gview.addClass('thread-selected');
	gview.attr('creator',newgroup.creator);
	var time=TimeUtil.time(newgroup.ctime);
	var timespan=gview.select('.user-info .opera .timestamp');
	timespan.attr('title',time);
	timespan.html(time.substring(time.lastIndexOf(' ')+1,time.length));
	gview.select('.username a').removeAttr('href');
	gview.select('.user-image>a').removeAttr('href');
	return gview;
}
//参数：agroup消息编组,creatorOwner是作为thread头像的用户的portalOwner对象,recievers消息接收人列表，gview稳定消息列表视图
exports.printFixedThread = function(agroup,creatorOwner,recievers, gview,firstmsg,threadid,principal) {
	gview.select('.user-info .user-image .user-group span[count]').html(recievers.size());
	gview.attr('thread',agroup.id);
	var engine=imports.head.services.cdeEngine;
	var portal=engine.portal();
	var home=engine.disk('$data.disk').home();
	var unreadcount=home.tupleCount('sns.cde.inbox',String.format("{'tuple.recipients':'%s','tuple.message.data.thread':'%s'}",principal,threadid));
	if(unreadcount>0){
		var tips=gview.select('.actions .tips');
		tips.html(unreadcount);
		tips.attr('style','display:inline-block;');
	}
	
	var pos=0;
	var facea=gview.select('.user-info .user-image a');
	facea.select('i').remove();
	facea.removeAttr('href');
	facea.empty();
	
	
	var usernames=gview.select('.user-info .user-detail .username')
	usernames.empty();
	for(var i=0;i<recievers.size();i++){
		var tdoc=recievers.get(i);
		var tuple=tdoc.tuple();
		var recipient=tuple.recipient;
		var recowner=portal.owner(recipient);
		var face=recowner.face();
		if(pos<4){
			
			var src="http://www.cjlns.com/resource/ud/"+face.head+"?path=home://system/img/faces&u="+recipient;
			
			facea.attr('class','group-size-'+(i+1));
			facea.append("<img class='avatar img-"+i+"' src='"+src+"' title='"+face.getMemoName()+"'>");
		}
		var href=String.format("/views/view-user.html?user=%s",recipient);
		usernames.append(String.format("<a href='%s' title='%s' user='%s'>%s</a>&nbsp;&nbsp;",href,face.getMemoName(),recipient,recipient));
		pos++;
	}
		
	
	gview.select('.user-info .user-detail .name').html(creatorOwner.face().getMemoName());
	var time=TimeUtil.time(agroup.ctime);
	var timespan=gview.select('.user-info .opera .timestamp');
	timespan.html(time.substring(time.lastIndexOf(' ')+1,time.length));
	timespan.attr('title',time);
	
	if(firstmsg!='undefined'&&firstmsg!=null){
		var msgtuple=firstmsg.tuple();
		var firstmsgtext=msgtuple.text;
		gview.select('.user-info .user-detail .title').html(msgtuple.sender+':'+firstmsgtext);
	}else{
		gview.select('.user-info .user-detail .title').html('');
	}
	return gview;
}