package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "exportsSchemaCommand")
public class ExportsSchemaCommand2 extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line=cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定文件名"));
			return;
		}
		String name = args.get(0);
		if(!line.hasOption("from")){
			throw new RuntimeException("缺少参数：-from");
		}
		ISiteSchema factory = (ISiteSchema) cl.prop("factory");
		factory.exportsToFile(line.getOptionValue("from"), name);
	}

	@Override
	public String cmdDesc() {
		return "导出分类：export filepath -from sitename";
	}

	@Override
	public String cmd() {
		return "export";
	}

	@Override
	public Options options() {
		Options options = new Options();
		 Option name = new Option("from", "from",true, "分类站点框架名");
		 options.addOption(name);
		// Option u = new Option("u", "user",true, "用户名");
		// options.addOption(u);
		// Option p = new Option("p", "password",true, "密码");
		// options.addOption(p);
		return options;
	}
}
