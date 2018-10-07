package cj.studio.cde.tools.disk.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import com.mongodb.MongoClient;

import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.PhenomenonDisk;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "OpenDiskCommand")
public class OpenPdCommand extends Command {
	@CjServiceInvertInjection
	@CjServiceRef(refByName = "diskConsole")
	Console diskconsole;
	@CjServiceRef(refByName = "pdConsole")
	Console pdconsole;

	public void doCommand(CmdLine cl) throws IOException {
		MongoClient client = (MongoClient) cl.prop("client");
		CommandLine line = cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		String indent = (String) cl.prop("indent");
		if (args.isEmpty()) {
			System.out.println(String.format("%s错误：未指定网盘名", indent));
			return;
		}
		String diskname = args.get(0);
		if (!line.hasOption("cube")) {
			System.out.println(String.format("%s缺少参数：-cube ", indent));
			return;
		}
		
		IPhenomenonFactory factory=PhenomenonDisk.openDisk(client,diskname, line.getOptionValue("cube"));
		
		pdconsole.monitor(client, factory, cl.prop("indent"));
	}

	@Override
	public String cmd() {
		return "open";
	}

	@Override
	public String cmdDesc() {
		return "打开事象的存储空间，例：open 网盘名 -cube 存储方案名";
	}

	@Override
	public Options options() {
		Options options = new Options();
		// Option name = new Option("n", "name",true, "网盘名");
		// options.addOption(name);
//		Option u = new Option("dname", "diskname", true, "网盘名");
//		options.addOption(u);
		Option p = new Option("cube", "cube", true, "存储方案名");
		options.addOption(p);
		return options;
	}
}
