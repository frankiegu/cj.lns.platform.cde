/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：
 * <![jss:{
		scope:'runtime',
		extends:'cj.lns.platform.cde.website.pages.IHeaderPrinter',
		isStronglyJss:true,
		filter:{
	 	}
 	},
 	services:{
 		graph:'cj.neuron.app',
 		engine:'cdeEngine'
 	}
 ]>
*/

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil=Java.type('cj.studio.ecm.net.web.WebUtil');
var Document=Java.type('org.jsoup.nodes.Document');
var File=Java.type('java.io.File');
var ArrayList=Java.type('java.util.ArrayList');
var FileHelper=Java.type('cj.ultimate.util.FileHelper');
var Gson=Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var AuthContext=Java.type('cj.lns.platform.cde.embed.auth.AuthContext');
var AccountMode=Java.type('cj.lns.platform.cde.embed.auth.AccountMode');
var Pattern=Java.type('java.util.regex.Pattern');
var Character=Java.type('java.lang.Character');
var Integer=Java.type('java.lang.Integer');
var CdeSubject=Java.type('cj.lns.platform.cde.embed.auth.CdeSubject');
var ISubject=Java.type('cj.lns.chip.sos.website.framework.ISubject');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');
var HashMap=Java.type('java.util.HashMap');
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');

exports.printHeader=function(doc,subject){
	var device=chip.site().getProperty('sns.device');
	if(device!=null){
		doc.select('.header-box').attr('device',device);
	}
	if(subject==null)return;
	doc.select('.header-box .contents .panel .op').remove();
	doc.select('.header-box .contents .panel .icons>li.header-dropdown-toggle[it=me]').attr('style','display:inline-block;');
	//doc.select('.header-box .contents .panel .icons>li.spliter').attr('style','display:inline-block;');
	var me=doc.select('#toggle-hamburger-me');
	var href='/users/'+subject.principal();
	me.attr('href',href);
	var msghref=String.format("/users/%s/messages",subject.principal());
	doc.select('#toggle-hamburger-messages').attr('href',msghref);
	var nhref=String.format('/users/%s/notifications/dynamic',subject.principal());
	doc.select('#toggle-hamburger-notify').attr('href',nhref);
	
	var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',subject.face().head,subject.principal());
	me.select('>img').attr('src',src);
	var myhome=String.format('/users/%s',subject.principal());
	doc.select('#myhome').attr('href',myhome);
	var settings=String.format('/users/%s/preferences/',subject.principal());
	doc.select('#settings').attr('href',settings);
	var moneybag=String.format('/users/%s/moneybag/',subject.principal());
	doc.select('#moneybag').attr('href',moneybag);
	var mycard=String.format('/users/%s/mycard/',subject.principal());
	doc.select('#mycard').attr('href',mycard);
	doc.select('#mycard img').attr('src',src);
	//清除列表
	doc.select('.message-header .message-ul').empty();
	
	printSwsList(doc,subject,imports.head.services.graph);
	printUsers(doc,subject);
}

var FollowType=Java.type('cj.lns.platform.cde.embed.contact.FollowType');

function printUsers(doc,subject){
	var spliter=doc.select('.contact-panel .c-spliter');
	var tuijiangul=doc.select('.contact-panel .tuijiang').first();
	if(subject==null){
		spliter.remove();
		tuijiangul.remove();
		return;
	}
	var member=tuijiangul.select('>li').first().clone();
	tuijiangul.empty();
	//求得最近浏览过当前主体的用户，且这些用户不是当前主体的联系人，以此为推荐，每次5个
	//getVisitsUsers
	var engine=imports.head.services.engine;
	var store=engine.store();
	var contacts=engine.contacts();
	var portal=engine.portal();
	var users=store.getVisitsUsers(subject.principal(),6,0);
	for(var i=0;i<users.size();i++){
		var u=users.get(i);
		var type=contacts.relationship(subject.principal(),u);
		if(type!=FollowType.none||'$anonymous'.equals(u)){
			continue;
		}
		var owner=portal.owner(u);

		var li=member.clone();
		var href=String.format('/users/%s/',owner.user());
		li.attr('href',href);
		li.attr('user',owner.user());
		li.select('>img').attr('src',String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),owner.user()));
		li.select('ul>li[name]').html(owner.user());
		li.select('ul>li[sign]').html(owner.face().getMemoName());
		
		li.select('.connect').attr('href','/views/guandu/connect-action.service');
		
		tuijiangul.append(li);
	}
}
var Frame =Java.type('cj.studio.ecm.frame.Frame');
var Circuit =Java.type('cj.studio.ecm.frame.Circuit');

function printSwsList(doc,subject,g){
	var out=g.out('output-rssite-db');
	var frame = new Frame(
			String.format("getAllSws /serviceOS/sws/owner/?userCode=%s&cjtoken=xxxx sos/1.0",
					subject.principal()));
	var circuit = new Circuit(String.format("sos/1.0 200 ok"));
	out.flow(frame, circuit);
	var cnt = circuit.content();
	if (cnt.readableBytes() > 0) {
		var back = new Frame(cnt.readFully());
		if (!"200".equals(back.head("status"))) {
			throw new CircuitException(back.head("status"),
					back.head("message"));
		}
		var json=new String(back.content().readFully());
		if(json==''||json==null){
			return;
		}
		var map=new Gson().fromJson(json,HashMap.class);
		var list=map.swsList;
		var ul=doc.select('.header-me-apps').first();
		var cli=ul.select('.header-me-app').first().clone();
		cli.attr('sws','');
		cli.removeAttr('settings');
		for(var i=0;i<list.size();i++){
			var sws=list.get(i);
			var li=cli.clone();
			var a=li.select('a');
			a.attr('id',sws.swsId);
			if(sws.description!=null){
			a.attr('title',sws.description);
			}
			var href='http://www.cjlns.com/?swsid='+sws.swsId+'&cjtoken=xxxx';
			a.attr('href',href);
			a.select('span').html(sws.name);
			var src=String.format('http://www.cjlns.com/resource/ud/%s?path=%s://system/faces/&u=%s',sws.faceImg,sws.swsId+'',subject.principal());
			a.select('img').attr('src',src);
			ul.append(li);
		}
	} else {
		throw new CircuitException("503", "远程服务器返回空的认证信息");
	}
}