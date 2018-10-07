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
 		userPortal:'userPortal',
 		cdeEngine:'cdeEngine'
 	}
 ]>
 */

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var System = Java.type('java.lang.System');
var TupleDocument = Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');
var HashMap = Java.type('java.util.HashMap');
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

exports.doPage = function(frame, circuit, plug, sctx) {
	var factory = imports.head.services.authFactory;
	var userPortal = imports.head.services.userPortal;
	var engine = imports.head.services.cdeEngine;
	var params = WebUtil.parserParam(new String(frame.content().readFully()));
	var ctx = new AuthContext(authType(params.user), params.user, params.pwd,
			'sx032xx938823');
	try {
		var result = factory.authenticator(ctx);
		var cs = CdeSubject.create(result);
		userPortal.cache(cs);
		var session=frame.session();
		session.attribute(ISubject.KEY_SUBJECT_IN_SESSION, cs);
		loggerLogin(result,session,engine.disk('$data.disk').home());
	} catch (e) {
		if (e instanceof CircuitException) {
			circuit.status(e.getStatus());
			circuit.message(e.getMessage());
			return;
		}
		throw e;
	}
}
function loggerLogin(result,session,home){
	home.deleteDocs('cde.logger.logins',String.format("{'tuple.user':'%s'}",result.getAccount()));
	var map=new HashMap();
	map.user=result.getAccount();
	map.ltime=System.currentTimeMillis();
	map.session=session.id();
	home.saveDoc('cde.logger.logins',new TupleDocument(map));
}
function authType(account) {
	var pattern = Pattern.compile("[0-9]+");
	var isNum = pattern.matcher(account).matches();
	if (isNum) {
		var c = Integer.valueOf(Character.toString(account.charAt(0)));
		if ((c >= 1 && c < 2) || (c >= 6 && c <= 9)) {// 为视窗
			return AccountMode.swsid;
		} else {
			return AccountMode.userName;
		}

	} else {
		return AccountMode.userName;
	}
}