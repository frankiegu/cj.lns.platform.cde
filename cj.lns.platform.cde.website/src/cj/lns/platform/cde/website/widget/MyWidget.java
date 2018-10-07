package cj.lns.platform.cde.website.widget;

import java.io.IOException;

import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.net.web.HttpCircuit;
import cj.studio.ecm.net.web.HttpFrame;
import cj.studio.ecm.net.web.widget.Widget;
import cj.studio.ecm.net.web.widget.context.WidgetContext;
@CjService(name="/read3")
public class MyWidget extends Widget {

	public MyWidget() {
		// TODO Auto-generated constructor stub
	}

	@Override
	protected void doWidget(Frame frame,Circuit circuit, IPlug plug, WidgetContext ctx)
			throws CircuitException {
		try {
			System.out.println("要回发的侦："+new String(frame.toBytes()));
			String text=ctx.resourceText("/3.txt");
			circuit.piggybacking(false);
			
//			HttpPin out=(HttpPin)plug.circuit().feedback("_output__WsSink");
//			HttpFrame hf=(HttpFrame)frame;
			
			Circuit c=new HttpCircuit("test/1.1 200 ok");
			c.attribute("select-id",circuit.attribute("select-id"));
			
			HttpFrame f=new HttpFrame(String.format("push / http/1.1"));
			frame.content().clear();
			f.content().writeBytes(text.getBytes());
			if(!circuit.isEmptyFeedback()){
				String[] a=circuit.enumFeedback();
				for(String k:a){
					circuit.feedback(k).doBack(f,c);
				}
			}
//			out.sendBySessionId(hf.session().id(), f, c);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
