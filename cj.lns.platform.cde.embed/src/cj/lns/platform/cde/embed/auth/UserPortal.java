package cj.lns.platform.cde.embed.auth;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import cj.lns.chip.sos.website.framework.Face;
import cj.lns.platform.cde.engine.LRUCache;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.frame.IFlowContent;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;
import cj.ultimate.gson2.com.google.gson.Gson;

@CjService(name = "userPortal")
public class UserPortal implements IUserPortal {
	private LRUCache<String, Owner> cache;

	public UserPortal() {
		cache = new LRUCache<>(8096);
	}

	IPin out;

	@Override
	public void setOut(IPin out) {
		this.out = out;
	}

	@Override
	public void cache(ICdeSubject subject) {
		if (cache.containsKey(subject.principal())) {
			return;
		}
		CdeSubject cs = (CdeSubject) subject;
		List<String> roles = cs.roles;
		Owner owner = new Owner(subject.principal(), subject.face(), roles);
		cache.put(subject.principal(), owner);
	}

	@Override
	public Owner owner(String user) throws CircuitException {
		if (cache.containsKey(user)) {
			return cache.get(user);
		}
		FaceAndRole fr = get(user);
		List<String> roles = new ArrayList<>();
		List<Map<String,String>> list=fr.roles;
		for(Map<String,String> obj:list){
			roles.add(obj.get("code"));
		}
		Owner owner = new Owner(user, fr.face, roles);
		cache.put(user, owner);
		return owner;
	}

	private FaceAndRole get(String user) throws CircuitException {
		if (out == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(
				String.format("getUserFaceAndRoles /serviceOS/public/user/?userCode=%s&cjtoken=xxxx sos/1.0", user));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		out.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			String json = new String(back.content().readFully());
			FaceAndRole ar = new Gson().fromJson(json, FaceAndRole.class);
			return ar;
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}

	}

	class FaceAndRole {
		Face face;
		List<Map<String, String>> roles;
	}
}
