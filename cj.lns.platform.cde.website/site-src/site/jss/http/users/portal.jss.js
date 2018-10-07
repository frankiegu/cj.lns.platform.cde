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
var WebUtil=Java.type('cj.studio.ecm.net.web.WebUtil');
var Document=Java.type('org.jsoup.nodes.Document');
var File=Java.type('java.io.File');
var ArrayList=Java.type('java.util.ArrayList');
var FileHelper=Java.type('cj.ultimate.util.FileHelper');
var Gson=Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var ISubject=Java.type('cj.lns.chip.sos.website.framework.ISubject');

function renderPortal(user,home,portal,owner){
	var panel=portal.select('.user-main .about .details .primary');
	panel.select('.primary-textual .username').html(user);
	var si=owner.face().getSignText();
	if(si!=null){
		panel.select('.primary-textual .full-name').html(si);
	}else{
		panel.select('.primary-textual .full-name').empty();
	}
	var hpic=owner.face().getHead();
	if(hpic!=null&&hpic!=''){
		var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',hpic,user);
		panel.select('.avatar').attr('src',src);
	}
	var a=panel.select('a');
	a.attr('href',String.format("/users/%s/activity/",user));
}
exports.doPage = function(frame,circuit, plug, ctx) {
	var engine = imports.head.services.cdeEngine;
	var user=frame.parameter('user');
	var portal=engine.portal();
	var owner=portal.owner(user);
//	var subject = ISubject.subject(frame);
	
	var user=frame.parameter('user');
	var disk = engine.disk(user);
	var home=disk.home();
	
	var menu=imports.head.services.menu;
	
	var header = ctx.html("/global/header.html",'/', "utf-8");
	var headerPrinter=imports.head.services.header;
	headerPrinter.printHeader(header,ISubject.subject(frame));
	var portal = ctx.html("/users/portal.html", "utf-8");
	
	renderPortal(user,home,portal,owner);
	var doc = ctx.html("/template/second-template.html", "utf-8");
	doc.head().append(header.head().html());
	doc.head().append(portal.head().html());
	doc.body().select(">.main>.header").html(header.body().html());
	doc.body().select(">.main>.center").html(portal.body().html());
	
//	var config=circuit.attribute('http.root')+File.separator+'config'+File.separator+'user.portal.menu.json';
//	var textarr=FileHelper.readFully(new File(config));
//	var text=new String(textarr);
//	var gson=new Gson();
//	var menu=gson.fromJson(text,ArrayList.class);
	
	printMenu(frame,menu,doc);
	circuit.content().writeBytes(doc.toString().getBytes());
}
function printMenu(frame,menubs,doc){
	var menu=menubs.getMenu();
	var engine=imports.head.services.cdeEngine;
	var portal=engine.portal();
	var owner=portal.owner(frame.parameter('user'));
	var subject=ISubject.subject(frame);
	
	var ul=doc.select('#ember914').first();
	var oli=ul.select('>li').last().clone();
	ul.empty();
	var hasactive=false;
	for(var i=0;i<menu.size();i++){
		var m=menu.get(i);
		if(m.hide){
			continue;
		}
		if(m.allow!=null){
			var allow=m.allow;
			if(allow.contains('$ownerOnly')){
				if(!owner.isOwner(subject)){
					continue;
				}
			}else{
				var isAllow=false;
				for(var j=0;j<allow.size();j++){
					var ace=allow.get(j);
					if(owner.hasRole(ace)){
						isAllow=true;
						break;
					}
				}
				if(!isAllow){
					continue;
				}
			}
		}
		var li=oli.clone();
		
		if(m.active){
			li.addClass('active');
			hasactive=true;
		}
		li.attr('id',m.id);
		var a=li.select('>a').first();
		a.html(m.name);
		var src=String.format('/users/%s/%s/',frame.parameter('user'),m.id);
		a.attr('href',src);
		ul.append(li);
	}
	var module=frame.parameter('module');
	if(module!=null){
		ul.select('>li.active').removeClass('active');
		var li=ul.select(String.format('#%s',module));
		li.addClass('active');
		var view=frame.parameter('view');
		var item=frame.parameter('item');
		if(view!=null){
			li.attr('activeview',view);
		}
		if(item!=null){
			li.attr('activeitem',item);
		}
	}else{
		if(!hasactive&&menu.size()>0){
			var li=ul.select('li[id='+menu.get(0).id+']');
			li.addClass('active');
		}
	}

}