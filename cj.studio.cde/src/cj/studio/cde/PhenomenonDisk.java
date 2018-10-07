package cj.studio.cde;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.bson.BsonDocument;
import org.bson.Document;
import org.bson.conversions.Bson;

import com.mongodb.MongoClient;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoCursor;

import cj.lns.chip.sos.cube.framework.FileInfo;
import cj.lns.chip.sos.cube.framework.FileSystem;
import cj.lns.chip.sos.cube.framework.ICube;
import cj.lns.chip.sos.cube.framework.IDocument;
import cj.lns.chip.sos.cube.framework.IQuery;
import cj.lns.chip.sos.cube.framework.OpenMode;
import cj.lns.chip.sos.cube.framework.TupleDocument;
import cj.lns.chip.sos.cube.framework.lock.FileLockException;
import cj.lns.chip.sos.disk.NetDisk;
import cj.studio.ecm.EcmException;
import cj.ultimate.util.StringUtil;

public class PhenomenonDisk implements IPhenomenonFactory {
	ICube cube;
	private String diskName;
	private String cubeName;
	private MongoClient client;

	private PhenomenonDisk() {
	}

	@Override
	public String addTrunk(Trunk trunk) {
		if (trunk.ctime < 1) {
			trunk.ctime = System.currentTimeMillis();
		}
		if(StringUtil.isEmpty(trunk.getGuid())){
			trunk.guid=UUID.randomUUID().toString();
		}else{
			if(containsTrunk(trunk.guid)){
				throw new EcmException("已存在事象,guid："+trunk.guid);
			}
		}
		String id = cube.saveDoc("cde.trunks", new TupleDocument<Trunk>(trunk));
		trunk.trunkid = id;
		return id;
	}
	@Override
	public boolean containsTrunk(String guid){
		IQuery<Long> q = cube.createQuery(
				"select {'tuple':'*'}.count() from tuple cde.trunks ?(clazz) where {'tuple.guid':'?(guid)'}");
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("guid", guid);
		return q.count()>0;
	}
	@Override
	public List<Trunk> getTrunks(int limit, int skip) {
		IQuery<Trunk> q = cube.createQuery(String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s) from tuple cde.trunks ?(clazz) where {}", limit, skip));
		q.setParameter("clazz", Trunk.class.getName());
		List<IDocument<Trunk>> docs = q.getResultList();
		List<Trunk> trunks = new ArrayList<>();
		for (IDocument<Trunk> doc : docs) {
			Trunk t = doc.tuple();
			t.trunkid = doc.docid();
			trunks.add(t);
		}
		return trunks;
	}

	public static IPhenomenonFactory openDisk(MongoClient client, String disk, String cube) {
		PhenomenonDisk pd = new PhenomenonDisk();
		pd.cube = NetDisk.trustOpen(client, disk).cube(cube);
		pd.diskName = disk;
		pd.cubeName = cube;
		pd.client = client;
		return pd;
	}

	@Override
	public MongoClient getClient() {
		return client;
	}

	@Override
	public String getCubeName() {
		return cubeName;
	}

	@Override
	public String getDiskName() {
		return diskName;
	}

	@Override
	public Trunk getTrunk(String trunkid) {
		IQuery<Trunk> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.trunks ?(clazz) where {'_id':ObjectId('?(trunkid)')}");
		q.setParameter("clazz", Trunk.class.getName());
		q.setParameter("trunkid", trunkid);
		IDocument<Trunk> doc = q.getSingleResult();
		if (doc == null)
			return null;
		Trunk ret = doc.tuple();
		ret.setTrunkid(doc.docid());
		return ret;
	}
	@Override
	public Trunk getTrunkByGuid(String guid) {
		IQuery<Trunk> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.trunks ?(clazz) where {'tuple.guid':'?(guid)'}");
		q.setParameter("clazz", Trunk.class.getName());
		q.setParameter("guid", guid);
		IDocument<Trunk> doc = q.getSingleResult();
		if (doc == null)
			return null;
		Trunk ret = doc.tuple();
		ret.setTrunkid(doc.docid());
		return ret;
	}
	@Override
	public void removeTrunk(String trunkid) {
		IQuery<Branch> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.branches ?(clazz) where {'tuple.belong':'?(belong)'}");
		q.setParameter("belong", trunkid);
		q.setParameter("clazz", Branch.class.getName());
		List<IDocument<Branch>> docs = q.getResultList();
		for (IDocument<Branch> doc : docs) {
			removeBranch(doc.docid());
		}
		cube.deleteDoc("cde.trunks", trunkid);
	}

