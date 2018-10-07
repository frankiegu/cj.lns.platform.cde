package cj.studio.cde;

/*
 * 每个网盘有：
 * 	事象表（主干表） 	
 * 	分支表（上下分支）
 * 	条目表（文本、文件路径、事象指针）
 * 结构：
 * 	事象表：其名为固定的属性分支中的标题，如果无标题则在正文分支中取摘要
 * 		［{"_id":'xxx',
 * 		"cdate":2323299,
 * 		"creator":"zhaoxb",
 * 		}］
 *  分支表：
 * 		[
 * 			{
 * 				"name":"属性",
 * 				"cdate":2388383,
 * 				"parent":"/",
 * 				"creator":"zhaoxb",
 * 				"weight":8838,//排序的权重,
 * 				"type":"down",//down是下行分支，up是上行分支，上行分支在向上挂载时自动产生，即对方的下行分支路径名 
 * 				"belong":"xxx"//所属事象标识
 * 			},
 * 			{
 * 				"name":"正文",
 * 				"cdate":2388383,
 * 				"parent":"名为属性的父的物理标识_id",
 *				"creator":"zhaoxb",
 *				"type":"down",
 *				"weight":8838,
 * 				"belong":"xxx"
 * 			},{
 * 				"name":"电影",
 * 				"cdate":2388383,
 * 				"parent":"/",
 * 				"type":"down",
 * 				"creator":"weis",
 * 				"weight":8838,//描定功能是权重最高
 * 				"belong":"xxx"
 * 			},{
 * 				"name":"react社区",
 * 				"cdate":2388383,
 * 				"parent":"/",
 * 				"type":"up",
 * 				"creator":"weis",
 * 				"weight":8838,//描定功能是权重最高
 * 				"belong":"xxx"
 * 			}
 * 		]
 * 	条目表：
 * 		[
 * 			{
 * 				"type":"file",//file,phenomenon,content，当是上行分支的条目时，条目的type是content,value值是挂载目标事象的下行分支路径
 * 				"name":"机器猫.mov",
 * 				"desc":"摘要或提示",
 * 				"ctime":930393333,
 * 				"weight":8838,//描定功能是权重最高
 * 				"creator":"weis",
 * 				"belongBranch":"所属的分支物理标识_id",
 * 				"belongPhen":"所属的事象的物理标识_id",
 * 				"value":"disk->cube://movies/机器猫.mov"//内容或指针
 * 			}
 * 		]
 */
import java.util.List;

import com.mongodb.MongoClient;

import cj.lns.chip.sos.cube.framework.FileInfo;

/**
 * 事象
 * 
 * <pre>
 * 事象根据主干的分支可以上溯也可以下溯
 * 关键词：主干、分支、条目
 * 
 * － 事象含有一个主干
 * － 主干分为上部和下部，其中上部是用于向其它事象挂载的分支，下部是用于让别的事象挂载的分支
 * － 约定的分支，如事象属性分支：/属性/正文
 * － 分支采用路径的写法
 * － 分支下放置（挂载）事象的指针，指针结构如下：
 * 	指向的事象所在网盘
 * 	指向的事象所在网盘的存储方案
 * 	指向的事象标识	
 * 	表示为：disk->cube->事象标识
 * － 分支类型：
 * 	上行和下行，上行分支不可编辑，在向上挂载时则依据被挂载的事象的分支自动生成分支和条目，其条目是所挂载事象的分支路径
 * － 分支内条目的数据结构：
 * 	1.事象指针
 * 	2.文件指针
 * 	3.内容（即数据：或文本或二进制）
 * － 排名
 * 	1.分支的排名
 * 	2.分支内条目的排名
 * 	排名规则是：时间最新、权重（是计算的一个比值，依据如：交不交费，交了多少）
 * 
 * 因此事象的全路径写法是：
 * 由a下溯到b：	disk->cube->事象标识a://下溯分支的相对路径/disk->cube->事象标识b
 * 由a上溯到c：	disk->cube->事象标识a://上溯分支的相对路径/disk->cube->事象标识c://下溯分支的相对路径/
 * 
 * </pre>
 * 
 * @author carocean
 *
 */
// 在添加条目时建立lucene索引，只索引下行分支的条目
public interface IPhenomenonFactory {
	List<Trunk> getTrunks(int limit, int skip);

	Trunk getTrunk(String trunkid);

	String addTrunk(Trunk trunk);

	void removeTrunk(String trunkid);

	String addBranch(Branch b);

	String getBranchFullPath(String branchid);

	Branch getBranchByFullPath(String trunkid, String path);

	void removeBranch(String branchid);

	List<Branch> getBranches(String trunkid, BranchType type, String parent, int limit, int skip);

	List<Branch> getBranches(String trunkid, String parent, int limit, int skip);

	Branch getBranch(String branchid);

	Branch getBranch(String trunkid, String parent, String name);

	void updateBranchWeight(String branchid, long weight);

	void renameBranch(String branchid, String newname);
	void renameEntry(String entryid, String newname);
	String addEntry(Entry entry);

	List<Entry> getEntries(String trunkid, String branchid, int limit, int skip);
	/**
	 * 按多个分支查找共同项，即：项均挂载到指定的所有分支。这类似于多维查询<br>
	 * 一个维的全部就等同于去掉这个分支查询
	 * @param branchids
	 * @param wherejson 项实体的查询条件:{'tuple.name':'xxx','tuple.value':'xxx'}
	 * @param limit
	 * @param skip
	 * @return
	 */
	List<ECell> getEntries(String[] branchids,int sort,String wherejson, int limit, int skip);
	List<ECell> getECells(String trunkid,String[] path,int sort,String wherejson, int limit, int skip);

	void updateEntryWeight(String entryid, long weight);

	Entry getEntry(String entryid);
	/**
	 * 按路径查找项，如果有多个则返回第一个<br>
	 * 
	 * @param entryName
	 * @param trunkid
	 * @param path 分支路径
	 * @return
	 */
	Entry getEntry(String trunkid,String path,String entryName);
	void close();

	boolean isMountedPhenomenon(IPhenomenonFactory srcFactory,String srctrunkid, String destbranchid);
	/**
	 * 挂载到对方分支上
	 * 
	 * @param srctrunkid
	 *            要挂载的事象的主干
	 * @param destbranchid
	 *            目标事象的分支标识，因为是全局的
	 * @return
	 */
	Entry mountPhenomenon(IPhenomenonFactory srcFactory,String srctrunkid, String destbranchid, String entryName,
			long weight);

	/**
	 * 解除挂载<br>
	 */
	void unmountEntry(String entryid);

	String getCubeName();

	String getDiskName();

	Entry getPhenomenonNameEntry(String trunkid);

	Trunk createPhenomenon(String guid,String creator, String body, String desc);

	Trunk createPhenomenon(String guid,String creator, String title, String body, String desc);
	List<Phenomenon> getPhenomenons(int limit, int skip);

	FileInfo mountFile(String creator, String branchid, String fileName);

	void mountText(String creator, String branchid, String title, String text);

	void mountWebsite(String creator, String branchid, String href, String title, String desc);

	MongoClient getClient();

	List<String> getPrincipals(String trunkid);

	List<Entry> getPhenomenonsByECells(List<ECell> ecells);

	boolean containsTrunk(String guid);

	Trunk getTrunkByGuid(String guid);

	Entry getPhenomenonNameEntryByGuid(String guid);
}
