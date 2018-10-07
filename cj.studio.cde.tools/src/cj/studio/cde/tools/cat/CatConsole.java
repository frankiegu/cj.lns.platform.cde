package cj.studio.cde.tools.cat;

import java.io.IOException;
import java.util.Map;

import com.mongodb.MongoClient;

import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.site.ISiteStore;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.cde.tools.disk.DiskConsole;
import cj.studio.ecm.annotation.CjService;
@CjService(name="catConsole")
public class CatConsole extends Console {
	ISiteSchema factory;
	ISiteStore store;
	@Override
	protected String prefix(MongoClient client, Object... target) {
		String indent=(String)target[2];
		return DiskConsole.COLOR_CMDPREV + indent+ " >"
				+ DiskConsole.COLOR_CMDLINE;
	}
	@Override
	public void monitor(MongoClient client, Object... target)
			throws IOException {
		factory=(ISiteSchema)target[0];
		store=(ISiteStore)target[1];
		super.monitor(client, target);
	}
	@Override
	protected void beforDoCommand(Command cmd, CmdLine cl) {
		cl.prop("factory",factory);
		cl.prop("store",store);
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
			store.close();
			return true;
		}
		return false;
	}

}
