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
 		header:'$.cj.jss.site.header',
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
var FollowType=Java.type('cj.lns.platform.cde.embed.contact.FollowType');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame,circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var subject=ISubject.subject(frame);
	var render;
	var preferences = ctx.html("/users/preferences.html", "utf-8");
	if(!isAjax(frame)){
		var header = ctx.html("/global/header.html",'/', "utf-8");
		var headerPrinter=imports.head.services.header;
		
		headerPrinter.printHeader(header,subject);
		var doc = ctx.html("/template/second-template.html", "utf-8");
		doc.head().append(header.head().html());
		doc.body().select(">.main>.header").html(header.body().html());
		doc.head().append(preferences.head().html());
		doc.body().select(">.main>.center").html(preferences.body().html());
		render=doc;
	}else{
		render=preferences;
	}
	
	printPreferences(subject,render,engine);
	
	circuit.content().writeBytes(render.toString().getBytes());
}
function printPreferences(subject,render,engine){
	var portal=engine.portal();
	var owner=portal.owner(subject.principal());
	var faceimg=render.select('.face-img');
	faceimg.select(".sex").html(owner.face().isMale()?'男':'女');
	var href=String.format("/users/%s/",subject.principal());
	var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),subject.principal());
	faceimg.select('>label>img').attr('src',src);
	var facenames=render.select('.face-names');
	var username=facenames.select('>a[username]');
	username.attr('href',href);
	username.html(subject.principal());
	var memo=owner.face().getMemoName();
	if(memo==null){
		memo='';
	}
	facenames.select('input[nickname]').attr('value',memo);
	var sign=owner.face().getSignText();
	facenames.select('.face-sign textarea').html(sign==null?'':sign);
	var brief=owner.face().getBriefing();
	if(brief==null){
		brief='';
	}
	render.select('.prefer-panel .prefer-brief textarea').html(brief);
}