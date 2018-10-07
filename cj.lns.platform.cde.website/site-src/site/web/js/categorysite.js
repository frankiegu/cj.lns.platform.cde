$(document).ready(function(){
	$('#ember564 .ql-toolbar,.site-path .site-region').delegate('#category-site > .category-left .primaries > .primary','mouseenter mouseleave',function(e){
		if(e.type=='mouseenter'){
			$(this).attr('style','background: #f7f7f7;');
			var primary=$(this).attr('primary');
			var left=$(this).parents('.category-left');
			var tab=left.siblings('#siteworkbin').find('>.subitems[primary=\"'+primary+'\"]').clone();
			var panel=left.siblings('.category-right');
			var html=tab.prop('outerHTML');
			if(html==''||typeof html=='undefined'){
				panel.empty();
			}else{
				panel.html(html);
			}
		}else if(e.type=='mouseleave'){
			$(this).attr('style','background: none;');
		}
		
	});
	$('#ember564 .ql-toolbar,.site-path .site-region').delegate('#category-site > .category-right','mouseenter mouseleave',function(e){
		var primary=$(this).find('>.subitems').attr('primary');
		var prili=$(this).siblings('.category-left').find('.primaries > .primary[primary=\"'+primary+'\"]');
		if(e.type=='mouseenter'){
			prili.attr('style','background: #f7f7f7;');
		}else if(e.type='mouseleave'){
			prili.attr('style','background: none;');
		}
	});
})