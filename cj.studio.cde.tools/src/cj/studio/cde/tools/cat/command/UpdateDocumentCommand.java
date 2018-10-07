package cj.studio.cde.tools.cat.command;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import org.apache.commons.cli.CommandLine;
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

@CjService(name = "updateDocumentCommand")
public class UpdateDocumentCommand extends Command {

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "catConsole")
	Console catConsole;

	@SuppressWarnings("unchecked")
	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line = cl.line();
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定docid"));
			return;
		}
		String name = args.get(0);
		ISiteStore store = (ISiteStore) cl.prop("store");

		System.out.println("输入数据：");
		StringBuffer sb2 = new StringBuffer();
		ConsoleEditor.readConsole("\t", ConsoleEditor.newReader(), sb2);
		String json2 = sb2.toString();
		if (StringUtil.isEmpty(json2)) {
			return;
		}
		HashMap<?, ?> map = new Gson().fromJson(json2, HashMap.class);
		store.updateDocument(name, map);
	}

	@Override
	public String cmdDesc() {
		return "更新一个文档，文档是json格式，例：updatedoc docid";
	}

	@Override
	public String cmd() {
		return "updatedoc";
	}

	@Override
	public Options options() {
		Options options = new Options();
//		Option name = new Option("p", "path", true, "地址。site://cat1/cat2/cat3");
//		options.addOption(name);
//		Option c = new Option("c", "creator", true, "创建者");
//		options.addOption(c);
//		Option u = new Option("para", "parallels", false, "平行分类");
//		options.addOption(u);
		// Option p = new Option("tips", "tips",true, "提示");
		// options.addOption(p);
		return options;
	}
}
