package cj.studio.cde.tools.disk.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.Options;

import com.mongodb.MongoClient;

import cj.lns.chip.sos.disk.INetDisk;
import cj.lns.chip.sos.disk.NetDisk;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
@CjService(name="lsDiskCommand")
public class LsDiskCommand extends Command{

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "diskConsole")
	Console diskConsole;
	
	public void doCommand(CmdLine cl) throws IOException {
		MongoClient client = (MongoClient) cl.prop("client");
		List<String> disks=NetDisk.enumDisk(client);
		for(String name:disks){
			System.out.println(String.format("%s%s", cl.prop("indent"),name));
			INetDisk disk=NetDisk.trustOpen(client, name);
			List<String> cubes=disk.enumCube();
			System.out.println(String.format("%s%shome", cl.prop("indent"),cl.prop("indent")));
			for(String cube:cubes){
				System.out.println(String.format("%s%s%s", cl.prop("indent"),cl.prop("indent"),cube));
			}
		}
	}
	@Override
	public String cmdDesc() {
		// TODO Auto-generated method stub
		return "列出网盘及其下的存储方案";
	}
	@Override
	public String cmd() {
		return "ls";
	}

	@Override
	public Options options() {
		Options options = new Options();
//		Option name = new Option("n", "name",true, "网盘名");
//		options.addOption(name);
//		Option u = new Option("u", "user",true, "用户名");
//		options.addOption(u);
//		Option p = new Option("p", "password",true, "密码");
//		options.addOption(p);
		return options;
	}
}
