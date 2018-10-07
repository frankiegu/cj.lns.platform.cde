package cj.studio.cde.site.activity;
//文章的连接双方表
public class Connect {

	public String docid;
	public String author;//作者
	public String anotherDocid;
	public String anotherAuthor;//另一方文档的作者
	public long ctime;
	public transient String id;
	public ConnectType type;
	public String user;//连接者
	public String html;//连接者
	public String source;//连接者
	public String title;
	public transient Integer count;
}
