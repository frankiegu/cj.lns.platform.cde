package cj.lns.platform.cde.embed.auth;

import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;
/**
 * 表示用户的门户，如门户持有者，用户菜单（如果充许私有菜单）
 * @author carocean
 *
 */
public interface IUserPortal {

	void setOut(IPin out);

	Owner owner(String user) throws CircuitException;
	void cache(ICdeSubject subject);
}