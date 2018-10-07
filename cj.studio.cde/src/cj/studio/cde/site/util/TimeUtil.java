package cj.studio.cde.site.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public final class TimeUtil {
	public static String friendlyTime(long time){
		long destance=System.currentTimeMillis()-time;
		if(destance<60000){//一分钟以内,显示为秒
			return String.format("%s秒前", destance/1000);
		}
		if(destance<3600000){//一小时以内,显示为分钟
			return String.format("%s分钟前", destance/1000/60);
		}
		if(destance<(24*60*60*1000)){//一天以内,显示为小时
			return String.format("%s小时前", (destance/1000/(60*60)));
		}
		if(destance<(30*24*60*60*1000)){//一月以内,显示为天
			return String.format("%s月前", (destance/1000/(60*60*24)));
		}
		if(destance<(365*24*60*60*1000)){//一年以内,显示为月
			return String.format("%s月前", (destance/1000/(60*60*24*30)));
		}
		//其它显示为真实日期
		return time(time);
	}
	public static String time(long time){
		SimpleDateFormat format=new SimpleDateFormat("yyyy-MM-dd hh:mm");
		return format.format(new Date(time	));
	}
}
