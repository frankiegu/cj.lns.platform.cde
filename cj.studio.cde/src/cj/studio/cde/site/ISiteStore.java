package cj.studio.cde.site;

import java.util.List;
import java.util.Map;

import org.bson.conversions.Bson;

import cj.studio.cde.site.activity.Comment;
import cj.studio.cde.site.activity.Connect;
import cj.studio.cde.site.activity.ConnectType;
import cj.studio.cde.site.activity.Follow;
import cj.studio.cde.site.activity.Like;
import cj.studio.cde.site.activity.Share;
import cj.studio.cde.site.activity.Visitor;

public interface ISiteStore {
	static String COL_SITE_STORE = "catsite.documents";
	static String COL_SITE_LIKE = "catsite.likes";//赞
	static String COL_SITE_VISITOR = "catsite.visitors";//浏览
	static String COL_SITE_COMMENT = "catsite.comments";//评论
	static String COL_SITE_SHARE = "catsite.shares";//分享，概念就是又发出，因此记录发往哪就行了，至于别人接到是否标明来源不管发送者的事儿，发送方能看到谁分享了它的文档就行了
	static String COL_SITE_FOLLOW = "catsite.follows";//关注,主要是指人对此文的动态进行了关注，而连接包含有关注的所有功能，即也会通知动态到人。最关键的是连接是文章之间的相关性
	static String COL_SITE_CONNECT = "catsite.connects";//连接:别的doc与此doc发生关系,有挂载与挂载于两种类型
	
	String likeit(String docid,Like like);
	void unLike(String docid,String likeid);
	List<Like> likes(String docid,int limit,int skip);
	
	String visitorit(String docid,Visitor visitor);
	void unVisitor(String docid,String visitorid);
	List<Visitor> visitors(String docid,int limit,int skip);
	
	String followit(String docid,Follow follow);
	void unFollow(String docid,String followid);
	List<Follow> follows(String docid,int limit,int skip);
	
	String shareit(String docid,Share share);
	void unShare(String docid,String shareid);
	List<Share> shares(String docid,int limit,int skip);
	
	String commentit(String docid,String parentid,Comment comment);
	void unComment(String docid,String commentid);
	List<Comment> comments(String docid,int limit,int skip);
	
	String connectit(String docid,ConnectType type,Connect connect);
	void unConnect(String docid,String connectid);
	List<Connect> connects(String docid,ConnectType type,int limit,int skip);
	List<Connect> connects(String docid,int limit,int skip);
	
	List<ISiteDocument> documents(String path, int limit, int skip);
	/**
	 * 
	 * @param path
	 * @param parallels 平行分类表。如果针对一个分类要按多个值查询，则在为key赋值时按此格式：parallels.put("key","$['para1','para2']);
	 * @param limit
	 * @param skip
	 * @return
	 */
	List<ISiteDocument> documents(String path, Map<String, String> parallels, int limit, int skip);

	List<ISiteDocument> find(String cjql, Map<String, String> parameters);

	List<ISiteDocument> aggregate(List<? extends Bson> pipeline);

	long documentCount(String path);
	/**
	 * 
	 * @param path
	 * @param parallels 平行分类表。如果针对一个分类要按多个值查询，则在为key赋值时按此格式：parallels.put("key","$['para1','para2']);
	 * @return
	 */
	long documentCount(String path, Map<String, String> parallels);

	void removeDocuments(String path);

	void removeDocuments(String path, Map<String, String> parallels);

	void removeDocument(String docid);

	void removeDocument(ISiteDocument doc);


	void close();

	ISiteDocument document(String docid);
	/**
	 * 
	 * @param path
	 * @param creator
	 * @param weight 权重，如果为-1将等同于当前时间
	 * @param tuple
	 * @return
	 */
	ISiteDocument addDocument(String path, String creator, long weight,Object tuple);
	/**
	 * 
	 * @param path
	 * @param creator
	 * @param weight 权重，如果为-1将等同于当前时间
	 * @param parallels
	 * @param tuple
	 * @return
	 */
	ISiteDocument addDocument(String path, String creator,long weight, Map<String, String> parallels, Object tuple);

	void updateDocument(String docid, Object tuple);

	void moveDocument(String docid, String path, Map<String, String> parallels);

	void moveDocument(String docid, String path);

	List<ISiteDocument> ownerDocuments(String creator, int limit, int skip);
	long likesCount(String docid);
	long visitorsCount(String docid);
	long followCount(String docid);
	long shareCount(String docid);
	void updateIndicator(ISiteDocument document, IndicatorType type);
	List<Comment> comments(String docid, String pid, int limit, int skip);
	void updateWeight(String docid, long weight);
	void updateLtime(String docid);
	long ownerDocuments(String creator);
	Visitor userLastVisit(String user);
	void unLikeit(String docid, String user);
	long likesCount(String docid, String user);
	List<Visitor> visitorsGroupByUser(String docid, int limit, int skip);
	List<Like> likesGroupByUser(String docid, int limit, int skip);
	List<Follow> followsGroupByUser(String docid, int limit, int skip);
	void unFollowit(String docid, String user);
	long followsCount(String docid, String user);
	long commentCount(String docid);
	List<Comment> commentsGroupByUser(String docid, int limit, int skip);
	List<Comment> commentsForum(String docid, String thread, int limit, int skip);
	Connect connect(String docid, String connectid);
	List<Connect> connectsGroupByUser(String docid, int limit, int skip);
	long giveLikesCount(String user);
	long getLikesCount(String user);
	long giveCommentCount(String user);
	long giveVisitorsCount(String user);
	long giveConnectCount(String user);
	long getVisitsCount(String user);
	List<String> getVisitsUsers(String user, int limit, int skip);
}
