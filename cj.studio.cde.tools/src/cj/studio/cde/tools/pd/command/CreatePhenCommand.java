package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.Trunk;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
@CjService(name="createPhenCommand")
public class CreatePhenCommand extends Command{

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;
	
	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line=cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定事象的guid"));
			return;
		}
		String guid = args.get(0);
		IPhenomenonFactory factory=(IPhenomenonFactory)cl.prop("factory");
		if(!line.hasOption("c")){
			throw new RuntimeException("缺少参数：-c");
		}
		if(!line.hasOption("cnt")){
			throw new RuntimeException("缺少参数：-cnt");
		}
		Trunk trunk=factory.createPhenomenon(guid,line.getOptionValue("c"), line.getOptionValue("t"), line.getOptionValue("cnt"), line.getOptionValue("desc"));
		System.out.println("\t创建成功,事象标识："+trunk.getTrunkid());
	}
	@Override
	public String cmdDesc() {
		return "创建事象,例：create guid -t 标题1 -c zhaoxb -cnt 这是什么时代 -desc 说明";
	}
	@Override
	public String cmd() {
		return "create";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option name = new Option("t", "title",true, "可选。标题");
		options.addOption(name);
		Option u = new Option("c", "creator",true, "必选。创建者");
		options.addOption(u);
		Option p = new Option("cnt", "content",true, "必选.正文");
		options.addOption(p);
		Option desc = new Option("desc", "content",true, "可选。描述 ");
		options.addOption(desc);
		return options;
	}
}
