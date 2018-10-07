package cj.lns.platform.cde.website.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cj.lns.platform.cde.embed.service.IMenuService;
import cj.studio.ecm.EcmException;
import cj.studio.ecm.IChip;
import cj.studio.ecm.IServiceAfter;
import cj.studio.ecm.IServiceSite;
import cj.studio.ecm.annotation.CjService;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.util.FileHelper;

@CjService(name = "menuService")
public class MenuServiceLocal implements IMenuService, IServiceAfter {
	private IServiceSite site;
	private List<?> menu;
	private Map<String,Map<String,?>> modindex;

	@Override
	public void onAfter(IServiceSite site) {
		this.site=site;
		refresh();
	}

	@Override
	public List<?> getMenu() {
		return menu;
	}

	@Override
	public Map<String,?> getItem(String mid) {
		return modindex.get(mid);
	}

	@SuppressWarnings("unchecked")
	@Override
	public Map<String,?> getItem(String mid, String viewid) {
		Map<String,?> p=modindex.get(mid);
		if(p==null)return null;
		List<Object> list=(List<Object>)p.get("items");
		for(Object o:list){
			Map<String,?> map=(Map<String, ?>)o;
			if(viewid.equals(map.get("id"))){
				return map;
			}
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	@Override
	public void refresh() {
		IChip chip = (IChip) site.getService(IChip.class.getName());
		String home=chip.info().getProperty("home.dir");
		String web = chip.info().getResourceProp("http.root");
		String dir=String.format("%s%swork%s%sconfig%suser.portal.menu.json", home,File.separator,web,File.separator,File.separator);
		try {
			byte[] b=FileHelper.readFully(new File(dir));
			String json=new String(b);
			Gson g=new Gson();
			this.menu=g.fromJson(json, ArrayList.class);
			this.modindex=new HashMap<>();
			for(Object o:menu){
				Map<String,?> map=(Map<String, Object>)o;
				modindex.put((String)map.get("id"), map);
				if(!map.containsKey("items")){
					continue;
				}
			}
		} catch (IOException e) {
			throw new EcmException("菜单配置文件读取失败,原因："+e);
		}
	}

}
