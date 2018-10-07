/*
 * 创建：2016.0829
 * 作者：
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
var StringBuilder=Java.type('java.lang.StringBuilder');
var TimeUtil=Java.type('cj.studio.cde.site.util.TimeUtil');
var Visitor=Java.type('cj.studio.cde.site.activity.Visitor');
var ConnectType=Java.type('cj.studio.cde.site.activity.ConnectType');

function isAjax(f) {
	return "XMLHttpRequest".equals(f.head("X-Requested-With"));
}
exports.doPage = function(frame,circuit, plug, ctx) {
	var engine=imports.head.services.cdeEngine;
	var subject=ISubject.subject(frame);
	var docid=frame.parameter('id');
	if(StringUtil.isEmpty(docid)){
		throw new CircuitException('404','未知打开目标');
	}
	var topic = ctx.html("/topics/topic.html", "utf-8");
	var doc;
	if(!isAjax(frame)){
		var header = ctx.html("/global/header.html",'/', "utf-8");
		var headerPrinter=imports.head.services.header;
		headerPrinter.printHeader(header,ISubject.subject(frame));
		header.select('.channels').remove();
		doc = ctx.html("/template/second-template.html", "utf-8");
		doc.head().append(header.head().html());
		doc.head().append(topic.head().html());
		doc.body().select(">.main>.header").html(header.body().html());
		doc.body().select(">.main>.center").html(topic.body().html());
		
	}else{
		doc=topic;
	}
	render(doc);
	
	printTopic(docid,engine,doc,subject);
	
	circuit.content().writeBytes(doc.toString().getBytes());
}
function visitit(docid,user,store){
	var visitor=new Visitor();
	visitor.user=user;
	visitor.docid=docid;
	visitor.ctime=System.currentTimeMillis();
	store.visitorit(docid,visitor);
}
function render(doc){
	var center=doc.select('.main>.center');
	center.removeClass('wrap');
	center.attr('style','padding-top:63px;');
	doc.select('#ember3278').select('>div').addClass('wrap');
	doc.select('#ember3278').select('>div.cover-img').removeClass('wrap');
}
function printAuthor(creator,panel,engine){
	var portal=engine.portal();
	var owner=portal.owner(creator);
	var a=panel.select('>p[name]>a');
	a.html(creator);
	var userportal=String.format('/users/%s/',creator);
	a.attr('href',userportal);
	panel.select('>p[jishao]').append(String.format('%s',owner.face().getSignText()));
	panel.select('>p[sex]').html(String.format('%s',owner.face().isMale()?'男':'女'));
	var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),creator);
	panel.select('>a[img]>img').attr('src',src);
	panel.select('>a[img]').attr('href',userportal);
}
function  printTopic(docid,engine,doc,subject){
	var store=engine.store();
	var schema=engine.schema();
	var sd=store.document(docid);
	if(StringUtil.isEmpty(docid)){
		throw new CircuitException('404','主题不存在：	'+docid);
	}
	
	var entity=sd.document();
	doc.head().select('title').html(entity.title);
	if(subject!=null){
		if(subject.principal()!=sd.creator()){
			visitit(sd.docid(),subject.principal(),store);
		}
	}else{
		visitit(sd.docid(),'$anonymous',store);
	}
	doc.select('#topic').attr('data-topic-id',sd.docid());
	
	var path=sd.path();
	var phypath=path.toString();
	var displaypath=schema.getDisplayPath(phypath);
	var relpath=phypath.replace('://','/');
	var pos=displaypath.lastIndexOf('/');
	if(pos!=-1){
		var dname=displaypath.substring(pos+1,displaypath.length);
		if(!StringUtil.isEmpty(dname)){
			var a=doc.select('.badge-wrapper.bar span.badge-category[path] a');
			a.html(dname);
			var pathurl=String.format('/path/%s',relpath);
			a.attr('href',pathurl);
			doc.select('.badge-wrapper.bar span.badge-category[path]').attr('title',displaypath);
		}
	}
	
	var paras=sd.parallels();
	if(typeof paras!='undefined'&&paras!=null&&!paras.isEmpty()){
		var itpara=paras.entrySet().iterator();
		var cellhref='';
		var parabox=doc.select('.badge-wrapper.bar span.badge-category[parallels]');
		var ahref=parabox.select('>a').first().clone();
		parabox.empty();
		var t=0;
		while(itpara.hasNext()){
			var a=ahref.clone();
			var en=itpara.next();
			var catp=schema.getParallels(phypath,en.getKey());
			if(en.getValue() instanceof ArrayList){
				var value='[';
				var kvalue='[';
				for(var j=0;j<en.getValue().size();j++){
					var v=en.getValue().get(j);
					var cvdisplay=catp.map.get(v);
					value+=v+',';
					kvalue+=cvdisplay+',';
				}
				if(value.endsWith(',')){
					value=value.substring(0,value.length-1);
				}
				value+=']';
				if(kvalue.endsWith(',')){
					kvalue=kvalue.substring(0,kvalue.length-1);
				}
				kvalue+=']';
				a.html(catp.display+':'+kvalue)
				var href=String.format('/path/%s/%s:%s;',relpath,en.getKey(),value);
				a.attr('href',href);
				cellhref+=String.format('%s:%s;',en.getKey(),kvalue);
			}else{
				a.html(catp.display+':'+catp.map.get(en.getValue()))
				var href=String.format('/path/%s/%s:%s;',relpath,en.getKey(),en.getValue());
				a.attr('href',href);
				cellhref+=String.format('%s:%s;',en.getKey(),en.getValue());
			}
			
			if(t<paras.size()-1){
				parabox.append(a+',');
			}else{
				parabox.append(a);
			}
			
			t++;
		}
		if(paras.size()>=2){
			var cellhref=String.format('/path/%s/%s',relpath,cellhref);
			var a=ahref.clone();
			a.html('同类单元');
			a.attr('href',cellhref);
			parabox.append('&gt;'+a);
		}
	}else{
		doc.select('.badge-wrapper.bar >label').remove();
		doc.select('.badge-wrapper.bar span.badge-category[parallels]').remove();
	}
	
	printAuthor(sd.creator(),doc.select('#ember-face-box>.ember-face'),engine);
	
	var title=doc.select('#topic-title .title-wrapper .fancy-title');
	title.attr('href',String.format('/topics/%s',sd.docid()));
	title.html(String.format('%s',entity.title));
	if(!StringUtil.isEmpty(entity.coverstyle)){
		doc.select('#ember3278 .cover-img #ember3281').attr('style',String.format('%s',entity.coverstyle));
	}else{
		doc.select('#ember3278 .cover-img #ember3281').attr('style','display:none;');
		doc.select('#ember-face-box > .ember-face').attr('style','border-bottom:1px solid gold;');
	}
	var art=doc.select('#ember3278 .posts .row #topic #ember3538 .topic-main');
	art.select('article.boxed .topic-body .contents').html(entity.html);
	
	art.select('.topic-body .names i').html(String.format('&nbsp;(%s)',sd.indicator().visitorsCount));
	var a=art.select('.topic-body .ltime a');
	a.attr('href',String.format('/users/%s/activity/topics',sd.creator()));
	var tspan=a.select('.relative-date');
	tspan.attr('title',String.format("最近活动时间：%s", TimeUtil.time(sd.ltime())));
	tspan.html(String.format("%s", TimeUtil.friendlyTime(sd.ltime())));
	art.select('.topic-body .ctime a').attr('title',String.format("创建时间：%s", TimeUtil.time(sd.ctime())));
	art.select('.topic-body .utime a').attr('title',String.format("最近更新时间：%s", TimeUtil.time(sd.utime())));
	
	var visita=art.select('.topic-body .names .first a');
	visita.attr('href',String.format('/views/guandu/visits/?docid=%s',sd.docid()));
	
	var ctrls=doc.select('.topic-timeline');
	ctrls.attr('docid',String.format('%s',sd.docid()));
	
	var commonscount=store.commentCount(sd.docid());
	var comments=ctrls.select('button[aria-action=\"comments-hits\"]');
	comments.select('span').html(commonscount);
	
	var followscount=store.followCount(sd.docid());
	var follows=ctrls.select('button[aria-action=\"follow-hits\"]');
	follows.select('span').html(followscount);
	
	var likescount=store.likesCount(sd.docid());
	var likes=ctrls.select('button[aria-action=\"like-hits\"]');
	likes.select('span').html(likescount);
	
	var footerlikes=doc.select('.timeline-container .topic-timeline .timeline-footer-likes');
	var likesmore=footerlikes.select('.notification-options');
	if(subject==null){
		likesmore.attr('style','border:none;');
		doc.select('#topic .topic-reply').remove();
	}else{
		if(store.likesCount(sd.docid(),subject.principal())>0){
			likesmore.attr('style','border:1px solid #999');
			likesmore.attr('liked','liked');
		}else{
			likesmore.attr('style','border:none;');
		}
	}
	//连接数
	doc.select('.timeline-container .topic-timeline .link-button > span[number]').html(sd.indicator().connectsCount);
	printTimeline(sd.docid(),doc.select('.timeline-container .topic-timeline .timeline-padding > ul').first(),store);
	printLikesFive(sd.docid(),store,footerlikes,engine);
	
	printThreads(sd.docid(),store,doc.select('#ember3538>.post-stream').first(),engine,subject);
}
function printTimeline(docid,ul,store){
	var ali=ul.select('>li').first().clone();
	ul.empty();
	var list=store.connects(docid,ConnectType.connect,100,0);
	for(var i=0;i<list.size();i++){
		var c=list.get(i);
		var li=ali.clone();
		li.attr('connectid',c.id);
		var a=li.select('a');
		a.html(c.title);
		a.attr('href',String.format('%s',c.source));
		a.attr('target','_blank');
		li.attr('title',String.format('接入者：%s 来源：%s',c.user,c.source));
		ul.append(li);
	}
}
function printComments(thread,docid,store,e,engine,subject){
	var list=store.commentsForum(docid,thread,100000,0);
	var ul=e.select('.thread-discuss-ul').first();
	var copyli=ul.select('>li').first().clone();
	ul.empty();
	for(var i=0;i<list.size();i++){
		var comment=list.get(i);
		var li=copyli.clone();
		li.attr('commentid',comment.id);
		var master=li.select('a[master]');
		var path=String.format('/views/view-user.html?user=%s',comment.user);
		master.attr('master',comment.user);
		master.attr('href',path);
		master.html(comment.user);
		var follow=li.select('a[follow]');
		if(comment.tosomeone==null||typeof comment.tosomeone=='undefined'){
			follow.remove();
		}else{
			if(comment.tosomeone==comment.user){
				follow.remove();
			}else{
				follow.attr('follow',comment.tosomeone)	;
				var href=String.format('/views/view-user.html?user=%s',comment.tosomeone);
				follow.attr('href',href);
				follow.html(comment.tosomeone)	;
			}
		}
		li.select('span[content]').html(new String(comment.content));
		
		if(subject==null){
			li.select('span[reply]').remove();
			li.select('span[del]').remove();
		}else{
			if(comment.user!=subject.principal()){
				li.select('span[del]').remove();
			}
		}
		ul.append(li);
	}
}
function printThreads(docid,store,streamE,engine,subject){
	var portal=engine.portal();
	var follows=streamE.select('.topic-follow');
	var one=follows.first().clone();
	follows.remove();
	var list=store.comments(docid,'-1',10,0);
	for(var i=0;i<list.size();i++){
		var comment=list.get(i);
		var follow=one.clone();
		
		printComments(comment.id,comment.docid,store,follow,engine,subject);
		
		follow.select('.topic-body .contents .cooked').html(new String(comment.content));
		follow.attr('commentid',comment.id)	;
		follow.attr('thread-user',comment.user);
		
		var name=follow.select('.names span a');
		var path=String.format('/views/view-user.html?user=%s',comment.user);
		name.attr('href',path);
		name.html(comment.user);
		var card=follow.select('.trigger-user-card');
		card.attr('href',path);
		card.attr('data-user-card',comment.user);
		var img=card.select('img');
		img.attr('title',comment.user);
		var owner=portal.owner(comment.user);
		var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),comment.user);
		img.attr('src',src);
		
		var postdate=follow.select('.post-date');
		var href=String.format("/users/%s/activity/topics/",comment.user);
		postdate.attr('href',href);
		postdate.attr('data-share-url',href);
		
		var relaspan=postdate.select('.relative-date');
		var ctime=comment.ctime;
		relaspan.attr('title','发布时间：'+TimeUtil.time(ctime));
		relaspan.attr('data-time',ctime+'');
		relaspan.html(TimeUtil.friendlyTime(ctime));
		
		if(subject==null){
			follow.select('.topic-thread-del').remove();
			follow.select('.thread-discuss textarea').remove();
		}else{
			if(comment.user!=subject.principal()){
				follow.select('.topic-thread-del').remove();
			}
		}
		streamE.append(follow);
	}
}
function printLikesFive(docid,store,footerlikes,engine){
	var lis=footerlikes.select('a[data-user-card]');
	var portal=engine.portal();
	var ali=lis.first().clone();
	lis.remove();
	var list=store.likes(docid,5,0);
	for(var i=0;i<list.size();i++){
		var like=list.get(i);
		var li=ali.clone();
		li.attr('data-user-card',like.user);
		li.attr('title',like.user)	;
		li.attr('href',String.format('/views/view-user.html?user=%s',like.user));
		var owner=portal.owner(like.user);
		var src=String.format('http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s',owner.face().getHead(),like.user);
		li.select('img').attr('src',src);
		footerlikes.append(li);
	}
}