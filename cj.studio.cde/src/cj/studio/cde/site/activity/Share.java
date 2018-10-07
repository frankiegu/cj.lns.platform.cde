package cj.studio.cde.site.activity;
/**
 * 分享：也叫重发，因此只记录谁分享到哪里了
 * @author carocean
 *
 */
public class Share {

	public String docid;
	public long ctime;
	public transient String id;
	public String user;
	public String desc;//分享到哪里，可以是目标系统，如分享到朋友圈，分享到新浪等
}
