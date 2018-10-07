package cj.lns.platform.cde.embed.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cj.lns.chip.sos.cube.framework.FileInfo;
import cj.lns.chip.sos.cube.framework.FileSystem;
import cj.lns.chip.sos.cube.framework.ICube;
import cj.lns.chip.sos.cube.framework.IReader;
import cj.lns.chip.sos.cube.framework.OpenMode;
import cj.lns.chip.sos.disk.INetDisk;
import cj.lns.platform.cde.engine.ICdeEngine;
import cj.studio.ecm.EcmException;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.ultimate.gson2.com.google.gson.Gson;
//menuService_netdisk用户切换调试，正式是menuService
@CjService(name = "menuService_netdisk")
public class MenuServiceDisk implements IMenuService {
	private List<?> menu;
	private Map<String,Map<String,?>> modindex;
	@CjServiceRef(refByName="cdeEngine")
	ICdeEngine engine;
	

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
		INetDisk disk=engine.disk("$data.disk");
		ICube home=disk.home();
		FileSystem fs=home.fileSystem();
		String fn="/cde/user.portal.menu.json";
		if(!fs.existsFile(fn)){
			throw new EcmException("缺少菜单配置文件，应该放在：$data.disk云盘的/cde/user.portal.menu.json");
		}
		try {
			FileInfo fi=fs.openFile(fn,OpenMode.onlyOpen);
			IReader r=fi.reader(0);
			byte[] b=r.readFully();
			r.close();
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
			
		} catch (Exception e) {
			throw new EcmException("菜单配置文件读取失败,原因："+e);
		}
	}

}
