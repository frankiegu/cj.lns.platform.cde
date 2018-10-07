package cj.lns.platform.cde.website;

import cj.lns.platform.cde.embed.service.IMenuService;
import cj.studio.ecm.IEntryPointActivator;
import cj.studio.ecm.IServiceSite;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.studio.ecm.context.IElement;
@CjService(name="myAppActivitor")
public class MyAppActivitor implements IEntryPointActivator{
	@CjServiceRef(refByName="menuService")
	IMenuService service;
	@Override
	public void activate(IServiceSite site, IElement arg1) {
		service.refresh();
		
	}

	@Override
	public void inactivate(IServiceSite arg0) {
		// TODO Auto-generated method stub
		
	}

}
