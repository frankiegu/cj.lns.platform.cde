package cj.lns.platform.cde.embed.auth;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import cj.lns.chip.sos.website.framework.Face;
import cj.ultimate.util.StringUtil;

public class CdeSubject implements ICdeSubject ,Serializable{
	
	private static final long serialVersionUID = 1L;
	 List<String> roles;
	private Face face;
	private String principal;
	private String defaultSwsid;
	
	public static ICdeSubject create(AuthResult ar){
		CdeSubject cs=new CdeSubject();
		cs.face=ar.getFace();
		cs.principal=ar.getAccount();
		cs.defaultSwsid=ar.getDefaultSwsId();
		String roles=ar.getSosRoles();
		cs.roles=new ArrayList<>();
		if(!StringUtil.isEmpty(roles)){
			String arr[]=roles.split(",");
			for(String r:arr){
				cs.roles.add(r);
			}
		}
		return cs;
	}
	@Override
	public String defaultSwsid() {
		return defaultSwsid;
	}
	
	@Override
	public boolean containsRole(String r) {
		return roles.contains(r);
	}

	@Override
	public Face face() {
		return face;
	}

	@Override
	public String principal() {
		return principal;
	}

}
