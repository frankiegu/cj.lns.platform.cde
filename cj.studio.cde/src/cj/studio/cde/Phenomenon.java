package cj.studio.cde;
/**
 * 事象实体类
 * <pre>
 * 事象实体只取出事象的内容，至于它的其它分支和项，需要通过事象工厂即取即得
 * </pre>
 * @author carocean
 *
 */
public class Phenomenon {
	Trunk trunk;
	Branch contentBranch;
	Entry contentEntry;
	
	public Phenomenon(Trunk trunk, Branch contentBranch, Entry contentEntry) {
		super();
		this.trunk = trunk;
		this.contentBranch = contentBranch;
		this.contentEntry = contentEntry;
	}
	public Trunk getTrunk() {
		return trunk;
	}
	public Branch getContentBranch() {
		return contentBranch;
	}
	public Entry getContentEntry() {
		return contentEntry;
	}
	
}
