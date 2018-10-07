package cj.lns.platform.cde.embed.auth;

import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;

/**
 * 提供身份认证策略
 * <pre>
 *
 * </pre>
 * @author carocean
 *
 */
//authorize授权
public interface IAuthenticator  {
	AccountMode surports();
	AuthResult authenticate(AuthContext ctx, IPin out) throws CircuitException;
}
