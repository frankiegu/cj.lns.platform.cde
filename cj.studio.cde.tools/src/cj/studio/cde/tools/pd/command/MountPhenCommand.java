package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.PhenomenonDisk;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "mountPhenCommand")
public class MountPhenCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;

	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
		IPhenomenonFactory factory = (IPhenomenonFactory) cl.prop("factory");
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定网盘名"));
			return;
		}
		String path = args.get(0);
		String[] arr = path.split("->");
		if (!path.contains("->") || (arr.length != 3&&!arr[0].equals("."))) {
			throw new RuntimeException("格式：网盘名->存储空间->事象标识");
		}
		if (!line.hasOption("in")) {
			throw new RuntimeException("缺少参数：-in");
		}
		IPhenomenonFactory srcFactory=null;
		String srctrunkid="";
		if(".".equals(arr[0])){
			srcFactory=factory;
			srctrunkid=arr[1];
		}else{
			srcFactory = PhenomenonDisk.openDisk(factory.getClient(), arr[0], arr[1]);
			srctrunkid=arr[2];
		}
		long weight = 0;
		if (line.hasOption("w")) {
			weight = Long.valueOf(line.getOptionValue("w"));
		}
		factory.mountPhenomenon(srcFactory,srctrunkid, line.getOptionValue("in"), line.getOptionValue("title"), weight);

	}

	@Override
	public String cmdDesc() {
		return "挂载一个事象到当前事象 mountPhen cj->home->事象标识 -in 当前事象分支标识 -title 项名可不指定 。如果是当前事象则写为.->事象标识";
	}

	@Override
	public String cmd() {
		return "mountPhen";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option u = new Option("in", "inbranch", true, "必选，挂载到的分支标识");
		options.addOption(u);
		Option body = new Option("title", "title", true, "可选，项名");
		options.addOption(body);
		Option w = new Option("w", "weigth", true, "可选，权重");
		options.addOption(w);
		return options;
	}
}
