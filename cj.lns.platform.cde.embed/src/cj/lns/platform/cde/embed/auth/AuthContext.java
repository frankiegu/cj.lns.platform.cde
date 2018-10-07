package cj.lns.platform.cde.embed.auth;

public class AuthContext {
	AccountMode accountMode;
	Object account;
	Object cjtoken;
	Object password;

	public AuthContext(AccountMode accountMode, String account, String password, String cjtoken) {
		super();
		this.accountMode = accountMode;
		this.account = account;
		this.cjtoken = cjtoken;
		this.password = password;
	}

	public AccountMode getAccountMode() {
		return accountMode;
	}

	public Object getAccount() {
		return account;
	}

	public Object getCjtoken() {
		return cjtoken;
	}

	public Object getPassword() {
		return password;
	}
	
}