	@Override
	public Branch getBranch(String branchid) {
		IQuery<Branch> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.branches ?(clazz) where {'_id':ObjectId('?(branchid)')}");
		q.setParameter("clazz", Branch.class.getName());
		q.setParameter("branchid", branchid);
		IDocument<Branch> doc = q.getSingleResult();
		if (doc == null)
			return null;
		Branch ret = doc.tuple();
		ret.branchid = doc.docid();
		return ret;
	}

	@Override
	public String addBranch(Branch b) {
		if (StringUtil.isEmpty(b.belong)) {
			throw new EcmException("分支未指定主干");
		}
		if (StringUtil.isEmpty(b.name)) {
			throw new EcmException("分支未指定分支名");
		}
		if (StringUtil.isEmpty(b.creator)) {
			throw new EcmException("分支未指定创建者");
		}
		if (b.ctime < 1) {
			b.ctime = System.currentTimeMillis();
		}
		if (StringUtil.isEmpty(b.parent)) {
			b.parent = "/";
		}

		if (b.type == null) {
			b.type = BranchType.down;
		}
		IQuery<Long> q = cube.createQuery(
				"select {'tuple':'*'}.count() from tuple cde.branches ?(clazz) where {'tuple.belong':'?(belong)','tuple.parent':'?(parent)','tuple.name':'?(name)','tuple.type':'?(type)'}");
		q.setParameter("clazz", Branch.class.getName());
		q.setParameter("parent", b.parent);
		q.setParameter("belong", b.belong);
		q.setParameter("type", b.type);
		q.setParameter("name", b.name);
		if (q.count() > 0)
			throw new EcmException(String.format("事象：%s 已存在%s分支：%s/%s", b.getBelong(), b.type, b.parent, b.name));
		String id = cube.saveDoc("cde.branches", new TupleDocument<Branch>(b));
		b.branchid = id;
		return id;
	}

	@Override
	public void removeBranch(String branchid) {
		Branch b = getBranch(branchid);
		if (b == null)
			return;
		List<Entry> entries = getEntries(b.belong, branchid, Integer.MAX_VALUE, 0);
		for (Entry e : entries) {
			unmountEntry(e.entryid);
		}
		// cube.deleteDocs("cde.entries",
		// String.format("{'tuple.belongTrunk':'%s','tuple.belongBranch':'%s'}",
		// b.belong, b.branchid));
		cube.deleteDoc("cde.branches", branchid);
	}

	@Override
	public Branch getBranch(String trunkid, String parent, String name) {
		IQuery<Branch> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.branches ?(clazz) where {'tuple.belong':'?(belong)','tuple.parent':'?(parent)','tuple.name':'?(name)'}");
		q.setParameter("clazz", Branch.class.getName());
		q.setParameter("belong", trunkid);
		q.setParameter("parent", parent);
		q.setParameter("name", name);
		IDocument<Branch> doc = q.getSingleResult();
		if (doc == null)
			return null;
		Branch ret = doc.tuple();
		ret.branchid = doc.docid();
		return ret;
	}

	@Override
	public void updateBranchWeight(String branchid, long weight) {
		Bson update = BsonDocument.parse(String.format("{'$set':{'tuple.weight':%s}}", weight));
		Bson filter = BsonDocument.parse(String.format("{'_id':ObjectId(%s)}", branchid));
		cube.updateDocOne("cde.branches", filter, update);
	}

