package cj.lns.platform.cde.rssite.taobao;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import cj.lns.platform.cde.rssite.IHttpModule;
import cj.lns.platform.cde.rssite.RemoteContext;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;

@CjService(name="taobao.com")
public class TaobaoHttpModule implements IHttpModule{
	
	@Override
	public void doService(Frame f, Circuit c, RemoteContext ctx) {
		Document doc=ctx.doc();
//		Elements fetch=doc.select(".main_center_news");
//		fetch.select("a").attr("target","_self");
//		doc.select("head>title").html("关度->网易");
		Elements es=doc.select(".seat-rect .rect-wrap");
		es.select("a").attr("target","_self");
		es.select("script").remove();
		ctx.fillHeadTo(c);
		c.content().writeBytes(es.toString().getBytes());
	}

}
