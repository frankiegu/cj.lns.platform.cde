package cj.studio.cde.site;

import java.util.HashMap;
import java.util.Map;

/**
 * 平行分类
 * @author carocean
 *
 */
public class CatParallel {
	private String name;//如品牌
	private String display;
	private boolean isMutiselect;//是否支持多选
	private String tips;
	private PathParser path;//一定是三级分类，使：c2csite://dianqi/digital/supercomputer
	private Map<String,String> map;//key=平行分类实体键，value=平行分类实体名，如：dell=戴尔
	private int sort;
	public boolean isMutiselect() {
		return isMutiselect;
	}
	public void setMutiselect(boolean isMutiselect) {
		this.isMutiselect = isMutiselect;
	}
	public int getSort() {
		return sort;
	}
	public void setSort(int sort) {
		this.sort = sort;
	}
	public CatParallel() {
		map=new HashMap<String, String>();
	}
	public String getDisplay() {
		return display;
	}
	public void setDisplay(String display) {
		this.display = display;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getTips() {
		return tips;
	}
	public void setTips(String tips) {
		this.tips = tips;
	}
	public PathParser getPath() {
		return path;
	}
	public void setPath(PathParser path) {
		this.path = path;
	}
	public Map<String, String> getMap() {
		return map;
	}
	
}
