package cj.studio.cde.site;

import java.util.HashMap;
import java.util.Map;

/**
 * 一级分类
 * @author carocean
 *
 */
public class CatPrimary {
	private String name;//主分类的名为组合名，此处仅为标识主分类，在界面上显示为组合名，实际后面使用主分类id,写法：c2c站://电器/数码/超级本，显示为：c2c站://数码、游戏/数码/超级本
	private String display;
	private String site;
	private Map<String,CatSecondary> secondaries;//key:二级分类的id
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
	public CatPrimary() {
		this.secondaries=new HashMap<>();
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
	public Map<String, CatSecondary> getSecondaries() {
		return secondaries;
	}
	public String getSite() {
		return site;
	}
	public void setSite(String site) {
		this.site = site;
	}
	
	
}
