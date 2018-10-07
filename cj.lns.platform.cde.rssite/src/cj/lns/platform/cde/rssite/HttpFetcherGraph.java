package cj.lns.platform.cde.rssite;

import java.util.HashMap;
import java.util.Map;

import cj.studio.ecm.IServiceSite;
import cj.studio.ecm.ServiceCollection;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.graph.Access;
import cj.studio.ecm.graph.Graph;
import cj.studio.ecm.graph.GraphCreator;
import cj.studio.ecm.graph.ICablePin;
import cj.studio.ecm.graph.IPlug;

@CjService(name = "cj.neuron.app", isExoteric = true)
public class HttpFetcherGraph extends Graph {
	@Override
	protected String defineAcceptProptocol() {
		// TODO Auto-generated method stub
		return ".*";
	}

	@Override
	protected GraphCreator newCreator() {
		return new HttpFetcherCreator();
	}

	@Override
	protected void build(final GraphCreator c) {
		ICablePin input = c.newCablePin("input", Access.input);
		IPlug inplug=input.plugLast("dispatcher", c.newSink("dispatcher"));
		IServiceSite site = c.site();
		ServiceCollection<IHttpModule> modules = site.getServices(IHttpModule.class);
		Map<String, IHttpModule> map = new HashMap<>();
		for (IHttpModule m : modules) {
			CjService cs = m.getClass().getAnnotation(CjService.class);
			String name = cs.name();
			ICablePin output = c.newCablePin(name.replace(".", "_"), Access.output);
			inplug.plugBranch(name, output).option("http.modules", map);
			output.plugFirst("httpGetter", c.newSink("httpGetter"));
			map.put(name, m);
		}
		// 由于一个输入对应多个向不同网站的输出，如果输入生成了一个导线，让所有输出端子都生成一个导线，会太浪费，因此，在编程时应根据需要生成输出端子的导线。
		// 向后的端子采用cookie负载，一个cookie一个导线
		// input.onEvent(new ICablePinEvent() {
		//
		// @Override
		// public void onNewWired(ICablePin p, String name, IWirePin w) {
		// output.newWire(name);
		// }
		//
		// @Override
		// public void onDestoryWired(ICablePin p, String name, IWirePin w) {
		// output.removeWire(name);
		// }
		//
		// @Override
		// public void onDestoringWired(ICablePin arg0, String arg1, IWirePin
		// arg2) {
		// // TODO Auto-generated method stub
		//
		// }
		// });
	}

}
