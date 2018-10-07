package cj.studio.cde.site;

import java.util.HashMap;
import java.util.Map;

import cj.ultimate.util.StringUtil;

/**
 * 二级分类
 * @author carocean
 *
 */
public class CatSecondary {
	private String name;
	private String pdisplay;//在一级上显示的名字
	private String display;
	private String href;//频道的链接
	private String tips;
	private Map<String,CatTertiary> tertiaries;//key:二级分类的id
	private int sort;
	private String target="_self";
	public String getTarget() {
		return target;
	}
	public void setTarget(String target) {
		this.target = target;
	}
	public int getSort() {
		return sort;
	}
	public void setSort(int sort) {
		this.sort = sort;
	}
	public CatSecondary() {
		this.tertiaries=new HashMap<>();
	}
	public String getDisplay() {
		return display;
	}
	public void setDisplay(String display) {
		this.display = display;
	}
	public Map<String, CatTertiary> getTertiaries() {
		return tertiaries;
	}
	
	public String getTips() {
		return tips;
	}
	public void setTips(String tips) {
		this.tips = tips;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getPdisplay() {
		if(StringUtil.isEmpty(pdisplay))return display;
		return pdisplay;
	}
	public void setPdisplay(String pdisplay) {
		this.pdisplay = pdisplay;
	}
	public String getHref() {
		return href;
	}
	public void setHref(String href) {
		this.href = href;
	}
	
}
