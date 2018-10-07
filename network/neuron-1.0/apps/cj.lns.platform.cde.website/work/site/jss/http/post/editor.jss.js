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
 		cdeEngine:'cdeEngine',
 		catsitePrinter:'$.cj.jss.site.catsitePrinter'
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
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame,circuit, plug, ctx) {
	var subject = ISubject.subject(frame);
	var engine = imports.head.services.cdeEngine;
	var editor = ctx.html("/post/editor.html", "utf-8");
	var doc;
	if(!isAjax(frame)){
		var header = ctx.html("/global/header.html",'/', "utf-8");
		var device=chip.site().getProperty('sns.device');
		if(typeof device!='undefined'&&device!=null){
			header.select('.header-box').attr('device',device);
		}
		var buttons=editor.select('.pl-buttons');
		header.select('.panel').html(buttons.html());
		buttons.remove();
		var plhref=editor.select('.pl-href');
		plhref.select('a[drafts]').attr('href',String.format('/users/%s/activity/drafs',subject.principal()));
		plhref.select('a[publish]').attr('href',String.format('/users/%s/activity/topics',subject.principal()));
		header.select('.extra-info-wrapper>.channels').html(plhref.html());
		plhref.remove();
		doc = ctx.html("/template/second-template.html", "utf-8");
		
		doc.head().append(header.head().html());
		doc.head().append(editor.head().html());
		
		doc.body().select(">.main>.header").html(header.body().html());
		doc.body().select(">.main>.center").html(editor.body().html());
		
		
	}else{
		var plhref=editor.select('.pl-href');
		plhref.select('a[drafts]').attr('href',String.format('/users/%s/activity/drafs',subject.principal()));
		plhref.select('a[publish]').attr('href',String.format('/users/%s/activity/topics',subject.principal()));
		doc=editor;
	}
	var schema=engine.schema();
	printSites(schema,doc,ctx);
	
	var id=frame.parameter('id');
	if(!StringUtil.isEmpty(id)){
		
		var disk = engine.disk(subject.principal());
		var home=disk.home();
		printEditor(id,home,doc);
	}
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printSites(schema,doc,ctx){
	var sites=schema.list();
	var panel=doc.select('.ql-toolbar > .category-panel');
	var sitetabs=doc.select('.ql-toolbar > .category-panel > span[site]');
	var atab=sitetabs.first().clone();
	sitetabs.remove();
	var hiddenpanel=doc.body().select("#workbin>#sites");
	for(var i=0;i<sites.size();i++){
		var site=sites.get(i);
		var tab=atab.clone();
		tab.attr('site',site.name);
		if(site.tips!=''&&typeof site.tips!='undefined'){
			tab.attr('site.tips');
		}
		var sitehref=tab.select('a');
		sitehref.attr('href',String.format('/path/%s/',site.name));
		sitehref.attr('dpath',String.format('%s://',site.display));
		sitehref.attr('cat-level','0');
		sitehref.attr('target',site.target);
		sitehref.html(site.display);
		var printer = imports.head.services.catsitePrinter;
		var categorysite = printer.getHtml(site,ctx);
		doc.head().append(categorysite.head().html());
		hiddenpanel.append(categorysite.body().toString());
		
		panel.append(tab);
	}
	
	doc.select('.ql-toolbar > .category-panel .category-popup .category-wrap .category-settings span[address]').html('未选择发布路径');
}
function printEditor(id,home,doc){
	var cjql=String.format("select {'tuple':'*'} from tuple activity.drafts java.util.HashMap where {'_id':ObjectId('%s')}",id);
	var q=home.createQuery(cjql);
	var result=q.getSingleResult();
	if(result==null){
		throw new CircuitException('404','活动不存在，id:'+id);
	}
	var drafts=result.tuple();
	doc.select('#ember1111').html(drafts.title);
	doc.select('#ember1120 >.ql-editor').html(drafts.html);
	doc.select('#ember1120 >.ql-editor').attr('data-placeholder','');
	var span=doc.select('.header .contents .panel>span');
	span.attr('saved-id',id);
	
	var inner=doc.select('#ember1062').clone();
	inner.select('.cover-image__file-input').removeAttr('id');
	doc.select('#workbin #cover-region #ember89238').append(inner.html());
	
	
	if(StringUtil.isEmpty(drafts.coverimg)){
		var cover=doc.select('#ember1017 #ember1052');
		doc.select('#workbin').append(cover.clone());
		cover.remove();
		doc.select('#ember1226').attr('style','display:block;');
	}else{
		var ember=doc.select('#workbin #cover-region #ember1359').clone();
		doc.select('#ember1062').html(ember);
		doc.select('#ember1062 .cover-image__image').attr('style',drafts.coverstyle);
		doc.select('#ember1062 .cover-image__image').attr('docid',id);
	}
	
}