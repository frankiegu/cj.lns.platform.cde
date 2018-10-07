package cj.lns.platform.cde.website.pages;

import org.jsoup.nodes.Document;

import cj.lns.chip.sos.website.framework.ISubject;

public interface IHeaderPrinter {
	void printHeader(Document doc,ISubject subject);
}
