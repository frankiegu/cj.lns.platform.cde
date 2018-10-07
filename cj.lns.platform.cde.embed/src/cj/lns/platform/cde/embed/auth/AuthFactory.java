package cj.lns.platform.cde.embed.auth;

import java.util.HashMap;
import java.util.Map;

import cj.studio.ecm.IServiceAfter;
import cj.studio.ecm.IServiceSite;
import cj.studio.ecm.ServiceCollection;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.graph.CircuitException;
import cj.studio.ecm.graph.IPin;

@CjService(name = "authFactory")
public class AuthFactory implements IAuthFactory, IServiceAfter {
	IPin out;// 认证请求输出
	Map<AccountMode, IAuthenticator> auths;

	@Override
	public void onAfter(IServiceSite site) {
		auths = new HashMap<>();
		ServiceCollection<IAuthenticator> col = site.getServices(IAuthenticator.class);
		for (IAuthenticator a : col) {
			auths.put(a.surports(), a);
		}
	}

	@Override
	public void setOut(IPin out) {
		this.out = out;
	}

	@Override
	public AuthResult authenticator(AuthContext ctx) throws CircuitException {
		if(!auths.containsKey(ctx.accountMode)){
			throw new CircuitException("809", "认证失败:不支持的验证模式");
		}
		IAuthenticator auth=auths.get(ctx.accountMode);
		return auth.authenticate(ctx,out);
	}
}
