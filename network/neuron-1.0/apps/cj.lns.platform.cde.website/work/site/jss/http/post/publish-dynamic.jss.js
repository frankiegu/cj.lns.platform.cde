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

exports.doPage = function(frame, circuit, plug, ctx) {
	var subject = ISubject.subject(frame);
	var engine = imports.head.services.cdeEngine;
	var params=WebUtil.parserParam(new String(frame.content().readFully()));
	
	var datahome=engine.disk('$data.disk').home();
	var disk=engine.disk(subject.principal());
	var home=disk.home();
	
	var rssite=engine.sosrssite();
	var cjtoken=frame.session().id();
	
	var map=new HashMap();
	map.creator=subject.principal();
	map.text=params.text;
	
	copyPic(params.pic,home.fileSystem(),datahome.fileSystem());
	
	map.pic=params.pic;//要将图片从用户的临时空间考入
	map.ctime=System.currentTimeMillis();
	
	var docid=datahome.saveDoc('cde.dynamics',new TupleDocument(map));
	var contacts=engine.contacts();
	var followers=contacts.follower(map.creator);
	
	//推给自己一个
	var ownermap=new HashMap();
	ownermap.ptime=System.currentTimeMillis();//推送时间
	ownermap.sender=map.creator;//从哪来的
	ownermap.docid=docid;
	ownermap.reciever=map.creator;
	ownermap.readtime=0;//是否已读，0表示未读
	datahome.saveDoc('cde.dynamics.recievers',new TupleDocument(ownermap));
	
	new Thread(new Runnable() {
		
		run:function() {
			//推送动态到他的粉丝的存储空间
			for(var i=0;i<followers.size();i++){
				var follower=followers.get(i);
				if(follower.follower==subject.principal()){
					continue;
				}
				
				var hismap=new HashMap();
				hismap.ptime=System.currentTimeMillis();//推送时间
				hismap.sender=map.creator;//从哪来的
				hismap.docid=docid;
				hismap.reciever=follower.follower;
				hismap.state='unread';//readed已读，0表示未读
				datahome.saveDoc('cde.dynamics.recievers',new TupleDocument(hismap));
				//发出通知
				
				rssite.pushMessage(cjtoken,'activity',map.creator,docid,hismap);
			}
		}
	}).start();
}

var OpenMode=Java.type('cj.lns.chip.sos.cube.framework.OpenMode');
var JavaUtil=Java.type('cj.ultimate.util.JavaUtil');
function copyPic(pic,fs,datafs){
	var pic=String.format('/pictures/%s',pic);
	if(StringUtil.isEmpty(pic)){
		return;
	}
	if(!fs.existsFile(pic)){
		return;
	}
	var sfile=fs.openFile(pic,OpenMode.onlyOpen);
	var reader=sfile.reader(0);
	var dfile=datafs.openFile(pic);
	var writer=dfile.writer(0);
	var read=0;
	var buf=JavaUtil.createByteArray(10240);
	while((read=reader.read(buf,0,buf.length))>-1){
		writer.write(buf,0,read);
	}
	writer.close();
	reader.close();
}
