package cj.lns.platform.cde.embed.contact;

import java.util.ArrayList;
import java.util.List;

import org.bson.Document;

import cj.lns.chip.sos.cube.framework.ICube;
import cj.lns.chip.sos.cube.framework.IDocument;
import cj.lns.chip.sos.cube.framework.IQuery;
import cj.lns.chip.sos.cube.framework.TupleDocument;

//表：follower,following,isBoth=true表示互为关注,ctime
//cj,zxt,true，表示cj关注了zxt，同时赵向涛也关注了cj
//在zxt关注cj时栓测cj,zxt是否存在，如果存在则修改cj,zxt=true,同时它的状态也是true
//cj,zxt,false 表示cj关注了zxt，但赵向涛并没有关注cj
//因此一次查询，而插入时可多做些活
public class Contacts implements IContacts {
	ICube cube;

	@Override
	public FollowType relationship(String follower, String following) {
		String cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.follower':'?(follower)','tuple.following':'?(following)'}");
		IQuery<Follow> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Follow.class.getName());
		q.setParameter("follower", follower);
		q.setParameter("following", following);
		IDocument<Follow> doc = q.getSingleResult();
		if (doc == null)
			return FollowType.none;
		Follow follow = doc.tuple();
		if (follow.isBoth)
			return FollowType.both;
		return FollowType.followingOnly;
	}

	@Override
	public FollowType follow(String follower, String following) {
		FollowType type = relationship(follower, following);
		if (type != FollowType.none) {
			return type;
		}
		// 没有关系则插入，插入前要检查有没有反向关系，如果有则插入为both且更新反向关系为both
		FollowType opposite = relationship(following, follower);
		Follow f = new Follow();
		f.ctime = System.currentTimeMillis();
		f.follower = follower;
		f.following = following;
		if (opposite == FollowType.none) {
			f.isBoth = false;
		} else if (opposite == FollowType.followingOnly) {// 更新反向关系为both
			updateFollowBoth(following, follower, true);
			f.isBoth = true;
		} else {
			f.isBoth = true;
		}
		cube.saveDoc(COL_CONTACTS, new TupleDocument<Follow>(f));
		return f.isBoth ? FollowType.both : FollowType.followingOnly;
	}

	private void updateFollowBoth(String follower, String following, boolean b) {
		Document filter = Document
				.parse(String.format("{'tuple.follower':'%s','tuple.following':'%s'}", follower, following));
		Document update = Document.parse(String.format("{$set:{'tuple.isBoth':%s}}", b));
		cube.updateDocOne(COL_CONTACTS, filter, update);
	}

	@Override
	public void unfollow(String follower, String following) {
		// 检查反向关系如果是both则降为followonly
		// 而后移除正向关系记录，不管存不存在
		FollowType opposite = relationship(following, follower);
		if (opposite == FollowType.both) {
			updateFollowBoth(following, follower, false);
		}
		cube.deleteDocOne(COL_CONTACTS,
				String.format("{'tuple.follower':'%s','tuple.following':'%s'}", follower, following));
	}

	@Override
	public List<Follow> follower(String user) {
		String cjql = String
				.format("select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.following':'?(following)'}");
		IQuery<Follow> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Follow.class.getName());
		q.setParameter("following", user);
		List<IDocument<Follow>> docs = q.getResultList();
		List<Follow> list = new ArrayList<>();
		for (IDocument<Follow> doc : docs) {
			list.add(doc.tuple());
		}
		return list;
	}

	@Override
	public List<Follow> following(String user) {
		String cjql = String
				.format("select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.follower':'?(follower)'}");
		IQuery<Follow> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Follow.class.getName());
		q.setParameter("follower", user);
		List<IDocument<Follow>> docs = q.getResultList();
		List<Follow> list = new ArrayList<>();
		for (IDocument<Follow> doc : docs) {
			list.add(doc.tuple());
		}
		return list;
	}

	@Override
	public List<Follow> followAll(String user) {
		// 非both正向+非both负向+both=全部
		String cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.following':'?(following)','tuple.isBoth':false}");
		IQuery<Follow> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Follow.class.getName());
		q.setParameter("following", user);
		List<IDocument<Follow>> docs = q.getResultList();
		List<Follow> followers = new ArrayList<>();
		for (IDocument<Follow> doc : docs) {
			followers.add(doc.tuple());
		}
		cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.follower':'?(follower)','tuple.isBoth':false}");
		q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Follow.class.getName());
		q.setParameter("follower", user);
		docs = q.getResultList();
		List<Follow> followings = new ArrayList<>();
		for (IDocument<Follow> doc : docs) {
			followings.add(doc.tuple());
		}
		List<Follow> boths = followBoth(user);
		followings.addAll(followers);
		followings.addAll(boths);
		return followings;
	}

	@Override
	public List<Follow> followBoth(String user) {// 由于关注方法已同步了粉丝和关注，因此在此处取一个following即可。
		String cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.following':'?(following)','tuple.isBoth':true}");
		IQuery<Follow> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Follow.class.getName());
		q.setParameter("following", user);
		List<IDocument<Follow>> docs = q.getResultList();
		List<Follow> boths = new ArrayList<>();
		for (IDocument<Follow> doc : docs) {
			boths.add(doc.tuple());
		}
		return boths;
	}

	@Override
	public long followerCount(String user) {
		String cjql = String.format(
				"select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {'tuple.following':'?(following)'}");
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("following", user);
		return q.count();
	}

	@Override
	public long followingCount(String user) {
		String cjql = String.format(
				"select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {'tuple.follower':'?(follower)'}");
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("follower", user);
		return q.count();
	}

	@Override
	public long followAllCount(String user) {
		// 非both正向+非both负向+both=全部
		long total=0;
		String cjql = String.format(
				"select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {'tuple.following':'?(following)','tuple.isBoth':false}");
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("following", user);
		total+=q.count();
		
		cjql = String.format(
				"select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {'tuple.follower':'?(follower)','tuple.isBoth':false}");
		q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("follower", user);
		total+=q.count();
		total+=followBothCount(user);
		return total;
	}

	@Override
	public long followBothCount(String user) {
		String cjql = String.format(
				"select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {'tuple.following':'?(following)','tuple.isBoth':true}");
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_CONTACTS);
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("following", user);
		return q.count();
	}

	static IContacts contacts;

	public static IContacts open(ICube home) {
		if (contacts != null)
			return contacts;
		Contacts c = new Contacts();
		c.cube = home;
		return c;
	}

}
