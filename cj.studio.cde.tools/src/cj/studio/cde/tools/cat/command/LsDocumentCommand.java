package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.site.ISiteDocument;
import cj.studio.cde.site.ISiteStore;
import cj.studio.cde.site.Indicator;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.cde.tools.ConsoleEditor;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.ultimate.gson2.com.google.gson.Gson;

@CjService(name = "lsDocumentCommand")
public class LsDocumentCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line=cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定path"));
			return;
		}
		String name = args.get(0);
		ISiteStore store=(ISiteStore)cl.prop("store");
		List<ISiteDocument> list=null;
		long count=0;
		int limit=10;
		int skip=0;
		if(line.hasOption("limit")){
			limit=Integer.valueOf(line.getOptionValue("limit"));
		}
		if(line.hasOption("skip")){
			skip=Integer.valueOf(line.getOptionValue("skip"));
		}
		if(line.hasOption("para")){
			StringBuffer sb=new StringBuffer();
			ConsoleEditor.readConsole("\t", ConsoleEditor.newReader(), sb);
			String json=sb.toString();
			@SuppressWarnings("unchecked")
			Map<String,String> map=new Gson().fromJson(json, HashMap.class);
			list=store.documents(name, map, limit, skip);
			count=store.documentCount(name,map);
		}else{
			list=store.documents(name, limit, skip);
			count=store.documentCount(name);
		}
		printList(name,count,list);
	}

	private void printList(String path,long count,List<ISiteDocument> list) {
		System.out.println(String.format("\t路径：%s",path));
		System.out.println(String.format("\t文档数：%s",count));
		for(ISiteDocument doc:list){
			System.out.println(String.format("\t--------标识:%s",doc.docid()));
			SimpleDateFormat format=new SimpleDateFormat("yyyy年MM月dd日 hh:mm");
			String time=format.format(new Date(doc.ctime()));
			System.out.println(String.format("\t\t创建时间:%s",time));
			String utime=format.format(new Date(doc.utime()));
			System.out.println(String.format("\t\t更新时间:%s",utime));
			String ltime=format.format(new Date(doc.ltime()));
			System.out.println(String.format("\t\t活动时间:%s",ltime));
			System.out.println(String.format("\t\t创建者:%s",doc.creator()==null?"":doc.creator()));
			System.out.println(String.format("\t\t路径:%s",doc.path()));
			System.out.println(String.format("\t\t平行分类:%s",doc.parallels()));
			System.out.println(String.format("\t\t指标:"));
			Indicator ind=doc.indicator();
			System.out.println(String.format("\t\t\t浏览量:%s",ind.getVisitorsCount()));
			System.out.println(String.format("\t\t\t赞量:%s",ind.getLikesCount()));
			System.out.println(String.format("\t\t\t评论量:%s",ind.getCommentsCount()));
			System.out.println(String.format("\t\t\t分享量:%s",ind.getSharesCount()));
			System.out.println(String.format("\t\t\t关注量:%s",ind.getFollowsCount()));
			System.out.println(String.format("\t\t\t接出量:%s",ind.getConnectsCount()));
			System.out.println(String.format("\t\t\t接入量:%s",ind.getBeconnectsCount()));
			System.out.println(String.format("\t\t数据:%s",doc.document()));
			System.out.println();
		}
	}

	@Override
	public String cmdDesc() {
		return "添加一个文档，文档是json格式，例：lsdoc path -limit 10 -skip 0 -para";
	}

	@Override
	public String cmd() {
		return "lsdoc";
	}

	@Override
	public Options options() {
		Options options = new Options();
		 Option name = new Option("para", "parallels",false, "平行分类集合，将启用编程器输入json对象：{'key1':'value1'}，如果某个平行要按多个值查询，则格式：$['para1','para2']，即：{\"key1\":\"$['para1','para2']\"}");
		 options.addOption(name);
		 Option u = new Option("limit", "limit",true, "分页大小");
		 options.addOption(u);
		 Option p = new Option("skip", "skip",true, "跳过的行数");
		 options.addOption(p);
		return options;
	}
}
