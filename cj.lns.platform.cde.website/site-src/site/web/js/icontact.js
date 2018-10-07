$(document).ready(function(){
	$('.icontact > .icontact-left > .icontact-list > .icontact-user').on('click',function(e){
		var panel=$(this).parents('.icontact').find('.icontact-panel');
		var user=$(this).attr('user');
		var portaluser=$('.user-main .details .username').html();
		$.post('/views/view-icontact.html',{user:user,portaluser:portaluser},function(data){
			panel.html(data);
		}).error(function(e){
			alert(e.responseText);
		});
	});
	$('.icontact > .icontact-box ').undelegate('.icontact-panel .icontact-face .face-img .relationship img','click');
	$('.icontact > .icontact-box ').delegate('.icontact-panel .icontact-face .face-img .relationship img','click',function(e){
		var action='';
		if(typeof $(this).attr('following')!='undefined'){
			action='following';
		}
		if(typeof $(this).attr('follower')!='undefined'){
			action='follower';
		}
		var user=$(this).parents('.icontact-face').attr('user');
		var the=$(this);
		$.get('/views/guandu/unfollow-action.service',{user:user,action:action},function(data){
			the.remove();
		}).error(function(e){
			alert(e.responseText);
		});
	});
})