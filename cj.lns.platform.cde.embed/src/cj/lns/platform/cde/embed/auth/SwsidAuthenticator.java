package cj.lns.platform.cde.embed.auth;

import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.frame.IFlowContent;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;

@CjService(name = "swsidAuthenticator")
public class SwsidAuthenticator implements IAuthenticator {
	@Override
	public AccountMode surports() {
		return AccountMode.swsid;
	}
	@Override
	public AuthResult authenticate(AuthContext ctx, IPin out) throws CircuitException {
		if(out==null){
			throw new CircuitException("500", "站点未链接到远程服务器。");
		}
		Frame frame = new Frame(
				String.format("authServicewsId /serviceOS/public/auth/?account=%s&password=%s&cjtoken=%s sos/1.0",
						ctx.account, ctx.password, ctx.cjtoken));
		Circuit circuit = new Circuit(String.format("sos/1.0 200 ok"));
		out.flow(frame, circuit);
		IFlowContent cnt = circuit.content();
		if (cnt.readableBytes() > 0) {
			Frame back = new Frame(cnt.readFully());
			if (!"200".equals(back.head("status"))) {
				throw new CircuitException(back.head("status"),
						back.head("message"));
			}
			AuthResult ar=new AuthResult();
			ar.parseback(back);
			return ar;
		} else {
			throw new CircuitException("503", "远程服务器返回空的认证信息");
		}

	}
}
