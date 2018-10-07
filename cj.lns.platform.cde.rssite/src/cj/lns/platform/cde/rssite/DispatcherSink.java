package cj.lns.platform.cde.rssite;

import java.util.Map;

import cj.studio.ecm.frame.Circuit;
import cj.studio.ecm.frame.Frame;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.ICablePin;
import cj.studio.ecm.graph.IPin;
import cj.studio.ecm.graph.IPlug;
import cj.studio.ecm.graph.ISink;
import cj.studio.ecm.graph.ISinkCreateBy;
import cj.studio.ecm.net.nio.netty.http.CookieHelper;
import cj.ultimate.util.StringUtil;

public class DispatcherSink implements ISinkCreateBy {

	@Override
	public ISink newSink(String arg0, IPin arg1) {
		DispatcherSink sink = new DispatcherSink();
		return sink;
	}

	// get -u /news.163.com/ -t http/1.1 -Hcj-circuit-sync=true
	// get -u /taobao.com/ -t http/1.1 -Hcj-circuit-sync=true
	@Override
	public void flow(Frame f, Circuit c, IPlug plug) throws CircuitException {
		if ("NET/1.1".equals(f.protocol())) {
			return;
		}
		f.url(f.relativeUrl());
		String root = f.rootName();

		@SuppressWarnings("unchecked")
		Map<String, IHttpModule> map = (Map<String, IHttpModule>) plug.option("http.modules");
		IHttpModule module = map.get(root);
		if (module == null) {
			throw new CircuitException("404", String.format("请求的http服务器没有http模块：%s", root));
		}
		//// 向后的端子采用cookie负载，一个cookie一个导线
		// 取得向各个远程网站输出的端子
		ICablePin out = (ICablePin) plug.branch(root);
		if (out == null) {
			throw new CircuitException("404", String.format("请求的http服务器没有到远程：%s 的output", root));
		}

		Circuit remoteback = new Circuit("http/1.1 200 ok");
		remoteback.copyFrom(c, true);

		f.url(f.relativeUrl());

		String sid = CookieHelper.cjtoken(f);
		if(StringUtil.isEmpty(sid)){
			sid=(String) c.attribute("select-id");
		}
		//将来要增加cjtoken与远程cookie的映射，并增加任务调度功能
		synchronized (sid) {
			// 向后的端子采用cookie负载，一个cookie一个导线
			if (out.containsWire(sid)) {
				out.flow((String) c.attribute("select-id"), f, remoteback);
			} else {
				out.newWire(sid);
				try {
					out.flow(sid, f, remoteback);
				} finally {
					out.removeWire(sid);
				}
			}
		}

		RemoteContext ctx = new RemoteContext(remoteback);
		module.doService(f, c, ctx);
	}

}
