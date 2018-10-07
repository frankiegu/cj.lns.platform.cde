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
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

exports.doPage = function(frame, circuit, plug, ctx) {
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var path=params.path;
	var usage=params.usage;
	var doc=exports.getHtml(path,usage,ctx);
	circuit.content().writeBytes(doc.toString().getBytes());
}
exports.getHtml=function(path,usage,ctx){
	if(typeof path=='undefined'||path==''||path==null){
		throw new CircuitException('404','缺少参数：path');
	}
	var doc = ctx.html("/views/parallel.html", "utf-8");
	var engine = imports.head.services.cdeEngine;
	var schema=engine.schema();
	var paras=schema.getParallels(path);
	printParallels(path,paras,usage,doc);
	return doc;
}
//usage=save时表示不要多选，否则使用多选
function printParallels(path,paras,usage,doc){
	var nav=doc.select('.m-nav');
	nav.attr('usage',usage);
	if(usage=='save'){
		doc.select('.m-nav .crumb .cat-ok').remove();
	}
	var groups=doc.select('.m-nav .group').first();
	var arow=groups.select('.row').first().clone();
	groups.empty();
	for(var i=0;i<paras.size();i++){
		var p=paras.get(i);
		var row=arow.clone();
//		if(typeof p.isMutiselect()!='undefined'&&p.isMutiselect()!=null){
//			row.attr('isMutiselect',p.isMutiselect());
//		}
//		if(usage=='save'||!p.isMutiselect()){//usage用于区分是前台查询还在编辑器中编辑时
		if(!p.isMutiselect()){
			row.select('.foot .switch-multi').remove();
		}
		
		row.attr('parallel',p.name);
		if(typeof p.tips!='undefined'&&p.tips!=null)
			row.attr('title',p.tips);
		row.select('.head .title').html(p.display);
		
		var map=p.map;
		var it=map.entrySet().iterator();
		var items=row.select('.body .items .items-inner').first();
		var aitem=items.select('.item').first().clone();
		items.empty();
		var t=0;
		while(it.hasNext()){
			var m=it.next();
			var item=aitem.clone();
			item.select('.text').html(m.getValue());
			var forit=String.format('%s-%s',p.name,t);
			item.select('.text').attr('for',forit);
			item.select('.icon-btn-check-small input').attr('id',forit);
			item.attr('key',m.getKey());
			item.attr('title',m.getKey());
			items.append(item);
			t++;
		}
		groups.append(row);
	}
}