package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Options;

import cj.studio.cde.site.CatParallel;
import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "lsParaCommand")
public class LsParaCommand extends Command {

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
		ISiteSchema factory = (ISiteSchema) cl.prop("factory");
		List<CatParallel> list=factory.getParallels(name);
		System.out.println("--path:"+name);
		for(CatParallel p:list){
			System.out.println(String.format("\tname：%s", p.getName()));
			System.out.println(String.format("\t\tdisplay：%s", p.getDisplay()));
			System.out.println(String.format("\t\tsort：%s", p.getSort()));
			System.out.println(String.format("\t\ttips：%s", p.getTips()));
			System.out.println(String.format("\t\tmap："));
			Set<String> set=p.getMap().keySet();
			for(String key:set){
				System.out.println(String.format("\t\t\t%s=%s", key,p.getMap().get(key)));
			}
		}
	}

	@Override
	public String cmdDesc() {
		return "列出平行分类 lspara path,如：lspara c2csite://cat1/cat2/cat3";
	}

	@Override
	public String cmd() {
		return "lspara";
	}

	@Override
	public Options options() {
		Options options = new Options();
		// Option name = new Option("n", "name",true, "网盘名");
		// options.addOption(name);
		// Option u = new Option("u", "user",true, "用户名");
		// options.addOption(u);
		// Option p = new Option("p", "password",true, "密码");
		// options.addOption(p);
		return options;
	}
}
