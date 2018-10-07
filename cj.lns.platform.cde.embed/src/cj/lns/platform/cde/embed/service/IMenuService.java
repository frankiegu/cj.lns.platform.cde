package cj.lns.platform.cde.embed.service;

import java.util.List;
import java.util.Map;

public interface IMenuService {
	List<?> getMenu();
	Map<String,?> getItem(String mid);
	Map<String,?> getItem(String mid,String viewid);
	void refresh();
}
