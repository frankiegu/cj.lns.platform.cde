/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：
 * <![jss:{
		scope:'runtime',
		extends:'',
		filter:{
	 	}
 	}
 ]>
 */
var String =Java.type('java.lang.String');

exports.doPage=function(frame,circuit,plug,ctx){
	var doc=ctx.html(frame.relativePath());
	var code=doc.select('.status');
	var msg=doc.select('message');
	var c=circuit;
	code.html(c.status());
	msg.html(c.message());
	c.status('200');
	c.message('this is error '+c.status());
//	doc.select('.url a').attr('href',String.format('%s',frame.head('Referer')));
	circuit.content().writeBytes(doc.toString().getBytes());
}