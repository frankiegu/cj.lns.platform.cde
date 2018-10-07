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
var Comment=Java.type('cj.studio.cde.site.activity.Comment');
var ObjectHelper=Java.type('cj.studio.ecm.util.ObjectHelper');
var Field=Java.type('java.lang.reflect.Field');
var Face=Java.type('cj.lns.chip.sos.website.framework.Face');
exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var subject = ISubject.subject(frame);
	
	var site=engine.sosrssite();
	
	site.editBrief(subject.principal(),params.brief);
	
	var face=subject.face();
	var field = ObjectHelper.findField(Face.class, "briefing");
	field.setAccessible(true);
	try {
		field.set(face, params.brief);
	} catch (e) {
		throw new CircuitException('500',e);
	}
	
	
	
}
