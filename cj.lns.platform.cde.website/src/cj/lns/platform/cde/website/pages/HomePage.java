package cj.lns.platform.cde.website.pages;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import cj.lns.chip.sos.website.framework.ISubject;
import cj.lns.platform.cde.engine.ICdeEngine;
import cj.studio.cde.site.CatParallel;
import cj.studio.cde.site.CatPrimary;
import cj.studio.cde.site.CatSecondary;
import cj.studio.cde.site.CatSite;
import cj.studio.cde.site.CatTertiary;
import cj.studio.cde.site.ISiteDocument;
import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.site.ISiteStore;
import cj.studio.cde.site.util.TimeUtil;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.net.web.page.Page;
import cj.studio.ecm.net.web.page.context.PageContext;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.util.StringUtil;
import jdk.nashorn.api.scripting.ScriptObjectMirror;

//import cj.studio.ecm.net.web.sink.WebSocketServerIndexPage;

@CjService(name = "/index.html")
public class HomePage extends Page {
	@CjServiceRef(refByName = "$.cj.jss.site.header")
	IHeaderPrinter hprinter;
	@CjServiceRef(refByName = "cdeEngine")
	ICdeEngine engine;
	@CjServiceRef(refByName = "$.cj.jss.site.catsitePrinter")
	ICatsitePrinter siteprinter;
	@CjServiceRef(refByName = "$.cj.jss.http.views.parallel")
	ScriptObjectMirror parallelprinter;

	// String
	// p="/path/site.b2c/fuzhuang/nvzhuang/qudongxinpin/x:3;yy:4;xx:5;t:[x,y,z]";
	private void parsePath(String inputPath, List<String> paths, Map<String, String> parallels) {
		inputPath = inputPath.substring("/path".length(), inputPath.length());
		String[] arr = inputPath.split("/");
		for (int i = 0; i < arr.length; i++) {
			String s = arr[i];
			if (StringUtil.isEmpty(s))
				continue;
			if (i == arr.length - 1 && s.indexOf(":") > -1) {
				String json = arr[i].replace(":", "\":\"").replace("[", "$['").replace("]", "']").replace(",", "','")
						.replace(";", "\",\"");
				if (json.endsWith(",\"")) {
					json = json.substring(0, json.length() - 3);
				}
				json = String.format("{\"%s\"}", json);
				@SuppressWarnings("unchecked")
				Map<String, String> paras = new Gson().fromJson(json, HashMap.class);
				parallels.putAll(paras);
			} else {
				paths.add(s);
			}
		}
	}

	@Override
	public void doPage(Frame frame, Circuit circuit, IPlug plug, PageContext ctx) throws CircuitException {
		
		Document header = ctx.html("/global/header.html", "utf-8");
		hprinter.printHeader(header, ISubject.subject(frame));
		Document footer = ctx.html("/global/footer.html", "utf-8");
		Document index = ctx.html("/index.html", "utf-8");
		Document doc = ctx.html("/template/home-template.html", "utf-8");
		doc.head().append(header.head().html());
		doc.head().append(footer.head().html());
		doc.head().append(index.head().html());
		doc.body().select(">.main>.header").html(header.body().html());
		doc.body().select(">.main>.center").html(index.body().html());
		doc.body().select(">.footer").html(footer.body().html());

		String path = frame.parameter("path");
		String skipparam = frame.parameter("skip");
		int skip=0;
		if(!StringUtil.isEmpty(skipparam)){
			skip=Integer.valueOf(skipparam);
		}
		List<String> paths = new ArrayList<>();
		Map<String, String> parallels = new HashMap<>();
		try {
			if (path != null) {
				parsePath(path, paths, parallels);
				doc.select(".site-path").attr("path",path);
			}
			if(skip>0){
				printCenterColumn(paths, parallels, doc,skip);
				circuit.content().writeBytes(doc.select(".table").html().getBytes());
			}else{
				printSites(path, paths, parallels, doc, ctx);
				printCenterColumn(paths, parallels, doc,skip);
				long count=engine.store().documentCount("");
				Element ele=	doc.select(".for-search-engine").first();
				long pages=count/10;
				for(int i=0;i<pages;i++){
					ele.append(String.format("<a href='/index.html?skip=%s'>", i+1));
				}
				printRightColumn(doc);
				circuit.content().writeBytes(doc.toString().getBytes());
			}
			
		} catch (Exception e) {
			if (e instanceof CircuitException) {
				throw e;
			}
			throw new CircuitException("500", e);
		}
		
		
	}

