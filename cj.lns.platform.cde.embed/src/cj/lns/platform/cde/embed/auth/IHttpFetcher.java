package cj.lns.platform.cde.embed.auth;

import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;

public interface IHttpFetcher {
	void setOut(IPin out);
	void fetch(Frame frame,Circuit circuit) throws CircuitException;
}
