package cj.lns.platform.cde.embed.service;

import java.util.HashMap;
import java.util.List;

import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;

public interface ISosRssite {
	void setSosrssitePin(IPin pin);
	void setSnsPin(IPin pin);
	List<HashMap<String,Object>> getUsers(String limit,String skip) throws CircuitException;
	void pushMessage(String cjtoken, String module, String sender, String message, Object data) throws CircuitException;
}
