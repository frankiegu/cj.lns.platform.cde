/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：关注，即建立连接，当前主体关注指定的目标用户
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
	var subject = ISubject.subject(frame);
	if(subject==null){
		throw new CircuitException('500','您没有登录');
	}
	var following=frame.parameter('following');
	if(following==null){
		throw new CircuitException('404','缺少关注目标');
	}
	if(subject.principal().equals(following)){
		throw new CircuitException('500','不能关注自已');
	}
	var engine = imports.head.services.cdeEngine;
	
	var contacts=engine.contacts();
	var type=contacts.follow(subject.principal(),following);
	
	circuit.content().writeBytes(String.format("{\"type\":\"%s\"}",type).getBytes());
}
