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
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/i/thread.html", "utf-8");
	var module = frame.parameter('module');
	if (module == null) {
		throw new RuntimeException('未确定模块');
	}
	var subject=ISubject.subject(frame);
	var engine=imports.head.services.cdeEngine;
	var portal=engine.portal();
	var home=engine.disk('$data.disk').home();
	var thread=frame.parameter('item');
	var where=String.format("{'_id':ObjectId('%s')}",thread);
	var count=home.tupleCount('cde.imessager.threads',where);
	if(count<1){
		throw new CircuitException('404','thread不存在');
	}
	//打印收件人列表
	
	var pillul=doc.select('.inbox-wrap .inbox-header .pillbox-list').first();
	var pillli=pillul.select('.pill').first().clone();
	pillul.empty();
	var cjql=String.format("select {'tuple':'*'} from tuple cde.imessager.recipients java.util.HashMap where {'tuple.thread':'%s'}",thread);
	var q=home.createQuery(cjql);
	var recipients=q.getResultList();
	for(var i=0;i<recipients.size();i++){
		var recdoc=recipients.get(i);
		var rec=recdoc.tuple();
		var li=pillli.clone();
		li.attr('user',rec.recipient);
		var href=String.format('/views/view-user.html?user=%s',rec.recipient);
		li.select('>a').attr('href',href);
		li.select('.name').html(rec.recipient);
		var owner=portal.owner(rec.recipient);
		li.select('.nick').html(String.format("%s",owner.face().getMemoName()));
		pillul.append(li);
	}
	var href=String.format("/users/%s/messages/create-message/%s",subject.principal(),thread);
	var edit=doc.select('.inbox-wrap .inbox-header .pill-edit');
	edit.attr('href',href);
	
	//打印消息,仅取出最新10条,然后倒序打印
	var cjql=String.format("select {'tuple':'*'}.sort({'tuple.ctime':-1}).limit(10).skip(0) from tuple cde.imessager.messages java.util.HashMap where {'tuple.thread':'%s'}",thread);
	var q=home.createQuery(cjql);
	var messages=q.getResultList();
	//全部的收件消息：sns.cde.inbox，收件人为当前主体用户+当前thread的所有记录移除，表明为已读了
	home.deleteDocs('sns.cde.inbox',String.format("{'tuple.recipients':'%s','tuple.message.data.thread':'%s'}",subject.principal(),thread));
	
	var table=doc.select('.message-table').first();
	table.attr('skip',messages.size());
	var rowotherli=table.select('.message-row-other').first().clone();
	var rowmeli=table.select('.message-row-me').first().clone();
	table.empty();
	for(var i=messages.size()-1;i>-1;i--){
		var msgdoc=messages.get(i);
		var msg=msgdoc.tuple();
		var row;
		if(msg.sender==subject.principal()){//为me
			row=rowmeli.clone();
			row.select('.title').html(msg.text);
			row.select('.timestamp').html(TimeUtil.time(msg.ctime));
		}else{//为other
			row=rowotherli.clone();
			row.select('.title').html(msg.text);
			row.select('.timestamp').html(TimeUtil.time(msg.ctime));
			var owner=portal.owner(msg.sender);
			var a=row.select('.user-image a');
			var href=String.format("/views/view-user.html?user=%s",msg.sender);
			a.attr('href',href);
			var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),msg.sender);
			a.select('img').attr('src',src);
			var a=row.select('.user-info .user-detail .username a');
			a.attr('href',href);
			a.html(msg.sender);
			row.select('.user-info .user-detail .name').html(owner.face().getMemoName());
		}
		
		table.append(row);
	}
	
	circuit.content().writeBytes(doc.toString().getBytes());
}

