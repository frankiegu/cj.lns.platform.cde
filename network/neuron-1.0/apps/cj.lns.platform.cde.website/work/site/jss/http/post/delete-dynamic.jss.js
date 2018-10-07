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
var Thread=Java.type('java.lang.Thread');
var Runnable=Java.type('java.lang.Runnable');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

exports.doPage = function(frame, circuit, plug, ctx) {
	var subject = ISubject.subject(frame);
	var engine = imports.head.services.cdeEngine;
	var params=WebUtil.parserParam(new String(frame.content().readFully()));
	
	var datahome=engine.disk('$data.disk').home();
	
	var docid=params.docid;
	if(docid==null){
		throw new CircuitException('500','缺少标识');
	}
	
//	var contacts=engine.contacts();
//	var followers=contacts.follower(map.creator);
	//cde.dynamics.recievers
	var dyna=datahome.document('cde.dynamics',docid,HashMap.class);
	var tuple=dyna.tuple();
	var where=String.format("{'tuple.docid':'%s'}",docid);
	datahome.deleteDocs('cde.dynamics.recievers',where);
	
	datahome.deleteDoc('cde.dynamics',docid);
	//删除图片
	if(dyna!=null&&tuple.pic!=null){
		var pic=tuple.pic;
		var pic='/pictures/'+pic;
		var fs=datahome.fileSystem();
		if(fs.existsFile(pic)){
			var file=fs.openFile(pic);
			file.delete();
		}
	}
	//删除评论、赞、浏览记录
	var where=String.format("{'tuple.docid':'%s'}",docid);
	datahome.deleteDocs('cde.dynamics.comments',where);
	var where=String.format("{'tuple.docid':'%s'}",docid);
	datahome.deleteDocs('cde.dynamics.likes',where);
	var where=String.format("{'tuple.docid':'%s'}",docid);
	datahome.deleteDocs('cde.dynamics.views',where);
}

