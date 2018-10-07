$(document).ready(function(){
	$('#ember1972>li>a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		window.history.pushState(null, null,$(this).attr('href'));
		$('#ember1972>li>a').removeClass('active');
		$(this).addClass('active');
		$('#ember914>#'+$(this).parents('ul[module]').attr('module')).attr('activeview',$(this).parent('li[id]').attr('id'));
		//打开视图
		$.get($(this).attr('href'),{},function(data){
			//打印工具，如果模块的工具不存在则添加。
			var toolsdata=$('#tools-data');
			var tools=$('.user-main .about.collapsed-info .controls ul');
			var old=tools.siblings('#tool-template').find('li[id=\"ozt_tool_99999\"]');
			tools.empty();
			if(toolsdata.length>0){
				var toolsjson=$('#tools-data').text();
				var module=$('#tools-data').attr('module');
				var toolsobj=$.parseJSON(toolsjson);
				for(var i=0;i<toolsobj.length;i++){
					var obj=toolsobj[i];
					var exists=tools.find('li[id=\"'+module+'.'+obj.id+'\"]');
					if(exists.length==0){
						var tool=old.clone();
						tool.attr('id',module+'.'+obj.id);
						tool.attr('title',obj.tip);
						var a=tool.find('>a');
						a.html(obj.name);
						a.attr('href',obj.href);
						tools.append(tool);
					}
				}
			}
			$('.user-right').html(data);
		}).error(function(e){
			alert(e.responseText);
		})
	});
	//强制打开选中的视图
	var activemodule=$('#ember1972').attr('module');
	var activeview=$('#ember914>#'+activemodule).attr('activeview');
	if(typeof activeview !='undefined'&&activeview!=null&&activeview!=''){
		$('#ember1972>li>a.active').removeClass('active');
		$('#ember1972>li[id='+activeview+']>a').addClass('active');
	}
	$('#ember1972>li>a.active').trigger('click');
});