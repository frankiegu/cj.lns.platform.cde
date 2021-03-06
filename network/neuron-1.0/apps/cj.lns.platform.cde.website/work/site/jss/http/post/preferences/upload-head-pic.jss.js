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
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');
var UUID = Java.type('java.util.UUID');
var ObjectHelper=Java.type('cj.studio.ecm.util.ObjectHelper');
var Field=Java.type('java.lang.reflect.Field');
var Face=Java.type('cj.lns.chip.sos.website.framework.Face');

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var subject = ISubject.subject(frame);
	var store=engine.store();
	var disk = engine.disk(subject.principal());
	var home=disk.home();
	var site=engine.sosrssite();
	
	var type = frame.head('Content-Type');
	var boundary = type.substring(type.indexOf('boundary=') + 9, type.length);
	var data = frame.content().readFully();
	var fd = new FormData();
	fd.load(data,  boundary);
	var p = {};
	for (var i = 0; i < fd.size(); i++) {
		var f = fd.get(i);
		if (f.isFile()) {
			p.file = f;
			continue;
		}
		p[f.getName()] = new String(f.data());
	}
	saveDisk(p,subject,circuit,home,site);
	
}
function saveDisk(p,subject,circuit,cube,site){
	var f=p.file;
	var fn=f.filename();
	if(fn.startsWith('/')){
		fn=fn.substring(1,fn.length);
	}
	var fs=cube.fileSystem();
	var dir=fs.dir('/system/img/faces/');
	if(!dir.exists()){
		dir.mkdir('我的头像');
	}
	var file=fs.openFile('/system/img/faces/'+fn);
	var writer=file.writer(0);
	writer.write(f.data());
	writer.close();
	site.editHeadPic(subject.principal(),fn);
	
	var face=subject.face();
	var field = ObjectHelper.findField(Face.class, "head");
	field.setAccessible(true);
	try {
		field.set(face, fn);
	} catch (e) {
		throw new CircuitException('500',e);
	}
	var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces/&u=%s",fn,subject.principal());
	circuit.content().writeBytes(String.format("{\"src\":\"%s\",\"old\":\"%s\",\"fn\":\"%s\"}",src,f.filename(),fn).getBytes());
}