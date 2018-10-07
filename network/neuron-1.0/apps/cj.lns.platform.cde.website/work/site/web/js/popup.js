(function($) {
	//content,为弹出框显示的内容
	//position,即往哪方面对齐,top.left显示为上左齐，top.right显示为上右齐,bottom.left显示为下左齐，bottom.right显示为下右齐,上下指弹出框相对于基元素的对齐位置。默认是bottom.left
	//style,为弹出框内cj-popup-panel的样式
	$.fn.popup = function(content,style,position,fixed) {
//		var defaults = {
//			foreground : 'red',
//			background : 'yellow',
//			'min-width':'100px;',
//			'max-height':'100px;'
//		};
//		var opts = $.extend(defaults, options);
		
		if(typeof position=='undefined'||position==''||position==null){
			position='bottom.left';//默认左齐
		}
		if(typeof style=='undefined'||style==''||style==null){
			style='min-width:100px;min-height:100px;padding:10px;background-color: #fff;';//默认左齐
		}
		
		var hidden=$('#cj-popup-hidden');
		if(hidden.length<1){
			hidden=document.createElement('div');
			$(hidden).attr('id','cj-popup-hidden');
			$(hidden).attr('style','display: none;');
			$(hidden).attr('onmouseleave',"javascript:$(this).hide();");
			$(hidden).append('<div id=\"cj-popup-panel\"></div>')
			$('.main').append($(hidden)); 
		}
		$(hidden).find('>#cj-popup-panel').html(content);
		if($(hidden).is(':hidden')){
			$(hidden).show();
		}
		
		var offset=$(this).offset();
		var hoffset=$('.main').offset();
		if(fixed){
			$(hidden).css('position','fixed');
		}else{
			$(hidden).css('position','absolute');
		}
		$(hidden).css('width','auto');
		$(hidden).css('height','auto');
		$(hidden).css('z-index','999');
		
		var panel=$(hidden).find('>#cj-popup-panel');
		panel.attr('style',style);
		
		switch(position){
		case 'bottom.right':
			if(fixed){
				$(hidden).css('top',offset.top+$(this).height()+10);
			}else{
				$(hidden).css('top',(offset.top-hoffset.top)+$(this).height()+10);
			}
			$(hidden).css('left',(offset.left+hoffset.left)-$(hidden).width()+$(this).width()/2);
			break;
		case 'top.left':
			if(fixed){//.main视为0
				$(hidden).css('top',offset.top-$(hidden).height()-10);
			}else{
				$(hidden).css('top',offset.top-hoffset.top-$(hidden).height()-10);
			}
			
			$(hidden).css('left',(offset.left-hoffset.left)+$(this).width()/2);
			break;
		case 'top.right':
			if(fixed){
				$(hidden).css('top',offset.top-$(hidden).height()-10);
			}else{
				$(hidden).css('top',offset.top-hoffset.top-$(hidden).height()-10);
			}
			
			$(hidden).css('left',(offset.left+hoffset.left)-$(hidden).width()+$(this).width()/2);
			break;
		default://bottom.left
			if(fixed){
				$(hidden).css('top',offset.top+$(this).height());
			}else{
				$(hidden).css('top',(offset.top-hoffset.top)+$(this).height());
			}
			$(hidden).css('left',(offset.left-hoffset.left)+$(this).width()/2);
			break;
		}
		
		
	};
	$('#cj-popup-hidden').hover(function(){
		console.log('enter');
	},function(){
		console.log('leave');
	})
})(jQuery);