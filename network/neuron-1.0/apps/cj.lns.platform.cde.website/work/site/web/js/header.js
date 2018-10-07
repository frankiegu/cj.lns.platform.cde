(function($){
            $.fn.extend({
                //callback参数：skip,开始位置
            	scrollBottom:function(callback,startpos){
                	var skip=0;
                	if(typeof startpos!='undefined'){
                		skip=startpos;
                	}
                	var isloading=false;
                	$(this).unbind('scroll');
                	$(this).on('scroll',(function(){
                		var nScrollTop=$(this)[0].scrollTop;//滚动条距顶部的高度
                	    var nDivHight=$(this).height();//可见区域的高度
                	     var nScrollHight= $(this)[0].scrollHeight;//为整个UL的高度（包括屏幕外的高度）
                	     //console.log((nScrollTop + nDivHight+10)+' '+nScrollHight);
                	     if(!isloading&&nScrollTop + nDivHight+10 >= nScrollHight){
                	        if(typeof callback!='undefined'){
                	        	isloading=true;
            	        		var pos=callback(skip);
            	        		if(typeof pos=='undefined'){
            	        			alert('没有返回翻页后的位置');
            	        		}
            	        		skip=pos;
            	        		isloading=false;
            	        	}
                	       
                	     };
                	} ));
                }
            });    
})(jQuery);
// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}  

$.cj={};
$.cj.cookie=function(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}

