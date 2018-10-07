package cj.studio.cde.tools.pd.command;

import java.io.IOException;

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

@CjService(name = "mountTextCommand")
public class MountTextCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
		IPhenomenonFactory factory = (IPhenomenonFactory) cl.prop("factory");
		if (!line.hasOption("in")) {
			throw new RuntimeException("缺少参数：-in");
		}
		if (!line.hasOption("c")) {
			throw new RuntimeException("缺少参数：-c");
		}
		if (!line.hasOption("text")) {
			throw new RuntimeException("缺少参数：-text");
		}
		factory.mountText(line.getOptionValue("c"), line.getOptionValue("in"), line.getOptionValue("title"),
				line.getOptionValue("text"));
	}

	@Override
	public String cmdDesc() {
		return "挂载文本项 mountText -c zhaoxb -in 分支标识 -title 中国发射了宇宙飞船 -text 多少人看见，没有不会飞的";
	}

	@Override
	public String cmd() {
		return "mountText";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option name = new Option("c", "creator", true, "必选，创建者");
		options.addOption(name);
		Option u = new Option("in", "inbranch", true, "必选，挂载到的分支标识");
		options.addOption(u);
		Option body = new Option("text", "text", true, "必选，项正文");
		options.addOption(body);
		Option p = new Option("title", "title", true, "可选，项标题");
		options.addOption(p);
		return options;
	}
}
