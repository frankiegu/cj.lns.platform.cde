package cj.studio.cde;

public class Entry {
	transient String entryid;
	String name;
	String desc;
	long ctime;
	long weight;
	String creator;
	String belongBranch;
	String belongTrunk;
	String value;
	EntryType type;
	public String getEntryid() {
		return entryid;
	}
	public void setEntryid(String entryid) {
		this.entryid = entryid;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDesc() {
		return desc;
	}
	public void setDesc(String desc) {
		this.desc = desc;
	}
	public long getCtime() {
		return ctime;
	}
	public void setCtime(long ctime) {
		this.ctime = ctime;
	}
	public long getWeight() {
		return weight;
	}
	public void setWeight(long weight) {
		this.weight = weight;
	}
	public String getCreator() {
		return creator;
	}
	public void setCreator(String creator) {
		this.creator = creator;
	}
	public String getBelongBranch() {
		return belongBranch;
	}
	public void setBelongBranch(String belongBranch) {
		this.belongBranch = belongBranch;
	}
	public String getBelongTrunk() {
		return belongTrunk;
	}
	public void setBelongTrunk(String belongTrunk) {
		this.belongTrunk = belongTrunk;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public EntryType getType() {
		return type;
	}
	public void setType(EntryType type) {
		this.type = type;
	}
	
}
