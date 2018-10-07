package cj.lns.platform.cde.website.widget;

import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.net.web.HttpFrame;
import cj.studio.ecm.net.web.IWidget;

@CjService(name = "/widgets/")
public class HomeWidget implements IWidget {

	@Override
	public void flow(Frame frame,Circuit circuit, IPlug plug) throws CircuitException {
		// TODO Auto-generated method stub
		System.out.println("home widget:");

		HttpFrame f = (HttpFrame) frame;
		System.out.println("xxx:" + frame + " selid:"
				+circuit.attribute("select-id") + " sid:"
				+ f.session().id());
		circuit.content().writeBytes(frame.toByteBuf());
		circuit.head("Content-Type", "frame/bin");
	}

}
