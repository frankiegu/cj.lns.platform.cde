package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Options;

import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
@CjService(name="removeBranchCommand")
public class RemoveBranchCommand extends Command{

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;
	
	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line=cl.line();
		IPhenomenonFactory factory=(IPhenomenonFactory)cl.prop("factory");
		
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定分支名"));
			return;
		}
		String name = args.get(0);
		
		factory.removeBranch(name);
	}
	@Override
	public String cmdDesc() {
		return "移除分支,例：removeBranch branchid";
	}
	@Override
	public String cmd() {
		return "removeBranch";
	}

	@Override
	public Options options() {
		Options options = new Options();
//		Option name = new Option("in", "in",true, "必选。分支所属的事象标识");
//		options.addOption(name);
		return options;
	}
}
