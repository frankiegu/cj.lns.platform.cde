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
var Integer=Java.type('java.lang.Integer');
var TupleDocument=Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');
var StringUtil=Java.type('cj.ultimate.util.StringUtil');
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/views/activity_topic.html", "utf-8");
	var subject = ISubject.subject(frame);
	var user=frame.parameter('user');
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var owner=portal.owner(user);
//	var subject = ISubject.subject(frame);
	var store=engine.store();
	var schema=engine.schema();
	
	var limit=10;
	var skip=0;
	var skipparam=frame.parameter('skip');
	if(!StringUtil.isEmpty(skipparam)){
		skip=Integer.valueOf(skipparam);
	}
	
	var docs=store.ownerDocuments(user,limit,skip);
	
	printTopics(docs,doc,schema,user);
	
	if(skip>0){
		circuit.content().writeBytes(doc.select('#ember1688>tbody').html().getBytes());
	}else{
		circuit.content().writeBytes(doc.toString().getBytes());
	}
}
function printTopics(docs,view,schema,user){
	var table=view.select('#ember1688>tbody').first();
	table.attr('count',docs.size());
	table.attr('href',String.format("/users/%s/activity/topics",user));
	var otr=table.select('>tr').first().clone();
	table.empty();
	for(var i=0;i<docs.size();i++){
		var tr=otr.clone();
		var doc=docs.get(i);
		var topic=doc.document();
		var path=doc.path();
		var displaypath=schema.getDisplayPath(path.toString());
		var pos=displaypath.lastIndexOf('/');
		if(pos!=-1){
			var dname=displaypath.substring(pos+1,displaypath.length);
			if(!StringUtil.isEmpty(dname)){
				tr.select('.category .badge-category').html(dname);
				var cat=tr.select('.category');
				cat.attr('title',displaypath);
				cat.select('.bar').attr('href',String.format('/path/%s',path.toString().replace('://','/')));
			}
		}
		tr.attr('data-topic-id',doc.docid());
		var a=tr.select('.main-link .title');
		a.html(topic.title);
		a.attr('href',String.format('/topics/%s',doc.docid()));
		tr.select('.posts a span').html(doc.indicator().commentsCount);
		tr.select('.views span').html(doc.indicator().visitorsCount);
		tr.select('.likes span').html(doc.indicator().likesCount);
		tr.select('.connects span').html(doc.indicator().connectsCount);
		tr.select('.activity a span').html(TimeUtil.friendlyTime(doc.ltime()));
		tr.select('.activity a span').attr('title',TimeUtil.time(doc.ltime()));
		tr.select('.activity a').attr('href',String.format('/users/%s/activity/topics',doc.creator()));
		table.append(tr);
	}
}