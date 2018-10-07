package cj.studio.cde.site;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bson.Document;
import org.bson.conversions.Bson;

import com.mongodb.MongoClient;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.MongoCursor;

import cj.lns.chip.sos.cube.framework.ICube;
import cj.lns.chip.sos.cube.framework.IDocument;
import cj.lns.chip.sos.cube.framework.IQuery;
import cj.lns.chip.sos.cube.framework.TupleDocument;
import cj.lns.chip.sos.disk.INetDisk;
import cj.lns.chip.sos.disk.NetDisk;
import cj.studio.cde.site.activity.Comment;
import cj.studio.cde.site.activity.Connect;
import cj.studio.cde.site.activity.ConnectType;
import cj.studio.cde.site.activity.Follow;
import cj.studio.cde.site.activity.Like;
import cj.studio.cde.site.activity.Share;
import cj.studio.cde.site.activity.Visitor;
import cj.studio.ecm.EcmException;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.util.StringUtil;

public class SiteStore implements ISiteStore {
	private ICube cube;

	private SiteStore() {
	}

	public static ISiteStore open(MongoClient client, String netdisk, String cube) {
		SiteStore store = new SiteStore();
		INetDisk disk = NetDisk.trustOpen(client, netdisk);
		store.cube = disk.cube(cube);
		return store;
	}

	@Override
	public void close() {
		cube = null;
	}

	@Override
	public ISiteDocument document(String docid) {
		String cjql = String.format("select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'_id':ObjectId('%s')}",
				docid);
		IQuery<SiteDocument> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("clazz", SiteDocument.class.getName());
		IDocument<SiteDocument> doc = q.getSingleResult();
		if (doc == null)
			return null;
		SiteDocument tuple = doc.tuple();
		tuple.docid = doc.docid();
		return tuple;
	}

