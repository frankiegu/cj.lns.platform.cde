package cj.studio.cde.site;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 站点框架
 * 
 * <pre>
 * 一级、二级、三级分类使用内嵌形式，这主要是因为像淘宝京东的三级分类都是一下子全部展开的。当然，也要实现一级一级展开的形式，用作在发表主题时选择
 * 
 * schema是装入内存的
 * </pre>
 * 
 * @author carocean
 *
 */
public interface ISiteSchema {
	static final String COL_SITE_SCHEMA = "catsite.schema";
	static final String COL_SITE_CAT = "catsite.categories";
	static final String COL_SITE_PARALLEL = "catsite.parallels";
	void refresh();// 重新装载入内存

	void flush();

	void importsFormJson(String sitename, String json);

	void exportsToFile(String sitename, String file) throws IOException;

	String create(CatSite site);

	void delete(String name);

	boolean exists(String name);

	void rename(String display, String newdisplay);

	void close();

	List<CatSite> list();

	Collection<CatPrimary> listPrimaries(String sitename);

	String exportsToJson(String sitename);

	void importsFormFile(String sitename, String File) throws IOException;

	Set<String> listPrimaryNames(String sitename);

	boolean containsPrimary(String sitename, String primary);

	CatPrimary getPrimary(String sitename, String primary);

	void appendPrimary(String sitename, CatPrimary cp);

	void removePrimary(String sitename, String primary);

	void flush(String sitename);

	void refresh(String sitename);

	void flushPrimary(String sitename, String primary);
	String getDisplayPath(String path);
	List<CatParallel> getParallels(String path);
	void importsParallelsFromJson(String json);
	void importsParallelsFromFile(String file) throws IOException;
	String exportsParallelsToJson();
	void exportsParallelsToFile(String file) throws IOException;

	CatSite getSite(String name);

	CatParallel getParallels(String path, String name);

	Map<String, CatParallel> getParallelsMap(String path);
}
