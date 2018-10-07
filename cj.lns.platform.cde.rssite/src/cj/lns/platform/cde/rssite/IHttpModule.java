package cj.lns.platform.cde.rssite;

import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;

public interface IHttpModule {

	void doService(Frame f, Circuit c, RemoteContext ctx) throws CircuitException;

}
