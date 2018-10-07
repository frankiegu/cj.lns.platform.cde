$(document).ready(function(){
	$('.dynamic > .dynamic-wrap .tool-tab').on('click',function(e){
		$(this).parent('.tool-tabs').find('>.tool-tab').removeClass('tab-selected');
		$(this).addClass('tab-selected');
		if($(this).is('.upload-pic')){
			$(this).parents('.tool-bar').find('.tool-pic-box').show();
			var img=$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box .tool-pic img');
			img.hide();
		}else{
			$(this).parents('.tool-bar').find('.tool-pic-box').hide();
		}
		$('.tool-panel').show();
	});
	$('.dynamic > .dynamic-wrap .tool-bar .tool-panel .upload-pic').on('click',function(e){
		$(this).parents('.tool-bar').find('.tool-pic-box').show();
		var img=$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box .tool-pic img');
		img.hide();
	});
	$('.dynamic .dynamic-tips').on('click',function(e){
		$(this).hide();
	})
	$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box .tool-pic-del').on('click',function(e){
		var the=$(this);
		var file=$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box .tool-pic img').attr('file');
		$.post('/post/delete-temppic.service',{file:file},function(data){
			the.parents('.tool-bar').find('.tool-pic-box').hide();
		}).error(function(e){
			alert(e.responseText);
		});
	});
	$('.dynamic > .dynamic-wrap .tool-bar .tool-panel textarea').keyup(function(e){
		if(e.keyCode!=13){
			return;
		}
		var the=$(this);
		var val=$(this).val();
		the.val('正在提交，请稍候...');
		the.attr('readonly','readonly');
		val=val.replace(/[\r|\n]/g,"");
		if(val==null){
			alert('内容为空');
			return;
		}
		var img=$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box .tool-pic img');
		
		var picfile=img.attr('file');
		if(typeof picfile=='undefined'){
			picfile='';
		}
		var url='/post/publish-dynamic.service';
		$.post(url,{text:val,pic:picfile},function(data){
//			img.removeAttr('src');
//			img.removeAttr('file');
//			$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box').hide();
//			$('.tool-panel').hide();
//			$('.dynamic > .dynamic-wrap .tool-tab').removeClass('tab-selected');
//			the.val('');
			//再获取一遍
			var refresh=$('.tool-bar').attr('refresh');
			$.get(refresh,{},function(html){
				$('.user-right').html(html);
			}).error(function(e){
				alert(e.responseText);
			});
		}).error(function(e){
			alert(e.responseText);
		});
	});
	$('.dynamic').undelegate('#tool-upload-pic','change');
	$('.dynamic').delegate('#tool-upload-pic','change',function(e){
		var loading=$('.dynamic > .dynamic-wrap .tool-bar .tool-pic .tool-pic-loading');
		loading.show();
		var img=$('.dynamic > .dynamic-wrap .tool-bar .tool-pic-box .tool-pic img');
		img.removeAttr('src');
		img.removeAttr('file');
		img.hide();
		$.ajaxFileUpload({
			url : '/post/upload-pic-for-dynamic.service', // 用于文件上传的服务器端请求地址
			secureuri : false, // 一般设置为false
			fileElementId : 'tool-upload-pic',
			dataType : 'json',// 返回值类型 一般设置为json
			data : {},
			success : function(data, status) {
				loading.hide();
				var src = data.src.replace('&amp;', '&');
				var fn = data.fn;
				img.attr('file',fn);
				img.attr('src',src);
				img.show();
			},
			error : function(data, status, e) {
				loading.html(e.status+' '+e.responseText);
			}
		});
	});
	$('.dynamic ').undelegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body > .actions button.delete','click');
	$('.dynamic ').delegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body > .actions button.delete','click',function(e){
		var li=$(this).parents('.dynamic-info-li');
		var docid=li.attr('docid');
		$.post('/post/delete-dynamic.service',{docid:docid},function(data){
			li.remove();
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.dynamic ').undelegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body .meta .views','click');
	$('.dynamic ').delegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body .meta .views','click',function(e){
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.dynamic').undelegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body > .actions button.like','click');
	$('.dynamic').delegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body > .actions button.like','click',function(e){
		var docid=$(this).parents('.dynamic-info-li').attr('docid');
		var like=$(this).attr('like');
		var the=$(this);
		var li=$(this).parents('.dynamic-info-li');
		var countE=li.find('.info-body .likes .count span[aria-hidden]');
		if(like=='unliked'){
			$.get('/views/dynamic/dynamic-like-hits.service',{docid:docid},function(data){
				var count=countE.html();
				countE.html(parseInt(count)+1);
				the.find('span[aria-hidden]').html('取消赞');
				the.attr('like','liked');
			}).error(function(e){
				alert(e.responseText);
			});
		}else{
			$.get('/views/dynamic/dynamic-unlike-hits.service',{docid:docid},function(data){
				var count=countE.html();
				countE.html(parseInt(count)-1);
				the.find('span[aria-hidden]').html('赞');
				the.attr('like','unliked');
			}).error(function(e){
				alert(e.responseText);
			});
		}
	});
	$('.dynamic').undelegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body > .actions button.comment','click');
	$('.dynamic').delegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body > .actions button.comment','click',function(e){
		$(this).parents('.dynamic-info-li').find('.comment-box textarea').toggle();
	});
	
	$('.dynamic').undelegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body .likes .count','click');
	$('.dynamic').delegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body .likes .count','click',function(e){
		e.preventDefault();
		var the=$(this);
		var docid=$(this).parents('.dynamic-info-li').attr('docid');
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get('/views/dynamic/dynamic-likes.html',{docid:docid},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	$('.dynamic').undelegate('.comment-box textarea','focusin blur');
	$('.dynamic').delegate('.comment-box textarea','focusin blur',function(e){
		if(e.type=='focusin'){
			$(this).attr('style','height:100px;display:block;');
			return;
		}
		if(e.type='blur'){
			$(this).attr('style','height:auto;display:block;');
		}
	});
	$('.dynamic').undelegate('.comment-box textarea','keyup');
	$('.dynamic').delegate('.comment-box textarea','keyup',function(e){
		if(e.keyCode!=13){
			return;
		}
		var text=$(this).val();
		if(text==''){
			alert('没有评论内容');
			return;
		}
		$(this).attr('readonly','readonly');
		$(this).val('正在提交，请稍候...');
		var the=$(this);
		
		var docid=$(this).parents('.dynamic-info-li').attr('docid');
		var commentE=$(this).parents('.dynamic-info-li').find('.info-body .comments .count');
		var commentCnt=commentE.find('span[aria-hidden]');
		var url='';
		if(text.indexOf('@')<0){
			var ol=$(this).parents('.dynamic-info-li').find('.comment-list ol.comment-threads');
			url='/post/dynamic-create-thread.service';
			$.post(url,{text:text,docid:docid},function(data){
				ol.append(data);
				the.removeAttr('readonly');
				the.val('');
				the.attr('style','height:auto;display:block;');
				commentCnt.html(parseInt(commentCnt.html())+1);
			}).error(function(e){
				the.removeAttr('readonly');
				the.val(text);
				alert(e.responseText);
			});
		}else{
			var thread=the.attr('replyto-thread');
			var ul=$(this).parents('.dynamic-info-li').find('.comment-thread[thread=\"'+thread+'\"]').find('.follow-ul');
			var replyto='';
			replyto=text.substring(text.indexOf('@')+1,text.indexOf('>'));
			text=text.substring(text.indexOf('>')+1,text.length);
			url='/post/dynamic-create-reply.service';
			$.post(url,{thread:thread,replyto:replyto,text:text,docid:docid},function(data){
				ul.append(data);
				the.removeAttr('readonly');
				the.val('');
				the.attr('style','height:auto;display:block;');
				commentCnt.html(parseInt(commentCnt.html())+1);
			}).error(function(e){
				the.removeAttr('readonly');
				the.val(text);
				alert(e.responseText);
			});
		}
		
	});
	$('.dynamic').undelegate('.comment-list .comment-thread .thread-actions button.reply','click');
	$('.dynamic').delegate('.comment-list .comment-thread .thread-actions button.reply','click',function(e){
		var area=$(this).parents('.dynamic-info-li').find('.comment-box textarea');
		if(area.is(':hidden')){
			area.show();
		}
		var cthread=$(this).parents('.comment-thread');
		var user=$(this).parents('li[user]').attr('user');
		area.val('@'+user+'>');
		var thread=cthread.attr('thread');
		area.attr('replyto-thread',thread);
	});
	$('.dynamic').undelegate('.comment-list .comment-thread .thread-actions button.delete-comment','click');
	$('.dynamic').delegate('.comment-list .comment-thread .thread-actions button.delete-comment','click',function(e){
		var li=$(this).parents('.follow-li');
		var commentid=li.attr('comment');
		if(typeof commentid=='undefined'||commentid==null||commentid==''){
			li=$(this).parents('.comment-thread');
			commentid=li.attr('thread');
		}
		var commentE=$(this).parents('.dynamic-info-li').find('.info-body .comments .count');
		var commentCnt=commentE.find('span[aria-hidden]');
		$.post('/post/delete-dynamic-comment.service',{commentid:commentid},function(data){
			li.remove();
			commentCnt.html(parseInt(commentCnt.html())-1);
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.dynamic').undelegate('.comment-list .comment-thread .user-face,.comment-list .comment-thread .user-name','click');
	$('.dynamic').delegate('.comment-list .comment-thread .user-face,.comment-list .comment-thread .user-name','click',function(e){
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:#fff;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	$('.dynamic').undelegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body .headline.single-line .name','click');
	$('.dynamic').delegate('.dynamic-wrap > .dynamic-info > .dynamic-info-ul > .dynamic-info-li > .info-body .headline.single-line .name','click',function(e){
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:#fff;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'padding:10px;min-width:200px;min-height:200px;max-height:400px;overflow:auto;','bottom.left');
		}).error(function(e){alert(e.responseText);});
	});
	
	var dynamicul=$('.dynamic > .dynamic-wrap > .dynamic-info>.dynamic-info-ul');
	var startpos=parseInt(dynamicul.attr('count'));
	$(document.body).scrollBottom(function(skip){
		//使用同步
		var pos=skip;
		var href=dynamicul.attr('href');
		$.ajax({
				url : href,
				type : 'get',
				async: false,//使用同步的方式,true为异步方式
				data : {skip:skip},//这里使用json对象
				success : function(data){
					dynamicul.append(data);
					pos=skip+10;//注意与后台limit保持一致
				},
				error:function(e){
					alert(e.responseText);
				}
			});
		return pos;
	},startpos);
});