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
var HashMap = Java.type('java.util.HashMap');
var System = Java.type('java.lang.System');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
var TupleDocument = Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine=imports.head.services.cdeEngine;
	var subject=ISubject.subject(frame);
	var portal=engine.portal();
	var home=engine.disk('$data.disk').home();
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var thread=params.thread;
	var text=params.text;
	var skip=params.skip;
	if(skip=='NaN'){
		return;
	}
	if(skip==null){
		skip=0;
	}
	//返回发送消息视图
	//打印消息,仅取出最新10条,然后倒序打印
	var cjql=String.format("select {'tuple':'*'}.sort({'tuple.ctime':-1}).limit(10).skip(%s) from tuple cde.imessager.messages java.util.HashMap where {'tuple.thread':'%s'}",skip,thread);
	var q=home.createQuery(cjql);
	var messages=q.getResultList();
	
	var doc = ctx.html("/users/i/thread.html", "utf-8");
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
	
	
	circuit.content().writeBytes(table.html().getBytes());
}
