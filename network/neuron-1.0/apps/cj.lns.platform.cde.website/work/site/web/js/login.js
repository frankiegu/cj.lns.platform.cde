$(document).ready(function(){
	$('.buttons a[login]').on('click',function(e){
		$('.form span[error]').remove();
		e.stopPropagation();
		e.preventDefault();
		var the=$(this);
		var user=$('.login-form ul li[user] input').val();
		if(user==''){
			user.after("<span error style='color:red;'>用户名为空</span>");
			return;
		}
		var pwd=$('.login-form ul li[pwd] input').val();
		if(pwd==''){
			the.after("<span error style='color:red;'>密码为空</span>");
			return;
		}
		$.post('/public/login.service',{user:user,pwd:pwd},function(data){
			var url=$('.login-form').attr('url');
			if(typeof url=='undefined'||url==''){
				window.location.href='/users/'+user;
			}else{
				window.location.href=url;
			}
		}).error(function(e){
			the.parent('.buttons').siblings('.form').append("<span error style='color:red;white-space:nowrap;'>认证失败， 原因："+e.responseText+"</span>");
		})
	});
	$('.login-form ul li[pwd] input').keyup(function(e){
		if(e.keyCode==13){
			$('.buttons a[login]').trigger('click');
		}
	});
})