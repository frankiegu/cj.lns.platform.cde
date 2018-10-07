/*
 * 2016.0829
 * 作者：赵向彬
 * 说明：extends可以实现一种类型，此类型将可在java中通过调用服务提供器的.getServices(type)获取到。这样在java代码中直接使用接口间接的调用到jss实现
 * 注意使用extends的限制：
 * 1.jss必须实现该接口的方法，而且一定是导出方法，即声明为exports.method=function格式
 * 	isStronglyJss:true 表示该jss服务使用强jss类型对象，必须指定extends派生接口，这在以注入方式引用jss服务时非常有用，默认是弱类型，即返回ScriptObjectMirror类型
 * 2.filter使用它需要在assembly.json中开启过滤器模式，它用于拦截java服务的方法，即此机制实现了以jss代理java的功能
 * 
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

//var imports = new JavaImporter(java.io, java.lang);
//with (imports) {  
//  var file = new File(__FILE__);  //查找我在哪里？
//  System.out.println('哪里: ' + file.getAbsolutePath());   //内容比较古怪
  // /path/to/my/script.js
//}
var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil=Java.type('cj.studio.ecm.net.web.WebUtil');
var Gson =Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var URLDecoder=Java.type('java.net.URLDecoder');
//本例测试java与jss服务互调
exports.doPage = function(frame,circuit, plug, ctx) {
	var site=plug.site();
	var testjssService=site.getService('$.cj.jss.test.TestJssService');
	testjssService.printEcho('这是在jsspage中调用TestJssService');
	var ss=site.getService('simpleService');
	ss.printEcho('这是让jss拦截java服务simpleService');
	
	var printEcho=site.getService('printEcho');
	printEcho.printEcho('这是调用java服务neuron，java服务的方法可以直接在jss中调用');
	circuit.content().writeBytes('<p>在控制台查看</p>'.getBytes());
}