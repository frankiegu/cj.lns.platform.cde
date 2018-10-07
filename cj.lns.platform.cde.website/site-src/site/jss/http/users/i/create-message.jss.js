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
var HashMap = Java.type('java.util.HashMap');
var System = Java.type('java.lang.System');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
var TupleDocument = Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/i/create-message.html", "utf-8");
	var module = frame.parameter('module');
	if (module == null) {
		throw new RuntimeException('未确定模块');
	}
	var engine=imports.head.services.cdeEngine;
	var portal=engine.portal();
	var subject=ISubject.subject(frame);
	//创建一个消息编组，其收件人为空。收件人为空的视为新消息
	//创建后由js端生成一个新的消息编组
	var home=engine.disk('$data.disk').home();
	var thread=frame.parameter('item');
	if(thread!=null&&thread!=''&&typeof thread!='undefined'){
		//如果有收件人则打印出来
		var cjql=String.format("select {'tuple':'*'} from tuple cde.imessager.recipients java.util.HashMap where {'tuple.thread':'%s'}",thread);
		var q=home.createQuery(cjql);
		var list=q.getResultList();
		var pillul=doc.select('.inbox-wrap .inbox-header .pillbox-list').first();
		var pillli=doc.select('.twitter-typeahead .users-hidden .pill').first().clone();
		pillul.empty();
		
		for(var i=0;i<list.size();i++){
			var t=list.get(i);
			var tuple=t.tuple();
			var li=pillli.clone();
			li.attr('user',tuple.recipient);
			li.append('<span class="remove-pill" title="移除此项">X</span>');
			var owner=portal.owner(tuple.recipient);
			li.select('.pill-name').html(tuple.recipient);
			li.select('.pill-nick').html(owner.face().getMemoName());
			pillul.append(li);
		}
		circuit.content().writeBytes(doc.toString().getBytes());
		return;
	}
	var map=new HashMap();
	map.ctime=System.currentTimeMillis();
	map.creator=subject.principal();
	var docid=home.saveDoc('cde.imessager.threads',new TupleDocument(map));
	map.id=docid;
	//打印一个新消息编组
	var idoc=ctx.html("/users/i/imessager.html", "utf-8");
	var printer=imports.head.services.printer;
	var newgroupview=printer.printNewThread(map,idoc.select('.imessager-ul .new-message').first());
	newgroupview.addClass('thread-selected');
	doc.select('.inbox-hidden').html(newgroupview);
	circuit.content().writeBytes(doc.toString().getBytes());
}