	private void printRightColumn(Document doc) {
		ISiteStore store = engine.store();
		ISiteSchema schema = engine.schema();
		List<CatSite> sites = schema.list();

		Element ul = doc.select(".list-container > .category").first();
		Elements es = ul.select(">.portlet.catsite");
		Element li = es.first().clone();
		es.remove();
		for (CatSite site : sites) {
			Collection<CatPrimary> set = schema.listPrimaries(site.getName());
			for (CatPrimary primary : set) {
				// 打印一个栏目
				Element let = li.clone();
				String path = String.format("%s://%s", site.getName(), primary.getName());
				String dpath = schema.getDisplayPath(path);
				Element title = let.select(".title a").first();
				title.html(dpath);
				title.attr("title", path);
				title.attr("href", String.format("/path/%s/%s", site.getName(), primary.getName()));

				List<ISiteDocument> list = store.documents(path, 6, 0);
				Element items = let.select(".let-content .list").first();
				Element aitem = items.select(">li").first().clone();
				items.empty();
				for (ISiteDocument sd : list) {
					// 打印项
					Element item = aitem.clone();
					@SuppressWarnings("unchecked")
					Map<String, Object> map = (Map<String, Object>) sd.document();
					Element a = item.select("a[htitle]").first();
					a.html(String.format("%s", map.get("title")));
					a.attr("href", String.format("/topics/%s", sd.docid()));

					Element views = item.select(".ahead a[views]").first();
					views.attr("title", String.format("浏览量:%s", sd.indicator().getVisitorsCount()));
					item.select(".ahead a[connects]").attr("title", String.format("连接它的主题数:%s，它连接别的主题的连接数：%s",
							sd.indicator().getBeconnectsCount(), sd.indicator().getConnectsCount()));
					items.appendChild(item);
				}

				ul.appendChild(let);
			}
		}
	}

