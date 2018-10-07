package cj.lns.platform.cde.embed.auth;

import java.io.Serializable;

import cj.lns.chip.sos.website.framework.Face;
import cj.studio.ecm.context.ElementGet;
import cj.studio.ecm.frame.Frame;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.gson2.com.google.gson.JsonArray;
import cj.ultimate.gson2.com.google.gson.JsonElement;
import cj.ultimate.gson2.com.google.gson.JsonObject;

public class AuthResult implements Serializable{

	private static final long serialVersionUID = 1L;
	private String hasDefaultSwsId;
	private String defaultSwsId;
	private String account;
	private Face face;
	private String sosRoles;

	void parseback(Frame back) {
		this.hasDefaultSwsId= back.head("hasDefaultSwsId");
		this.defaultSwsId= back.head("defaultSwsId");
		this.account= back.head("account");
		this.face=new Gson().fromJson(back.head("face"), Face.class);
		byte[] b=back.content().readFully();
		JsonElement e=new Gson().fromJson(new String(b), JsonElement.class);
		JsonArray ja=e.getAsJsonArray();
		String roles="";
		for(JsonElement je:ja){
			JsonObject jo=je.getAsJsonObject();
			roles+=String.format("%s,",ElementGet.getJsonProp(jo.get("code")));
		}
		if(roles.endsWith(",")){
			roles=roles.substring(0, roles.length()-1);
		}
		this.sosRoles=roles;
	}

	public String getHasDefaultSwsId() {
		return hasDefaultSwsId;
	}

	public String getDefaultSwsId() {
		return defaultSwsId;
	}

	public String getAccount() {
		return account;
	}

	public Face getFace() {
		return face;
	}

	public String getSosRoles() {
		return sosRoles;
	}

}
