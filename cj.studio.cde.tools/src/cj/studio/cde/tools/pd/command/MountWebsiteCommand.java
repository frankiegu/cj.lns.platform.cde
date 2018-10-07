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

@CjService(name = "mountWebsiteCommand")
public class MountWebsiteCommand extends Command {

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
		if (!line.hasOption("href")) {
			throw new RuntimeException("缺少参数：-href");
		}
		if (!line.hasOption("desc")) {
			throw new RuntimeException("缺少参数：-desc");
		}
		factory.mountWebsite(line.getOptionValue("c"), line.getOptionValue("in"),line.getOptionValue("href"), line.getOptionValue("title"),
				line.getOptionValue("desc"));
	}

	@Override
	public String cmdDesc() {
		return "挂载一个网站 mountWebsite -c zhaoxb -in 分支标识 -href http://news.163.com -title 中国发射了宇宙飞船 -desc 多少人看见，没有不会飞的";
	}

	@Override
	public String cmd() {
		return "mountWebsite";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option name = new Option("c", "creator", true, "必选，创建者");
		options.addOption(name);
		Option u = new Option("in", "inbranch", true, "必选，挂载到的分支标识");
		options.addOption(u);
		Option href = new Option("href", "href", true, "必选，网址");
		options.addOption(href);
		Option body = new Option("desc", "desc", true, "必选，网站摘要文本");
		options.addOption(body);
		Option p = new Option("title", "title", true, "必选，网站标题");
		options.addOption(p);
		return options;
	}
}
