$(document).ready(function(){
	$('.prefer-panel .prefer-face .face-names input[nickname]').keyup(function(e){
		if(e.keyCode!=13)return;
		var val=$(this).val();
		val=val.replace(/[\r|\n]/g,"");
		if(val==''){
			$(this).val('');
			alert('名字为空');
			return;
		}
		var the=$(this);
		$.post('/post/preferences/edit-nick.service',{nick:val},function(data){
			the.val(val);
			the.attr('readonly','readonly');
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.prefer-panel .prefer-face .face-names .face-sign textarea').keyup(function(e){
		if(e.keyCode!=13)return;
		var val=$(this).val();
		val=val.replace(/[\r|\n]/g,"");
		if(val==''){
			$(this).val('');
			alert('签名为空');
			return;
		}
		var the=$(this);
		$.post('/post/preferences/edit-sign.service',{sign:val},function(data){
			the.val(val);
			the.attr('readonly','readonly');
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.prefer-panel .prefer-brief textarea').keyup(function(e){
		if(e.keyCode!=13)return;
		var val=$(this).val();
		val=val.replace(/[\r|\n]/g,"");
		if(val==''){
			$(this).val();
			alert('简介为空');
			return;
		}
		var the=$(this);
		$.post('/post/preferences/edit-brief.service',{brief:val},function(data){
			the.val(val);
			the.attr('readonly','readonly');
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.prefer-panel .prefer-face .face-img #head-pic').change(function(e){
		var faceimg=$(this).parents('.face-img');
		var label=faceimg.find('label');
		var img=faceimg.find('.img');
		img.hide();
		label.append("<div id='temp'>上传中...</div>");
		$.ajaxFileUpload({
			url : '/post/preferences/upload-head-pic.service', // 用于文件上传的服务器端请求地址
			secureuri : false, // 一般设置为false
			fileElementId : 'head-pic',
			dataType : 'json',// 返回值类型 一般设置为json
			data : {},
			success : function(data, status) {
				var src = data.src.replace('&amp;', '&');
				var fn = data.fn;
				img.attr('file',fn);
				img.attr('src',src);
				label.find('#temp').remove();
				img.show();
			},
			error : function(data, status, e) {
				img.show();
				label.find('#temp').remove();
				alert(e.status+' '+e.responseText);
			}
		});
	});
	$('.prefer-panel .prefer-pwd input.retype-pwd').keyup(function(e){
		if(e.keyCode!=13)return;
		var re=$(this).val();
		re=re.replace(/[\r|\n]/g,"");
		if(re==''){
			$(this).val('');
			alert('密码请重输入一遍');
			return;
		}
		var oldE=$(this).siblings('.type-pwd');
		var old=oldE.val();
		if(re!=old){
			$(this).val('');
			alert('密码不匹配，请重输入一遍');
			return;
		}
		var the=$(this);
		$.post('/post/preferences/edit-pwd.service',{pwd:re},function(data){
			the.val('');
			oldE.val('');
			alert('修改成功');
		}).error(function(e){
			alert(e.responseText);
		})
	});
})