	@Override
	public void renameBranch(String branchid, String newname) {
		Bson update = BsonDocument.parse(String.format("{'$set':{'tuple.name':%s}}", newname));
		Bson filter = BsonDocument.parse(String.format("{'_id':ObjectId(%s)}", branchid));
		cube.updateDocOne("cde.branches", filter, update);
	}

	@Override
	public Branch getBranchByFullPath(String trunkid, String path) {
		String patharr[] = path.split("/");
		Branch b = null;
		for (String p : patharr) {
			if (StringUtil.isEmpty(p))
				continue;
			String parent = b == null ? "/" : b.branchid;
			b = getBranch(trunkid, parent, p);
		}
		return b;
	}

	@Override
	public String getBranchFullPath(String branchid) {
		Branch b = getBranch(branchid);
		String ret = String.format("/%s", b.name);
		if (!"/".equals(b.parent)) {
			ret = String.format("%s%s", getBranchFullPath(b.parent), ret);
		}
		return ret;
	}

	@Override
	public List<Branch> getBranches(String trunkid, BranchType type, String parent, int limit, int skip) {
		IQuery<Branch> q = cube.createQuery(String.format(
				"select {'tuple':'*'}.sort({'tuple.type':-1}).limit(%s).skip(%s) from tuple cde.branches ?(clazz) where {'tuple.belong':'?(belong)','tuple.type':'?(type)','tuple.parent':'?(parent)'}",
				limit, skip));
		q.setParameter("belong", trunkid);
		q.setParameter("type", type);
		q.setParameter("parent", parent);
		q.setParameter("clazz", Branch.class.getName());
		List<IDocument<Branch>> docs = q.getResultList();
		List<Branch> branches = new ArrayList<>();
		for (IDocument<Branch> doc : docs) {
			Branch t = doc.tuple();
			t.branchid = doc.docid();
			branches.add(t);
		}
		return branches;
	}

	@Override
	public List<Branch> getBranches(String trunkid, String parent, int limit, int skip) {
		IQuery<Branch> q = cube.createQuery(String.format(
				"select {'tuple':'*'}.sort({'tuple.type':-1}).limit(%s).skip(%s) from tuple cde.branches ?(clazz) where {'tuple.belong':'?(belong)','tuple.parent':'?(parent)'}",
				limit, skip));
		q.setParameter("belong", trunkid);
		q.setParameter("parent", parent);
		q.setParameter("clazz", Branch.class.getName());
		List<IDocument<Branch>> docs = q.getResultList();
		List<Branch> branches = new ArrayList<>();
		for (IDocument<Branch> doc : docs) {
			Branch t = doc.tuple();
			t.branchid = doc.docid();
			branches.add(t);
		}
		return branches;
	}

	@Override
	public void updateEntryWeight(String entryid, long weight) {
		Bson update = BsonDocument.parse(String.format("{'$set':{'tuple.weight':%s}}", weight));
		Bson filter = BsonDocument.parse(String.format("{'_id':ObjectId(%s)}", entryid));
		cube.updateDocOne("cde.entries", filter, update);
	}

	@Override
	public void renameEntry(String entryid, String newname) {
		Bson update = BsonDocument.parse(String.format("{'$set':{'tuple.name':%s}}", newname));
		Bson filter = BsonDocument.parse(String.format("{'_id':ObjectId(%s)}", entryid));
		cube.updateDocOne("cde.entries", filter, update);
	}

