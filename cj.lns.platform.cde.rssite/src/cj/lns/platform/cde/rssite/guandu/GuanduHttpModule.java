package cj.lns.platform.cde.rssite.guandu;

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

@CjService(name="cjecm.com")
public class GuanduHttpModule implements IHttpModule{
	
	@Override
	public void doService(Frame f, Circuit c, RemoteContext ctx) throws CircuitException {
		Document doc=ctx.doc();
		ctx.fillHeadTo(c);
		Elements es=doc.select("#ember3278");
		if(es.size()<1){
			throw new CircuitException("503", "远程获取失败，所请求的不是慧景云业主题看板页面:"+f.url());
		}
		Map<String, String> map=new HashMap<>();
		map.put("domain", "cjecm.com");
		map.put("sitename", "慧景云业");
		map.put("title", es.select(".fancy-title").html());
		map.put("source", f.url());
		Elements body=es.select(".topic-body .regular");
		map.put("html", body.html());
		String text=body.text();
//		text=text.length()>120?text.substring(0,120):text;
		map.put("abstract", text);
		c.content().writeBytes(new Gson().toJson(map).getBytes());
	}

}
