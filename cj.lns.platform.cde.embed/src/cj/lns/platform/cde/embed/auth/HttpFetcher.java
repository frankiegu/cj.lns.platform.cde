package cj.lns.platform.cde.embed.auth;

import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.ICablePin;
import cj.studio.ecm.graph.IPin;
import cj.studio.ecm.net.nio.netty.http.CookieHelper;
import cj.ultimate.util.StringUtil;

@CjService(name = "httpFetcher")
public class HttpFetcher implements IHttpFetcher {

	private ICablePin out;

	@Override
	public void setOut(IPin out) {
		this.out = (ICablePin) out;
	}

	@Override
	public void fetch(Frame frame, Circuit circuit) throws CircuitException {
		String sid = CookieHelper.cjtoken(frame);
		if(StringUtil.isEmpty(sid)){
			sid=(String) circuit.attribute("select-id");
			if(StringUtil.isEmpty(sid)){
				sid=String.valueOf(frame.hashCode());
			}
		}
		synchronized (sid) {
			if (out.containsWire(sid)) {
				out.flow(sid, frame, circuit);
			} else {
				out.newWire(sid);
				try {
					out.flow(sid, frame, circuit);
				} finally {
					out.removeWire(sid);
				}
			}
		}
		
	}

}
