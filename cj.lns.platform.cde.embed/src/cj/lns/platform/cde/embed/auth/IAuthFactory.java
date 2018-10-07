package cj.lns.platform.cde.embed.auth;

import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;

public interface IAuthFactory{

	AuthResult authenticator(AuthContext ctx) throws CircuitException;

	void setOut(IPin out);

}
