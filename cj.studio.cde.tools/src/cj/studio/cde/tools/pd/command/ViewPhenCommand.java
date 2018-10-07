package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Options;

import cj.studio.cde.Branch;
import cj.studio.cde.Entry;
import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.Trunk;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "viewPhenCommand")
public class ViewPhenCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定trunkid"));
			return;
		}
		String trunkid = args.get(0);
		IPhenomenonFactory factory = (IPhenomenonFactory) cl.prop("factory");
		Trunk trunk = factory.getTrunk(trunkid);
		if(trunk==null)return;
		System.out.println(String.format("--------标识：%s", trunk.getTrunkid()));
		System.out.println(String.format("\t\t创建者：%s", trunk.getCreator()));
		printBranches(factory,trunk.getTrunkid(),"/","\t");
	}
	

	private void printBranches(IPhenomenonFactory factory, String trunkid,String parent, String indent) {
		List<Branch> branches = factory.getBranches(trunkid, parent, Integer.MAX_VALUE, 0);
		for (Branch b : branches) {
			System.out.println(String.format("%s------分支：%s",indent, factory.getBranchFullPath(b.getBranchid())));
			System.out.println(String.format("%s\t\t分支名：%s", indent,b.getName()));
			System.out.println(String.format("%s\t\t标识：%s", indent,b.getBranchid()));
			System.out.println(String.format("%s\t\t类型：%s", indent,b.getType()));
			System.out.println(String.format("%s\t\t创建者：%s",indent, b.getCreator()));
			System.out.println(String.format("%s\t\t相关度：%s",indent, b.getWeight()));
			System.out.println(String.format("%s\t\t描述：%s", indent,b.getDesc()==null?"":b.getDesc()));
			List<Entry> entries = factory.getEntries(trunkid, b.getBranchid(), Integer.MAX_VALUE, 0);
			for (Entry e : entries) {
				System.out.println(String.format("%s\t\t------项名：%s", indent,e.getName()));
				System.out.println(String.format("%s\t\t\t标识：%s", indent,e.getEntryid()));
				System.out.println(String.format("%s\t\t\t类型：%s", indent,e.getType()));
				System.out.println(String.format("%s\t\t\t正文：%s", indent,e.getValue()));
				System.out.println(String.format("%s\t\t\t创建者：%s",indent, e.getCreator()));
				System.out.println(String.format("%s\t\t\t相关度：%s",indent, e.getWeight()));
			}
			printBranches(factory, trunkid, b.getBranchid(), indent+indent);
		}
	}


	@Override
	public String cmdDesc() {

		return "查看一个事象的所有信息,例：view trunkid";
	}

	@Override
	public String cmd() {
		return "view";
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
