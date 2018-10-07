package cj.studio.cde.site;

import java.util.HashMap;
import java.util.Map;

import cj.ultimate.util.StringUtil;

public class SiteDocument implements ISiteDocument {
	transient String docid;

	private Map<String, Object> parallels;
	Object document;
	PathParser path;
	long ctime;
	long utime;
	long ltime;//最后一次文档的活动时间
	long weight;//竟价排名的权重，如果未指定则默认为ltime
	String creator;
	Indicator indicator;//指标
	public SiteDocument() {
		parallels = new HashMap<>();
		indicator=new Indicator();
	}

	public SiteDocument(String path, Object tuple) {
		this();
		if (!StringUtil.isEmpty(path))
			this.path = PathParser.parse(path);
		this.document = tuple;
	}
	@Override
	public long weight() {
		return weight;
	}
	@Override
	public long ltime() {
		return ltime;
	}
	@Override
	public Indicator indicator() {
		return indicator;
	}
	@Override
	public long utime() {
		return utime;
	}

	@Override
	public String creator() {
		return creator;
	}

	@Override
	public void creator(String creator) {
		this.creator = creator;
	}

	@Override
	public long ctime() {
		return ctime;
	}

	@Override
	public String docid() {
		// TODO Auto-generated method stub
		return docid;
	}

	@Override
	public PathParser path() {
		return path;
	}

	@Override
	public Map<String, Object> parallels() {
		return parallels;
	}

	@Override
	public Object document() {
		return document;
	}

}
