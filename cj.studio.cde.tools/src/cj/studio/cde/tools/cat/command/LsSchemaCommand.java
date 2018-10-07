package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.apache.commons.cli.Options;

import cj.studio.cde.site.CatPrimary;
import cj.studio.cde.site.CatSecondary;
import cj.studio.cde.site.CatSite;
import cj.studio.cde.site.CatTertiary;
import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "lsSchemaCommand")
public class LsSchemaCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	public void doCommand(CmdLine cl) throws IOException {
		ISiteSchema factory = (ISiteSchema) cl.prop("factory");
		factory.refresh();
		List<CatSite> list = factory.list();
		for (CatSite p : list) {
			System.out.println(String.format("--------name：%s", p.getName()));
			System.out.println(String.format("\t\tdisplay：%s", p.getDisplay()));
			System.out.println(String.format("\t\tsort：%s", p.getSort()));
			System.out.println(String.format("\t\ttips：%s", p.getTips()));
			Set<String> set = factory.listPrimaryNames(p.getName());
			for (String key : set) {
				CatPrimary primary = factory.getPrimary(p.getName(), key);
				if (primary == null)
					continue;
				System.out.println(String.format("\t\t--primary：%s", primary.getName()));
				System.out.println(String.format("\t\t\tdisplay：%s", primary.getDisplay()));
				System.out.println(String.format("\t\t\tsort：%s", primary.getSort()));
				Set<String> secset = primary.getSecondaries().keySet();
				for (String seckey : secset) {
					CatSecondary sec = primary.getSecondaries().get(seckey);
					System.out.println(String.format("\t\t\t--secondary：%s", sec.getName()));
					System.out.println(String.format("\t\t\t\tdisplay：%s", sec.getDisplay()));
					System.out.println(String.format("\t\t\t\tpdisplay：%s", sec.getPdisplay()));
					System.out.println(String.format("\t\t\t\tsort：%s", sec.getSort()));
					System.out.println(String.format("\t\t\t\thref：%s", sec.getHref()));
					System.out.println(String.format("\t\t\t\ttips：%s", sec.getTips()));
					Set<String> terset = sec.getTertiaries().keySet();
					for (String terkey : terset) {
						CatTertiary  ter=sec.getTertiaries().get(terkey);
						System.out.println(String.format("\t\t\t\t--tertiary：%s", ter.getName()));
						System.out.println(String.format("\t\t\t\t\tdisplay：%s", ter.getDisplay()));
						System.out.println(String.format("\t\t\t\t\tsort：%s", ter.getSort()));
						System.out.println(String.format("\t\t\t\t\ttips：%s", ter.getTips()));
					}
				}
			}
			System.out.println("------------------------------------------------");
		}
	}

	@Override
	public String cmdDesc() {
		return "列出存储方案下所有分类框架";
	}

	@Override
	public String cmd() {
		return "ls";
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
