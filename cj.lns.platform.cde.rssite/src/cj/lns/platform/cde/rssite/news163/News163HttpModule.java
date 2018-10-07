package cj.lns.platform.cde.rssite.news163;

import java.util.HashMap;
import java.util.Map;

import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import cj.lns.platform.cde.rssite.IHttpModule;
import cj.lns.platform.cde.rssite.RemoteContext;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.ultimate.gson2.com.google.gson.Gson;

@CjService(name="news.163.com")
public class News163HttpModule implements IHttpModule{
	
	@Override
	public void doService(Frame f, Circuit c, RemoteContext ctx) throws CircuitException {
		Document doc=ctx.doc();
		ctx.fillHeadTo(c);
		Elements es=doc.select("#epContentLeft");
		if(es.size()<1){
			throw new CircuitException("503", "远程获取失败，所请求的不是网易新闻看板页面:"+f.url());
		}
		Map<String, String> map=new HashMap<>();
		map.put("domain", "news.163.com");
		map.put("sitename", "网易");
		map.put("title", es.select("h1").html());
		map.put("source", f.url());
		Elements body=es.select(".post_body");
		body.select("script").remove();
		map.put("html", body.html());
		String text=body.text();
		text=text.length()>120?text.substring(0,120):text;
		map.put("abstract", text);
		c.content().writeBytes(new Gson().toJson(map).getBytes());
	}

}
