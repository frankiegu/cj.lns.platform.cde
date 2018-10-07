package cj.lns.platform.cde.rssite;

import java.io.UnsupportedEncodingException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import cj.studio.ecm.frame.Circuit;
import cj.ultimate.util.StringUtil;

public class RemoteContext {
	Circuit remoteback;
	private Document doc;
	private String charset;

	public RemoteContext(Circuit remoteback) {
		this.remoteback = remoteback;
		parseBack(remoteback);
	}

	public String status() {
		return remoteback.status();
	}

	public String message() {
		return remoteback.message();
	}

	public String cause() {
		return remoteback.cause();
	}

	public String head(String key) {
		return remoteback.head(key);
	}

	public Object attribute(String key) {
		return remoteback.attribute(key);
	}

	private void parseBack(Circuit c) {
		if (c.content().readableBytes() > 0) {
			String ct=c.contentType();
			String charset="utf-8";//Content-Type=Content-Type	text/html; charset=utf-8
			if(!StringUtil.isEmpty(ct)){
				int pos=ct.indexOf("charset");
				if(pos>-1){
					charset=ct.substring(pos+"charset=".length(), ct.length());
				}
			}
			String html;
			try {
				this.charset=charset;
				html = new String(c.content().readFully(),charset);
				doc = Jsoup.parse(html);
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			
		}else{
			doc=Jsoup.parse("<html><head></head><body><div>没有获取到页面，或远程网站不存在该页</div></body></html>");//返回默认页面
		}
	}
	public String charset() {
		return charset;
	}
	public Document doc() {
		return doc;
	}

	public void fillHeadTo(Circuit c) {
		String[] keys=remoteback.enumHeadName();
		for(String key:keys){
			c.head(key,remoteback.head(key));
		}
		c.contentType("text/html; charset=utf-8");//所有网站均转换为utf-8编码
	}

}
