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
	var doc = ctx.html("/views/guandu/comments.html", "utf-8");
	var subject = ISubject.subject(frame);
	var user=frame.parameter('user');
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var docid=frame.parameter('docid');
	var store=engine.store();
	var schema=engine.schema();
	
	var limit=10;
	var skip=0;
	var skip=frame.parameter('skip');
	if(StringUtil.isEmpty(skip)){
		skip="0";
	}
	
	printComments(skip,docid,store,doc,portal,subject);
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printComments(skip,docid,store,doc,portal,subject){
	var ul=doc.select('.comments-msg').first();
	var ali=ul.select('>li').first().clone();
	ul.empty();
	var limit=10000000;
	var personCount=0;
	var totalTimes=0;
	var data=store.commentsGroupByUser(docid,limit,skip);
	var ismyfollow=false;//当前主题是否对它有关注，如果已关注则显示为取消关注，否则为已关注
	var op=doc.select('.comments .op');
	for(var i=0;i<data.size();i++){
		var li=ali.clone();
		var d=data.get(i);
		if(d.user=='$anonymous'){
			li.select('span[name]').html('匿名用户');
			li.select('img').attr('src','/img/user-default.svg');
		}else{
			li.select('span[name]').html(d.user);
			var owner=portal.owner(d.user);
			if(owner==null){
				continue;
			}
			if(subject==null){
				op.remove();
				ismyfollow=true;
			}else{
				if(subject.principal()==d.user){
					ismyfollow=true;
				}
			}
			var face=owner.face();
			li.select('img').attr('src',String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',face.getHead(),d.user));
		}
		li.select('span[times]').html(String.format('%s',d.count));
		li.select('span[vtime]').html(TimeUtil.time(d.ctime));
		ul.append(li);
		totalTimes+=d.count;
		personCount++;
	}
	if(ismyfollow){
		op.html('已关注');
		op.attr('followed','followed');
	}
	if(subject==null){
		op.attr('style','display:none;');
	}
	doc.select('.comments-count span[count]').html(personCount+'&nbsp;人');
	doc.select('.comments-count span[times]').html(totalTimes+'&nbsp;条');
}