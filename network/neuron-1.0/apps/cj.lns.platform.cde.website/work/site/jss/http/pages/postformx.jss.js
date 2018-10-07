/*
 * 2016.0829
 * 作者：赵向彬
 * 说明：
 * <![jss:{
		scope:'runtime',
		extends:'',
		filter:{
	 	}
 	},
 	shit:{
 		name:"fuck"
 	}
 ]>
*/

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil=Java.type('cj.studio.ecm.net.web.WebUtil');

exports.doPage = function(frame,circuit, plug, ctx) {
	print('Content-Type:'+frame.contentType());
	var data = frame.content().readFully();
	var params=WebUtil.parserParam(new String(data));
	print(params);
	
	var doc = ctx.html("/pages/response.html", "utf-8");
	//使用类似jquery的语法来为dom fu zhi
	doc.select('.response>span[name]').html(params.name);
	doc.select('.response>span[age]').html(params.age);
	
	var session=frame.session();
	print('------会话实例：'+session);
	
	 print('------打印jss服务的导入属性和所在芯片信息---------');
	   print('module_name:' + imports.module_name);
	   print('module_home:' + imports.module_home);
	   print('module_ext:' + imports.module_extName);
	   print('module_pack:' + imports.module_package);
	   print('module_unzip:' + imports.module_unzip);
	   print('module_type:' + imports.module_type);
	   print('head jss scope:'+imports.head.jss.scope);
	   print('head shit name:'+imports.head.shit.name);
	   print('location:' + imports.locaction);
	   print('source:' + imports.source);
	   print('selectKey1:' + imports.selectKey1);
	   print('selectKey2:' + imports.selectKey2);
	   print('this is jss chip site ' + chip.site());
	   print('---------');
	   
	circuit.content().writeBytes(doc.toString().getBytes());
}