	@Override
	public String addEntry(Entry entry) {
		if (StringUtil.isEmpty(entry.name)) {
			throw new EcmException("项名为空");
		}
		if (StringUtil.isEmpty(entry.belongTrunk)) {
			throw new EcmException("项不明所在主干");
		}
		if (StringUtil.isEmpty(entry.belongBranch)) {
			throw new EcmException("项不明所在分支");
		}
		if (entry.ctime < 1) {
			entry.ctime = System.currentTimeMillis();
		}
		IQuery<Long> q = cube.createQuery(
				"select {'tuple':'*'}.count() from tuple cde.entries ?(clazz) where {'tuple.belongTrunk':'?(belongTrunk)','tuple.belongBranch':'?(belongBranch)','tuple.name':'?(name)'}");
		q.setParameter("clazz", Entry.class.getName());
		q.setParameter("belongTrunk", entry.belongTrunk);
		q.setParameter("belongBranch", entry.belongBranch);
		q.setParameter("name", entry.name);
		if (q.count() > 0)
			throw new EcmException(
					String.format("事象：%s 的分支：%s上已存在项：%s", entry.belongTrunk, entry.belongBranch, entry.name));

		String id = cube.saveDoc("cde.entries", new TupleDocument<Entry>(entry));
		entry.entryid = id;
		return id;
	}

	@Override
	public Entry getEntry(String entryid) {
		IQuery<Entry> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.entries ?(clazz) where {'_id':ObjectId('?(entryid)')}");
		q.setParameter("clazz", Entry.class.getName());
		q.setParameter("entryid", entryid);
		IDocument<Entry> doc = q.getSingleResult();
		if (doc == null)
			return null;
		Entry ret = doc.tuple();
		ret.entryid = doc.docid();
		return ret;
	}