	private void printCenterColumn(List<String> paths, Map<String, String> parallels, Document doc,int skip) {
		ISiteStore store = engine.store();
		ISiteSchema schema = engine.schema();
		int limit = 10;
		String path = "";
		for (int i = 0; i < paths.size(); i++) {
			String tmp = paths.get(i);
			if (i == 0) {
				if (paths.size() < 2) {
					path = String.format("%s://", tmp);
				} else {
					path = String.format("%s:/", tmp);
				}
			} else {
				path = String.format("%s/%s", path, tmp);
			}
		}
		List<ISiteDocument> doclist = null;
		doclist = store.documents(path, parallels, limit, skip);
		Element ul = doc.select(".list-container > .box > .table").first();
		ul.attr("count",doclist.size()+"");
		Element ali = ul.select(">.row").first().clone();
		ul.empty();
		for (ISiteDocument sd : doclist) {
			Element row = ali.clone();
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) sd.document();
			row.select(".cnt .item a").html(String.format("%s", map.get("title")));
			row.select(".cnt .item a").attr("href", String.format("/topics/%s", sd.docid()));
			row.attr("docid", String.format("%s", sd.docid()));

			String dpath = schema.getDisplayPath(sd.path().toString());
			Element fields = row.select(".cnt .props .fields").first();
			fields.select("li[category]").attr("title", dpath);
			int pos = dpath.lastIndexOf('/');
			if (pos != -1) {
				String dname = dpath.substring(pos + 1, dpath.length());
				if (!StringUtil.isEmpty(dname)) {
					Element a = fields.select("li[category] a").first();
					a.attr("href", String.format("/path/%s", sd.path().toString().replace("://", "/")));
					a.html(dname);
				}
			}
			String user = String.format("%s", map.get("creator"));
			fields.select("li[author]").attr("user", user);
			fields.select("li[author] a").html(user);
			fields.select("li[author] a").attr("href", String.format("/views/view-user.html?user=%s", user));
			fields.select("li[views] a").html(String.format("%s", sd.indicator().getVisitorsCount()));
			fields.select("li[views] a").attr("href",String.format("/views/guandu/visits.html?docid=%s", sd.docid()));
			fields.select("li[connects] a")
					.html(String.format("%s", sd.indicator().getBeconnectsCount() + sd.indicator().getConnectsCount()));
			fields.select("li[connects] a").attr("href",String.format("/views/guandu/connects.html?docid=%s", sd.docid()));
			fields.select("li[replies] a").html(String.format("%s", sd.indicator().getCommentsCount()));
			fields.select("li[replies] a").attr("href",String.format("/views/guandu/comments.html?docid=%s", sd.docid()));
			fields.select("li[likes] a").html(String.format("%s", sd.indicator().getLikesCount()));
			fields.select("li[likes] a").attr("href",String.format("/views/guandu/likes.html?docid=%s", sd.docid()));
			fields.select("li[follows] a").html(String.format("%s", sd.indicator().getFollowsCount()));
			fields.select("li[follows] a").attr("href",String.format("/views/guandu/follows.html?docid=%s", sd.docid()));
			fields.select("li[ltime] a").html(String.format("%s", TimeUtil.friendlyTime(sd.ltime())));
			fields.select("li[ltime] a").attr("title",String.format("%s", TimeUtil.time(sd.ltime())));
			fields.select("li[ltime] a").attr("href",String.format("/users/%s/activity/topics", user));
			// 打印摘要
			Element abts = row.select("> .cnt > .props > .abstracts").first();
			abts.html(String.format("%s", map.get("html")));
			String text = abts.text();
			Elements es = abts.select("img").clone();
			if (text.length() > 110) {
				text = text.substring(0, 110);
				text = String.format(
						"%s<a href='/topics/%s' title='打开以查看更多内容' class='overflow-more' style='color:#08c;'>...</a>",
						text, sd.docid());
			}
			abts.html(text);
			if (!es.isEmpty()) {
				Element e = es.first();
				abts.append(String.format("<a class='inner-img' target='_blank' href='%s'>%s</a>", e.attr("src"), e.outerHtml()));
			}
			// for (int t=0;t<es.size();t++) {
			// if (t == 2)
			// break;
			// Element e=es.get(t);
			// abts.append(String.format("<a class='inner-img'
			// href='%s'>%s</a>",e.attr("src"), e.outerHtml()));
			// }
			ul.appendChild(row);
		}
	}

	private void printSites(String path, List<String> paths, Map<String, String> parallels, Document doc,
			PageContext ctx) {
		ISiteSchema schema = engine.schema();
		List<CatSite> sites = schema.list();
		Collections.sort(sites, new Comparator<CatSite>() {
			@Override
			public int compare(CatSite o1, CatSite o2) {
				// TODO Auto-generated method stub
				return o1.getSort()>o2.getSort()?1:-1;
			}
		});
		Element address = doc.select("#site-panel .site-address").first();
		if (path == null) {
			address.select(".root").html("全网");
			address.select(".root").attr("path", "/");
			address.select(".root").attr("href", "/");
			address.select(".node").remove();
			address.select(".path-spliter").remove();
			address.select(".pre-spliter").remove();
		} else {// 打印路径
			String combinpath = printPath(paths, address, schema);
			if (paths.size() == 4) {// 打印平行分类
				Element paras = doc.select(".phen-list>.parallels").first();
				printParallels(combinpath, parallels, paras, schema, ctx, doc);
			}
		}
		Element hiddenpanel = doc.body().select("#workbin>#catsites-hidden").first();
		Element ul = doc.select("#ember28211").first();
		Element ali = ul.select(">li").first().clone();
		ul.empty();
		boolean loadhead = false;
		for (CatSite site : sites) {
			Element li = ali.clone();
			li.attr("site", site.getName());
			if (site.getTips() != null)
				li.attr("title", site.getTips());
			li.attr("dpath", String.format("%s://", site.getDisplay()));
			Element a = li.select("a").first();
			a.html(site.getDisplay());
			a.attr("href", String.format("/path/%s", site.getName()));

			Document categorysite = siteprinter.getHtml(site, ctx);
			if (!loadhead) {
				doc.head().append(categorysite.head().html());
				loadhead = true;
			}
			hiddenpanel.append(categorysite.body().toString());

			ul.appendChild(li);
		}
	}

	private String printPath(List<String> paths, Element address, ISiteSchema schema) {
		CatSite site = null;
		String combinpath = "";
		Element a = null;
		if (paths.size() > 0) {
			String sitename = paths.get(0);
			site = schema.getSite(sitename);
			if (site != null) {
				a = address.select(".root").first();
				a.html(site.getDisplay());
				combinpath = String.format("%s://", site.getName());
				a.attr("href", String.format("/path/%s", site.getName()));
				if (site.getTips() != null) {
					a.attr("title", site.getTips());
				}
				a.attr("target", site.getTarget());
			}
		}
		CatPrimary pri = null;
		if (paths.size() > 1) {
			String priname = paths.get(1);
			pri = schema.getPrimary(paths.get(0), priname);
			if (pri != null) {
				a = address.select(".node[level=1]").first();
				a.html(pri.getDisplay());
				combinpath = String.format("%s://%s", site.getName(), pri.getName());
				a.attr("href", String.format("/path/%s/%s", site.getName(), pri.getName()));
				a.attr("target", pri.getTarget());
			}
		}
		CatSecondary sec = null;
		if (paths.size() > 2) {
			String secname = paths.get(2);
			sec = pri.getSecondaries().get(secname);
			if (sec != null) {
				a = address.select(".node[level=2]").first();
				a.html(sec.getDisplay());
				combinpath = String.format("%s://%s/%s", site.getName(), pri.getName(), sec.getName());
				a.attr("href", String.format("/path/%s/%s/%s", site.getName(), pri.getName(), sec.getName()));
				if (sec.getTips() != null) {
					a.attr("title", sec.getTips());
				}
				a.attr("target", sec.getTarget());
			}
		}
		CatTertiary tert = null;
		if (paths.size() > 3) {
			String tertname = paths.get(3);
			tert = sec.getTertiaries().get(tertname);
			if (tert != null) {
				a = address.select(".node[level=3]").first();
				a.html(tert.getDisplay());
				combinpath = String.format("%s://%s/%s/%s", site.getName(), pri.getName(), sec.getName(),
						tert.getName());
				a.attr("href", String.format("/path/%s/%s/%s/%s", site.getName(), pri.getName(), sec.getName(),
						tert.getName()));
				if (tert.getTips() != null) {
					a.attr("title", tert.getTips());
				}
				a.attr("target", tert.getTarget());
			}
		}
		switch (paths.size()) {
		case 1:
			address.select(".node[level=1]").remove();
		case 2:
			address.select(".node[level=2]").remove();
			address.select(".path-spliter[sp=\"1-2\"]").remove();
		case 3:
			address.select(".node[level=3]").remove();
			address.select(".path-spliter[sp=\"2-3\"]").remove();

		}
		return combinpath;
	}

	private void printParallels(String path, Map<String, String> parallels, Element paras, ISiteSchema schema,
			PageContext ctx, Document doc) {
		Document panel = (Document) parallelprinter.callMember("getHtml", path, "nosave", ctx);
		paras.html(panel.outerHtml());
		paras.attr("style", "display:block");
		paras.attr("path", path);
		paras.attr("urlpath", String.format("/path/%s", path.replace("://", "/")));
		// 打印筛选条件
		if (!parallels.isEmpty()) {
			Element crumb = paras.select(".m-nav .crumb").first();
			crumb.select(".cat-text").attr("style", "display:inline-block;");
			crumb.select(".cat-ok").attr("style", "display:inline-block;");
			crumb.select(".icon-btn-vbarrow").attr("style", "display:inline-block;");
			Iterator<Entry<String, String>> it=parallels.entrySet().iterator();
			Element apro=paras.select("#crumb-hidden >.pro").first().clone();
			apro.attr("style","display:inline-block;");
			while(it.hasNext()){
				Entry<String, String> en=it.next();
				
				String key=en.getKey();
				String value=en.getValue();
				CatParallel para=schema.getParallels(path, key);
				if(para==null)continue;
				
				int start=value.indexOf("$[");
				if(start>-1){//如果value是集合：$['2016qiu','2016dong']
					int end=value.lastIndexOf("]");
					value=value.substring(start+2, end-1);
					value=value.replace("'", "");
					String[] arr=value.split(",");
					for(String v:arr){
						Element pro=apro.clone();
						pro.attr("para-name",para.getName());
						pro.attr("para-key",v);
						String s=para.getMap().get(v);
						pro.attr("para-value",String.format("%s", s));
						pro.select("span[text]").html(String.format("%s：%s", para.getDisplay(),s));
						crumb.appendChild(pro);
					}
				}else{
					Element pro=apro.clone();
					pro.attr("para-name",para.getName());
					pro.attr("para-key",value);
					String s=para.getMap().get(value);
					pro.attr("para-value",String.format("%s", s));
					pro.select("span[text]").html(String.format("%s：%s", para.getDisplay(),s));
					crumb.appendChild(pro);
				}
				
//				String value="";
//				pro.attr("para-key",key);
//				pro.attr("para-value",value);
//				pro.select("span[text]").html(String.format("%s：", para.getDisplay()));
//				crumb.appendChild(pro);
			}
		}

	}

}
