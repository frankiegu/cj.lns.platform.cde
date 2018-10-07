package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.site.CatSite;
import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "createSchemaCommand")
public class CreateSchemaCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line=cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定sitename"));
			return;
		}
		String name = args.get(0);
		if(!line.hasOption("dis")){
			throw new RuntimeException("缺少参数：-dis");
		}
		ISiteSchema factory = (ISiteSchema) cl.prop("factory");
		CatSite site=new CatSite();
		site.setDisplay(line.getOptionValue("dis"));
		site.setName(name);
		site.setSort(line.hasOption("sort")?Integer.valueOf(line.getOptionValue("sort")):0);
		site.setTips(line.getOptionValue("tips"));
		factory.create(site);
	}

	@Override
	public String cmdDesc() {
		return "创建一个分类站：create sitename -dis 中国站 -sort 10 -tips 好";
	}

	@Override
	public String cmd() {
		return "create";
	}

	@Override
	public Options options() {
		Options options = new Options();
		 Option name = new Option("dis", "display",true, "分类站点框架显式名");
		 options.addOption(name);
		 Option u = new Option("sort", "sort",true, "排序");
		 options.addOption(u);
		 Option p = new Option("tips", "tips",true, "提示");
		 options.addOption(p);
		return options;
	}
}
