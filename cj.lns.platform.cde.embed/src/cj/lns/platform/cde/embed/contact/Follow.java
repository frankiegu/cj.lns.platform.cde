package cj.lns.platform.cde.embed.contact;
//表示：follower关注了following,如果isboth=false表示仅仅关注了，true表示互为关注
public class Follow {
	public String follower;//粉丝
	public String following;//关注的
	public boolean isBoth;
	public long ctime;
}
