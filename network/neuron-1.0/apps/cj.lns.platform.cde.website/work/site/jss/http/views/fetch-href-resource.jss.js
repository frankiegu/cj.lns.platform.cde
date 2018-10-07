/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：为编辑器作处理
 * <![jss:{
		scope:'runtime',
		extends:'',
		filter:{
	 	}
 	},
 	services:{
 		menu:"menuService",
 		cdeEngine:'cdeEngine',
 		htmlFetcher:'htmlFetcher'
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
var UUID = Java.type('java.util.UUID');
var Frame =Java.type('cj.studio.ecm.frame.Frame');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var htmlfetcher = imports.head.services.htmlFetcher;
	var subject = ISubject.subject(frame);
	var store=engine.store();
	var disk = engine.disk(subject.principal());
	var home=disk.home();
	var fetcher=engine.httpFetcher();
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	//get -u /news.163.com/16/1103/21/C4VPP7QM000189FH.html -t http/1.1 -Hcj-circuit-sync=true
	///news.163.com/
	var url=params.url;
	if(url.indexOf('http://')==0){
		url=url.substring("http://".length,url.length);
	}
	if(url.indexOf('www.')==0){
		url=url.substring('www.'.length,url.length);
	}
	if(url.charAt(0)!='/'){
		url=String.format('/%s',url);
	}
	if(url.lastIndexOf('.')<0&&url.charAt(url.length-1)!='/'){
		url=String.format('%s/',url);
	}
	var f=new Frame(String.format("get %s http/1.1",url));
	fetcher.fetch(f,circuit);
}
