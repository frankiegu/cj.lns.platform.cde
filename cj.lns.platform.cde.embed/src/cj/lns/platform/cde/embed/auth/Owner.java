package cj.lns.platform.cde.embed.auth;

import java.util.List;

import cj.lns.chip.sos.website.framework.Face;
import cj.lns.chip.sos.website.framework.ISubject;

/**
 * 用户门户的持有人
 * @author carocean
 *
 */
public class Owner{
	private String user;
	private Face face;
	private List<String> roles;
	public Owner(String user,Face face,List<String> roles) {
		this.user=user;
		this.face=face;
		this.roles=roles;
	}
	public String user() {
		return user;
	}
	public Face face() {
		return face;
	}
	public boolean hasRole(String role) {
		return roles.contains(role);
	}
	public boolean isOwner(ISubject subject){
		if(subject==null)return false;
		return this.user.equals(subject.principal());
	}
}
