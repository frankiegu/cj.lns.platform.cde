package cj.lns.platform.cde.embed.contact;

import java.util.List;

public interface IContacts {
	static String COL_CONTACTS="cde.contacts";
	FollowType follow(String follower,String following);
	void unfollow(String follower,String following);
	FollowType relationship(String follower,String following);
	List<Follow> follower(String user);
	List<Follow> following(String user);
	List<Follow> followAll(String user);
	List<Follow> followBoth(String user);
	long followerCount(String user);
	long followingCount(String user);
	long followAllCount(String user);
	long followBothCount(String user);
}
