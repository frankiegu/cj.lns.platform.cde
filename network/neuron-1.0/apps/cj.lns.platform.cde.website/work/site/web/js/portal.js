$(document).ready(function(){
	$('#ember914>li>a').on('click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		window.history.pushState(null, null,$(this).attr('href'));
		$('#ember914>li').removeClass('active');
		var theli=$(this).parent('li');
		theli.addClass('active');
		//打开模块
		$.get($(this).attr('href'),{},function(data){
			$('.user-table').html(data);
//			//打印工具，如果模块的工具不存在则添加。
			var toolsdata=$('#tools-data');
			var tools=$('.user-main .about.collapsed-info .controls ul');
			tools.empty();
			if(toolsdata.length>0){
				var toolsjson=$('#tools-data').text();
				var module=$('#tools-data').attr('module');
				var toolsobj=$.parseJSON(toolsjson);
				var old=tools.siblings('#tool-template').find('li[id=\"ozt_tool_99999\"]');
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
			
		}).error(function(e){
			alert(e.responseText);
		})
	});
	//默认打开选中的模块
	$('#ember914>li.active>a').trigger('click');
	
});