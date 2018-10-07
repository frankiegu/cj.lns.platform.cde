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
var StringBuilder=Java.type('java.lang.StringBuilder');
var BsonDocument=Java.type('org.bson.Document');
var Integer=Java.type('java.lang.Integer');

exports.doPage = function(frame, circuit, plug, ctx) {
	var doc = ctx.html("/users/views/dynamic.html", "utf-8");
	var subject = ISubject.subject(frame);
	var user=frame.parameter('user');
	var engine = imports.head.services.cdeEngine;
	var portal=engine.portal();
	var owner=portal.owner(user);
	var home=engine.disk('$data.disk').home();
	
	var limit=10;
	var skip=0;
	var skipparam=frame.parameter('skip');
	if(!StringUtil.isEmpty(skipparam)){
		skip=Integer.valueOf(skipparam);
	}
	//要改为从自己的空间取出
	//其它用户只能看到当前框架所有人发布的动态，而框架所有人能看到他的所有动态
	//删除方案：设一个垃圾箱表，删除后均放垃圾箱，在查询时如果发现垃圾箱有，则删除粉丝表中的相应动态。查询按正常的查，因为docid不存在不会被取出
	var cjql='';
	var filter=frame.parameter('filter');
	if('mine'.equals(filter)||subject==null||!subject.principal().equals(user)){
		cjql=String.format("select {'tuple':'*'}.sort({'tuple.ptime':-1}).limit(%s).skip(%s) from tuple cde.dynamics.recievers java.util.HashMap where {'tuple.sender':'%s'}",limit,skip,user)	;
	}else{
		cjql=String.format("select {'tuple':'*'}.sort({'tuple.ptime':-1}).limit(%s).skip(%s) from tuple cde.dynamics.recievers java.util.HashMap where {'tuple.reciever':'%s'}",limit,skip,user)	;
	}
	var myq=home.createQuery(cjql);
	var mylist=myq.getResultList();
	
	//拼成in格式
	var sb=new ArrayList();
	for(var i=0;i<mylist.size();i++){
		var item=mylist.get(i);
		var tuple=item.tuple();
		sb.add(String.format("ObjectId('%s')",tuple.docid));
	}
	var cjql=String.format("select {'tuple':'*'}.sort({'tuple.ctime':-1}) from tuple cde.dynamics java.util.HashMap where {'_id':{$in:%s}}",sb.toString())	;
	var q=home.createQuery(cjql);
	var list=q.getResultList();
	//更新接收为已读
	var filter=String.format("{'tuple.reciever':'%s','tuple.state':'unread'}",user);
	var update=String.format("{$set:{'tuple.state':'readed'}}");
	home.updateDocs('cde.dynamics.recievers',BsonDocument.parse(filter),BsonDocument.parse(update));
	
	if(subject==null||subject.principal()!=user){
		doc.select('.tool-bar').remove();
	}else{
		doc.select('.tool-bar').attr('refresh',String.format("/users/%s/notifications/dynamic?filter=%s",user,filter));
	}
	var ul=doc.select('.dynamic > .dynamic-wrap > .dynamic-info>.dynamic-info-ul').first();
	ul.attr('count',list.size());
	var direct='';
	if('mine'==frame.parameter('filter')){
		direct=String.format("/users/%s/notifications/home",user);
	}else{
		direct=String.format("/users/%s/notifications/dynamic",user);
	}
	ul.attr('href',direct);
	var dli=ul.select('>.dynamic-info-li').first().clone();
	ul.empty();
	for(var i=0;i<list.size();i++){
		var item=list.get(i);
		var tuple=item.tuple();
		//谁取出就是谁浏览了
		if(subject!=null&&subject.principal()!=tuple.creator){
			var logger=new HashMap();
			logger.ctime=System.currentTimeMillis();
			logger.user=subject.principal();
			logger.docid=item.docid();
			home.saveDoc('cde.dynamics.views',new TupleDocument(logger));
		}
		var li=dli.clone();
		if(subject==null||subject.principal()!=user||subject.principal()!=tuple.creator){
			li.select('.delete').remove();
		}
		li.attr('docid',item.docid());
		li.select('.info-body > .text-entity p').html(tuple.text);
		var img=li.select('.info-body > .shared-image');
		if(StringUtil.isEmpty(tuple.pic)){
			img.remove();
		}else{
			var imga=img.select('a');
			var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://pictures&u=$data.disk",tuple.pic);
			imga.attr('href',src);
			imga.attr('target','_blank');
			img.select('img').attr('src',src);
		}
		var face=li.select('.info-face');
		var facehref=face.select('a');
		var href=String.format("/users/%s/notifications/dynamic",tuple.creator);
		facehref.attr('href',href);
		var sender=portal.owner(tuple.creator);
		var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",sender.face().getHead(),tuple.creator);
		facehref.select('img').attr('src',src);
		var time=TimeUtil.friendlyTime(tuple.ctime);
		face.select('.timestamp span').html(time);
		
		var header=li.select('.info-body > .header');
		header.select('.headline .nick').html(sender.face().getMemoName());
		var headerhref=header.select('.headline .name');
		headerhref.attr('href',String.format("/views/view-user.html?user=%s",tuple.creator));
		headerhref.html(tuple.creator);
		var headertitle=header.select('.title-container .title');
		headertitle.removeAttr('href');
		headertitle.html(sender.face().getSignText()==null?"":sender.face().getSignText());
		
		//打印辅助
		var where=String.format("{'tuple.docid':'%s'}",item.docid());
		var viewscount=home.tupleCount('cde.dynamics.views',where);
		li.select('.info-body .meta span').html(viewscount);
		li.select('.info-body .meta .views').attr('href',String.format("/views/dynamic/dynamic-views.html?docid=%s",item.docid()));
		var actions=li.select('.info-body > .actions');
		if(subject==null){
			actions.select('>li').remove();
			li.select('.comment-box textarea').remove();
			li.select('.comment-list .comment-thread .thread-actions button').html("<span>&nbsp;</span>");
		}else{
			var where=String.format("{'tuple.docid':'%s','tuple.user':'%s'}",item.docid(),subject.principal());
			var count=home.tupleCount('cde.dynamics.likes',where);
			actions.select('.like').attr('like',count>0?'liked':'unliked');
			actions.select('.like span[aria-hidden]').html(count>0?'取消赞':'赞');
		}
		var where=String.format("{'tuple.docid':'%s'}",item.docid());
		var count=home.tupleCount('cde.dynamics.likes',where);
		var likes=li.select('.info-body > .likes');
		likes.select('.count span[aria-hidden]').html(count);
		
		var where=String.format("{'tuple.docid':'%s'}",item.docid());
		var count=home.tupleCount('cde.dynamics.comments',where);
		var comments=li.select('.info-body > .comments');
		comments.select('.count span[aria-hidden]').html(count);
		
		//打印评论
		var cjql=String.format("select {'tuple':'*'}.sort({'tuple.ctime':1,'tuple.thread':1}) from tuple cde.dynamics.comments java.util.HashMap where {'tuple.docid':'%s'}",item.docid());
		var q=home.createQuery(cjql);
		var comments=q.getResultList();
		printComments(comments,li.select('.comment-threads').first(),portal,subject);
		ul.append(li);
	}
	if(skip>0){
		circuit.content().writeBytes(ul.html().getBytes());
	}else{
		circuit.content().writeBytes(doc.toString().getBytes());
	}
	
}
function printComments(comments,ol,portal,subject){
	var threads=new ArrayList();
	var map=new HashMap();
	for(var i=0;i<comments.size();i++){
		var doc=comments.get(i);
		var tuple=doc.tuple();
		tuple.commentid=doc.docid();
		if(typeof tuple.thread=='undefined'||tuple.thread==null){
			threads.add(tuple);
		}else{
			var childs;
			if(map.containsKey(tuple.thread)){
				childs=map.get(tuple.thread);
			}else{
				childs=new ArrayList();
				map.put(tuple.thread,childs);
			}
			childs.add(tuple);
		}
	}
	var tli=ol.select('>.comment-thread').first().clone();
	ol.empty();
	for(var i=0;i<threads.size();i++){
		var thread=threads.get(i);
		var threadli=tli.clone();
		
		threadli.attr('user',thread.user);
		threadli.attr('thread',thread.commentid);
		threadli.select('>.thread-body>.thread-cnt>p').html(thread.content);
		var href=String.format("/views/view-user.html?user=%s",thread.user)	;
		threadli.select('>.user-face').attr('href',href);
		var owner=portal.owner(thread.user);
		var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),thread.user);
		threadli.select('>.user-face img').attr('src',src);
		var usrname=threadli.select('>.thread-body>.user-name');
		usrname.attr('href',href);
		usrname.html(thread.user);
		threadli.select('>.thread-body>.timestamp').html(TimeUtil.friendlyTime(thread.ctime));
		if(subject==null){
			threadli.select('> .thread-body > .thread-actions .reply').remove();
			threadli.select('> .thread-body > .thread-actions .delete-comment').remove();
		}else{
			if(subject.principal()!=thread.user){
				threadli.select('> .thread-body > .thread-actions .delete-comment').remove();
			}
		}
		//打印子贴
		var ul=threadli.select('.follow-ul').first();
		var cli=ul.select('>li').first().clone();
		ul.empty();
		var childs=map.get(thread.commentid);
		if(childs!=null){
			for(var j=0;j<childs.size();j++){
				var child=childs.get(j);
				var childli=cli.clone();
				childli.attr('user',child.user);
				childli.attr('comment',child.commentid);
				childli.select('.thread-cnt>p').html(child.content);
				var href=String.format("/views/view-user.html?user=%s",child.user)	;
				childli.select('.user-face').attr('href',href);
				var owner=portal.owner(child.user);
				var src=String.format("http://www.cjlns.com/resource/ud/%s?path=home://system/img/faces&u=%s",owner.face().getHead(),child.user);
				childli.select('.user-face img').attr('src',src);
				var usrname=childli.select('.user-name[who]');
				usrname.attr('href',href);
				usrname.html(child.user);
				
				var usrname=childli.select('.user-name[reply]');
				if(child.replyto!=null){
					usrname.html(child.replyto);
					var href=String.format("/views/view-user.html?user=%s",child.replyto)	;
					usrname.attr('href',href);
				}else{
					usrname.remove();
				}
				
				
				childli.select('.timestamp').html(TimeUtil.friendlyTime(child.ctime));
				
				if(subject==null){
					childli.select('.reply').remove();
					childli.select('.delete-comment').remove();
				}else{
					if(subject.principal()!=child.user){
						childli.select('.delete-comment').remove();
					}
				}
				
				ul.append(childli);
			}
		}
		
		ol.append(threadli);
	}
}
