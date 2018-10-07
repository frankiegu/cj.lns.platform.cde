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

@CjService(name = "removeDocumentCommand")
public class RemoveDocumentCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	@SuppressWarnings("unchecked")
	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
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
		
		store.removeDocuments(name, paras);
		
	}

	@Override
	public String cmdDesc() {
		return "移除符合条件的文档，例：removedoc path -para";
	}

	@Override
	public String cmd() {
		return "removedoc";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option u = new Option("para", "parallels", false, "平行分类");
		options.addOption(u);
		// Option p = new Option("tips", "tips",true, "提示");
		// options.addOption(p);
		return options;
	}
}
