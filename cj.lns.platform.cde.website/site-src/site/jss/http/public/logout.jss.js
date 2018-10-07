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
 		authFactory:'authFactory'
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
var AuthContext=Java.type('cj.lns.platform.cde.embed.auth.AuthContext');
var AccountMode=Java.type('cj.lns.platform.cde.embed.auth.AccountMode');
var Pattern=Java.type('java.util.regex.Pattern');
var Character=Java.type('java.lang.Character');
var Integer=Java.type('java.lang.Integer');
var CdeSubject=Java.type('cj.lns.platform.cde.embed.auth.CdeSubject');
var ISubject=Java.type('cj.lns.chip.sos.website.framework.ISubject');
var CircuitException=Java.type('cj.studio.ecm.graph.CircuitException');

exports.doPage = function(frame,circuit, plug, sctx) {
	var session=frame.session();
	session.removeAttribute(ISubject.KEY_SUBJECT_IN_SESSION);
}
