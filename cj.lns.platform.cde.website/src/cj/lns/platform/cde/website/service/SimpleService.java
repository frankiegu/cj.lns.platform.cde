package cj.lns.platform.cde.website.service;

import cj.studio.ecm.annotation.CjService;
//演示jss中对该服务的拦截(该服务被代理，因此必须实现接口）
//内核为了不侵入开发者实现类的默认构造函数，所以只要是适配器、桥、及jss过滤器匹配目标，如要在jss服务中调用java的代理对象，该被代理目标均必须是接口方法。因为内核从Object.class生成代理，这样就不强求开发者提供一个空构造。
@CjService(name="simpleService")
public class SimpleService implements IEcho {
	/* (non-Javadoc)
	 * @see your.crop.examples.website.service.IEcho#printEcho(java.lang.String)
	 */
	@Override
	public void printEcho(String text){
		System.out.println(text);
	}
}
