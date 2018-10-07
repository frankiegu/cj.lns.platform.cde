package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.site.ISiteStore;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.cde.tools.ConsoleEditor;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.ultimate.gson2.com.google.gson.Gson;
import cj.ultimate.util.StringUtil;

@CjService(name = "addDocumentCommand")
public class AddDocumentCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	@SuppressWarnings("unchecked")
	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定path"));
			return;
		}
		String name = args.get(0);
		ISiteStore store = (ISiteStore) cl.prop("store");

		Map<String, String> paras=null;
		if (line.hasOption("para")) {
			System.out.println("输入平行分类：");
			StringBuffer sb = new StringBuffer();
			ConsoleEditor.readConsole("\t", ConsoleEditor.newReader(), sb);
			String json = sb.toString();
			if (!StringUtil.isEmpty(json)) {
				paras= new Gson().fromJson(json, HashMap.class);
			}
		}
		System.out.println("输入数据：");
		StringBuffer sb2 = new StringBuffer();
		ConsoleEditor.readConsole("\t", ConsoleEditor.newReader(), sb2);
		String json2 = sb2.toString();
		if (StringUtil.isEmpty(json2)) {
			return;
		}
		HashMap<?, ?> map = new Gson().fromJson(json2, HashMap.class);
		long weight=0;
		if(line.hasOption("w")){
			weight=Long.valueOf(line.getOptionValue("w"));
		}
		store.addDocument(name,line.getOptionValue("c"),weight,  paras, map);

	}

	@Override
	public String cmdDesc() {
		return "添加一个文档，文档是json格式，例：adddoc path -c zhaoxb -para";
	}

	@Override
	public String cmd() {
		return "adddoc";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option name = new Option("c", "creator", true, "创建者");
		options.addOption(name);
		Option u = new Option("para", "parallels", false, "添加平行分类");
		options.addOption(u);
		Option w = new Option("w", "weight", false, "设置初始权重");
		options.addOption(w);
		// Option p = new Option("tips", "tips",true, "提示");
		// options.addOption(p);
		return options;
	}
}
