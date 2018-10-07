package cj.lns.platform.cde.embed.service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import cj.studio.ecm.EcmException;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.net.web.IHttpFilter;

@CjService(name = "rewriteUrlHttpFilter")
public class RewriteUrlHttpFilter implements IHttpFilter {
	final static String topicreg = "^/[^/]+/topics/([^/]*)/?$";// 主题
	final static Pattern topicpat = Pattern.compile(topicreg, Pattern.DOTALL);// 主题
	final static String topicrepl = "/topics/topic.html?id=$1";// 主题
	final static String indexreg = "^/[^/]+/path/[\\s|\\S]*$";// 主题
	final static Pattern indexpat = Pattern.compile(indexreg, Pattern.DOTALL);// 主题

	final static String userlistreg = "^/[^/]+/users/?$";// 用户列表
	final static Pattern userlistpat = Pattern.compile(userlistreg, Pattern.DOTALL);// 用户列表
	final static String userlistrepl = "/users/userlist.html";// 用户列表
	final static String userrootreg = "^/[^/]+/users/([^/]+)/?$";// 指定的用户门户
	final static Pattern userrootpat = Pattern.compile(userrootreg, Pattern.DOTALL);// 指定的用户门户
	final static String userrootrepl = "/users/portal.html?user=$1";// 指定的用户门户
	final static String usermodulereg = "^/[^/]+/users/([^/]+)/([^/]+)/?$";// 指定的用户门户一级菜单
	final static Pattern usermodulepat = Pattern.compile(usermodulereg, Pattern.DOTALL);// 指定的用户门户一级菜单
	final static String usermodulerepl = "/users/%s?user=$1&module=$2";// 指定的用户门户一级菜单
	final static String userviewreg = "^/[^/]+/users/([^/]+)/([^/]+)/([^/]+)/?$";// 指定的用户门户二级菜单
	final static Pattern userviewpat = Pattern.compile(userviewreg, Pattern.DOTALL);// 指定的用户门户二级菜单
	final static String userviewrepl = "/users/%s?user=$1&module=$2&view=$3";// 指定的用户门户二级菜单
	final static String useritemreg = "^/[^/]+/users/([^/]+)/([^/]+)/([^/]+)/([^/]+)/?$";// 指定的用户门户三级，一般用于消息打开地址
	final static Pattern useritempat = Pattern.compile(useritemreg, Pattern.DOTALL);// 指定的用户门户三级，一般用于消息打开地址
	final static String useritemrepl = "/users/%s?user=$1&module=$2&view=$3&item=$4";// 指定的用户门户三级，一般用于消息打开地址
	@CjServiceRef(refByName = "menuService")
	IMenuService menu;

	public RewriteUrlHttpFilter() {
	}

	public static void main(String... c) {
		String url = "/website/users/user1/messages/thread/111";
		System.out.println(url.replaceAll(useritemreg, useritemrepl));
	}

	@Override
	public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
		String reurl = f.path();
		Matcher m = null;
		if ((m = indexpat.matcher(reurl)).matches()) {// 当查询首页分类列表时
			// 重写到首页
			String url = String.format("/%s/index.html?path=%s", f.rootName(), f.relativePath());
			String[] params=f.enumParameterName();
			for(String key:params){
				String v=f.parameter(key);
				url=String.format("%s&%s=%s", url,key,v);
			}
			f.url(url);
			plug.flow(f, c);
		} else if ((m = topicpat.matcher(reurl)).matches()) {
			String url = reurl;
			url = url.replaceAll(topicreg, topicrepl);
			if (f.containsQueryString()) {
				url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
			} else {
				url = String.format("%s%s", f.rootPath(), url);
			}
			f.url(url);
			plug.flow(f, c);
		} else if ((m = userrootpat.matcher(reurl)).matches()) {
			String url = reurl;
			url = url.replaceAll(userrootreg, userrootrepl);
			if (f.containsQueryString()) {
				url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
			} else {
				url = String.format("%s%s", f.rootPath(), url);
			}

			f.url(url);
			plug.flow(f, c);
		} else if ((m = usermodulepat.matcher(reurl)).matches()) {
			rendModule(m, reurl, f, c, plug);
		} else if ((m = userviewpat.matcher(reurl)).matches()) {
			String url = reurl;
			String mid = m.group(2);
			String vid = m.group(3);
			if (!isAjax(f)) {
				String express = String.format(userviewrepl, "portal.html");
				url = url.replaceAll(userviewreg, express);
				if (f.containsQueryString()) {
					url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
				} else {
					url = String.format("%s%s", f.rootPath(), url);
				}
				f.url(url);
				plug.flow(f, c);
				return;
			}
			Map<String, ?> item = menu.getItem(mid, vid);
			if (item == null) {
				throw new EcmException(String.format("在模块：%s中没有定义视图：%s", mid, vid));
			}
			String express = "";
			String view=(String)item.get("view");
			if(view.contains("?")){
				express=String.format(userviewrepl.replace("?", "&"), view);
			}else{
				express=String.format(userviewrepl, view);
			}
			
			url = url.replaceAll(userviewreg, express);
			if (f.containsQueryString()) {
				url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
			} else {
				url = String.format("%s%s", f.rootPath(), url);
			}
			f.url(url);
			plug.flow(f, c);
		} else if ((m = useritempat.matcher(reurl)).matches()) {
			String url = reurl;
			String mid = m.group(2);
			String vid = m.group(3);
			if (!isAjax(f)) {
				String express = String.format(useritemrepl, "portal.html");
				url = url.replaceAll(useritemreg, express);
				if (f.containsQueryString()) {
					url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
				} else {
					url = String.format("%s%s", f.rootPath(), url);
				}
				f.url(url);
				plug.flow(f, c);
				return;
			}
			Map<String, ?> item = menu.getItem(mid, vid);
			if (item == null) {
				throw new EcmException(String.format("在模块：%s中没有定义视图：%s", mid, vid));
			}
			String express = String.format(useritemrepl, item.get("view"));
			url = url.replaceAll(useritemreg, express);
			if (f.containsQueryString()) {
				url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
			} else {
				url = String.format("%s%s", f.rootPath(), url);
			}
			f.url(url);
			plug.flow(f, c);
		} else if ((m = userlistpat.matcher(reurl)).matches()) {
			String url = reurl;
			url = url.replaceAll(userlistreg, userlistrepl);
			if (f.containsQueryString()) {
				url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
			} else {
				url = String.format("%s%s", f.rootPath(), url);
			}
			f.url(url);
			plug.flow(f, c);
		} else {
			plug.flow(f, c);
		}
	}

	private void rendModule(Matcher m, String reurl, Frame f, Circuit c, IPlug plug) throws CircuitException {
		String url = reurl;
		String mid = m.group(2);
		if (!isAjax(f)) {
			String express = String.format(usermodulerepl, "portal.html");
			url = url.replaceAll(usermodulereg, express);
		} else {
			Map<String, ?> item = menu.getItem(mid);
			String express = String.format(usermodulerepl, item.get("module"));
			url = url.replaceAll(usermodulereg, express);
			// ajax时渲染tools

		}
		if (f.containsQueryString()) {
			url = String.format("%s%s?%s", f.rootPath(), url, f.queryString());
		} else {
			url = String.format("%s%s", f.rootPath(), url);
		}
		f.url(url);
		plug.flow(f, c);
	}

	private boolean isAjax(Frame f) {
		return "XMLHttpRequest".equals(f.head("X-Requested-With"));
	}

	@Override
	public int sort() {
		// TODO Auto-generated method stub
		return 0;
	}

}
