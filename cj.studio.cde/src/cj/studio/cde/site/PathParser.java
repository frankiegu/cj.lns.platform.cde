package cj.studio.cde.site;

import cj.ultimate.util.StringUtil;

public class PathParser {
	private String site;
	private String primary;
	private String secondary;
	private String tertiary;

	public static PathParser parse(String path) {
		PathParser p=new PathParser();
		if(StringUtil.isEmpty(path))return p;
		path=path.replace("\\", "/");
		int len=path.indexOf("://");
		if(len==-1)throw new RuntimeException("地址格式错。缺少站点");
		p.site=path.substring(0, len);
		String remaining=path.substring(len+3, path.length());
		remaining=remaining.replace("//", "/");
		len=remaining.indexOf("/");
		if(len==-1){
			p.primary=remaining;
			return p;
		}else{
			p.primary=remaining.substring(0,len);
			remaining=remaining.substring(len+1,remaining.length());
		}
		len=remaining.indexOf("/");
		if(len==-1){
			p.secondary=remaining;
			return p;
		}else{
			p.secondary=remaining.substring(0,len);
			remaining=remaining.substring(len+1,remaining.length());
		}
		len=remaining.indexOf("/");
		if(len==-1){
			p.tertiary=remaining;
			return p;
		}else{
			p.tertiary=remaining.substring(0,len);
		}
		return p;
	}
	public static void main(String...site){
		PathParser p=PathParser.parse("c2csite://cat1/cat2/cat3/");
		System.out.println(p);
	}
	@Override
	public String toString() {
		String path="";
		if (StringUtil.isEmpty(site)) {
			return path;
		}else{
			path=String.format("%s://", site);
		}
		if (StringUtil.isEmpty(primary)) {
			return path;
		}else{
			path=String.format("%s%s",path, primary);
		}
		if (StringUtil.isEmpty(secondary)) {
			return path;
		}else{
			path=String.format("%s/%s",path, secondary);
		}
		if (StringUtil.isEmpty(tertiary)) {
			return path;
		}else{
			path=String.format("%s/%s",path, tertiary);
		}
		return path;
	}

	public String getSite() {
		return site;
	}

	public void setSite(String site) {
		this.site = site;
	}

	public String getPrimary() {
		return primary;
	}

	public void setPrimary(String primary) {
		this.primary = primary;
	}

	public String getSecondary() {
		return secondary;
	}

	public void setSecondary(String secondary) {
		this.secondary = secondary;
	}

	public String getTertiary() {
		return tertiary;
	}

	public void setTertiary(String tertiary) {
		this.tertiary = tertiary;
	}

}
