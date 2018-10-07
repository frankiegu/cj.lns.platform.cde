package cj.studio.cde.tools.pd.command;

import java.io.IOException;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

import cj.studio.cde.Branch;
import cj.studio.cde.BranchType;
import cj.studio.cde.IPhenomenonFactory;
import cj.studio.cde.tools.CmdLine;
import cj.studio.cde.tools.Command;
import cj.studio.cde.tools.Console;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceInvertInjection;
import cj.studio.ecm.annotation.CjServiceRef;
@CjService(name="createBranchCommand")
public class CreateBranchCommand extends Command{

	@CjServiceInvertInjection
	@CjServiceRef(refByName = "pdConsole")
	Console pdConsole;
	
	public void doCommand(CmdLine cl) throws IOException {
		CommandLine line=cl.line();
		IPhenomenonFactory factory=(IPhenomenonFactory)cl.prop("factory");
		
		@SuppressWarnings("unchecked")
		List<String> args = line.getArgList();
		if (args.isEmpty()) {
			System.out.println(String.format("\t错误：未指定分支名"));
			return;
		}
		String name = args.get(0);
		if(name.indexOf("/")>0){
			throw new RuntimeException("分支名不能包含：/号");
		}
		if(!line.hasOption("in")){
			throw new RuntimeException("缺少参数：-in");
		}
		if(!line.hasOption("c")){
			throw new RuntimeException("缺少参数：-c");
		}
		Branch b=new Branch();
		b.setCreator(line.getOptionValue("c"));
		b.setBelong(line.getOptionValue("in"));
		b.setDesc(line.getOptionValue("desc"));
		b.setName(name);
		BranchType bt=line.hasOption("type")?BranchType.valueOf(line.getOptionValue("type")):BranchType.down;
		b.setType(bt);
		String parent=line.hasOption("parent")?line.getOptionValue("parent"):"/";
		if(!"/".equals(parent)){
			if(parent.indexOf("/")<0){
				throw new RuntimeException("指定的父分支不是路径："+parent);
			}
			Branch pb=factory.getBranchByFullPath(line.getOptionValue("in"), parent);
			if(pb==null){
				throw new RuntimeException("指定的父分支不存在："+parent);
			}
			parent=pb.getBranchid();
		}
		b.setParent(parent);
		String bid=factory.addBranch(b);
		System.out.println("\t创建分支成功："+factory.getBranchFullPath(bid));
	}
	@Override
	public String cmdDesc() {
		return "创建分支,例：add branchname -in 事象标识 -c zhaoxb -parent / -type down -desc 说明";
	}
	@Override
	public String cmd() {
		return "add";
	}

	@Override
	public Options options() {
		Options options = new Options();
		Option name = new Option("in", "in",true, "必选。分支所属的事象标识");
		options.addOption(name);
		Option u = new Option("name", "name",true, "必选。分支名");
		options.addOption(u);
		Option c = new Option("c", "creator",true, "必选。创建者");
		options.addOption(c);
		Option parent = new Option("parent", "parent",true, "可选。父分支路径，如果是根分支指定为/号，省略此参数则为根分支");
		options.addOption(parent);
		Option p = new Option("type", "type",true, "可选.分支类型up|down，默认是down");
		options.addOption(p);
		Option desc = new Option("desc", "desc",true, "可选。描述 ");
		options.addOption(desc);
		return options;
	}
}
