package cj.studio.cde.tools.pd.command;

import java.io.IOException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.lns.chip.sos.cube.framework.FileInfo;
import cj.lns.chip.sos.cube.framework.IWriter;
import cj.lns.chip.sos.cube.framework.lock.FileLockException;
import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.cde.tools.ConsoleEditor;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
import cj.ultimate.util.StringUtil;

@CjService(name = "mountFileCommand")
public class MountFileCommand extends Command {

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
		if (!line.hasOption("fn")) {
			throw new RuntimeException("缺少参数：-fn");
		}
		FileInfo file = factory.mountFile(line.getOptionValue("c"), line.getOptionValue("in"),
				line.getOptionValue("fn"));
		StringBuffer sb = new StringBuffer();
		ConsoleEditor.readConsole("\t", ConsoleEditor.newReader(), sb);
		String text = sb.toString();
		if (StringUtil.isEmpty(text)) {
			return;
		}
		try {
			IWriter w = file.writer(0);
			w.write(text.getBytes());
			w.close();
		} catch (FileLockException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public String cmdDesc() {
		return "挂载文件 mountFile -c zhaoxb -in 分支标识 -fn /test/1.txt";
	}

	@Override
	public String cmd() {
		return "mountFile";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option name = new Option("c", "creator", true, "必选，创建者");
		options.addOption(name);
		Option u = new Option("in", "inbranch", true, "必选，挂载到的分支标识");
		options.addOption(u);
		Option body = new Option("fn", "fileName", true, "必选，相对于存储方案根目录的文件全路径");
		options.addOption(body);
		return options;
	}
}
