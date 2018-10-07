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

exports.doPage = function(frame, circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var subject = ISubject.subject(frame);
	var disk = engine.disk(subject.principal());
	var home=disk.home();
	var store=engine.store();
	var id=params.id;
	var path=params.path;
	var parallels=params.parallels;
	var draft=getDraft(id,home);
	if(draft==null)return;
	var topic=publishDraft(draft,path,parallels,subject.principal(),store);
	delDraft(id,home);
	var rssite=engine.sosrssite();
	var cjtoken=frame.session().id();
	rssite.pushMessage(cjtoken,'platform',subject.principal(),topic.docid(),null);
	circuit.content().writeBytes(String.format("{\"user\":\"%s\"}",subject.principal()).getBytes());
}
function getDraft(id,home){
	var cjql="select {'tuple':'*'} from tuple activity.drafts java.util.HashMap where {'_id':ObjectId('?(id)')}";
	var q=home.createQuery(cjql);
	q.setParameter('id',id);
	var doc=q.getSingleResult();
	if(doc==null)return null;
	var tuple=doc.tuple();
	tuple.put('id',doc.docid());
	return tuple;
}
function publishDraft(draft,path,parallels,user,store){
//	var path='site.b2c://fuzhuang/nvzhuang/langyiqun';
//	var map={chima:'M',nianfenjijie:'2016年春季'};
	if(typeof parallels=='undefined'||parallels==null||parallels==''){
		parallels="{}";
	}
	var map=new Gson().fromJson(parallels, HashMap.class);
	return store.addDocument(path, user,-1,map, draft);
}
function delDraft(id,home){
	home.deleteDoc('activity.drafts',id);
}