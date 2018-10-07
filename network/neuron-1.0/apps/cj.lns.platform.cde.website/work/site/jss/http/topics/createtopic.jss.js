/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：
 * <![jss:{
		scope:'runtime',
		extends:'',
		filter:{
	 	}
 	},
 	services:{
 		menu:"menuService"
 	}
 ]>
*/

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil=Java.type('cj.studio.ecm.net.web.WebUtil');
var Document=Java.type('org.jsoup.nodes.Document');
var File=Java.type('java.io.File');
var ArrayList=Java.type('java.util.ArrayList');
var FileHelper=Java.type('cj.ultimate.util.FileHelper');
var Gson=Java.type('cj.ultimate.gson2.com.google.gson.Gson');


exports.doPage = function(frame,circuit, plug, ctx) {
	print(frame);
	
}
