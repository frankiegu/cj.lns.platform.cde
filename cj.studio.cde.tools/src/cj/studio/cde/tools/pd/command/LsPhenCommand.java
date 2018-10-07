package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.Options;

import cj.studio.cde.Branch;
import cj.studio.cde.Entry;
import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.Phenomenon;
import cj.studio.cde.Trunk;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "lsPhenCommand")
public class LsPhenCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;

	public void doCommand(CmdLine cl) throws IOException {
		IPhenomenonFactory factory = (IPhenomenonFactory) cl.prop("factory");
		List<Phenomenon> list = factory.getPhenomenons(Integer.MAX_VALUE, 0);
		for (Phenomenon p : list) {
			Trunk trunk = p.getTrunk();
			if(trunk==null)continue;
			System.out.println(String.format("--------标识：%s", trunk.getTrunkid()));
			System.out.println(String.format("\t\tguid：%s", trunk.getGuid()));
			System.out.println(String.format("\t\t创建者：%s", trunk.getCreator()));
			Branch branch = p.getContentBranch();
			if (branch != null) {
				System.out.println(String.format("\t\t内容分支：%s", branch.getBranchid()));
				Entry entry=p.getContentEntry();
				System.out.println(String.format("\t\t\t项标识：%s", entry.getEntryid()));
				System.out.println(String.format("\t\t\t标题：%s", entry.getName()));
				System.out.println(String.format("\t\t\t正文：%s", entry.getValue()));
			}
			System.out.println("------------------------------------------------");
		}
	}

	@Override
	public String cmdDesc() {

		return "列出存储方案下所有事象";
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
