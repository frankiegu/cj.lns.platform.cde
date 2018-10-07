package cj.studio.cde.tools.disk;

import java.io.IOException;
import java.util.Map;

import com.mongodb.MongoClient;

import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;

@CjService(name = "diskConsole")
public class DiskConsole extends Console  {
	public static final String COLOR_SURFACE = "\033[0;30m";
	public static final String COLOR_RESPONSE = "\033[0;34m";
	public static final String COLOR_CMDLINE = "\033[0;32m";
	public static final String COLOR_CMDPREV = "\033[0;31m";
	@Override
	protected String prefix(MongoClient client, Object... target) {
		return DiskConsole.COLOR_CMDPREV + client.getAddress().getHost()
				+ ":" + client.getAddress().getPort() + " >"
				+ DiskConsole.COLOR_CMDLINE;
	}
	@Override
	public void monitor(MongoClient client, Object... target)
			throws IOException {
		System.out.println("——————————————使用说明——————————————");
		System.out.println("       如不记得命令，可用man命令查询");
		System.out.println("__________________________________");
		System.out.println();
		super.monitor(client, target);
	}
	@Override
	protected void printMan(MongoClient client, Object[] target,Map<String, Command> cmds) {
		System.out.println("usf 统一存储系统指令集");
		super.printMan(client,target,cmds);
	}
	@Override
	protected boolean exit(String cmd) {
		if ("exit".equals(cmd) || "bye".equals(cmd) || "quit".equals(cmd)
				|| "close".equals(cmd)) {
			return true;
		}
		return false;
	}

}
