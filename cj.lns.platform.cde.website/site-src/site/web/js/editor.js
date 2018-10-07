$(document).ready(function(){
	var savebutton=$('.header .contents .panel .widget-button[aria-label=\"save\"]');
	
	function select(el){
	      var el = $(el)[0];
	      if (window.getSelection) {//ie11 10 9 ff safari
	          el.focus(); //解决ff不获取焦点无法定位问题
	          var selection = window.getSelection();//创建range
	 
	          selection.selectAllChildren(el);//range 选择obj下所有子内容
	          selection.collapseToStart();//光标移至最后
	                  //  selection.collapse(el, 1);
	          
	      }else if (document.selection) {//ie10 9 8 7 6 5
	          var range = document.selection.createRange();//创建选择对象
	          range.moveToElementText(el);//range定位到obj
	          range.collapse(false);//光标移至最后
	          range.select();
	      }
	  }
	//同步工具条状态
	function captureEditorStatus(){
		var r=selectRange();
		var end=r.endContainer;
		var parent=$(end).parents('b');
		if(parent.length>0){
			if(!selectTools.bold){
				$('.ql-toolbar .ql-li-bold').addClass('ql-active');
				selectTools.bold=true;
			}
		}else{
			if(selectTools.bold){
				$('.ql-toolbar .ql-li-bold').removeClass('ql-active');
				selectTools.bold=false;
			}
		}
		parent=$(end).parents('i');
		if(parent.length>0){
			if(!selectTools.italic){
				$('.ql-toolbar .ql-li-italic').addClass('ql-active');
				selectTools.italic=true;
			}
		}else{
			if(selectTools.italic){
				$('.ql-toolbar .ql-li-italic').removeClass('ql-active');
				selectTools.italic=false;
			}
		}
		parent=$(end).parents('u');
		if(parent.length>0){
			if(!selectTools.underline){
				$('.ql-toolbar .ql-li-underline').addClass('ql-active');
				selectTools.underline=true;
			}
		}else{
			if(selectTools.underline){
				$('.ql-toolbar .ql-li-underline').removeClass('ql-active');
				selectTools.underline=false;
			}
		}
		parent=$(end).parents('ol');
		if(parent.length>0){
			if(selectTools.listStyle!='ordered'){
				$('.ql-toolbar .ql-li-list[value=ordered]').addClass('ql-active');
				selectTools.listStyle='ordered';
			}
		}else{
			if(selectTools.listStyle=='ordered'){
				$('.ql-toolbar .ql-li-list[value=ordered]').removeClass('ql-active');
				selectTools.listStyle='none';
			}
		}
		parent=$(end).parents('ul');
		if(parent.length>0){
			if(selectTools.listStyle!='bullet'){
				$('.ql-toolbar .ql-li-list[value=bullet]').addClass('ql-active');
				selectTools.listStyle='bullet';
			}
		}else{
			if(selectTools.listStyle=='bullet'){
				$('.ql-toolbar .ql-li-list[value=bullet]').removeClass('ql-active');
				selectTools.listStyle='none';
			}
		}
		parent=$(end).parents('blockquote');
		if(parent.length>0){
			if(!selectTools.blockquote){
				$('.ql-toolbar .ql-li-blockquote').addClass('ql-active');
				selectTools.blockquote=true;
			}
		}else{
			if(selectTools.blockquote){
				$('.ql-toolbar .ql-li-blockquote').removeClass('ql-active');
				selectTools.blockquote=false;
			}
		}
		parent=$(end).parents('a');
		if(parent.length>0){
			if(!selectTools.a){
				$('.ql-toolbar .ql-li-link').addClass('ql-active');
				selectTools.a=true;
			}
		}else{
			if(selectTools.a){
				$('.ql-toolbar .ql-li-link').removeClass('ql-active');
				selectTools.a=false;
			}
		}
	}
	//http://www.w3school.com.cn/xmldom/dom_range.asp
	//http://www.360doc.com/content/12/0420/16/2716732_205205250.shtml execCommand用法大全
	//http://blog.sina.com.cn/s/blog_7c626ff601018nib.html execCommand包含列表项
	function selectRange(){
		var userSelection, rangeObject;
	      if (window.getSelection) {//ie11 10 9 ff safari
	    	  userSelection = window.getSelection();//创建range
	      }else if (document.selection) {//ie10 9 8 7 6 5
	    	  userSelection = document.selection.createRange();//创建选择对象
	      }
	    //Range对象
	      rangeObject = userSelection;
	      if (userSelection.getRangeAt) {
	          //现代浏览器
	          rangeObject = userSelection.getRangeAt(0);
	      }
//	      if(rangeObject.collapsed){//如果为空
//	    	  var parent=rangeObject.startContainer;
//	    	  $(parent).html('<b></b>');
//	      }else{
//	    	  var start=rangeObject.startOffset;
//	    	  var end=rangeObject.endOffset;
//	    	  var common=rangeObject.commonAncestorContainer;
//	    	  var html=$(common).html();
//	    	  html=html.substring(0,start)+'<strong>'+html.substring(start,end)+'</strong>'+html.substring(end,html.length);
//	    	  $(common).html(html);
//	      }
	     return rangeObject;
	  }
	function followEle(e){
		if(e==null||typeof e=='undefined')return;
		$('.embed-insertion-control').attr('style','top:'+($(e).offset().top+2)+'px;'+'left:'+($(e).offset().left-40)+'px;');
	}
	function findPInEditor(ctr){
		//查找当前p位置并在前面插入
		var ctop=ctr.offset().top;
		var parr=$('#ember1120 >.ql-editor>p');
		for(var i=0;i<parr.length;i++){
			var p=parr[i];
			var ptop=$(p).offset().top;
			if(ctop-ptop<=10){
				//插入工具条
				return $(p);
			}
		}
	}
	window.onresize=function(){
		var p=findPInEditor($('#ember1017 .embed-insertion-control'));
		if(p&&p.length>0){
			followEle(p);
		}else{
			followEle($('#ember1120 >.ql-editor>p'));
		}
	}
	followEle($('#ember1120 >.ql-editor>p'));
	function selectPInEditor(){
		var r=selectRange();
		var end=r.endContainer;
		function getRoot(e){
			if(!e){
				return;
			}
			var p=e.parentElement;
			if($(p).is(".ql-editor")){
				return e;
			}
			return getRoot(p);
		}
		var p=getRoot(end);
		followEle(p);
		selectTools.current=p;
		selectTools.currentRange=r;
		
		return p;
	}
	$(document.body).scroll(function(){
		selectPInEditor();
	});
	$('#ember1120 >.ql-editor').focus();
	select($('#ember1120 >.ql-editor>p'));
	$('#ember1120 >.ql-editor').keyup(function(e){
		if($(this).text().trim()==''||$(this).text().trim()=='<br>'){
			$(this).empty();
			$(this).append("<p><br></p>");
			$(this).focus();
			select($('#ember1120 >.ql-editor>p'));
			$(this).attr('data-placeholder',$(this).attr('aria-label'));
		}else{
			$(this).removeAttr('data-placeholder');
		}
		
	});
	
	$('#ember1017 .embed-insertion-control').on('click',function(e){
		var defau=$(this).find('.slate-insertion-control-default-icon');
		defau.toggle();
		var active=$(this).find('.slate-insertion-control-active-icon');
		active.toggle();
		if(defau.is(":hidden")){
			var p =findPInEditor($(this));
			var tools=$('.slate-embed-toolbar-wrapper');
			tools.attr('id','ql-tools');
			p.before(tools.clone());
			$('#ember1120 >.ql-editor').removeAttr('data-placeholder');
			$('#ember1120 >.ql-editor #ql-tools').show();
		}
		if(active.is(":hidden")){
			$('#ember1120 >.ql-editor #ql-tools').remove();
		}
	})
	$('#ember1120 >.ql-editor').delegate('.slate-embed-toolbar>button','click',function(e){
		$('#ember1120 >.ql-editor #ql-tools').remove();
		$('#ember1017 .embed-insertion-control .slate-insertion-control-default-icon').toggle();
		$('#ember1017 .embed-insertion-control .slate-insertion-control-active-icon').toggle();
		var select=$(this).attr('data-toolbar-button-type');
//		console.log(select);
		switch(select){
		case 'image':
			var p =findPInEditor($('#ember1017 .embed-insertion-control'));
			var n=$('#workbin .slate-image-embed').clone();
			$(n).attr('use','tool');
			n.find('.slate-placeholder-file').attr('id','slate-inline-image-uploader');
//			var n='<div user=\"tool\" class=\"cj-pic-panel\">请将图片拖动或粘贴到此位置</div>'
			p.before(n);
			//n.show();
			break;
		case 'video':
			var p =findPInEditor($('#ember1017 .embed-insertion-control'));
			var n=$('#workbin .slate-video-embed').clone();
			n.attr('use','tool')
			p.before(n);
			n.show();
			break;
		case 'universal':
			var p =findPInEditor($('#ember1017 .embed-insertion-control'));
			var n=$('#workbin .slate-universal-embed').clone();
			n.attr('use','tool')
			p.before(n);
			n.show();
			break;
		case 'code':
			var p =findPInEditor($('#ember1017 .embed-insertion-control'));
			var n=$('#workbin .ql-syntax').clone();
			n.attr('use','tool')
			p.before(n);
			n.show();
			break;
		}
		$(this).focus();
	});
	$('#ember1120 ').delegate('.ql-editor','click',function(e){
//		followEle($(this));
		selectPInEditor();
		captureEditorStatus();
	})
	$('#ember1120 >.ql-editor').keyup(function(e){
		selectPInEditor();
		captureEditorStatus();
	})
	$('#ember1120 >.ql-editor').on('select',function(e){
		captureEditorStatus();
	})
	$('#ember1120 >.ql-editor').delegate('.slate-embed-placeholder .slate-embed-close-button','click',function(e){
		$(this).parents('.slate-embed-placeholder').remove();
		//followEle($(this));
	})
	$("#ember1120 >.ql-editor").delegate('.ql-syntax',"paste", function(e) { 
		var pastedText = undefined;
        if (window.clipboardData && window.clipboardData.getData) { // IE
            pastedText = window.clipboardData.getData('Text');
          } else {
            pastedText = e.originalEvent.clipboardData.getData('Text');//e.clipboardData.getData('text/plain');
          }
        
       $(this).html(pastedText);//语法着色
       return false;
	});
	$('#ember1017').delegate('#ember1052','mouseenter mouseleave',function(e){
		if(e.type=='mouseenter'){
			$(this).find('.slate-embed-close-button').show();
		}else if(e.type=='mouseleave'){
			$(this).find('.slate-embed-close-button').hide();
		}
	});
	$('#ember1017').delegate('.slate-embed-close-button','click',function(e){
		e.stopPropagation();
		var c=$(this).parents('#ember1052').clone();
		$(this).parents('#ember1052').remove();
		c.attr('name','coverimg');
		c.hide();
		$('#workbin').append(c);
		$('#ember1226').show();
		return false;
	})
	$('#ember1226').on('click',function(e){
		$('#ember1226').hide();
		var cover=$('#workbin').find('>#ember1052').clone();
		$('#workbin').find('>#ember1052').remove();
		$('#ember1017').prepend(cover);
		cover.show();
	})
	$('#ember564 .zen-nav .ql-toolbar .ql-li-heading .ql-picker-label').on('click',function(e){
		var the=$(this).siblings('.ql-picker-options');
		if(the.is(':hidden')){
			the.attr('style','display:block;');
		}else{
			the.attr('style','display:none;');
		}
	});
	
	var selectTools={fontStyle:'false',bold:false,italic:false,underline:false,listStyle:'none',blockquote:false,a:false}
	//http://blog.csdn.net/cui_angel/article/details/7837749
	//http://blog.csdn.net/truong/article/details/18658895
	var funGetSelectTxt = function() {
	    var txt = '';
	    if(document.selection) {
	        txt = document.selection.createRange().text;
	    } else {
	        txt = document.getSelection();
	    }
	    return txt.toString();
	};
	$('#ember564 .zen-nav .ql-toolbar .ql-li-heading .ql-picker-options .ql-picker-item').on('click',function(e){
		$(this).parent('.ql-picker-options').hide();
		selectTools.fontStyle=$(this).attr('data-value');
		$(this).parent('.ql-picker-options').siblings('.ql-picker-label').html($(this).html());
		var p=selectTools.current;
		if(!p){
			return;
		}
		switch(selectTools.fontStyle){
		case '1'://h2
			if($(p).find('h3').length>0){
				var html=$(p).find('h3').html();
				$(p).html(html);
			}
			if($(p).find('h2').length<1){
				$(p).html('<h2>'+$(p).html()+'</h2>');
			}
			break;
		case '2'://h3
			if($(p).find('h2').length>0){
				var html=$(p).find('h2').html();
				$(p).html(html);
			}
			if($(p).find('h3').length<1){
				$(p).html('<h3>'+$(p).html()+'</h3>');
			}
			break;
		case 'false':
			if($(p).find('h2').length>0){
				var html=$(p).find('h2').html();
				$(p).html(html);
			}
			if($(p).find('h3').length>0){
				var html=$(p).find('h3').html();
				$(p).html(html);
			}
			break;
		}
			
	})
	$(document).on('click',function(e){
		var tip=$('#ember1120 .ql-tooltip');
		if(!tip.is('.ql-hidden')){
			tip.addClass('ql-hidden');
		}
	})
	$('#ember1120 .ql-tooltip .ql-link-editor').on('click',function(e){
		return false;//阻止单击事件传至文档，因为点文档其它部分要清除提示
	})
	function posAt(tip,r){//弹出并定位超链接输入面板
		var start=r.startOffset;
		var end =r.endOffset;
		var prect=document.getElementById('ember1120').getBoundingClientRect();
		var crect=r.getBoundingClientRect();
//		console.log(crect);
//		console.log(prect);
		var left;
		var top;
		if(crect.width<1){//如果没有选择文本则没有宽和高
			 left=crect.x-prect.x;
			 top=(crect.y-prect.y)+crect.height;
			 $('.ql-tooltip .ql-link-editor').attr('style','top:-125px;');
			 $(".ql-tooltip").find('#url-input').show();
			 $(".ql-tooltip").find('#text-input').show();
		}else{//如果选择了，则矩形有长有宽
			left=(crect.x-prect.x)+(crect.width/2);
			top=(crect.y-prect.y)+(crect.height/2+10);
			$(".ql-tooltip").find('#url-input').show();
			 $(".ql-tooltip").find('#text-input').hide();
			 $('.ql-tooltip .ql-link-editor').attr('style','top:-90px;');
		}
		$(".ql-tooltip").attr('style','left:'+left+'px;top:'+top+'px;');
	}
	$('#ember1120 .ql-editor').on('mouseleave',function(e){
		selectPInEditor();
	})
	$('#ember1120 .ql-tooltip .ql-save').on('click',function(e){
		var r=selectTools.currentRange;
		if(r.collapsed){
			var text=$('#text-input').val();
			var url=$('#url-input').val();
			if(url==''){
				alert('地址输入为空');
				return;
			}
			if(text==''){
				alert('文本输入为空');
				return;
			}
			var c=r.endContainer;
			var html=c.textContent;
			var val=html.substring(0,r.endOffset)+'<a href="'+url+'" >'+text+'</a>'+html.substring(r.endOffset,html.length);
			$(c).replaceWith(val);
			$(this).parents('.ql-tooltip').addClass('ql-hidden');
			selectTools.a=true;
			$('.ql-toolbar .ql-li-link').addClass('ql-active');
			return;
		}
		//以下处理用户选中的文本
		var url=$('#url-input').val();
		if(url==''){
			alert('地址输入为空');
			return;
		}
		if(r.startContainer===r.endContainer){
			var c=r.endContainer;
			var html=c.textContent;
			var val=html.substring(0,r.startOffset)+'<a href="'+url+'">'+html.substring(r.startOffset,r.endOffset)+'</a>'+html.substring(r.endOffset,html.length);
			$(c).replaceWith(val);
			$(this).parents('.ql-tooltip').addClass('ql-hidden');
			return;
		}
		//如果开始与结束不是同一节点，则从开始节点插链接，而后中间节点的开头和尾部插链节，最后节点插链接
		var start=r.startContainer;
		var end=r.endContainer;
		
		var next=start.nextSibling;
		var html='';
		var current=next;
		while(current!=null){
			if(current===end){
				break;
			}
			//处理中间节点
			next=current.nextSibling;
			html=(current.outerHTML!=null&&(typeof current.outerHTML)!='undefined')?current.outerHTML:current.nodeValue;
			if(html!=null&&html!=''&&html!='<br>'){
				var val='<a href="'+url+'">'+html+'</a>';
				$(current).replaceWith(val);
			}
			current=next;
		}
		html=(start.outerHTML!=null&&(typeof start.outerHTML)!='undefined')?start.outerHTML:start.nodeValue;
		var val=html.substring(0,r.startOffset)+'<a href="'+url+'">'+html.substring(r.startOffset,html.length)+'</a>';
		$(start).replaceWith(val);
		
		html=(end.outerHTML!=null&&(typeof end.outerHTML)!='undefined')?end.outerHTML:end.nodeValue;
		var val='<a href="'+url+'">'+html.substring(0,r.endOffset)+'</a>'+html.substring(r.endOffset,html.length);
		$(end).replaceWith(val);
		$(this).parents('.ql-tooltip').addClass('ql-hidden');
		
	});
	$('#ember1120 .ql-tooltip #url-input').keyup(function(e){
		if(e.keyCode==13){
			$(this).siblings('.ql-save').trigger('click');
		}
	});
	$('#ember564 .zen-nav .ql-toolbar .button-group button').on('click',function(e){
		if($(this).is('.ql-li-link')){//处理超链接
			//document.execCommand("CreateLink",false,'http://cjlns.com'); //Unlink
			var r=selectTools.currentRange;
			var tip=$('.ql-tooltip');
			if(selectTools.a){//取消超链接
				var end=r.endContainer;
				if(end.nodeName='A'){
//					var html=(end.outerHTML!=null&&(typeof end.outerHTML)!='undefined')?end.outerHTML:end.nodeValue;
					$(end.parentElement).replaceWith(end);
					selectTools.a=false;
					$('.ql-toolbar .ql-li-link').removeClass('ql-active');
					
				}else{
					var parent=$(r.endContainer.parentElement).parents('a');
					if(parent.length>0){
						var html=$(parent).html();
						$(parent).replaceWith(html);
						selectTools.a=false;
						$('.ql-toolbar .ql-li-link').removeClass('ql-active');
					}
				}
				
			}else{//设置
				posAt(tip,r);
				tip.removeClass('ql-hidden');
			}
			$('.ql-editor').focus();
			return false;
		}
		if($(this).is('.ql-li-bold')){
			if(selectTools.bold){
				selectTools.bold=false;
				$(this).removeClass('ql-active');
				document.execCommand("Bold",false,false); 
			}else{
				selectTools.bold=true;
				$(this).addClass('ql-active');
//				var text=funGetSelectTxt();
//				alert(text);
				document.execCommand("Bold",false,true); 
			}
			$('.ql-editor').focus();
			return;
		}
		if($(this).is('.ql-li-italic')){
			if(selectTools.italic){
				selectTools.italic=false;
				$(this).removeClass('ql-active');
				document.execCommand("Italic",false,false); 
			}else{
				selectTools.italic=true;
				$(this).addClass('ql-active');
				document.execCommand("Italic",false,true); 
			}
			$('.ql-editor').focus();
			return;
		}
		if($(this).is('.ql-li-underline')){
			if(selectTools.underline){
				selectTools.underline=false;
				$(this).removeClass('ql-active');
				document.execCommand("Underline",false,false); 
			}else{
				selectTools.underline=true;
				$(this).addClass('ql-active');
				document.execCommand("Underline",false,true); 
			}
			$('.ql-editor').focus();
			return;
		}
		if($(this).is('.ql-li-blockquote')){
			if(selectTools.blockquote){
				selectTools.blockquote=false;
				$(this).removeClass('ql-active');
				var p=selectPInEditor();
				if(p){
					if($(p).find('blockquote').length>0){
						var html=$(p).find('blockquote').html();
						$(p).html(html);
					}
				}
			}else{
				selectTools.blockquote=true;
				$(this).addClass('ql-active');
				var p=selectPInEditor();
				if(p){
					if($(p).find('blockquote').length<1){
						$(p).html('<blockquote>'+$(p).html()+'</blockquote>');
					}
				}
			}
			$('.ql-editor').focus();
			return;
		}
		if($(this).is('.ql-li-link')){
			alert('文本位置上方');
			return;
		}
		if($(this).is('.ql-li-list')){
			var val=$(this).attr('value');
			$(this).parent('.button-group').find('>button').removeClass('ql-active');
			if(val==selectTools.listStyle){
				selectTools.listStyle='none';
				document.execCommand("InsertOrderedList",false,false); 
				document.execCommand("InsertUnorderedList",false,false); 
				return;
			}
			if(val=='ordered'){
				$(this).addClass('ql-active');
				document.execCommand("InsertOrderedList",false,true); 
			}else if(val='bullet'){
				$(this).addClass('ql-active');
				document.execCommand("InsertUnorderedList",false,true); 
			}
			selectTools.listStyle=val;
			$('.ql-editor').focus();
			return;
		}
	})
	$('.header .contents').undelegate('.panel .widget-button','click');
	$('.header .contents').delegate('.panel .widget-button','click',function(e){
		var action=$(this).attr('aria-label');
		var the=$(this);
		var title=$('#ember1111').val();
		if(title==''){
			alert('标题为空');
			return;
		}
		var html=$('#ember1120 >.ql-editor').html();
		if(html==''){
			alert('内容为空');
			return;
		}
		var path=$('.ql-toolbar > .category-panel .category-popup .category-wrap .category-settings').attr('path');
		
		//var coverimg=$('#ember1062 .cover').attr('src');
		switch(action){
		case 'save':
			the.parents('.panel').find('>span[state]').remove();
			var span=the.parent('span');
			span.before('<span state style="color:gray;padding-right:10px;">正在保存...</span>');
			var state=span.parent('.panel').find('>span[state]');
			var id=$(this).parent('span').attr('saved-id');
			var img=$('#ember1062 .cover-image__image');
			var coverimg='';
			if(img.length>0){
				coverimg=img.css("background-image");
				//url("http://www.cjlns.com/resource/ud/cdcbf953-b2b3-4b92-8356-b2d81e70421c_1e39a1e3eaaa817edfefcdb5c96406ed.jpg?path=home://pictures/&u=cj")
				coverimg=coverimg.substring('url(\"'.length,coverimg.length-2);
			}
			var coverstyle=img.attr('style');
			$.ajax({
			    type: 'POST',
			    url: '/post/drafts.service' ,
			    async : false,
			    data: {id:id,title:title,coverimg:coverimg,coverstyle:coverstyle,html:html} ,
			    dataType: 'json',
			    success: function(obj){
			    	//var obj=$.parseJSON(data);
					span.attr('saved-id',obj.id);
					$(state).html('已保存');
			    } ,
			    error:function(e){
			    	alert(e.responseText);
			    }

			});
			
			break;
		case 'publish':
			if(path==''||typeof path=='undefined'){
				alert('未有选择发布到的站点位置，当前主题必须存放在三级分类下.');
				return;
			}
			$(this).parents('.panel').find('.widget-button[aria-label=save]').trigger('click');
			var id=$(the).parent('span').attr('saved-id');
			var paras=$('.m-nav .crumb .pro');
			var parallels="";
			//{"chima":"XL","jidu":"2016spring","webportal":['spring_mvc','struts2','jss']}
			//搜索所有平行分类，循环，取得每个平分分类路径下是否存在多个度量
			var rows=$('.m-nav .group .row[parallel]');
			var mnav=rows.parents('.m-nav');
			for(var i=0;i<rows.length;i++){
				var row=rows[i];
				var paraname=$(row).attr('parallel');
				var selectparas=mnav.find('.crumb .pro[para-name=\"'+paraname+'\"]');
				if(selectparas.length<1){
					continue;
				}
				if(selectparas.length==1){//同一维度只有一个选项时
					var parakey=selectparas.attr('para-key');
					parallels=parallels+"\""+paraname+"\":\""+parakey+"\",";
					continue;
				}
				//同一维度有多个选项时
				var value="[";
				for(var j=0;j<selectparas.length;j++){
					var one=selectparas[j];
					var parakey=$(one).attr('para-key');
					value=value+"'"+parakey+"',";
				}
				if(value!=''){
					value=value.substring(0,value.length-1);
				}
				value+=']';
				parallels=parallels+"\""+paraname+"\":"+value+",";
			}
			
			if(parallels!=''){
				parallels=parallels.substring(0,parallels.length-1);
			}
			parallels="{"+parallels+"}";
//			console.log(parallels);
			$.post('/post/publish.service',{id:id,path:path,parallels:parallels},function(data){
				var obj=$.parseJSON(data);
				window.location.href='/users/'+obj.user+'/activity/topics';
			}).error(function(e){
				alert(e.responseText);
			});
			break;
		}
	});
	$('.ql-toolbar>.category-panel').hover(function(e){
		$(this).children('.category-popup').show();
	},function(e){
		$(this).children('.category-popup').hide();
	})
	$('.ql-toolbar>.category-panel>span[site]').hover(function(e){
		var site=$(this).attr('site');
		var html=$('#workbin>#sites>#category-site[site=\"'+site+'\"]').clone().prop('outerHTML');
		var popup=$(this).siblings('.category-popup');
		if(html==''||typeof html=='undefined'){
			popup.find('>.category-wrap>.category-region').empty();
		}else{
			popup.find('>.category-wrap>.category-region').html(html);
		}
		
		$(this).parent('.category-panel').children('span[site]').attr('style','background: none;');
		$(this).attr('style','background: #e1e9ee;');
		popup.attr('selectsite',$(this).attr('site'));
	},function(e){
		
	})
	$('.ql-toolbar>.category-panel >.category-popup').hover(function(e){
		var select=$(this).attr('selectsite');
		if(select==''||typeof select=='undefined'){
			select='site.b2c';
		}
		$(this).siblings('span[site=\"'+select+'\"]').attr('style','background: #e1e9ee;');
	},function(e){
		$(this).siblings('span[site]').attr('style','background: none;');
	});
	$('#ember564 .zen-nav .ql-toolbar').delegate('.category-popup a,span[site] a','click',function(e){
		//防点超链接打开，并修改浏览器地址
		e.preventDefault();
		var level=$(this).attr('cat-level');
		if(typeof level=='undefined'||level==null||level==''){
			return;
		}
		var settings=$('#ember564 .zen-nav .ql-toolbar .category-popup .category-settings ');
		var href=$(this).attr('href');
		href=href.substring('/path/'.length,href.length);
		var pos=href.indexOf('/');
		href=href.substring(0,pos)+':/'+href.substring(pos,href.length);
		settings.attr('path',href);
		settings.attr('cat-level',$(this).attr('cat-level'));
		var dpath=$(this).attr('dpath');
		if(dpath!=''&&typeof dpath!='undefined'){
			settings.find('span[address]').html(dpath);
		}else{
			settings.find('span[address]').html(href);
		}
		//在三级分类上弹出平行分类面板
		if(level=='3'){
			//usage=save时表示不要多选，否则使用多选
			$.post('/views/parallel.html',{path:href,usage:'save'},function(data){
				var para=settings.find('.category-parallels');
				para.html(data);
				para.show();
			}).error(function(e){
				alert(e.responseText);
			})
		}
	});
	$('#ember1017').delegate('#slate-inline-image-uploader','change',function(e){
		var val=$(this).val();
		if(val==''){
			alert('未选择图片');
			return;
		}
		savebutton.trigger('click');
		var docid=$('.header .contents .panel span[saved-id]').attr('saved-id');
		if(docid==null||docid==''){
			alert('文档还没保存。');
			return;
		}
		var sie=$(this).parents('.slate-image-embed');
		$.ajaxFileUpload({
			url : '/post/upload-pic.service', // 用于文件上传的服务器端请求地址
			secureuri : false, // 一般设置为false
			fileElementId : 'slate-inline-image-uploader',
			dataType : 'json',// 返回值类型 一般设置为json
			data : {docid:docid},
			success : function(data, status) {
				var src = data.src.replace('&amp;', '&');
				var fn = data.fn;
				sie.before("<div class='cj-pic-panel'><img src='"+src+"'></div>")
				sie.remove();
				savebutton.trigger('click');
			},
			error : function(data, status, e) {
				alert(e);
			}
		});
	});
	$('#ember1017').delegate('#cover-image__file-input','change',function(e){
		var val=$(this).val();
		if(val==''){
			alert('未选择图片');
			return;
		}
		$.ajaxFileUpload({
			url : '/post/upload-coverimg.service', // 用于文件上传的服务器端请求地址
			secureuri : false, // 一般设置为false
			fileElementId : 'cover-image__file-input',
			dataType : 'json',// 返回值类型 一般设置为json
			data : {},
			success : function(data, status) {
				var src = data.src.replace('&amp;', '&');
				var fn = data.fn;
				var docid=$('.header .contents .panel span[saved-id]').attr('saved-id');
				
				$('#ember1017 .cover-image__label').remove();
				var ember=$('#workbin #cover-region #ember1359').clone();
				$('#ember1017 #ember1062').html(ember);
				$('#ember1017 #ember1062 .cover-image__image').attr('style','background-image:url('+src+')');
				$('#ember1017 #ember1359 .cover-image__image').attr('docid',docid);
				
				$('.header .contents .panel .widget-button[aria-label=\"save\"]').trigger('click');
			},
			error : function(data, status, e) {
				alert(e);
			}
		});
	});
	$('#ember1017').delegate('#ember1359 .cover-image__toolbar li[action]','click',function(e){
		var ul=$(this).parent('ul');
		ul.find('li[action] button.active').removeClass('active');
		var action=$(this).attr('action');
		var cover=$(this).parents('#ember1359').find('.cover-image__image');
		$(this).find('button[data-ember-action]').addClass('active');
		var style=cover.attr('style');
		var url=style.substring('background-image:'.length,style.indexOf(')')+1);
		var the=$(this);
		switch(action){
		case 'cover':
			cover.attr('style','background-image:'+url+';background-size:cover;');
			$('.header .contents .panel .widget-button[aria-label=\"save\"]').trigger('click');
			break;
		case 'contain':
			cover.attr('style','background-image:'+url+';background-size:contain;');
			$('.header .contents .panel .widget-button[aria-label=\"save\"]').trigger('click');
			break;
		case 'remove':
			//url(http://www.cjlns.com/resource/ud/1cbe0be3-4b4c-4a73-babb-9902166a3596_1e39a1e3eaaa817edfefcdb5c96406ed.jpg?path=home://pictures/&u=cj)
			var coverimg=url.substring(4,url.length-1);
			var filename=coverimg.substring(0,coverimg.indexOf('?'));
			filename=filename.substring(filename.lastIndexOf('/')+1,filename.length);
			var path=coverimg.substring(coverimg.indexOf('?')+1,coverimg.length);
			var user=path.substring(path.indexOf('&u=')+3,path.length);
			var dir=path.substring(path.indexOf('path=home://')+11,path.indexOf('&'));
			var docid=$('#ember1017 #ember1359 .cover-image__image').attr('docid');
			$.post('/post/delete-coverimg.service',{docid:docid,user:user,dir:dir,filename:filename},function(data){
				var copy=$('#workbin #cover-region #ember89238').clone();
				copy.find('.cover-image__file-input').attr('id','cover-image__file-input');
				$('#ember1017 #ember1062').empty();
				$('#ember1017 #ember1062').html(copy.html());
				$('.header .contents .panel .widget-button[aria-label=\"save\"]').trigger('click');
			}).error(function(e){alert(e.responseText)});
			break;
		}
		
	});
	//dragenter drop dragover
	 $('.ql-editor').delegate('.cj-pic-panel','dragover drop',function(e){
		 if(e.type=='dragover'){
			 e.preventDefault();
			 return true;
		 }
		 if(e.type=='drop'){
			
		 }
	 });
	 $('.ql-editor').delegate('.slate-universal-embed #slate-embed-placeholder-input','keyup',function(e){
		 if(e.keyCode==13){
			 var panel=$(this).parents('.slate-universal-embed');
			 var url=$(this).val();
			 $.post('/views/fetch-href-resource.service',{url:url},function(html){
				panel.before("<div class='cj-href-resource'>"+html+"</div>") ;
				panel.remove();
			 }).error(function(e){alert(e.responseText);})
		 }
	 })
});