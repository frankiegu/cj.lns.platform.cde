$(document).ready(function(){
	function selectRange(){
		var userSelection, rangeObject;
	      if (window.getSelection) {//ie11 10 9 ff safari
	    	  userSelection = window.getSelection();//创建range
	      }else if (document.selection) {//ie10 9 8 7 6 5
	    	  userSelection = document.selection.createRange();//创建选择对象
	      }
	    //Range对象
	      rangeObject = userSelection;
	      if (userSelection.getRangeAt) {
	          //现代浏览器
	          rangeObject = userSelection.getRangeAt(0);
	      }
	     return rangeObject;
	  }
	var topicmain=$('.topic-main');
	//来访浏览量弹出
	topicmain.find('article.boxed .topic-body .topic-meta-data .names .first a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	//赞的人
	$('.timeline-container .topic-timeline').delegate('.timeline-footer-likes .poster','click',function(e){
		e.preventDefault();
		var the=$(this);
		$(the).popup('加载中...','padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right',true);
		$.get($(this).attr('href'),{},function(html){
			$(the).popup(html,'padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right',true);
		});
	});
	$('.timeline-container .topic-timeline .timeline-footer-controls button').on('click',function(e){
		var action=$(this).attr('aria-action');
		var docid=$(this).parents('.topic-timeline').attr('docid');
		var the=$(this);
		switch(action){
		case 'like-hits':
			$(the).popup('加载中...','background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right');
			$.get('/views/guandu/likes.html',{docid:docid},function(html){
				$(the).popup(html,'background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right',true);
			}).error(function(e){
				var err=e.responseText;
				err=err.substring(0,err.indexOf('<br/>'));
				alert(e.status+' '+err);
			});
			break;
		case 'comments-hits':
			$(the).popup('加载中...','background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right');
			$.get('/views/guandu/comments.html',{docid:docid},function(html){
				$(the).popup(html,'background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right',true);
			}).error(function(e){
				var err=e.responseText;
				err=err.substring(0,err.indexOf('<br/>'));
				alert(e.status+' '+err);
			});
			break;
		case 'follow-hits':
			$(the).popup('加载中...','background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','top.right');
			$.get('/views/guandu/follows.html',{docid:docid},function(html){
				$(the).popup(html,'background-color:yellow;padding:10px;min-width:200px;max-height:400px;overflow:auto;','top.right',true);
			}).error(function(e){
				var err=e.responseText;
				err=err.substring(0,err.indexOf('<br/>'));
				alert(e.status+' '+err);
			});
			break;
		}
	});
	$('.timeline-container .topic-timeline .timeline-footer-likes .notification-options[liked]').on('click',function(e){
		var docid=$(this).parents('.topic-timeline').attr('docid');
		var the=$(this);
		var button=$(this).parents('.topic-timeline').find('.timeline-footer-controls button[aria-action=\"like-hits\"]');
		if($(this).attr('liked')=='liked'){//取消
			$.get('/views/guandu/unlike-hits.html',{docid:docid},function(data){
				var obj=$.parseJSON(data);
				var val=button.find('span').html();
				button.find('span').html(parseInt(val)-1);
				the.attr('style','border:none;');
				the.removeAttr('liked');
				the.parents('.timeline-footer-likes').find('.trigger-user-card[data-user-card=\"'+obj.user+'\"]').remove();
			}).error(function(e){
				var err=e.responseText;
				err=err.substring(0,err.indexOf('<br/>'));
				alert(e.status+' '+err);
			});
		}else{
			$.get('/views/guandu/like-hits.html',{docid:docid},function(data){
				var val=button.find('span').html();
				button.find('span').html(parseInt(val)+1);
				var liked=the;
				liked.attr('style','border:1px solid #999;');
				liked.attr('liked','liked');
				the.parents('.timeline-footer-likes').append(data);
			}).error(function(e){
				var err=e.responseText;
				err=err.substring(0,err.indexOf('<br/>'));
				alert(e.status+' '+err);
			});
		}
	});
//	var startContainer;
//	$('#topic').delegate('.topic-reply > .topic-reply-wrap .topic-replyer',function(e){
//		var range=selectRange();//在开始容器之前插入
//		startContainer=range.startContainer;
//	});
	//回复框的操作
	$('#topic').delegate('.topic-reply > .topic-reply-wrap > .topic-reply-op > ul > li','click',function(e){
		var action=$(this).attr('action');
		var editor=$(this).parents('.topic-reply-wrap').find('.topic-replyer');
		
		switch(action){
		case 'insertpic':
			$(this).undelegate('#pic-upload-replyer','change');
			$(this).delegate('#pic-upload-replyer','change',function(e){
				var docid=$('#topic').attr('data-topic-id');
				$.ajaxFileUpload({
					url : '/post/upload-pic-for-reply.service', // 用于文件上传的服务器端请求地址
					secureuri : false, // 一般设置为false
					fileElementId : 'pic-upload-replyer',
					dataType : 'json',// 返回值类型 一般设置为json
					data : {docid:docid},
					success : function(data, status) {
						var src=data.src;
						var fn=data.fn;
						editor.append('<div class=\"cj-pic-panel\"><img src=\"'+src+'\" fn=\"'+fn+'\"></div>');
					},
					error : function(data, status, e) {
						alert(e);
					}
				});
			});
			break;
		case 'inserthref':
			$(this).popup("<div id='inserthref-address'><input placeholder='地址'></div><div id='inserthref-name'><input placeholder='文本名，在此回车'></div>",'background-color:yellow;padding:10px;max-height:400px;overflow:auto;','top.left');
			$('#cj-popup-panel').undelegate('#inserthref-name input','keyup');
			$('#cj-popup-panel').delegate('#inserthref-name input','keyup',function(e){
				if(e.keyCode==13){
					var address=$(this).parent('#inserthref-name').siblings('#inserthref-address').find('input').val();
					if(address==''){
						alert('地址为空');
						return;
					}
					if(address.indexOf('://')<1){
						alert('请输入http://完整地址');
						return;
					}
					var name=$(this).val();
					editor.append("<a style='color:blue;' href='"+address+"'>"+name+"</a>");
					$('#cj-popup-hidden').hide();
				}
			});
			break;
		case 'insertcode':
			editor.append('<pre><code>代码在这儿</code></pre>');
			break;
		}
	});
	$('#topic').delegate('.topic-reply > .topic-reply-wrap > .topic-replyer-box > .topic-sendit','click',function(e){
		var replyer=$(this).siblings('.topic-replyer');
		var html=replyer.html();
		var docid=$('#topic').attr('data-topic-id');
		if(html==''){
			alert('内容为空');
			return;
		}
		var box=$('#ember3538');
		var first=box.find('>.post-stream>.topic-follow').first();
		
		$.post('/post/create-thread.service',{docid:docid,html:html},function(data){
			//评论按倒序，最新在最前
			if(first==null||first.length==0||typeof first=='undefined'){//追加
				box.append(data);
			}else{//添加到最前
				first.before(data);
			}
			replyer.empty();
		}).error(function(e){alert(e.responseText);});
	});
	$('#topic').delegate('.topic-follow .topic-body','mouseenter mouseleave',function(e){
		if(e.type=='mouseenter'){
			$(this).find('.topic-thread-del').show();
		}else{
			$(this).find('.topic-thread-del').hide();
		}
	});
	$('#topic').delegate('.topic-follow .topic-body .topic-thread-del','click',function(e){
		var follow=$(this).parents('.topic-follow');
		var commentid=follow.attr('commentid');
		var docid=$(this).parents('#topic').attr('data-topic-id');
		$.get('/post/delete_thread.service',{docid:docid,commentid:commentid},function(data){
			follow.remove();
		}).error(function(e){alert(e.responseText);});
	});
	$('#topic').delegate('.thread-discuss-ul > li span[reply]','click',function(e){
		var master=$(this).siblings('a[master]').attr('master');
		var textarea=$(this).parents('.thread-discuss').find('textarea');
		textarea.val('@'+master+'>');
	});
	$('#topic').delegate('.thread-discuss-ul > li span[del]','click',function(e){
		var follow=$(this).parents('.topic-follow');
		var li=$(this).parents('li[commentid]');
		var commentid=li.attr('commentid');
		var docid=$(this).parents('#topic').attr('data-topic-id');
		$.get('/post/delete_thread.service',{docid:docid,commentid:commentid},function(data){
			li.remove();
		}).error(function(e){alert(e.responseText);});
	});
	$('#topic').delegate('.thread-discuss textarea','keyup',function(e){
		if(e.keyCode!=13){
			return;
		}
		var threaduser=$(this).parents('.topic-follow').attr('thread-user');
		var val=$(this).val();
		var the=$(this);
		if(val==''){
			alert('内容为空');
			return;
		}
		var text=val;
		var tosomeone='';
		if(text.indexOf('@')>-1&&text.indexOf('>')>-1){
			tosomeone=text.substring(text.indexOf('@')+1,text.indexOf('>'));
			text=text.substring(text.indexOf('>')+1,text.length)	;
		}else{
			tosomeone=threaduser;
		}
		
		var follow=$(this).parents('.topic-follow');
		var thread=follow.attr('commentid');
		var docid=$(this).parents('#topic').attr('data-topic-id');
		$.post('/post/comment-thread.service',{docid:docid,thread:thread,tosomeone:tosomeone,text:text},function(data){
			the.val('');
			the.parents('.thread-discuss').find('.thread-discuss-ul').append(data);
		}).error(function(e){alert(e.responseText);});
	});
	$('#topic').delegate('.follow-user-cared','click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'padding:10px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	$('#topic').delegate('.thread-discuss-ul > li a[master],.thread-discuss-ul > li a[follow]','click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'padding:10px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	$('.timeline-container .topic-timeline .now-date').on('click',function(e){
		e.preventDefault();
		var the=$(this);
		var docid=$(this).parents('.topic-timeline').attr('docid');
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','top.right');
		$.get('/views/guandu/relate.html',{docid:docid},function(html){
			the.popup(html,'background-color:yellow;padding:10px;max-height:400px;overflow:auto;','top.right');
		}).error(function(e){
			the.popup(e.responseText,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','top.right');
		});
	});
	$('.timeline-container .topic-timeline .timeline-padding > ul').delegate('li a','click',function(e){
		e.preventDefault();
		var the=$(this);
		var docid=$(this).parents('.topic-timeline').attr('docid');
		var connectid=$(this).parent('li[connectid]').attr('connectid');
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get('/views/guandu/view-connect.html',{docid:docid,connectid:connectid},function(html){
			the.popup(html,'background-color:yellow;padding:10px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){
			the.popup(e.responseText,'background-color:yellow;padding:10px;min-height:200px;overflow:auto;','bottom.right');
		});
	});
})