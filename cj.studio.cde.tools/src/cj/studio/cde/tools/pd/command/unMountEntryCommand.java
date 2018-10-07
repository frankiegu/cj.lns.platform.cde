package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "unmountEntryCommand")
public class unMountEntryCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
		IPhenomenonFactory factory = (IPhenomenonFactory) cl.prop("factory");
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定项的标识"));
			return;
		}
		String entryid = args.get(0);
		factory.unmountEntry(entryid);
	}

	@Override
	public String cmdDesc() {
		return "卸载项。例: unmountEntry entryid";
	}

	@Override
	public String cmd() {
		return "unmountEntry";
	}

	@Override
	public Options options() {
		Options options = new Options();
//		Option name = new Option("c", "creator", true, "必选，创建者");
//		options.addOption(name);
//		Option u = new Option("in", "inbranch", true, "必选，挂载到的分支标识");
//		options.addOption(u);
//		Option body = new Option("text", "text", true, "必选，项正文");
//		options.addOption(body);
//		Option p = new Option("title", "title", true, "可选，项标题");
//		options.addOption(p);
		return options;
	}
}
