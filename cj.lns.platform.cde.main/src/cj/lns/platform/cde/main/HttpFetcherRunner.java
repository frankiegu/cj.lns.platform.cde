package cj.lns.platform.cde.main;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.GnuParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

import cj.studio.ecm.Assembly;
import cj.studio.ecm.IAssembly;
import cj.studio.ecm.adapter.IActuator;
import cj.studio.ecm.adapter.IAdaptable;
/**
 * 用于eclipse调试神经元的程序，用法：<br>
 * 右键调试该类，将自动生成eclipse的Application，而后在：
 * 右键菜单->debug as->debugger configration->Arguments->Program Arguments的文本框中输入：
 * -debug /Users/carocean/studio/examples/network/neuron-1.0
 * -debug用于指明神经元所在的位置
 * 
 * @author carocean
 *
 */
public class HttpFetcherRunner {
	private static String fileName;

	// java -jar cjnet -h 127.0.0.1:10000 -t udt -debug cmdassembly.jar
	public static void main(String... args) throws IOException, ParseException {
		fileName = "cj.lns.chip.sns.neuron-1.0";
		Options options = new Options();
//		Option h = new Option("h", "host",true, "必须指定远程地址，格式：-h ip:port，port可以省去");
//		options.addOption(h);
//		Option  l = new Option("l","log", false, "充许网络日志输出到控制台");
//		options.addOption(l);
		Option  m = new Option("m","man", false, "帮助");
		options.addOption(m);
		Option debug = new Option("d","debug", true, "调试命令行程序集时使用，需指定以下jar包所在目录\r\n"+fileName);
		options.addOption(debug);
		
		
//		GnuParser
//		BasicParser
//		PosixParser
		GnuParser parser = new GnuParser();
		CommandLine line = parser.parse(options, args);
		if(line.hasOption("m")){
			HelpFormatter formatter = new HelpFormatter();
			formatter.printHelp( "Neuron", options );
			return;
		}
		//取属性的方式line.getOptionProperties("T").get("boss")
//		System.out.println(line.getOptionProperties("T").get("boss"));
		
		String usr = System.getProperty("user.dir");
		File f = new File(usr);
		File[] arr = f.listFiles(new FilenameFilter() {

			@Override
			public boolean accept(File dir, String name) {
				if (name.startsWith(fileName)) {
					return true;
				}
				return false;
			}
		});
		if (arr.length < 1 && !line.hasOption("debug")){
			throw new IOException(fileName+" 程序集不存在.");
		}
		if (line.hasOption("debug")) {
			File[] da = new File(line.getOptionValue("debug")).listFiles(new FilenameFilter() {

				@Override
				public boolean accept(File dir, String name) {
					if (name.startsWith(fileName)) {
						return true;
					}
					return false;
				}
			});
			if(da.length<0)
				throw new IOException("调试时不存在指定的必要jar包"+fileName);
			f =da[0];
		} else {
			f = arr[0];
		}

		IAssembly assembly = Assembly.loadAssembly(f.toString());
		assembly.start();
		Object main = assembly.workbin().part("neuronEntryPoint");
		IAdaptable a = (IAdaptable) main;
		IActuator act = a.getAdapter(IActuator.class);
		act.exactCommand("setHomeDir", new Class<?>[]{String.class}, f.getParent());
		act.exactCommand("setMain", new Class<?>[]{IAssembly.class}, assembly);
		act.exeCommand("main", line);
	}
}
