package cj.lns.platform.cde.embed.service;

import java.util.List;
import java.util.Map;

import cj.lns.chip.sos.website.framework.ISubject;
import cj.lns.platform.cde.embed.auth.Owner;
import cj.lns.platform.cde.engine.ICdeEngine;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.net.web.IHttpFilter;
import cj.ultimate.util.StringUtil;

@CjService(name = "securityHttpFilter")
public class SecurityHttpFilter implements IHttpFilter {
	@CjServiceRef
	IMenuService menuService;
	@CjServiceRef
	ICdeEngine cdeEngine;

	@Override
	public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
		ISubject subject = ISubject.subject(f);
		String repath = f.relativePath();
		if ("/".equals(repath)||repath.startsWith("/path/") || repath.startsWith("/img/") || repath.startsWith("/js/")
				|| repath.startsWith("/css/") || repath.startsWith("/public/")) {
			plug.flow(f, c);
			return;
		}
		if (subject == null) {
			// 一定要登录才能访问的
			if (repath.startsWith("/post")) {
				c.status("302");
				c.message("redirect login");
				c.head("Location", String.format("/public/authlogin.html?url=%s",f.relativeUrl()));
				return;
			}

		}

		// 不论登不登录都会受限的资源
		// 其后根据菜单配置的allow列表，判断如果是$ownerOnly的，都需要登录且为自己;
		// 如果已登录了，但不是本人可访问的，则提示 禁止访问
		// GET /website/users/portal.html?user=user1&module=messages&view=list
		// HTTP/1.1
		String module = f.parameter("module");
		String view = f.parameter("view");
		String user = f.parameter("user");
		if (!StringUtil.isEmpty(module)) {
			Map<String, ?> m = menuService.getItem(module);
			if (m != null) {
				List<String> allow = (List<String>) m.get("allow");
				if (allow != null && !allow.isEmpty()) {
					Owner owner = cdeEngine.portal().owner(user);
					if (subject == null) {
						// 一定得登录
						c.status("302");
						c.message("redirect login");
						c.head("Location", String.format("/public/authlogin.html?url=%s",f.relativeUrl()));
						return;
					}
					if (!check(allow, owner, subject)) {
						// 跑到禁止界面
						throw new CircuitException("403", "禁止访问");
					}
				}
			}
		}
		if (!StringUtil.isEmpty(view)) {
			Map<String, ?> v = menuService.getItem(module, view);
			if (v != null) {
				List<String> allow = (List<String>) v.get("allow");
				if (allow != null && !allow.isEmpty()) {
					Owner owner = cdeEngine.portal().owner(user);
					if (subject == null) {
						// 一定得登录
						c.status("302");
						c.message("redirect login");
						c.head("Location", String.format("/public/authlogin.html?url=%s",f.relativeUrl()));
						return;
					}
					if (!check(allow, owner, subject)) {
						// 跑到禁止界面
						throw new CircuitException("403", "禁止访问");
					}
				}
			}
		}
		plug.flow(f, c);
	}

	private boolean check(List<String> allow, Owner owner, ISubject subject) {
		if (allow.contains("$ownerOnly")) {
			if (!owner.isOwner(subject)) {
				return false;
			}
		} else {
			boolean isAllow = false;
			for (int j = 0; j < allow.size(); j++) {
				String ace = allow.get(j);
				if (owner.hasRole(ace)) {
					isAllow = true;
					break;
				}
			}
			return isAllow;
		}
		return true;
	}

	@Override
	public int sort() {
		// TODO Auto-generated method stub
		return 1;
	}

}
