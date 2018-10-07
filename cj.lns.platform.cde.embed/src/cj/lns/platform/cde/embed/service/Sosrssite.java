package cj.lns.platform.cde.embed.service;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import cj.lns.chip.sos.website.framework.Face;
import cj.lns.platform.cde.embed.auth.IUserPortal;
import cj.lns.platform.cde.embed.auth.Owner;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.frame.IFlowContent;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;
import cj.studio.ecm.util.ObjectHelper;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.gson2.com.google.gson.reflect.TypeToken;

@CjService(name = "sosrssite")
public class Sosrssite implements ISosRssite {
	IPin outdb;
	@CjServiceRef(refByName = "userPortal")
	IUserPortal portal;
	IPin outsns;

	@Override
	public void setSnsPin(IPin pin) {
		outsns = pin;
	}

	@Override
	public void setSosrssitePin(IPin pin) {
		outdb = pin;
	}
	@Override
	public void pushMessage(String cjtoken,String module,String sender,String message,Object data) throws CircuitException{
		if (outsns == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame("push /device/cde/cloud/reporter peer/1.0");
		frame.parameter("cjtoken",cjtoken);
		frame.parameter("module",module);
		frame.parameter("sender",sender);
		frame.parameter("message",message);
		if(data!=null){
			frame.content().writeBytes(new Gson().toJson(data).getBytes());
		}
		Circuit circuit = new Circuit(String.format("peer/1.0 200 ok"));
		outsns.flow(frame, circuit);
	}
	@Override
	public List<HashMap<String, Object>> getUsers(String limit, String skip) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(String
				.format("findUserList /serviceOS/public/user/?max=%s&start=%s&cjtoken=xxxx sos/1.0", limit, skip));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			String json = new String(back.content().readFully());
			List<HashMap<String, Object>> ar = new Gson().fromJson(json,
					new TypeToken<ArrayList<HashMap<String, Object>>>() {
					}.getType());
			return ar;
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}

	}

	public List<List<Object>> likeUserNames(String likeUserCode, int limit, int skip) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(String.format(
				"likeUserNames /serviceOS/public/user/?likeUserCode=%s&cjtoken=xxxx&limit=%s&skip=%s sos/1.0",
				likeUserCode, limit, skip));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			byte[] b = back.content().readFully();
			String json = new String(b);
			List<List<Object>> users = new Gson().fromJson(json, new TypeToken<ArrayList<ArrayList<Object>>>() {
			}.getType());
			return users;
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}
	}

	public void editNick(String user, String nick) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(String.format(
				"updateNickName /serviceOS/public/user/?userCode=%s&nickName=%s&cjtoken=xxxx sos/1.0", user, nick));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			Owner owner = portal.owner(user);
			Field f = ObjectHelper.findField(Face.class, "nick");
			f.setAccessible(true);
			try {
				f.set(owner.face(), nick);
			} catch (IllegalArgumentException | IllegalAccessException e) {
				throw new CircuitException("500", e);
			}
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}
	}

	public void editSign(String user, String sign) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(String.format(
				"updateSignText /serviceOS/public/user/?userCode=%s&signatureText=%s&cjtoken=xxxx sos/1.0", user,
				sign));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			Owner owner = portal.owner(user);
			Field f = ObjectHelper.findField(Face.class, "signText");
			f.setAccessible(true);
			try {
				f.set(owner.face(), sign);
			} catch (IllegalArgumentException | IllegalAccessException e) {
				throw new CircuitException("500", e);
			}
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}
	}

	public void editBrief(String user, String brief) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(String.format(
				"updateBriefing /serviceOS/public/user/?userCode=%s&briefing=%s&cjtoken=xxxx sos/1.0", user, brief));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			Owner owner = portal.owner(user);
			Field f = ObjectHelper.findField(Face.class, "briefing");
			f.setAccessible(true);
			try {
				f.set(owner.face(), brief);
			} catch (IllegalArgumentException | IllegalAccessException e) {
				throw new CircuitException("500", e);
			}
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}
	}

	public void editPwd(String user, String pwd) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(
				String.format("updatePwd /serviceOS/public/user/?userCode=%s&pwd=%s&cjtoken=xxxx sos/1.0", user, pwd));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}
	}

	public void editHeadPic(String user, String pic) throws CircuitException {
		if (outdb == null) {
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(String
				.format("updateHeadPic /serviceOS/public/user/?userCode=%s&head=%s&cjtoken=xxxx sos/1.0", user, pic));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		outdb.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"), back.head("message"));
			}
			Owner owner = portal.owner(user);
			Field f = ObjectHelper.findField(Face.class, "head");
			f.setAccessible(true);
			try {
				f.set(owner.face(), pic);
			} catch (IllegalArgumentException | IllegalAccessException e) {
				throw new CircuitException("500", e);
			}
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}
	}
}