	@Override
	public List<Entry> getEntries(String trunkid, String branchid, int limit, int skip) {
		IQuery<Entry> q = cube.createQuery(String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s) from tuple cde.entries ?(clazz) where {'tuple.belongTrunk':'?(belongTrunk)','tuple.belongBranch':'?(belongBranch)'}",
				limit, skip));
		q.setParameter("belongTrunk", trunkid);
		q.setParameter("belongBranch", branchid);
		q.setParameter("clazz", Entry.class.getName());
		List<IDocument<Entry>> docs = q.getResultList();
		List<Entry> entries = new ArrayList<>();
		for (IDocument<Entry> doc : docs) {
			Entry t = doc.tuple();
			t.entryid = doc.docid();
			entries.add(t);
		}
		return entries;
	}

	@Override
	public void close() {
		cube.close();
		cube = null;
		client = null;
	}

	@Override
	public Trunk createPhenomenon(String guid,String creator, String body, String desc) {
		return createPhenomenon(guid,creator, null, body, desc);
	}

	@Override
	public Trunk createPhenomenon(String guid,String creator, String title, String body, String desc) {
		if (StringUtil.isEmpty(body)) {
			throw new EcmException("正文为空");
		}
		if (StringUtil.isEmpty(title)) {// 取摘要作为标题
			int len = body.length();
			title = len <= 48 ? body : body.substring(0, 48);
		}
		Trunk trunk = new Trunk();
		trunk.guid=guid;
		trunk.creator = creator;
		this.addTrunk(trunk);
		Branch b = new Branch();
		b.setBelong(trunk.getTrunkid());
		b.setName("内容");
		b.setParent("/");
		b.creator = creator;
		addBranch(b);
		Entry entry = new Entry();
		entry.setBelongBranch(b.getBranchid());
		entry.setBelongTrunk(b.getBelong());
		entry.setCreator(creator);
		entry.setName(title);// 此为事象的标题
		entry.setType(EntryType.content);// 此为事象的内容
		entry.setValue(body);
		entry.setDesc(desc);
		addEntry(entry);
		return trunk;
	}

	@Override
	public boolean isMountedPhenomenon(IPhenomenonFactory srcFactory, String srctrunkid, String destbranchid) {
		Trunk srctrunk = srcFactory.getTrunk(srctrunkid);
		if (srctrunk == null)
			return false;
		String path = String.format("%s->%s->%s", srcFactory.getDiskName(), srcFactory.getCubeName(), srctrunkid);
		Branch destbranch = getBranch(destbranchid);
		if (destbranch == null)
			return false;
		String cjql = "select {'tuple':'*'}.count() from tuple cde.entries java.lang.Long where {'tuple.belongTrunk':'?(trunkid)','tuple.belongBranch':'?(branchid)','tuple.type':'phenomenon','tuple.value':'?(value)',}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("trunkid", destbranch.belong);
		q.setParameter("branchid", destbranch.branchid);
		q.setParameter("value", path);
		return q.count() > 0;
	}

	@Override
	public Entry mountPhenomenon(IPhenomenonFactory srcFactory, String srctrunkid, String destbranchid,
			String entryName, long weight) {
		// 挂载到目标，并为源事象添加到目标的指针
		Branch destbranch = this.getBranch(destbranchid);
		if (destbranch == null) {
			throw new EcmException("目标分支不存在.");
		}
		Trunk srctrunk = srcFactory.getTrunk(srctrunkid);
		if (StringUtil.isEmpty(entryName)) {
			Entry srctitle = srcFactory.getPhenomenonNameEntry(srctrunkid);
			if (srctitle == null) {
				throw new EcmException(String.format("源事象:%s 缺少内容", srctrunk));
			}
			entryName = srctitle.name;
		}
		Entry destentry = new Entry();
		destentry.belongBranch = destbranchid;
		destentry.belongTrunk = destbranch.belong;
		destentry.type = EntryType.phenomenon;
		destentry.creator = srctrunk.creator;
		destentry.name = entryName;
		destentry.value = String.format("%s->%s->%s", srcFactory.getDiskName(), srcFactory.getCubeName(), srctrunkid);// 指向源事象的指针
		destentry.weight = weight;
		this.addEntry(destentry);

		Entry desttitle = this.getPhenomenonNameEntry(destbranch.belong);
		if (desttitle == null) {
			throw new EcmException(String.format("目标事象:%s 缺少内容", destbranch.belong));
		}
		String srcbranchname = "/" + desttitle.name;

		Branch srcbranch = srcFactory.getBranchByFullPath(srctrunkid, srcbranchname);
		if (srcbranch == null) {// 为源事象新建一个branch
			srcbranch = new Branch();
			srcbranch.belong = srctrunkid;
			srcbranch.parent = "/";
			srcbranch.type = BranchType.up;
			srcbranch.name = desttitle.name;
			srcbranch.creator = srctrunk.creator;
			srcFactory.addBranch(srcbranch);
		}
		String srcBranchPath = this.getBranchFullPath(destbranch.branchid);
		Entry srcentry = destentry;
		srcentry.belongBranch = srcbranch.branchid;
		srcentry.belongTrunk = srcbranch.belong;
		srcentry.type = EntryType.phenomenon;
		srcentry.name = srcBranchPath;
		srcentry.creator = srctrunk.creator;
		// srcentry.value = String.format("%s->%s->%s:/%s", this.getDiskName(),
		// this.getCubeName(), destbranch.belong,
		// srcBranchPath);
		srcentry.value = String.format("%s->%s->%s", this.getDiskName(), this.getCubeName(), destbranch.belong);
		srcFactory.addEntry(srcentry);
		return destentry;
	}

	@Override
	public Entry getPhenomenonNameEntry(String trunkid) {
		Branch srcCnt = getBranchByFullPath(trunkid, "/内容");
		if (srcCnt == null) {
			return null;
		}
		List<Entry> srcentry = getEntries(trunkid, srcCnt.branchid, 1, 0);
		if (srcentry.isEmpty()) {
			return null;
		}
		return srcentry.get(0);
	}
	@Override
	public Entry getPhenomenonNameEntryByGuid(String guid) {
		Trunk t=getTrunkByGuid(guid);
		if(t==null)return null;
		return getPhenomenonNameEntry(t.trunkid);
	}
	@Override
	public void unmountEntry(String entryid) {
		Entry entry = getEntry(entryid);
		if (entry == null) {
			throw new RuntimeException("项不存在：" + entryid);
		}
		switch (entry.type) {
		case content:
		case website:
			cube.deleteDoc("cde.entries", entryid);
			break;
		case file:
			String fn = entry.value;
			try {
				FileInfo file = cube.fileSystem().openFile(fn);
				file.delete();
				cube.deleteDoc("cde.entries", entryid);
			} catch (FileNotFoundException e) {
				throw new RuntimeException(e);
			} catch (FileLockException e) {
				throw new RuntimeException(e);
			}
			break;
		case phenomenon:
			String point = entry.value;
			String[] arr = point.split("->");
			Branch b = getBranch(entry.belongBranch);
			if (b.type == BranchType.down) {// 删除对端up分支其下对应项，如果分支为空，则删除up分支;成功后再删除当前项
				IPhenomenonFactory srcFactory = PhenomenonDisk.openDisk(client, arr[0], arr[1]);
				String path = String.format("%s->%s->%s", this.getDiskName(), this.getCubeName(), entry.belongTrunk);
				String name = String.format("/%s", this.getPhenomenonNameEntry(entry.belongTrunk).name);
				Branch upb = srcFactory.getBranchByFullPath(arr[2], name);
				if (upb != null) {
					ICube cube = ((PhenomenonDisk) srcFactory).cube;
					String upbid = upb.branchid;
					String upEntryName = this.getBranchFullPath(b.branchid);
					String del = String.format(
							"{'tuple.type':'phenomenon','tuple.belongBranch':'%s','tuple.belongTrunk':'%s','tuple.name':'%s','tuple.value':'%s'}",
							upbid, upb.belong, upEntryName, path);
					cube.deleteDocOne("cde.entries", del);

					String cjql = "select {'tuple':'*'}.count() from tuple cde.entries java.lang.Long where {'tuple.type':'phenomenon','tuple.belongTrunk':'?(trunkid)','tuple.belongBranch':'?(branchid)','tuple.value':'?(value)'}";
					IQuery<Long> q = cube.createQuery(cjql);
					q.setParameter("trunkid", upb.belong);
					q.setParameter("branchid", upb.branchid);
					q.setParameter("value", path);
					if (q.count() < 1) {// 删除分支
						cube.deleteDoc("cde.branches", upb.branchid);
					}
				}
				cube.deleteDoc("cde.entries", entryid);
			} else if (b.type == BranchType.up) {// 删除对端down下对应项;成功后再删除当前项
				IPhenomenonFactory destFactory = PhenomenonDisk.openDisk(client, arr[0], arr[1]);
				String path = String.format("%s->%s->%s", this.getDiskName(), this.getCubeName(), entry.belongTrunk);
				Branch downb = destFactory.getBranchByFullPath(arr[2], entry.name/* 项名是对方分支路径 */);
				if (downb != null) {
					String del = String.format(
							"{'tuple.type':'phenomenon','tuple.belongBranch':'%s','tuple.belongTrunk':'%s','tuple.value':'%s'}",
							downb.branchid, downb.belong, path);
					ICube cube = ((PhenomenonDisk) destFactory).cube;
					cube.deleteDocOne("cde.entries", del);
				}
				cube.deleteDoc("cde.entries", entryid);
				String cjql = "select {'tuple':'*'}.count() from tuple cde.entries java.lang.Long where {'tuple.type':'phenomenon','tuple.belongTrunk':'?(trunkid)','tuple.belongBranch':'?(branchid)'}";
				IQuery<Long> q = cube.createQuery(cjql);
				q.setParameter("trunkid", entry.belongTrunk);
				q.setParameter("branchid", entry.belongBranch);
				if (q.count() < 1) {// 删除分支
					cube.deleteDoc("cde.branches", entry.belongBranch);
				}
			}

			break;

		}
	}

	// 挂载文件
	@Override
	public FileInfo mountFile(String creator, String branchid, String fileName) {
		FileSystem fs = cube.fileSystem();
		FileInfo file;
		try {
			file = fs.openFile(fileName, OpenMode.openOrNew);
		} catch (FileNotFoundException | FileLockException e) {
			throw new RuntimeException(e);
		}
		Branch b = getBranch(branchid);
		Entry entry = new Entry();
		entry.belongBranch = branchid;
		entry.belongTrunk = b.belong;
		entry.type = EntryType.file;
		entry.creator = creator;
		entry.name = file.name();
		entry.value = file.fullName();// 指向源事象的指针
		addEntry(entry);
		return file;
	}

	@Override
	// 挂载内容，包括远程网站页面的挂载(text是json，网址及内容摘要)
	public void mountText(String creator, String branchid, String title, String text) {
		if (StringUtil.isEmpty(text)) {
			throw new RuntimeException("要挂载的文本为空");
		}
		Branch b = getBranch(branchid);
		Entry entry = new Entry();
		entry.belongBranch = branchid;
		entry.belongTrunk = b.belong;
		entry.type = EntryType.content;
		entry.creator = creator;
		if (StringUtil.isEmpty(title)) {
			int len = text.length();
			title = len <= 48 ? text : text.substring(0, 48);
		}
		entry.name = title;
		entry.value = text;// 指向源事象的指针
		addEntry(entry);
	}

	@Override
	public void mountWebsite(String creator, String branchid, String href, String title, String desc) {
		if (StringUtil.isEmpty(title)) {
			throw new RuntimeException("要挂载的网站名为空");
		}
		if (StringUtil.isEmpty(desc)) {
			throw new RuntimeException("要挂载的网站摘要为空");
		}
		Branch b = getBranch(branchid);
		Entry entry = new Entry();
		entry.belongBranch = branchid;
		entry.belongTrunk = b.belong;
		entry.type = EntryType.website;
		entry.creator = creator;
		entry.name = title;
		String json = String.format("{'href':'%s','desc':'%s'}", href, desc);
		entry.value = json;
		addEntry(entry);
	}

	// 获取磁盘上的事象实体
	@Override
	public List<Phenomenon> getPhenomenons(int limit, int skip) {
		List<Phenomenon> list = new ArrayList<>();
		List<Trunk> trunks = getTrunks(limit, skip);
		for (Trunk t : trunks) {
			Entry e = getPhenomenonNameEntry(t.trunkid);
			Branch branch = null;
			if (e != null)
				branch = getBranch(e.belongBranch);
			Phenomenon p = new Phenomenon(t, branch, e);
			list.add(p);
		}
		return list;
	}

	@Override
	// 获取参与者，它用于指定对象变更时通知给此事象的相关者，指下行分支及其事项的参与者
	public List<String> getPrincipals(String trunkid) {
		List<String> users = new ArrayList<>();
		IQuery<Branch> q = cube.createQuery(
				"select {'tuple':'*'} from tuple cde.branches ?(clazz) where {'tuple.belong':'?(belong)','tuple.type':'down'}");
		q.setParameter("belong", trunkid);
		q.setParameter("clazz", Branch.class.getName());
		List<IDocument<Branch>> docs = q.getResultList();
		List<String> bids = new ArrayList<>();
		for (IDocument<Branch> doc : docs) {
			Branch t = doc.tuple();
			bids.add(String.format("'%s'", doc.docid()));
			if (!StringUtil.isEmpty(t.creator) && !users.contains(t.creator)) {
				users.add(t.creator);
			}
		}

		IQuery<String> qe = cube.createQuery(
				"select {'tuple.creator':1}.distinct() from tuple cde.entries ?(clazz) where {'tuple.belongTrunk':'?(belongTrunk)','tuple.belongBranch':{'$in':?(belongBranch)}}");
		qe.setParameter("belongTrunk", trunkid);
		qe.setParameter("belongBranch", bids);
		qe.setParameter("clazz", String.class.getName());
		List<IDocument<String>> doces = qe.getResultList();
		for (IDocument<String> doc : doces) {
			String t = doc.tuple();
			if (!StringUtil.isEmpty(t) && !users.contains(t)) {
				users.add(t);
			}
		}
		return users;
	}

	@Override
	public List<ECell> getECells(String trunkid, String[] paths, int sort, String wherejson, int limit, int skip) {
		String[] bids = new String[paths.length];
		for (int i = 0; i < paths.length; i++) {
			String p = paths[i];
			Branch b = getBranchByFullPath(trunkid, p);
			if (b != null) {
				bids[i] = b.branchid;
			}
		}

		return getEntries(bids, sort, wherejson, limit, skip);
	}

	@Override
	public List<ECell> getEntries(String[] branchids, int sort, String wherejson, int limit, int skip) {
		if (limit < 1) {
			limit = Integer.MAX_VALUE;
		}
		sort = sort == 0 ? 1 : sort;

		String in = "";
		for (String id : branchids) {
			in = String.format("%s,'%s'", in, id);
		}
		if (in.startsWith(",")) {
			in = in.substring(1, in.length());
		}

		// 使用分组得到结果，key是value
		String cjql = String.format("{'tuple.belongBranch':{$in:[%s]},", in);
		if (!StringUtil.isEmpty(wherejson)) {
			String where = wherejson.trim();
			if (where.startsWith("{")) {
				where = where.substring(1, where.length());
				cjql = String.format("%s%s", cjql, where);
			}
		}
		if (cjql.endsWith(",")) {
			cjql = cjql.substring(0, cjql.length() - 1);
		}
		cjql = String.format("%s}", cjql);

		List<Document> list = new ArrayList<>();

		list.add(Document.parse(String.format("{$match:%s}", cjql)));
		list.add(Document.parse(String.format("{$limit:%s}", limit)));
		list.add(Document.parse(String.format("{$skip:%s}", skip)));
		list.add(Document.parse(String.format("{$sort:{'tuple.ctime':%s}}", sort)));
		//项名有可能不同，因此去掉
		list.add(Document.parse(String.format("{$group:{'_id':{'value':'$tuple.value','type':'$tuple.type'},'count':{$sum:1}}}")));
		list.add(Document.parse(String.format("{$match:{'count':%s}}", branchids.length)));
		AggregateIterable<Document> documents = cube.aggregate("cde.entries", list);
		MongoCursor<Document> cur = documents.iterator();
		List<ECell> cells=new ArrayList<>();
		while (cur.hasNext()) {
			Document doc = cur.next();
			ECell cell=new ECell();
			Document id=(Document)doc.get("_id");
			cell.value=id.getString("value");
			String type=id.getString("type");
			if(!StringUtil.isEmpty(type)){
				cell.type=EntryType.valueOf(type);
			}
			cells.add(cell);
		}
		
		return cells;
	}

	@Override
	public Entry getEntry(String trunkid, String path, String entryName) {
		Branch b = getBranchByFullPath(trunkid, path);
		if (b == null)
			return null;
		String cjql = "select {'tuple':'*'} from tuple cde.entries ?(clazz) where {'tuple.name':'?(name)'}";
		IQuery<Entry> q = cube.createQuery(cjql);
		q.setParameter("clazz", Entry.class.getName());
		q.setParameter("name", entryName);
		IDocument<Entry> doc = q.getSingleResult();
		if (doc == null)
			return null;
		Entry en = doc.tuple();
		en.entryid = doc.docid();
		return en;
	}
	@Override
	public List<Entry> getPhenomenonsByECells(List<ECell> ecells) {
		List<Entry> entries=new ArrayList<>();
		IPhenomenonFactory factory=null;
		//将来改成in语句，交由mongodb完成返回，目前凑合着，一行一行查性能肯定差，而且是用于平台首页。
		for(ECell en:ecells){
			if(en.type!=EntryType.phenomenon){
				continue;
			}
			String[] arr=en.getValue().split("->");
			factory = PhenomenonDisk.openDisk(client, arr[0], arr[1]);
			String trunkid=arr[2];
			Entry entry=factory.getPhenomenonNameEntry(trunkid);
			entries.add(entry);
		}
		return entries;
	}
}
