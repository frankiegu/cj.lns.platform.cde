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

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/i/imessager.html", "utf-8");
	var module = frame.parameter('module');
	if (module == null) {
		throw new RuntimeException('未确定模块');
	}
	var subject=ISubject.subject(frame);
	var engine=imports.head.services.cdeEngine;
	var home=engine.disk('$data.disk').home();
	printMessagerPortal(subject,doc,home,engine.portal());
	var menu = imports.head.services.menu.getItem(module);
	if (isAjax(frame)) {
		// 打印模块工具栏：当直接访问portal时并不知道模块，而当刷新模块时，portal知道了模块，故而才打印出来。
		// 而当在portal中ajax模块时，并不经过portal处理，故而不会打印工具栏，所以在此处理ajax时的工具栏
		var tools = menu.tools;
		if (typeof tools != 'undefined' && tools != '' && tools != null) {
			var json = new Gson().toJson(tools);
			json=json.replace('${user}',frame.parameter('user'));
			doc
					.append(String
							.format(
									"<tools id=\"tools-data\" module='%s' style='display:none;'>%s</tools>",
									module, json));
		}
	}
	
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printMessagerPortal(subject,doc,home,portal){
	doc.select('.imessager').attr('user',subject.principal());
	//列出消息编组，编组包括两种类型：新编组和稳定编组，其中的新编组是没有收件人的编组，客户端打开时是create-message视图
	var printer=imports.head.services.printer;
	var ul=doc.select('.imessager-ul').first();
	var newmsgli=ul.select('>.imessager-li.new-message').first().clone();
	var viewmsgli=ul.select('>.imessager-li.view-message').first().clone();
	ul.empty();
	//我的thread列表是：我是收件人的所有编组+我创建的编组。注：我创建的编组中的收件人肯定没我
	//thread结构是：创建者／收件人集合
	var user=subject.principal();
	var cjql=String.format("select {'tuple.thread':1} from tuple cde.imessager.recipients java.util.HashMap where {'tuple.recipient':'%s'}",user);
	var q=home.createQuery(cjql);
	var list=q.getResultList();
	var threads=new ArrayList();
	for(var i=0;i<list.size();i++){
		var t=list.get(i);
		var tuple=t.tuple();
		threads.add(String.format("ObjectId('%s')",tuple.thread));
	}
	var cjql=String.format("select {'tuple':'*'}.sort({'tuple.ctime':-1}) from tuple cde.imessager.threads java.util.HashMap where {'$or':[{'_id':{'$in':%s}},{'tuple.creator':'%s'}]}",threads,user);
	var q=home.createQuery(cjql);
	var all=q.getResultList();
	
	//对于我创建的thread的像采用第一个收件人,如果为空收件人则表示为新建thread，对于非我创建的采用创建人作为thread头像
	for(var i=0;i<all.size();i++){
		var t=all.get(i);
		var tuple=t.tuple();
		var threadid=t.docid();
		tuple.id=threadid;
		var ismine=!threads.contains(threadid);
		 cjql=String.format("select {'tuple':'*'} from tuple cde.imessager.recipients java.util.HashMap where {'tuple.thread':'%s'}",threadid);
		 q=home.createQuery(cjql);
		 var recipients=q.getResultList();
		 var nli=newmsgli.clone();
		 var vli=viewmsgli.clone();
		 cjql=String.format("select {'tuple':'*'}.sort({'tuple.ctime':-1}).limit(1) from tuple cde.imessager.messages java.util.HashMap where {'tuple.thread':'%s'}",threadid);
		 q=home.createQuery(cjql);
		 var firstmsg=q.getSingleResult();
		 
		if(ismine){
			if(recipients.isEmpty()){//表示为新建thread
				var newgroupview=printer.printNewThread(tuple,nli);
				ul.append(newgroupview);
			}else{//采用第一个收件人作为头偈
				var owner=portal.owner(tuple.creator);
				var groupview=printer.printFixedThread(tuple,owner,recipients,vli,firstmsg,threadid,subject.principal());
				ul.append(groupview);
			}
		}else{//不是我的一定是存在收件人的，采用创建者作为头像
			var owner=portal.owner(tuple.creator);
			var groupview=printer.printFixedThread(tuple,owner,recipients,vli,firstmsg,threadid,subject.principal());
			ul.append(groupview);
		}
	}
}
