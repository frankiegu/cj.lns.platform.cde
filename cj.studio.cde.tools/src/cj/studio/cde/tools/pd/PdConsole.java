package cj.studio.cde.tools.pd;

import java.io.IOException;
import java.util.Map;

import com.mongodb.MongoClient;

import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.cde.tools.disk.DiskConsole;
import cj.studio.ecm.annotation.CjService;
@CjService(name="pdConsole")
public class PdConsole extends Console {
	IPhenomenonFactory factory;
	@Override
	protected String prefix(MongoClient client, Object... target) {
		String indent=(String)target[1];
		String name=String.format("%s[%s]", factory.getDiskName(),factory.getCubeName());
		return DiskConsole.COLOR_CMDPREV + indent+name+ " >"
				+ DiskConsole.COLOR_CMDLINE;
	}
	@Override
	public void monitor(MongoClient client, Object... target)
			throws IOException {
		factory=(IPhenomenonFactory)target[0];
		super.monitor(client, target);
	}
	@Override
	protected void beforDoCommand(Command cmd, CmdLine cl) {
		cl.prop("factory",factory);
		String indent=String.format("%s%s",cl.prop("indent"),cl.prop("indent"));
		cl.prop("indent",indent);
	}
	@Override
	protected void printMan(MongoClient client, Object[] target,Map<String, Command> cmds) {
		System.out.println(prefix(client, target)+"事象指令集");
		super.printMan(client, target, cmds);
	}

	@Override
	protected boolean exit(String cmd) {
		if("close".equals(cmd)||"bye".equals(cmd)){
			factory.close();
			return true;
		}
		return false;
	}

}
