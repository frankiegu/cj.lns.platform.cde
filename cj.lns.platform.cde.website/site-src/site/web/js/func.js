$(document).ready(function(){
	$('#ember1679 tr').hover(function(){
		$(this).find('.delete').show();
	},function(){
		$(this).find('.delete').hide();
	})
	$('#ember1679').delegate('.delete','click',function(e){
		var tr=$(this).parents('tr[data-topic-id]');
		var id=tr.attr('data-topic-id');
		$.get('/post/delete_drafts.service',{id:id},function(data){
			tr.remove();
		}).error(function(e){alert(e.responseText);})
	})
	
	$('#ember1679').delegate('.main-link .movetodrafts','click',function(e){
		if(confirm('是否移除到草稿箱？\r\n注意：移除到草稿箱其活动历史信息将丢失，但还可以从草稿箱中重新发布')){
			var tr=$(this).parents('tr[data-topic-id]');
			var id=tr.attr('data-topic-id');
			$.get('/post/moveto_drafts.service',{id:id},function(data){
				tr.remove();
			}).error(function(e){alert(e.responseText);})
		}
	})
	$('#ember1679').delegate('.main-link','mouseenter mouseleave',function(e){
		if(e.type=='mouseenter'){
			$(this).find('.movetodrafts').show();
			return;
		}
		if(e.type='mouseleave'){
			$(this).find('.movetodrafts').hide();
		}
	});
	
	var dynamicul=$('.topics-published>#ember1688>tbody');
	if(dynamicul.length>0){
		var startpos=parseInt(dynamicul.attr('count'));
		$(document.body).scrollBottom(function(skip){
			dynamicul=$('.topics-published>#ember1688>tbody');
			var exists=dynamicul.length>0;
			if(!exists){
				dynamicul.unbind('scroll');
				return 0;
			}
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
	}
})