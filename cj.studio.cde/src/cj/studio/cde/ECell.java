package cj.studio.cde;
/**
 * 返回多维查询的项单元
 * @author carocean
 *
 */
public class ECell {
	String value;
	EntryType type;
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
