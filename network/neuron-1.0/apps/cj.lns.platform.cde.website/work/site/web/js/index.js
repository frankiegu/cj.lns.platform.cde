$(document).ready(function(){
	$('.show-more.has-topics').on('click',function(e){
		window.location.href="/";
		$(this).find('.alert-info').html('<span>正在加载...</span>');
	})
	$('.list-container > .box > .table > .row > .cnt > .item > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		window.history.pushState(null, null,$(this).attr('href'));
		//打开模块
		$.get($(this).attr('href'),{},function(data){
			var center=$('.main>.center');
			center.removeClass('wrap');
			center.attr('style','padding-top:63px;');
			center.html(data);
			$('.channels').remove();
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('#create-topic').on('click',function(e){
		var url='/post/editor.html';
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		window.history.pushState(null, null,url);
		$.get(url,{},function(data){
			$('.center').html(data);
			var buttons=$('.center').find('.pl-buttons');
			$('.header').find('.panel').html(buttons.html());
			buttons.remove();
			var plbox=$('.center').find('.pl-href');
			$('.channels').html(plbox.html());
			plbox.remove();
			$('.footer').remove();
		}).error(function(e){
			alert(e.responseText);
		})
	});
	$('.phen-list .container .site-path #ember28211 li[site]').hover(function(e){
			$('#site-panel').attr('style',"padding:10px;background:#e1e9ee;top:28px;");
			$('#site-panel .site-address').attr('style','margin-left:15px;');
			$(this).parent('#ember28211').find('li[site] a').attr('style','background:none;');
			$(this).find('a').attr('style','background:#e1e9ee;');
			var sitecode=$('#workbin>#catsites-hidden>#category-site[site=\"'+$(this).attr('site')+'\"]').clone();
			var region=$('#site-panel .site-region');
			region.html(sitecode);
			region.show();
	},function(e){});
	$('.phen-list .container .site-path').hover(function(e){},function(e){
		$('#site-panel').attr('style',"padding:0;background:none;top:34px;");
		$('#site-panel .site-address').attr('style','margin-left:0;');
		$(this).find('#ember28211 li[site] a').attr('style','background:none;');
		$('#site-panel .site-region').hide();
	});
	
	$('.list-container > .box > .table > .row .fields > li[views] > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.list-container > .box > .table > .row .fields > li[likes] > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.list-container > .box > .table > .row .fields > li[replies] > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.list-container > .box > .table > .row .fields > li[follows] > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.list-container > .box > .table > .row .fields > li[connects] > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	$('.list-container > .box > .table > .row .fields > li[author] > a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var the=$(this);
		the.popup('加载中...','background-color:yellow;padding:10px;min-height:200px;max-height:400px;overflow:auto;','bottom.right');
		$.get($(this).attr('href'),{},function(html){
			the.popup(html,'padding:10px;max-height:400px;overflow:auto;','bottom.right');
		}).error(function(e){alert(e.responseText);});
	});
	
	var startpos=parseInt($('.table').attr('count'));
	$(document.body).scrollBottom(function(skip){
		//使用同步
		if(startpos=='0'){
			return 0;
		}
		var pos=skip;
		var path=$('.site-path').attr('path');
		$.ajax({
				url : path,
				type : 'get',
				async: false,//使用同步的方式,true为异步方式
				data : {skip:skip},//这里使用json对象
				success : function(data){
					$('.table').append(data);
					pos=skip+10;//注意与后台limit保持一致
				},
				error:function(e){
					alert(e.responseText);
				}
			});
		return pos;
	},startpos);
});
