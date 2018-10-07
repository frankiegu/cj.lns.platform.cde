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
 		authFactory:'authFactory',
 		userPortal:'userPortal'
 	}
 ]>
 */

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil = Java.type('cj.studio.ecm.net.web.WebUtil');
var Document = Java.type('org.jsoup.nodes.Document');
var File = Java.type('java.io.File');
var ArrayList = Java.type('java.util.ArrayList');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var AuthContext = Java.type('cj.lns.platform.cde.embed.auth.AuthContext');
var AccountMode = Java.type('cj.lns.platform.cde.embed.auth.AccountMode');
var Pattern = Java.type('java.util.regex.Pattern');
var Character = Java.type('java.lang.Character');
var Integer = Java.type('java.lang.Integer');
var CdeSubject = Java.type('cj.lns.platform.cde.embed.auth.CdeSubject');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');

exports.doPage = function(frame, circuit, plug, ctx) {
//	var header = ctx.html("/global/header.html",'/', "utf-8");
	var login = ctx.html("/public/authlogin.html",'/', "utf-8");
//	login.head().append(header.head().html());
//	login.head().append(login.head().html());
//	login.body().select(">.main>.header").html(header.body().html());
	url=frame.parameter('url');
	if(url==null){
		url='';
	}
	login.select('.login-form').attr('url',url);
	circuit.content().writeBytes(login.toString().getBytes());
}
