package cj.studio.cde;

public class Trunk {
	transient String trunkid;
	String guid;//识别码
	String creator;
	long ctime;
	public String getGuid() {
		return guid;
	}
	public void setGuid(String guid) {
		this.guid = guid;
	}
	public String getTrunkid() {
		return trunkid;
	}
	public void setTrunkid(String trunkid) {
		this.trunkid = trunkid;
	}
	public String getCreator() {
		return creator;
	}
	public void setCreator(String creator) {
		this.creator = creator;
	}
	public long getCtime() {
		return ctime;
	}
	public void setCtime(long ctime) {
		this.ctime = ctime;
	}
	
}