	@Override
	public List<ISiteDocument> ownerDocuments(String creator, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.weight':-1,'tuple.ltime':-1}) from tuple ?(colname) ?(clazz) where {'tuple.creator':'?(creator)'}",
				limit, skip);
		IQuery<SiteDocument> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("clazz", SiteDocument.class.getName());
		q.setParameter("creator", creator);
		List<IDocument<SiteDocument>> docs = q.getResultList();
		List<ISiteDocument> list = new ArrayList<>();
		for (IDocument<SiteDocument> doc : docs) {
			SiteDocument tuple = doc.tuple();
			tuple.docid = doc.docid();
			list.add(tuple);
		}
		return list;
	}
	@Override
	public long ownerDocuments(String creator) {
		String cjql = 
				"select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {'tuple.creator':'?(creator)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("clazz", Long.class.getName());
		q.setParameter("creator", creator);
		
		return q.count();
	}
	@Override
	public List<ISiteDocument> documents(String path, int limit, int skip) {
		return documents(path, null, limit, skip);
	}

	@Override
	public List<ISiteDocument> documents(String path, Map<String, String> parallels, int limit, int skip) {
		PathParser p = PathParser.parse(path);
		String cjql = "";
		StringBuffer sb = new StringBuffer();
		sb.append(String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.weight':-1,'tuple.ltime':-1}) from tuple %s %s where {",
				limit, skip, COL_SITE_STORE, SiteDocument.class.getName()));
		if (parallels != null && !parallels.isEmpty()) {
			Set<String> set = parallels.keySet();
			for (String key : set) {
				String v = parallels.get(key);
				// $['','',''],如果值是多选
				int pos = v.indexOf("$[");
				if (pos == -1) {
					sb.append(String.format("'tuple.parallels.%s':'%s',", key, v));
				} else {
					int last = v.lastIndexOf("]");
					if (last == -1) {
						throw new EcmException("在进行多选查询时，指定的分行分类格式不正确，正确格式是：$['p1','p2']。错误：" + key + "值：" + v);
					}
					v = v.substring(pos + 1, last + 1);
					sb.append(String.format("'tuple.parallels.%s':{$in:%s},", key, v));
				}
			}
		}
		if (StringUtil.isEmpty(p.getSite())) {
			sb.append("}");
			cjql = sb.toString();
			return find(cjql, null);
		} else {
			sb.append(String.format("'tuple.path.site':'%s',", p.getSite()));
		}
		if (StringUtil.isEmpty(p.getPrimary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			cjql = sb.toString();
			return find(cjql, null);
		} else {
			sb.append(String.format("'tuple.path.primary':'%s',", p.getPrimary()));
		}
		if (StringUtil.isEmpty(p.getSecondary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			cjql = sb.toString();
			return find(cjql, null);
		} else {
			sb.append(String.format("'tuple.path.secondary':'%s',", p.getSecondary()));
		}
		if (StringUtil.isEmpty(p.getTertiary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			cjql = sb.toString();
			return find(cjql, null);
		} else {
			sb.append(String.format("'tuple.path.tertiary':'%s'", p.getTertiary()));
			sb.append("}");
			cjql = sb.toString();
			return find(cjql, null);
		}

	}

	@Override
	public List<ISiteDocument> find(String cjql, Map<String, String> parameters) {
		IQuery<SiteDocument> q = cube.createQuery(cjql);
		if (parameters != null && !parameters.isEmpty()) {
			Set<String> set = parameters.keySet();
			for (String key : set) {
				q.setParameter(key, parameters.get(key));
			}
		}
		List<IDocument<SiteDocument>> list = q.getResultList();
		List<ISiteDocument> docs = new ArrayList<>();
		for (IDocument<SiteDocument> doc : list) {
			SiteDocument tuple = doc.tuple();
			tuple.docid = doc.docid();
			docs.add(tuple);
		}
		return docs;
	}

	@Override
	public List<ISiteDocument> aggregate(List<? extends Bson> pipeline) {
		AggregateIterable<SiteDocument> docs = cube.aggregate(COL_SITE_STORE, pipeline, SiteDocument.class);
		MongoCursor<SiteDocument> it = docs.iterator();
		List<ISiteDocument> list = new ArrayList<>();
		while (it.hasNext()) {
			SiteDocument doc = it.next();
			list.add(doc);
		}
		return list;
	}

	@Override
	public ISiteDocument addDocument(String path, String creator, long weight, Object tuple) {
		SiteDocument doc = new SiteDocument(path, tuple);
		if (StringUtil.isEmpty(doc.path().getTertiary())) {
			throw new RuntimeException("文档至少在三级分类内：" + path);
		}
		doc.ctime = System.currentTimeMillis();
		doc.utime = doc.ctime;
		doc.ltime = doc.utime;
		if(weight<0){
			weight=doc.ltime;
		}
		doc.weight = weight;
		doc.creator = creator;
		String docid = cube.saveDoc(COL_SITE_STORE, new TupleDocument<ISiteDocument>(doc));
		doc.docid = docid;
		return doc;

	}

	@Override
	public ISiteDocument addDocument(String path, String creator, long weight, Map<String, String> parallels,
			Object tuple) {
		if (parallels == null || parallels.isEmpty())
			return addDocument(path, creator, weight, tuple);
		SiteDocument doc = new SiteDocument(path, tuple);
		if (StringUtil.isEmpty(doc.path().getTertiary())) {
			throw new RuntimeException("文档至少在三级分类内：" + path);
		}
		doc.ctime = System.currentTimeMillis();
		doc.utime = doc.ctime;
		doc.ltime = doc.utime;
		if(weight<0){
			weight=doc.ltime;
		}
		doc.weight = weight;
		doc.parallels().putAll(parallels);
		doc.creator = creator;
		String docid = cube.saveDoc(COL_SITE_STORE, new TupleDocument<ISiteDocument>(doc));
		doc.docid = docid;
		return doc;
	}

	@Override
	public long documentCount(String path) {
		return documentCount(path, null);
	}

	private long count(String cjql) {
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("clazz", SiteDocument.class.getName());
		return q.count();
	}

	@Override
	public long documentCount(String path, Map<String, String> parallels) {
		PathParser p = PathParser.parse(path);
		String cjql = "";
		StringBuffer sb = new StringBuffer();
		sb.append("select {'tuple':'*'}.count() from tuple ?(colname) ?(clazz) where {");
		if (parallels != null && !parallels.isEmpty()) {
			Set<String> set = parallels.keySet();
			for (String key : set) {
				String v = parallels.get(key);
				// $['','',''],如果值是多选
				int pos = v.indexOf("$[");
				if (pos == -1) {
					sb.append(String.format("'tuple.parallels.%s':'%s',", key, v));
				} else {
					int last = v.lastIndexOf("]");
					if (last == -1) {
						throw new EcmException("在进行多选查询时，指定的分行分类格式不正确，正确格式是：$['p1','p2']。错误：" + key + "值：" + v);
					}
					v = v.substring(pos + 1, last + 1);
					sb.append(String.format("'tuple.parallels.%s':{$in:%s},", key, v));
				}
			}
		}
		if (StringUtil.isEmpty(p.getSite())) {
			sb.append("}");
			cjql = sb.toString();
			return count(cjql);
		} else {
			sb.append(String.format("'tuple.path.site':'%s',", p.getSite()));
		}
		if (StringUtil.isEmpty(p.getPrimary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			cjql = sb.toString();
			return count(cjql);
		} else {
			sb.append(String.format("'tuple.path.primary':'%s',", p.getPrimary()));
		}
		if (StringUtil.isEmpty(p.getSecondary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			cjql = sb.toString();
			return count(cjql);
		} else {
			sb.append(String.format("'tuple.path.secondary':'%s',", p.getSecondary()));
		}
		if (StringUtil.isEmpty(p.getTertiary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			cjql = sb.toString();
			return count(cjql);
		} else {
			sb.append(String.format("'tuple.path.tertiary':'%s'", p.getTertiary()));
			sb.append("}");
			cjql = sb.toString();
			return count(cjql);
		}
	}

	@Override
	public void removeDocuments(String path) {
		PathParser p = PathParser.parse(path);
		String where = "";
		StringBuffer sb = new StringBuffer();
		sb.append("{");
		if (StringUtil.isEmpty(p.getSite())) {
			sb.append("}");
			where = sb.toString();
			cube.deleteDocs(COL_SITE_STORE, where);
			return;
		} else {
			sb.append(String.format("'tuple.path.site':'%s',", p.getSite()));
		}
		if (StringUtil.isEmpty(p.getPrimary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			where = sb.toString();
			cube.deleteDocs(COL_SITE_STORE, where);
			return;
		} else {
			sb.append(String.format("'tuple.path.primary':'%s',", p.getPrimary()));
		}
		if (StringUtil.isEmpty(p.getSecondary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			where = sb.toString();
			cube.deleteDocs(COL_SITE_STORE, where);
			return;
		} else {
			sb.append(String.format("'tuple.path.secondary':'%s',", p.getSecondary()));
		}
		if (StringUtil.isEmpty(p.getTertiary())) {
			sb.deleteCharAt(sb.length() - 1);
			sb.append("}");
			where = sb.toString();
			cube.deleteDocs(COL_SITE_STORE, where);
			return;
		} else {
			sb.append(String.format("'tuple.path.tertiary':'%s'", p.getTertiary()));
			sb.append("}");
			where = sb.toString();
			cube.deleteDocs(COL_SITE_STORE, where);
			return;
		}
	}

	@Override
	public void removeDocuments(String path, Map<String, String> parallels) {
		if (parallels == null || parallels.isEmpty()) {
			removeDocuments(path);
			return;
		}
		PathParser p = PathParser.parse(path);
		if (StringUtil.isEmpty(p.getTertiary())) {
			throw new RuntimeException("查看平行分类必须指定三级分类路径：" + path);
		}
		StringBuffer sb = new StringBuffer();
		sb.append(String.format(
				"{'tuple.path.site':'%s','tuple.path.primary':'%s','tuple.path.secondary':'%s','tuple.path.tertiary':'%s',",
				p.getSite(), p.getPrimary(), p.getSecondary(), p.getTertiary()));
		Set<String> set = parallels.keySet();
		for (String key : set) {
			String v = parallels.get(key);
			sb.append(String.format("'tuple.parallels.%s':'%s',", key, v));
		}
		sb.deleteCharAt(sb.length() - 1);
		sb.append("}");
		String where = sb.toString();
		cube.deleteDocs(COL_SITE_STORE, where);

	}

	@Override
	public void removeDocument(String docid) {
		cube.deleteDoc(COL_SITE_STORE, docid);
	}

	@Override
	public void removeDocument(ISiteDocument doc) {
		removeDocument(doc.docid());
	}

	@Override
	public void updateDocument(String docid, Object document) {
		SiteDocument doc = (SiteDocument) document(docid);
		if (doc == null)
			return;
		doc.document = document;
		doc.utime = System.currentTimeMillis();
		doc.ltime = doc.utime;
		doc.weight++;
		Bson filter = Document.parse(String.format("{'_id':ObjectId('%s')}", docid));
		Bson update = Document.parse(String.format("{$set:{'tuple.document':%s,'tuple.utime':'%s','tuple.ltime':'%s','tuple.weight':'%s'}}",
				new Gson().toJson(document), doc.utime, doc.ltime,doc.weight));
		cube.updateDocOne(COL_SITE_STORE, filter, update);
	}

	@Override
	public void updateWeight(String docid, long weight) {
		SiteDocument doc = (SiteDocument) document(docid);
		if (doc == null)
			return;
		long utime = System.currentTimeMillis();
		long ltime = utime;
		if (weight < 0)
			weight = ltime;
		Bson filter = Document.parse(String.format("{'_id':ObjectId('%s')}", docid));
		Bson update = Document.parse(String.format("{$set:{'tuple.weight':%s,'tuple.utime':'%s','tuple.ltime':'%s'}}",
				weight, utime, ltime));
		cube.updateDocOne(COL_SITE_STORE, filter, update);
	}

	@Override
	public void updateLtime(String docid) {
		SiteDocument doc = (SiteDocument) document(docid);
		if (doc == null)
			return;
		long ltime = System.currentTimeMillis();
		Bson filter = Document.parse(String.format("{'_id':ObjectId('%s')}", docid));
		Bson update = Document.parse(String.format("{$set:{'tuple.ltime':'%s'}}", ltime));
		cube.updateDocOne(COL_SITE_STORE, filter, update);
	}

	@Override
	public void updateIndicator(ISiteDocument document, IndicatorType type) {
		if (StringUtil.isEmpty(document.docid())) {
			throw new EcmException("文档缺少标识：" + document.docid());
		}
		SiteDocument doc = (SiteDocument) document;
		doc.ltime = System.currentTimeMillis();
		Bson filter = Document.parse(String.format("{'_id':ObjectId('%s')}", doc.docid));
		Bson update = null;
		switch (type) {
		case beconnectsCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.beconnectsCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.beconnectsCount, doc.ltime));
			break;
		case commentsCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.commentsCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.commentsCount, doc.ltime));
			break;
		case connectsCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.connectsCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.connectsCount, doc.ltime));
			break;
		case followsCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.followsCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.followsCount, doc.ltime));
			break;
		case likesCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.likesCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.likesCount, doc.ltime));
			break;
		case sharesCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.sharesCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.sharesCount, doc.ltime));
			break;
		case visitorsCount:
			update = Document.parse(String.format("{$set:{'tuple.indicator.visitorsCount':%s,'tuple.ltime':'%s'}}",
					doc.indicator.visitorsCount, doc.ltime));
			break;
		}

		cube.updateDocOne(COL_SITE_STORE, filter, update);
	}

	@Override
	public void moveDocument(String docid, String path, Map<String, String> parallels) {
		SiteDocument doc = (SiteDocument) document(docid);
		if (doc == null)
			return;
		if (StringUtil.isEmpty(path) && (parallels == null || parallels.isEmpty())) {
			throw new EcmException("未指定移动的目标。文档：" + docid);
		}
		Bson filter = Document.parse(String.format("{'_id':ObjectId('%s')}", docid));
		StringBuffer sb = new StringBuffer();
		sb.append("{$set:{");
		if (!StringUtil.isEmpty(path)) {
			PathParser p = PathParser.parse(path);
			if (StringUtil.isEmpty(p.getTertiary())) {
				throw new RuntimeException("未指定要移向路径的三级分类." + path);
			}
			doc.path = p;
			sb.append(String.format("'tuple.path':%s,", new Gson().toJson(p)));
		}

		doc.utime = System.currentTimeMillis();
		doc.ltime = doc.utime;
		doc.weight++;
		sb.append(String.format("'tuple.utime':'%s',", doc.utime));
		sb.append(String.format("'tuple.ltime':'%s',", doc.ltime));
		sb.append(String.format("'tuple.weight':'%s',", doc.weight));
		if (parallels != null && !parallels.isEmpty()) {
			doc.parallels().putAll(parallels);
			sb.append(String.format("'tuple.parallels':%s,", new Gson().toJson(parallels)));
		}
		sb.deleteCharAt(sb.length() - 1);
		sb.append("}}");
		String json = sb.toString();
		Bson update = Document.parse(json);
		cube.updateDocOne(COL_SITE_STORE, filter, update);
	}

	@Override
	public void moveDocument(String docid, String path) {
		moveDocument(docid, path, null);
	}

	@Override
	public String likeit(String docid, Like like) {
		ISiteDocument doc = document(docid);
		if (doc == null) {
			throw new EcmException("文档不存在：" + docid);
		}
		like.docid = docid;
		like.ctime = System.currentTimeMillis();
		String id = cube.saveDoc(COL_SITE_LIKE, new TupleDocument<Like>(like));
		like.id = id;
		doc.indicator().likesCount = likesCount(docid);
		updateIndicator(doc, IndicatorType.likesCount);
		updateLtime(docid);
		return id;
	}

	@Override
	public long likesCount(String docid) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_LIKE);
		q.setParameter("docid", docid);
		return q.count();
	}
	@Override
	public long giveLikesCount(String user) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.user':'?(user)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_LIKE);
		q.setParameter("user", user);
		return q.count();
		
	}
	@Override//指定用户获得的赞
	public long getLikesCount(String user) {
		//先求出他的所有主题id，再以此主题id在赞表中求得总数

		String cjql = "select {'_id':1} from  tuple ?(colname) java.util.HashMap where {'tuple.creator':'?(creator)'}";
		IQuery<HashMap> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("creator", user);
		List<IDocument<HashMap>> list=q.getResultList();
		StringBuffer sb=new StringBuffer();
		sb.append("['");
		for(IDocument<HashMap> doc:list){
			String id=doc.docid();
			sb.append(String.format("%s','", id));
		}
		sb.append("']");
		
		String cjql2 = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':{$in:?(docids)}}";
		IQuery<Long> q2 = cube.createQuery(cjql2);
		q2.setParameter("colname", COL_SITE_LIKE);
		q2.setParameter("docids", sb.toString());
		return q2.count();
		
	}
	@Override
	public long likesCount(String docid,String user) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)','tuple.user':'?(user)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_LIKE);
		q.setParameter("docid", docid);
		q.setParameter("user", user);
		return q.count();
	}
	@Override
	public void unLike(String docid, String likeid) {
		cube.deleteDocOne(COL_SITE_LIKE, String.format("{'_id':ObjectId('%s'),'tuple.docid':'%s'}", likeid, docid));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().likesCount = likesCount(docid);
		updateIndicator(doc, IndicatorType.likesCount);
		updateLtime(docid);
	}
	@Override
	public void unLikeit(String docid, String user) {
		cube.deleteDocOne(COL_SITE_LIKE, String.format("{'tuple.docid':'%s','tuple.user':'%s'}", docid,user));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().likesCount = likesCount(docid);
		updateIndicator(doc, IndicatorType.likesCount);
		updateLtime(docid);
	}
	@Override
	public List<Like> likes(String docid, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(docid)'}",
				limit, skip);
		IQuery<Like> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_LIKE);
		q.setParameter("clazz", Like.class.getName());
		q.setParameter("docid", docid);
		List<IDocument<Like>> docs = q.getResultList();
		List<Like> list = new ArrayList<>();
		for (IDocument<Like> doc : docs) {
			Like like = doc.tuple();
			like.id = doc.docid();
			list.add(like);
		}
		return list;
	}
	@Override
	public List<Like> likesGroupByUser(String docid, int limit, int skip) {
		List<Bson> pipeline=new ArrayList<>();
		pipeline.add(Document.parse(String.format("{$match:{'tuple.docid':'%s'}}", docid)));
		pipeline.add(Document.parse(String.format("{$sort:{'tuple.ctime':-1}}")));
		pipeline.add(Document.parse(String.format("{$limit:%s}", limit)));
		pipeline.add(Document.parse(String.format("{$skip:%s}", skip)));
		//项名有可能不同，因此去掉
		pipeline.add(Document.parse(String.format("{$group:{'_id':{'user':'$tuple.user'},'id':{$first:'$_id'},'ctime':{$first:'$tuple.ctime'},'docid':{$first:'$tuple.docid'},'count':{$sum:1}}}")));
		AggregateIterable<Document> it=cube.aggregate(COL_SITE_LIKE, pipeline);
		
		List<Like> list=new ArrayList<>();
		for(Document doc:it){
			Like v=new Like();
			v.user=((Document)doc.get("_id")).getString("user");
			v.docid=doc.getString("docid");
			v.ctime=doc.getLong("ctime");
			v.id=doc.getObjectId("id").toHexString();
			v.count=doc.getInteger("count");
			list.add(v);
		}
		return list;
	}
	@Override
	public String visitorit(String docid, Visitor visitor) {
		ISiteDocument doc = document(docid);
		if (doc == null) {
			throw new EcmException("文档不存在：" + docid);
		}
		visitor.docid = docid;
		visitor.ctime = System.currentTimeMillis();
		String id = cube.saveDoc(COL_SITE_VISITOR, new TupleDocument<Visitor>(visitor));
		visitor.id = id;
		doc.indicator().visitorsCount = visitorsCount(docid);
		updateIndicator(doc, IndicatorType.visitorsCount);
		updateLtime(docid);
		return id;
	}

	@Override
	public long visitorsCount(String docid) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_VISITOR);
		q.setParameter("docid", docid);
		return q.count();
	}
	@Override
	public long giveVisitorsCount(String user) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.user':'?(user)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_VISITOR);
		q.setParameter("user", user);
		return q.count();
	}
	@Override//指定用户获得的浏览
	public long getVisitsCount(String user) {
		//先求出他的所有主题id，再以此主题id在赞表中求得总数

		String cjql = "select {'_id':1} from  tuple ?(colname) java.util.HashMap where {'tuple.creator':'?(creator)'}";
		IQuery<HashMap> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("creator", user);
		List<IDocument<HashMap>> list=q.getResultList();
		StringBuffer sb=new StringBuffer();
		sb.append("['");
		for(IDocument<HashMap> doc:list){
			String id=doc.docid();
			sb.append(String.format("%s','", id));
		}
		sb.append("']");
		
		String cjql2 = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':{$in:?(docids)}}";
		IQuery<Long> q2 = cube.createQuery(cjql2);
		q2.setParameter("colname", COL_SITE_VISITOR);
		q2.setParameter("docids", sb.toString());
		return q2.count();
		
	}
	@Override//指定用户获得的浏览
	public List<String> getVisitsUsers(String user,int limit,int skip) {
		//先求出他的所有主题id，再以此主题id在赞表中求得总数

		String cjql = "select {'_id':1} from  tuple ?(colname) java.util.HashMap where {'tuple.creator':'?(creator)'}";
		IQuery<HashMap> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_STORE);
		q.setParameter("creator", user);
		List<IDocument<HashMap>> list=q.getResultList();
		StringBuffer sb=new StringBuffer();
		sb.append("['");
		for(IDocument<HashMap> doc:list){
			String id=doc.docid();
			sb.append(String.format("%s','", id));
		}
		sb.append("']");
		
		String cjql2 = String.format("select {'tuple.user':1}.distinct().limit(%s).skip(%s) from  tuple ?(colname) ?(clazz) where {'tuple.docid':{$in:?(docids)}}",limit,skip);
		IQuery<String> q2 = cube.createQuery(cjql2);
		q2.setParameter("colname", COL_SITE_VISITOR);
		q2.setParameter("clazz", String.class.getName());
		q2.setParameter("docids", sb.toString());
		List<IDocument<String>> visitors=q2.getResultList();
		List<String> ret=new ArrayList<>();
		for(IDocument<String> doc:visitors){
			ret.add(doc.tuple());
		}
		return ret;
		
	}
	@Override
	public Visitor userLastVisit(String user) {
		String cjql = "select {'tuple':'*'}.sort({'tuple.ctime':-1}).limit(1) from  tuple ?(colname) ?(clazz) where {'tuple.user':'?(user)'}";
		IQuery<Visitor> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_VISITOR);
		q.setParameter("clazz", Visitor.class.getName());
		q.setParameter("user", user);
		IDocument<Visitor> visitor=q.getSingleResult();
		if(visitor==null){
			return null;
		}
		visitor.tuple().id=visitor.docid();
		return visitor.tuple();
	}
	@Override
	public void unVisitor(String docid, String visitorid) {
		cube.deleteDocOne(COL_SITE_VISITOR, String.format("{'_id':ObjectId('%s'),'docid':'%s'}", visitorid, docid));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().visitorsCount = visitorsCount(docid);
		updateIndicator(doc, IndicatorType.visitorsCount);
		updateLtime(docid);
	}

	@Override
	public List<Visitor> visitors(String docid, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(docid)'}",
				limit, skip);
		IQuery<Visitor> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_VISITOR);
		q.setParameter("clazz", Visitor.class.getName());
		List<IDocument<Visitor>> docs = q.getResultList();
		List<Visitor> list = new ArrayList<>();
		for (IDocument<Visitor> doc : docs) {
			Visitor v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}
	@Override
	public List<Visitor> visitorsGroupByUser(String docid, int limit, int skip) {
		List<Bson> pipeline=new ArrayList<>();
		pipeline.add(Document.parse(String.format("{$match:{'tuple.docid':'%s'}}", docid)));
		pipeline.add(Document.parse(String.format("{$sort:{'tuple.ctime':-1}}")));
		pipeline.add(Document.parse(String.format("{$limit:%s}", limit)));
		pipeline.add(Document.parse(String.format("{$skip:%s}", skip)));
		//项名有可能不同，因此去掉
		pipeline.add(Document.parse(String.format("{$group:{'_id':{'user':'$tuple.user'},'id':{$first:'$_id'},'ctime':{$first:'$tuple.ctime'},'docid':{$first:'$tuple.docid'},'count':{$sum:1}}}")));
		AggregateIterable<Document> it=cube.aggregate(COL_SITE_VISITOR, pipeline);
		
		List<Visitor> list=new ArrayList<>();
		for(Document doc:it){
			Visitor v=new Visitor();
			v.user=((Document)doc.get("_id")).getString("user");
			v.docid=doc.getString("docid");
			v.ctime=doc.getLong("ctime");
			v.id=doc.getObjectId("id").toHexString();
			v.count=doc.getInteger("count");
			list.add(v);
		}
		return list;
	}
	@Override
	public String followit(String docid, Follow follow) {
		ISiteDocument doc = document(docid);
		if (doc == null) {
			throw new EcmException("文档不存在：" + docid);
		}
		follow.docid = docid;
		follow.ctime = System.currentTimeMillis();
		String id = cube.saveDoc(COL_SITE_FOLLOW, new TupleDocument<Follow>(follow));
		follow.id = id;
		doc.indicator().followsCount = followCount(docid);
		updateIndicator(doc, IndicatorType.followsCount);
		updateLtime(docid);
		return id;
	}
	
	@Override
	public long followCount(String docid) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_FOLLOW);
		q.setParameter("docid", docid);
		return q.count();
	}
	@Override
	public long followsCount(String docid,String user) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)','tuple.user':'?(user)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_FOLLOW);
		q.setParameter("docid", docid);
		q.setParameter("user", user);
		return q.count();
	}
	@Override
	public List<Follow> followsGroupByUser(String docid, int limit, int skip) {
		List<Bson> pipeline=new ArrayList<>();
		pipeline.add(Document.parse(String.format("{$match:{'tuple.docid':'%s'}}", docid)));
		pipeline.add(Document.parse(String.format("{$sort:{'tuple.ctime':-1}}")));
		pipeline.add(Document.parse(String.format("{$limit:%s}", limit)));
		pipeline.add(Document.parse(String.format("{$skip:%s}", skip)));
		//项名有可能不同，因此去掉
		pipeline.add(Document.parse(String.format("{$group:{'_id':{'user':'$tuple.user'},'id':{$first:'$_id'},'ctime':{$first:'$tuple.ctime'},'docid':{$first:'$tuple.docid'},'count':{$sum:1}}}")));
		AggregateIterable<Document> it=cube.aggregate(COL_SITE_FOLLOW, pipeline);
		
		List<Follow> list=new ArrayList<>();
		for(Document doc:it){
			Follow v=new Follow();
			v.user=((Document)doc.get("_id")).getString("user");
			v.docid=doc.getString("docid");
			v.ctime=doc.getLong("ctime");
			v.id=doc.getObjectId("id").toHexString();
			v.count=doc.getInteger("count");
			list.add(v);
		}
		return list;
	}
	@Override
	public void unFollow(String docid, String followid) {
		// TODO Auto-generated method stub
		cube.deleteDocOne(COL_SITE_FOLLOW, String.format("{'_id':ObjectId('%s'),'docid':'%s'}", followid, docid));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().followsCount = followCount(docid);
		updateIndicator(doc, IndicatorType.followsCount);
		updateLtime(docid);
	}
	@Override
	public void unFollowit(String docid, String user) {
		// TODO Auto-generated method stub
		cube.deleteDocOne(COL_SITE_FOLLOW, String.format("{'tuple.docid':'%s','tuple.user':'%s'}", docid,user));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().followsCount = followCount(docid);
		updateIndicator(doc, IndicatorType.followsCount);
		updateLtime(docid);
	}
	@Override
	public List<Follow> follows(String docid, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(docid)'}",
				limit, skip);
		IQuery<Follow> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_FOLLOW);
		q.setParameter("clazz", Follow.class.getName());
		List<IDocument<Follow>> docs = q.getResultList();
		List<Follow> list = new ArrayList<>();
		for (IDocument<Follow> doc : docs) {
			Follow v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}

	@Override
	public String shareit(String docid, Share share) {
		ISiteDocument doc = document(docid);
		if (doc == null) {
			throw new EcmException("文档不存在：" + docid);
		}
		share.docid = docid;
		share.ctime = System.currentTimeMillis();
		String id = cube.saveDoc(COL_SITE_SHARE, new TupleDocument<Share>(share));
		share.id = id;
		doc.indicator().sharesCount = shareCount(docid);
		updateIndicator(doc, IndicatorType.sharesCount);
		updateLtime(docid);
		return id;
	}

	@Override
	public long shareCount(String docid) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_SHARE);
		return q.count();
	}

	@Override
	public void unShare(String docid, String shareid) {
		cube.deleteDocOne(COL_SITE_SHARE, String.format("{'_id':ObjectId('%s'),'docid':'%s'}", shareid, docid));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().sharesCount = shareCount(docid);
		updateIndicator(doc, IndicatorType.sharesCount);
		updateLtime(docid);
	}

	@Override
	public List<Share> shares(String docid, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(docid)'}",
				limit, skip);
		IQuery<Share> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_SHARE);
		q.setParameter("clazz", Share.class.getName());
		List<IDocument<Share>> docs = q.getResultList();
		List<Share> list = new ArrayList<>();
		for (IDocument<Share> doc : docs) {
			Share v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}

	@Override
	public String commentit(String docid, String threadid, Comment comment) {
		ISiteDocument doc = document(docid);
		if (doc == null) {
			throw new EcmException("文档不存在：" + docid);
		}
		comment.docid = docid;
		comment.ctime = System.currentTimeMillis();
		comment.ltime=comment.ctime;
		if(!"-1".equals(threadid)){
			updateThreadTime( threadid,comment.ltime);
		}
		comment.parent = threadid;//为了简化，贴子仅支持两级，一级为根即：thread，展开后就是叶子级，是跟贴，跟贴按时间正序排即可
		String id = cube.saveDoc(COL_SITE_COMMENT, new TupleDocument<Comment>(comment));
		comment.id = id;
		doc.indicator().commentsCount = commentCount(docid);
		updateIndicator(doc, IndicatorType.commentsCount);
		updateLtime(docid);
		return id;
	}
	

	private void updateThreadTime(String threadid,long ltime) {
			Bson filter = Document.parse(String.format("{'_id':ObjectId('%s')}", threadid));
			Bson update = Document.parse(String.format("{$set:{'tuple.ltime':'%s'}}", ltime));
			cube.updateDocOne(COL_SITE_COMMENT, filter, update);
	}

	@Override
	public long commentCount(String docid) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_COMMENT);
		q.setParameter("docid", docid);
		return q.count();
	}
	@Override
	public long giveCommentCount(String user) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.user':'?(user)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_COMMENT);
		q.setParameter("user", user);
		return q.count();
	}
	//为了简化，贴子仅支持两级，一级为根即：thread，展开后就是叶子级，是跟贴，跟贴按时间正序排即可
	@Override
	public void unComment(String docid, String commentid) {
		cube.deleteDocOne(COL_SITE_COMMENT, String.format("{'tuple.docid':'%s','tuple.parent':'%s'}", commentid, docid));
		cube.deleteDocOne(COL_SITE_COMMENT, String.format("{'_id':ObjectId('%s'),'tuple.docid':'%s'}", commentid, docid));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().commentsCount = commentCount(docid);
		updateIndicator(doc, IndicatorType.commentsCount);
		updateLtime(docid);
	}
	@Override
	public List<Comment> commentsGroupByUser(String docid, int limit, int skip) {
		List<Bson> pipeline=new ArrayList<>();
		pipeline.add(Document.parse(String.format("{$match:{'tuple.docid':'%s'}}", docid)));
		pipeline.add(Document.parse(String.format("{$sort:{'tuple.ctime':-1}}")));
		pipeline.add(Document.parse(String.format("{$limit:%s}", limit)));
		pipeline.add(Document.parse(String.format("{$skip:%s}", skip)));
		//项名有可能不同，因此去掉
		pipeline.add(Document.parse(String.format("{$group:{'_id':{'user':'$tuple.user'},'id':{$first:'$_id'},'ctime':{$first:'$tuple.ctime'},'docid':{$first:'$tuple.docid'},'count':{$sum:1}}}")));
		AggregateIterable<Document> it=cube.aggregate(COL_SITE_COMMENT, pipeline);
		
		List<Comment> list=new ArrayList<>();
		for(Document doc:it){
			Comment v=new Comment();
			v.user=((Document)doc.get("_id")).getString("user");
			v.docid=doc.getString("docid");
			v.ctime=doc.getLong("ctime");
			v.id=doc.getObjectId("id").toHexString();
			v.count=doc.getInteger("count");
			list.add(v);
		}
		return list;
	}
	@Override
	public List<Comment> comments(String docid, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ltime':-1,'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(%s)'}",
				limit, skip,docid);
		IQuery<Comment> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_COMMENT);
		q.setParameter("clazz", Comment.class.getName());
		List<IDocument<Comment>> docs = q.getResultList();
		List<Comment> list = new ArrayList<>();
		for (IDocument<Comment> doc : docs) {
			Comment v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}

	@Override
	public List<Comment> comments(String docid, String pid, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ltime':-1,'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'%s','tuple.parent':'%s'}",
				limit, skip,docid, pid);
		IQuery<Comment> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_COMMENT);
		q.setParameter("clazz", Comment.class.getName());
		List<IDocument<Comment>> docs = q.getResultList();
		List<Comment> list = new ArrayList<>();
		for (IDocument<Comment> doc : docs) {
			Comment v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}
	@Override
	public List<Comment> commentsForum(String docid, String thread, int limit, int skip) {
		String cjql = String.format(
				"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'%s','tuple.parent':'%s'}",
				limit, skip,docid, thread);
		IQuery<Comment> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_COMMENT);
		q.setParameter("clazz", Comment.class.getName());
		List<IDocument<Comment>> docs = q.getResultList();
		List<Comment> list = new ArrayList<>();
		for (IDocument<Comment> doc : docs) {
			Comment v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}
	@Override
	public String connectit(String docid, ConnectType type, Connect connect) {
		ISiteDocument doc = document(docid);
		if (doc == null) {
			throw new EcmException("文档不存在：" + docid);
		}
		connect.docid = docid;
		connect.ctime = System.currentTimeMillis();
		connect.type = type;
		String id = cube.saveDoc(COL_SITE_CONNECT, new TupleDocument<Connect>(connect));
		connect.id = id;
		doc.indicator().connectsCount = connectCount(docid);
		updateIndicator(doc, IndicatorType.connectsCount);
		updateLtime(docid);
		return id;
	}

	private long connectCount(String docid) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.docid':'?(docid)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_CONNECT);
		q.setParameter("docid", docid);
		return q.count();
	}
	@Override
	public long giveConnectCount(String user) {
		String cjql = "select {'tuple':'*'}.count() from  tuple ?(colname) java.lang.Long where {'tuple.user':'?(user)'}";
		IQuery<Long> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_CONNECT);
		q.setParameter("user", user);
		return q.count();
	}
	
	@Override
	public void unConnect(String docid, String connectid) {
		cube.deleteDocOne(COL_SITE_CONNECT, String.format("{'_id':ObjectId('%s'),'tuple.docid':'%s'}", connectid, docid));
		ISiteDocument doc = document(docid);
		if (doc == null)
			return;
		doc.indicator().connectsCount = connectCount(docid);
		updateIndicator(doc, IndicatorType.connectsCount);
		updateLtime(docid);
	}
	@Override
	public Connect connect(String docid,String connectid){
		IDocument<Connect> doc=cube.document(COL_SITE_CONNECT, connectid, Connect.class);
		if(doc==null)return null;
		doc.tuple().id=connectid;
		return doc.tuple();
	}
	@Override
	public List<Connect> connectsGroupByUser(String docid, int limit, int skip) {
		List<Bson> pipeline=new ArrayList<>();
		pipeline.add(Document.parse(String.format("{$match:{'tuple.docid':'%s'}}", docid)));
		pipeline.add(Document.parse(String.format("{$sort:{'tuple.ctime':-1}}")));
		pipeline.add(Document.parse(String.format("{$limit:%s}", limit)));
		pipeline.add(Document.parse(String.format("{$skip:%s}", skip)));
		//项名有可能不同，因此去掉
		pipeline.add(Document.parse(String.format("{$group:{'_id':{'user':'$tuple.user'},'id':{$first:'$_id'},'ctime':{$first:'$tuple.ctime'},'docid':{$first:'$tuple.docid'},'count':{$sum:1}}}")));
		AggregateIterable<Document> it=cube.aggregate(COL_SITE_CONNECT, pipeline);
		
		List<Connect> list=new ArrayList<>();
		for(Document doc:it){
			Connect v=new Connect();
			v.user=((Document)doc.get("_id")).getString("user");
			v.docid=doc.getString("docid");
			v.ctime=doc.getLong("ctime");
			v.id=doc.getObjectId("id").toHexString();
			v.count=doc.getInteger("count");
			list.add(v);
		}
		return list;
	}
	@Override
	public List<Connect> connects(String docid, ConnectType type, int limit, int skip) {
		String cjql = "";
		if (type == null) {
			cjql = String.format(
					"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(docid)'}",
					limit, skip);
		} else {
			cjql = String.format(
					"select {'tuple':'*'}.limit(%s).skip(%s).sort({'tuple.ctime':-1}) from  tuple ?(colname) ?(clazz) where {'tuple.docid':'?(docid)','tuple.type':'%s'}",
					limit, skip, type);
		}
		IQuery<Connect> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_CONNECT);
		q.setParameter("clazz", Connect.class.getName());
		q.setParameter("docid", docid);
		List<IDocument<Connect>> docs = q.getResultList();
		List<Connect> list = new ArrayList<>();
		for (IDocument<Connect> doc : docs) {
			Connect v = doc.tuple();
			v.id = doc.docid();
			list.add(v);
		}
		return list;
	}

	@Override
	public List<Connect> connects(String docid, int limit, int skip) {
		return connects(docid, null, limit, skip);
	}
}
