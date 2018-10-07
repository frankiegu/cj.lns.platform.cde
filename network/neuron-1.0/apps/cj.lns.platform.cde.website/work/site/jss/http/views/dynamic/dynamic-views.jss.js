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
var BsonDocument = Java.type('org.bson.Document');
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
	var doc = ctx.html("/views/dynamic/dynamic-views.html", "utf-8");
	var subject = ISubject.subject(frame);
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var docid=frame.parameter('docid');
	var home=engine.disk('$data.disk').home();
	var limit=10;
	var skip=0;
	var skip=frame.parameter('skip');
	if(StringUtil.isEmpty(skip)){
		skip="0";
	}
	
	printVisitors(skip,docid,home,doc,portal);
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printVisitors(skip,docid,home,doc,portal){
	var ul=doc.select('.visits-msg').first();
	var ali=ul.select('>li').first().clone();
	ul.empty();
	var limit=100000;
	var personCount=0;
	var totalTimes=0;
	var pipeline=new ArrayList();
	pipeline.add(BsonDocument.parse(String.format("{$match:{'tuple.docid':'%s'}}", docid)));
	pipeline.add(BsonDocument.parse(String.format("{$sort:{'tuple.ctime':-1}}")));
	pipeline.add(BsonDocument.parse(String.format("{$limit:%s}", limit)));
	pipeline.add(BsonDocument.parse(String.format("{$skip:%s}", skip)));
	//项名有可能不同，因此去掉
	pipeline.add(BsonDocument.parse(String.format("{$group:{'_id':{'user':'$tuple.user'},'id':{$first:'$_id'},'ctime':{$first:'$tuple.ctime'},'docid':{$first:'$tuple.docid'},'count':{$sum:1}}}")));
	var it=home.aggregate("cde.dynamics.views", pipeline).iterator();
	
	while(it.hasNext()){
		var li=ali.clone();
		var d=it.next();
		var duser=d._id.user;
		if(d.user=='$anonymous'){
			li.select('span[name]').html('匿名用户');
			li.select('img').attr('src','/img/user-default.svg');
		}else{
			li.select('span[name]').html(duser);
			var owner=portal.owner(duser);
			if(owner==null){
				continue;
			}
			var face=owner.face();
			li.select('img').attr('src',String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',face.getHead(),duser));
		}
		li.select('span[times]').html(String.format('%s',d.count));
		li.select('span[vtime]').html(TimeUtil.time(d.ctime));
		var href=String.format("/users/%s/notifications/dynamic",duser);
		li.select('>a').attr('href',href);
		ul.append(li);
		totalTimes+=d.count;
		personCount++;
	}
	doc.select('.visits-count span[count]').html(personCount+'&nbsp;人');
	doc.select('.visits-count span[times]').html(totalTimes+'&nbsp;次');
	
}