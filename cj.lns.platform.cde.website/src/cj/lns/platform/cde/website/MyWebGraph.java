package cj.lns.platform.cde.website;

import cj.lns.platform.cde.embed.auth.IAuthFactory;
import cj.lns.platform.cde.embed.auth.IHttpFetcher;
import cj.lns.platform.cde.embed.auth.IUserPortal;
import cj.lns.platform.cde.embed.service.ISosRssite;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.Access;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.GraphCreator;
import cj.studio.ecm.graph.IPin;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.graph.ISink;
import cj.studio.ecm.net.nio.NetConstans;
import cj.studio.ecm.net.web.HttpCircuit;
import cj.studio.ecm.net.web.HttpFrame;

//这个图可以上神经元也可以上netsite
@CjService(name = "cj.neuron.app", isExoteric = true)
public class MyWebGraph extends MyWebSiteGraph {
	@CjServiceRef(refByName = "authFactory")
	IAuthFactory authFactory;
	@CjServiceRef(refByName = "userPortal")
	IUserPortal userportal;
	@CjServiceRef(refByName="httpFetcher")
	IHttpFetcher httpFetcher;
	@CjServiceRef(refByName="sosrssite")
	ISosRssite sosrssite;
	@Override
	protected void buildIt(GraphCreator c) {
		IPin rssitedb = c.newWirePin("output-rssite-db",Access.output);
		rssitedb.plugLast("rssite.db", new ISink() {

			@Override
			public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
				f.head(NetConstans.FRAME_HEADKEY_CIRCUIT_SYNC, "true");
				f.head(NetConstans.FRAME_HEADKEY_CIRCUIT_SYNC_TIMEOUT,"300000");
				plug.flow(f, c);
			}
		});
		IPin rssitefetcher = c.newCablePin("output-rssite-http",Access.output);
		rssitefetcher.plugLast("rssite.fetcher", new ISink() {

			@Override
			public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
				f.head(NetConstans.FRAME_HEADKEY_CIRCUIT_SYNC, "true");
				f.head(NetConstans.FRAME_HEADKEY_CIRCUIT_SYNC_TIMEOUT,"300000");
				plug.flow(f, c);
			}
		});
		IPin rssitesns = c.newWirePin("output-rssite-sns",Access.output);
		rssitesns.plugLast("rssite.sns", new ISink() {

			@Override
			public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
				plug.flow(f, c);
			}
		});
		super.buildIt(c);
		in("input").plugFirst("translate", new Translate());
		authFactory.setOut(rssitedb);
		userportal.setOut(rssitedb);
		httpFetcher.setOut(rssitefetcher);
		sosrssite.setSosrssitePin(rssitedb);
		sosrssite.setSnsPin(rssitesns);
	}
	//为了接收非http侦
		public class Translate implements ISink {

			@Override
			public void flow(Frame frame, Circuit circuit, IPlug plug)
					throws CircuitException {
				if (frame instanceof HttpFrame) {
					plug.flow(frame, circuit);
				} else {
					HttpFrame f = new HttpFrame(frame.toString());
					f.copyFrom(frame, true);
					HttpCircuit c = new HttpCircuit(circuit.toString());
					c.coverFrom(circuit);
					plug.flow(f, c);
					circuit.coverFrom(c);
				}
			}

		}
}
