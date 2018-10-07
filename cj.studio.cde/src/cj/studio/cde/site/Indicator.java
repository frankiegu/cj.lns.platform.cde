package cj.studio.cde.site;
/**
 * 指标
 * @author carocean
 *
 */
public class Indicator {
	long likesCount;
	long commentsCount;
	long visitorsCount;
	long sharesCount;
	long followsCount;
	long connectsCount;//此文档向别的文档连接
	long beconnectsCount;//别的文档向此文档连接
	public long getLikesCount() {
		return likesCount;
	}
	public void setLikesCount(long likesCount) {
		this.likesCount = likesCount;
	}
	public long getCommentsCount() {
		return commentsCount;
	}
	public void setCommentsCount(long commentsCount) {
		this.commentsCount = commentsCount;
	}
	public long getVisitorsCount() {
		return visitorsCount;
	}
	public void setVisitorsCount(long visitorsCount) {
		this.visitorsCount = visitorsCount;
	}
	public long getSharesCount() {
		return sharesCount;
	}
	public void setSharesCount(long sharesCount) {
		this.sharesCount = sharesCount;
	}
	public long getFollowsCount() {
		return followsCount;
	}
	public void setFollowsCount(long followsCount) {
		this.followsCount = followsCount;
	}
	public long getConnectsCount() {
		return connectsCount;
	}
	public void setConnectsCount(long connectsCount) {
		this.connectsCount = connectsCount;
	}
	public long getBeconnectsCount() {
		return beconnectsCount;
	}
	public void setBeconnectsCount(long beconnectsCount) {
		this.beconnectsCount = beconnectsCount;
	}
	
}
