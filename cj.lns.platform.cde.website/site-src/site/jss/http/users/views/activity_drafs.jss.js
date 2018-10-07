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

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var doc = ctx.html("/users/views/activity_drafs.html", "utf-8");
	var user=frame.parameter('user');
	var portal=engine.portal();
	var owner=portal.owner(user);
	var subject = ISubject.subject(frame);
	var disk = engine.disk(user);
	var home=disk.home();
	var skip=frame.parameter('skip');
	if(StringUtil.isEmpty(skip)){
		skip="0";
	}
	if(owner.isOwner(subject)){
		printTopics(user,home,doc,skip);
	}else{
		doc.select('#ember1688>tbody').empty();
	}
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printTopics(user,home,doc,skip){
	var cjql=String.format("select {'tuple':'*'}.limit(10).skip(%s).sort({'tuple.ctime':-1}) from tuple activity.drafts java.util.HashMap where {'tuple.creator':'%s'}",skip,user);
	var q=home.createQuery(cjql);
	var list=q.getResultList();
	var table=doc.select('#ember1688>tbody').first();
	var ctr=table.select('tr').first().clone();
	table.empty();
	for(var i=0;i<list.size();i++){
		var doc=list.get(i);
		var draft=doc.tuple();
		var tr=ctr.clone();
		tr.attr('data-topic-id',doc.docid());
		var a=tr.select('.title');
		a.html(draft.title);
		var href=String.format('/post/editor.html?id=%s',doc.docid());
		a.attr('href',href);
		tr.select('.heatmap-it a').attr('href',href);
		tr.select('.ctime span').html(TimeUtil.time(draft.ctime));
		table.append(tr);
	}
}