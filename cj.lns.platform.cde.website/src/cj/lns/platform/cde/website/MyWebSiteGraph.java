package cj.lns.platform.cde.website;

import cj.lns.chip.sos.website.framework.ISubject;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.graph.GraphCreator;
import cj.studio.ecm.net.layer.ISession;
import cj.studio.ecm.net.layer.ISessionEvent;
import cj.studio.ecm.net.layer.ISessionManager;
import cj.studio.ecm.net.web.WebSiteGraph;
import cj.studio.ecm.net.web.WebSiteGraphCreator;
//这个图可以上netsite
//或者从CompatibleWebsiteGraph派生，原因：如果你的webgraph想对接非httpserver服务器net，如udtServer,tcpServer等 ,则应使用兼容图,兼容图会被其它协议转换为:httpFrame,httpCircuit
@CjService(name = "myWebSiteGraph",isExoteric=true)
public class MyWebSiteGraph extends WebSiteGraph {
	@Override
	protected GraphCreator newCreator() {
		return new MySiteGraphCreator();
	}

	public class MySiteGraphCreator extends WebSiteGraphCreator {
		@Override
		protected ISessionManager createSessionManager() {
			ISessionManager sm = super.createSessionManager();
			sm.addEvent(new SessionManagerEvent());
			return sm;
		}
	}
	
	//侦听会话的事件，如：会话新增、退出、属性的增减等
	public class SessionManagerEvent implements ISessionEvent {

		@Override
		public void doEvent(String eventType, Object... args) {
			if ("attributeAdd".equals(eventType)) {
				if (ISubject.KEY_SUBJECT_IN_SESSION.equals(args[1])) {
					ISession s = (ISession) args[0];
					ISubject subject = (ISubject) s
							.attribute(ISubject.KEY_SUBJECT_IN_SESSION);
					System.out.println("当前登录用户是：" + subject.principal());
				}
			}
		}
		
	}
}
