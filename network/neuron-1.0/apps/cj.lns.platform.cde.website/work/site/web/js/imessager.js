$(document).ready(function(){
	
	var activeview=$('#ember914>#messages').attr('activeview');
	if(activeview!=''&&activeview!=null&&typeof activeview!='undefined'){
		var url='/users/'+$('.imessager').attr('user')+'/messages/'+activeview;
		var activeitem=$('#ember914>#messages').attr('activeitem');
		if(activeitem!=''&&activeitem!=null&&typeof activeitem!='undefined'){
			url=url+'/'+activeitem;
		}
		window.history.pushState(null, null,url);
		var activeview=$('#ember914>#messages').attr('activeview');
		var threadli=$('.imessager > .imessager-left .imessager-ul .imessager-li[thread=\"'+activeitem+'\"]');
		threadli.addClass('thread-selected');
		if(activeview=='create-message'){
			threadli.removeClass('view-message');
			threadli.addClass('new-message');
		}
		$.post(url,{},function(data){
			$('.imessager .inbox-body').html(data);
		}).error(function(e){
			alert(e.responseText);
		});
	}
	$('.imessager').undelegate(' > .imessager-left .imessager-ul .imessager-li','click');
	$('.imessager').delegate(' > .imessager-left .imessager-ul .imessager-li','click',function(e){
		$(this).parents('.imessager-ul').find('>.imessager-li.thread-selected').removeClass('thread-selected');
		$(this).addClass('thread-selected');
		var url='';
		var msgli= $('#ember914>#messages');
		if($(this).is('.new-message')){
			url='/users/'+$('.imessager').attr('user')+'/messages/create-message/'+$(this).attr('thread');
			msgli.attr('activeview','create-message');
			msgli.removeAttr('activeitem');
		}else{
			url='/users/'+$('.imessager').attr('user')+'/messages/thread/'+$(this).attr('thread');
			msgli.attr('activeview','thread');
			msgli.attr('activeitem',$(this).attr('thread'));
		}
		window.history.pushState(null, null,url);
		var the=$(this);
		$.post(url,{},function(data){
			$('.imessager .inbox-body').html(data);
			the.find('.tips').hide();
		}).error(function(e){
			alert(e.responseText);
		});
	});
	
	function send(textarea){
		var text=textarea.val();
		text=text.replace(/[\r|\n]/g,"");
		textarea.val(text);
		var li=$('.imessager > .imessager-left .imessager-ul .imessager-li.thread-selected');
		var thread=li.attr('thread');
		var isnewThread=li.is('.new-message');
		//如果是新thread则将广本添加到thread消息框，并将新消息转换为view-message并摸拟点击它，以查看方式打开
		$.post('/post/imessager/post-message.service',{thread:thread,text:text},function(data){
			if(isnewThread){
				li.removeClass('new-message');
				li.trigger('click');
				return;
			}
			//否则生成发送方会话上屏
			var ul=$('.imessager .inbox-body .inbox-wrap .compose-panel>ul');
			ul.append(data);
			textarea.val('');
			var panel=$('.imessager .inbox-body .inbox-wrap .compose-panel');
			panel.scrollTop(panel[0].scrollHeight);
		}).error(function(e){
			alert(e.responseText);
		})
	}
	$('.imessager').undelegate('#enter-to-send-checkbox','change');
	$('.imessager').delegate('#enter-to-send-checkbox','change',function(e){
		var submit=$(this).parents('#enter-to-send').siblings('.message-submit');
		submit.toggle();
	});
	$('.imessager').undelegate('.inbox-body .inbox-wrap .compose-box > .typed','keyup');
	$('.imessager').delegate('.inbox-body .inbox-wrap .compose-box > .typed','keyup',function(e){
		if(e.keyCode==13){
			var check=$(this).parents('.inbox-wrap').find('#enter-to-send-checkbox');
			if(check.prop('checked')==true){
				send($(this));
			}
			
		}else{
			var threadli=$('.imessager > .imessager-left .imessager-ul .imessager-li.thread-selected');
			var tips=threadli.find('.user-info .user-detail .title');
			var currentuser=$(this).parents('.imessager').attr('user');
			tips.html(currentuser+':'+$(this).val());
		}
	});
	$('.imessager').undelegate('.inbox-body .inbox-wrap .compose-box .compose-action-bar .message-submit');
	$('.imessager').delegate('.inbox-body .inbox-wrap .compose-box .compose-action-bar .message-submit','click',function(e){
		var textarea=$(this).parents('.compose-box').find('.typed');
		send(textarea);
	});
	function addUserToMessagerGroup(recipient,thread,ul,li){
		$.post('/post/imessager/add-recipient.service',{recipient:recipient,thread:thread},function(data){
			var face=$.parseJSON(data);
			ul.append(li);
			var threadli=$('.imessager > .imessager-left .imessager-ul .imessager-li.thread-selected');
			var names=threadli.find('.user-info .user-detail .username');
			var nope=names.find('a');
			if(nope.html()=='没有收件人'){
				nope.remove();
			}
			var countE=threadli.find('.user-info .user-image .user-group span[count]');
			var count=parseInt(countE.html())+1;
			countE.html(count);
			if(count<=4){
				var src="http://www.cjlns.com/resource/ud/"+face.head+"?path=home://system/img/faces&u="+recipient;
				var facea=threadli.find('.user-info .user-image a');
				facea.find('i').remove();
				facea.removeAttr('class');
				facea.addClass('group-size-'+count);
				facea.attr('title',face.nick);
				facea.append("<img class='avatar img-"+(count-1)+"' src='"+src+"'>");
			}
			var href="/views/view-user.html?user="+recipient;
			var a="<a href='"+href+"' title='"+face.nick+"' user='"+recipient+"'>"+recipient+"</a>&nbsp;&nbsp;";
			names.append(a);
		}).error(function(e){
			alert(e.responseText);
		});
	}
	$('.imessager').undelegate('.inbox-body .inbox-wrap .inbox-header .twitter-typeahead input','keyup');
	$('.imessager').delegate('.inbox-body .inbox-wrap .inbox-header .twitter-typeahead input','keyup',function(e){
		var val=$(this).val();
		val=val.replace(/[\r|\n]/g,"");
		var the=$(this);
		the.val(val);
		var typeahead=the.parents('.twitter-typeahead');
		var ul=typeahead.find('.u-names').first();
		if(val==''){
			ul.empty();
			return;
		}
		var uli=typeahead.find('.users-hidden>.pill').first().clone();
		var selectedul=$(this).parents('.inbox-header').find('.pillbox-list').first();
		$.post('/views/imessager/like-users.html',{keywords:val},function(data){
			var arr=$.parseJSON(data);
			ul.empty();
			for(var i=0;i<arr.length;i++){
				var user=arr[i];
				var li=uli.clone();
				li.attr('user',user[0]);
				li.find('.pill-name').html(user[0]);
				if(user[0]==user[1]){
					li.find('.pill-nick').remove();
				}else{
					li.find('.pill-nick').html(user[1]);
				}
				ul.append(li);
			}
			//按回车键将上屏第一个
			if(e.keyCode==13){
				var li=typeahead.find('.u-names .pill').first().clone();
				var exists=li.attr('user');
				var existslis=selectedul.find('.pill[user=\"'+exists+'\"]');
				if(existslis.length<1){
					li.append("<span class='remove-pill' title='移除此项'>X</span>");
					the.val('');
					ul.empty();
					var thread=$('.imessager > .imessager-left .imessager-ul .imessager-li.thread-selected').attr('thread');
					addUserToMessagerGroup(exists,thread,selectedul,li);
				}
				
			}
			
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.imessager').undelegate('.inbox-body .inbox-wrap .inbox-header .twitter-typeahead .u-names .pill','click');
	$('.imessager').delegate('.inbox-body .inbox-wrap .inbox-header .twitter-typeahead .u-names .pill','click',function(e){
		var the=$(this);
		var typeahead=the.parents('.twitter-typeahead');
		var li=the.clone();
		var exists=li.attr('user');
		var selectedul=the.parents('.inbox-header').find('.pillbox-list').first();
		var existslis=selectedul.find('.pill[user=\"'+exists+'\"]');
		if(existslis.length<1){
			li.append("<span class='remove-pill' title='移除此项'>X</span>");
			var thread=$('.imessager > .imessager-left .imessager-ul .imessager-li.thread-selected').attr('thread');
			addUserToMessagerGroup(exists,thread,selectedul,li);
		}
	});
	$('.imessager').undelegate('.inbox-body .inbox-wrap .inbox-header .pillbox-list .pill span.remove-pill','click');
	$('.imessager').delegate('.inbox-body .inbox-wrap .inbox-header .pillbox-list .pill span.remove-pill','click',function(e){
		var the=$(this);
		var recipient=$(this).parents('.pill').attr('user');
		var threadli=$('.imessager > .imessager-left .imessager-ul .imessager-li.thread-selected');
		var thread=threadli.attr('thread');
		//移除消息组成员
		$.post('/post/imessager/remove-recipient.service',{recipient:recipient,thread:thread},function(data){
			the.parents('.pill').remove();
			threadli.find('.username a[user=\"'+recipient+'\"]').remove();
			var arr=threadli.find('.username a');
			if(arr.length==0){
				threadli.find('.username').html('<a>没有收件人</a>');
			}
			var countE=threadli.find('.user-info .user-image .user-group span[count]');
			var count=parseInt(countE.html())-1
			countE.html(count);
			switch(count){
			case 3:
				threadli.find('.user-info .user-image a.group-size-4 .img-3').remove();
				threadli.find('.user-info .user-image a').attr('class','group-size-3');
				break;
			case 2:
				threadli.find('.user-info .user-image a.group-size-3 .img-2').remove();
				threadli.find('.user-info .user-image a').attr('class','group-size-2');
				break;
			case 1:
				threadli.find('.user-info .user-image a.group-size-2 .img-1').remove();
				threadli.find('.user-info .user-image a').attr('class','group-size-1');
				break;
			case 0:
				var a=threadli.find('.user-info .user-image a');
				a.attr('class','group-size-1');
				a.html('<i class="avatar fa fa-user"></i>');
				break;
			}
			
		}).error(function(e){
			alert(e.responseText);
		});
		return false;
	});
	$('.imessager').undelegate('.inbox-body .inbox-wrap .inbox-header .pillbox-list .pill','click');
	$('.imessager').delegate('.inbox-body .inbox-wrap .inbox-header .pillbox-list .pill','click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		var a=$(this).find('>a');
		var url='';
		if(a.length>0){
			url=$(this).find('>a').attr('href');
		}else{
			url='/views/view-user.html?user='+$(this).attr('user');
		}
		$.get(url,{},function(html){
			the.popup(html,'padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.imessager').undelegate('.compose-panel .message-row .user-info .user-image a,.compose-panel .message-row .user-info .user-detail .username a','click');
	$('.imessager').delegate('.compose-panel .message-row .user-info .user-image a,.compose-panel .message-row .user-info .user-detail .username a','click',function(e){
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get(the.attr('href'),{},function(html){
			the.popup(html,'padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	$('.imessager').undelegate('.user-info .user-detail .username a','click');
	$('.imessager').delegate('.user-info .user-detail .username a','click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	$('.imessager').undelegate('.imessager-ul .imessager-li .user-info .opera .delete','click');
	$('.imessager').delegate('.imessager-ul .imessager-li .user-info .opera .delete','click',function(e){
		var thread=$(this).parents('.imessager-li').attr('thread');
		var the=$(this).parents('.imessager-li');
		if(!confirm("移除当前消息？")){
			return;
		}
		$.post('/post/imessager/remove-thread.service',{thread:thread},function(data){
			the.remove();
			$('.imessager-panel >.inbox-body').empty();
		}).error(function(e){
			alert(e.responseText);
		});
		return false;
	});
	
	
})