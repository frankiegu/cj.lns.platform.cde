$(document).ready(function(){
	$('.category-popup .category-settings,.phen-list').delegate('.m-nav .crumb .pro .icon-btn-x','click',function(e){
		var pro=$(this).parent('.pro');
		var key=pro.attr('para-key');
		var name=pro.attr('para-name');
		$(this).parents('.m-nav').find('.groups .group .row[parallel=\"'+name+'\"] .item[key=\"'+key+'\"] .icon-btn-check-small input').prop('checked',false);
		$(this).parent('.pro').remove();
	});
	$('.category-settings .m-nav .group .body .item,.phen-list .m-nav .group .body .item').on('click',function(e){
		if($(this).attr('select-mode')=='muti'){
			e.stopPropagation();
			var pro=$(this).parents('.m-nav').find('#crumb-hidden .pro').clone();
			var row=$(this).parents('.row');
			var crumb=$(this).parents('.m-nav').find('.crumb');
			var checked=$(this).find('.icon-btn-check-small input');
			if(checked.is(':checked')){
				pro.attr('para-key',$(this).attr('key'));
				pro.attr('para-name',row.attr('parallel'));
				crumb.find('.pro[para-name=\"'+row.attr('parallel')+'\"][para-key=\"'+$(this).attr('key')+'\"]').remove();
				var text=$(this).find('.text').html();
				pro.attr('para-value',text);
				text=row.find('.head .title').html()+'：'+text;
				pro.find('span[text]').html(text);
				crumb.append(pro.prop('outerHTML'));
				crumb.find('.pro').show();
				crumb.find('.cat-text').show();
				crumb.find('.cat-ok').show();
				crumb.find('.icon-btn-vbarrow').show();
			}else{
				crumb.find('.pro[para-name=\"'+row.attr('parallel')+'\"][para-key=\"'+$(this).attr('key')+'\"]').remove();
			}
		}else{
			var pro=$(this).parents('.m-nav').find('#crumb-hidden .pro').clone();
			var row=$(this).parents('.row');
			var crumb=$(this).parents('.m-nav').find('.crumb');
			pro.attr('para-key',$(this).attr('key'));
			pro.attr('para-name',row.attr('parallel'));
			crumb.find('.pro[para-name=\"'+row.attr('parallel')+'\"]').remove();
			var text=$(this).find('.text').html();
			pro.attr('para-value',text);
			text=row.find('.head .title').html()+'：'+text;
			pro.find('span[text]').html(text);
			crumb.append(pro.prop('outerHTML'));
			crumb.find('.pro').show();
			crumb.find('.cat-text').show();
			crumb.find('.cat-ok').show();
			crumb.find('.icon-btn-vbarrow').show();
		}
	});
	$('.m-nav .group .foot .switch-multi').on('click',function(e){
		//按筛选板上的选中和撤选
		var row=$(this).parents('.row[parallel]');
		var parallelname=row.attr('parallel');
		var body=$(this).parent('.foot').siblings('.body');
		body.find('.item .icon-btn-check-small input').prop('checked',false);
		var selectes=$(this).parents('.m-nav').find('.crumb .pro[para-name=\"'+parallelname+'\"]');
		for(var i=0;i<selectes.length;i++){
			var sel=selectes[i];
			var key=$(sel).attr('para-key');
			body.find('.item[key=\"'+key+'\"] .icon-btn-check-small input').prop('checked',true);
		}
		var checkbox=$(this).parent('.foot').siblings('.body').find('.item .icon-btn-check-small');
		var item=checkbox.parent('.item');
		var toggle=item.attr('select-mode');
		if(typeof toggle=='undefined'||toggle=='single'){
			item.attr('select-mode','muti');
			checkbox.show();
			$(this).html('多选');
		}else{
			item.attr('select-mode','single');
			checkbox.hide();
			$(this).html('单选');
		}
		
	})
	$('.m-nav .group .foot .show-more').on('click',function(e){
		var items=$(this).parent('.foot').siblings('.body').find('>.items');
		var toggle=items.attr('toggle');
		if(typeof toggle=='undefined'||toggle=='hidden'){
			items.attr('style','height:auto;');
			items.attr('toggle','show');
			$(this).html('收起');
		}else{
			items.attr('style','height:36px;');
			items.attr('toggle','hidden');
			$(this).html('更多');
		}
		
	});
	$('.m-nav .crumb').delegate('.pro span[text]','click',function(e){
		var pro=$(this).parent('.pro');
		var nav=$(this).parents('.m-nav');
		if(nav.attr('usage')=='save'){
			return;
		}
		var address=nav.parents('.parallels').attr('urlpath')+'/'+pro.attr('para-name')+':'+pro.attr('para-key');
		window.location.href=address;
	});
	$('.m-nav .crumb .cat, .m-nav .crumb .cat-ok').on('click',function(e){
		var urlpath=$(this).parents('.parallels').attr('urlpath');
		var rows=$(this).parents('.m-nav').find('.group .row');
		var parallels="";//平行分类最终拼成为：key:value;key:[a,b,c];key:value
		for(var i=0;i<rows.length;i++){
			var row=rows[i];
			var parallel=$(row).attr('parallel');//拿它在选项板中搜
			var pros=$(this).parent('.crumb').find('.pro[para-name=\"'+parallel+'\"]');
			if(pros.length==0){
				continue;
			}
			if(pros.length==1){//单选
				var pro=pros[0];
				var name=$(pro).attr('para-name');
				var key=$(pro).attr('para-key')
				var kv=name+':'+key;
				parallels+=kv+';';
				continue;
			}
			//多选格式
			var kuohao=parallel+":[";//[e,b,c]
			for(var j=0;j<pros.length;j++){
				var pro=pros[j];
				var key=$(pro).attr('para-key');
				kuohao+=key+',';
			}
			kuohao=kuohao.substring(0,kuohao.length-1);
			parallels+=kuohao+'];';
		}
		if(parallels.lastIndexOf(';')>-1){
			parallels=parallels.substring(0,parallels.length-1);
		}
		window.location.href=urlpath+'/'+parallels;
	})
});