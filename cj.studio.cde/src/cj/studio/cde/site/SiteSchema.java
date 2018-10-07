package cj.studio.cde.site;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bson.Document;

import com.mongodb.MongoClient;
import com.mongodb.client.model.UpdateOptions;

import cj.lns.chip.sos.cube.framework.ICube;
import cj.lns.chip.sos.cube.framework.IDocument;
import cj.lns.chip.sos.cube.framework.IQuery;
import cj.lns.chip.sos.cube.framework.TupleDocument;
import cj.lns.chip.sos.disk.INetDisk;
import cj.lns.chip.sos.disk.NetDisk;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.gson2.com.google.gson.reflect.TypeToken;
import cj.ultimate.util.FileHelper;
import cj.ultimate.util.StringUtil;

public class SiteSchema implements ISiteSchema {
	private Map<String, SitePrimaries> cache;// sitename
	private Map<String, CatSite> cachesites;// sitename
	private ICube cube;

	private SiteSchema() {
		cache = new HashMap<>();
		cachesites = new HashMap<>();
	}

	@Override
	public String create(CatSite site) {
		if (StringUtil.isEmpty(site.getName())) {
			throw new RuntimeException("站名未指定");
		}
		if (StringUtil.isEmpty(site.getDisplay())) {
			throw new RuntimeException("站的显式名未指定");
		}
		if (exists(site.getName())) {
			throw new RuntimeException("冲突：已存在站名：" + site.getName());
		}
		String id = cube.saveDoc(COL_SITE_SCHEMA, new TupleDocument<CatSite>(site));
		cachesites.put(site.getName(), site);
		return id;
	}

	@Override
	public void delete(String name) {
		deleteSitePrimaries(name);
		cube.deleteDocOne(COL_SITE_SCHEMA, String.format("{'tuple.name':'%s'}", name));
		cachesites.remove(name);
	}

	@Override
	public boolean exists(String name) {
		if (cachesites.containsKey(name))
			return true;
		String cjql = String.format(
				"select {'tuple':'*'}.count() from tuple %s java.lang.Long where {'tuple.name':'%s'}", COL_SITE_SCHEMA,
				name);
		IQuery<Long> q = cube.createQuery(cjql);
		return q.count() > 0;
	}

	@Override
	public CatSite getSite(String name) {
		if (cachesites.containsKey(name)) {
			return cachesites.get(name);
		}
		String cjql = String.format("select {'tuple':'*'} from tuple %s %s where {'tuple.name':'%s'}", COL_SITE_SCHEMA,
				CatSite.class.getName(), name);
		IQuery<CatSite> q = cube.createQuery(cjql);
		IDocument<CatSite> doc = q.getSingleResult();
		if (doc == null)
			return null;
		cachesites.put(name, doc.tuple());
		return doc.tuple();
	}