$.cj.onmessage=function(){
	var cjtoken=$.cj.cookie('CJTOKEN');
	var device=$('.header-box').attr('device');
	var xhrurl=device+'/device/cde/terminus/reporter?cjtoken='+cjtoken;
	$.ajax({
	        type : "get",
	        async : true,
	        url :xhrurl, 
	        timeout : 125000,
	        cache : false,
	        dataType : "jsonp",
	        jsonp: "callbackparam",
	        jsonpCallback:"onmessage",
	        success : function(json){
	            //alert('xx'+json);
	        },
	        error:function(xhr,status,error){
	           // alert('message error :'+e.responseText);
	        	console.log('device connect error ');
	        }
	    });
	console.log('device connected.');
}
function onmessage(data) //回调函数
{
	var messages=data.messages;
    if(messages==null||typeof messages=='undefined'){
    	$.cj.onmessage();
    	return;
    }
    for(var i=0;i<messages.length;i++){
    	var msg=messages[i];
    	switch(msg.module){
    	case 'platform':
    		var platformTips=$('.alert.alert-info.clickable');
    		if(platformTips.length>0){
	    		var countE=platformTips.find('span.count');
	    		var count=parseInt(countE.html());
	    		countE.html(count+1);
	    	    platformTips.find('span.ember-view').html('个新主题');
	    	    platformTips.show();
    		}
    		break;
    	case 'activity':
    		var tips=$('.dynamic .dynamic-tips');
    		if(tips.length<1){//如果当前页不在活动模块，则在头上显示
    			var ntips=$('#toggle-hamburger-notify .tips');
        		var count=parseInt(ntips.html());
        		ntips.html(count+1);
        		ntips.show();
    			$.cj.onmessage();
    			return;
    		}
    		var countE=tips.find('.count');
    		var count=parseInt(countE.html());
    		countE.html(count+1);
    		tips.show();
    		break;
    	case 'imessager':
    		var imessager=$('.imessager');
    		if(imessager.length<1){//当前页不是消息页则在header上显示消息数
    			var countE=$('.header .contents .panel .icons .icon > .tips');
    			var count=parseInt(countE.html());
    			countE.html(count+1);
    			countE.show();
    			$.cj.onmessage();
    			return;
    		}
    		var data=msg.data;
    		var threadtab=imessager.find('.imessager-left .imessager-ul .imessager-li[thread=\"'+data.thread+'\"]');
    		if(threadtab.length<1){//没有thread列则直接返回这种情况其实是不存在的。
    			$.cj.onmessage();
    			return;
    		}
    		if(!threadtab.is('.thread-selected')){//显示提示数
    			var countE=threadtab.find('.tips');
    			var count=parseInt(countE.html());
    			countE.html(count+1);
    			countE.show();
    			threadtab.find('.user-info .user-detail .title').html(data.sender+":"+data.text);
    			$.cj.onmessage();
    			return;
    		}
    		threadtab.find('.user-info .user-detail .title').html(data.sender+":"+data.text);
    		var li=$('.message-hidden>li').first().clone();
    		var panel=$('.imessager .inbox-body .inbox-wrap .compose-panel');
    		var ul=panel.find('.message-table').first();
    		
    		li.find('.title').html(data.text);
    		var date=new Date(data.ctime);
    		var time=date.format('yyyy-MM-dd hh:mm');
    		li.find('.timestamp').html(time);
    		var user=data.sender;
    		$.get('/views/get-face.service',{user:user},function(d){
    			var obj=$.parseJSON(d);
    			var nick=obj.nick;
    			var head=obj.head;
    			var src='http://www.cjlns.com/resource/ud/'+head+'?path=home://system/img/faces&u='+user;
    			var href='/views/view-user.html?user='+user;
    			li.find('.user-image a').attr('href',href);
    			li.find('.user-image img').attr('src',src);
    			li.find('.username a').attr('href',href);
    			li.find('.username a').html(user);
    			li.find('.name').html(nick);
    			ul.append(li);
    			panel.scrollTop(panel[0].scrollHeight);
    		}).error(function(e){
    			alert(e.responseText);
    		});

    		break;
    	}
    }
    
    $.cj.onmessage();
}
window.onload=function(){ 
	$.cj.onmessage();
}
$(document).ready(function(){
	
	$('.header .panel .login-button').on('click',function(e){
		$('.header .panel >.login-panel').show();
		$('.header .panel >.login-panel li[user] input').focus();
	})
	$('.header .panel .register-button').on('click',function(e){
		window.open("http://www.cjlns.com/public/register2.html","_blank")
	})
	$('.header .panel >.login-panel').hover(function(){},function(){
		$('.header .panel >.login-panel').hide();
	})
	$('.header .panel >.login-panel li[user] input,.header .panel >.login-panel li[pwd] input').on('keydown',function(e){
		$(this).siblings('span[error]').remove();
	})
	$('.header .panel >.login-panel li[pwd] input').keyup(function(e){
		if(e.keyCode==13){
			var the=$(this);
			var uli=the.parent('li').siblings('li[user]');
			var user=uli.children('input');
			if(user.val()==''){
				user.after("<br><span error style='color:red;'>用户名为空</span>");
				return;
			}
			var pwd=the.val();
			if(pwd==''){
				the.after("<br><span error style='color:red;'>密码为空</span>");
				return;
			}
			$.post('/public/login.service',{user:user.val(),pwd:pwd},function(data){
				window.location.href='/users/'+user.val();
			}).error(function(e){
				the.after("<br><span error style='color:red;'>认证失败， 原因："+e.responseText+"</span>");
			})
		}
	})
	var headertoggleli=$('.header .contents .panel .icons>li.header-dropdown-toggle');
	headertoggleli.hover(function(){
		var popup=$(this).children('.popup-panel');
		popup.hide();
		if($(this).is('.tips-imessager')&&popup.is(':hidden')){
			$.get('/post/imessager/get-unread-messages.html',{},function(html){
				popup.html(html);
				popup.show();
			}).error(function(e){
				alert(e.responseText);
			});
		}else{
			popup.show();
		}
		if($(this).is('.tips-notify')){
			$.get('/post/imessager/get-unread-notify.html',{},function(html){
				popup.html(html);
				popup.show();
			}).error(function(e){
				alert(e.responseText);
			});
		}else{
			popup.show();
		}
		return false;
	},function(){
		$(this).children('.popup-panel').hide();
		return false;
	});
	headertoggleli.undelegate('.notify-header .notify-li .notify-user','click');
	headertoggleli.delegate('.notify-header .notify-li .notify-user','click',function(e){
		e.preventDefault();
		var href=$(this).attr('href');
		window.location.href=href;
	}).error(function(e){
		alert(e.responseText);
	});
	
	headertoggleli.undelegate('.message-header .message-li','click');
	headertoggleli.delegate('.message-header .message-li','click',function(e){
		e.preventDefault();
		var thread=$(this).attr('thread');
		var recipients=$(this).attr('recipients');
		window.location.href='/users/'+recipients+'/messages/thread/'+thread;
	}).error(function(e){
		alert(e.responseText);
	});
	headertoggleli.undelegate('.message-header .message-li .message-actions .flag-read','click');
	headertoggleli.delegate('.message-header .message-li .message-actions .flag-read','click',function(e){
		e.preventDefault();
		var li=$(this).parents('.message-li');
		var thread=li.attr('thread');
		var msgid=li.attr('msgid');
//		var recipients=li.attr('recipients');
		$.get('/post/imessager/flag-read-messages.service',{thread:thread,msgid:msgid},function(html){
			li.remove();
		}).error(function(e){
			alert(e.responseText);
		});
		return false;
	}).error(function(e){
		alert(e.responseText);
	});
	$('#logout').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		$.post($(this).attr('href'),{},function(data){
			window.location.href='/';
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.contact-panel .popup-panel .tuijiang .member').on('click',function(e){
		window.location.href=$(this).attr('href');
	});
	$('.contact-panel .popup-panel .tuijiang .member>a').on('click',function(e){
		e.preventDefault();
		var user=$(this).parents('.member').attr('user');
		var the=$(this);
		var href=the.attr('href');
		
		$.get(href,{following:user},function(data){
			the.remove();
		}).error(function(e){
			alert(e.responseText);
		});
		return false;
	});
});