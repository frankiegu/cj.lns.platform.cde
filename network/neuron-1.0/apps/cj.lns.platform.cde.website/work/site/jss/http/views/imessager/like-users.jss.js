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
var FollowType=Java.type('cj.lns.platform.cde.embed.contact.FollowType');

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/views/view-user.html", "utf-8");
	var subject = ISubject.subject(frame);
	var engine = imports.head.services.cdeEngine;
	var site=engine.sosrssite();
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	
	var list=site.likeUserNames(params.keywords+'%',10,0);
	
	var json=new Gson().toJson(list);
	circuit.content().writeBytes(json.getBytes());
}