	@Override
	public List<CatSite> list() {
		String cjql = "select {'tuple':'*'}.sort({'tuple.sort':-1}) from tuple ?(colname) ?(clazz) where {}";
		IQuery<CatSite> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_SCHEMA);
		q.setParameter("clazz", CatSite.class.getName());
		List<IDocument<CatSite>> list = q.getResultList();
		List<CatSite> sites = new ArrayList<>();
		for (IDocument<CatSite> doc : list) {
			CatSite site = doc.tuple();
			sites.add(site);
		}
		return sites;
	}

	@Override
	public void rename(String name, String newdisplay) {
		Document filter = Document.parse(String.format("{'tuple.name':'%s'}", name));
		Document newdoc = Document.parse(String.format("{$set:{'tuple.display':'%s'}}", newdisplay));
		cube.updateDocOne(COL_SITE_SCHEMA, filter, newdoc);
		if (cachesites.containsKey(name)) {
			CatSite site = cachesites.get(name);
			site.setDisplay(newdisplay);
		}
	}

	@Override
	public void close() {
		this.cube = null;
		this.cache.clear();
		cachesites.clear();
	}

	public static ISiteSchema open(MongoClient client, String netdisk, String cube) {
		SiteSchema ss = new SiteSchema();
		INetDisk disk = NetDisk.trustOpen(client, netdisk);
		ss.cube = disk.cube(cube);
		return ss;
	}

	@Override
	public void refresh() {
		cachesites.clear();
		List<CatSite> sites = list();
		for (CatSite site : sites) {
			refresh(site.getName());
			cachesites.put(site.getName(), site);
		}
	}

	@Override
	public void flush() {
		List<CatSite> list = list();
		for (CatSite site : list) {
			flush(site.getName());
		}
	}

	@Override
	public void flush(String sitename) {
		if (!cache.containsKey(sitename))
			return;
		Map<String, CatPrimary> map = cache.get(sitename).primaries;
		deleteSitePrimaries(sitename);
		Collection<CatPrimary> set = map.values();
		for (CatPrimary p : set) {
			p.setSite(sitename);
			cube.saveDoc(COL_SITE_CAT, new TupleDocument<CatPrimary>(p));
		}
	}

	private void deleteSitePrimaries(String sitename) {
		cube.deleteDocOne(COL_SITE_CAT, String.format("{'tuple.site':'%s'}", sitename));
	}

	@Override
	public void importsFormJson(String sitename, String json) {
		Gson g = new Gson();
		ArrayList<CatPrimary> list = g.fromJson(json, new TypeToken<ArrayList<CatPrimary>>() {
		}.getType());
		for (CatPrimary p : list) {
			if (StringUtil.isEmpty(p.getName()))
				continue;
			p.setSite(sitename);
			removePrimary(sitename, p.getName());
			cube.saveDoc(COL_SITE_CAT, new TupleDocument<>(p));
		}
		refresh(sitename);
	}

	@Override
	public void importsFormFile(String sitename, String file) throws IOException {
		byte[] text = FileHelper.readFully(new File(file));
		String json = new String(text);
		importsFormJson(sitename, json);
	}

	@Override
	public void refresh(String sitename) {
		cache.remove(sitename);
		String cjql = "select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.site':'?(site)'}";
		IQuery<CatPrimary> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_CAT);
		q.setParameter("clazz", CatPrimary.class.getName());
		q.setParameter("site", sitename);
		List<IDocument<CatPrimary>> list = q.getResultList();
		SitePrimaries pr = new SitePrimaries();
		Map<String, CatPrimary> map = pr.primaries;
		for (IDocument<CatPrimary> doc : list) {
			CatPrimary cp = doc.tuple();
			if (map.containsKey(cp.getName())) {
				throw new RuntimeException("冲突！已存在一级分类：" + cp.getName());
			}
			map.put(cp.getName(), cp);
		}
		cache.put(sitename, pr);
	}

	@Override
	public String exportsToJson(String sitename) {
		if (!this.cache.containsKey(sitename))
			return "[]";
		SitePrimaries sp = cache.get(sitename);
		Gson g = new Gson();
		String json = g.toJson(sp.primaries.values());
		return json;
	}

	@Override
	public void exportsToFile(String sitename, String file) throws IOException {
		String json = exportsToJson(sitename);
		File f = new File(file);
		if (!f.exists()) {
			if (!f.getParentFile().exists()) {
				f.getParentFile().mkdirs();
			}
		}
		FileWriter fw = null;
		try {
			fw = new FileWriter(f);
			fw.write(json);
		} catch (IOException e) {
			throw e;
		} finally {
			if (fw != null)
				fw.close();
		}
	}

	@Override
	public Collection<CatPrimary> listPrimaries(String sitename) {
		return cache.get(sitename).primaries.values();
	}

	@Override
	public Set<String> listPrimaryNames(String sitename) {
		if (!cache.containsKey(sitename))
			return new HashSet<>();
		return cache.get(sitename).primaries.keySet();
	}

	@Override
	public boolean containsPrimary(String sitename, String primary) {
		if (!cache.containsKey(sitename))
			return false;
		return cache.get(primary).primaries.containsKey(primary);
	}

	@Override
	public CatPrimary getPrimary(String sitename, String primary) {
		if (!cache.containsKey(sitename))
			return null;
		return cache.get(sitename).primaries.get(primary);
	}

	class SitePrimaries {
		Map<String, CatPrimary> primaries;

		public SitePrimaries() {
			primaries = new HashMap<>();
		}
	}

	@Override
	public void appendPrimary(String sitename, CatPrimary cp) {
		if (!exists(sitename))
			throw new RuntimeException("站点不存在：" + sitename);
		if (!cache.containsKey(sitename)) {
			refresh(sitename);
		}
		if (cache.get(sitename).primaries.containsKey(cp.getName())) {
			throw new RuntimeException("已存在一级分类：" + cp.getName());
		} else {
			cp.setSite(sitename);
			cube.saveDoc(COL_SITE_CAT, new TupleDocument<CatPrimary>(cp));
		}
	}

	@Override
	public void removePrimary(String sitename, String primary) {
		if (!cache.containsKey(sitename)) {
			return;
		}
		deleteSitePrimaries(sitename);
		cache.remove(sitename);
	}

	@Override
	public void flushPrimary(String sitename, String primary) {
		// TODO Auto-generated method stub
		if (!cache.containsKey(sitename))
			return;
		if (!cache.get(sitename).primaries.containsKey(primary)) {
			return;
		}
		CatPrimary cp = cache.get(sitename).primaries.get(primary);
		IQuery<CatPrimary> q = cube.createQuery(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.site':'?(site)','tuple.name':'?(name)'}");
		q.setParameter("colname", COL_SITE_CAT);
		q.setParameter("clazz", CatPrimary.class.getName());
		q.setParameter("site", sitename);
		q.setParameter("name", primary);
		IDocument<CatPrimary> doc = q.getSingleResult();
		if (doc == null)
			return;
		UpdateOptions uo = new UpdateOptions();
		uo.upsert(true);
		cube.updateDoc(COL_SITE_CAT, doc.docid(), new TupleDocument<CatPrimary>(cp), uo);
	}

	@Override
	public String getDisplayPath(String path) {
		PathParser p = PathParser.parse(path);
		PathParser p2 = new PathParser();
		if (StringUtil.isEmpty(p.getSite())) {
			return p2.toString();
		}
		CatSite site = getSite(p.getSite());
		if (site == null) {
			return p2.toString();
		}
		p2.setSite(site.getDisplay());
		if (StringUtil.isEmpty(p.getPrimary())) {
			return p2.toString();
		}
		CatPrimary primary = getPrimary(site.getName(), p.getPrimary());
		String pridisplay = "";
		if (primary == null || primary.getSecondaries().isEmpty()) {
			return p2.toString();
		}
		Set<String> set = primary.getSecondaries().keySet();
		for (String key : set) {
			CatSecondary sec = primary.getSecondaries().get(key);
			pridisplay = String.format("%s|%s", pridisplay, sec.getPdisplay());
		}
		if (pridisplay.startsWith("|")) {
			pridisplay = pridisplay.substring(1, pridisplay.length());
		}
		p2.setPrimary(pridisplay);
		if (StringUtil.isEmpty(p.getSecondary())) {
			return p2.toString();
		}
		CatSecondary sec = primary.getSecondaries().get(p.getSecondary());
		if (sec == null) {
			return p2.toString();
		}
		p2.setSecondary(sec.getDisplay());
		if (StringUtil.isEmpty(p.getTertiary())) {
			return p2.toString();
		}
		CatTertiary ter = sec.getTertiaries().get(p.getTertiary());
		if (ter == null) {
			return p2.toString();
		}
		p2.setTertiary(ter.getDisplay());
		return p2.toString();
	}

	@Override
	public List<CatParallel> getParallels(String path) {
		PathParser p = PathParser.parse(path);
		if (StringUtil.isEmpty(p.getTertiary())) {
			throw new RuntimeException("未指定第三级分类，平行分类一定属于三级分类下.路径：" + path);
		}
		String cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.path.site':'%s','tuple.path.primary':'%s','tuple.path.secondary':'%s','tuple.path.tertiary':'%s'}",
				p.getSite(), p.getPrimary(), p.getSecondary(), p.getTertiary());
		IQuery<CatParallel> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_PARALLEL);
		q.setParameter("clazz", CatParallel.class.getName());
		List<IDocument<CatParallel>> docs = q.getResultList();
		List<CatParallel> list = new ArrayList<>();
		for (IDocument<CatParallel> doc : docs) {
			list.add(doc.tuple());
		}
		return list;
	}
	@Override
	public Map<String,CatParallel> getParallelsMap(String path) {
		PathParser p = PathParser.parse(path);
		if (StringUtil.isEmpty(p.getTertiary())) {
			throw new RuntimeException("未指定第三级分类，平行分类一定属于三级分类下.路径：" + path);
		}
		String cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.path.site':'%s','tuple.path.primary':'%s','tuple.path.secondary':'%s','tuple.path.tertiary':'%s'}",
				p.getSite(), p.getPrimary(), p.getSecondary(), p.getTertiary());
		IQuery<CatParallel> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_PARALLEL);
		q.setParameter("clazz", CatParallel.class.getName());
		List<IDocument<CatParallel>> docs = q.getResultList();
		Map<String,CatParallel> list = new HashMap<>();
		for (IDocument<CatParallel> doc : docs) {
			CatParallel para=doc.tuple();
			list.put(para.getName(),para);
		}
		return list;
	}
	@Override
	public CatParallel getParallels(String path, String name) {
		PathParser p = PathParser.parse(path);
		if (StringUtil.isEmpty(p.getTertiary())) {
			throw new RuntimeException("未指定第三级分类，平行分类一定属于三级分类下.路径：" + path);
		}
		String cjql = String.format(
				"select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {'tuple.name':'%s','tuple.path.site':'%s','tuple.path.primary':'%s','tuple.path.secondary':'%s','tuple.path.tertiary':'%s'}",
				name, p.getSite(), p.getPrimary(), p.getSecondary(), p.getTertiary());
		IQuery<CatParallel> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_PARALLEL);
		q.setParameter("clazz", CatParallel.class.getName());
		IDocument<CatParallel> doc = q.getSingleResult();
		if (doc == null)
			return null;
		return doc.tuple();
	}

	@Override
	public void importsParallelsFromJson(String json) {
		Gson g = new Gson();
		List<CatParallel> list = g.fromJson(json, new TypeToken<List<CatParallel>>() {
		}.getType());
		for (CatParallel para : list) {
			PathParser p = para.getPath();
			if (p == null || StringUtil.isEmpty(p.getTertiary())) {
				System.out.println("未导入该平行分类，因缺少三级路径：" + para.getName());
				continue;
			}
			if (StringUtil.isEmpty(p.getTertiary()))
				continue;

			String filter = String.format(
					"{'tuple.name':'%s','tuple.path.site':'%s','tuple.path.primary':'%s','tuple.path.secondary':'%s','tuple.path.tertiary':'%s'}",
					para.getName(), p.getSite(), p.getPrimary(), p.getSecondary(), p.getTertiary());
			cube.deleteDocOne(COL_SITE_PARALLEL, filter);
			cube.saveDoc(COL_SITE_PARALLEL, new TupleDocument<CatParallel>(para));
		}
	}

	@Override
	public String exportsParallelsToJson() {
		String cjql = "select {'tuple':'*'} from tuple ?(colname) ?(clazz) where {}";
		IQuery<CatParallel> q = cube.createQuery(cjql);
		q.setParameter("colname", COL_SITE_PARALLEL);
		q.setParameter("clazz", CatParallel.class.getName());
		List<IDocument<CatParallel>> docs = q.getResultList();
		List<CatParallel> list = new ArrayList<>();
		for (IDocument<CatParallel> doc : docs) {
			list.add(doc.tuple());
		}
		return new Gson().toJson(list);
	}

	@Override
	public void importsParallelsFromFile(String file) throws IOException {
		byte[] text = FileHelper.readFully(new File(file));
		String json = new String(text);
		importsParallelsFromJson(json);
	}

	@Override
	public void exportsParallelsToFile(String file) throws IOException {
		String json = exportsParallelsToJson();
		File f = new File(file);
		if (!f.exists()) {
			if (!f.getParentFile().exists()) {
				f.getParentFile().mkdirs();
			}
		}
		FileWriter fw = null;
		try {
			fw = new FileWriter(f);
			fw.write(json);
		} catch (IOException e) {
			throw e;
		} finally {
			if (fw != null)
				fw.close();
		}
	}

}
