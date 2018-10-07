package cj.lns.platform.cde.website.pages;


import org.jsoup.nodes.Document;

import cj.studio.cde.site.CatSite;
import cj.studio.ecm.net.web.page.context.PageContext;

public interface ICatsitePrinter {
	public Document getHtml(CatSite site,PageContext ctx);
}
