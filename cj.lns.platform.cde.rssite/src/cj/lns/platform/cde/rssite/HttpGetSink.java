package cj.lns.platform.cde.rssite;

import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.graph.ISink;
import cj.studio.ecm.graph.ISinkCreateBy;
import cj.studio.ecm.net.nio.NetConstans;

public class HttpGetSink implements ISinkCreateBy,NetConstans {
	@Override
	public ISink newSink(String arg0, IPin arg1) {
		HttpGetSink get= new HttpGetSink();
		return get;
	}

	@Override
	public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
		f.head(FRAME_HEADKEY_CIRCUIT_SYNC,"true");
		f.head(FRAME_HEADKEY_CIRCUIT_SYNC_TIMEOUT,"60000");
		plug.flow(f, c);
	}

}
